use axum::{
    extract::ws::{Message, WebSocket, WebSocketUpgrade},
    routing::get,
    Router,
};
use serde::Serialize;
use std::{net::SocketAddr, sync::Arc, time::Duration};
use tokio::sync::broadcast;
use tracing::{info, Level};
use tracing_subscriber::FmtSubscriber;

#[derive(Debug, Clone, Serialize)]
pub struct MarketMetricsPayload {
    pub weighted_mid_price: f64,
    pub bid_ask_spread: f64,
    pub total_imbalance: f64,
    pub expected_slippage: f64,
    pub timestamp_ms: u64,
}

#[tokio::main]
async fn main() {
    // Initialize tracing subscriber for telemetry logging
    let subscriber = FmtSubscriber::builder()
        .with_max_level(Level::INFO)
        .finish();
    tracing::subscriber::set_global_default(subscriber)
        .expect("Failed to set global tracing subscriber");

    // Broadcast channel for high-frequency metric streaming to active WS clients
    let (tx, _rx) = broadcast::channel::<MarketMetricsPayload>(100);
    let tx_clone = tx.clone();

    // Spawn high-frequency SIMD engine simulation loop (~100Hz tick stream)
    tokio::spawn(async move {
        let mut mid_price = 100.0;
        let mut angle = 0.0f64;

        loop {
            tokio::time::sleep(Duration::from_millis(10)).await; // 10ms = 100Hz tick rate

            angle += 0.05;
            mid_price += (angle.sin() * 0.15) + ((pseudo_rand() - 0.5) * 0.05);
            let total_imbalance = (angle * 0.7).cos();
            let bid_ask_spread = 0.02 + (angle.sin().abs() * 0.01);
            let expected_slippage = 0.0005 + (total_imbalance.abs() * 0.001);

            let payload = MarketMetricsPayload {
                weighted_mid_price: (mid_price * 100.0).round() / 100.0,
                bid_ask_spread: (bid_ask_spread * 10000.0).round() / 10000.0,
                total_imbalance: (total_imbalance * 10000.0).round() / 10000.0,
                expected_slippage: (expected_slippage * 100000.0).round() / 100000.0,
                timestamp_ms: std::time::SystemTime::now()
                    .duration_since(std::time::UNIX_EPOCH)
                    .unwrap_or_default()
                    .as_millis() as u64,
            };

            let _ = tx_clone.send(payload);
        }
    });

    let app_state = Arc::new(tx);

    let app = Router::new()
        .route("/health", get(|| async { "OK" }))
        .route(
            "/ws",
            get(move |ws: WebSocketUpgrade| {
                let tx = app_state.clone();
                async move { ws.on_upgrade(move |socket| handle_websocket(socket, tx)) }
            }),
        );

    let addr = SocketAddr::from(([0, 0, 0, 0], 8080));
    info!("Axum HFT Engine running on http://{}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn handle_websocket(mut socket: WebSocket, tx: Arc<broadcast::Sender<MarketMetricsPayload>>) {
    let mut rx = tx.subscribe();

    while let Ok(metrics) = rx.recv().await {
        if let Ok(json) = serde_json::to_string(&metrics) {
            if socket.send(Message::Text(json)).await.is_err() {
                // Client disconnected
                break;
            }
        }
    }
}

// Pseudo-random generator for simulation feed
fn pseudo_rand() -> f64 {
    use std::cell::Cell;
    thread_local! {
        static SEED: Cell<u64> = const { Cell::new(0x853c_49e6_748f_ea9b) };
    }
    SEED.with(|seed| {
        let mut x = seed.get();
        x ^= x << 13;
        x ^= x >> 7;
        x ^= x << 17;
        seed.set(x);
        (x as f64) / (u64::MAX as f64)
    })
}