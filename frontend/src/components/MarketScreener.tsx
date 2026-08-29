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
  Plus,
  Building2,
  RefreshCw
} from "lucide-react";
import { searchStocks, fetchTopMovers, fetchSectorMovements } from "@/lib/api";
import { StockSearchResult, TopMoversResponse, SectorMovement } from "@/types";

interface MarketScreenerProps {
  onOpenStockDetail?: (ticker: string) => void;
  onOpenTechnicalDrawer: (ticker: string) => void;
  onOpenAiReport?: (ticker: string) => void;
  onOpenAddModalWithTicker?: (ticker: string, name: string, sector: string, price: number) => void;
}

export const MarketScreener: React.FC<MarketScreenerProps> = ({
  onOpenStockDetail,
  onOpenTechnicalDrawer,
  onOpenAiReport,
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
  // Exchange Filter: 'ALL' | 'DUAL' | 'BSE_ONLY'
  const [exchangeFilter, setExchangeFilter] = useState<"ALL" | "DUAL" | "BSE_ONLY">("ALL");
  // Stock-specific exchange selection mapping: { [ticker]: "NSE" | "BSE" }
  const [selectedExchanges, setSelectedExchanges] = useState<Record<string, "NSE" | "BSE">>({});

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
      setSearchResults(initialSearch.slice(0, 10));
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
      const initial = await searchStocks("");
      setSearchResults(initial.slice(0, 10));
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

  const toggleStockExchange = (e: React.MouseEvent, ticker: string, targetExchange: "NSE" | "BSE") => {
    e.stopPropagation();
    setSelectedExchanges(prev => ({
      ...prev,
      [ticker]: targetExchange
    }));
  };

  const currentMoversList = topMovers ? (
    selectedCap === "large"
      ? (moverType === "gainers" ? (topMovers.largecap_gainers || topMovers.large_cap_gainers || []) : (topMovers.largecap_losers || topMovers.large_cap_losers || []))
      : selectedCap === "mid"
      ? (moverType === "gainers" ? (topMovers.midcap_gainers || topMovers.mid_cap_gainers || []) : (topMovers.midcap_losers || topMovers.mid_cap_losers || []))
      : (moverType === "gainers" ? (topMovers.smallcap_gainers || topMovers.small_cap_gainers || []) : (topMovers.smallcap_losers || topMovers.small_cap_losers || []))
  ) : [];

  const filteredSearchResults = searchResults.filter(s => {
    if (exchangeFilter === "BSE_ONLY") return s.bse_only;
    if (exchangeFilter === "DUAL") return !s.bse_only && s.bse_code;
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* 1. Groww-Like Real-Time Search Bar */}
      <div className="light-card rounded-2xl p-6 bg-gradient-to-r from-emerald-50/50 via-white to-indigo-50/50 border border-slate-200">
        <div className="max-w-3xl mx-auto space-y-3 text-center">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Groww-Style Real-Time Screener</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Discover 120+ Indian Stocks Across NSE & BSE
          </h2>
          <p className="text-xs text-slate-600 font-medium">
            Live prices, dual exchange switching (NSE / BSE), BSE-only exclusive equities, and sector trends.
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
              placeholder="Search by name, NSE ticker, or BSE code (e.g. Tata Motors, 500570, Bombay Dyeing, Trent)..."
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border-2 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-slate-900 font-medium text-sm outline-none shadow-sm transition-all"
            />
            {isSearching && (
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {/* Exchange Filter Tabs */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {[
              { id: "ALL", label: "All Stocks (120+)" },
              { id: "DUAL", label: "NSE & BSE Dual Listed" },
              { id: "BSE_ONLY", label: "BSE Exclusive Only" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setExchangeFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  exchangeFilter === tab.id
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Results Dropdown/Grid */}
          {filteredSearchResults.length > 0 && (
            <div className="mt-3 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden text-left divide-y divide-slate-100 max-h-96 overflow-y-auto z-30">
              {filteredSearchResults.map((stock) => {
                const activeEx = selectedExchanges[stock.ticker] || stock.exchange || "NSE";
                const displayPrice = activeEx === "BSE" && stock.bse_price ? stock.bse_price : stock.current_price;
                const isPositive = stock.day_change_pct >= 0;

                return (
                  <div
                    key={stock.ticker}
                    className="p-3.5 hover:bg-slate-50 flex items-center justify-between transition-colors cursor-pointer"
                    onClick={() => {
                      if (onOpenStockDetail) onOpenStockDetail(stock.ticker);
                      else onOpenTechnicalDrawer(stock.ticker);
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                        isPositive ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                      }`}>
                        {stock.ticker.slice(0, 3)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900 text-sm">{stock.name}</span>
                          
                          {/* BSE Exclusive or Cap Badge */}
                          {stock.bse_only ? (
                            <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 border border-purple-200">
                              BSE Exclusive
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 uppercase">
                              {stock.cap_type}
                            </span>
                          )}
                        </div>
                        
                        <div className="text-xs text-slate-500 mt-0.5 flex items-center space-x-2">
                          <span className="font-bold text-slate-700">{stock.ticker}</span>
                          {stock.bse_code && (
                            <span className="text-slate-400 font-mono">BSE: {stock.bse_code}</span>
                          )}
                          <span>•</span>
                          <span>{stock.sector}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex items-center space-x-3">
                      {/* Exchange Switcher for Dual-Listed Stocks */}
                      {!stock.bse_only && stock.bse_code && (
                        <div className="flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-[10px] font-black">
                          <button
                            onClick={(e) => toggleStockExchange(e, stock.ticker, "NSE")}
                            className={`px-2 py-0.5 rounded-md transition ${
                              activeEx === "NSE" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
                            }`}
                          >
                            NSE
                          </button>
                          <button
                            onClick={(e) => toggleStockExchange(e, stock.ticker, "BSE")}
                            className={`px-2 py-0.5 rounded-md transition ${
                              activeEx === "BSE" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
                            }`}
                          >
                            BSE
                          </button>
                        </div>
                      )}

                      <div>
                        <div className="font-extrabold text-slate-900 text-sm font-mono">
                          ₹{displayPrice.toLocaleString("en-IN")}
                        </div>
                        <div className={`text-xs font-bold flex items-center justify-end ${
                          isPositive ? "text-emerald-600" : "text-rose-600"
                        }`}>
                          {isPositive ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
                          <span>{isPositive ? "+" : ""}{stock.day_change_pct}%</span>
                        </div>
                      </div>

                      {onOpenAiReport && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenAiReport(stock.ticker);
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                          title="Open AI Stock Analyst Report"
                        >
                          AI Report
                        </button>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onOpenStockDetail) onOpenStockDetail(stock.ticker);
                          else onOpenTechnicalDrawer(stock.ticker);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Chart
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 2. Top Gainers & Losers by Market Capitalization (Large / Mid / Small Cap) */}
      <div className="light-card rounded-2xl p-6 border border-slate-200 bg-white">
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
          {(currentMoversList || []).map((stock) => {
            const isPositive = stock.day_change_pct >= 0;
            const activeEx = selectedExchanges[stock.ticker] || stock.exchange || "NSE";
            const displayPrice = activeEx === "BSE" && stock.bse_price ? stock.bse_price : stock.current_price;

            return (
              <div
                key={stock.ticker}
                onClick={() => {
                  if (onOpenStockDetail) onOpenStockDetail(stock.ticker);
                  else onOpenTechnicalDrawer(stock.ticker);
                }}
                className="light-card light-card-hover rounded-xl p-4 border border-slate-200/80 bg-white flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      {stock.ticker.replace(".NS", "").replace(".BO", "")}
                    </span>
                    
                    {/* Exchange Tag or Switcher */}
                    {stock.bse_only ? (
                      <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-900">
                        BSE
                      </span>
                    ) : stock.bse_code ? (
                      <div className="flex items-center p-0.5 rounded-md bg-slate-100 text-[9px] font-bold">
                        <span 
                          onClick={(e) => toggleStockExchange(e, stock.ticker, "NSE")}
                          className={`px-1 rounded ${activeEx === "NSE" ? "bg-white text-slate-900 font-black shadow-xs" : "text-slate-400"}`}
                        >
                          NSE
                        </span>
                        <span 
                          onClick={(e) => toggleStockExchange(e, stock.ticker, "BSE")}
                          className={`px-1 rounded ${activeEx === "BSE" ? "bg-white text-slate-900 font-black shadow-xs" : "text-slate-400"}`}
                        >
                          BSE
                        </span>
                      </div>
                    ) : null}
                  </div>

                  <h4 className="font-bold text-slate-900 text-xs mt-1.5 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                    {stock.name}
                  </h4>
                  <div className="text-[10px] text-slate-400 mt-0.5 flex items-center justify-between">
                    <span>{stock.sector}</span>
                    {stock.bse_code && <span className="font-mono">#{stock.bse_code}</span>}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-end justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 font-medium">Price ({activeEx})</div>
                    <div className="font-extrabold text-slate-900 text-sm font-mono">
                      ₹{displayPrice.toLocaleString("en-IN")}
                    </div>
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
      <div className="light-card rounded-2xl p-6 border border-slate-200 bg-white">
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
            const chg = sec.change_pct ?? sec.day_change_pct ?? 0;
            const isGreen = chg >= 0;
            const adv = sec.advances ?? sec.advancing_count ?? 10;
            const dec = sec.declines ?? sec.declining_count ?? 5;
            const totalStocks = adv + dec;
            const advanceRatio = totalStocks > 0 ? (adv / totalStocks) * 100 : 50;

            return (
              <div
                key={sec.sector || sec.sector_name || sec.index_name}
                className="light-card light-card-hover rounded-xl p-4 border border-slate-200 bg-white flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 text-sm">{sec.sector || sec.sector_name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isGreen ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                    }`}>
                      {isGreen ? "+" : ""}{chg}%
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
                    <span className="font-semibold">{sec.index_name}</span>
                    <span className="text-[10px] text-emerald-600 font-bold">{sec.top_performer}</span>
                  </div>

                  {/* Advances vs Declines Bar */}
                  <div className="mt-3 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500">
                      <span className="text-emerald-700 font-bold">{adv} Advancing</span>
                      <span className="text-rose-700 font-bold">{dec} Declining</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-rose-100 overflow-hidden flex">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${advanceRatio}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
