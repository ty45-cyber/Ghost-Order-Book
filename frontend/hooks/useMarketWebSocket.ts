import { useEffect, useState, useRef, useCallback } from 'react';

export interface MarketMetricsPayload {
  weighted_mid_price: number;
  bid_ask_spread: number;
  total_imbalance: number;
  expected_slippage: number;
  timestamp_ms: number;
}

export function useMarketWebSocket(
  url: string = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/ws'
) {
  const [data, setData] = useState<MarketMetricsPayload | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(url);

      ws.onopen = () => {
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const parsed: MarketMetricsPayload = JSON.parse(event.data);
          setData(parsed);
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        // Automatically attempt reconnection after 2 seconds
        setTimeout(connect, 2000);
      };

      ws.onerror = (err) => {
        console.error('WebSocket encountered an error:', err);
        ws.close();
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('Failed to instantiate WebSocket:', err);
      setTimeout(connect, 2000);
    }
  }, [url]);

  useEffect(() => {
    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return { data, isConnected };
}