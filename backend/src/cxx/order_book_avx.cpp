#include "order_book_avx.h"
#include <immintrin.h>
#include <cmath>
#include <algorithm>

extern "C" {

void compute_vwap_and_imbalance_avx512(
    const OrderBookChunk* chunk,
    size_t level_count,
    CalculatedMetrics* out_metrics
) {
    if (!chunk || !out_metrics || level_count == 0) {
        return;
    }

    // Clamp level count to maximum vector capacity (64 levels = 4 x 512-bit registers)
    const size_t levels = std::min(level_count, static_cast<size_t>(64));
    const size_t vec_loops = (levels + 15) / 16; // 16 float32 elements per AVX-512 register

    __m512 v_bid_price_qty_sum = _mm512_setzero_ps();
    __m512 v_bid_qty_sum       = _mm512_setzero_ps();
    __m512 v_ask_price_qty_sum = _mm512_setzero_ps();
    __m512 v_ask_qty_sum       = _mm512_setzero_ps();

    for (size_t i = 0; i < vec_loops; ++i) {
        size_t offset = i * 16;

        // Mask for handling tail elements when level_count is not a multiple of 16
        __mmask16 mask = (levels - offset >= 16) 
            ? 0xFFFF 
            : (1 << (levels - offset)) - 1;

        // Load 16 float32 levels using 64-byte aligned vector loads
        __m512 v_bids_price = _mm512_maskz_load_ps(mask, chunk->bids_price + offset);
        __m512 v_bids_qty   = _mm512_maskz_load_ps(mask, chunk->bids_qty + offset);
        __m512 v_asks_price = _mm512_maskz_load_ps(mask, chunk->asks_price + offset);
        __m512 v_asks_qty   = _mm512_maskz_load_ps(mask, chunk->asks_qty + offset);

        // Vectorized Fused Multiply-Add: accumulator += price * quantity
        v_bid_price_qty_sum = _mm512_fmadd_ps(v_bids_price, v_bids_qty, v_bid_price_qty_sum);
        v_bid_qty_sum       = _mm512_add_ps(v_bids_qty, v_bid_qty_sum);

        v_ask_price_qty_sum = _mm512_fmadd_ps(v_asks_price, v_asks_qty, v_ask_price_qty_sum);
        v_ask_qty_sum       = _mm512_add_ps(v_asks_qty, v_ask_qty_sum);
    }

    // Horizontal reduction of 512-bit SIMD registers into scalar accumulators
    float total_bid_pq  = _mm512_reduce_add_ps(v_bid_price_qty_sum);
    float total_bid_qty = _mm512_reduce_add_ps(v_bid_qty_sum);
    float total_ask_pq  = _mm512_reduce_add_ps(v_ask_price_qty_sum);
    float total_ask_qty = _mm512_reduce_add_ps(v_ask_qty_sum);

    // Calculate Volume-Weighted Average Price (VWAP)
    double bid_vwap = (total_bid_qty > 0.0f) ? (total_bid_pq / total_bid_qty) : chunk->bids_price[0];
    double ask_vwap = (total_ask_qty > 0.0f) ? (total_ask_pq / total_ask_qty) : chunk->asks_price[0];

    // Compute metrics
    double best_bid = chunk->bids_price[0];
    double best_ask = chunk->asks_price[0];
    
    out_metrics->weighted_mid_price = (bid_vwap + ask_vwap) * 0.5;
    out_metrics->bid_ask_spread     = std::abs(best_ask - best_bid);

    // Order Book Imbalance ratio: [-1.0 (Ask Heavy) to +1.0 (Bid Heavy)]
    double total_qty = total_bid_qty + total_ask_qty;
    out_metrics->total_imbalance = (total_qty > 0.0) 
        ? ((total_bid_qty - total_ask_qty) / total_qty) 
        : 0.0;

    // Expected market impact slippage estimate
    out_metrics->expected_slippage = (out_metrics->weighted_mid_price > 0.0)
        ? (out_metrics->bid_ask_spread / out_metrics->weighted_mid_price) * (1.0 + std::abs(out_metrics->total_imbalance))
        : 0.0;
}

} // extern "C"