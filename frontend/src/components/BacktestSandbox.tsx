"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Percent, 
  ShieldAlert, 
  Activity,
  Play
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { Line } from "react-chartjs-2";
import { BacktestResponse } from "@/types";
import { runBacktest } from "@/lib/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface BacktestSandboxProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BacktestSandbox: React.FC<BacktestSandboxProps> = ({ isOpen, onClose }) => {
  const [selectedTicker, setSelectedTicker] = useState("RELIANCE.NS");
  const [timeframeYears, setTimeframeYears] = useState(3);
  const [data, setData] = useState<BacktestResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stockList = [
    { ticker: "RELIANCE.NS", name: "Reliance Industries" },
    { ticker: "TCS.NS", name: "Tata Consultancy Services" },
    { ticker: "INFY.NS", name: "Infosys Ltd" },
    { ticker: "HDFCBANK.NS", name: "HDFC Bank Ltd" },
    { ticker: "M&M.NS", name: "Mahindra & Mahindra" },
    { ticker: "ITC.NS", name: "ITC Ltd" }
  ];

  const executeRun = (ticker: string, years: number) => {
    setLoading(true);
    setError(null);
    runBacktest(ticker, years)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to run backtest simulation.");
        setLoading(false);
      });
  };

  useEffect(() => {
    if (isOpen) {
      executeRun(selectedTicker, timeframeYears);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Chart setup
  const chartLabels = data?.chart_data.map((d, index) => (index % 15 === 0 ? d.date.split("T")[0] : "")) || [];
  const strategyData = data?.chart_data.map((d) => d.strategy_equity) || [];
  const benchmarkData = data?.chart_data.map((d) => d.buy_hold_equity) || [];

  const chartConfig = {
    labels: chartLabels,
    datasets: [
      {
        label: "NiveshDristi Co-Pilot Strategy",
        data: strategyData,
        borderColor: "#059669",
        backgroundColor: "rgba(16, 185, 129, 0.08)",
        borderWidth: 2.5,
        fill: true,
        tension: 0.3,
        pointRadius: 0
      },
      {
        label: "Buy & Hold Benchmark",
        data: benchmarkData,
        borderColor: "#94a3b8",
        backgroundColor: "transparent",
        borderWidth: 1.5,
        borderDash: [4, 4],
        tension: 0.3,
        pointRadius: 0
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "#475569",
          font: { size: 11, family: "inherit", weight: "bold" as const }
        }
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        backgroundColor: "#0f172a",
        borderColor: "#e2e8f0",
        borderWidth: 1,
        titleColor: "#f8fafc",
        bodyColor: "#cbd5e1"
      }
    },
    scales: {
      x: {
        grid: { color: "#f1f5f9" },
        ticks: { color: "#64748b", font: { size: 10 } }
      },
      y: {
        grid: { color: "#f1f5f9" },
        ticks: {
          color: "#64748b",
          font: { size: 10 },
          callback: (value: any) => `₹${Number(value).toLocaleString("en-IN")}`
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl light-card rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 bg-white my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Algorithmic Backtesting Sandbox
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-900 border border-indigo-200 rounded-md">
                Quantitative Audit
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Simulates historical performance comparing NiveshDristi rules-based signals vs Buy & Hold.
            </p>
          </div>
        </div>

        {/* Selectors Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border border-slate-200 bg-slate-50 mb-6">
          
          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold text-slate-700">Ticker:</span>
            <select
              value={selectedTicker}
              onChange={(e) => {
                setSelectedTicker(e.target.value);
                executeRun(e.target.value, timeframeYears);
              }}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
            >
              {stockList.map((s) => (
                <option key={s.ticker} value={s.ticker}>
                  {s.name} ({s.ticker})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-700">Timeframe:</span>
            <div className="flex items-center rounded-xl bg-slate-200/70 border border-slate-200 p-0.5 text-xs font-bold">
              {[1, 3, 5].map((y) => (
                <button
                  key={y}
                  onClick={() => {
                    setTimeframeYears(y);
                    executeRun(selectedTicker, y);
                  }}
                  className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                    timeframeYears === y
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {y}Y
                </button>
              ))}
            </div>
          </div>

        </div>

        {loading ? (
          <div className="py-24 text-center text-slate-500 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 rounded-full border-3 border-indigo-500 border-t-transparent animate-spin"></div>
            <p className="text-xs font-semibold">Computing historical multi-indicator backtest over {timeframeYears} years...</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs mb-6 font-semibold">
            {error}
          </div>
        ) : data ? (
          <div className="space-y-6">

            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-500 font-semibold mb-1">Strategy CAGR</div>
                <div className={`font-mono font-black text-base ${data.cagr_strategy_pct >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  {data.cagr_strategy_pct > 0 ? `+${data.cagr_strategy_pct.toFixed(2)}` : data.cagr_strategy_pct.toFixed(2)}%
                </div>
                <div className="text-[10px] text-slate-400">Benchmark: {data.cagr_buy_hold_pct.toFixed(2)}%</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-500 font-semibold mb-1">Win Rate</div>
                <div className="font-mono font-black text-base text-slate-900">{data.win_rate_pct.toFixed(1)}%</div>
                <div className="text-[10px] text-slate-400">{data.total_trades} trades executed</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-500 font-semibold mb-1">Sharpe Ratio</div>
                <div className="font-mono font-black text-base text-indigo-600">{data.sharpe_ratio.toFixed(2)}</div>
                <div className="text-[10px] text-slate-400">Risk-adjusted return</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-500 font-semibold mb-1">Max Drawdown</div>
                <div className="font-mono font-black text-base text-rose-600">-{data.max_drawdown_pct.toFixed(1)}%</div>
                <div className="text-[10px] text-slate-400">Capital preservation</div>
              </div>
            </div>

            {/* Interactive Chart */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-white h-72">
              <Line data={chartConfig} options={chartOptions} />
            </div>

          </div>
        ) : null}

        {/* Footer */}
        <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[10px] text-slate-400">
            Backtest calculations factor entry/exit slippage and historical dividend adjustments.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 text-slate-800 hover:bg-slate-200 transition cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
