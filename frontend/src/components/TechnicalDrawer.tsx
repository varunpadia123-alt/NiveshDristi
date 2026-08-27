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
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
      <div className="w-full max-w-xl h-full light-card bg-white border-l border-slate-200 p-6 sm:p-8 overflow-y-auto shadow-2xl flex flex-col justify-between">
        
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">{ticker}</h2>
                  {metrics && (
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-wider uppercase ${
                      metrics.badge === "HOLD" ? "badge-hold" :
                      metrics.badge === "SELL" ? "badge-sell" :
                      "badge-swap"
                    }`}>
                      {metrics.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 font-medium">130+ pandas-ta Indicators & Composite Engine</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {loading ? (
            <div className="py-24 text-center text-slate-500 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 rounded-full border-3 border-emerald-500 border-t-transparent animate-spin"></div>
              <p className="text-xs font-semibold">Computing technical indicators, moving averages, and sentiment...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
              {error}
            </div>
          ) : metrics ? (
            <div className="space-y-6">

              {/* Price & Composite Score Banner */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Current Spot Price</span>
                  <div className="text-2xl font-black text-slate-900">₹{metrics.current_price.toFixed(2)}</div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Composite Score</span>
                  <div className={`text-2xl font-black font-mono ${
                    metrics.composite_score >= 1.5 ? "text-emerald-600" :
                    metrics.composite_score <= -1.5 ? "text-rose-600" : "text-amber-600"
                  }`}>
                    {metrics.composite_score > 0 ? `+${metrics.composite_score.toFixed(2)}` : metrics.composite_score.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Score Sub-Components */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <div className="text-[10px] text-slate-500 font-semibold mb-1">Momentum (35%)</div>
                  <div className={`font-mono font-bold text-sm ${metrics.momentum_score >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {metrics.momentum_score > 0 ? `+${metrics.momentum_score}` : metrics.momentum_score}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <div className="text-[10px] text-slate-500 font-semibold mb-1">Trend (35%)</div>
                  <div className={`font-mono font-bold text-sm ${metrics.trend_score >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {metrics.trend_score > 0 ? `+${metrics.trend_score}` : metrics.trend_score}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <div className="text-[10px] text-slate-500 font-semibold mb-1">Volume/Risk (30%)</div>
                  <div className={`font-mono font-bold text-sm ${metrics.volume_score >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {metrics.volume_score > 0 ? `+${metrics.volume_score}` : metrics.volume_score}
                  </div>
                </div>
              </div>

              {/* Badge Reason Alert */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 text-xs text-slate-700">
                <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-emerald-600" />
                  Signal Rationale
                </div>
                {metrics.badge_reason}
              </div>

              {/* RSI & MACD Indicators */}
              <div className="grid grid-cols-2 gap-3">
                {/* RSI */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-600 font-semibold">RSI (14-period)</span>
                    <span className="font-mono font-bold text-slate-900">{metrics.rsi_14.toFixed(1)}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden relative my-2">
                    <div 
                      className={`h-full rounded-full ${
                        metrics.rsi_14 > 70 ? "bg-rose-500" :
                        metrics.rsi_14 < 30 ? "bg-amber-500" : "bg-emerald-500"
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, metrics.rsi_14))}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-400 font-mono font-semibold">
                    <span>30 (Oversold)</span>
                    <span>50</span>
                    <span>70 (Overbought)</span>
                  </div>
                </div>

                {/* MACD */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-600 font-semibold">MACD Histogram</span>
                    <span className={`font-mono font-bold ${metrics.macd_hist >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {metrics.macd_hist > 0 ? `+${metrics.macd_hist}` : metrics.macd_hist}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 space-y-1 mt-2 font-medium">
                    <div className="flex justify-between">
                      <span>MACD Line:</span>
                      <span className="font-mono text-slate-900 font-bold">{metrics.macd_line.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Signal Line:</span>
                      <span className="font-mono text-slate-900 font-bold">{metrics.macd_signal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Moving Averages Matrix */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50">
                <div className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-600" />
                  Moving Averages Alignment
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-white border border-slate-200">
                    <div className="text-[10px] text-slate-400 font-medium">SMA 20-day</div>
                    <div className="font-bold text-slate-900">₹{metrics.sma_20.toFixed(2)}</div>
                    <div className={`text-[10px] font-bold ${metrics.current_price > metrics.sma_20 ? "text-emerald-600" : "text-rose-600"}`}>
                      {metrics.current_price > metrics.sma_20 ? "▲ Above" : "▼ Below"}
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-white border border-slate-200">
                    <div className="text-[10px] text-slate-400 font-medium">SMA 50-day</div>
                    <div className="font-bold text-slate-900">₹{metrics.sma_50.toFixed(2)}</div>
                    <div className={`text-[10px] font-bold ${metrics.current_price > metrics.sma_50 ? "text-emerald-600" : "text-rose-600"}`}>
                      {metrics.current_price > metrics.sma_50 ? "▲ Above" : "▼ Below"}
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-white border border-slate-200">
                    <div className="text-[10px] text-slate-400 font-medium">SMA 200-day</div>
                    <div className="font-bold text-slate-900">₹{metrics.sma_200.toFixed(2)}</div>
                    <div className={`text-[10px] font-bold ${metrics.current_price > metrics.sma_200 ? "text-emerald-600" : "text-rose-600"}`}>
                      {metrics.current_price > metrics.sma_200 ? "▲ Above" : "▼ Below"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Support & Resistance Channel */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50">
                <div className="text-xs font-bold text-slate-900 mb-2 flex items-center justify-between">
                  <span>50-Day Price Channel (Support vs Resistance)</span>
                  <span className="text-[10px] text-slate-500 font-semibold">Volume Ratio: {metrics.volume_sma_ratio}x</span>
                </div>

                <div className="flex items-center justify-between text-xs font-mono font-bold mb-1">
                  <span className="text-rose-600">Support: ₹{metrics.support_level.toFixed(2)}</span>
                  <span className="text-emerald-600">Resistance: ₹{metrics.resistance_level.toFixed(2)}</span>
                </div>
              </div>

              {/* FinBERT Sentiment Summary */}
              <div className="p-4 rounded-2xl border border-blue-200 bg-blue-50/60">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    FinBERT Sentiment Context
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                    {metrics.sentiment_label} ({metrics.sentiment_score > 0 ? `+${metrics.sentiment_score}` : metrics.sentiment_score})
                  </span>
                </div>
                <p className="text-xs text-slate-700 italic">&ldquo;{metrics.sentiment_headline}&rdquo;</p>
              </div>

            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-slate-100 text-slate-800 hover:bg-slate-200 transition cursor-pointer"
          >
            Close Drawer
          </button>
        </div>

      </div>
    </div>
  );
};
