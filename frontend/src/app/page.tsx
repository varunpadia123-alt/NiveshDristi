"use client";

import React, { useState, useEffect } from "react";
import { 
  fetchPortfolioSummary, 
  fetchHoldings, 
  deleteHolding 
} from "@/lib/api";
import { PortfolioSummary, Holding } from "@/types";
import { Navbar } from "@/components/Navbar";
import { PortfolioOverview } from "@/components/PortfolioOverview";
import { SectorHeatmap } from "@/components/SectorHeatmap";
import { HoldingsTable } from "@/components/HoldingsTable";
import { SwapModal } from "@/components/SwapModal";
import { TechnicalDrawer } from "@/components/TechnicalDrawer";
import { BacktestSandbox } from "@/components/BacktestSandbox";
import { AddHoldingModal } from "@/components/AddHoldingModal";
import { Sparkles, ShieldAlert, CheckCircle2, AlertCircle } from "lucide-react";

export default function DashboardPage() {
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals & Drawers state
  const [selectedHoldingForSwap, setSelectedHoldingForSwap] = useState<Holding | null>(null);
  const [selectedTickerForDrawer, setSelectedTickerForDrawer] = useState<string | null>(null);
  const [isBacktestOpen, setIsBacktestOpen] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [selectedSectorFilter, setSelectedSectorFilter] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sum, hld] = await Promise.all([
        fetchPortfolioSummary(),
        fetchHoldings()
      ]);
      setSummary(sum);
      setHoldings(hld);
    } catch (err: any) {
      console.error(err);
      setError("Unable to connect to NiveshDristi backend engine. Ensure FastAPI server is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleDeleteHolding = async (id: number) => {
    if (!confirm("Are you sure you want to remove this holding?")) return;
    try {
      await deleteHolding(id);
      showToast("Position successfully removed.");
      loadData();
    } catch (e: any) {
      showToast(e.message || "Failed to remove position");
    }
  };

  const handleSwapSuccess = () => {
    showToast("Smart Swap executed successfully! Portfolio updated.");
    loadData();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 px-4 py-3 rounded-2xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-2xl shadow-emerald-500/30 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        brokerConnected={summary?.broker_connected || "Zerodha Kite"}
        riskScore={6}
        onRefresh={loadData}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenBacktest={() => setIsBacktestOpen(true)}
      />

      {/* Main Dashboard Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Error Banner */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={loadData}
              className="px-3 py-1 bg-rose-500 text-white rounded-lg text-xs font-semibold hover:bg-rose-400"
            >
              Retry
            </button>
          </div>
        )}

        {/* 1. Portfolio KPI Overview Cards */}
        <PortfolioOverview summary={summary} loading={loading} />

        {/* 2. Sector Exposure Heatmap with 25% Guardrail */}
        {summary && summary.sector_exposures && (
          <SectorHeatmap
            exposures={summary.sector_exposures}
            selectedSector={selectedSectorFilter}
            onSelectSector={(sec) => setSelectedSectorFilter(sec || null)}
          />
        )}

        {/* 3. Holdings Management & Actionable Signals Table */}
        <HoldingsTable
          holdings={holdings}
          loading={loading}
          selectedSectorFilter={selectedSectorFilter}
          onClearSectorFilter={() => setSelectedSectorFilter(null)}
          onOpenSwapModal={(h) => setSelectedHoldingForSwap(h)}
          onOpenTechnicalDrawer={(t) => setSelectedTickerForDrawer(t)}
          onDeleteHolding={handleDeleteHolding}
        />

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} NiveshDristi Algorithmic Co-Pilot. All rights reserved.</p>
          <p className="text-[11px] text-slate-600 max-w-lg text-right">
            NiveshDristi computes automated technical indicators via pandas-ta & FinBERT NLP. Not SEBI registered investment advice.
          </p>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <SwapModal
        holding={selectedHoldingForSwap}
        isOpen={!!selectedHoldingForSwap}
        onClose={() => setSelectedHoldingForSwap(null)}
        onSwapSuccess={handleSwapSuccess}
      />

      <TechnicalDrawer
        ticker={selectedTickerForDrawer}
        isOpen={!!selectedTickerForDrawer}
        onClose={() => setSelectedTickerForDrawer(null)}
      />

      <BacktestSandbox
        isOpen={isBacktestOpen}
        onClose={() => setIsBacktestOpen(false)}
      />

      <AddHoldingModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          showToast("New asset added to portfolio.");
          loadData();
        }}
      />

    </div>
  );
}
