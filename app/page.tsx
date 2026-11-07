"use client";

import React, { useState } from "react";
import ChessGame from "@/components/ChessGame";
import BlunderPractice from "@/components/BlunderPractice";
import ProgressDashboard from "@/components/ProgressDashboard";
import {
  Swords,
  BrainCircuit,
  BarChart3,
  Bot,
  Sparkles,
  User,
  Shield,
} from "lucide-react";

type ActiveTab = "play" | "practice" | "progress";

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("play");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-3 sm:p-6 md:p-8">
      {/* Top Header */}
      <header className="max-w-6xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between pb-5 border-b border-slate-800/80 mb-6 gap-4">
        {/* Brand & Badge */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">Chess-Bot</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30">
                Phase 6 Product
              </span>
            </div>
            <p className="text-xs text-slate-400">Adaptive Bot &amp; Mistake Coach Platform</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab("play")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              activeTab === "play"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span>Play Arena</span>
          </button>

          <button
            onClick={() => setActiveTab("practice")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              activeTab === "practice"
                ? "bg-amber-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>Blunder Practice</span>
          </button>

          <button
            onClick={() => setActiveTab("progress")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              activeTab === "progress"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Progress</span>
          </button>
        </nav>

        {/* User Account / Profile Badge */}
        <div className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          <div className="w-6 h-6 rounded-full bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-blue-400">
            <User className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-semibold text-slate-200 block text-[11px]">Student Dev</span>
            <span className="text-[10px] text-amber-400 font-mono">1250 ELO</span>
          </div>
        </div>
      </header>

      {/* Main Active Hub */}
      <main className="flex-1 flex items-start justify-center w-full">
        {activeTab === "play" && <ChessGame />}
        {activeTab === "practice" && <BlunderPractice />}
        {activeTab === "progress" && <ProgressDashboard />}
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto pt-6 border-t border-slate-800/80 text-center text-xs text-slate-500 mt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>Chess-Bot • Complete Training System: Play, Analyze, and Master your Past Blunders</span>
        <span className="flex items-center gap-1.5 text-slate-500 text-[11px]">
          <Shield className="w-3 h-3 text-emerald-400" />
          Offline PWA Ready &bull; Local Profile Persistence
        </span>
      </footer>
    </div>
  );
}
