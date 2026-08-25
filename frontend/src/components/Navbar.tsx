"use client";

import React, { useState } from "react";
import { 
  ShieldAlert, 
  RefreshCw, 
  TrendingUp, 
  Plus, 
  SlidersHorizontal,
  ChevronDown,
  Layers,
  Sparkles
} from "lucide-react";
import { triggerBrokerSync, updateRiskProfile } from "@/lib/api";

interface NavbarProps {
  brokerConnected: string;
  riskScore: number;
  onRefresh: () => void;
  onOpenAddModal: () => void;
  onOpenBacktest: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  brokerConnected,
  riskScore,
  onRefresh,
  onOpenAddModal,
  onOpenBacktest
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedBroker, setSelectedBroker] = useState(brokerConnected || "Zerodha Kite");
  const [currentRisk, setCurrentRisk] = useState(riskScore || 6);
  const [showBrokerMenu, setShowBrokerMenu] = useState(false);
  const [showRiskMenu, setShowRiskMenu] = useState(false);

  const brokers = ["Zerodha Kite", "Upstox", "Groww", "AngelOne"];

  const handleBrokerChange = async (broker: string) => {
    setSelectedBroker(broker);
    setShowBrokerMenu(false);
    setIsSyncing(true);
    try {
      await triggerBrokerSync(broker);
      await updateRiskProfile(currentRisk, broker);
      onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRiskChange = async (score: number) => {
    setCurrentRisk(score);
    setShowRiskMenu(false);
    try {
      await updateRiskProfile(score, selectedBroker);
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await triggerBrokerSync(selectedBroker);
      onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  const getRiskLabel = (score: number) => {
    if (score <= 3) return { label: "Conservative", color: "text-blue-400 border-blue-500/30 bg-blue-500/10" };
    if (score <= 6) return { label: "Moderate", color: "text-amber-400 border-amber-500/30 bg-amber-500/10" };
    return { label: "Aggressive", color: "text-rose-400 border-rose-500/30 bg-rose-500/10" };
  };

  const riskBadge = getRiskLabel(currentRisk);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 glass-card bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-1 ring-white/20">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-emerald-400 bg-clip-text text-transparent">
                NiveshDristi
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-md">
                Algorithmic Co-Pilot
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              NSE Real-Time Multi-Indicator Engine
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          
          {/* Backtesting Sandbox Button */}
          <button
            onClick={onOpenBacktest}
            className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/20 transition cursor-pointer"
            title="Open Historical Strategy Backtesting Sandbox"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Backtest Sandbox</span>
          </button>

          {/* Broker Sync Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowBrokerMenu(!showBrokerMenu)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 border border-white/10 hover:border-white/20 transition cursor-pointer text-slate-200"
            >
              <Layers className="w-3.5 h-3.5 text-teal-400" />
              <span>{selectedBroker}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showBrokerMenu && (
              <div className="absolute right-0 mt-2 w-44 rounded-xl glass-card border border-white/15 shadow-2xl py-1 z-50 bg-slate-900/95 backdrop-blur-xl">
                <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-white/5">
                  Select Broker API
                </div>
                {brokers.map((b) => (
                  <button
                    key={b}
                    onClick={() => handleBrokerChange(b)}
                    className={`w-full text-left px-3 py-2 text-xs transition flex items-center justify-between ${
                      selectedBroker === b ? "bg-emerald-500/15 text-emerald-300 font-medium" : "text-slate-300 hover:bg-white/5"
                    }`}
                  >
                    <span>{b}</span>
                    {selectedBroker === b && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Risk Profile Selector */}
          <div className="relative">
            <button
              onClick={() => setShowRiskMenu(!showRiskMenu)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${riskBadge.color}`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Risk: {currentRisk}/10 ({riskBadge.label})</span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {showRiskMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl glass-card border border-white/15 shadow-2xl p-2 z-50 bg-slate-900/95 backdrop-blur-xl">
                <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Risk Guardrail Scale (1-10)
                </div>
                <div className="grid grid-cols-5 gap-1 my-1.5">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <button
                      key={num}
                      onClick={() => handleRiskChange(num)}
                      className={`h-7 rounded-md text-xs font-bold transition flex items-center justify-center ${
                        currentRisk === num
                          ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <div className="text-[10px] text-slate-400 px-1 pt-1 border-t border-white/5">
                  Protects swap suggestions from high-beta volatility traps.
                </div>
              </div>
            )}
          </div>

          {/* Refresh / Sync Button */}
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="p-2 rounded-lg bg-slate-900 border border-white/10 text-slate-300 hover:text-white hover:border-white/20 transition cursor-pointer disabled:opacity-50"
            title="Re-compute indicators and sync quotes"
          >
            <RefreshCw className={`w-4 h-4 text-slate-300 ${isSyncing ? "animate-spin text-emerald-400" : ""}`} />
          </button>

          {/* Add Holding Button */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/25 transition cursor-pointer font-sans"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Asset</span>
          </button>

        </div>
      </div>
    </header>
  );
};
