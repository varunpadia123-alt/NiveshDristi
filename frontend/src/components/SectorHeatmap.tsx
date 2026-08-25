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
    if (isOver) return { bg: "bg-rose-500/20", border: "border-rose-500/40", text: "text-rose-300", bar: "bg-rose-500" };
    switch (sector) {
      case "IT Services":
        return { bg: "bg-cyan-500/15", border: "border-cyan-500/30", text: "text-cyan-300", bar: "bg-cyan-400" };
      case "Energy":
        return { bg: "bg-amber-500/15", border: "border-amber-500/30", text: "text-amber-300", bar: "bg-amber-400" };
      case "Banking":
        return { bg: "bg-indigo-500/15", border: "border-indigo-500/30", text: "text-indigo-300", bar: "bg-indigo-400" };
      case "Automobile":
        return { bg: "bg-emerald-500/15", border: "border-emerald-500/30", text: "text-emerald-300", bar: "bg-emerald-400" };
      case "Consumer Goods":
        return { bg: "bg-purple-500/15", border: "border-purple-500/30", text: "text-purple-300", bar: "bg-purple-400" };
      default:
        return { bg: "bg-slate-500/15", border: "border-slate-500/30", text: "text-slate-300", bar: "bg-slate-400" };
    }
  };

  const hasOverconcentrated = exposures.some((e) => e.is_overconcentrated);

  return (
    <div className="glass-card rounded-2xl p-6 border border-white/10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Sector Exposure Heatmap & Concentration Risk
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time portfolio sector weightings with active 25.0% maximum risk guardrail.
          </p>
        </div>

        {hasOverconcentrated ? (
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>Over-Concentration Detected (&gt;25%)</span>
          </div>
        ) : (
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
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
              className={`p-4 rounded-xl border transition cursor-pointer glass-card ${
                isSelected
                  ? "ring-2 ring-emerald-400/60 bg-white/10"
                  : item.is_overconcentrated
                  ? "border-rose-500/40 bg-rose-950/20 hover:border-rose-400"
                  : "border-white/10 hover:border-white/20 hover:bg-white/5"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-bold ${styling.text}`}>
                  {item.sector}
                </span>
                <span className="text-xs font-bold text-white">
                  {item.percentage.toFixed(1)}%
                </span>
              </div>

              {/* Progress Bar with 25% Threshold Indicator */}
              <div className="relative w-full h-2 rounded-full bg-slate-800 overflow-hidden mb-3">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${styling.bar}`}
                  style={{ width: `${Math.min(item.percentage, 100)}%` }}
                ></div>
                {/* 25% Threshold Marker */}
                <div 
                  className="absolute top-0 bottom-0 w-0.5 bg-rose-400/80 z-10"
                  style={{ left: "25%" }}
                  title="25% Safety Limit"
                ></div>
              </div>

              {/* Stats row */}
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>{item.stock_count} {item.stock_count === 1 ? "holding" : "holdings"}</span>
                <span className="text-slate-200 font-medium">
                  ₹{item.value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </span>
              </div>

              {item.is_overconcentrated && (
                <div className="mt-2 text-[10px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                  <span>Exceeds 25% risk cap. Swap recommended.</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
