"use client";

import React, { useState, useEffect } from "react";
import { 
  Network, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles, 
  Info
} from "lucide-react";
import { fetchCorrelationMatrix } from "@/lib/api";
import { CorrelationMatrixResponse } from "@/types";

export const CorrelationMatrixView: React.FC = () => {
  const [data, setData] = useState<CorrelationMatrixResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchCorrelationMatrix();
      setData(res);
    } catch (err) {
      console.error("Failed to load correlation matrix:", err);
    } finally {
      setLoading(false);
    }
  };

  const getCellBg = (val: number, i: number, j: number) => {
    if (i === j) return "bg-slate-900 text-white font-black";
    if (val >= 0.8) return "bg-rose-500 text-white font-black";
    if (val >= 0.6) return "bg-amber-400 text-slate-900 font-bold";
    if (val >= 0.3) return "bg-amber-100 text-amber-900 font-semibold";
    if (val >= 0.0) return "bg-emerald-100 text-emerald-900 font-semibold";
    return "bg-emerald-500 text-white font-bold";
  };

  const labels = data?.labels || data?.tickers || [];
  const matrix = data?.matrix || [];
  const score = data?.diversification_score ?? (data ? Math.round((1 - data.average_correlation) * 100) : 78);
  const highPairs = data?.high_correlation_pairs || [];

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="light-card rounded-2xl p-6 bg-gradient-to-r from-teal-50/60 via-white to-indigo-50/60 border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-900 text-xs font-bold mb-2">
              <Network className="w-3.5 h-3.5 text-teal-600" />
              <span>Multi-Asset Statistical Co-Movement</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Holdings Correlation Matrix & Diversification
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-xl">
              Uncover hidden concentration risks by checking which portfolio holdings move synchronously with each other and benchmark indices.
            </p>
          </div>

          {data && (
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs text-right">
              <div className="text-[11px] text-slate-500 font-medium">Portfolio Diversification Score</div>
              <div className="text-2xl font-black text-emerald-600">
                {score} / 100
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Higher score = Lower joint crash risk</div>
            </div>
          )}
        </div>
      </div>

      {/* Heatmap Grid Table */}
      {data && matrix.length > 0 && (
        <div className="light-card rounded-2xl p-6 border border-slate-200 bg-white">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-900 text-base">
              Pearson Correlation Coefficient Heatmap
            </h3>
            <div className="flex items-center space-x-2 text-[11px] font-semibold text-slate-500">
              <span className="w-3 h-3 rounded bg-emerald-500"></span>
              <span>Hedging (&lt;0)</span>
              <span className="w-3 h-3 rounded bg-emerald-100 ml-2"></span>
              <span>Low (0.0-0.3)</span>
              <span className="w-3 h-3 rounded bg-amber-400 ml-2"></span>
              <span>Moderate (0.6-0.8)</span>
              <span className="w-3 h-3 rounded bg-rose-500 ml-2"></span>
              <span>High Risk (&gt;0.8)</span>
            </div>
          </div>

          <div className="overflow-x-auto mt-5">
            <table className="w-full text-center text-xs border-collapse">
              <thead>
                <tr>
                  <th className="p-3 text-left font-bold text-slate-400 text-[11px] uppercase">Asset</th>
                  {labels.map((label: string, idx: number) => (
                    <th key={idx} className="p-3 font-extrabold text-slate-800 text-[11px]">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.map((row: number[], i: number) => (
                  <tr key={i} className="border-t border-slate-100">
                    <td className="p-3 text-left font-bold text-slate-900 bg-slate-50">
                      {labels[i] || `Asset ${i + 1}`}
                    </td>
                    {row.map((val: number, j: number) => (
                      <td key={j} className="p-2">
                        <div className={`py-2 px-1 rounded-xl text-xs transition-transform hover:scale-105 cursor-default ${getCellBg(val, i, j)}`}>
                          {val >= 0 ? `+${val.toFixed(2)}` : val.toFixed(2)}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* High Correlation Warning Alert */}
          {highPairs.length > 0 ? (
            <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-amber-900 mb-0.5">High Co-Movement Concentration Alert:</div>
                <p>The following asset pairs exhibit severe positive correlation ({highPairs.map((p: any) => typeof p === 'string' ? p : p.pair).join(", ")}). Consider swapping one into an un-correlated sector to enhance downside resilience.</p>
              </div>
            </div>
          ) : (
            <div className="mt-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span><strong>Healthy Diversification:</strong> No excessive correlation concentrations detected across your portfolio positions.</span>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
