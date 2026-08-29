"use client";

import React, { useState, useEffect } from "react";
import { 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight, 
  ShieldAlert, 
  Sparkles, 
  Percent, 
  CheckCircle2 
} from "lucide-react";
import { fetchOptionsScreener } from "@/lib/api";
import { OptionsScreenerResponse, OptionSignal } from "@/types";

export const OptionsScreenerView: React.FC = () => {
  const [data, setData] = useState<OptionsScreenerResponse | null>(null);
  const [filterType, setFilterType] = useState<"ALL" | "CE" | "PE">("ALL");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchOptionsScreener();
      setData(res);
    } catch (err) {
      console.error("Failed to load options screener:", err);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredSignals = (): OptionSignal[] => {
    if (!data) return [];
    const allSignals = data.signals || [...(data.call_opportunities || []), ...(data.put_opportunities || [])];
    if (filterType === "CE") return allSignals.filter(s => s.option_type.includes("CALL") || s.option_type.includes("CE"));
    if (filterType === "PE") return allSignals.filter(s => s.option_type.includes("PUT") || s.option_type.includes("PE"));
    return allSignals;
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="light-card rounded-2xl p-6 bg-gradient-to-r from-indigo-50/60 via-white to-emerald-50/60 border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-900 text-xs font-bold mb-2">
              <Zap className="w-3.5 h-3.5 text-indigo-600" />
              <span>Algorithmic Derivatives Screener</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Options Screener: RSI-Based Call & Put Setups
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-xl">
              Identifies high-probability Call (CE) and Put (PE) trades for Indian F&O stocks based on oversold/overbought RSI 14 divergences, strike moneyness, and predefined risk-reward profiles.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold self-start md:self-auto">
            <button
              onClick={() => setFilterType("ALL")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterType === "ALL" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Setups
            </button>
            <button
              onClick={() => setFilterType("CE")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterType === "CE" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Bullish Calls (CE)
            </button>
            <button
              onClick={() => setFilterType("PE")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterType === "PE" ? "bg-rose-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Bearish Puts (PE)
            </button>
          </div>
        </div>
      </div>

      {/* Signals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {getFilteredSignals().map((signal, idx) => {
          const isCall = signal.option_type.includes("CALL") || signal.option_type.includes("CE");
          const companyName = signal.company_name || signal.ticker.replace(".NS", "");
          const entry = signal.entry_premium ?? signal.estimated_premium ?? 50;
          const stopLoss = signal.stop_loss_premium ?? signal.stop_loss ?? 30;
          const action = signal.recommended_action || (isCall ? "BUY CALL (CE)" : "BUY PUT (PE)");
          const rr = signal.risk_reward_ratio || signal.risk_reward || "1:2.5";

          return (
            <div
              key={idx}
              className="light-card light-card-hover rounded-2xl p-5 border border-slate-200 bg-white flex flex-col justify-between"
            >
              <div>
                {/* Header Tag & Moneyness */}
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase ${
                    isCall
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      : "bg-rose-100 text-rose-800 border border-rose-200"
                  }`}>
                    {action}
                  </span>

                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                    RSI 14: {signal.rsi_14.toFixed(1)}
                  </span>
                </div>

                {/* Underlying & Strike Title */}
                <h3 className="font-extrabold text-slate-900 text-base mt-3">
                  {companyName}
                </h3>
                <div className="text-xs font-semibold text-slate-500 mt-0.5 flex items-center justify-between">
                  <span>Spot: ₹{signal.spot_price.toFixed(1)}</span>
                  <span className="font-bold text-indigo-600">
                    Strike: ₹{signal.strike_price} {signal.option_type} ({signal.moneyness})
                  </span>
                </div>

                {/* Premium Targets & SL Box */}
                <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Entry</span>
                    <span className="font-extrabold text-slate-900 text-sm">₹{entry}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Target</span>
                    <span className="font-black text-emerald-600 text-sm">₹{signal.target_premium}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Stop Loss</span>
                    <span className="font-black text-rose-600 text-sm">₹{stopLoss}</span>
                  </div>
                </div>

                {/* Risk Reward & Expiry */}
                <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
                  <span>Expiry: <strong>{signal.expiry}</strong></span>
                  <span className="font-bold text-emerald-700">R:R {rr}</span>
                </div>

                {/* Setup Rationale */}
                <p className="mt-3 text-[11px] text-slate-600 bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100 leading-relaxed">
                  <span className="font-bold text-indigo-900">Setup Note: </span>
                  {signal.rationale}
                </p>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500">
                  MACD Bias: {signal.macd_bias}
                </span>
                <button
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer"
                  onClick={() => alert(`Pre-filling broker order ticket for ${companyName} ${signal.strike_price} ${signal.option_type}...`)}
                >
                  Trade Setup
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
