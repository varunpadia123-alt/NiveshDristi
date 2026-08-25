"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Gauge, 
  ShieldCheck, 
  AlertTriangle,
  Layers,
  BarChart2
} from "lucide-react";
import { TechnicalMetrics } from "@/types";
import { fetchTechnicalMetrics } from "@/lib/api";

interface TechnicalDrawerProps {
  ticker: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TechnicalDrawer: React.FC<TechnicalDrawerProps> = ({
  ticker,
  isOpen,
  onClose
}) => {
  const [metrics, setMetrics] = useState<TechnicalMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && ticker) {
      setLoading(true);
      setError(null);
      fetchTechnicalMetrics(ticker)
        .then((data) => {
          setMetrics(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setError("Failed to fetch technical indicators for this asset.");
          setLoading(false);
        });
    }
  }, [isOpen, ticker]);

  if (!isOpen || !ticker) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm">
      <div className="w-full max-w-xl h-full glass-card bg-slate-950 border-l border-white/10 p-6 sm:p-8 overflow-y-auto shadow-2xl flex flex-col justify-between">
        
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-bold text-white tracking-tight">{ticker}</h2>
                  {metrics && (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wider uppercase ${
                      metrics.badge === "HOLD" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" :
                      metrics.badge === "SELL" ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" :
                      "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}>
                      {metrics.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">130+ pandas-ta Indicators & Composite Engine</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {loading ? (
            <div className="py-24 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 rounded-full border-3 border-teal-400 border-t-transparent animate-spin"></div>
              <p className="text-xs">Computing technical indicators, moving averages, and sentiment...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              {error}
            </div>
          ) : metrics ? (
            <div className="space-y-6">

              {/* Price & Composite Score Banner */}
              <div className="p-4 rounded-2xl glass-card border border-white/10 bg-slate-900/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Current Spot Price</span>
                  <div className="text-2xl font-black text-white">₹{metrics.current_price.toFixed(2)}</div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Composite Score</span>
                  <div className={`text-2xl font-black font-mono ${
                    metrics.composite_score >= 1.5 ? "text-emerald-400" :
                    metrics.composite_score <= -1.5 ? "text-rose-400" : "text-amber-400"
                  }`}>
                    {metrics.composite_score > 0 ? `+${metrics.composite_score.toFixed(2)}` : metrics.composite_score.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Score Sub-Components */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-900 border border-white/5 text-center">
                  <div className="text-[10px] text-slate-400 font-semibold mb-1">Momentum (35%)</div>
                  <div className={`font-mono font-bold text-sm ${metrics.momentum_score >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {metrics.momentum_score > 0 ? `+${metrics.momentum_score}` : metrics.momentum_score}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-white/5 text-center">
                  <div className="text-[10px] text-slate-400 font-semibold mb-1">Trend (35%)</div>
                  <div className={`font-mono font-bold text-sm ${metrics.trend_score >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {metrics.trend_score > 0 ? `+${metrics.trend_score}` : metrics.trend_score}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-white/5 text-center">
                  <div className="text-[10px] text-slate-400 font-semibold mb-1">Volume/Risk (30%)</div>
                  <div className={`font-mono font-bold text-sm ${metrics.volume_score >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {metrics.volume_score > 0 ? `+${metrics.volume_score}` : metrics.volume_score}
                  </div>
                </div>
              </div>

              {/* Badge Reason Alert */}
              <div className="p-4 rounded-2xl glass-card border border-white/10 bg-slate-900/30 text-xs text-slate-300">
                <div className="font-bold text-white mb-1 flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-teal-400" />
                  Signal Rationale
                </div>
                {metrics.badge_reason}
              </div>

              {/* RSI & MACD Indicators */}
              <div className="grid grid-cols-2 gap-3">
                {/* RSI */}
                <div className="p-3.5 rounded-xl bg-slate-900 border border-white/5">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-400 font-semibold">RSI (14-period)</span>
                    <span className="font-mono font-bold text-white">{metrics.rsi_14.toFixed(1)}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden relative my-2">
                    <div 
                      className={`h-full rounded-full ${
                        metrics.rsi_14 > 70 ? "bg-rose-500" :
                        metrics.rsi_14 < 30 ? "bg-amber-400" : "bg-emerald-500"
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, metrics.rsi_14))}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                    <span>30 (Oversold)</span>
                    <span>50</span>
                    <span>70 (Overbought)</span>
                  </div>
                </div>

                {/* MACD */}
                <div className="p-3.5 rounded-xl bg-slate-900 border border-white/5">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-400 font-semibold">MACD Histogram</span>
                    <span className={`font-mono font-bold ${metrics.macd_hist >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {metrics.macd_hist > 0 ? `+${metrics.macd_hist}` : metrics.macd_hist}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 space-y-1 mt-2">
                    <div className="flex justify-between">
                      <span>MACD Line:</span>
                      <span className="font-mono text-slate-200">{metrics.macd_line.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Signal Line:</span>
                      <span className="font-mono text-slate-200">{metrics.macd_signal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Moving Averages Matrix */}
              <div className="p-4 rounded-2xl glass-card border border-white/10 bg-slate-900/40">
                <div className="text-xs font-bold text-white mb-3 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-teal-400" />
                  Moving Averages Alignment
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-slate-950 border border-white/5">
                    <div className="text-[10px] text-slate-400">SMA 20-day</div>
                    <div className="font-semibold text-white">₹{metrics.sma_20.toFixed(2)}</div>
                    <div className={`text-[10px] ${metrics.current_price > metrics.sma_20 ? "text-emerald-400" : "text-rose-400"}`}>
                      {metrics.current_price > metrics.sma_20 ? "▲ Above" : "▼ Below"}
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-950 border border-white/5">
                    <div className="text-[10px] text-slate-400">SMA 50-day</div>
                    <div className="font-semibold text-white">₹{metrics.sma_50.toFixed(2)}</div>
                    <div className={`text-[10px] ${metrics.current_price > metrics.sma_50 ? "text-emerald-400" : "text-rose-400"}`}>
                      {metrics.current_price > metrics.sma_50 ? "▲ Above" : "▼ Below"}
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-950 border border-white/5">
                    <div className="text-[10px] text-slate-400">SMA 200-day</div>
                    <div className="font-semibold text-white">₹{metrics.sma_200.toFixed(2)}</div>
                    <div className={`text-[10px] ${metrics.current_price > metrics.sma_200 ? "text-emerald-400" : "text-rose-400"}`}>
                      {metrics.current_price > metrics.sma_200 ? "▲ Above" : "▼ Below"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Support & Resistance Channel */}
              <div className="p-4 rounded-2xl glass-card border border-white/10 bg-slate-900/40">
                <div className="text-xs font-bold text-white mb-2 flex items-center justify-between">
                  <span>50-Day Price Channel (Support vs Resistance)</span>
                  <span className="text-[10px] text-slate-400">Volume Ratio: {metrics.volume_sma_ratio}x</span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-300 font-mono mb-1">
                  <span className="text-rose-400">Support: ₹{metrics.support_level.toFixed(2)}</span>
                  <span className="text-emerald-400">Resistance: ₹{metrics.resistance_level.toFixed(2)}</span>
                </div>
              </div>

              {/* FinBERT Sentiment Summary */}
              <div className="p-4 rounded-2xl glass-card border border-cyan-500/20 bg-cyan-950/10">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                    FinBERT Sentiment Context
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300">
                    {metrics.sentiment_label} ({metrics.sentiment_score > 0 ? `+${metrics.sentiment_score}` : metrics.sentiment_score})
                  </span>
                </div>
                <p className="text-xs text-slate-300 italic">&ldquo;{metrics.sentiment_headline}&rdquo;</p>
              </div>

            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/10 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition cursor-pointer"
          >
            Close Drawer
          </button>
        </div>

      </div>
    </div>
  );
};
