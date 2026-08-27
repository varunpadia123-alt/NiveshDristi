"use client";

import React from "react";
import { PieChart, AlertTriangle, ShieldCheck, Layers } from "lucide-react";
import { SectorExposure } from "@/types";

interface SectorHeatmapProps {
  exposures: SectorExposure[];
  onSelectSector?: (sector: string) => void;
  selectedSector?: string | null;
}

export const SectorHeatmap: React.FC<SectorHeatmapProps> = ({
  exposures,
  onSelectSector,
  selectedSector
}) => {
  if (!exposures || exposures.length === 0) {
    return null;
  }

  // Color mapping per sector for distinct visual recognition
  const getSectorColor = (sector: string, isOver: boolean) => {
    if (isOver) return { bg: "bg-rose-50", border: "border-rose-300", text: "text-rose-800", bar: "bg-rose-500" };
    switch (sector) {
      case "IT Services":
        return { bg: "bg-cyan-50", border: "border-cyan-200", text: "text-cyan-900", bar: "bg-cyan-500" };
      case "Energy":
        return { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-900", bar: "bg-amber-500" };
      case "Banking":
        return { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-900", bar: "bg-indigo-500" };
      case "Automobile":
        return { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-900", bar: "bg-emerald-500" };
      case "Consumer Goods":
        return { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-900", bar: "bg-purple-500" };
      default:
        return { bg: "bg-slate-50", border: "border-slate-200", text: "text-slate-900", bar: "bg-slate-500" };
    }
  };

  const hasOverconcentrated = exposures.some((e) => e.is_overconcentrated);

  return (
    <div className="light-card rounded-2xl p-6 border border-slate-200 bg-white">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              Sector Exposure Heatmap & Concentration Risk
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time portfolio sector weightings with active 25.0% maximum risk safety limit.
          </p>
        </div>

        {hasOverconcentrated ? (
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Over-Concentration Detected (&gt;25%)</span>
          </div>
        ) : (
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Risk Guardrail Compliant</span>
          </div>
        )}
      </div>

      {/* Exposure Progress Bars & Allocation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {exposures.map((item) => {
          const styling = getSectorColor(item.sector, item.is_overconcentrated);
          const isSelected = selectedSector === item.sector;

          return (
            <div
              key={item.sector}
              onClick={() => onSelectSector && onSelectSector(isSelected ? "" : item.sector)}
              className={`p-4 rounded-xl border transition cursor-pointer ${
                isSelected
                  ? "ring-2 ring-emerald-500 bg-emerald-50/40 border-emerald-300"
                  : item.is_overconcentrated
                  ? "border-rose-300 bg-rose-50/50 hover:border-rose-400"
                  : "border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-extrabold ${styling.text}`}>
                  {item.sector}
                </span>
                <span className="text-xs font-black text-slate-900">
                  {item.percentage.toFixed(1)}%
                </span>
              </div>

              {/* Progress Bar with 25% Threshold Indicator */}
              <div className="relative w-full h-2 rounded-full bg-slate-200 overflow-hidden mb-3">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${styling.bar}`}
                  style={{ width: `${Math.min(item.percentage, 100)}%` }}
                ></div>
                {/* 25% Threshold Marker */}
                <div 
                  className="absolute top-0 bottom-0 w-0.5 bg-rose-600 z-10"
                  style={{ left: "25%" }}
                  title="25% Safety Limit"
                ></div>
              </div>

              {/* Stats row */}
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>{item.stock_count} {item.stock_count === 1 ? "holding" : "holdings"}</span>
                <span className="text-slate-900 font-bold">
                  ₹{item.value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </span>
              </div>

              {item.is_overconcentrated && (
                <div className="mt-2 text-[10px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-md border border-rose-200 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 flex-shrink-0 text-rose-600" />
                  <span>Exceeds 25% safety cap. Swap recommended.</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
