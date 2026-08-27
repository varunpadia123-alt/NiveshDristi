"use client";

import React from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ShieldCheck, 
  AlertTriangle, 
  Activity,
  PieChart
} from "lucide-react";
import { PortfolioSummary } from "@/types";

interface PortfolioOverviewProps {
  summary: PortfolioSummary | null;
  loading: boolean;
}

export const PortfolioOverview: React.FC<PortfolioOverviewProps> = ({ summary, loading }) => {
  if (loading || !summary) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 rounded-2xl light-card bg-slate-100 border border-slate-200"></div>
        ))}
      </div>
    );
  }

  const isProfit = summary.total_pnl >= 0;
  const healthScore = summary.portfolio_health_score ?? 82.0;

  const getHealthStatus = (score: number) => {
    if (score >= 80) return { label: "Optimal Health", color: "text-emerald-800 border-emerald-200 bg-emerald-100" };
    if (score >= 60) return { label: "Moderate Risk", color: "text-amber-800 border-amber-200 bg-amber-100" };
    return { label: "High Drag / Over-indexed", color: "text-rose-800 border-rose-200 bg-rose-100" };
  };

  const healthBadge = getHealthStatus(healthScore);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* Card 1: Total Net Worth & P&L */}
      <div className="light-card light-card-hover rounded-2xl p-5 bg-white border border-slate-200">
        <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
          <span>Current Portfolio Value</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black tracking-tight text-slate-900 mb-2">
          ₹{summary.total_current_value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-lg text-xs font-bold ${
            isProfit ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
          }`}>
            {isProfit ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>
              {isProfit ? "+" : ""}₹{summary.total_pnl.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({isProfit ? "+" : ""}{summary.total_pnl_percentage.toFixed(2)}%)
            </span>
          </span>
          <span className="text-[11px] text-slate-400 font-medium">Unrealized</span>
        </div>
      </div>

      {/* Card 2: Total Invested & Position Count */}
      <div className="light-card light-card-hover rounded-2xl p-5 bg-white border border-slate-200">
        <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
          <span>Total Capital Invested</span>
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Activity className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black tracking-tight text-slate-900 mb-2">
          ₹{summary.total_investment.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
          <span className="font-bold text-slate-800">{summary.holdings_count} Active Holdings</span>
          <span>•</span>
          <span className="text-emerald-700 font-bold">{summary.broker_connected}</span>
        </div>
      </div>

      {/* Card 3: Portfolio Health Score */}
      <div className="light-card light-card-hover rounded-2xl p-5 bg-white border border-slate-200">
        <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
          <span>Algorithmic Health Score</span>
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-1.5 mb-2">
          <span className="text-2xl font-black tracking-tight text-slate-900">{healthScore}</span>
          <span className="text-xs text-slate-400 font-bold">/ 100</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold border ${healthBadge.color}`}>
            {healthBadge.label}
          </span>
          <span className="text-[11px] text-slate-400 font-medium">Tactical Efficiency</span>
        </div>
      </div>

      {/* Card 4: Concentration & Exposure Guardrail */}
      <div className="light-card light-card-hover rounded-2xl p-5 bg-white border border-slate-200">
        <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
          <span>Sector Concentration Alerts</span>
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
            summary.concentration_alerts.length > 0
              ? "bg-amber-50 text-amber-600 border-amber-200"
              : "bg-emerald-50 text-emerald-600 border-emerald-100"
          }`}>
            {summary.concentration_alerts.length > 0 ? <AlertTriangle className="w-4 h-4" /> : <PieChart className="w-4 h-4" />}
          </div>
        </div>
        
        {summary.concentration_alerts.length > 0 ? (
          <div>
            <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
              {summary.concentration_alerts.length} Sector Over-indexed (&gt;25%)
            </div>
            <p className="text-[11px] text-slate-600 line-clamp-1 font-medium">
              {summary.concentration_alerts[0].replace("Concentration Alert: ", "")}
            </p>
          </div>
        ) : (
          <div>
            <div className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Optimal Diversification
            </div>
            <p className="text-[11px] text-slate-500">
              No sector exceeds the 25% safety threshold.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
