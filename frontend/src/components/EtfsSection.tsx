"use client";

import React, { useState, useEffect } from "react";
import { 
  Layers, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Coins, 
  Globe, 
  ShieldCheck,
  Zap
} from "lucide-react";
import { fetchETFs } from "@/lib/api";
import { ETFItem } from "@/types";

interface EtfsSectionProps {
  onOpenTechnicalDrawer?: (ticker: string) => void;
}

export const EtfsSection: React.FC<EtfsSectionProps> = ({ onOpenTechnicalDrawer }) => {
  const [etfs, setEtfs] = useState<ETFItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadETFs();
  }, [selectedCategory]);

  const loadETFs = async () => {
    setLoading(true);
    try {
      const data = await fetchETFs(selectedCategory === "ALL" ? undefined : selectedCategory);
      setEtfs(data);
    } catch (err) {
      console.error("Error loading ETFs:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header Banner */}
      <div className="light-card rounded-2xl p-6 bg-gradient-to-r from-emerald-50/60 via-white to-indigo-50/60 border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold mb-2">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>Exchange Traded Funds (ETFs) Catalog</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Low-Cost Index, Sectoral & Gold ETFs
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-xl">
              Diversify instantly across Nifty 50, Banking, IT, Pharma, Physical Gold, and Nasdaq with industry-low expense ratios.
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold self-start md:self-auto gap-1">
            {[
              { id: "ALL", label: "All ETFs" },
              { id: "Index", label: "Index ETFs" },
              { id: "Sectoral", label: "Sectoral" },
              { id: "Gold & Silver", label: "Gold & Silver" },
              { id: "Global", label: "Global / US" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  selectedCategory === tab.id
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. ETFs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {etfs.map((etf) => {
          const isGreen = etf.day_change_pct >= 0;

          return (
            <div
              key={etf.ticker}
              className="light-card light-card-hover rounded-2xl p-4.5 border border-slate-200 bg-white flex flex-col justify-between"
            >
              <div>
                {/* Header Tag */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 uppercase">
                    {etf.category}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    Expense: {etf.expense_ratio_pct}%
                  </span>
                </div>

                {/* ETF Title */}
                <h3 className="font-extrabold text-slate-900 text-sm mt-2 line-clamp-1">
                  {etf.name}
                </h3>
                <div className="text-[11px] font-bold text-slate-500">{etf.ticker}</div>

                {/* Live NAV & 1D Change */}
                <div className="mt-3 flex items-baseline justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 font-medium">Live NAV</div>
                    <div className="font-black text-slate-900 text-base">₹{etf.current_nav.toFixed(2)}</div>
                  </div>
                  <div className={`text-xs font-bold px-2 py-0.5 rounded-md flex items-center ${
                    isGreen ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                  }`}>
                    {isGreen ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
                    <span>{isGreen ? "+" : ""}{etf.day_change_pct}%</span>
                  </div>
                </div>

                {/* Returns Breakdown */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-slate-50">
                    <span className="text-[10px] text-slate-400 block">1-Year Return</span>
                    <span className="font-black text-emerald-600">+{etf.return_1y_pct}%</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50">
                    <span className="text-[10px] text-slate-400 block">3-Yr CAGR</span>
                    <span className="font-black text-emerald-600">+{etf.return_3y_cagr_pct}%</span>
                  </div>
                </div>

                {/* AUM & Tracking error */}
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                  <span>AUM: ₹{etf.aum_cr.toLocaleString("en-IN")} Cr</span>
                  <span>52W: ₹{etf.low_52w} - ₹{etf.high_52w}</span>
                </div>
              </div>

              {/* Action */}
              <div className="mt-4 pt-2">
                <button
                  onClick={() => onOpenTechnicalDrawer && onOpenTechnicalDrawer(etf.ticker)}
                  className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer"
                >
                  Technical Chart & Analysis
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
