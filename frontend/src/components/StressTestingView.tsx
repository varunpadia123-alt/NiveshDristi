"use client";

import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  TrendingDown, 
  Sparkles, 
  AlertTriangle, 
  Sliders, 
  Layers, 
  ShieldCheck,
  Zap,
  Info
} from "lucide-react";
import { fetchStressTest } from "@/lib/api";
import { StressTestResponse } from "@/types";

export const StressTestingView: React.FC = () => {
  const [scenario, setScenario] = useState<string>("nifty_drop_20");
  const [customDrop, setCustomDrop] = useState<number>(-20);
  const [data, setData] = useState<StressTestResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    runSimulation();
  }, [scenario]);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const res = await fetchStressTest(scenario, customDrop);
      setData(res);
    } catch (err) {
      console.error("Error executing stress test:", err);
    } finally {
      setLoading(false);
    }
  };

  const scenarios = [
    {
      id: "nifty_drop_20",
      title: "Nifty 50 Drop 20%",
      desc: "Simulate a severe market correction & broad index crash",
      badge: "Market Crash",
      badgeColor: "bg-rose-100 text-rose-800"
    },
    {
      id: "global_recession",
      title: "Global Tech Recession (-15%)",
      desc: "Simulate US/EU enterprise IT spending slow-down & export tariff hike",
      badge: "Tech Shock",
      badgeColor: "bg-amber-100 text-amber-800"
    },
    {
      id: "interest_rate_hike",
      title: "RBI Rate Hike (+50 bps)",
      desc: "Simulate rising bond yields, banking NIM compression & debt cost",
      badge: "Monetary Shock",
      badgeColor: "bg-indigo-100 text-indigo-800"
    },
    {
      id: "crude_oil_spike",
      title: "Crude Oil Spike (+30%)",
      desc: "Simulate imported inflation, rupee depreciation & input cost squeeze",
      badge: "Commodity Shock",
      badgeColor: "bg-purple-100 text-purple-800"
    },
    {
      id: "custom",
      title: "Custom Scenario",
      desc: "Set your own custom market drawdown percentage",
      badge: "Interactive",
      badgeColor: "bg-slate-100 text-slate-800"
    }
  ];

  const initialVal = data?.initial_portfolio_value ?? (data ? Math.round(data.projected_portfolio_value - data.projected_portfolio_loss) : 0);
  const simVal = data?.simulated_portfolio_value ?? (data ? data.projected_portfolio_value : 0);
  const lossPct = data?.total_loss_pct ?? (data ? Math.abs(data.projected_loss_pct) : 0);
  const lossInr = data?.total_loss_inr ?? (data ? Math.abs(data.projected_portfolio_loss) : 0);
  const maxDrawdown = data?.max_drawdown_holding || (data?.holdings_breakdown?.[0]?.ticker || "High-Beta Equities");
  const resilientHolding = data?.resilient_holding || "Defensive / Gold Assets";
  const advisory = data?.defensive_recommendation || data?.ai_risk_advisory || "";
  const breakdownList = data?.holdings_breakdown || [];

  return (
    <div className="space-y-6">
      
      {/* 1. Header Banner */}
      <div className="light-card rounded-2xl p-6 bg-gradient-to-r from-rose-50/50 via-white to-amber-50/50 border border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shadow-xs">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Portfolio Stress Testing Engine
              </h2>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-900 border border-rose-200">
                Monte Carlo & Beta Simulation
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Quantify portfolio drawdowns, tail-risk exposures, and stock vulnerabilities under extreme macroeconomic crisis conditions.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Scenario Selection Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {scenarios.map((sc) => {
          const isSelected = scenario === sc.id;
          return (
            <div
              key={sc.id}
              onClick={() => setScenario(sc.id)}
              className={`light-card rounded-2xl p-4.5 border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? "border-rose-500 ring-2 ring-rose-500/10 bg-rose-50/30"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${sc.badgeColor}`}>
                    {sc.badge}
                  </span>
                  {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>}
                </div>
                <h3 className="font-extrabold text-slate-900 text-sm mt-2">{sc.title}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{sc.desc}</p>
              </div>

              <div className="mt-4 pt-2 border-t border-slate-100 flex justify-between items-center text-[11px] font-bold">
                <span className={isSelected ? "text-rose-700" : "text-slate-500"}>
                  {isSelected ? "Simulating Active Scenario" : "Click to Simulate"}
                </span>
                <span className="text-slate-400">→</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom Slider Box */}
      {scenario === "custom" && (
        <div className="light-card rounded-2xl p-5 border border-slate-200 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-slate-900 text-sm">Custom Market Drawdown: {customDrop}%</span>
            <button
              onClick={runSimulation}
              className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
            >
              Recalculate Stress
            </button>
          </div>
          <input
            type="range"
            min="-50"
            max="-1"
            value={customDrop}
            onChange={(e) => setCustomDrop(Number(e.target.value))}
            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-rose-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
            <span>-1% (Minor Dip)</span>
            <span>-20% (Bear Market)</span>
            <span>-50% (2008-Style Crash)</span>
          </div>
        </div>
      )}

      {/* 3. Stress Test Summary KPI Cards */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="light-card rounded-2xl p-5 border border-slate-200 bg-white">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Pre-Shock Value</div>
            <div className="text-xl font-black font-mono text-slate-900 mt-1">
              ₹{initialVal.toLocaleString("en-IN")}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Current total holding value</div>
          </div>

          <div className="light-card rounded-2xl p-5 border border-rose-200 bg-rose-50/50">
            <div className="text-[10px] text-rose-800 font-bold uppercase">Projected Stress Value</div>
            <div className="text-xl font-black font-mono text-rose-700 mt-1">
              ₹{simVal.toLocaleString("en-IN")}
            </div>
            <div className="text-xs text-rose-600 font-black mt-1 flex items-center">
              <TrendingDown className="w-3.5 h-3.5 mr-1" />
              <span>Loss: -{lossPct.toFixed(1)}% (-₹{lossInr.toLocaleString("en-IN")})</span>
            </div>
          </div>

          <div className="light-card rounded-2xl p-5 border border-slate-200 bg-white">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Vulnerability Profile</div>
            <div className="text-sm font-black text-slate-900 mt-1">
              {maxDrawdown}
            </div>
            <div className="text-[10px] text-rose-600 font-bold mt-1">Highest Beta Sensitivity</div>
          </div>

          <div className="light-card rounded-2xl p-5 border border-slate-200 bg-white">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Resilient Buffer</div>
            <div className="text-sm font-black text-emerald-700 mt-1">
              {resilientHolding}
            </div>
            <div className="text-[10px] text-emerald-600 font-bold mt-1">Defensive Cushion</div>
          </div>
        </div>
      )}

      {/* 4. Holding-level Breakdown Table */}
      {data && breakdownList.length > 0 && (
        <div className="light-card rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                Holding-Level Drawdown Breakdown ({data.scenario_name})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Computed via stock beta coefficients and market shock transmission
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                  <th className="py-3 px-6">Holding</th>
                  <th className="py-3 px-4">Beta</th>
                  <th className="py-3 px-4 text-right">Current Value</th>
                  <th className="py-3 px-4 text-right">Estimated Drop</th>
                  <th className="py-3 px-4 text-right">Projected Loss</th>
                  <th className="py-3 px-6 text-center">Vulnerability</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {breakdownList.map((h) => (
                  <tr key={h.ticker} className="hover:bg-slate-50">
                    <td className="py-3.5 px-6 font-bold text-slate-900">
                      <div>{h.name}</div>
                      <div className="text-[10px] text-slate-400 font-semibold">{h.ticker} • {h.weight_pct}% weight</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">{h.beta}β</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      ₹{h.current_value.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-rose-600">
                      {h.estimated_drop_pct}%
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-rose-700">
                      -₹{Math.abs(h.projected_loss).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg ${
                        h.vulnerability_rating === "HIGH"
                          ? "bg-rose-100 text-rose-800 border border-rose-200"
                          : h.vulnerability_rating === "MODERATE"
                          ? "bg-amber-100 text-amber-800 border border-amber-200"
                          : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      }`}>
                        {h.vulnerability_rating}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* AI Defensive Advisory */}
          {advisory && (
            <div className="p-5 bg-emerald-50/50 border-t border-emerald-100 text-xs text-emerald-950 flex items-start space-x-3">
              <Sparkles className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-extrabold text-emerald-900 mb-0.5">AI Defensive Hedging Advisory:</div>
                <p className="leading-relaxed text-slate-700">{advisory}</p>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
