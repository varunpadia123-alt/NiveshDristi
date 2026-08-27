"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  Sparkles, 
  ArrowRight, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  AlertTriangle, 
  Receipt, 
  CheckCircle2, 
  Coins,
  Scale
} from "lucide-react";
import confetti from "canvas-confetti";
import { Holding, AlternativeDiscovery } from "@/types";
import { fetchAlternativeForHolding, executeSwap } from "@/lib/api";

interface SwapModalProps {
  holding: Holding | null;
  isOpen: boolean;
  onClose: () => void;
  onSwapSuccess: () => void;
}

export const SwapModal: React.FC<SwapModalProps> = ({
  holding,
  isOpen,
  onClose,
  onSwapSuccess
}) => {
  const [alternative, setAlternative] = useState<AlternativeDiscovery | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [swapping, setSwapping] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [swapResult, setSwapResult] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && holding) {
      setLoading(true);
      setError(null);
      setSwapResult(null);
      fetchAlternativeForHolding(holding.id)
        .then((data) => {
          setAlternative(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setError("Could not find a higher-conviction intra-sector alternative at this time.");
          setLoading(false);
        });
    }
  }, [isOpen, holding]);

  if (!isOpen || !holding) return null;

  const handleExecuteSwap = async () => {
    if (!alternative) return;
    setSwapping(true);
    setError(null);

    try {
      const res = await executeSwap({
        holding_id: holding.id,
        alternative_ticker: alternative.alternative_ticker,
        alternative_name: alternative.alternative_name,
        sector: alternative.sector,
        alternative_price: alternative.alternative_price
      });

      // Trigger celebration confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      setSwapResult(res.message);
      setTimeout(() => {
        onSwapSuccess();
        onClose();
      }, 1800);
    } catch (e: any) {
      setError(e.message || "Failed to execute asset swap");
    } finally {
      setSwapping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl light-card rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 bg-white my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
            <Sparkles className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                AI Smart Swap Copilot
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200 rounded-md">
                Intra-Sector Optimizer
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Redeploy capital from underperforming assets into high-momentum peers with tax drag awareness.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 rounded-full border-3 border-amber-500 border-t-transparent animate-spin"></div>
            <p className="text-xs font-semibold">Scanning {holding.sector} sector universe, computing FinBERT sentiment and tax drag...</p>
          </div>
        ) : error ? (
          <div className="py-8 text-center">
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs mb-4 font-semibold">
              {error}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 text-slate-800 hover:bg-slate-200 transition cursor-pointer"
            >
              Close
            </button>
          </div>
        ) : alternative ? (
          <div className="space-y-6">

            {/* Side-by-Side Comparison Card */}
            <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
              
              {/* Left: Original Asset */}
              <div className="md:col-span-5 p-4 rounded-2xl border border-rose-200 bg-rose-50/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-rose-800 tracking-wider uppercase">
                    Current Position
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200">
                    {alternative.original_badge}
                  </span>
                </div>
                <div className="font-black text-base text-slate-900">{alternative.original_ticker}</div>
                <div className="text-xs text-slate-500 mb-3">{alternative.original_name}</div>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-rose-100">
                  <span className="text-slate-500">Composite Score</span>
                  <span className="font-mono font-bold text-rose-600">
                    {alternative.original_composite_score > 0 ? `+${alternative.original_composite_score}` : alternative.original_composite_score}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1.5">
                  <span className="text-slate-500">Current Price</span>
                  <span className="font-bold text-slate-900">₹{holding.current_price.toFixed(2)}</span>
                </div>
              </div>

              {/* Center Swap Arrow */}
              <div className="md:col-span-1 flex justify-center py-2 md:py-0">
                <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center shadow-sm">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>

              {/* Right: Alternative Recommendation */}
              <div className="md:col-span-5 p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-emerald-800 tracking-wider uppercase flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    AI Recommended Swap
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {alternative.alternative_badge}
                  </span>
                </div>
                <div className="font-black text-base text-slate-900">{alternative.alternative_ticker}</div>
                <div className="text-xs text-slate-500 mb-3">{alternative.alternative_name}</div>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-emerald-100">
                  <span className="text-slate-500">Composite Score</span>
                  <span className="font-mono font-bold text-emerald-600 flex items-center gap-1">
                    {alternative.alternative_composite_score > 0 ? `+${alternative.alternative_composite_score}` : alternative.alternative_composite_score}
                    <span className="text-[10px] text-emerald-700 font-bold">
                      (+{alternative.technical_score_improvement} pts)
                    </span>
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1.5">
                  <span className="text-slate-500">Alternative Price</span>
                  <span className="font-bold text-slate-900">₹{alternative.alternative_price.toFixed(2)}</span>
                </div>
              </div>

            </div>

            {/* FinBERT Sentiment Overlay */}
            <div className="p-4 rounded-2xl border border-blue-200 bg-blue-50/60">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  FinBERT Sentiment Overlay (Value-Trap Safeguard)
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                  {alternative.sentiment_label} ({alternative.sentiment_score > 0 ? `+${alternative.sentiment_score}` : alternative.sentiment_score})
                </span>
              </div>
              <p className="text-xs text-slate-700 italic">
                &ldquo;{alternative.sentiment_headline}&rdquo;
              </p>
            </div>

            {/* Tax Drag & Capital Redeployment Breakdown */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800 mb-3">
                <Receipt className="w-3.5 h-3.5 text-amber-600" />
                <span>Capital Gains Tax Drag Modeling</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <div className="text-[10px] text-slate-500">Holding Period</div>
                  <div className="font-bold text-slate-900">{alternative.holding_days} days</div>
                  <div className="text-[10px] text-emerald-700 font-semibold">{alternative.tax_type}</div>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <div className="text-[10px] text-slate-500">Unrealized Gain</div>
                  <div className="font-bold text-slate-900">₹{alternative.unrealized_gain.toLocaleString("en-IN")}</div>
                  <div className="text-[10px] text-slate-400">Rate: {alternative.tax_rate_pct}%</div>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <div className="text-[10px] text-slate-500">Estimated Tax Drag</div>
                  <div className="font-bold text-rose-600">₹{alternative.estimated_tax_payable.toLocaleString("en-IN")}</div>
                  <div className="text-[10px] text-slate-400">Deducted at exit</div>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="text-[10px] text-emerald-800 font-semibold">Net Redeployable</div>
                  <div className="font-black text-slate-900">₹{alternative.redeployable_capital.toLocaleString("en-IN")}</div>
                  <div className="text-[10px] text-emerald-700 font-bold">≈ {alternative.new_shares_acquired} shares</div>
                </div>
              </div>
            </div>

            {/* AI Natural Language Explanatory Rationale */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
              <div className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Plain-English Recommendation Rationale
              </div>
              {alternative.rag_rationale}
            </div>

            {/* Success Message Banner */}
            {swapResult && (
              <div className="p-4 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{swapResult}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <p className="text-[10px] text-slate-400 max-w-sm">
                NiveshDristi algorithmic signals provide data-driven metric translation, not fiduciary advice.
              </p>

              <div className="flex items-center space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteSwap}
                  disabled={swapping || !!swapResult}
                  className="flex items-center space-x-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20 transition cursor-pointer disabled:opacity-50"
                >
                  <Coins className="w-4 h-4" />
                  <span>{swapping ? "Executing Swap..." : "Execute 1-Click Swap"}</span>
                </button>
              </div>
            </div>

          </div>
        ) : null}

      </div>
    </div>
  );
};
