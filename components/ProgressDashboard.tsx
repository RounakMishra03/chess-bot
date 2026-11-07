"use client";

import React, { useState, useEffect } from "react";
import { getSavedGames, getPracticePuzzles, SavedGame } from "@/lib/storage/gameStorage";
import {
  Trophy,
  User,
  Activity,
  Target,
  Sparkles,
  Calendar,
  ChevronRight,
  TrendingUp,
  ShieldAlert,
} from "lucide-react";

interface ProgressDashboardProps {
  onReviewGame?: (game: SavedGame) => void;
}

export default function ProgressDashboard({ onReviewGame }: ProgressDashboardProps) {
  const [games, setGames] = useState<SavedGame[]>([]);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
    setGames(getSavedGames());
  }, []);

  if (!isMounted) {
    return <div className="p-12 text-center text-slate-400">Loading progress data...</div>;
  }

  const puzzles = getPracticePuzzles();
  const solvedPuzzles = puzzles.filter((p) => p.isSolved).length;

  const totalGames = games.length;
  const wins = games.filter((g) => g.result === "win").length;
  const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;
  const avgAccuracy =
    totalGames > 0
      ? Math.round(games.reduce((acc, g) => acc + g.accuracy, 0) / totalGames)
      : 82; // Baseline estimate if no games logged yet

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Profile Overview Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg text-2xl font-bold">
            <User className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">Student Developer</h2>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Active Player
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Estimated Rating: <strong className="text-amber-400 font-mono">~1250 ELO</strong> • Club Level
            </p>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-3 w-full sm:w-auto">
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-center min-w-[90px]">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Win Rate</span>
            <span className="text-lg font-bold text-emerald-400 font-mono">{totalGames > 0 ? `${winRate}%` : "—"}</span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-center min-w-[90px]">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Avg Accuracy</span>
            <span className="text-lg font-bold text-blue-400 font-mono">{avgAccuracy}%</span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-center min-w-[90px]">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Puzzles Solved</span>
            <span className="text-lg font-bold text-amber-400 font-mono">{solvedPuzzles}</span>
          </div>
        </div>
      </div>

      {/* Analytics & Blunder Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Blunder Pattern Diagnostics */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Common Blunder Vulnerabilities
            </h3>
            <span className="text-[10px] text-slate-500">Coach Diagnosis</span>
          </div>

          <div className="space-y-3">
            {[
              { category: "Hanging Pieces", percentage: 40, color: "bg-rose-500", note: "Leaving unprotected pieces in early tactical skirmishes" },
              { category: "Lost Tempo", percentage: 28, color: "bg-amber-500", note: "Playing passive pawn moves instead of developing" },
              { category: "Missed Wins", percentage: 20, color: "bg-blue-500", note: "Overlooking decisive strikes when ahead" },
              { category: "King Safety", percentage: 12, color: "bg-purple-500", note: "Delaying castling or moving shield pawns" },
            ].map((item) => (
              <div key={item.category} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-200">{item.category}</span>
                  <span className="text-slate-400 font-mono">{item.percentage}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.percentage}%` }} />
                </div>
                <span className="text-[10px] text-slate-500 block">{item.note}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Training Suggestions */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Coach's Next Training Recommendation
            </h3>
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
              <h4 className="text-sm font-semibold text-slate-100">Focus: Piece Coordination</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your opening development with Knights is solid. Your biggest opportunity for rating growth is eliminating <strong>Hanging Pieces</strong> by scanning opponent threats before finalizing your move.
              </p>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center justify-between">
            <span>You have <strong>{puzzles.length - solvedPuzzles}</strong> unsolved blunder puzzles waiting!</span>
          </div>
        </div>
      </div>

      {/* Match History Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-blue-400" />
          Recent Game History
        </h3>

        {games.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs italic">
            No completed games saved yet. Play a match in the Arena and finish the game to log it here!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium">Opponent</th>
                  <th className="pb-2 font-medium">Result</th>
                  <th className="pb-2 font-medium">Accuracy</th>
                  <th className="pb-2 font-medium">Blunders</th>
                  <th className="pb-2 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {games.map((game) => (
                  <tr key={game.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 text-slate-400">{game.date}</td>
                    <td className="py-2.5 font-medium text-slate-200">{game.opponent}</td>
                    <td className="py-2.5">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                          game.result === "win"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : game.result === "loss"
                            ? "bg-rose-500/20 text-rose-400"
                            : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {game.result}
                      </span>
                    </td>
                    <td className="py-2.5 font-mono text-slate-200">{game.accuracy}%</td>
                    <td className="py-2.5 text-rose-400 font-mono">{game.blunders.length}</td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => onReviewGame?.(game)}
                        className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1 cursor-pointer"
                      >
                        Review
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
