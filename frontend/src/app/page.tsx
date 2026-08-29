"use client";

import React, { useState, useEffect } from "react";
import { 
  fetchPortfolioSummary, 
  fetchHoldings, 
  deleteHolding 
} from "@/lib/api";
import { PortfolioSummary, Holding } from "@/types";
import { Navbar, NavTab } from "@/components/Navbar";
import { PortfolioOverview } from "@/components/PortfolioOverview";
import { SectorHeatmap } from "@/components/SectorHeatmap";
import { HoldingsTable } from "@/components/HoldingsTable";
import { SwapModal } from "@/components/SwapModal";
import { TechnicalDrawer } from "@/components/TechnicalDrawer";
import { BacktestSandbox } from "@/components/BacktestSandbox";
import { AddHoldingModal } from "@/components/AddHoldingModal";
import { MarketScreener } from "@/components/MarketScreener";
import { IndicesSection } from "@/components/IndicesSection";
import { ProductsAndToolsSection } from "@/components/ProductsAndToolsSection";
import { StressTestingView } from "@/components/StressTestingView";
import { RebalancingAlertsView } from "@/components/RebalancingAlertsView";
import { TaxLossHarvestingView } from "@/components/TaxLossHarvestingView";
import { CorrelationMatrixView } from "@/components/CorrelationMatrixView";
import { StockDetailModal } from "@/components/StockDetailModal";
import { AiStockAnalystModal } from "@/components/AiStockAnalystModal";
import { AiChatAdvisor } from "@/components/AiChatAdvisor";

import { 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ShieldAlert, 
  Scale, 
  ReceiptText, 
  Network, 
  Zap,
  Layers,
  MessageSquare
} from "lucide-react";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<NavTab>("portfolio");
  const [proSubTab, setProSubTab] = useState<"stress" | "rebalance" | "tax" | "correlation">("stress");

  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals & Drawers state
  const [selectedHoldingForSwap, setSelectedHoldingForSwap] = useState<Holding | null>(null);
  const [selectedTickerForDrawer, setSelectedTickerForDrawer] = useState<string | null>(null);
  const [selectedTickerForDetail, setSelectedTickerForDetail] = useState<string | null>(null);
  const [selectedTickerForAiReport, setSelectedTickerForAiReport] = useState<string | null>(null);
  const [isBacktestOpen, setIsBacktestOpen] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [selectedSectorFilter, setSelectedSectorFilter] = useState<string | null>(null);
  const [isFloatingAdvisorOpen, setIsFloatingAdvisorOpen] = useState<boolean>(false);
  const [advisorInitialPrompt, setAdvisorInitialPrompt] = useState<string | null>(null);

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
      setError("Unable to connect to NiveshDristi backend engine. Ensure FastAPI server is running on port 8000.");
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

  const handleOpenAiChatWithPrompt = (prompt?: string) => {
    if (prompt) setAdvisorInitialPrompt(prompt);
    setActiveTab("advisor");
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 px-4 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-2xl shadow-emerald-600/30 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (tab === "backtest") {
            setIsBacktestOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        brokerConnected={summary?.broker_connected || "Zerodha Kite"}
        riskScore={6}
        onRefresh={loadData}
        onOpenAddModal={() => setIsAddModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Error Banner */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span className="font-semibold">{error}</span>
            </div>
            <button
              onClick={loadData}
              className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* 1. PORTFOLIO TAB */}
        {activeTab === "portfolio" && (
          <div className="space-y-6">
            <PortfolioOverview summary={summary} loading={loading} />

            {summary && summary.sector_exposures && (
              <SectorHeatmap
                exposures={summary.sector_exposures}
                selectedSector={selectedSectorFilter}
                onSelectSector={(sec) => setSelectedSectorFilter(sec || null)}
              />
            )}

            <HoldingsTable
              holdings={holdings}
              loading={loading}
              selectedSectorFilter={selectedSectorFilter}
              onClearSectorFilter={() => setSelectedSectorFilter(null)}
              onOpenSwapModal={(h) => setSelectedHoldingForSwap(h)}
              onOpenTechnicalDrawer={(t) => setSelectedTickerForDrawer(t)}
              onOpenStockDetail={(t) => setSelectedTickerForDetail(t)}
              onOpenAiReport={(t) => setSelectedTickerForAiReport(t)}
              onDeleteHolding={handleDeleteHolding}
            />
          </div>
        )}

        {/* 2. STOCK SCREENER & MARKET TAB (Groww-like with Live Charts) */}
        {activeTab === "screener" && (
          <MarketScreener
            onOpenStockDetail={(t) => setSelectedTickerForDetail(t)}
            onOpenTechnicalDrawer={(t) => setSelectedTickerForDrawer(t)}
            onOpenAiReport={(t) => setSelectedTickerForAiReport(t)}
            onOpenAddModalWithTicker={(ticker, name, sector, price) => {
              setIsAddModalOpen(true);
            }}
          />
        )}

        {/* 3. AI CHAT ADVISOR TAB */}
        {activeTab === "advisor" && (
          <AiChatAdvisor
            mode="embedded"
            initialPrompt={advisorInitialPrompt}
            onOpenStockDetail={(t) => setSelectedTickerForDetail(t)}
            onOpenAiReport={(t) => setSelectedTickerForAiReport(t)}
          />
        )}

        {/* 3. PRODUCTS & TOOLS HUB TAB */}
        {activeTab === "products_tools" && (
          <ProductsAndToolsSection
            onOpenStockDetail={(t) => setSelectedTickerForDetail(t)}
            onOpenTechnicalDrawer={(t) => setSelectedTickerForDrawer(t)}
            onOpenAddModalWithTicker={(t, n, s, p) => {
              setSelectedTickerForDrawer(null);
              setIsAddModalOpen(true);
            }}
          />
        )}

        {/* 4. INDICES HUB TAB (Indian & Global) */}
        {activeTab === "indices" && (
          <IndicesSection />
        )}

        {/* 5. PRO ANALYTICS TAB (Risk, Stress, Rebalance, Tax, Correlation) */}
        {activeTab === "intelligence" && (
          <div className="space-y-6">
            
            {/* Sub-Navigation Tabs */}
            <div className="light-card rounded-2xl p-2 bg-white border border-slate-200 flex flex-wrap items-center gap-1.5 shadow-xs">
              {[
                { id: "stress", label: "Stress Testing", icon: <ShieldAlert className="w-4 h-4" />, desc: "Nifty -20% Shock" },
                { id: "rebalance", label: "Rebalancing Alerts", icon: <Scale className="w-4 h-4" />, desc: "Allocation Drift" },
                { id: "tax", label: "Tax-Loss Harvesting", icon: <ReceiptText className="w-4 h-4" />, desc: "Offset Gains" },
                { id: "correlation", label: "Correlation Matrix", icon: <Network className="w-4 h-4" />, desc: "Holding Co-Movement" },
              ].map((sub) => {
                const isCurrent = proSubTab === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setProSubTab(sub.id as any)}
                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isCurrent
                        ? "bg-slate-900 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    {sub.icon}
                    <span>{sub.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Sub-Views */}
            {proSubTab === "stress" && <StressTestingView />}
            {proSubTab === "rebalance" && <RebalancingAlertsView />}
            {proSubTab === "tax" && <TaxLossHarvestingView />}
            {proSubTab === "correlation" && <CorrelationMatrixView />}

          </div>
        )}

      </main>

      {/* Floating AI Advisor trigger button (when not on advisor tab) */}
      {activeTab !== "advisor" && (
        <button
          onClick={() => setIsFloatingAdvisorOpen(!isFloatingAdvisorOpen)}
          className="fixed bottom-6 right-6 z-40 flex items-center space-x-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs shadow-2xl shadow-emerald-600/30 hover:scale-105 transition-all cursor-pointer group"
          title="Open AI Chat Advisor"
        >
          <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
          <span>AI Advisor</span>
        </button>
      )}

      {/* Floating AI Chat Advisor Widget */}
      {isFloatingAdvisorOpen && activeTab !== "advisor" && (
        <AiChatAdvisor
          mode="floating"
          isOpen={isFloatingAdvisorOpen}
          onClose={() => setIsFloatingAdvisorOpen(false)}
          onOpenStockDetail={(t) => {
            setIsFloatingAdvisorOpen(false);
            setSelectedTickerForDetail(t);
          }}
          onOpenAiReport={(t) => {
            setIsFloatingAdvisorOpen(false);
            setSelectedTickerForAiReport(t);
          }}
        />
      )}

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 py-6 text-center text-xs text-slate-500 bg-white">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-semibold">© {new Date().getFullYear()} NiveshDristi Algorithmic Co-Pilot. All rights reserved.</p>
          <p className="text-[11px] text-slate-400 max-w-lg text-right">
            NiveshDristi computes automated technical indicators via pandas-ta, FinBERT NLP & multi-asset financial modeling. Not fiduciary investment advice.
          </p>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <StockDetailModal
        ticker={selectedTickerForDetail}
        isOpen={!!selectedTickerForDetail}
        onClose={() => setSelectedTickerForDetail(null)}
        onOpenAiReport={(t) => setSelectedTickerForAiReport(t)}
        onOpenTechnicalDrawer={(t) => setSelectedTickerForDrawer(t)}
        onOpenAddHolding={() => setIsAddModalOpen(true)}
      />

      <AiStockAnalystModal
        ticker={selectedTickerForAiReport}
        isOpen={!!selectedTickerForAiReport}
        onClose={() => setSelectedTickerForAiReport(null)}
        onOpenLiveChart={(t) => setSelectedTickerForDetail(t)}
        onOpenAiChat={handleOpenAiChatWithPrompt}
      />

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

