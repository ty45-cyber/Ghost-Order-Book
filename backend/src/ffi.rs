#[repr(C, align(64))]
#[derive(Debug, Clone, Copy)]
pub struct OrderBookChunk {
    pub bids_price: [f32; 64],
    pub bids_qty: [f32; 64],
    pub asks_price: [f32; 64],
    pub asks_qty: [f32; 64],
}

impl Default for OrderBookChunk {
    fn default() -> Self {
        Self {
            bids_price: [0.0; 64],
            bids_qty: [0.0; 64],
            asks_price: [0.0; 64],
            asks_qty: [0.0; 64],
        }
    }
}

#[repr(C, align(64))]
#[derive(Debug, Default, Clone, Copy)]
pub struct CalculatedMetrics {
    pub weighted_mid_price: f64,
    pub bid_ask_spread: f64,
    pub total_imbalance: f64,
    pub expected_slippage: f64,
}

extern "C" {
    pub fn compute_vwap_and_imbalance_avx512(
        chunk: *const OrderBookChunk,
        level_count: usize,
        out_metrics: *mut CalculatedMetrics,
    );
}

/// Safe Rust wrapper around the C++ AVX-512 order book kernel.
pub fn calculate_metrics_avx512(chunk: &OrderBookChunk, level_count: usize) -> CalculatedMetrics {
    let mut metrics = CalculatedMetrics::default();
    unsafe {
        compute_vwap_and_imbalance_avx512(chunk, level_count, &mut metrics);
    }
    metrics
}