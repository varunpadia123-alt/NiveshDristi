"use client";

import React, { useState, useEffect } from "react";
import { 
  Landmark, 
  ShieldCheck, 
  Percent, 
  Coins, 
  Calendar, 
  FileText, 
  Info, 
  CheckCircle2 
} from "lucide-react";
import { fetchBonds } from "@/lib/api";
import { BondItem } from "@/types";

export const BondsSection: React.FC = () => {
  const [bonds, setBonds] = useState<BondItem[]>([]);
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBonds();
  }, [selectedType]);

  const loadBonds = async () => {
    setLoading(true);
    try {
      const data = await fetchBonds();
      setBonds(data);
    } catch (err) {
      console.error("Error loading bonds:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = selectedType === "ALL"
    ? bonds
    : bonds.filter(b => b.category.toLowerCase().includes(selectedType.toLowerCase()));

  return (
    <div className="space-y-6">
      
      {/* 1. Header Banner */}
      <div className="light-card rounded-2xl p-6 bg-gradient-to-r from-blue-50/60 via-white to-amber-50/60 border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-bold mb-2">
              <Landmark className="w-3.5 h-3.5 text-blue-600" />
              <span>Fixed Income & Sovereign Debt Hub</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Bonds, SGBs & Government Securities (G-Sec)
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-xl">
              Lock in guaranteed yields, capital safety, and tax-free Sovereign Gold Bond appreciation with institutional-grade credit ratings.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold self-start md:self-auto gap-1">
            {[
              { id: "ALL", label: "All Bonds" },
              { id: "SGB", label: "SGBs (Gold)" },
              { id: "G-Sec", label: "G-Secs" },
              { id: "Corporate Bond", label: "Corporate AAA" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedType(tab.id)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  selectedType === tab.id
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

      {/* 2. Bonds Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((bond, idx) => {
          const isSGB = bond.category === "SGB";
          const isGSec = bond.category === "G-Sec";
          const name = bond.bond_name || bond.name || "Government Bond";
          const rating = bond.rating || "AAA";
          const ytm = bond.ytm_pct || 7.25;
          const minInv = bond.min_investment ?? (isSGB ? 6500 : 10000);
          const payout = bond.interest_payout_frequency || "Semi-Annually";
          const risk = bond.risk_level || (isGSec || isSGB ? "Sovereign / Low" : "Low");

          return (
            <div
              key={bond.id || idx}
              className="light-card light-card-hover rounded-2xl p-5 border border-slate-200 bg-white flex flex-col justify-between"
            >
              <div>
                {/* Header Tag & Rating Badge */}
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase ${
                    isSGB
                      ? "bg-amber-100 text-amber-900 border border-amber-200"
                      : isGSec
                      ? "bg-blue-100 text-blue-900 border border-blue-200"
                      : "bg-emerald-100 text-emerald-900 border border-emerald-200"
                  }`}>
                    {bond.category}
                  </span>

                  <span className="text-[11px] font-black px-2.5 py-0.5 rounded-md bg-slate-900 text-white flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>{rating}</span>
                  </span>
                </div>

                {/* Bond Title & Issuer */}
                <h3 className="font-extrabold text-slate-900 text-base mt-3 line-clamp-1">
                  {name}
                </h3>
                <div className="text-xs font-semibold text-slate-500 mt-0.5">
                  Issuer: {bond.issuer}
                </div>

                {/* Yield & Coupon Highlight */}
                <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-medium text-slate-500">Yield to Maturity (YTM)</div>
                    <div className="font-black text-emerald-600 text-lg">
                      {ytm}% p.a.
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-medium text-slate-500">Coupon Rate</div>
                    <div className="font-extrabold text-slate-900 text-sm">
                      {bond.coupon_rate_pct}% ({payout})
                    </div>
                  </div>
                </div>

                {/* Spec List */}
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                    <span className="text-slate-500">Maturity Date</span>
                    <span className="font-bold text-slate-800">{bond.maturity_date}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                    <span className="text-slate-500">Min. Investment</span>
                    <span className="font-bold text-slate-800">₹{minInv.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                    <span className="text-slate-500">Risk Profile</span>
                    <span className="font-bold text-emerald-700">
                      {risk}
                    </span>
                  </div>
                </div>

                {/* Tax Status Alert */}
                <div className="mt-3 p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-[11px] text-indigo-900 flex items-start space-x-1.5">
                  <Info className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Tax Treatment:</strong> {bond.tax_status}</span>
                </div>
              </div>

              {/* Action */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500">
                  Face Value: ₹{bond.face_value.toLocaleString("en-IN")}
                </span>
                <button
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer"
                  onClick={() => alert(`Placing buy order for ${name}...`)}
                >
                  Invest Now
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
