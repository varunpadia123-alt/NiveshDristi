"use client";

import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Globe2, 
  Flag, 
  Activity, 
  RefreshCw, 
  Sparkles,
  BarChart3,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Info
} from "lucide-react";
import { MarketIndexItem } from "@/types";
import { fetchIndianIndices, fetchGlobalIndices } from "@/lib/api";

export const IndicesSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"indian" | "global">("indian");
  const [indianIndices, setIndianIndices] = useState<MarketIndexItem[]>([]);
  const [globalIndices, setGlobalIndices] = useState<MarketIndexItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadIndices = async () => {
    setLoading(true);
    try {
      const [ind, glob] = await Promise.all([
        fetchIndianIndices(),
        fetchGlobalIndices()
      ]);
      setIndianIndices(ind);
      setGlobalIndices(glob);
    } catch (err) {
      console.error("Failed to fetch market indices:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadIndices();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadIndices();
  };

  const currentList = activeTab === "indian" ? indianIndices : globalIndices;

  // Filter categories
  const indianCategories = ["ALL", "Broad Market", "Sectoral", "Market Cap", "Volatility"];
  const globalCategories = ["ALL", "Americas", "Asia-Pacific", "Europe"];
  const currentCategories = activeTab === "indian" ? indianCategories : globalCategories;

  const filteredIndices = currentList.filter((item) => {
    const matchesSearch = 
      item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.country && item.country.toLowerCase().includes(searchQuery.toLowerCase()));

    if (categoryFilter === "ALL") return matchesSearch;
    if (activeTab === "indian") {
      return matchesSearch && item.category === categoryFilter;
    } else {
      return matchesSearch && item.region === categoryFilter;
    }
  });

  // Spotlight benchmark indices
  const indianHighlights = indianIndices.filter(i => 
    ["NIFTY 50", "SENSEX", "NIFTY BANK", "NIFTY IT"].includes(i.symbol)
  );

  const globalHighlights = globalIndices.filter(i => 
    ["S&P 500", "NASDAQ", "GIFT NIFTY", "NIKKEI 225"].includes(i.symbol)
  );

  const activeHighlights = activeTab === "indian" ? indianHighlights : globalHighlights;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 rounded-3xl light-card bg-white border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center space-x-2.5 mb-1.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shadow-xs">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  Market Indices
                </h1>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-200">
                  Live Rates
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Real-time tracking of Indian benchmark & sectoral indices and major global market movements.
              </p>
            </div>
          </div>
        </div>

        {/* Primary Sub-Tab Switcher & Refresh */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => {
                setActiveTab("indian");
                setCategoryFilter("ALL");
              }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "indian"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span className="text-base leading-none">🇮🇳</span>
              <span>Indian Indices</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200/80 text-slate-700 font-bold">
                {indianIndices.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab("global");
                setCategoryFilter("ALL");
              }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "global"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Globe2 className="w-4 h-4 text-indigo-500" />
              <span>Global Indices</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200/80 text-slate-700 font-bold">
                {globalIndices.length}
              </span>
            </button>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition cursor-pointer"
            title="Refresh Live Indices"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-emerald-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* Featured Spotlight Benchmark Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {activeHighlights.map((idx) => {
          const isUp = idx.day_change_pct >= 0;
          return (
            <div
              key={idx.symbol}
              className="light-card rounded-2xl p-5 bg-white border border-slate-200 hover:border-slate-300 transition shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {activeTab === "indian" ? idx.exchange : idx.country}
                  </span>
                  <div className="text-base font-black text-slate-900">{idx.name}</div>
                </div>
                <span className={`flex items-center space-x-1 px-2 py-0.5 rounded-lg text-xs font-black ${
                  isUp ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
                }`}>
                  {isUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  <span>{isUp ? `+${idx.day_change_pct.toFixed(2)}` : idx.day_change_pct.toFixed(2)}%</span>
                </span>
              </div>

              <div className="flex items-baseline justify-between mt-1">
                <div className="text-2xl font-black font-mono text-slate-900">
                  {idx.currency === "USD" ? "$" : idx.currency === "EUR" ? "€" : idx.currency === "GBP" ? "£" : idx.currency === "JPY" ? "¥" : "₹"}
                  {idx.current_value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <span className={`text-xs font-mono font-bold ${isUp ? "text-emerald-600" : "text-rose-600"}`}>
                  {isUp ? `+${idx.change_pts.toFixed(2)}` : idx.change_pts.toFixed(2)} pts
                </span>
              </div>

              {/* Day Range Bar */}
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px]">
                <div className="flex justify-between text-slate-400 font-semibold mb-1">
                  <span>L: {idx.day_low.toLocaleString("en-IN")}</span>
                  <span>H: {idx.day_high.toLocaleString("en-IN")}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${isUp ? "bg-emerald-500" : "bg-rose-500"}`}
                    style={{
                      width: `${Math.max(10, Math.min(90, ((idx.current_value - idx.day_low) / Math.max(1, idx.day_high - idx.day_low)) * 100))}%`
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="light-card rounded-2xl p-4 bg-white border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={activeTab === "indian" ? "Search Indian indices (e.g. Nifty Bank, Pharma, Midcap)..." : "Search global indices (e.g. S&P 500, Nasdaq, Nikkei)..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {currentCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                categoryFilter === cat
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Indices Grid */}
      {loading ? (
        <div className="py-24 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 rounded-full border-3 border-indigo-500 border-t-transparent animate-spin"></div>
          <p className="text-xs font-semibold">Loading real-time market indices feed...</p>
        </div>
      ) : filteredIndices.length === 0 ? (
        <div className="py-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-200 p-8">
          <Info className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          <p className="text-sm font-bold text-slate-700">No indices found</p>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your search query or category filter.</p>
        </div>
      ) : (
        <div className="light-card rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Index Name</th>
                  <th className="py-3.5 px-4">{activeTab === "indian" ? "Category" : "Country / Region"}</th>
                  <th className="py-3.5 px-4 text-right">Current Value</th>
                  <th className="py-3.5 px-4 text-right">Day Change</th>
                  <th className="py-3.5 px-4 text-right">Day Range (L - H)</th>
                  <th className="py-3.5 px-6 text-right">52-Week Range</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredIndices.map((idx) => {
                  const isUp = idx.day_change_pct >= 0;
                  return (
                    <tr 
                      key={idx.symbol}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Name */}
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 font-black text-xs flex items-center justify-center flex-shrink-0 border border-slate-200">
                            {idx.symbol.substring(0, 2)}
                          </div>
                          <div>
                            <div className="font-black text-slate-900">{idx.name}</div>
                            <div className="text-[10px] text-slate-400 font-semibold">{idx.symbol} • {idx.exchange}</div>
                          </div>
                        </div>
                      </td>

                      {/* Category / Region */}
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {activeTab === "indian" ? idx.category : `${idx.country} (${idx.region})`}
                        </span>
                      </td>

                      {/* Current Value */}
                      <td className="py-4 px-4 text-right font-mono font-black text-sm text-slate-900">
                        {idx.currency === "USD" ? "$" : idx.currency === "EUR" ? "€" : idx.currency === "GBP" ? "£" : idx.currency === "JPY" ? "¥" : "₹"}
                        {idx.current_value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* Day Change */}
                      <td className="py-4 px-4 text-right font-mono">
                        <div className={`font-black ${isUp ? "text-emerald-600" : "text-rose-600"}`}>
                          {isUp ? `+${idx.day_change_pct.toFixed(2)}` : idx.day_change_pct.toFixed(2)}%
                        </div>
                        <div className={`text-[10px] font-semibold ${isUp ? "text-emerald-500" : "text-rose-500"}`}>
                          {isUp ? `+${idx.change_pts.toFixed(2)}` : idx.change_pts.toFixed(2)} pts
                        </div>
                      </td>

                      {/* Day Range */}
                      <td className="py-4 px-4 text-right font-mono text-slate-600">
                        <div className="text-[11px] font-semibold text-slate-700">
                          {idx.day_low.toLocaleString("en-IN")} - {idx.day_high.toLocaleString("en-IN")}
                        </div>
                        <div className="text-[10px] text-slate-400">Open: {idx.open.toLocaleString("en-IN")}</div>
                      </td>

                      {/* 52-Week Range */}
                      <td className="py-4 px-6 text-right font-mono text-slate-500">
                        <div className="text-[11px] font-semibold text-slate-700">
                          {idx.fifty_two_week_low.toLocaleString("en-IN")} - {idx.fifty_two_week_high.toLocaleString("en-IN")}
                        </div>
                        <div className="text-[10px] text-slate-400">52W Low - High</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
