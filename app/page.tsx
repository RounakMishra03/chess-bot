import ChessGame from "@/components/ChessGame";
import { Bot, Sparkles, BrainCircuit } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 md:p-8">
      {/* Top Header */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between pb-6 border-b border-slate-800/80 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">Chess-Bot</h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Phase 2
              </span>
            </div>
            <p className="text-xs text-slate-400">Bot v1: Minimax Material Engine (Depth 2)</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
          <BrainCircuit className="w-3.5 h-3.5 text-blue-400" />
          <span>AI Search: <strong>Minimax (2 plies)</strong></span>
          <span className="text-slate-600">|</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Rules: <strong>chess.js</strong></span>
        </div>
      </header>

      {/* Main Chess Area */}
      <main className="flex-1 flex items-center justify-center w-full">
        <ChessGame />
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto pt-6 border-t border-slate-800/80 text-center text-xs text-slate-500 mt-6">
        <span>Chess-Bot • Phase 2: Minimax search looking 2 plies ahead with piece evaluation &amp; bot toggle</span>
      </footer>
    </div>
  );
}
