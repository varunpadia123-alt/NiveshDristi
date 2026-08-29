"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  X,
  TrendingUp,
  TrendingDown,
  Sparkles,
  BarChart2,
  Activity,
  Layers,
  Shield,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Sliders,
  FileText,
  PlusCircle,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  PieChart,
  Calendar,
  Newspaper,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Building,
  Globe,
  Info,
  DollarSign,
  Briefcase
} from "lucide-react";
import { 
  StockHistoryResponse, 
  StockHistoryPoint, 
  StockScreenerItem, 
  GrowwStockDetailResponse 
} from "@/types";
import { fetchStockHistory, fetchGrowwStockDetail } from "@/lib/api";

interface StockDetailModalProps {
  ticker: string | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenAiReport?: (ticker: string) => void;
  onOpenTechnicalDrawer?: (ticker: string) => void;
  onOpenAddHolding?: (ticker: string, name: string, sector: string, price: number) => void;
}

type TimeFrame = "1D" | "1W" | "1M" | "1Y" | "5Y" | "ALL";
type ChartType = "line" | "candle";
type DetailTab = "overview" | "fundamental" | "technical" | "events" | "news";

export const StockDetailModal: React.FC<StockDetailModalProps> = ({
  ticker,
  isOpen,
  onClose,
  onOpenAiReport,
  onOpenTechnicalDrawer,
  onOpenAddHolding
}) => {
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");
  const [timeframe, setTimeframe] = useState<TimeFrame>("1D");
  const [chartType, setChartType] = useState<ChartType>("line");
  const [historyData, setHistoryData] = useState<StockHistoryResponse | null>(null);
  const [growwDetail, setGrowwDetail] = useState<GrowwStockDetailResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Indicator Overlays
  const [showSma20, setShowSma20] = useState<boolean>(false);
  const [showSma50, setShowSma50] = useState<boolean>(false);
  const [showEma9, setShowEma9] = useState<boolean>(false);

  // Exchange Selection
  const [selectedExchange, setSelectedExchange] = useState<"NSE" | "BSE">("NSE");

  // Financials view toggle in Fundamental tab: 'quarterly' | 'annual'
  const [financialView, setFinancialView] = useState<"quarterly" | "annual">("quarterly");

  // Hover state on chart
  const [hoveredPoint, setHoveredPoint] = useState<StockHistoryPoint | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (isOpen && ticker) {
      loadData(ticker, timeframe);
    }
  }, [isOpen, ticker, timeframe]);

  const loadData = async (t: string, tf: TimeFrame) => {
    setLoading(true);
    setError(null);
    try {
      const [hist, detail] = await Promise.all([
        fetchStockHistory(t, tf),
        fetchGrowwStockDetail(t).catch(() => null)
      ]);
      setHistoryData(hist);
      setGrowwDetail(detail);
      if (detail?.exchange) {
        setSelectedExchange(detail.exchange as any);
      }
    } catch (err: any) {
      console.error("Error loading stock detail:", err);
      setError(err.message || "Failed to load stock data");
    } finally {
      setLoading(false);
    }
  };

  const currentPrice = growwDetail ? growwDetail.overview.current_price : historyData ? historyData.current_price : 0;
  const changePts = growwDetail ? growwDetail.overview.change_pts : historyData ? historyData.change_pts : 0;
  const changePct = growwDetail ? growwDetail.overview.day_change_pct : historyData ? historyData.day_change_pct : 0;
  const isPositive = changePct >= 0;

  const dayHigh = growwDetail?.overview.day_high || historyData?.day_high || currentPrice * 1.02;
  const dayLow = growwDetail?.overview.day_low || historyData?.day_low || currentPrice * 0.98;
  const week52High = growwDetail?.overview.fifty_two_week_high || historyData?.fifty_two_week_high || currentPrice * 1.35;
  const week52Low = growwDetail?.overview.fifty_two_week_low || historyData?.fifty_two_week_low || currentPrice * 0.68;

  // Day Range position percentage
  const daySpan = Math.max(dayHigh - dayLow, 0.01);
  const dayPosPct = Math.min(100, Math.max(0, ((currentPrice - dayLow) / daySpan) * 100));

  // 52W Range position percentage
  const yearSpan = Math.max(week52High - week52Low, 0.01);
  const yearPosPct = Math.min(100, Math.max(0, ((currentPrice - week52Low) / yearSpan) * 100));

  // SVG dimensions for chart
  const svgWidth = 800;
  const svgHeight = 360;
  const paddingLeft = 10;
  const paddingRight = 65;
  const paddingTop = 20;
  const paddingBottom = 45;
  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;
  const volumeHeight = 65;

  const candles = historyData?.candles || [];

  // Memoize price boundaries and scales
  const { minPrice, maxPrice, priceRange, maxVolume } = useMemo(() => {
    if (!candles || candles.length === 0) {
      return { minPrice: 0, maxPrice: 100, priceRange: 100, maxVolume: 1 };
    }
    const allPrices = candles.flatMap(c => [c.low, c.high, c.close]);
    const minP = Math.min(...allPrices) * 0.998;
    const maxP = Math.max(...allPrices) * 1.002;
    const pRange = Math.max(maxP - minP, 0.01);
    const maxV = Math.max(...candles.map(c => c.volume), 1);
    return { minPrice: minP, maxPrice: maxP, priceRange: pRange, maxVolume: maxV };
  }, [candles]);

  const getX = useMemo(() => {
    return (index: number) => {
      if (candles.length <= 1) return paddingLeft;
      return paddingLeft + (index / (candles.length - 1)) * chartWidth;
    };
  }, [candles.length, chartWidth]);

  const getY = useMemo(() => {
    return (val: number) => {
      return paddingTop + chartHeight - ((val - minPrice) / priceRange) * (chartHeight - volumeHeight - 10);
    };
  }, [minPrice, priceRange, chartHeight, volumeHeight]);

  // Memoize paths
  const { linePath, areaPath, sma20Path, sma50Path, ema9Path } = useMemo(() => {
    if (candles.length === 0) {
      return { linePath: "", areaPath: "", sma20Path: "", sma50Path: "", ema9Path: "" };
    }

    const lPath = candles.map((c, i) => {
      const x = getX(i);
      const y = getY(c.close);
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(" ");

    const aPath = `${lPath} L ${getX(candles.length - 1)} ${paddingTop + chartHeight} L ${getX(0)} ${paddingTop + chartHeight} Z`;

    const s20 = showSma20
      ? candles
          .map((c, i) => (c.sma_20 ? `${i === 0 || !candles[i - 1]?.sma_20 ? "M" : "L"} ${getX(i).toFixed(1)} ${getY(c.sma_20).toFixed(1)}` : ""))
          .filter(Boolean)
          .join(" ")
      : "";

    const s50 = showSma50
      ? candles
          .map((c, i) => (c.sma_50 ? `${i === 0 || !candles[i - 1]?.sma_50 ? "M" : "L"} ${getX(i).toFixed(1)} ${getY(c.sma_50).toFixed(1)}` : ""))
          .filter(Boolean)
          .join(" ")
      : "";

    const e9 = showEma9
      ? candles
          .map((c, i) => (c.ema_9 ? `${i === 0 || !candles[i - 1]?.ema_9 ? "M" : "L"} ${getX(i).toFixed(1)} ${getY(c.ema_9).toFixed(1)}` : ""))
          .filter(Boolean)
          .join(" ")
      : "";

    return { linePath: lPath, areaPath: aPath, sma20Path: s20, sma50Path: s50, ema9Path: e9 };
  }, [candles, getX, getY, showSma20, showSma50, showEma9, chartHeight]);

  const rafRef = useRef<number | null>(null);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svgRect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - svgRect.left;
    const clientY = e.clientY - svgRect.top;

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      if (clientX < paddingLeft || clientX > svgWidth - paddingRight || candles.length === 0) {
        setHoveredPoint(null);
        setHoverPos(null);
        return;
      }

      const relX = clientX - paddingLeft;
      const index = Math.min(
        candles.length - 1,
        Math.max(0, Math.round((relX / chartWidth) * (candles.length - 1)))
      );

      const point = candles[index];
      if (point) {
        setHoveredPoint(point);
        setHoverPos({ x: getX(index), y: getY(point.close) });
      }
    });
  };

  const handleMouseLeave = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    setHoveredPoint(null);
    setHoverPos(null);
  };

  const navTabs: { id: DetailTab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <BarChart2 className="w-4 h-4" /> },
    { id: "fundamental", label: "Fundamental", icon: <Building className="w-4 h-4" /> },
    { id: "technical", label: "Technical", icon: <Activity className="w-4 h-4" /> },
    { id: "events", label: "Events & Actions", icon: <Calendar className="w-4 h-4" /> },
    { id: "news", label: "News & Sentiment", icon: <Newspaper className="w-4 h-4" /> }
  ];

  if (!isOpen || !ticker) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden text-slate-900">
        
        {/* 1. Modal Top Bar Header */}
        <div className="p-5 sm:px-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-emerald-50/30 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm shadow-xs ${
              isPositive ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
            }`}>
              {ticker.replace(".NS", "").replace(".BO", "").slice(0, 3)}
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  {growwDetail?.name || historyData?.name || ticker}
                </h2>

                {/* BSE code tag */}
                {growwDetail?.bse_code && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-bold border border-slate-200">
                    BSE #{growwDetail.bse_code}
                  </span>
                )}

                {/* Cap Category */}
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {growwDetail?.cap_type || "EQUITY"}
                </span>

                {/* Live Market Hours Indicator */}
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1 ${
                  growwDetail?.is_market_open 
                    ? "bg-emerald-100 text-emerald-800 animate-pulse" 
                    : "bg-slate-100 text-slate-600"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${growwDetail?.is_market_open ? "bg-emerald-600" : "bg-slate-400"}`}></span>
                  <span>{growwDetail?.is_market_open ? "Live (IST)" : "Market Closed"}</span>
                </span>
              </div>

              <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium mt-0.5">
                <span className="font-bold text-slate-700">{ticker}</span>
                <span>•</span>
                <span>{growwDetail?.sector || "Equities"}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Dual Exchange Switcher */}
            {growwDetail?.bse_code && (
              <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-black">
                <button
                  onClick={() => setSelectedExchange("NSE")}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    selectedExchange === "NSE" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  NSE
                </button>
                <button
                  onClick={() => setSelectedExchange("BSE")}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    selectedExchange === "BSE" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  BSE
                </button>
              </div>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-2xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. Groww 5-Tab Navigation Bar */}
        <div className="px-6 border-b border-slate-200 bg-white flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
          <div className="flex items-center space-x-1 sm:space-x-2">
            {navTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-3.5 px-3 sm:px-4 text-xs font-extrabold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-emerald-600 text-emerald-700 bg-emerald-50/40"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Live Price Header Snippet on right */}
          <div className="text-right py-2 hidden sm:block">
            <div className="font-extrabold text-slate-900 text-base font-mono">
              ₹{currentPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <div className={`text-xs font-bold flex items-center justify-end ${
              isPositive ? "text-emerald-600" : "text-rose-600"
            }`}>
              {isPositive ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
              <span>{isPositive ? "+" : ""}{changePts.toFixed(2)} ({isPositive ? "+" : ""}{changePct.toFixed(2)}%)</span>
            </div>
          </div>
        </div>

        {/* 3. Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <div className="w-9 h-9 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-slate-500 font-bold">Streaming real-time metrics & financial records...</p>
            </div>
          ) : error ? (
            <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-3">
              <p className="text-sm font-bold text-rose-800">{error}</p>
              <button
                onClick={() => loadData(ticker, timeframe)}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold cursor-pointer"
              >
                Retry Loading
              </button>
            </div>
          ) : (
            <>
              {/* ======================================================== */}
              {/* TAB 1: OVERVIEW */}
              {/* ======================================================== */}
              {activeTab === "overview" && (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* Price Banner & Timeframe Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-baseline space-x-2.5">
                        <span className="text-3xl font-black text-slate-900 font-mono tracking-tight">
                          ₹{currentPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </span>
                        <span className={`text-sm font-black px-2.5 py-0.5 rounded-lg flex items-center ${
                          isPositive ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                        }`}>
                          {isPositive ? <ArrowUpRight className="w-4 h-4 mr-0.5" /> : <ArrowDownRight className="w-4 h-4 mr-0.5" />}
                          <span>{isPositive ? "+" : ""}{changePts.toFixed(2)} ({isPositive ? "+" : ""}{changePct.toFixed(2)}%)</span>
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">
                        {hoveredPoint ? `Inspecting: ${hoveredPoint.date} — ₹${hoveredPoint.close.toFixed(2)}` : "Live closing / streaming price (NSE Spot)"}
                      </p>
                    </div>

                    {/* Chart Controls: Timeframes & Type */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Timeframe Selector */}
                      <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-extrabold">
                        {(["1D", "1W", "1M", "1Y", "5Y", "ALL"] as TimeFrame[]).map((tf) => (
                          <button
                            key={tf}
                            onClick={() => setTimeframe(tf)}
                            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                              timeframe === tf ? "bg-white text-slate-900 shadow-xs font-black" : "text-slate-500 hover:text-slate-900"
                            }`}
                          >
                            {tf}
                          </button>
                        ))}
                      </div>

                      {/* Chart Type Toggle */}
                      <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-extrabold">
                        <button
                          onClick={() => setChartType("line")}
                          className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                            chartType === "line" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
                          }`}
                        >
                          Line
                        </button>
                        <button
                          onClick={() => setChartType("candle")}
                          className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                            chartType === "candle" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
                          }`}
                        >
                          Candles
                        </button>
                      </div>

                      {/* Indicator Overlays */}
                      <div className="flex items-center space-x-1 text-[11px] font-bold">
                        <button
                          onClick={() => setShowSma20(!showSma20)}
                          className={`px-2 py-1 rounded-lg border transition cursor-pointer ${
                            showSma20 ? "bg-blue-100 text-blue-900 border-blue-300 font-black" : "bg-white text-slate-600 border-slate-200"
                          }`}
                        >
                          SMA 20
                        </button>
                        <button
                          onClick={() => setShowSma50(!showSma50)}
                          className={`px-2 py-1 rounded-lg border transition cursor-pointer ${
                            showSma50 ? "bg-amber-100 text-amber-900 border-amber-300 font-black" : "bg-white text-slate-600 border-slate-200"
                          }`}
                        >
                          SMA 50
                        </button>
                        <button
                          onClick={() => setShowEma9(!showEma9)}
                          className={`px-2 py-1 rounded-lg border transition cursor-pointer ${
                            showEma9 ? "bg-purple-100 text-purple-900 border-purple-300 font-black" : "bg-white text-slate-600 border-slate-200"
                          }`}
                        >
                          EMA 9
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Interactive SVG Chart Box (Optimized 60+ FPS & Theme Color) */}
                  <div className="relative w-full h-80 rounded-2xl bg-slate-950/90 border border-slate-800/80 p-2 overflow-hidden shadow-inner select-none backdrop-blur-xs">
                    <svg
                      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                      className="w-full h-full"
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseLeave}
                    >
                      <defs>
                        <linearGradient id="detailGradientGreen" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.30" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                        </linearGradient>
                        <linearGradient id="detailGradientRed" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.30" />
                          <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Grid Lines */}
                      {[0, 0.25, 0.5, 0.75, 1].map((p, idx) => {
                        const yVal = minPrice + p * priceRange;
                        const yPos = getY(yVal);
                        return (
                          <g key={`grid-${idx}`}>
                            <line
                              x1={paddingLeft}
                              y1={yPos}
                              x2={svgWidth - paddingRight}
                              y2={yPos}
                              stroke="#1e293b"
                              strokeDasharray="3 3"
                              strokeOpacity="0.8"
                            />
                            <text
                              x={svgWidth - paddingRight + 6}
                              y={yPos + 4}
                              fontSize="10"
                              fill="#94a3b8"
                              fontFamily="monospace"
                            >
                              ₹{yVal.toFixed(1)}
                            </text>
                          </g>
                        );
                      })}

                      {/* Volume Bars */}
                      <g opacity="0.3">
                        {candles.map((c, i) => {
                          const x = getX(i);
                          const barH = (c.volume / maxVolume) * volumeHeight;
                          const y = paddingTop + chartHeight - barH;
                          const barColor = c.close >= c.open ? "#10b981" : "#f43f5e";
                          const barW = Math.max(1.5, chartWidth / candles.length - 1.2);
                          return (
                            <rect
                              key={`vol-${i}`}
                              x={x - barW / 2}
                              y={y}
                              width={barW}
                              height={barH}
                              fill={barColor}
                            />
                          );
                        })}
                      </g>

                      {/* Line Chart Path */}
                      {chartType === "line" && (
                        <>
                          <path
                            d={areaPath}
                            fill={isPositive ? "url(#detailGradientGreen)" : "url(#detailGradientRed)"}
                          />
                          <path
                            d={linePath}
                            fill="none"
                            stroke={isPositive ? "#10b981" : "#f43f5e"}
                            strokeWidth="2.2"
                            strokeLinecap="round"
                          />
                        </>
                      )}

                      {/* Candlestick Rendering */}
                      {chartType === "candle" && (
                        <g>
                          {candles.map((c, i) => {
                            const x = getX(i);
                            const topY = getY(Math.max(c.open, c.close));
                            const botY = getY(Math.min(c.open, c.close));
                            const highY = getY(c.high);
                            const lowY = getY(c.low);
                            const bodyH = Math.max(1.5, botY - topY);
                            const barColor = c.close >= c.open ? "#10b981" : "#f43f5e";
                            const barW = Math.max(2.5, chartWidth / candles.length - 1.5);

                            return (
                              <g key={`candle-${i}`}>
                                <line x1={x} y1={highY} x2={x} y2={lowY} stroke={barColor} strokeWidth="1.2" />
                                <rect x={x - barW / 2} y={topY} width={barW} height={bodyH} fill={barColor} rx="0.5" />
                              </g>
                            );
                          })}
                        </g>
                      )}

                      {/* Overlay Indicators */}
                      {showSma20 && sma20Path && <path d={sma20Path} fill="none" stroke="#3b82f6" strokeWidth="1.8" strokeDasharray="3 3" />}
                      {showSma50 && sma50Path && <path d={sma50Path} fill="none" stroke="#f59e0b" strokeWidth="1.8" strokeDasharray="3 3" />}
                      {showEma9 && ema9Path && <path d={ema9Path} fill="none" stroke="#a855f7" strokeWidth="1.8" />}

                      {/* Crosshair on Hover */}
                      {hoverPos && (
                        <g>
                          <line x1={hoverPos.x} y1={paddingTop} x2={hoverPos.x} y2={paddingTop + chartHeight} stroke="#94a3b8" strokeDasharray="3 3" />
                          <line x1={paddingLeft} y1={hoverPos.y} x2={svgWidth - paddingRight} y2={hoverPos.y} stroke="#94a3b8" strokeDasharray="3 3" />
                          <circle cx={hoverPos.x} cy={hoverPos.y} r="4.5" fill={isPositive ? "#10b981" : "#f43f5e"} stroke="#ffffff" strokeWidth="2" />
                        </g>
                      )}

                      {/* Date Labels on X Axis */}
                      {candles.length > 0 && [0, Math.floor(candles.length / 4), Math.floor(candles.length / 2), Math.floor((3 * candles.length) / 4), candles.length - 1].map((idx) => {
                        if (!candles[idx]) return null;
                        return (
                          <text key={idx} x={getX(idx)} y={svgHeight - 12} fontSize="9.5" fill="#64748b" textAnchor="middle">
                            {candles[idx].date}
                          </text>
                        );
                      })}
                    </svg>
                  </div>

                  {/* Groww Signature Performance Range Sliders */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Today's Low / High */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-600 mb-2">
                        <span>Today's Low: <b className="text-slate-900 font-mono">₹{dayLow.toFixed(2)}</b></span>
                        <span>Today's High: <b className="text-slate-900 font-mono">₹{dayHigh.toFixed(2)}</b></span>
                      </div>
                      <div className="relative w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="absolute top-0 bottom-0 bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-500 rounded-full w-full"></div>
                      </div>
                      <div className="relative mt-1">
                        <div className="absolute -top-3.5 -translate-x-1/2 flex flex-col items-center" style={{ left: `${dayPosPct}%` }}>
                          <div className="w-2.5 h-2.5 bg-slate-900 rounded-full border-2 border-white shadow-xs"></div>
                          <span className="text-[9px] font-black font-mono text-slate-800 mt-0.5">₹{currentPrice.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* 52-Week Low / High */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-600 mb-2">
                        <span>52W Low: <b className="text-slate-900 font-mono">₹{week52Low.toFixed(2)}</b></span>
                        <span>52W High: <b className="text-slate-900 font-mono">₹{week52High.toFixed(2)}</b></span>
                      </div>
                      <div className="relative w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="absolute top-0 bottom-0 bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-500 rounded-full w-full"></div>
                      </div>
                      <div className="relative mt-1">
                        <div className="absolute -top-3.5 -translate-x-1/2 flex flex-col items-center" style={{ left: `${yearPosPct}%` }}>
                          <div className="w-2.5 h-2.5 bg-slate-900 rounded-full border-2 border-white shadow-xs"></div>
                          <span className="text-[9px] font-black font-mono text-slate-800 mt-0.5">₹{currentPrice.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Market Stats & Circuit Limits */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[11px] text-slate-500 font-semibold">Open Price</div>
                      <div className="text-sm font-extrabold text-slate-900 mt-0.5 font-mono">
                        ₹{(growwDetail?.overview.open || currentPrice * 0.99).toFixed(2)}
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[11px] text-slate-500 font-semibold">Prev. Close</div>
                      <div className="text-sm font-extrabold text-slate-900 mt-0.5 font-mono">
                        ₹{(growwDetail?.overview.prev_close || currentPrice).toFixed(2)}
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[11px] text-slate-500 font-semibold">Lower Circuit (-20%)</div>
                      <div className="text-sm font-extrabold text-rose-600 mt-0.5 font-mono">
                        ₹{(growwDetail?.overview.lower_circuit || currentPrice * 0.8).toFixed(2)}
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[11px] text-slate-500 font-semibold">Upper Circuit (+20%)</div>
                      <div className="text-sm font-extrabold text-emerald-600 mt-0.5 font-mono">
                        ₹{(growwDetail?.overview.upper_circuit || currentPrice * 1.2).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* 5-Level Live Market Depth */}
                  {growwDetail?.overview.market_depth && (
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                          <Activity className="w-3.5 h-3.5 text-indigo-600" />
                          <span>5-Level Market Depth (Order Book)</span>
                        </h4>
                        <span className="text-[10px] text-slate-500 font-semibold">
                          Total Buy: <b className="text-emerald-700 font-mono">{growwDetail.overview.market_depth.total_buy_qty.toLocaleString("en-IN")}</b> | Total Sell: <b className="text-rose-700 font-mono">{growwDetail.overview.market_depth.total_sell_qty.toLocaleString("en-IN")}</b>
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                        {/* Buy Depth */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold text-slate-400 pb-1 border-b border-slate-100">
                            <span>ORDERS</span>
                            <span>BUY QTY</span>
                            <span>BID (₹)</span>
                          </div>
                          {growwDetail.overview.market_depth.buy_depth.map((d, i) => (
                            <div key={`buy-${i}`} className="flex justify-between text-emerald-700 font-medium py-0.5">
                              <span className="text-slate-400">{d.orders}</span>
                              <span>{d.quantity.toLocaleString("en-IN")}</span>
                              <span className="font-bold">₹{d.price.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>

                        {/* Sell Depth */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold text-slate-400 pb-1 border-b border-slate-100">
                            <span>ASK (₹)</span>
                            <span>SELL QTY</span>
                            <span>ORDERS</span>
                          </div>
                          {growwDetail.overview.market_depth.sell_depth.map((d, i) => (
                            <div key={`sell-${i}`} className="flex justify-between text-rose-700 font-medium py-0.5">
                              <span className="font-bold">₹{d.price.toFixed(2)}</span>
                              <span>{d.quantity.toLocaleString("en-IN")}</span>
                              <span className="text-slate-400">{d.orders}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Company Profile */}
                  {growwDetail?.overview.profile && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-700" />
                        <span>About {growwDetail.name}</span>
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {growwDetail.overview.profile.about}
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] border-t border-slate-200">
                        <div><span className="text-slate-400 font-medium">Managing Director / CEO:</span> <b className="text-slate-800">{growwDetail.overview.profile.ceo}</b></div>
                        <div><span className="text-slate-400 font-medium">Headquarters:</span> <b className="text-slate-800">{growwDetail.overview.profile.headquarters}</b></div>
                        <div><span className="text-slate-400 font-medium">Founded:</span> <b className="text-slate-800">{growwDetail.overview.profile.founded_year}</b></div>
                        <div><span className="text-slate-400 font-medium">ISIN:</span> <b className="text-slate-800 font-mono">{growwDetail.overview.profile.isin}</b></div>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 2: FUNDAMENTALS */}
              {/* ======================================================== */}
              {activeTab === "fundamental" && growwDetail?.fundamental && (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* Valuation & Key Ratios Grid */}
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
                      <Briefcase className="w-4 h-4 text-emerald-600" />
                      <span>Key Financial & Valuation Ratios</span>
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-[11px] text-slate-500 font-semibold">Market Cap</div>
                        <div className="text-sm font-extrabold text-slate-900 mt-0.5 font-mono">
                          ₹{growwDetail.fundamental.market_cap_cr.toLocaleString("en-IN")} Cr
                        </div>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-[11px] text-slate-500 font-semibold">P/E Ratio (TTM)</div>
                        <div className="text-sm font-extrabold text-slate-900 mt-0.5 font-mono">
                          {growwDetail.fundamental.pe_ratio.toFixed(1)}x
                        </div>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-[11px] text-slate-500 font-semibold">Industry P/E</div>
                        <div className="text-sm font-extrabold text-slate-900 mt-0.5 font-mono">
                          {growwDetail.fundamental.industry_pe.toFixed(1)}x
                        </div>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-[11px] text-slate-500 font-semibold">P/B Ratio</div>
                        <div className="text-sm font-extrabold text-slate-900 mt-0.5 font-mono">
                          {growwDetail.fundamental.pb_ratio.toFixed(2)}x
                        </div>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-[11px] text-slate-500 font-semibold">Debt to Equity</div>
                        <div className="text-sm font-extrabold text-slate-900 mt-0.5 font-mono">
                          {growwDetail.fundamental.debt_to_equity.toFixed(2)}
                        </div>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-[11px] text-slate-500 font-semibold">ROE (%)</div>
                        <div className="text-sm font-extrabold text-emerald-700 mt-0.5 font-mono">
                          {growwDetail.fundamental.roe_pct.toFixed(1)}%
                        </div>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-[11px] text-slate-500 font-semibold">ROCE (%)</div>
                        <div className="text-sm font-extrabold text-emerald-700 mt-0.5 font-mono">
                          {growwDetail.fundamental.roce_pct.toFixed(1)}%
                        </div>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-[11px] text-slate-500 font-semibold">EPS (TTM)</div>
                        <div className="text-sm font-extrabold text-slate-900 mt-0.5 font-mono">
                          ₹{growwDetail.fundamental.eps_ttm.toFixed(2)}
                        </div>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-[11px] text-slate-500 font-semibold">Dividend Yield</div>
                        <div className="text-sm font-extrabold text-slate-900 mt-0.5 font-mono">
                          {growwDetail.fundamental.dividend_yield_pct.toFixed(2)}%
                        </div>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-[11px] text-slate-500 font-semibold">Book Value / Share</div>
                        <div className="text-sm font-extrabold text-slate-900 mt-0.5 font-mono">
                          ₹{growwDetail.fundamental.book_value.toFixed(2)}
                        </div>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-[11px] text-slate-500 font-semibold">Face Value</div>
                        <div className="text-sm font-extrabold text-slate-900 mt-0.5 font-mono">
                          ₹{growwDetail.fundamental.face_value.toFixed(1)}
                        </div>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-[11px] text-slate-500 font-semibold">Beta (5Y)</div>
                        <div className="text-sm font-extrabold text-slate-900 mt-0.5 font-mono">
                          {growwDetail.fundamental.beta.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Financial Statement Breakdown (Quarterly vs Annual) */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                          Financial Performance & Growth
                        </h4>
                        <p className="text-[11px] text-slate-500">Revenue, Net Profit & Operating Margins (OPM %)</p>
                      </div>

                      {/* Quarterly / Annual Switch */}
                      <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold">
                        <button
                          onClick={() => setFinancialView("quarterly")}
                          className={`px-3 py-1 rounded-lg transition ${
                            financialView === "quarterly" ? "bg-white text-slate-900 shadow-xs font-black" : "text-slate-500"
                          }`}
                        >
                          Quarterly
                        </button>
                        <button
                          onClick={() => setFinancialView("annual")}
                          className={`px-3 py-1 rounded-lg transition ${
                            financialView === "annual" ? "bg-white text-slate-900 shadow-xs font-black" : "text-slate-500"
                          }`}
                        >
                          Annual
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {(financialView === "quarterly" ? growwDetail.fundamental.quarterly_financials : growwDetail.fundamental.annual_financials).map((item, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                          <div className="text-xs font-black text-slate-800 border-b border-slate-200 pb-1">{item.period}</div>
                          <div className="text-[11px] text-slate-500 flex justify-between">
                            <span>Revenue:</span>
                            <b className="text-slate-900 font-mono">₹{item.revenue_cr.toLocaleString("en-IN")} Cr</b>
                          </div>
                          <div className="text-[11px] text-slate-500 flex justify-between">
                            <span>Net Profit:</span>
                            <b className="text-emerald-700 font-mono">₹{item.net_profit_cr.toLocaleString("en-IN")} Cr</b>
                          </div>
                          <div className="text-[11px] text-slate-500 flex justify-between">
                            <span>OPM %:</span>
                            <b className="text-indigo-700 font-mono">{item.opm_pct}%</b>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shareholding Pattern */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                      <PieChart className="w-4 h-4 text-purple-600" />
                      <span>Shareholding Pattern</span>
                    </h4>
                    <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden flex shadow-inner">
                      <div style={{ width: `${growwDetail.fundamental.shareholding.promoters_pct}%` }} className="bg-indigo-600 h-full" title="Promoters"></div>
                      <div style={{ width: `${growwDetail.fundamental.shareholding.fii_pct}%` }} className="bg-emerald-500 h-full" title="FIIs"></div>
                      <div style={{ width: `${growwDetail.fundamental.shareholding.dii_pct}%` }} className="bg-amber-500 h-full" title="DIIs"></div>
                      <div style={{ width: `${growwDetail.fundamental.shareholding.retail_public_pct}%` }} className="bg-slate-400 h-full" title="Retail"></div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs font-semibold">
                      <div className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span><span>Promoters: <b>{growwDetail.fundamental.shareholding.promoters_pct}%</b></span></div>
                      <div className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span><span>FIIs: <b>{growwDetail.fundamental.shareholding.fii_pct}%</b></span></div>
                      <div className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span><span>DIIs: <b>{growwDetail.fundamental.shareholding.dii_pct}%</b></span></div>
                      <div className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span><span>Public & Retail: <b>{growwDetail.fundamental.shareholding.retail_public_pct}%</b></span></div>
                    </div>
                  </div>

                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 3: TECHNICAL */}
              {/* ======================================================== */}
              {activeTab === "technical" && growwDetail?.technical && (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* Technical Summary Meter Gauge */}
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400">
                        Algorithmic Signal Verdict
                      </span>
                      <h3 className="text-2xl font-black mt-0.5 text-white flex items-center space-x-2">
                        <span>{growwDetail.technical.summary_verdict}</span>
                      </h3>
                      <p className="text-xs text-slate-300 mt-1">
                        Aggregated analysis across {growwDetail.technical.moving_averages.length} Moving Averages and {growwDetail.technical.oscillators.length} Momentum Oscillators.
                      </p>
                    </div>

                    <div className="flex items-center space-x-3 text-center font-mono">
                      <div className="px-3.5 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
                        <div className="text-lg font-black text-emerald-400">{growwDetail.technical.bullish_count}</div>
                        <div className="text-[10px] font-bold text-emerald-300 uppercase">Bullish</div>
                      </div>
                      <div className="px-3.5 py-2 rounded-xl bg-slate-500/20 border border-slate-500/30">
                        <div className="text-lg font-black text-slate-300">{growwDetail.technical.neutral_count}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Neutral</div>
                      </div>
                      <div className="px-3.5 py-2 rounded-xl bg-rose-500/20 border border-rose-500/30">
                        <div className="text-lg font-black text-rose-400">{growwDetail.technical.bearish_count}</div>
                        <div className="text-[10px] font-bold text-rose-300 uppercase">Bearish</div>
                      </div>
                    </div>
                  </div>

                  {/* Oscillators Matrix */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                      Momentum Oscillators
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {growwDetail.technical.oscillators.map((osc, i) => (
                        <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                          <div>
                            <div className="text-xs font-bold text-slate-800">{osc.name}</div>
                            <div className="text-sm font-extrabold text-slate-900 font-mono mt-0.5">{osc.value}</div>
                          </div>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase ${
                            osc.signal === "BULLISH" ? "bg-emerald-100 text-emerald-800" : osc.signal === "BEARISH" ? "bg-rose-100 text-rose-800" : "bg-slate-200 text-slate-700"
                          }`}>
                            {osc.action}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Moving Averages Matrix */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                      Moving Averages (SMA & EMA Alignment)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
                      {growwDetail.technical.moving_averages.map((ma, i) => (
                        <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold text-slate-700">{ma.period}</span>
                            <div className="text-slate-900 font-extrabold">₹{ma.value.toFixed(2)}</div>
                          </div>
                          <div className="text-right">
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${
                              ma.signal === "BULLISH" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                            }`}>
                              {ma.signal}
                            </span>
                            <div className="text-[10px] text-slate-400 mt-0.5 font-sans">{ma.price_action}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pivot Points Analysis */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                      Pivot Points & Support / Resistance Levels
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-7 gap-2 text-center text-xs font-mono">
                      <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200"><span className="text-[10px] text-rose-600 font-bold block">S3</span><b>₹{growwDetail.technical.classic_pivots.s3}</b></div>
                      <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200"><span className="text-[10px] text-rose-600 font-bold block">S2</span><b>₹{growwDetail.technical.classic_pivots.s2}</b></div>
                      <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200"><span className="text-[10px] text-rose-600 font-bold block">S1</span><b>₹{growwDetail.technical.classic_pivots.s1}</b></div>
                      <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200"><span className="text-[10px] text-indigo-600 font-bold block">PIVOT</span><b>₹{growwDetail.technical.classic_pivots.pivot}</b></div>
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200"><span className="text-[10px] text-emerald-600 font-bold block">R1</span><b>₹{growwDetail.technical.classic_pivots.r1}</b></div>
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200"><span className="text-[10px] text-emerald-600 font-bold block">R2</span><b>₹{growwDetail.technical.classic_pivots.r2}</b></div>
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200"><span className="text-[10px] text-emerald-600 font-bold block">R3</span><b>₹{growwDetail.technical.classic_pivots.r3}</b></div>
                    </div>
                  </div>

                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 4: EVENTS & ACTIONS */}
              {/* ======================================================== */}
              {activeTab === "events" && growwDetail?.events && (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* Dividends */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                      <span>Dividend History & Announcements</span>
                    </h4>
                    <div className="divide-y divide-slate-100">
                      {growwDetail.events.dividends.map((div, i) => (
                        <div key={i} className="py-3 flex items-center justify-between text-xs">
                          <div>
                            <div className="font-extrabold text-slate-900">{div.dividend_type}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">Ex-Date: {div.ex_date} | Record Date: {div.record_date}</div>
                          </div>
                          <div className="text-right font-mono">
                            <span className="font-black text-emerald-700 text-sm">₹{div.dividend_amount.toFixed(2)}/share</span>
                            <div className="text-[10px] text-slate-400">Yield: {div.yield_pct}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bonus & Splits */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                      <Layers className="w-4 h-4 text-indigo-600" />
                      <span>Bonus Issues & Stock Splits</span>
                    </h4>
                    <div className="divide-y divide-slate-100">
                      {growwDetail.events.bonus_splits.map((bs, i) => (
                        <div key={i} className="py-3 flex items-center justify-between text-xs">
                          <div>
                            <div className="font-extrabold text-slate-900">{bs.event_type}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">Ex-Date: {bs.ex_date} | Record Date: {bs.record_date}</div>
                          </div>
                          <span className="font-black px-3 py-1 rounded-xl bg-purple-50 text-purple-800 border border-purple-200 font-mono text-sm">
                            Ratio: {bs.ratio}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Board Meetings */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                      <Calendar className="w-4 h-4 text-amber-600" />
                      <span>Board Meetings & Financial Calendar</span>
                    </h4>
                    <div className="divide-y divide-slate-100">
                      {growwDetail.events.board_meetings.map((bm, i) => (
                        <div key={i} className="py-3 flex items-center justify-between text-xs">
                          <div>
                            <div className="font-extrabold text-slate-900">{bm.purpose}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">Meeting Date: {bm.meeting_date}</div>
                          </div>
                          <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase ${
                            bm.status === "UPCOMING" ? "bg-amber-100 text-amber-900 animate-pulse" : "bg-slate-100 text-slate-700"
                          }`}>
                            {bm.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 5: NEWS & SENTIMENT */}
              {/* ======================================================== */}
              {activeTab === "news" && growwDetail?.news && (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* FinBERT Scorecard Banner */}
                  <div className="p-5 rounded-2xl bg-slate-900 text-white shadow-lg flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400">
                        FinBERT NLP Sentiment Score
                      </span>
                      <h3 className="text-2xl font-black mt-0.5 flex items-center space-x-2">
                        <span>{growwDetail.news.sentiment_label}</span>
                        <span className="text-xs font-mono text-slate-300">({growwDetail.news.finbert_sentiment_score > 0 ? "+" : ""}{growwDetail.news.finbert_sentiment_score})</span>
                      </h3>
                      <p className="text-xs text-slate-300 mt-1">{growwDetail.news.headline}</p>
                    </div>

                    <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black">
                      AI Verified
                    </span>
                  </div>

                  {/* News Articles Feed */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                      Latest Corporate News & Institutional Research
                    </h4>
                    <div className="space-y-3">
                      {growwDetail.news.articles.map((art, idx) => (
                        <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition shadow-xs space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-500">{art.source} • {art.published_at}</span>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                              art.sentiment === "BULLISH" ? "bg-emerald-100 text-emerald-800" : art.sentiment === "BEARISH" ? "bg-rose-100 text-rose-800" : "bg-slate-100 text-slate-700"
                            }`}>
                              {art.sentiment}
                            </span>
                          </div>
                          <h5 className="font-extrabold text-slate-900 text-sm leading-snug">{art.title}</h5>
                          <p className="text-xs text-slate-600">{art.summary}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* Modal Actions Footer */}
              <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  {onOpenTechnicalDrawer && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenTechnicalDrawer(ticker);
                      }}
                      className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer"
                    >
                      <Activity className="w-3.5 h-3.5 text-emerald-600" />
                      <span>130+ Technical Indicators</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {onOpenAddHolding && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenAddHolding(
                          ticker,
                          growwDetail?.name || historyData?.name || ticker,
                          growwDetail?.sector || "Equities",
                          currentPrice
                        );
                      }}
                      className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Add to Portfolio</span>
                    </button>
                  )}

                  {onOpenAiReport && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenAiReport(ticker);
                      }}
                      className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md shadow-emerald-600/20 transition active:scale-95 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Deep AI Stock Analysis</span>
                    </button>
                  )}
                </div>
              </div>

            </>
          )}
        </div>

      </div>
    </div>
  );
};
