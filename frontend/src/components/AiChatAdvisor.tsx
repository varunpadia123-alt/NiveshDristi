"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Sparkles,
  Send,
  Bot,
  User,
  TrendingUp,
  Shield,
  ReceiptText,
  Zap,
  Target,
  ArrowRight,
  Maximize2,
  Minimize2,
  X,
  RefreshCw,
  HelpCircle,
  ExternalLink,
  CheckCircle2
} from "lucide-react";
import { AiChatMessage, AiChatResponse } from "@/types";
import { sendAiChatMessage } from "@/lib/api";

interface AiChatAdvisorProps {
  mode?: "embedded" | "floating";
  isOpen?: boolean;
  onClose?: () => void;
  onOpenStockDetail?: (ticker: string) => void;
  onOpenAiReport?: (ticker: string) => void;
  initialPrompt?: string | null;
}

export const AiChatAdvisor: React.FC<AiChatAdvisorProps> = ({
  mode = "embedded",
  isOpen = true,
  onClose,
  onOpenStockDetail,
  onOpenAiReport,
  initialPrompt
}) => {
  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      role: "assistant",
      content: (
        "👋 Welcome to **NiveshDristi AI Financial Advisor**!\n\n" +
        "I'm your intelligent portfolio co-pilot. You can ask me to:\n" +
        "• **Analyze any Indian stock** (Targets, Stoploss, Support/Resistance & Signals)\n" +
        "• **Audit your portfolio risk** & recommend macro hedges (SGBs, Gold ETFs)\n" +
        "• **Optimize taxes** via Section 112A Tax-Loss Harvesting & Smart Swaps\n" +
        "• **Discover high-momentum sector breakouts** across Large, Mid & Small caps."
      ),
      suggested_actions: [
        "Analyze Tata Motors targets & stop loss",
        "How can I hedge against a 20% market crash?",
        "Show my tax-loss harvesting opportunities",
        "Top momentum IT & Defense stocks"
      ]
    }
  ]);

  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      handleSend(initialPrompt);
    }
  }, [initialPrompt]);

  const handleSend = async (textToSend?: string) => {
    const q = (textToSend || input).trim();
    if (!q || loading) return;

    const userMsg: AiChatMessage = {
      role: "user",
      content: q,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res: AiChatResponse = await sendAiChatMessage(newMessages);
      const assistantMsg: AiChatMessage = {
        role: "assistant",
        content: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        suggested_actions: res.suggested_followups
      };
      setMessages([...newMessages, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      const errorMsg: AiChatMessage = {
        role: "assistant",
        content: "⚠️ I encountered an error connecting to the intelligence engine. Please ensure the NiveshDristi backend server is running."
      };
      setMessages([...newMessages, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const parseStockTickers = (text: string) => {
    // Quick match for tickers like TATAMOTORS.NS or RELIANCE.NS
    const matches = text.match(/[A-Z0-9_]+\.(?:NS|BO)/g);
    return matches ? Array.from(new Set(matches)) : [];
  };

  // 1. FLOATING MODE
  if (mode === "floating") {
    if (!isOpen) return null;

    return (
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end animate-in fade-in slide-in-from-bottom-5">
        {isMinimized ? (
          <button
            onClick={() => setIsMinimized(false)}
            className="flex items-center space-x-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-xs shadow-xl shadow-emerald-600/30 hover:scale-105 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Advisor</span>
          </button>
        ) : (
          <div className="w-[380px] sm:w-[440px] h-[580px] max-h-[85vh] bg-white rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden">
            
            {/* Header */}
            <div className="px-4 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-bold">
                  <Sparkles className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <div className="text-xs font-black tracking-tight">NiveshDristi AI Advisor</div>
                  <div className="text-[10px] text-emerald-400 font-semibold flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1"></span>
                    Live Market Co-Pilot
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1 text-slate-400">
                <button
                  onClick={() => setIsMinimized(true)}
                  className="p-1.5 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
                {onClose && (
                  <button
                    onClick={onClose}
                    className="p-1.5 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs bg-slate-50/50">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex items-start space-x-2.5 ${m.role === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
                >
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                    m.role === "user" ? "bg-slate-900 text-white" : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                  }`}>
                    {m.role === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  <div className={`max-w-[82%] p-3.5 rounded-2xl ${
                    m.role === "user"
                      ? "bg-slate-900 text-white rounded-tr-xs"
                      : "bg-white text-slate-800 border border-slate-200 shadow-xs rounded-tl-xs"
                  }`}>
                    <div className="whitespace-pre-line leading-relaxed">
                      {m.content}
                    </div>

                    {/* Stock action pill if detected */}
                    {m.role === "assistant" && parseStockTickers(m.content).length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2 border-t border-slate-100">
                        {parseStockTickers(m.content).map((t) => (
                          <button
                            key={t}
                            onClick={() => onOpenAiReport && onOpenAiReport(t)}
                            className="inline-flex items-center space-x-1 px-2 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-extrabold hover:bg-emerald-100 transition cursor-pointer"
                          >
                            <Sparkles className="w-3 h-3 text-emerald-600" />
                            <span>Analyze {t.replace(".NS", "")}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Suggested follow-up chips */}
                    {m.suggested_actions && m.suggested_actions.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-slate-100 space-y-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Suggested Questions:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {m.suggested_actions.map((act, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSend(act)}
                              className="text-left px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-[10px] font-semibold text-slate-700 transition border border-slate-200/70 cursor-pointer"
                            >
                              {act}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-center space-x-2 text-slate-400 text-xs pl-9">
                  <div className="w-3.5 h-3.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  <span>AI Advisor is analyzing market models...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-white border-t border-slate-200">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about stocks, portfolio risk, targets..."
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 transition"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || loading}
                  className="absolute right-1.5 p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
    );
  }

  // 2. EMBEDDED MODE (Full Tab View in Dashboard)
  return (
    <div className="light-card rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden flex flex-col h-[750px]">
      
      {/* Top Bar */}
      <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50/40 via-white to-teal-50/40 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                AI Chat Advisor & Financial Intelligence
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                Active Co-Pilot
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Multi-asset conversational reasoning powered by 130+ technical metrics, FinBERT NLP & tax engines.
            </p>
          </div>
        </div>

        {/* Quick Quick Prompt Chips */}
        <div className="hidden lg:flex items-center space-x-2">
          {[
            { label: "Tata Motors Analysis", query: "Analyze Tata Motors targets & stop loss" },
            { label: "Portfolio Risk Check", query: "Analyze my portfolio risk & health" },
            { label: "Tax Harvesting", query: "How does Tax-Loss Harvesting save STCG tax?" }
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(item.query)}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-400 text-xs font-semibold text-slate-700 hover:text-emerald-800 transition cursor-pointer"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-50/40">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex items-start space-x-3.5 ${m.role === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
          >
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 text-sm font-bold shadow-xs ${
              m.role === "user"
                ? "bg-slate-900 text-white"
                : "bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-emerald-600/20"
            }`}>
              {m.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div className={`max-w-2xl p-5 rounded-3xl text-xs sm:text-sm ${
              m.role === "user"
                ? "bg-slate-900 text-white rounded-tr-xs shadow-md"
                : "bg-white text-slate-800 border border-slate-200 shadow-sm rounded-tl-xs"
            }`}>
              <div className="whitespace-pre-line leading-relaxed font-medium">
                {m.content}
              </div>

              {/* Action Buttons for identified stocks */}
              {m.role === "assistant" && parseStockTickers(m.content).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-slate-100">
                  {parseStockTickers(m.content).map((t) => (
                    <div key={t} className="flex items-center space-x-1.5">
                      {onOpenAiReport && (
                        <button
                          onClick={() => onOpenAiReport(t)}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition shadow-xs cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>AI Report ({t.replace(".NS", "")})</span>
                        </button>
                      )}
                      {onOpenStockDetail && (
                        <button
                          onClick={() => onOpenStockDetail(t)}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer"
                        >
                          <span>Live Chart</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Suggested Followups */}
              {m.suggested_actions && m.suggested_actions.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Recommended Follow-ups:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {m.suggested_actions.map((act, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(act)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-xs font-semibold text-slate-700 transition border border-slate-200/70 cursor-pointer"
                      >
                        {act}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-3 text-slate-400 text-xs pl-12">
            <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="font-semibold">AI Advisor is computing scenario projections...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="p-4 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about any stock (e.g. Tata Motors, Reliance), portfolio risk, tax strategy..."
            className="w-full pl-4 pr-12 py-3.5 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-slate-900 font-medium text-sm outline-none transition"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="absolute right-2 p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold transition shadow-sm cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
