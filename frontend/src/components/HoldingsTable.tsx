"use client";

import React, { useState } from "react";
import { 
  ArrowUpDown, 
  Search, 
  Filter, 
  Sparkles, 
  Activity, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle,
  ExternalLink,
  ShieldAlert
} from "lucide-react";
import { Holding, BadgeType } from "@/types";

interface HoldingsTableProps {
  holdings: Holding[];
  loading: boolean;
  onOpenSwapModal: (holding: Holding) => void;
  onOpenTechnicalDrawer: (ticker: string) => void;
  onDeleteHolding: (id: number) => void;
  selectedSectorFilter?: string | null;
  onClearSectorFilter?: () => void;
}

export const HoldingsTable: React.FC<HoldingsTableProps> = ({
  holdings,
  loading,
  onOpenSwapModal,
  onOpenTechnicalDrawer,
  onDeleteHolding,
  selectedSectorFilter,
  onClearSectorFilter
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [badgeFilter, setBadgeFilter] = useState<string>("ALL");

  // Filtering
  const filteredHoldings = holdings.filter((h) => {
    const matchesSearch = 
      h.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.symbol_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.sector.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBadge = badgeFilter === "ALL" || h.badge === badgeFilter;
    const matchesSector = !selectedSectorFilter || h.sector === selectedSectorFilter;

    return matchesSearch && matchesBadge && matchesSector;
  });

  const getBadgeStyle = (badge: BadgeType) => {
    switch (badge) {
      case "HOLD":
        return "badge-hold shadow-xs";
      case "SELL":
        return "badge-sell shadow-xs";
      case "SWAP":
        return "badge-swap shadow-xs";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getSentimentPill = (label: string) => {
    switch (label) {
      case "BULLISH":
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Bullish News</span>;
      case "BEARISH":
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Bearish News</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">Neutral News</span>;
    }
  };

  const getCompositeScoreColor = (score: number) => {
    if (score >= 1.5) return "text-emerald-600";
    if (score <= -1.5) return "text-rose-600";
    return "text-amber-600";
  };

  return (
    <div className="light-card rounded-2xl border border-slate-200 overflow-hidden bg-white">
      
      {/* Table Header & Controls Bar */}
      <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <div>
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              Portfolio Holdings & Algorithmic Signals
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time multi-indicator evaluations (HOLD / SELL / SWAP) with FinBERT sentiment overlay.
          </p>
        </div>

        {/* Search & Badges Filter */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {selectedSectorFilter && (
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
              <span>Sector: {selectedSectorFilter}</span>
              <button 
                onClick={onClearSectorFilter}
                className="hover:text-slate-900 ml-1 text-emerald-700 font-bold"
              >
                ×
              </button>
            </div>
          )}

          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ticker, company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 transition w-44 sm:w-56"
            />
          </div>

          {/* Badge Filter Tabs */}
          <div className="flex items-center rounded-xl bg-slate-100 border border-slate-200 p-0.5 text-xs font-bold">
            {["ALL", "HOLD", "SWAP", "SELL"].map((b) => (
              <button
                key={b}
                onClick={() => setBadgeFilter(b)}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  badgeFilter === b
                    ? b === "HOLD" ? "bg-emerald-600 text-white shadow-xs" :
                      b === "SELL" ? "bg-rose-600 text-white shadow-xs" :
                      b === "SWAP" ? "bg-amber-500 text-white shadow-xs" :
                      "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {b}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Asset / Sector</th>
              <th className="py-3 px-4">Qty & Avg Price</th>
              <th className="py-3 px-4">Current Price</th>
              <th className="py-3 px-4">Unrealized P&L</th>
              <th className="py-3 px-4 text-center">Composite Score (-5 to +5)</th>
              <th className="py-3 px-4 text-center">News Sentiment</th>
              <th className="py-3 px-4 text-center">Action Signal</th>
              <th className="py-3 px-4 text-right">Smart Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {loading ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  <div className="inline-flex items-center space-x-2">
                    <span className="w-4 h-4 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin"></span>
                    <span>Computing real-time indicators across 130+ metrics...</span>
                  </div>
                </td>
              </tr>
            ) : filteredHoldings.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  No holdings match the current filter criteria.
                </td>
              </tr>
            ) : (
              filteredHoldings.map((h) => {
                const isPositive = h.pnl >= 0;
                const score = h.composite_score ?? 0.0;
                const isSwapCandidate = h.badge === "SELL" || h.badge === "SWAP";

                return (
                  <tr 
                    key={h.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* Ticker & Sector */}
                    <td className="py-3.5 px-4">
                      <div>
                        <div className="font-extrabold text-slate-900 text-sm group-hover:text-emerald-700 transition flex items-center gap-1.5">
                          {h.ticker}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                          <span>{h.symbol_name}</span>
                          <span>•</span>
                          <span className="text-emerald-700 font-semibold">{h.sector}</span>
                        </div>
                      </div>
                    </td>

                    {/* Qty & Avg Price */}
                    <td className="py-3.5 px-4 text-slate-700">
                      <div className="font-bold text-slate-900">{h.quantity} shares</div>
                      <div className="text-[11px] text-slate-400">@ ₹{h.average_buy_price.toFixed(2)}</div>
                    </td>

                    {/* Current Price & Market Value */}
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-slate-900">₹{h.current_price.toFixed(2)}</div>
                      <div className="text-[11px] text-slate-500">
                        Val: ₹{h.market_value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </div>
                    </td>

                    {/* Unrealized P&L */}
                    <td className="py-3.5 px-4">
                      <div className={`font-black flex items-center space-x-1 ${isPositive ? "text-emerald-600" : "text-rose-600"}`}>
                        {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        <span>{isPositive ? "+" : ""}₹{h.pnl.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className={`text-[11px] font-bold ${isPositive ? "text-emerald-700" : "text-rose-700"}`}>
                        {isPositive ? "+" : ""}{h.pnl_percentage.toFixed(2)}%
                      </div>
                    </td>

                    {/* Composite Score Meter */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className={`font-mono font-black text-xs ${getCompositeScoreColor(score)}`}>
                          {score > 0 ? `+${score.toFixed(2)}` : score.toFixed(2)}
                        </span>
                        {/* Mini visual scale (-5 to +5) */}
                        <div className="w-20 h-1.5 bg-slate-200 rounded-full mt-1 relative overflow-hidden">
                          {/* Center point at 50% */}
                          <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-slate-400"></div>
                          <div 
                            className={`h-full rounded-full ${
                              score >= 1.5 ? "bg-emerald-500" : score <= -1.5 ? "bg-rose-500" : "bg-amber-400"
                            }`}
                            style={{
                              width: `${Math.abs(score) * 10}%`,
                              marginLeft: score >= 0 ? "50%" : `${50 - (Math.abs(score) * 10)}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    </td>

                    {/* FinBERT Sentiment */}
                    <td className="py-3.5 px-4 text-center">
                      {getSentimentPill(h.sentiment_label)}
                    </td>

                    {/* Action Badge (HOLD / SELL / SWAP) */}
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-black tracking-wide uppercase ${getBadgeStyle(h.badge)}`}>
                        {h.badge}
                      </span>
                    </td>

                    {/* Smart Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        
                        {/* Smart Swap Copilot Action */}
                        <button
                          onClick={() => onOpenSwapModal(h)}
                          className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                            isSwapCandidate
                              ? "bg-amber-500 hover:bg-amber-600 text-white shadow-xs"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                          title="Open AI Smart Swap Copilot"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{isSwapCandidate ? "Smart Swap" : "Explore Swap"}</span>
                        </button>

                        {/* Deep-Dive Technical Drawer */}
                        <button
                          onClick={() => onOpenTechnicalDrawer(h.ticker)}
                          className="p-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition cursor-pointer"
                          title="Open 130+ Technical Indicators Deep-Dive"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Holding */}
                        <button
                          onClick={() => onDeleteHolding(h.id)}
                          className="p-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Remove position from portfolio"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
