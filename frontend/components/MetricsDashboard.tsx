'use client';

import React from 'react';
import { useMarketWebSocket } from '@/hooks/useMarketWebSocket';
import { Activity, ArrowUpRight, ArrowDownRight, ShieldCheck, Zap } from 'lucide-react';

export default function MetricsDashboard() {
  const { data, isConnected } = useMarketWebSocket();

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Header Status Bar */}
      <div className="flex items-center justify-between border-b border-midnight-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Zap className="w-6 h-6 text-ghost-cyan animate-pulse" />
            Ghost Order Book Engine
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            AVX-512 Vector Kernel &bull; Midnight Zero-Knowledge Private Liquidity
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-midnight-850 border border-midnight-border">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-ghost-green animate-ping' : 'bg-ghost-red'
              }`}
            />
            <span
              className={`font-mono ${
                isConnected ? 'text-ghost-green' : 'text-ghost-red'
              }`}
            >
              {isConnected ? 'LIVE 100Hz SIMD FEED' : 'DISCONNECTED'}
            </span>
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Weighted Mid Price */}
        <div className="bg-midnight-900 border border-midnight-border rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Weighted Mid Price</span>
            <Activity className="w-4 h-4 text-ghost-cyan" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-mono font-bold text-white">
              ${data ? data.weighted_mid_price.toFixed(2) : '---.--'}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              Calculated via 512-bit FMA SIMD
            </div>
          </div>
        </div>

        {/* Bid-Ask Spread */}
        <div className="bg-midnight-900 border border-midnight-border rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Bid-Ask Spread</span>
            <span className="text-xs font-mono text-ghost-cyan">BBO</span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-mono font-bold text-ghost-amber">
              ${data ? data.bid_ask_spread.toFixed(4) : '-.----'}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              Tightest Execution Band
            </div>
          </div>
        </div>

        {/* Order Book Imbalance */}
        <div className="bg-midnight-900 border border-midnight-border rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Order Imbalance</span>
            {data && data.total_imbalance >= 0 ? (
              <ArrowUpRight className="w-4 h-4 text-ghost-green" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-ghost-red" />
            )}
          </div>
          <div className="mt-3">
            <div
              className={`text-2xl font-mono font-bold ${
                data && data.total_imbalance >= 0
                  ? 'text-ghost-green'
                  : 'text-ghost-red'
              }`}
            >
              {data ? (data.total_imbalance * 100).toFixed(2) + '%' : '0.00%'}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              {data && data.total_imbalance >= 0 ? 'Bid Side Heavy' : 'Ask Side Heavy'}
            </div>
          </div>
        </div>

        {/* Expected Slippage */}
        <div className="bg-midnight-900 border border-midnight-border rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Expected Slippage</span>
            <ShieldCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-mono font-bold text-purple-300">
              {data ? (data.expected_slippage * 100).toFixed(4) + '%' : '0.0000%'}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              ZK Anti-Frontrunning Guard
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}