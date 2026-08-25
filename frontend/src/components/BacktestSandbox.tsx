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
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.08)",
        borderWidth: 2.5,
        fill: true,
        tension: 0.3,
        pointRadius: 0
      },
      {
        label: "Buy & Hold Benchmark",
        data: benchmarkData,
        borderColor: "#64748b",
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
          color: "#94a3b8",
          font: { size: 11, family: "inherit" }
        }
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
        titleColor: "#f8fafc",
        bodyColor: "#cbd5e1"
      }
    },
    scales: {
      x: {
        grid: { color: "rgba(255, 255, 255, 0.04)" },
        ticks: { color: "#64748b", font: { size: 10 } }
      },
      y: {
        grid: { color: "rgba(255, 255, 255, 0.04)" },
        ticks: {
          color: "#64748b",
          font: { size: 10 },
          callback: (value: any) => `₹${Number(value).toLocaleString("en-IN")}`
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl glass-card rounded-3xl border border-white/15 shadow-2xl p-6 sm:p-8 bg-slate-900/95 my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shadow-lg shadow-indigo-500/10">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                Algorithmic Backtesting Sandbox
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-md">
                Quantitative Audit
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulates historical performance comparing NiveshDristi rules-based signals vs Buy & Hold.
            </p>
          </div>
        </div>

        {/* Selectors Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl glass-card border border-white/10 bg-slate-950/50 mb-6">
          
          <div className="flex items-center space-x-3">
            <span className="text-xs font-semibold text-slate-300">Ticker:</span>
            <select
              value={selectedTicker}
              onChange={(e) => {
                setSelectedTicker(e.target.value);
                executeRun(e.target.value, timeframeYears);
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs font-medium text-white focus:outline-none focus:border-indigo-500"
            >
              {stockList.map((s) => (
                <option key={s.ticker} value={s.ticker}>
                  {s.name} ({s.ticker})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-300">Timeframe:</span>
            <div className="flex items-center rounded-lg bg-slate-900 border border-white/10 p-0.5 text-xs">
              {[1, 3, 5].map((y) => (
                <button
                  key={y}
                  onClick={() => {
                    setTimeframeYears(y);
                    executeRun(selectedTicker, y);
                  }}
                  className={`px-3 py-1 rounded-md font-semibold transition cursor-pointer ${
                    timeframeYears === y
                      ? "bg-indigo-500 text-white shadow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {y}Y
                </button>
              ))}
            </div>
          </div>

        </div>

        {loading ? (
          <div className="py-24 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 rounded-full border-3 border-indigo-400 border-t-transparent animate-spin"></div>
            <p className="text-xs">Computing historical multi-indicator backtest over {timeframeYears} years...</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs mb-6">
            {error}
          </div>
        ) : data ? (
          <div className="space-y-6">

            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-white/5">
                <div className="text-[10px] text-slate-400 font-semibold mb-1">Strategy CAGR</div>
                <div className={`font-mono font-bold text-base ${data.cagr_strategy_pct >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {data.cagr_strategy_pct > 0 ? `+${data.cagr_strategy_pct.toFixed(2)}` : data.cagr_strategy_pct.toFixed(2)}%
                </div>
                <div className="text-[10px] text-slate-500">Benchmark: {data.cagr_buy_hold_pct.toFixed(2)}%</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-white/5">
                <div className="text-[10px] text-slate-400 font-semibold mb-1">Win Rate</div>
                <div className="font-mono font-bold text-base text-white">{data.win_rate_pct.toFixed(1)}%</div>
                <div className="text-[10px] text-slate-500">{data.total_trades} trades executed</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-white/5">
                <div className="text-[10px] text-slate-400 font-semibold mb-1">Sharpe Ratio</div>
                <div className="font-mono font-bold text-base text-teal-300">{data.sharpe_ratio.toFixed(2)}</div>
                <div className="text-[10px] text-slate-500">Risk-adjusted return</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-white/5">
                <div className="text-[10px] text-slate-400 font-semibold mb-1">Max Drawdown</div>
                <div className="font-mono font-bold text-base text-rose-400">-{data.max_drawdown_pct.toFixed(1)}%</div>
                <div className="text-[10px] text-slate-500">Capital preservation</div>
              </div>
            </div>

            {/* Interactive Chart */}
            <div className="p-4 rounded-2xl glass-card border border-white/10 bg-slate-950/60 h-72">
              <Line data={chartConfig} options={chartOptions} />
            </div>

          </div>
        ) : null}

        {/* Footer */}
        <div className="pt-4 mt-6 border-t border-white/10 flex items-center justify-between">
          <p className="text-[10px] text-slate-500">
            Backtest calculations factor entry/exit slippage and historical dividend adjustments.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
