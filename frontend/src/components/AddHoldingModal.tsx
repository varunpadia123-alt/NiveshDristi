"use client";

import React, { useState } from "react";
import { X, Plus, Sparkles, Building2, Tag, Calendar, DollarSign, Hash } from "lucide-react";
import { addHolding } from "@/lib/api";

interface AddHoldingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddHoldingModal: React.FC<AddHoldingModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [ticker, setTicker] = useState("");
  const [symbolName, setSymbolName] = useState("");
  const [sector, setSector] = useState("IT Services");
  const [quantity, setQuantity] = useState("10");
  const [averageBuyPrice, setAverageBuyPrice] = useState("1500");
  const [purchaseDate, setPurchaseDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const sectors = [
    "IT Services",
    "Energy",
    "Banking",
    "Automobile",
    "Consumer Goods",
    "Healthcare",
    "Finance & Lending"
  ];

  const presets = [
    { ticker: "TCS.NS", name: "Tata Consultancy Services", sector: "IT Services", price: "3950" },
    { ticker: "INFY.NS", name: "Infosys Ltd", sector: "IT Services", price: "1720" },
    { ticker: "RELIANCE.NS", name: "Reliance Industries", sector: "Energy", price: "1420" },
    { ticker: "HDFCBANK.NS", name: "HDFC Bank Ltd", sector: "Banking", price: "1720" },
    { ticker: "M&M.NS", name: "Mahindra & Mahindra", sector: "Automobile", price: "2950" }
  ];

  const applyPreset = (p: typeof presets[0]) => {
    setTicker(p.ticker);
    setSymbolName(p.name);
    setSector(p.sector);
    setAverageBuyPrice(p.price);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker.trim() || !symbolName.trim()) {
      setError("Please fill all required fields");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await addHolding({
        ticker: ticker.toUpperCase().trim(),
        symbol_name: symbolName.trim(),
        sector,
        quantity: parseFloat(quantity) || 1,
        average_buy_price: parseFloat(averageBuyPrice) || 100,
        purchase_date: purchaseDate
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to add asset position");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg glass-card rounded-3xl border border-white/15 shadow-2xl p-6 sm:p-8 bg-slate-900/95 my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/10">
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-white tracking-tight">
              Add Asset to Portfolio
            </h2>
            <p className="text-xs text-slate-400">
              Input new stock holding to begin automated indicator scoring.
            </p>
          </div>
        </div>

        {/* Presets Bar */}
        <div className="mb-5">
          <div className="text-[11px] font-semibold text-slate-400 mb-2">Quick Presets:</div>
          <div className="flex flex-wrap gap-1.5">
            {presets.map((p) => (
              <button
                key={p.ticker}
                type="button"
                onClick={() => applyPreset(p)}
                className="px-2.5 py-1 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer border border-white/5"
              >
                {p.ticker.replace(".NS", "")}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs mb-4">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Ticker Symbol (NSE)</label>
              <input
                type="text"
                placeholder="e.g. TCS.NS"
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Sector</label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-emerald-500"
              >
                {sectors.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Company / Symbol Name</label>
            <input
              type="text"
              placeholder="e.g. Tata Consultancy Services"
              value={symbolName}
              onChange={(e) => setSymbolName(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Quantity</label>
              <input
                type="number"
                step="any"
                min="0.1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Avg Buy Price (₹)</label>
              <input
                type="number"
                step="any"
                min="0.01"
                value={averageBuyPrice}
                onChange={(e) => setAverageBuyPrice(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Purchase Date</label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/25 transition cursor-pointer disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Position"}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
