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
          <div key={i} className="h-32 rounded-2xl glass-card border border-white/5 bg-slate-900/50"></div>
        ))}
      </div>
    );
  }

  const isProfit = summary.total_pnl >= 0;
  const healthScore = summary.portfolio_health_score ?? 82.0;

  const getHealthStatus = (score: number) => {
    if (score >= 80) return { label: "Optimal Health", color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" };
    if (score >= 60) return { label: "Moderate Risk", color: "text-amber-400 border-amber-500/30 bg-amber-500/10" };
    return { label: "High Drag / Over-indexed", color: "text-rose-400 border-rose-500/30 bg-rose-500/10" };
  };

  const healthBadge = getHealthStatus(healthScore);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* Card 1: Total Net Worth & P&L */}
      <div className="glass-card glass-card-hover rounded-2xl p-5 relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none"></div>
        <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
          <span>Current Portfolio Value</span>
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <Wallet className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-2xl font-bold tracking-tight text-white mb-2">
          ₹{summary.total_current_value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-xs font-semibold ${
            isProfit ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25" : "bg-rose-500/15 text-rose-400 border border-rose-500/25"
          }`}>
            {isProfit ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>
              {isProfit ? "+" : ""}₹{summary.total_pnl.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({isProfit ? "+" : ""}{summary.total_pnl_percentage.toFixed(2)}%)
            </span>
          </span>
          <span className="text-[10px] text-slate-400">Total Unrealized</span>
        </div>
      </div>

      {/* Card 2: Total Invested & Position Count */}
      <div className="glass-card glass-card-hover rounded-2xl p-5 relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none"></div>
        <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
          <span>Total Capital Invested</span>
          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
            <Activity className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-2xl font-bold tracking-tight text-white mb-2">
          ₹{summary.total_investment.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <span className="font-semibold text-slate-200">{summary.holdings_count} Active Assets</span>
          <span>•</span>
          <span className="text-teal-300 font-medium">{summary.broker_connected}</span>
        </div>
      </div>

      {/* Card 3: Portfolio Health Score */}
      <div className="glass-card glass-card-hover rounded-2xl p-5 relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none"></div>
        <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
          <span>Algorithmic Health Score</span>
          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="flex items-baseline space-x-2 mb-2">
          <span className="text-2xl font-bold tracking-tight text-white">{healthScore}</span>
          <span className="text-xs text-slate-400 font-medium">/ 100</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${healthBadge.color}`}>
            {healthBadge.label}
          </span>
          <span className="text-[10px] text-slate-400">Tactical Efficiency</span>
        </div>
      </div>

      {/* Card 4: Concentration & Exposure Guardrail */}
      <div className="glass-card glass-card-hover rounded-2xl p-5 relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none"></div>
        <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
          <span>Sector Concentration Alerts</span>
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${
            summary.concentration_alerts.length > 0
              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          }`}>
            {summary.concentration_alerts.length > 0 ? <AlertTriangle className="w-3.5 h-3.5" /> : <PieChart className="w-3.5 h-3.5" />}
          </div>
        </div>
        
        {summary.concentration_alerts.length > 0 ? (
          <div>
            <div className="text-sm font-bold text-amber-300 flex items-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              {summary.concentration_alerts.length} Sector Over-indexed (&gt;25%)
            </div>
            <p className="text-[11px] text-slate-300 line-clamp-1">
              {summary.concentration_alerts[0].replace("Concentration Alert: ", "")}
            </p>
          </div>
        ) : (
          <div>
            <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Optimal Diversification
            </div>
            <p className="text-[11px] text-slate-400">
              No sector exceeds the 25% risk threshold.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
