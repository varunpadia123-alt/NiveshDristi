"use client";

import React, { useState } from "react";
import { 
  TrendingUp, 
  RefreshCw, 
  Plus, 
  Shield, 
  SlidersHorizontal,
  PieChart,
  Search,
  Rocket,
  Landmark,
  Layers,
  BrainCircuit,
  BarChart3
} from "lucide-react";
import { triggerBrokerSync, updateRiskProfile } from "@/lib/api";

export type NavTab = "portfolio" | "screener" | "ipos" | "bonds" | "etfs" | "intelligence" | "backtest";

interface NavbarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  brokerConnected: string;
  riskScore: number;
  onRefresh: () => void;
  onOpenAddModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  brokerConnected = "Zerodha Kite",
  riskScore = 6,
  onRefresh,
  onOpenAddModal,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentBroker, setCurrentBroker] = useState(brokerConnected);
  const [currentRisk, setCurrentRisk] = useState(riskScore);
  const [isRiskMenuOpen, setIsRiskMenuOpen] = useState(false);

  const handleBrokerChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newBroker = e.target.value;
    setCurrentBroker(newBroker);
    setIsSyncing(true);
    try {
      await triggerBrokerSync(newBroker);
      onRefresh();
    } catch (err) {
      console.error("Broker sync failed:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRiskChange = async (newScore: number) => {
    setCurrentRisk(newScore);
    setIsRiskMenuOpen(false);
    try {
      await updateRiskProfile(newScore, currentBroker);
      onRefresh();
    } catch (err) {
      console.error("Failed to update risk profile:", err);
    }
  };

  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: "portfolio", label: "Portfolio", icon: <PieChart className="w-4 h-4" /> },
    { id: "screener", label: "Stock Screener", icon: <Search className="w-4 h-4" />, badge: "Live" },
    { id: "ipos", label: "IPOs", icon: <Rocket className="w-4 h-4" /> },
    { id: "bonds", label: "Bonds & SGB", icon: <Landmark className="w-4 h-4" /> },
    { id: "etfs", label: "ETFs", icon: <Layers className="w-4 h-4" /> },
    { id: "intelligence", label: "Pro Analytics", icon: <BrainCircuit className="w-4 h-4" />, badge: "AI" },
    { id: "backtest", label: "Backtest", icon: <BarChart3 className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header Row */}
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectTab("portfolio")}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-indigo-600 flex items-center justify-center shadow-md shadow-emerald-600/20 text-white">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">NiveshDristi</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                  v2.0 Live
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 hidden sm:block">
                Intelligent Portfolio & Market Co-Pilot
              </p>
            </div>
          </div>

          {/* Quick Actions & Controls */}
          <div className="flex items-center space-x-2.5">
            
            {/* Broker Dropdown */}
            <div className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-medium text-slate-500">Broker:</span>
              <select
                value={currentBroker}
                onChange={handleBrokerChange}
                disabled={isSyncing}
                className="bg-transparent font-semibold text-slate-800 outline-none cursor-pointer"
              >
                <option value="Zerodha Kite">Zerodha Kite</option>
                <option value="Groww">Groww</option>
                <option value="Upstox">Upstox</option>
                <option value="AngelOne">AngelOne</option>
              </select>
            </div>

            {/* Risk Score Pill */}
            <div className="relative">
              <button
                onClick={() => setIsRiskMenuOpen(!isRiskMenuOpen)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition-colors text-xs font-semibold"
              >
                <Shield className="w-3.5 h-3.5 text-indigo-600" />
                <span>Risk: {currentRisk}/10</span>
                <SlidersHorizontal className="w-3 h-3 text-indigo-500 ml-1" />
              </button>

              {isRiskMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 p-3 rounded-2xl bg-white border border-slate-200 shadow-xl z-50 text-slate-800">
                  <div className="text-xs font-bold text-slate-900 mb-2">Adjust Risk Tolerance</div>
                  <div className="space-y-1.5">
                    {[
                      { score: 3, label: "Conservative (3/10)", desc: "Low Volatility & SGB" },
                      { score: 6, label: "Moderate (6/10)", desc: "Balanced Large & Mid" },
                      { score: 9, label: "Aggressive (9/10)", desc: "High Growth & Alpha" }
                    ].map((item) => (
                      <button
                        key={item.score}
                        onClick={() => handleRiskChange(item.score)}
                        className={`w-full text-left p-2 rounded-lg text-xs transition-colors ${
                          currentRisk === item.score
                            ? "bg-indigo-600 text-white font-bold"
                            : "hover:bg-slate-100 text-slate-700"
                        }`}
                      >
                        <div className="font-semibold">{item.label}</div>
                        <div className={`text-[10px] ${currentRisk === item.score ? "text-indigo-200" : "text-slate-500"}`}>
                          {item.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Add Holding Button */}
            <button
              onClick={onOpenAddModal}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Holding</span>
            </button>

            {/* Sync / Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isSyncing}
              title="Refresh live metrics"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin text-emerald-600" : ""}`} />
            </button>
          </div>
        </div>

        {/* Tab Navigation Row */}
        <div className="flex items-center space-x-1 overflow-x-auto py-2 border-t border-slate-100 no-scrollbar">
          {navItems.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                    isActive ? "bg-emerald-400 text-slate-950" : "bg-emerald-100 text-emerald-800"
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
