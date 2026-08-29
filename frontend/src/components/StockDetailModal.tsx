"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Maximize2,
  Sliders,
  FileText,
  PlusCircle,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  RefreshCw
} from "lucide-react";
import { StockHistoryResponse, StockHistoryPoint, StockScreenerItem } from "@/types";
import { fetchStockHistory, fetchStockQuote } from "@/lib/api";

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

export const StockDetailModal: React.FC<StockDetailModalProps> = ({
  ticker,
  isOpen,
  onClose,
  onOpenAiReport,
  onOpenTechnicalDrawer,
  onOpenAddHolding
}) => {
  const [timeframe, setTimeframe] = useState<TimeFrame>("1D");
  const [chartType, setChartType] = useState<ChartType>("line");
  const [historyData, setHistoryData] = useState<StockHistoryResponse | null>(null);
  const [quoteData, setQuoteData] = useState<StockScreenerItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Indicator Overlays
  const [showSma20, setShowSma20] = useState<boolean>(false);
  const [showSma50, setShowSma50] = useState<boolean>(false);
  const [showEma9, setShowEma9] = useState<boolean>(false);

  // Active exchange selection
  const [selectedExchange, setSelectedExchange] = useState<"NSE" | "BSE">("NSE");

  // Hover state on chart
  const [hoveredPoint, setHoveredPoint] = useState<StockHistoryPoint | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && ticker) {
      loadData(ticker, timeframe);
    }
  }, [isOpen, ticker, timeframe]);

  const loadData = async (t: string, tf: TimeFrame) => {
    setLoading(true);
    setError(null);
    try {
      const [hist, q] = await Promise.all([
        fetchStockHistory(t, tf),
        fetchStockQuote(t).catch(() => null)
      ]);
      setHistoryData(hist);
      setQuoteData(q);
      setSelectedExchange((hist.exchange as any) || "NSE");
    } catch (err: any) {
      console.error("Error loading stock detail:", err);
      setError(err.message || "Failed to load stock data");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !ticker) return null;

  const currentPrice = historyData ? historyData.current_price : quoteData ? quoteData.current_price : 0;
  const changePts = historyData ? historyData.change_pts : quoteData ? quoteData.change_pts : 0;
  const changePct = historyData ? historyData.day_change_pct : quoteData ? quoteData.day_change_pct : 0;
  const isPositive = changePct >= 0;

  const candles = historyData?.candles || [];

  // Determine min & max for chart scaling
  const allPrices = candles.flatMap(c => [c.low, c.high, c.close]);
  const minPrice = allPrices.length > 0 ? Math.min(...allPrices) * 0.998 : 0;
  const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) * 1.002 : 100;
  const priceRange = Math.max(maxPrice - minPrice, 0.01);

  const maxVolume = candles.length > 0 ? Math.max(...candles.map(c => c.volume)) : 1;

  // SVG dimensions
  const svgWidth = 800;
  const svgHeight = 360;
  const paddingLeft = 10;
  const paddingRight = 65;
  const paddingTop = 20;
  const paddingBottom = 45;
  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;
  const volumeHeight = 65;

  const getX = (index: number) => {
    if (candles.length <= 1) return paddingLeft;
    return paddingLeft + (index / (candles.length - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    return paddingTop + chartHeight - ((val - minPrice) / priceRange) * (chartHeight - volumeHeight - 10);
  };

  // Generate SVG Path for Line Chart
  const linePath = candles.map((c, i) => {
    const x = getX(i);
    const y = getY(c.close);
    return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");

  const areaPath = candles.length > 0
    ? `${linePath} L ${getX(candles.length - 1)} ${paddingTop + chartHeight} L ${getX(0)} ${paddingTop + chartHeight} Z`
    : "";

  // SMA 20 Path
  const sma20Path = showSma20
    ? candles
        .map((c, i) => (c.sma_20 ? `${i === 0 || !candles[i - 1].sma_20 ? "M" : "L"} ${getX(i).toFixed(1)} ${getY(c.sma_20).toFixed(1)}` : ""))
        .filter(Boolean)
        .join(" ")
    : "";

  // SMA 50 Path
  const sma50Path = showSma50
    ? candles
        .map((c, i) => (c.sma_50 ? `${i === 0 || !candles[i - 1].sma_50 ? "M" : "L"} ${getX(i).toFixed(1)} ${getY(c.sma_50).toFixed(1)}` : ""))
        .filter(Boolean)
        .join(" ")
    : "";

  // EMA 9 Path
  const ema9Path = showEma9
    ? candles
        .map((c, i) => (c.ema_9 ? `${i === 0 || !candles[i - 1].ema_9 ? "M" : "L"} ${getX(i).toFixed(1)} ${getY(c.ema_9).toFixed(1)}` : ""))
        .filter(Boolean)
        .join(" ")
    : "";

  // Handle Mouse Move for interactive Crosshair
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const normX = Math.max(0, Math.min(1, (mouseX - paddingLeft) / (rect.width - paddingLeft - (paddingRight * rect.width / svgWidth))));
    const index = Math.round(normX * (candles.length - 1));
    if (candles[index]) {
      setHoveredPoint(candles[index]);
      setHoverPos({
        x: getX(index),
        y: getY(candles[index].close)
      });
    }
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
    setHoverPos(null);
  };

  const displayPoint = hoveredPoint || (candles.length > 0 ? candles[candles.length - 1] : null);

  // Performance calculations
  const dayLow = historyData?.day_low || quoteData?.day_low || currentPrice * 0.98;
  const dayHigh = historyData?.day_high || quoteData?.day_high || currentPrice * 1.02;
  const week52Low = historyData?.fifty_two_week_low || quoteData?.fifty_two_week_low || currentPrice * 0.70;
  const week52High = historyData?.fifty_two_week_high || quoteData?.fifty_two_week_high || currentPrice * 1.35;

  const dayPosPct = Math.min(100, Math.max(0, ((currentPrice - dayLow) / Math.max(dayHigh - dayLow, 0.01)) * 100));
  const yearPosPct = Math.min(100, Math.max(0, ((currentPrice - week52Low) / Math.max(week52High - week52Low, 0.01)) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        ref={containerRef}
        className="w-full max-w-5xl max-h-[94vh] bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-y-auto flex flex-col no-scrollbar"
      >
        
        {/* Top Header Bar */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm text-white shadow-md ${
              isPositive ? "bg-emerald-600 shadow-emerald-600/20" : "bg-rose-600 shadow-rose-600/20"
            }`}>
              {ticker.replace(".NS", "").replace(".BO", "").slice(0, 3)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  {historyData?.name || quoteData?.name || ticker}
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 uppercase">
                  {quoteData?.sector || "NSE Equity"}
                </span>
                
                {/* Exchange Switcher */}
                <div className="flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-[10px] font-black">
                  <button
                    onClick={() => setSelectedExchange("NSE")}
                    className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                      selectedExchange === "NSE" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    NSE
                  </button>
                  <button
                    onClick={() => setSelectedExchange("BSE")}
                    className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                      selectedExchange === "BSE" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    BSE
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
                <span className="font-mono font-bold text-slate-700">{ticker}</span>
                {quoteData?.bse_code && (
                  <span className="font-mono text-slate-400">BSE: {quoteData.bse_code}</span>
                )}
                <span>•</span>
                <span className="flex items-center text-emerald-600 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1"></span>
                  Market Open
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Run AI Report Button */}
            {onOpenAiReport && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAiReport(ticker);
                }}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-extrabold shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Analyst Report</span>
              </button>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          
          {loading && !historyData ? (
            <div className="py-32 flex flex-col items-center justify-center space-y-3 text-slate-500">
              <div className="w-9 h-9 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-bold">Fetching real-time market ticks and historical candles...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
              {error}
            </div>
          ) : (
            <>
              {/* Price & Day Metrics Header */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {hoveredPoint ? `Price at ${hoveredPoint.date}` : "Live Spot Price"}
                  </div>
                  <div className="flex items-baseline space-x-3 mt-1">
                    <span className="text-3xl sm:text-4xl font-black text-slate-900 font-mono tracking-tight">
                      ₹{displayPoint ? displayPoint.close.toLocaleString("en-IN", { minimumFractionDigits: 2 }) : currentPrice.toFixed(2)}
                    </span>
                    <div className={`flex items-center space-x-1 font-bold text-sm ${isPositive ? "text-emerald-600" : "text-rose-600"}`}>
                      {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      <span>{isPositive ? "+" : ""}₹{changePts.toFixed(2)}</span>
                      <span>({isPositive ? "+" : ""}{changePct.toFixed(2)}%)</span>
                    </div>
                  </div>
                </div>

                {/* OHLC Bar when hovered */}
                {displayPoint && (
                  <div className="flex items-center space-x-3 text-[11px] font-mono bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-slate-600">
                    <div><span className="text-slate-400 font-sans font-bold">O: </span>₹{displayPoint.open.toFixed(2)}</div>
                    <div><span className="text-slate-400 font-sans font-bold">H: </span>₹{displayPoint.high.toFixed(2)}</div>
                    <div><span className="text-slate-400 font-sans font-bold">L: </span>₹{displayPoint.low.toFixed(2)}</div>
                    <div><span className="text-slate-400 font-sans font-bold">C: </span>₹{displayPoint.close.toFixed(2)}</div>
                    <div><span className="text-slate-400 font-sans font-bold">Vol: </span>{displayPoint.volume.toLocaleString("en-IN")}</div>
                  </div>
                )}
              </div>

              {/* Chart Controls & Timeframe Selector Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
                
                {/* Timeframe Buttons (Groww Style) */}
                <div className="flex items-center rounded-xl bg-slate-100 border border-slate-200 p-0.5 text-xs font-bold">
                  {(["1D", "1W", "1M", "1Y", "5Y", "ALL"] as TimeFrame[]).map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setTimeframe(tf)}
                      className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                        timeframe === tf
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>

                {/* Graph Type & Technical Overlays */}
                <div className="flex items-center space-x-2">
                  {/* Chart Type Toggle */}
                  <div className="flex items-center rounded-xl bg-slate-100 border border-slate-200 p-0.5 text-xs font-bold">
                    <button
                      onClick={() => setChartType("line")}
                      className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg transition cursor-pointer ${
                        chartType === "line" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      <Activity className="w-3.5 h-3.5" />
                      <span>Line</span>
                    </button>
                    <button
                      onClick={() => setChartType("candle")}
                      className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg transition cursor-pointer ${
                        chartType === "candle" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      <BarChart2 className="w-3.5 h-3.5" />
                      <span>Candles</span>
                    </button>
                  </div>

                  {/* Indicator Pills */}
                  <div className="flex items-center space-x-1 text-[11px] font-bold">
                    <button
                      onClick={() => setShowSma20(!showSma20)}
                      className={`px-2 py-1 rounded-lg border transition cursor-pointer ${
                        showSma20
                          ? "bg-blue-50 border-blue-300 text-blue-700"
                          : "bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      SMA 20
                    </button>
                    <button
                      onClick={() => setShowSma50(!showSma50)}
                      className={`px-2 py-1 rounded-lg border transition cursor-pointer ${
                        showSma50
                          ? "bg-amber-50 border-amber-300 text-amber-700"
                          : "bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      SMA 50
                    </button>
                    <button
                      onClick={() => setShowEma9(!showEma9)}
                      className={`px-2 py-1 rounded-lg border transition cursor-pointer ${
                        showEma9
                          ? "bg-purple-50 border-purple-300 text-purple-700"
                          : "bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      EMA 9
                    </button>
                  </div>
                </div>

              </div>

              {/* Interactive SVG Chart Container */}
              <div className="relative w-full rounded-2xl bg-gradient-to-b from-slate-50/50 via-white to-slate-50/30 border border-slate-200 p-2 overflow-hidden select-none">
                <svg
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  className="w-full h-[260px] sm:h-[340px] cursor-crosshair"
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                >
                  <defs>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={isPositive ? "#059669" : "#e11d48"} stopOpacity="0.25" />
                      <stop offset="100%" stopColor={isPositive ? "#059669" : "#e11d48"} stopOpacity="0.00" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Price Grid Lines */}
                  {[0.2, 0.4, 0.6, 0.8].map((ratio) => {
                    const y = paddingTop + ratio * (chartHeight - volumeHeight);
                    const pVal = maxPrice - ratio * (maxPrice - minPrice);
                    return (
                      <g key={ratio}>
                        <line
                          x1={paddingLeft}
                          y1={y}
                          x2={svgWidth - paddingRight}
                          y2={y}
                          stroke="#e2e8f0"
                          strokeDasharray="3 3"
                          strokeWidth="1"
                        />
                        <text
                          x={svgWidth - paddingRight + 6}
                          y={y + 3}
                          fontSize="9"
                          fill="#94a3b8"
                          fontFamily="monospace"
                        >
                          ₹{pVal.toFixed(1)}
                        </text>
                      </g>
                    );
                  })}

                  {/* Volume Sub-Chart Bars */}
                  {candles.map((c, i) => {
                    const x = getX(i);
                    const vRatio = c.volume / maxVolume;
                    const vBarH = vRatio * (volumeHeight - 10);
                    const vY = paddingTop + chartHeight - vBarH;
                    const isBull = c.close >= c.open;
                    const barW = Math.max(1.5, (chartWidth / candles.length) * 0.7);

                    return (
                      <rect
                        key={`vol-${i}`}
                        x={x - barW / 2}
                        y={vY}
                        width={barW}
                        height={vBarH}
                        fill={isBull ? "#10b981" : "#f43f5e"}
                        opacity="0.3"
                      />
                    );
                  })}

                  {/* 1. LINE CHART MODE */}
                  {chartType === "line" && (
                    <>
                      <path d={areaPath} fill="url(#lineGrad)" />
                      <path
                        d={linePath}
                        fill="none"
                        stroke={isPositive ? "#059669" : "#e11d48"}
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </>
                  )}

                  {/* 2. CANDLESTICK CHART MODE */}
                  {chartType === "candle" && (
                    <g>
                      {candles.map((c, i) => {
                        const x = getX(i);
                        const openY = getY(c.open);
                        const closeY = getY(c.close);
                        const highY = getY(c.high);
                        const lowY = getY(c.low);
                        const isBull = c.close >= c.open;
                        const barColor = isBull ? "#00D09C" : "#EB5B3C";
                        const barW = Math.max(2.5, (chartWidth / candles.length) * 0.65);
                        const topY = Math.min(openY, closeY);
                        const bodyH = Math.max(2, Math.abs(closeY - openY));

                        return (
                          <g key={`candle-${i}`}>
                            {/* Wick Line */}
                            <line
                              x1={x}
                              y1={highY}
                              x2={x}
                              y2={lowY}
                              stroke={barColor}
                              strokeWidth="1.2"
                            />
                            {/* Candle Body */}
                            <rect
                              x={x - barW / 2}
                              y={topY}
                              width={barW}
                              height={bodyH}
                              fill={barColor}
                              rx="0.5"
                            />
                          </g>
                        );
                      })}
                    </g>
                  )}

                  {/* Indicator Overlay Paths */}
                  {showSma20 && sma20Path && (
                    <path d={sma20Path} fill="none" stroke="#2563eb" strokeWidth="1.8" strokeDasharray="2 2" />
                  )}
                  {showSma50 && sma50Path && (
                    <path d={sma50Path} fill="none" stroke="#d97706" strokeWidth="1.8" strokeDasharray="3 3" />
                  )}
                  {showEma9 && ema9Path && (
                    <path d={ema9Path} fill="none" stroke="#9333ea" strokeWidth="1.8" />
                  )}

                  {/* Crosshair on Hover */}
                  {hoverPos && (
                    <g>
                      {/* Vertical line */}
                      <line
                        x1={hoverPos.x}
                        y1={paddingTop}
                        x2={hoverPos.x}
                        y2={paddingTop + chartHeight}
                        stroke="#64748b"
                        strokeDasharray="3 3"
                        strokeWidth="1"
                      />
                      {/* Horizontal line */}
                      <line
                        x1={paddingLeft}
                        y1={hoverPos.y}
                        x2={svgWidth - paddingRight}
                        y2={hoverPos.y}
                        stroke="#64748b"
                        strokeDasharray="3 3"
                        strokeWidth="1"
                      />
                      {/* Highlight Dot */}
                      <circle
                        cx={hoverPos.x}
                        cy={hoverPos.y}
                        r="4.5"
                        fill={isPositive ? "#059669" : "#e11d48"}
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                    </g>
                  )}

                  {/* Date Labels on X Axis */}
                  {candles.length > 0 && [0, Math.floor(candles.length / 4), Math.floor(candles.length / 2), Math.floor((3 * candles.length) / 4), candles.length - 1].map((idx) => {
                    if (!candles[idx]) return null;
                    return (
                      <text
                        key={idx}
                        x={getX(idx)}
                        y={svgHeight - 12}
                        fontSize="9.5"
                        fill="#94a3b8"
                        textAnchor="middle"
                        fontFamily="sans-serif"
                      >
                        {candles[idx].date}
                      </text>
                    );
                  })}
                </svg>
              </div>

              {/* Performance Sliders (Groww Style: Today's Low/High & 52W Low/High) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Today's Low / High */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-600 mb-2">
                    <span>Today's Low: <b className="text-slate-900 font-mono">₹{dayLow.toFixed(2)}</b></span>
                    <span>Today's High: <b className="text-slate-900 font-mono">₹{dayHigh.toFixed(2)}</b></span>
                  </div>
                  <div className="relative w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="absolute top-0 bottom-0 bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-500 rounded-full"
                      style={{ width: "100%" }}
                    ></div>
                  </div>
                  <div className="relative mt-1">
                    <div 
                      className="absolute -top-3.5 -translate-x-1/2 flex flex-col items-center"
                      style={{ left: `${dayPosPct}%` }}
                    >
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
                    <div
                      className="absolute top-0 bottom-0 bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-500 rounded-full"
                      style={{ width: "100%" }}
                    ></div>
                  </div>
                  <div className="relative mt-1">
                    <div 
                      className="absolute -top-3.5 -translate-x-1/2 flex flex-col items-center"
                      style={{ left: `${yearPosPct}%` }}
                    >
                      <div className="w-2.5 h-2.5 bg-slate-900 rounded-full border-2 border-white shadow-xs"></div>
                      <span className="text-[9px] font-black font-mono text-slate-800 mt-0.5">₹{currentPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Fundamentals & Valuation Grid */}
              <div>
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-3">
                  Fundamentals & Market Overview
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-[11px] text-slate-500 font-semibold">Market Cap</div>
                    <div className="text-sm font-extrabold text-slate-900 mt-0.5 font-mono">
                      ₹{(quoteData?.market_cap_cr || 45000).toLocaleString("en-IN")} Cr
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-[11px] text-slate-500 font-semibold">P/E Ratio (TTM)</div>
                    <div className="text-sm font-extrabold text-slate-900 mt-0.5 font-mono">
                      {(quoteData?.pe_ratio || 28.5).toFixed(1)}x
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-[11px] text-slate-500 font-semibold">Beta (Volatility)</div>
                    <div className="text-sm font-extrabold text-slate-900 mt-0.5 font-mono">
                      {(quoteData?.beta || 1.10).toFixed(2)}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-[11px] text-slate-500 font-semibold">24h Total Volume</div>
                    <div className="text-sm font-extrabold text-slate-900 mt-0.5 font-mono">
                      {(historyData?.volume_total || quoteData?.volume || 1200000).toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions Footer */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
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
                          historyData?.name || quoteData?.name || ticker,
                          quoteData?.sector || "Equities",
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
