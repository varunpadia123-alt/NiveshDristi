"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Activity,
  Award,
  Zap,
  Clock,
  Compass,
  MessageSquare,
  BarChart3,
  ExternalLink,
  ChevronRight,
  RefreshCw
} from "lucide-react";
import { AiStockAnalystReport } from "@/types";
import { fetchAiStockReport } from "@/lib/api";

interface AiStockAnalystModalProps {
  ticker: string | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenLiveChart?: (ticker: string) => void;
  onOpenAiChat?: (initialPrompt?: string) => void;
}

export const AiStockAnalystModal: React.FC<AiStockAnalystModalProps> = ({
  ticker,
  isOpen,
  onClose,
  onOpenLiveChart,
  onOpenAiChat
}) => {
  const [report, setReport] = useState<AiStockAnalystReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<"overview" | "proscons" | "technical" | "fundamental">("overview");

  useEffect(() => {
    if (isOpen && ticker) {
      loadReport(ticker);
    }
  }, [isOpen, ticker]);

  const loadReport = async (t: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAiStockReport(t);
      setReport(data);
    } catch (err: any) {
      console.error("Error generating AI Stock Report:", err);
      setError(err.message || "Failed to generate AI stock analysis report");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !ticker) return null;

  const getVerdictColorClasses = (verdict: string) => {
    switch (verdict) {
      case "STRONG BUY":
        return {
          badge: "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30",
          border: "border-emerald-500",
          bg: "from-emerald-50 via-teal-50 to-white",
          text: "text-emerald-700"
        };
      case "BUY":
        return {
          badge: "bg-emerald-500 text-white shadow-md shadow-emerald-500/20",
          border: "border-emerald-400",
          bg: "from-emerald-50/70 via-white to-white",
          text: "text-emerald-600"
        };
      case "ACCUMULATE":
        return {
          badge: "bg-amber-500 text-white shadow-md shadow-amber-500/20",
          border: "border-amber-400",
          bg: "from-amber-50/70 via-white to-white",
          text: "text-amber-700"
        };
      case "HOLD":
        return {
          badge: "bg-slate-700 text-white shadow-md",
          border: "border-slate-400",
          bg: "from-slate-50 via-white to-white",
          text: "text-slate-700"
        };
      case "SELL":
        return {
          badge: "bg-rose-500 text-white shadow-md shadow-rose-500/20",
          border: "border-rose-400",
          bg: "from-rose-50/70 via-white to-white",
          text: "text-rose-600"
        };
      case "STRONG SELL":
        return {
          badge: "bg-rose-700 text-white shadow-lg shadow-rose-700/30",
          border: "border-rose-600",
          bg: "from-rose-100 via-rose-50 to-white",
          text: "text-rose-800"
        };
      default:
        return {
          badge: "bg-slate-800 text-white",
          border: "border-slate-300",
          bg: "from-slate-50 to-white",
          text: "text-slate-800"
        };
    }
  };

  const colors = report ? getVerdictColorClasses(report.verdict) : getVerdictColorClasses("BUY");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/65 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-5xl max-h-[95vh] bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-y-auto flex flex-col no-scrollbar">
        
        {/* Header */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  {report?.company_name || ticker}
                </h1>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                  AI Stock Analyst
                </span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
                <span className="font-mono font-bold text-slate-700">{ticker}</span>
                <span>•</span>
                <span>{report?.sector || "Indian Equities"}</span>
                <span>•</span>
                <span className="font-semibold text-slate-900">
                  Spot: ₹{report?.current_price ? report.current_price.toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "--"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {onOpenLiveChart && (
              <button
                onClick={() => {
                  onClose();
                  onOpenLiveChart(ticker);
                }}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer"
              >
                <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Live Charts</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          
          {loading ? (
            <div className="py-32 flex flex-col items-center justify-center space-y-4 text-slate-500">
              <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="text-center">
                <p className="text-sm font-extrabold text-slate-900">Synthesizing 130+ Indicators & FinBERT Sentiment...</p>
                <p className="text-xs text-slate-400 mt-1">Generating institutional price targets, stop loss, and pros & cons</p>
              </div>
            </div>
          ) : error ? (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
              {error}
            </div>
          ) : report ? (
            <>
              {/* 1. Master Action Verdict Banner */}
              <div className={`rounded-3xl p-6 bg-gradient-to-r ${colors.bg} border-2 ${colors.border} shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6`}>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Algorithmic Verdict
                    </span>
                    <span className="text-xs font-semibold text-slate-400">•</span>
                    <span className="text-xs font-semibold text-slate-500">{report.investment_horizon}</span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className={`px-4 py-2 rounded-2xl text-base font-black tracking-wide uppercase ${colors.badge}`}>
                      {report.verdict}
                    </span>
                    <div className="text-xs font-bold text-slate-700">
                      <div>Confidence: <b className="text-slate-900">{report.confidence_score}%</b></div>
                      <div className="text-[11px] text-slate-500">{report.risk_profile}</div>
                    </div>
                  </div>
                </div>

                {/* Upside / Downside quick summary pill */}
                <div className="flex items-center space-x-4 bg-white/80 backdrop-blur-xs p-4 rounded-2xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Medium-Term Upside</span>
                    <div className="text-base font-black text-emerald-600 flex items-center font-mono">
                      <ArrowUpRight className="w-4 h-4 mr-0.5" />
                      +{report.upside_potential_pct}%
                    </div>
                  </div>

                  <div className="w-px h-8 bg-slate-200"></div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Downside to Stoploss</span>
                    <div className="text-base font-black text-rose-600 flex items-center font-mono">
                      <ArrowDownRight className="w-4 h-4 mr-0.5" />
                      {report.downside_risk_pct}%
                    </div>
                  </div>

                  <div className="w-px h-8 bg-slate-200"></div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Risk : Reward</span>
                    <div className="text-base font-black text-slate-900 font-mono">
                      {report.risk_reward_ratio}
                    </div>
                  </div>
                </div>

              </div>

              {/* 2. Target Prices & Stop Loss Grid (Institutional Tier) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Short Term Target */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-300 transition group">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-emerald-600" /> Target 1 (Short-Term)</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">1-3 Months</span>
                  </div>
                  <div className="text-2xl font-black text-slate-900 font-mono mt-1">
                    ₹{report.target_short_term.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[11px] font-bold text-emerald-600 mt-1 flex items-center">
                    <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                    +{round(((report.target_short_term - report.current_price)/report.current_price)*100, 1)}% projected return
                  </div>
                </div>

                {/* Medium Term Target */}
                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 hover:border-emerald-400 transition group">
                  <div className="flex items-center justify-between text-xs text-emerald-800 font-semibold mb-1">
                    <span className="flex items-center gap-1"><Target className="w-3.5 h-3.5 text-emerald-600" /> Target 2 (Medium-Term)</span>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-200/70 px-1.5 py-0.5 rounded">6-12 Months</span>
                  </div>
                  <div className="text-2xl font-black text-emerald-950 font-mono mt-1">
                    ₹{report.target_medium_term.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[11px] font-black text-emerald-700 mt-1 flex items-center">
                    <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                    +{report.upside_potential_pct}% primary objective
                  </div>
                </div>

                {/* Long Term Target */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-300 transition group">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
                    <span className="flex items-center gap-1"><Compass className="w-3.5 h-3.5 text-teal-600" /> Target 3 (Long-Term)</span>
                    <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-1.5 py-0.5 rounded">1-2 Years</span>
                  </div>
                  <div className="text-2xl font-black text-slate-900 font-mono mt-1">
                    ₹{report.target_long_term.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[11px] font-bold text-teal-700 mt-1 flex items-center">
                    <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                    +{round(((report.target_long_term - report.current_price)/report.current_price)*100, 1)}% structural compounding
                  </div>
                </div>

                {/* Strict Stop Loss */}
                <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200 hover:border-rose-400 transition group">
                  <div className="flex items-center justify-between text-xs text-rose-800 font-semibold mb-1">
                    <span className="flex items-center gap-1"><ShieldAlert className="w-3.5 h-3.5 text-rose-600" /> Strict Stop Loss</span>
                    <span className="text-[10px] font-bold text-rose-800 bg-rose-200/70 px-1.5 py-0.5 rounded">Risk Floor</span>
                  </div>
                  <div className="text-2xl font-black text-rose-950 font-mono mt-1">
                    ₹{report.stop_loss_level.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[11px] font-bold text-rose-600 mt-1 flex items-center">
                    <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                    {report.downside_risk_pct}% max exit threshold
                  </div>
                </div>

              </div>

              {/* 3. Executive Summary */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-600" />
                  AI Analyst Executive Summary
                </div>
                {report.executive_summary}
              </div>

              {/* 4. Side-by-Side Pros (Bullish Catalysts) & Cons (Bearish Risks) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Bullish Pros */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Key Bullish Catalysts (Pros)
                    </h3>
                  </div>

                  <div className="space-y-2.5">
                    {report.pros.map((p, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-emerald-50/40 border border-emerald-200/70 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-emerald-950 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                            {p.title}
                          </span>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase">
                            {p.category}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px] leading-snug pl-5">
                          {p.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bearish Cons */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Key Bearish Risks & Headwinds (Cons)
                    </h3>
                  </div>

                  <div className="space-y-2.5">
                    {report.cons.map((c, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-rose-50/40 border border-rose-200/70 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-rose-950 flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                            {c.title}
                          </span>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 uppercase">
                            {c.category}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px] leading-snug pl-5">
                          {c.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* 5. Tri-Factor Breakdown (Technical, Fundamental, Sentiment) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Technical Health */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center space-x-1.5 font-bold text-slate-900">
                    <Activity className="w-4 h-4 text-emerald-600" />
                    <span>Technical Architecture</span>
                  </div>
                  <div className="space-y-1.5 text-[11px] text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Trend:</span>
                      <span className="font-bold text-slate-900">{report.technical.trend}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">RSI Signal:</span>
                      <span className="font-mono font-bold text-slate-900">{report.technical.rsi_status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">MACD Bias:</span>
                      <span className="font-mono font-bold text-slate-900">{report.technical.macd_signal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Key Support:</span>
                      <span className="font-mono font-bold text-emerald-700">₹{report.technical.key_support.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Key Resistance:</span>
                      <span className="font-mono font-bold text-rose-700">₹{report.technical.key_resistance.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Fundamental Health */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center space-x-1.5 font-bold text-slate-900">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    <span>Fundamental Valuation</span>
                  </div>
                  <div className="space-y-1.5 text-[11px] text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">P/E Verdict:</span>
                      <span className="font-mono font-bold text-slate-900">{report.fundamental.pe_verdict}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Market Cap:</span>
                      <span className="font-mono font-bold text-slate-900">₹{report.fundamental.market_cap_cr.toLocaleString("en-IN")} Cr</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">ROE Est:</span>
                      <span className="font-mono font-bold text-slate-900">{report.fundamental.roe_pct}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Beta:</span>
                      <span className="font-mono font-bold text-slate-900">{report.fundamental.beta.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Valuation:</span>
                      <span className="font-bold text-indigo-700">{report.fundamental.valuation_assessment}</span>
                    </div>
                  </div>
                </div>

                {/* FinBERT Sentiment */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center space-x-1.5 font-bold text-slate-900">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span>FinBERT NLP Sentiment</span>
                  </div>
                  <div className="space-y-1.5 text-[11px] text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Score:</span>
                      <span className="font-mono font-bold text-slate-900">{report.sentiment.finbert_score > 0 ? `+${report.sentiment.finbert_score}` : report.sentiment.finbert_score}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Label:</span>
                      <span className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                        report.sentiment.sentiment_label === "BULLISH" ? "bg-emerald-100 text-emerald-800" :
                        report.sentiment.sentiment_label === "BEARISH" ? "bg-rose-100 text-rose-800" : "bg-slate-200 text-slate-700"
                      }`}>
                        {report.sentiment.sentiment_label}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Value Trap Risk:</span>
                      <span className={`font-bold ${report.sentiment.value_trap_risk ? "text-rose-600" : "text-emerald-600"}`}>
                        {report.sentiment.value_trap_risk ? "Warning Flagged" : "No Trap Detected"}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 italic mt-1 line-clamp-2">
                      "{report.sentiment.headline}"
                    </p>
                  </div>
                </div>

              </div>

              {/* 6. Actionable Strategy & Entry Plan */}
              <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-2 text-xs">
                <div className="flex items-center space-x-2 text-emerald-400 font-extrabold uppercase tracking-wider">
                  <Zap className="w-4 h-4" />
                  <span>Actionable Execution Strategy</span>
                </div>
                <div className="text-slate-300 leading-relaxed">
                  {report.actionable_strategy}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-[11px] border-t border-slate-800">
                  <div>
                    <span className="text-slate-400 font-semibold">Recommended Entry Corridor: </span>
                    <span className="font-mono font-bold text-emerald-400">{report.entry_range}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold">Risk Management: </span>
                    <span className="font-mono font-bold text-rose-400">Stop Loss @ ₹{report.stop_loss_level}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions Bar */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                {onOpenAiChat && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAiChat(`Analyze ${ticker} in detail and suggest an accumulation plan`);
                    }}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Ask AI Advisor about {ticker}</span>
                  </button>
                )}

                <div className="flex items-center space-x-2">
                  <button
                    onClick={onClose}
                    className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            </>
          ) : null}

        </div>

      </div>
    </div>
  );
};

function round(val: number, decimals: number = 1): number {
  const factor = Math.pow(10, decimals);
  return Math.round(val * factor) / factor;
}
