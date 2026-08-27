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
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchTaxLossHarvesting();
      setData(res);
    } catch (err) {
      console.error("Failed to load tax loss harvesting data:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="light-card rounded-2xl p-6 bg-gradient-to-r from-emerald-50/60 via-white to-amber-50/60 border border-slate-200">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold mb-2">
          <ReceiptText className="w-3.5 h-3.5 text-emerald-600" />
          <span>Capital Gains Tax Optimization</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Tax-Loss Harvesting: Realize Losses to Offset Gains
        </h2>
        <p className="text-xs text-slate-600 mt-1 max-w-2xl">
          Identifies underperforming holdings with unrealized capital losses before fiscal year-end, offsets taxable capital gains (STCG @ 20% / LTCG @ 12.5%), and recommends correlated replacement assets to maintain market exposure without wash-sale drag.
        </p>
      </div>

      {/* KPI Cards */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="light-card rounded-2xl p-4.5 border border-slate-200 bg-white">
            <div className="text-[11px] text-slate-500 font-medium">Total Potential Tax Savings</div>
            <div className="text-xl font-black text-emerald-600 mt-1">
              ₹{data.total_potential_tax_savings_inr.toLocaleString("en-IN")}
            </div>
            <div className="text-[10px] text-emerald-600 font-bold mt-0.5">Tax liability reduced</div>
          </div>

          <div className="light-card rounded-2xl p-4.5 border border-slate-200 bg-white">
            <div className="text-[11px] text-slate-500 font-medium">Total Unrealized Losses</div>
            <div className="text-lg font-black text-rose-600 mt-1">
              ₹{data.total_unrealized_losses_inr.toLocaleString("en-IN")}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Across eligible holdings</div>
          </div>

          <div className="light-card rounded-2xl p-4.5 border border-slate-200 bg-white">
            <div className="text-[11px] text-slate-500 font-medium">Short-Term Loss (STCL)</div>
            <div className="text-lg font-black text-slate-900 mt-1">
              ₹{data.stcl_amount_inr.toLocaleString("en-IN")}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Tax offset at 20% rate</div>
          </div>

          <div className="light-card rounded-2xl p-4.5 border border-slate-200 bg-white">
            <div className="text-[11px] text-slate-500 font-medium">Eligible Holdings Count</div>
            <div className="text-lg font-black text-slate-900 mt-1">
              {data.eligible_holdings_count} Assets
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Ready for tax harvesting</div>
          </div>
        </div>
      )}

      {/* Actionable Opportunities List */}
      {data && (
        <div className="light-card rounded-2xl p-6 border border-slate-200 bg-white">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-900 text-base">
              Identified Tax-Loss Harvesting Opportunities
            </h3>
            <span className="text-xs font-bold text-slate-500">
              India Income Tax Act 2024–25 Regime
            </span>
          </div>

          {data.opportunities.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="font-bold text-slate-700">No Tax-Loss Positions Found</p>
              <p className="mt-0.5">All active portfolio holdings are in positive profit territory.</p>
            </div>
          ) : (
            <div className="space-y-4 mt-5">
              {data.opportunities.map((opp) => (
                <div
                  key={opp.holding_id}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-black text-slate-900 text-sm">{opp.name}</span>
                      <span className="text-[11px] font-bold text-slate-400">({opp.ticker})</span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800">
                        {opp.tax_type}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span>Holding Days: <strong>{opp.holding_days}d</strong></span>
                      <span>Cost: <strong>₹{opp.cost_basis.toLocaleString("en-IN")}</strong></span>
                      <span>Current: <strong>₹{opp.current_value.toLocaleString("en-IN")}</strong></span>
                      <span className="text-rose-600 font-bold">Unrealized Loss: ₹{Math.abs(opp.unrealized_loss).toLocaleString("en-IN")}</span>
                    </div>

                    <p className="text-xs text-emerald-900 font-medium bg-emerald-50 p-2.5 rounded-xl border border-emerald-100 mt-2">
                      💡 {opp.harvest_action}
                    </p>
                  </div>

                  <div className="flex flex-col items-end justify-between min-w-[200px]">
                    <div className="text-right">
                      <div className="text-[11px] text-slate-500 font-medium">Estimated Tax Savings</div>
                      <div className="text-xl font-black text-emerald-600">
                        +₹{opp.potential_tax_savings_inr.toLocaleString("en-IN")}
                      </div>
                    </div>

                    <button
                      onClick={() => alert(`Harvesting ${opp.name} loss of ₹${Math.abs(opp.unrealized_loss)} and reallocating to ${opp.suggested_peer_alternative}...`)}
                      className="mt-3 w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                    >
                      Harvest & Swap Peer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
