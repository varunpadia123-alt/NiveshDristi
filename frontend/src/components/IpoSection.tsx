"use client";

import React, { useState, useEffect } from "react";
import { 
  Rocket, 
  Flame, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  TrendingUp,
  Tag,
  Users,
  ShieldCheck
} from "lucide-react";
import { fetchIPOs } from "@/lib/api";
import { IPOItem } from "@/types";

export const IpoSection: React.FC = () => {
  const [ipos, setIpos] = useState<IPOItem[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIPOs();
  }, [filterStatus]);

  const loadIPOs = async () => {
    setLoading(true);
    try {
      const data = await fetchIPOs(filterStatus === "ALL" ? undefined : filterStatus);
      setIpos(data);
    } catch (err) {
      console.error("Error loading IPOs:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header & KPI Banner */}
      <div className="light-card rounded-2xl p-6 bg-gradient-to-r from-amber-50/60 via-white to-emerald-50/60 border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-2">
              <Flame className="w-3.5 h-3.5 text-amber-600" />
              <span>Primary Markets & IPO Tracker</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              IPOs, GMP & Institutional Subscription
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-xl">
              Track live grey market premiums (GMP), bidding multiples (QIB, Retail, NII), and AI algorithmic ratings for mainboard Indian IPOs.
            </p>
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold self-start md:self-auto">
            {[
              { id: "ALL", label: "All IPOs" },
              { id: "OPEN", label: "Open Now" },
              { id: "UPCOMING", label: "Upcoming" },
              { id: "LISTED", label: "Recently Listed" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filterStatus === tab.id
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

      {/* 2. IPO List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {ipos.map((ipo) => {
          const isOpen = ipo.status === "OPEN";
          const isListed = ipo.status === "LISTED";
          const isUpcoming = ipo.status === "UPCOMING";

          return (
            <div
              key={ipo.id}
              className="light-card light-card-hover rounded-2xl p-5 border border-slate-200 bg-white flex flex-col justify-between"
            >
              <div>
                {/* Status & Rating Badges */}
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                    isOpen
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200 animate-pulse"
                      : isListed
                      ? "bg-slate-100 text-slate-700"
                      : "bg-indigo-100 text-indigo-800 border border-indigo-200"
                  }`}>
                    {ipo.status}
                  </span>

                  <span className={`text-[11px] font-black px-2.5 py-1 rounded-lg ${
                    ipo.ai_rating === "SUBSCRIBE"
                      ? "bg-emerald-500 text-white"
                      : ipo.ai_rating === "MAY AVOID"
                      ? "bg-rose-500 text-white"
                      : "bg-amber-500 text-white"
                  }`}>
                    AI: {ipo.ai_rating}
                  </span>
                </div>

                {/* Company Title */}
                <h3 className="font-extrabold text-slate-900 text-base mt-3 line-clamp-1">
                  {ipo.name}
                </h3>
                <div className="text-xs font-semibold text-slate-400 mt-0.5">
                  NSE/BSE Symbol: {ipo.symbol}
                </div>

                {/* GMP & Est Listing Gain Highlight */}
                <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-medium text-slate-500 flex items-center space-x-1">
                      <Flame className="w-3 h-3 text-amber-500" />
                      <span>Grey Market (GMP)</span>
                    </div>
                    <div className="font-extrabold text-slate-900 text-sm">
                      +₹{ipo.gmp_inr} / share
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-medium text-slate-500">Est. Listing Gain</div>
                    <div className="font-black text-emerald-600 text-sm">
                      +{ipo.estimated_listing_gain_pct}%
                    </div>
                  </div>
                </div>

                {/* Issue Key Details */}
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-slate-50">
                    <span className="text-slate-400 text-[10px] block">Price Band</span>
                    <span className="font-bold text-slate-800">{ipo.price_band}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50">
                    <span className="text-slate-400 text-[10px] block">Issue Size</span>
                    <span className="font-bold text-slate-800">₹{ipo.issue_size_cr.toLocaleString("en-IN")} Cr</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50">
                    <span className="text-slate-400 text-[10px] block">Lot Size</span>
                    <span className="font-bold text-slate-800">{ipo.lot_size} Shares (₹{(ipo.max_price * ipo.lot_size).toLocaleString("en-IN")})</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50">
                    <span className="text-slate-400 text-[10px] block">Subscription</span>
                    <span className="font-bold text-indigo-600">{ipo.subscription_times > 0 ? `${ipo.subscription_times}x` : "Awaiting Open"}</span>
                  </div>
                </div>

                {/* Timeline Dates */}
                <div className="mt-3 flex items-center space-x-2 text-[11px] text-slate-500">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Dates: {ipo.open_date} to {ipo.close_date}</span>
                </div>

                {/* AI Summary Snippet */}
                <p className="mt-3 text-[11px] text-slate-600 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100/80 leading-relaxed">
                  <span className="font-bold text-emerald-900">AI Analysis: </span>
                  {ipo.ai_summary}
                </p>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500">
                  Listing Date: {ipo.listing_date}
                </span>
                <button
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer"
                  onClick={() => alert(`Redirecting to broker bidding portal for ${ipo.name}...`)}
                >
                  {isOpen ? "Apply Now" : "View Prospectus"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
