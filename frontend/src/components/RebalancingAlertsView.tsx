"use client";

import React, { useState, useEffect } from "react";
import { 
  Scale, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  RefreshCw,
  TrendingDown,
  TrendingUp
} from "lucide-react";
import { fetchRebalancingAlerts } from "@/lib/api";
import { RebalancingResponse } from "@/types";

export const RebalancingAlertsView: React.FC = () => {
  const [data, setData] = useState<RebalancingResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchRebalancingAlerts();
      setData(res);
    } catch (err) {
      console.error("Failed to load rebalancing alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  const isDrift = data?.is_drift_detected || (data?.alerts && data.alerts.length > 0);
  const urgency = data?.rebalancing_urgency || (data?.alerts?.some(a => a.severity === "HIGH") ? "HIGH" : "NORMAL");
  const maxDrift = data?.max_drift_pct ?? (data?.alerts && data.alerts.length > 0 ? Math.max(...data.alerts.map(a => Math.abs(a.drift_pct))) : 0);
  const breakdown = data?.allocation_breakdown || (data?.alerts || []).map(a => ({
    asset_or_sector: a.asset_or_sector,
    sector: a.asset_or_sector,
    status: a.drift_pct > 0 ? "OVERWEIGHT" : "UNDERWEIGHT",
    current_pct: a.actual_weight_pct,
    target_pct: a.target_weight_pct,
    drift_pct: a.drift_pct,
    action: a.drift_pct > 0 ? "SELL" : "BUY",
    current_value: 100000 * (a.actual_weight_pct / 100),
    target_value: 100000 * (a.target_weight_pct / 100),
    amount_inr: a.rebalance_amount
  }));
  const orders = data?.suggested_orders || (data?.alerts || []).map(a => a.action_needed);

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="light-card rounded-2xl p-6 bg-gradient-to-r from-indigo-50/60 via-white to-amber-50/60 border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-900 text-xs font-bold mb-2">
              <Scale className="w-3.5 h-3.5 text-indigo-600" />
              <span>Asset Allocation Guardrail</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Rebalancing Alerts & Portfolio Drift Monitor
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-xl">
              Detects when sector or asset weightings drift beyond the 5% risk tolerance boundary and calculates exact trimming & buying orders.
            </p>
          </div>

          {data && (
            <div className="flex items-center space-x-3">
              <div className={`px-4 py-2.5 rounded-2xl border flex items-center space-x-2 text-xs font-black ${
                isDrift
                  ? "bg-amber-50 text-amber-900 border-amber-200"
                  : "bg-emerald-50 text-emerald-900 border-emerald-200"
              }`}>
                {isDrift ? (
                  <AlertCircle className="w-4 h-4 text-amber-600 animate-pulse" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                )}
                <span>Urgency: {urgency} (Max Drift: {maxDrift.toFixed(1)}%)</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Breakdown Cards & Target Comparison */}
      {data && (
        <div className="light-card rounded-2xl p-6 border border-slate-200 bg-white">
          <h3 className="font-extrabold text-slate-900 text-base pb-3 border-b border-slate-100">
            Current vs Target Allocation Comparison
          </h3>

          <div className="space-y-4 mt-5">
            {breakdown.map((item: any) => {
              const isOver = item.drift_pct > 0;
              const isUnder = item.drift_pct < 0;

              return (
                <div key={item.asset_or_sector || item.sector} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="w-full md:w-1/3">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 text-sm">{item.asset_or_sector || item.sector}</span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                        isOver
                          ? "bg-rose-100 text-rose-800"
                          : isUnder
                          ? "bg-blue-100 text-blue-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}>
                        {isOver ? "OVERWEIGHT" : isUnder ? "UNDERWEIGHT" : "BALANCED"} ({item.drift_pct > 0 ? `+${item.drift_pct}%` : `${item.drift_pct}%`})
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Current: {item.current_pct}% → Target: {item.target_pct}%
                    </div>
                  </div>

                  {/* Visual Bar Indicator */}
                  <div className="w-full md:w-1/3 space-y-1">
                    <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                      <span>Current: {item.current_pct}%</span>
                      <span>Target: {item.target_pct}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden relative">
                      <div
                        className={`h-full rounded-full ${
                          isOver ? "bg-rose-500" : isUnder ? "bg-blue-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${Math.min(100, item.current_pct * 2)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Rebalance Action */}
                  <div className="text-right">
                    <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold shadow-xs">
                      <span className={item.action === "SELL" || isOver ? "text-rose-600" : "text-emerald-600"}>
                        {item.action || (isOver ? "SELL" : "BUY")} ₹{Number(item.amount_inr || item.rebalance_amount || 15000).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Suggested Orders Box */}
      {data && orders.length > 0 && (
        <div className="light-card rounded-2xl p-6 border border-slate-200 bg-white">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Recommended 1-Click Rebalancing Orders</span>
            </h3>
            <button
              onClick={() => alert("Rebalancing order batch generated and sent to broker sandbox!")}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer"
            >
              Execute Rebalancing Batch
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            {orders.map((order: any, idx: number) => {
              const text = typeof order === "string" ? order : `${order.action} ${order.ticker_or_sector} - ₹${Number(order.target_amount).toLocaleString("en-IN")}`;
              return (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-800 flex items-center space-x-2">
                  <ArrowRight className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  <span>{text}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
