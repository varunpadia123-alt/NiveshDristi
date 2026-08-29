"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
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
  RefreshCw,
  ArrowUpDown,
  Filter,
  Eye,
  Check,
  X
} from "lucide-react";
import { 
  fetchScreenerStocks, 
  fetchTopMovers, 
  fetchSectorMovements 
} from "@/lib/api";
import { 
  StockScreenerItem, 
  TopMoversResponse, 
  SectorMovement, 
  ScreenerResponse 
} from "@/types";

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
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [screenerData, setScreenerData] = useState<ScreenerResponse | null>(null);
  const [allStocksCache, setAllStocksCache] = useState<StockScreenerItem[]>([]);
  const [topMovers, setTopMovers] = useState<TopMoversResponse | null>(null);
  const [sectors, setSectors] = useState<SectorMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Screener Filters
  const [selectedSector, setSelectedSector] = useState<string>("all");
  const [selectedCap, setSelectedCap] = useState<string>("all");
  const [exchangeFilter, setExchangeFilter] = useState<"ALL" | "DUAL" | "BSE_ONLY">("ALL");
  const [sortBy, setSortBy] = useState<string>("gain_to_loss");

  // Top Movers Section Tabs
  const [moversCap, setMoversCap] = useState<"large" | "mid" | "small">("large");
  const [moverType, setMoverType] = useState<"gainers" | "losers">("gainers");

  // Stock-specific exchange selection mapping: { [ticker]: "NSE" | "BSE" }
  const [selectedExchanges, setSelectedExchanges] = useState<Record<string, "NSE" | "BSE">>({});

  const stockListRef = useRef<HTMLDivElement>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    loadAllData();
  }, [selectedSector, selectedCap, exchangeFilter, sortBy, debouncedQuery]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [screenerRes, moversData, sectorsData] = await Promise.all([
        fetchScreenerStocks({
          sector: selectedSector === "all" || debouncedQuery.trim().length > 0 ? undefined : selectedSector,
          cap_type: selectedCap === "all" ? undefined : selectedCap,
          exchange_type: exchangeFilter === "BSE_ONLY" ? "bse_only" : exchangeFilter === "DUAL" ? "dual" : "all",
          sort_by: sortBy,
          q: debouncedQuery.trim()
        }),
        fetchTopMovers().catch(() => null),
        fetchSectorMovements().catch(() => [])
      ]);
      setScreenerData(screenerRes);
      if (screenerRes?.stocks && allStocksCache.length === 0) {
        setAllStocksCache(screenerRes.stocks);
      }
      if (moversData) setTopMovers(moversData);
      if (sectorsData) setSectors(sectorsData);
    } catch (err) {
      console.error("Error loading screener data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await loadAllData();
    setIsRefreshing(false);
  };

  const toggleStockExchange = (e: React.MouseEvent, ticker: string, targetExchange: "NSE" | "BSE") => {
    e.stopPropagation();
    setSelectedExchanges(prev => ({
      ...prev,
      [ticker]: targetExchange
    }));
  };

  const handleSelectSector = (secName: string) => {
    setSelectedSector(secName);
    setSearchQuery("");
    if (stockListRef.current) {
      stockListRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const currentMoversList = topMovers ? (
    moversCap === "large"
      ? (moverType === "gainers" ? (topMovers.largecap_gainers || topMovers.large_cap_gainers || []) : (topMovers.largecap_losers || topMovers.large_cap_losers || []))
      : moversCap === "mid"
      ? (moverType === "gainers" ? (topMovers.midcap_gainers || topMovers.mid_cap_gainers || []) : (topMovers.midcap_losers || topMovers.mid_cap_losers || []))
      : (moverType === "gainers" ? (topMovers.smallcap_gainers || topMovers.small_cap_gainers || []) : (topMovers.smallcap_losers || topMovers.small_cap_losers || []))
  ) : [];

  // Instant client-side fallback if data already in state
  const displayedStocks = useMemo(() => {
    const rawList = screenerData?.stocks || [];
    if (!searchQuery.trim()) return rawList;

    const q = searchQuery.trim().toLowerCase();
    return rawList.filter((s) => {
      const tickerClean = s.ticker.replace(".NS", "").replace(".BO", "").toLowerCase();
      return (
        tickerClean.includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.sector.toLowerCase().includes(q) ||
        (s.bse_code && s.bse_code.toLowerCase().includes(q))
      );
    });
  }, [screenerData, searchQuery]);

  const availableSectors = screenerData?.available_sectors || [
    "IT Services", "Banking", "Energy", "Automobile", "Consumer Goods",
    "Healthcare", "Metals", "Infrastructure", "Defense & Capital Goods",
    "Telecom", "Finance & Lending", "Realty", "Textiles & Chemicals"
  ];

  return (
    <div className="space-y-6">
      
      {/* 1. Header & Real-Time Search Bar */}
      <div className="light-card rounded-3xl p-6 bg-gradient-to-r from-emerald-50/70 via-white to-indigo-50/70 border border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto space-y-4 text-center">
          
          <div className="flex items-center justify-center space-x-2">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Real-Time Indian Market Screener</span>
            </div>

            {/* Live Streaming Badge */}
            <div className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              screenerData?.is_market_open
                ? "bg-emerald-600 text-white shadow-xs animate-pulse"
                : "bg-slate-200 text-slate-700"
            }`}>
              <span className={`w-2 h-2 rounded-full ${screenerData?.is_market_open ? "bg-white" : "bg-slate-400"}`}></span>
              <span>{screenerData?.is_market_open ? "🟢 Market Open (IST Live)" : "⚪ Market Closed"}</span>
            </div>

            <button
              onClick={handleManualRefresh}
              className={`p-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition cursor-pointer shadow-xs ${
                isRefreshing ? "animate-spin text-emerald-600" : ""
              }`}
              title="Refresh Live Quotes"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Discover 120+ Indian Stocks Across All Sectors
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-2xl mx-auto">
            Live real-time prices, dual exchange switching (NSE & BSE), sector exploration, and automatic sorting from top gainers to biggest losers.
          </p>

          {/* Real-time Search Input Box */}
          <div className="relative max-w-2xl mx-auto mt-2">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by stock name, NSE ticker, or BSE code (e.g. Reliance, 500325, TCS, Tata Motors, Trent)..."
              className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-white border-2 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-slate-900 font-medium text-sm outline-none shadow-sm transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {searchQuery && (
            <div className="text-xs text-emerald-700 font-bold flex items-center justify-center space-x-1">
              <span>Searching all sectors for: &ldquo;{searchQuery}&rdquo;</span>
              <button onClick={() => setSearchQuery("")} className="underline text-slate-500 hover:text-slate-800 ml-1 cursor-pointer">
                Clear search
              </button>
            </div>
          )}

        </div>
      </div>

      {/* 2. Top Movers Leaderboard (Large / Mid / Small Cap) */}
      <div className="light-card rounded-2xl p-6 border border-slate-200 bg-white shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
              <Activity className="w-5 h-5 text-emerald-600" />
              <span>Top Market Movers Today</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live leaderboards categorized by Large, Mid, and Small Cap equities
            </p>
          </div>

          {/* Controls: Cap Selector & Gainers/Losers Toggle */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Cap Filter */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-extrabold">
              <button
                onClick={() => setMoversCap("large")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  moversCap === "large" ? "bg-white text-slate-900 shadow-xs font-black" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Large Cap
              </button>
              <button
                onClick={() => setMoversCap("mid")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  moversCap === "mid" ? "bg-white text-slate-900 shadow-xs font-black" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Mid Cap
              </button>
              <button
                onClick={() => setMoversCap("small")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  moversCap === "small" ? "bg-white text-slate-900 shadow-xs font-black" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Small Cap
              </button>
            </div>

            {/* Gainers vs Losers Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-extrabold">
              <button
                onClick={() => setMoverType("gainers")}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  moverType === "gainers" ? "bg-emerald-600 text-white shadow-xs font-black" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Top Gainers</span>
              </button>
              <button
                onClick={() => setMoverType("losers")}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  moverType === "losers" ? "bg-rose-600 text-white shadow-xs font-black" : "text-slate-600 hover:text-slate-900"
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
                className="light-card light-card-hover rounded-xl p-4 border border-slate-200 bg-white flex flex-col justify-between cursor-pointer group shadow-xs hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider font-mono">
                      {stock.ticker.replace(".NS", "").replace(".BO", "")}
                    </span>
                    
                    {stock.bse_only ? (
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-900 border border-purple-200">
                        BSE Only
                      </span>
                    ) : stock.bse_code ? (
                      <div className="flex items-center p-0.5 rounded-md bg-slate-100 text-[9px] font-black">
                        <span 
                          onClick={(e) => toggleStockExchange(e, stock.ticker, "NSE")}
                          className={`px-1.5 py-0.5 rounded ${activeEx === "NSE" ? "bg-white text-slate-900 shadow-xs" : "text-slate-400"}`}
                        >
                          NSE
                        </span>
                        <span 
                          onClick={(e) => toggleStockExchange(e, stock.ticker, "BSE")}
                          className={`px-1.5 py-0.5 rounded ${activeEx === "BSE" ? "bg-white text-slate-900 shadow-xs" : "text-slate-400"}`}
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
                      ₹{displayPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className={`text-xs font-black px-2 py-0.5 rounded-md flex items-center ${
                    isPositive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                  }`}>
                    {isPositive ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
                    <span>{isPositive ? "+" : ""}{stock.day_change_pct.toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Sectors & Movement of the Day (Clickable to Filter Screener) */}
      <div className="light-card rounded-2xl p-6 border border-slate-200 bg-white shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              <span>Sectors & Movement of the Day</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any sector to instantly view all stocks in that sector below, sorted from gainers to losers
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
            {sectors.length} Major Sectors
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
            const isCurrentActive = selectedSector.toLowerCase() === sec.sector.toLowerCase();

            return (
              <div
                key={sec.sector || sec.index_name}
                onClick={() => handleSelectSector(sec.sector)}
                className={`light-card rounded-2xl p-4 border transition-all cursor-pointer flex flex-col justify-between group ${
                  isCurrentActive 
                    ? "border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20 shadow-md" 
                    : "border-slate-200 bg-white hover:border-emerald-300 hover:shadow-sm"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-black text-slate-900 text-sm group-hover:text-emerald-700 transition">
                      {sec.sector}
                    </span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      isGreen ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                    }`}>
                      {isGreen ? "+" : ""}{chg.toFixed(2)}%
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
                    <span className="font-semibold">{sec.index_name}</span>
                    <span className="text-[10px] text-emerald-600 font-bold">{sec.top_performer}</span>
                  </div>

                  {/* Advances vs Declines Bar */}
                  <div className="mt-3 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                      <span className="text-emerald-700">{adv} Advancing</span>
                      <span className="text-rose-700">{dec} Declining</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-rose-100 overflow-hidden flex">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${advanceRatio}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-emerald-700">
                  <span>View all {sec.sector} stocks</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Complete Sector Stocks Screener Section (With Gain-to-Loss Sorting) */}
      <div ref={stockListRef} className="light-card rounded-2xl p-6 border border-slate-200 bg-white shadow-xs space-y-5">
        
        {/* Section Header with Sort & Filter Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-black text-slate-900">
                {searchQuery ? `Search Results for "${searchQuery}"` : selectedSector === "all" ? "All Sector Stocks" : `${selectedSector} Stocks`}
              </h3>
              <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {displayedStocks.length} Stocks Listed
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any stock to open the full Groww-style 5-Tab Deep Stock Analysis (Overview, Fundamental, Technical, Events, News)
            </p>
          </div>

          {/* Sort & Filter Controls Bar */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Cap Filter */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold">
              {[
                { id: "all", label: "All Cap" },
                { id: "largecap", label: "Large" },
                { id: "midcap", label: "Mid" },
                { id: "smallcap", label: "Small" },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCap(c.id)}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    selectedCap === c.id ? "bg-white text-slate-900 shadow-xs font-black" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Exchange Filter */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold">
              {[
                { id: "ALL", label: "All" },
                { id: "DUAL", label: "NSE & BSE" },
                { id: "BSE_ONLY", label: "BSE Only" },
              ].map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => setExchangeFilter(ex.id as any)}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    exchangeFilter === ex.id ? "bg-white text-slate-900 shadow-xs font-black" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {ex.label}
                </button>
              ))}
            </div>

            {/* Sort Dropdown Selector */}
            <div className="flex items-center space-x-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs font-bold">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-slate-900 font-extrabold pr-2 py-1 outline-none cursor-pointer"
              >
                <option value="gain_to_loss">📈 Day Change: Gainers to Losers</option>
                <option value="loss_to_gain">📉 Day Change: Losers to Gainers</option>
                <option value="market_cap">💰 Market Cap: High to Low</option>
                <option value="price_high_low">🏷️ Price: High to Low</option>
                <option value="price_low_high">🏷️ Price: Low to High</option>
                <option value="name">🔤 Company Name: A to Z</option>
              </select>
            </div>

          </div>
        </div>

        {/* Sector Navigation Pill Carousel */}
        {!searchQuery && (
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedSector("all")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer whitespace-nowrap ${
                selectedSector === "all"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
              }`}
            >
              All Sectors ({screenerData?.total_stocks || 120})
            </button>
            {availableSectors.map((sec) => (
              <button
                key={sec}
                onClick={() => setSelectedSector(sec)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer whitespace-nowrap ${
                  selectedSector.toLowerCase() === sec.toLowerCase()
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                }`}
              >
                {sec}
              </button>
            ))}
          </div>
        )}

        {/* Stock List Grid */}
        {loading ? (
          <div className="py-16 text-center space-y-2">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-500 font-bold">Streaming real-time sector quotes...</p>
          </div>
        ) : displayedStocks.length === 0 ? (
          <div className="py-12 text-center text-slate-500 font-bold text-xs space-y-2">
            <p>No stocks found matching the active filter or search criteria.</p>
            <button
              onClick={() => {
                setSelectedSector("all");
                setSelectedCap("all");
                setExchangeFilter("ALL");
                setSearchQuery("");
              }}
              className="px-4 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-black cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedStocks.map((stock) => {
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
                  className="light-card rounded-2xl p-4 border border-slate-200 hover:border-emerald-400 bg-white hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    {/* Header line */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-extrabold text-slate-900 text-sm group-hover:text-emerald-700 transition">
                            {stock.name}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center space-x-2 font-medium">
                          <span className="font-bold text-slate-700 font-mono">{stock.ticker}</span>
                          {stock.bse_code && <span className="text-slate-400 font-mono">BSE: #{stock.bse_code}</span>}
                          <span>•</span>
                          <span>{stock.sector}</span>
                        </div>
                      </div>

                      {/* Cap / BSE Only Badge */}
                      {stock.bse_only ? (
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 border border-purple-200">
                          BSE Exclusive
                        </span>
                      ) : (
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {stock.cap_type}
                        </span>
                      )}
                    </div>

                    {/* Quick Fundamental Badges */}
                    <div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-500 font-mono">
                      <div>
                        <span className="text-slate-400 block font-sans">Mkt Cap:</span>
                        <b className="text-slate-800">₹{(stock.market_cap_cr / 1000).toFixed(1)}k Cr</b>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-sans">P/E Ratio:</span>
                        <b className="text-slate-800">{stock.pe_ratio.toFixed(1)}x</b>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-sans">Beta:</span>
                        <b className="text-slate-800">{stock.beta.toFixed(2)}</b>
                      </div>
                    </div>
                  </div>

                  {/* Price & Actions Line */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      {/* Dual Exchange Switcher */}
                      {!stock.bse_only && stock.bse_code && (
                        <div className="flex items-center p-0.5 rounded-md bg-slate-100 text-[9px] font-black w-fit mb-1">
                          <span 
                            onClick={(e) => toggleStockExchange(e, stock.ticker, "NSE")}
                            className={`px-1.5 py-0.5 rounded cursor-pointer ${activeEx === "NSE" ? "bg-white text-slate-900 shadow-xs" : "text-slate-400"}`}
                          >
                            NSE
                          </span>
                          <span 
                            onClick={(e) => toggleStockExchange(e, stock.ticker, "BSE")}
                            className={`px-1.5 py-0.5 rounded cursor-pointer ${activeEx === "BSE" ? "bg-white text-slate-900 shadow-xs" : "text-slate-400"}`}
                          >
                            BSE
                          </span>
                        </div>
                      )}

                      <div className="text-base font-black text-slate-900 font-mono">
                        ₹{displayPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end">
                      <div className={`text-xs font-black px-2.5 py-1 rounded-lg flex items-center ${
                        isPositive ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                      }`}>
                        {isPositive ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
                        <span>{isPositive ? "+" : ""}{stock.day_change_pct.toFixed(2)}%</span>
                      </div>

                      <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {isPositive ? "+" : ""}₹{stock.change_pts.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Hover Quick Action Buttons */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onOpenStockDetail) onOpenStockDetail(stock.ticker);
                        else onOpenTechnicalDrawer(stock.ticker);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold transition cursor-pointer flex items-center space-x-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Groww View</span>
                    </button>

                    {onOpenAiReport && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenAiReport(stock.ticker);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold transition cursor-pointer"
                      >
                        AI Report
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenTechnicalDrawer(stock.ticker);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold transition cursor-pointer"
                    >
                      Tech Drawer
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
};
