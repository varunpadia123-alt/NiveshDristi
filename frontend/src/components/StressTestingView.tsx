"use client";

import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  AlertTriangle, 
  TrendingDown, 
  Sliders, 
  ShieldCheck, 
  Sparkles,
  ArrowDownRight,
  Info
} from "lucide-react";
import { fetchStressTest } from "@/lib/api";
import { StressTestResponse } from "@/types";

export const StressTestingView: React.FC = () => {
  const [scenario, setScenario] = useState<string>("nifty_drop_20");
  const [customDrop, setCustomDrop] = useState<number>(20);
  const [data, setData] = useState<StressTestResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadStressData = async (sc: string, drop: number) => {
    setLoading(true);
    try {
      const res = await fetchStressTest(sc, drop);
      setData(res);
    } catch (err) {
      console.error("Stress test failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStressData(scenario, customDrop);
  }, [scenario]);

  const handleCustomSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setCustomDrop(val);
    setScenario("custom");
    loadStressData("custom", val);
  };

  const scenariosList = [
    { id: "nifty_drop_20", title: "Nifty Drops 20%", desc: "Broad market bear market correction" },
    { id: "it_crash_15", title: "IT Recession -15%", desc: "US budget cuts hitting tech giants" },
    { id: "rate_hike_50bps", title: "Rate Hike +50bps", desc: "Monetary tightening & liquidity squeeze" },
    { id: "oil_surge_30", title: "Crude Oil +30%", desc: "Geopolitical shock & CAD expansion" },
    { id: "custom", title: "Custom Drop Slider", desc: "Interactive crash percentage simulator" },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="light-card rounded-2xl p-6 bg-gradient-to-r from-rose-50/60 via-white to-amber-50/60 border border-slate-200">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-900 text-xs font-bold mb-2">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
          <span>Macroeconomic Vulnerability Simulator</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Portfolio Stress Testing: "What If Nifty Drops 20%?"
        </h2>
        <p className="text-xs text-slate-600 mt-1 max-w-2xl">
          Quantifies holding-level beta sensitivities, projected drawdowns, and defensive hedging requirements against severe macroeconomic market shocks.
        </p>

        {/* Scenario Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mt-5">
          {scenariosList.map((sc) => (
            <button
              key={sc.id}
              onClick={() => {
                setScenario(sc.id);
                if (sc.id !== "custom") {
                  loadStressData(sc.id, customDrop);
                }
              }}
              className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                scenario === sc.id
                  ? "bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/20"
                  : "bg-white text-slate-800 border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="font-bold text-xs">{sc.title}</div>
              <div className={`text-[10px] mt-0.5 line-clamp-1 ${scenario === sc.id ? "text-rose-100" : "text-slate-500"}`}>
                {sc.desc}
              </div>
            </button>
          ))}
        </div>

        {/* Custom Slider (Visible when custom is selected) */}
        {scenario === "custom" && (
          <div className="mt-4 p-4 rounded-xl bg-white border border-slate-200">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-2">
              <span>Simulated Market Correction:</span>
              <span className="text-rose-600 font-extrabold text-sm">-{customDrop}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="1"
              value={customDrop}
              onChange={handleCustomSliderChange}
              className="w-full accent-rose-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-semibold">
              <span>-5% (Mild Pullback)</span>
              <span>-20% (Bear Market)</span>
              <span>-50% (2008 Crash Level)</span>
            </div>
          </div>
        )}
      </div>

      {/* Summary KPI Cards */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="light-card rounded-2xl p-4.5 border border-slate-200 bg-white">
            <div className="text-[11px] text-slate-500 font-medium">Initial Portfolio Value</div>
            <div className="text-lg font-black text-slate-900 mt-1">
              ₹{data.initial_portfolio_value.toLocaleString("en-IN")}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Pre-shock portfolio value</div>
          </div>

          <div className="light-card rounded-2xl p-4.5 border border-slate-200 bg-white">
            <div className="text-[11px] text-slate-500 font-medium">Projected Stress Value</div>
            <div className="text-lg font-black text-rose-600 mt-1">
              ₹{data.simulated_portfolio_value.toLocaleString("en-IN")}
            </div>
            <div className="text-[10px] text-rose-600 font-bold mt-0.5 flex items-center">
              <TrendingDown className="w-3 h-3 mr-1" />
              <span>Loss: -{data.total_loss_pct}% (-₹{data.total_loss_inr.toLocaleString("en-IN")})</span>
            </div>
          </div>

          <div className="light-card rounded-2xl p-4.5 border border-slate-200 bg-white">
            <div className="text-[11px] text-slate-500 font-medium">Most Vulnerable Holding</div>
            <div className="text-sm font-extrabold text-slate-900 mt-1 line-clamp-1">
              {data.max_drawdown_holding}
            </div>
            <div className="text-[10px] text-rose-600 font-semibold mt-0.5">High Beta & Sensitivity</div>
          </div>

          <div className="light-card rounded-2xl p-4.5 border border-slate-200 bg-white">
            <div className="text-[11px] text-slate-500 font-medium">Most Resilient Holding</div>
            <div className="text-sm font-extrabold text-slate-900 mt-1 line-clamp-1">
              {data.resilient_holding}
            </div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Low Drawdown Buffer</div>
          </div>
        </div>
      )}

      {/* Holding-level Impact Breakdown Table */}
      {data && (
        <div className="light-card rounded-2xl p-6 border border-slate-200 bg-white">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Holding-Level Drawdown Breakdown ({data.scenario_name})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Calculated using equity beta coefficients and macroeconomic factor weights
              </p>
            </div>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase">
                  <th className="pb-3">Holding</th>
                  <th className="pb-3">Sector</th>
                  <th className="pb-3">Beta</th>
                  <th className="pb-3 text-right">Current Value</th>
                  <th className="pb-3 text-right">Projected Change</th>
                  <th className="pb-3 text-right">Stress Value</th>
                  <th className="pb-3 text-center">Vulnerability</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.holdings_impact.map((h) => (
                  <tr key={h.ticker} className="hover:bg-slate-50">
                    <td className="py-3 font-bold text-slate-900">
                      <div>{h.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{h.ticker}</div>
                    </td>
                    <td className="py-3 text-slate-600">{h.sector}</td>
                    <td className="py-3 font-semibold text-slate-800">{h.beta}β</td>
                    <td className="py-3 text-right font-semibold text-slate-900">
                      ₹{h.current_value.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 text-right font-black text-rose-600">
                      {h.simulated_change_pct}% (-₹{h.projected_loss_inr.toLocaleString("en-IN")})
                    </td>
                    <td className="py-3 text-right font-bold text-slate-900">
                      ₹{h.projected_value.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 text-center">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                        h.vulnerability_rating === "Severe"
                          ? "bg-rose-100 text-rose-800"
                          : h.vulnerability_rating === "High"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}>
                        {h.vulnerability_rating}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* AI Defensive Recommendation Box */}
          <div className="mt-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-start space-x-3">
            <Sparkles className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-extrabold text-emerald-900 mb-0.5">AI Defensive Hedging Strategy:</div>
              <p className="leading-relaxed">{data.defensive_recommendation}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
