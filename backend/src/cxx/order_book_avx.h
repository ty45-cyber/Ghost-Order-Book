#ifndef ORDER_BOOK_AVX_H
#define ORDER_BOOK_AVX_H

#include <cstdint>
#include <cstddef>

#ifdef __cplusplus
extern "C" {
#endif

// 64-byte aligned Struct-of-Arrays (SoA) for optimal AVX-512 cache-line loading
struct alignas(64) OrderBookChunk {
    float bids_price[64];
    float bids_qty[64];
    float asks_price[64];
    float asks_qty[64];
};

struct alignas(64) CalculatedMetrics {
    double weighted_mid_price;
    double bid_ask_spread;
    double total_imbalance;
    double expected_slippage;
};

/**
 * Computes high-frequency VWAP, bid-ask spread, order book imbalance, and slippage
 * using AVX-512 fused multiply-add (FMA) and reduction intrinsics.
 */
void compute_vwap_and_imbalance_avx512(
    const OrderBookChunk* chunk,
    size_t level_count,
    CalculatedMetrics* out_metrics
);

#ifdef __cplusplus
}
#endif

#endif // ORDER_BOOK_AVX_H