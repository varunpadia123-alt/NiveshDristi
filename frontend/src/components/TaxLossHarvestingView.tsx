"use client";

import React, { useState, useEffect } from "react";
import { 
  ReceiptText, 
  Sparkles, 
  ArrowRight, 
  TrendingDown, 
  ShieldCheck, 
  DollarSign,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { fetchTaxLossHarvesting } from "@/lib/api";
import { TaxLossHarvestingResponse } from "@/types";

export const TaxLossHarvestingView: React.FC = () => {
  const [data, setData] = useState<TaxLossHarvestingResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchTaxLossHarvesting();
      setData(res);
    } catch (err) {
      console.error("Error loading tax harvesting data:", err);
    } finally {
      setLoading(false);
    }
  };

  const opportunities = data?.opportunities || [];
  const totalSavings = data?.total_potential_tax_savings_inr ?? data?.total_potential_savings ?? 0;
  const totalLosses = data?.total_unrealized_losses_inr ?? data?.total_loss_harvestable ?? 0;
  const stclAmount = data?.stcl_amount_inr ?? totalLosses;
  const count = data?.eligible_holdings_count ?? opportunities.length;

  return (
    <div className="space-y-6">
      
      {/* 1. Header Banner */}
      <div className="light-card rounded-2xl p-6 bg-gradient-to-r from-emerald-50/50 via-white to-blue-50/50 border border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shadow-xs">
            <ReceiptText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Tax-Loss Harvesting Optimizer
              </h2>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-200">
                FY 2026-27 Safe
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Realize capital losses before financial year-end to offset taxable STCG (20%) & LTCG (12.5%) gains, redeploying into high-momentum sector peers.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="light-card rounded-2xl p-5 border border-emerald-200 bg-emerald-50/50">
            <div className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider">Total Tax Savings</div>
            <div className="text-2xl font-black font-mono text-emerald-700 mt-1">
              ₹{(totalSavings || 0).toLocaleString("en-IN")}
            </div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-1">Direct tax reduction</div>
          </div>

          <div className="light-card rounded-2xl p-5 border border-slate-200 bg-white">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Harvestable Loss</div>
            <div className="text-2xl font-black font-mono text-rose-600 mt-1">
              ₹{(totalLosses || 0).toLocaleString("en-IN")}
            </div>
            <div className="text-[10px] text-slate-400 font-medium mt-1">Unrealized capital loss pool</div>
          </div>

          <div className="light-card rounded-2xl p-5 border border-slate-200 bg-white">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">STCL Offset Pool</div>
            <div className="text-2xl font-black font-mono text-slate-900 mt-1">
              ₹{(stclAmount || 0).toLocaleString("en-IN")}
            </div>
            <div className="text-[10px] text-slate-400 font-medium mt-1">Offsets 20% short-term gains</div>
          </div>

          <div className="light-card rounded-2xl p-5 border border-slate-200 bg-white">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Eligible Positions</div>
            <div className="text-2xl font-black font-mono text-slate-900 mt-1">
              {count}
            </div>
            <div className="text-[10px] text-slate-400 font-medium mt-1">Underperforming holdings</div>
          </div>
        </div>
      )}

      {/* 3. Opportunities List */}
      {data && (
        <div className="light-card rounded-2xl p-6 border border-slate-200 bg-white">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Tax-Loss Harvesting Opportunities
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Suggested exit & reinvestment strategies without violating wash-sale intent
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
              {opportunities.length} Candidate(s)
            </span>
          </div>

          {opportunities.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="font-bold text-slate-700">No Tax-Loss Positions Found</p>
              <p className="mt-0.5">All active portfolio holdings are currently in positive profit territory.</p>
            </div>
          ) : (
            <div className="space-y-4 mt-5">
              {opportunities.map((opp) => {
                const curVal = opp.current_value ?? (opp.current_price && opp.quantity ? opp.current_price * opp.quantity : 0);
                const cost = opp.cost_basis ?? opp.invested_amount ?? (opp.average_buy_price && opp.quantity ? opp.average_buy_price * opp.quantity : 0);
                const days = opp.holding_days ?? opp.holding_period_days ?? opp.holding_duration_days ?? 180;
                const savings = opp.potential_tax_savings_inr ?? opp.potential_tax_savings ?? opp.potential_tax_offset ?? 0;
                const unLoss = opp.unrealized_loss ?? (cost - curVal);
                const alt = opp.suggested_peer_alternative || opp.recommended_alternative || "Broad Index ETF";

                return (
                  <div
                    key={opp.ticker}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-black text-slate-900 text-sm">{opp.name}</span>
                        <span className="text-[11px] font-bold text-slate-400">({opp.ticker})</span>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800">
                          {opp.tax_classification || opp.tax_category || opp.tax_type || "STCL"}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span>Holding Days: <strong>{days}d</strong></span>
                        <span>Cost: <strong>₹{(cost || 0).toLocaleString("en-IN")}</strong></span>
                        <span>Current: <strong>₹{(curVal || 0).toLocaleString("en-IN")}</strong></span>
                        <span className="text-rose-600 font-bold">Unrealized Loss: ₹{Math.abs(unLoss || 0).toLocaleString("en-IN")}</span>
                      </div>

                      <p className="text-xs text-emerald-900 font-medium bg-emerald-50 p-2.5 rounded-xl border border-emerald-100 mt-2">
                        💡 {opp.ai_harvest_strategy || opp.rationale || `Harvest ₹${Math.abs(unLoss || 0).toLocaleString("en-IN")} loss and redeploy into ${alt}`}
                      </p>
                    </div>

                    <div className="flex flex-col items-end justify-between min-w-[200px]">
                      <div className="text-right">
                        <div className="text-[11px] text-slate-500 font-medium">Estimated Tax Savings</div>
                        <div className="text-xl font-black text-emerald-600">
                          +₹{(savings || 0).toLocaleString("en-IN")}
                        </div>
                      </div>

                      <button
                        onClick={() => alert(`Harvesting ${opp.name} loss of ₹${Math.abs(unLoss || 0).toLocaleString("en-IN")} and reallocating to ${alt}...`)}
                        className="mt-3 w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                      >
                        Harvest & Swap Peer
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
