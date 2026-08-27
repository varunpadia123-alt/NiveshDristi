"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Layers, 
  ArrowUpRight, 
  ArrowDownRight, 
  BarChart2, 
  Activity, 
  Sparkles,
  SlidersHorizontal,
  ChevronRight,
  Plus
} from "lucide-react";
import { searchStocks, fetchTopMovers, fetchSectorMovements } from "@/lib/api";
import { StockSearchResult, TopMoversResponse, SectorMovement } from "@/types";

interface MarketScreenerProps {
  onOpenTechnicalDrawer: (ticker: string) => void;
  onOpenAddModalWithTicker?: (ticker: string, name: string, sector: string, price: number) => void;
}

export const MarketScreener: React.FC<MarketScreenerProps> = ({
  onOpenTechnicalDrawer,
  onOpenAddModalWithTicker,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<StockSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [topMovers, setTopMovers] = useState<TopMoversResponse | null>(null);
  const [sectors, setSectors] = useState<SectorMovement[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter Tabs: 'large' | 'mid' | 'small'
  const [selectedCap, setSelectedCap] = useState<"large" | "mid" | "small">("large");
  // Mover Tab: 'gainers' | 'losers'
  const [moverType, setMoverType] = useState<"gainers" | "losers">("gainers");

  useEffect(() => {
    loadMarketData();
  }, []);

  const loadMarketData = async () => {
    setLoading(true);
    try {
      const [moversData, sectorsData, initialSearch] = await Promise.all([
        fetchTopMovers(),
        fetchSectorMovements(),
        searchStocks("")
      ]);
      setTopMovers(moversData);
      setSectors(sectorsData);
      setSearchResults(initialSearch.slice(0, 8));
    } catch (err) {
      console.error("Error loading screener data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (!val.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await searchStocks(val);
      setSearchResults(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const currentMoversList = topMovers ? (
    selectedCap === "large"
      ? (moverType === "gainers" ? topMovers.large_cap_gainers : topMovers.large_cap_losers)
      : selectedCap === "mid"
      ? (moverType === "gainers" ? topMovers.mid_cap_gainers : topMovers.mid_cap_losers)
      : (moverType === "gainers" ? topMovers.small_cap_gainers : topMovers.small_cap_losers)
  ) : [];

  return (
    <div className="space-y-6">
      
      {/* 1. Groww-Like Real-Time Search Bar */}
      <div className="light-card rounded-2xl p-6 bg-gradient-to-r from-emerald-50/50 via-white to-indigo-50/50 border border-slate-200">
        <div className="max-w-2xl mx-auto space-y-3 text-center">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Groww-Style Real-Time Screener</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Discover Stocks, ETFs & Sector Trends
          </h2>
          <p className="text-xs text-slate-600">
            Real-time quotes, 130+ technical indicator scores, and cap-segmented market movements.
          </p>

          {/* Search Input Box */}
          <div className="relative mt-4">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search by stock name (e.g. Tata Motors, Reliance, Trent, CDSL)..."
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border-2 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-slate-900 font-medium text-sm outline-none shadow-sm transition-all"
            />
            {isSearching && (
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {/* Search Results Dropdown/Grid */}
          {searchQuery && searchResults.length > 0 && (
            <div className="mt-3 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden text-left divide-y divide-slate-100 max-h-96 overflow-y-auto z-30">
              {searchResults.map((stock) => (
                <div
                  key={stock.ticker}
                  className="p-3.5 hover:bg-slate-50 flex items-center justify-between transition-colors cursor-pointer"
                  onClick={() => onOpenTechnicalDrawer(stock.ticker)}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                      stock.day_change_pct >= 0 ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                    }`}>
                      {stock.ticker.slice(0, 3)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 text-sm">{stock.name}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                          {stock.market_cap_category}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">{stock.ticker} • {stock.sector}</div>
                    </div>
                  </div>

                  <div className="text-right flex items-center space-x-4">
                    <div>
                      <div className="font-extrabold text-slate-900 text-sm">₹{stock.current_price.toLocaleString("en-IN")}</div>
                      <div className={`text-xs font-semibold flex items-center justify-end ${
                        stock.day_change_pct >= 0 ? "text-emerald-600" : "text-rose-600"
                      }`}>
                        {stock.day_change_pct >= 0 ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
                        <span>{stock.day_change_pct >= 0 ? "+" : ""}{stock.day_change_pct}%</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenTechnicalDrawer(stock.ticker);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
                    >
                      Analyze
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. Top Gainers & Losers by Market Capitalization (Large / Mid / Small Cap) */}
      <div className="light-card rounded-2xl p-6 border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
              <Activity className="w-5 h-5 text-emerald-600" />
              <span>Top Market Movers of the Day</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live leaderboards filtered by company size (Large, Mid, and Small Cap)
            </p>
          </div>

          {/* Controls: Cap Selector & Gainers/Losers Toggle */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Large / Mid / Small Cap Filter */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold">
              <button
                onClick={() => setSelectedCap("large")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  selectedCap === "large" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Large Cap
              </button>
              <button
                onClick={() => setSelectedCap("mid")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  selectedCap === "mid" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Mid Cap
              </button>
              <button
                onClick={() => setSelectedCap("small")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  selectedCap === "small" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Small Cap
              </button>
            </div>

            {/* Gainers vs Losers Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold">
              <button
                onClick={() => setMoverType("gainers")}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  moverType === "gainers" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Top Gainers</span>
              </button>
              <button
                onClick={() => setMoverType("losers")}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  moverType === "losers" ? "bg-rose-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <TrendingDown className="w-3.5 h-3.5" />
                <span>Top Losers</span>
              </button>
            </div>

          </div>
        </div>

        {/* Movers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mt-5">
          {currentMoversList.map((stock) => {
            const isPositive = stock.day_change_pct >= 0;
            return (
              <div
                key={stock.ticker}
                onClick={() => onOpenTechnicalDrawer(stock.ticker)}
                className="light-card light-card-hover rounded-xl p-4 border border-slate-200/80 bg-white flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{stock.ticker.replace(".NS", "")}</span>
                    <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                      stock.badge === "HOLD" ? "badge-hold" : stock.badge === "SELL" ? "badge-sell" : "badge-swap"
                    }`}>
                      {stock.badge}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs mt-1 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                    {stock.name}
                  </h4>
                  <div className="text-[10px] text-slate-400 mt-0.5">{stock.sector}</div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-end justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 font-medium">Price</div>
                    <div className="font-extrabold text-slate-900 text-sm">₹{stock.current_price.toLocaleString("en-IN")}</div>
                  </div>
                  <div className={`text-xs font-bold px-2 py-0.5 rounded-md flex items-center ${
                    isPositive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                  }`}>
                    {isPositive ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
                    <span>{isPositive ? "+" : ""}{stock.day_change_pct}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Sectors & Movement of the Day */}
      <div className="light-card rounded-2xl p-6 border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              <span>Sectors & Movement of the Day</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time sector performance, advances vs declines, and top moving leaders across Indian markets
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
            12 Major NSE Indices
          </span>
        </div>

        {/* Sectors Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          {sectors.map((sec) => {
            const isGreen = sec.day_change_pct >= 0;
            const totalStocks = sec.advancing_count + sec.declining_count;
            const advanceRatio = totalStocks > 0 ? (sec.advancing_count / totalStocks) * 100 : 50;

            return (
              <div
                key={sec.sector_name}
                className="light-card light-card-hover rounded-xl p-4 border border-slate-200 bg-white flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 text-sm">{sec.sector_name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isGreen ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                    }`}>
                      {isGreen ? "+" : ""}{sec.day_change_pct}%
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
                    <span>Index: {sec.current_value.toLocaleString("en-IN")}</span>
                    <span className="text-[10px] text-slate-400">{sec.index_symbol}</span>
                  </div>

                  {/* Advances vs Declines Bar */}
                  <div className="mt-3 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500">
                      <span className="text-emerald-700 font-bold">{sec.advancing_count} Advancing</span>
                      <span className="text-rose-700 font-bold">{sec.declining_count} Declining</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-rose-100 overflow-hidden flex">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${advanceRatio}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Top Performer Stock */}
                <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-medium">Top Stock:</span>
                  <span className="font-bold text-slate-800">{sec.top_performer}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
