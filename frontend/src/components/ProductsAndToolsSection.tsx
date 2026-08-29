"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Rocket,
  Landmark,
  Layers,
  Calendar,
  Zap,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Filter,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  DollarSign,
  Briefcase,
  Sliders,
  AlertCircle,
  Eye,
  Plus
} from "lucide-react";
import { 
  IpoItem, 
  BondItem, 
  EtfItem, 
  MtfStockItem, 
  CorporateEventItem,
  OptionSetupItem 
} from "@/types";
import { 
  fetchIpos, 
  fetchBonds, 
  fetchEtfs, 
  fetchMtfStocks, 
  fetchEventsCalendar, 
  fetchOptionsScreener 
} from "@/lib/api";
import { IpoSection } from "./IpoSection";
import { BondsSection } from "./BondsSection";
import { EtfsSection } from "./EtfsSection";
import { OptionsScreenerView } from "./OptionsScreenerView";

export type ProductToolTab = "fno" | "ipos" | "bonds" | "etfs" | "events" | "mtf";

interface ProductsAndToolsSectionProps {
  initialTab?: ProductToolTab;
  onOpenStockDetail?: (ticker: string) => void;
  onOpenTechnicalDrawer?: (ticker: string) => void;
  onOpenAddModalWithTicker?: (ticker: string, name: string, sector: string, price: number) => void;
}

export const ProductsAndToolsSection: React.FC<ProductsAndToolsSectionProps> = ({
  initialTab = "fno",
  onOpenStockDetail,
  onOpenTechnicalDrawer,
  onOpenAddModalWithTicker,
}) => {
  const [activeTab, setActiveTab] = useState<ProductToolTab>(initialTab);

  // MTF State
  const [mtfStocks, setMtfStocks] = useState<MtfStockItem[]>([]);
  const [mtfLoading, setMtfLoading] = useState<boolean>(false);
  const [mtfSearch, setMtfSearch] = useState<string>("");
  const [mtfSectorFilter, setMtfSectorFilter] = useState<string>("all");

  // Events Calendar State
  const [events, setEvents] = useState<CorporateEventItem[]>([]);
  const [eventsLoading, setEventsLoading] = useState<boolean>(false);
  const [eventTypeFilter, setEventTypeFilter] = useState<string>("all");

  useEffect(() => {
    if (activeTab === "mtf" && mtfStocks.length === 0) {
      loadMtfStocks();
    } else if (activeTab === "events" && events.length === 0) {
      loadEvents();
    }
  }, [activeTab]);

  const loadMtfStocks = async () => {
    setMtfLoading(true);
    try {
      const data = await fetchMtfStocks();
      setMtfStocks(data);
    } catch (e) {
      console.error("Failed to load MTF stocks:", e);
    } finally {
      setMtfLoading(false);
    }
  };

  const loadEvents = async () => {
    setEventsLoading(true);
    try {
      const data = await fetchEventsCalendar();
      setEvents(data);
    } catch (e) {
      console.error("Failed to load events calendar:", e);
    } finally {
      setEventsLoading(false);
    }
  };

  const navItems: { id: ProductToolTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: "fno", label: "Futures & Options (F&O)", icon: <TrendingUp className="w-4 h-4 text-indigo-600" />, badge: "High Conviction" },
    { id: "ipos", label: "IPOs & GMP", icon: <Rocket className="w-4 h-4 text-emerald-600" />, badge: "Live GMP" },
    { id: "bonds", label: "Bonds & SGBs", icon: <Landmark className="w-4 h-4 text-amber-600" /> },
    { id: "etfs", label: "ETFs Hub", icon: <Layers className="w-4 h-4 text-blue-600" /> },
    { id: "events", label: "Events Calendar", icon: <Calendar className="w-4 h-4 text-purple-600" />, badge: "Earnings & Div" },
    { id: "mtf", label: "MTF Stocks (4x-5x)", icon: <Zap className="w-4 h-4 text-rose-600" />, badge: "Leverage" },
  ];

  // MTF Filters
  const filteredMtf = mtfStocks.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(mtfSearch.toLowerCase()) || 
                          s.ticker.toLowerCase().includes(mtfSearch.toLowerCase()) ||
                          s.sector.toLowerCase().includes(mtfSearch.toLowerCase());
    const matchesSector = mtfSectorFilter === "all" || s.sector.toLowerCase() === mtfSectorFilter.toLowerCase();
    return matchesSearch && matchesSector;
  });

  const mtfSectors = ["all", ...Array.from(new Set(mtfStocks.map((s) => s.sector)))];

  // Events Filters
  const filteredEvents = events.filter((ev) => {
    if (eventTypeFilter === "all") return true;
    return ev.event_type.toLowerCase() === eventTypeFilter.toLowerCase();
  });

  return (
    <div className="space-y-6">
      
      {/* 1. Header Banner */}
      <div className="light-card rounded-3xl p-6 bg-gradient-to-r from-indigo-50/70 via-white to-purple-50/70 border border-slate-200 shadow-xs">
        <div className="max-w-4xl space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-black">
            <Layers className="w-3.5 h-3.5" />
            <span>Products & Market Tools Hub</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Institutional Derivatives, Fixed Income & Leverage Products
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Explore F&O option setups, live Grey Market Premium (GMP) IPOs, Sovereign Gold Bonds, thematic ETFs, corporate financial calendars, and Margin Trading Facility (MTF).
          </p>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="mt-6 flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none border-t border-slate-200/80 pt-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                activeTab === item.id
                  ? "bg-slate-900 text-white shadow-md shadow-slate-900/10 scale-100"
                  : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge && (
                <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md ${
                  activeTab === item.id ? "bg-white/20 text-white" : "bg-indigo-50 text-indigo-700"
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Active Tab Content */}
      <div className="animate-fadeIn">
        {/* TAB 1: F&O */}
        {activeTab === "fno" && (
          <div className="space-y-6">
            <OptionsScreenerView />
          </div>
        )}

        {/* TAB 2: IPOs */}
        {activeTab === "ipos" && (
          <div className="space-y-6">
            <IpoSection />
          </div>
        )}

        {/* TAB 3: Bonds & SGBs */}
        {activeTab === "bonds" && (
          <div className="space-y-6">
            <BondsSection />
          </div>
        )}

        {/* TAB 4: ETFs */}
        {activeTab === "etfs" && (
          <div className="space-y-6">
            <EtfsSection />
          </div>
        )}

        {/* TAB 5: Events Calendar */}
        {activeTab === "events" && (
          <div className="light-card rounded-2xl p-6 border border-slate-200 bg-white shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <span>Corporate Events & Earnings Calendar</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upcoming Dividend Ex-Dates, Quarterly Results, Demergers, Splits & Board Meetings
                </p>
              </div>

              {/* Event Type Filter */}
              <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold">
                {[
                  { id: "all", label: "All Events" },
                  { id: "dividend", label: "Dividends" },
                  { id: "earnings", label: "Earnings (Q2)" },
                  { id: "split", label: "Splits / Bonus" },
                  { id: "board_meeting", label: "Board Meetings" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setEventTypeFilter(f.id)}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                      eventTypeFilter === f.id ? "bg-white text-slate-900 shadow-xs font-black" : "text-slate-600"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {eventsLoading ? (
              <div className="py-16 text-center">
                <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs text-slate-500 font-bold mt-2">Loading corporate announcements...</p>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="py-12 text-center text-slate-400 font-bold text-xs">
                No events found matching the selected filter.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredEvents.map((ev, i) => (
                  <div
                    key={i}
                    onClick={() => onOpenStockDetail && onOpenStockDetail(ev.ticker)}
                    className="light-card rounded-2xl p-5 border border-slate-200 hover:border-purple-300 hover:shadow-md transition cursor-pointer bg-white space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-extrabold text-slate-900 text-sm">{ev.company_name}</span>
                          <div className="text-[11px] font-mono font-bold text-slate-500 mt-0.5">{ev.ticker}</div>
                        </div>

                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase ${
                          ev.event_type === "DIVIDEND" ? "bg-emerald-100 text-emerald-800" :
                          ev.event_type === "EARNINGS" ? "bg-purple-100 text-purple-800" :
                          ev.event_type === "SPLIT" ? "bg-blue-100 text-blue-800" :
                          "bg-amber-100 text-amber-800"
                        }`}>
                          {ev.event_type.replace("_", " ")}
                        </span>
                      </div>

                      <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                        <div className="text-xs font-bold text-slate-800">{ev.description}</div>
                        {ev.action_item && (
                          <div className="text-[11px] text-slate-500 leading-relaxed">{ev.action_item}</div>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-semibold flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Date: <b className="text-slate-800">{ev.event_date}</b></span>
                      </span>

                      <span className="text-purple-700 font-bold text-[11px] flex items-center space-x-1">
                        <span>View Groww Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 6: MTF Stocks */}
        {activeTab === "mtf" && (
          <div className="light-card rounded-2xl p-6 border border-slate-200 bg-white shadow-xs space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-rose-600" />
                    <span>Margin Trading Facility (MTF) Screener</span>
                  </h3>
                  <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800">
                    Up to 5x Leverage
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  SEBI Approved Category-1/2 equities eligible for leveraged intraday & delivery holdings with verified margin ratios
                </p>
              </div>

              {/* Search Box */}
              <div className="relative w-full lg:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={mtfSearch}
                  onChange={(e) => setMtfSearch(e.target.value)}
                  placeholder="Search MTF stock..."
                  className="w-full pl-9 pr-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:border-rose-500 outline-none"
                />
              </div>
            </div>

            {/* MTF Sector Filter Pills */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
              {mtfSectors.map((sec) => (
                <button
                  key={sec}
                  onClick={() => setMtfSectorFilter(sec)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer capitalize whitespace-nowrap ${
                    mtfSectorFilter.toLowerCase() === sec.toLowerCase()
                      ? "bg-rose-600 text-white shadow-xs"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  {sec === "all" ? "All Sectors" : sec}
                </button>
              ))}
            </div>

            {mtfLoading ? (
              <div className="py-16 text-center">
                <div className="w-8 h-8 border-3 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs text-slate-500 font-bold mt-2">Loading MTF approved list...</p>
              </div>
            ) : filteredMtf.length === 0 ? (
              <div className="py-12 text-center text-slate-400 font-bold text-xs">
                No MTF stocks match your filter criteria.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMtf.map((stock) => {
                  const isPositive = stock.day_change_pct >= 0;

                  return (
                    <div
                      key={stock.ticker}
                      onClick={() => onOpenStockDetail && onOpenStockDetail(stock.ticker)}
                      className="light-card rounded-2xl p-5 border border-slate-200 hover:border-rose-300 hover:shadow-md transition cursor-pointer bg-white flex flex-col justify-between space-y-3 group"
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-black text-slate-900 text-sm group-hover:text-rose-700 transition">
                              {stock.name}
                            </span>
                            <div className="text-[11px] font-mono text-slate-500 font-bold mt-0.5">
                              {stock.ticker} • {stock.sector}
                            </div>
                          </div>

                          <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-rose-100 text-rose-800 font-mono">
                            {stock.leverage_multiplier}x
                          </span>
                        </div>

                        {/* Leverage Ratios Grid */}
                        <div className="grid grid-cols-2 gap-2 mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px]">
                          <div>
                            <span className="text-slate-400 block font-semibold">Margin Required:</span>
                            <b className="text-slate-800 font-mono text-xs">{stock.margin_required_pct}%</b>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-semibold">Daily Interest:</span>
                            <b className="text-slate-800 font-mono text-xs">{stock.funding_rate_daily_pct}% / day</b>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-semibold">Annual Rate:</span>
                            <b className="text-slate-800 font-mono text-xs">{stock.funding_rate_annual_pct}% p.a.</b>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-semibold">Holding Period:</span>
                            <b className="text-emerald-700 font-mono text-xs">Up to 365 Days</b>
                          </div>
                        </div>
                      </div>

                      {/* Price & Actions */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-slate-400 font-medium">Live Spot Price</div>
                          <div className="font-extrabold text-slate-900 text-sm font-mono">
                            ₹{stock.current_price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onOpenAddModalWithTicker) {
                                onOpenAddModalWithTicker(stock.ticker, stock.name, stock.sector, stock.current_price);
                              }
                            }}
                            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black transition cursor-pointer flex items-center space-x-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Buy MTF</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};
