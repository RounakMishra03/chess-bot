"use client";

import React, { useState } from "react";
import { Chessboard } from "react-chessboard";
import { BlunderReport, GameReviewReport } from "@/types/coach";
import {
  X,
  Sparkles,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
} from "lucide-react";

interface MistakeCoachModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: GameReviewReport;
}

export default function MistakeCoachModal({
  isOpen,
  onClose,
  report,
}: MistakeCoachModalProps) {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<"played" | "recommended">("played");

  if (!isOpen) return null;

  const currentBlunder: BlunderReport | undefined =
    report.blunders[selectedIndex];

  // Pick board position based on view mode
  const currentFen = currentBlunder
    ? viewMode === "played"
      ? currentBlunder.fenAfterPlayed
      : currentBlunder.fenAfterBest
    : "start";

  // Square highlights for the blunder review
  const squareStyles: Record<string, React.CSSProperties> = {};
  if (currentBlunder) {
    if (viewMode === "played") {
      squareStyles[currentBlunder.playedMoveTo] = {
        backgroundColor: "rgba(239, 68, 68, 0.45)", // Red highlight on blunder square
      };
    } else {
      squareStyles[currentBlunder.bestMoveTo] = {
        backgroundColor: "rgba(16, 185, 129, 0.45)", // Emerald highlight on recommended square
      };
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Mistake Coach Review
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {report.accuracyScore}% Accuracy
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {report.blunders.length === 0
                  ? "Flawless game! No major blunders detected."
                  : `Top ${report.blunders.length} mistakes identified and explained.`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {report.blunders.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <CheckCircle2 className="w-14 h-14 text-emerald-400 mb-3" />
            <h3 className="text-base font-semibold text-slate-100">
              Outstanding Play!
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              You played with high precision and did not commit any game-changing
              blunders. Keep up this level of tactical discipline!
            </p>
            <button
              onClick={onClose}
              className="mt-6 py-2 px-5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium cursor-pointer"
            >
              Back to Game
            </button>
          </div>
        ) : (
          <div className="p-6 flex flex-col lg:flex-row gap-6">
            {/* Left: Review Chessboard */}
            <div className="w-full lg:w-[380px] flex flex-col items-center">
              {/* Position View Toggle */}
              <div className="w-full flex rounded-lg bg-slate-950 p-1 mb-2 border border-slate-800 text-xs">
                <button
                  onClick={() => setViewMode("played")}
                  className={`flex-1 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                    viewMode === "played"
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  What You Played
                </button>
                <button
                  onClick={() => setViewMode("recommended")}
                  className={`flex-1 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                    viewMode === "recommended"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Recommended Move
                </button>
              </div>

              {/* Review Board */}
              <div className="w-full aspect-square bg-slate-950 border border-slate-800 rounded-xl overflow-hidden p-2 shadow-inner">
                <Chessboard
                  options={{
                    position: currentFen,
                    boardOrientation: "white",
                    allowDragging: false, // Read-only review board
                    darkSquareStyle: { backgroundColor: "#334155" },
                    lightSquareStyle: { backgroundColor: "#cbd5e1" },
                    squareStyles: squareStyles,
                  }}
                />
              </div>

              <span className="text-[11px] text-slate-500 mt-2 text-center">
                {viewMode === "played"
                  ? `Showing board after your move ${currentBlunder?.turnNumber}. ${currentBlunder?.playedMoveSan}`
                  : `Showing board after engine suggestion ${currentBlunder?.turnNumber}. ${currentBlunder?.bestMoveSan}`}
              </span>
            </div>

            {/* Right: Blunder Selector & Coaching Tips */}
            <div className="flex-1 flex flex-col justify-between space-y-4">
              {/* Blunder Selection Tabs */}
              <div>
                <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider block mb-2">
                  Select Mistake to Review
                </span>
                <div className="space-y-2">
                  {report.blunders.map((blunder, idx) => {
                    const isSelected = idx === selectedIndex;
                    return (
                      <button
                        key={blunder.id}
                        onClick={() => {
                          setSelectedIndex(idx);
                          setViewMode("played");
                        }}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? "bg-slate-800 border-amber-500/50 shadow-md"
                            : "bg-slate-950/40 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {blunder.severity === "blunder" ? (
                            <AlertOctagon className="w-4 h-4 text-rose-400 flex-shrink-0" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-slate-100">
                                Move {blunder.turnNumber}. {blunder.playedMoveSan}
                              </span>
                              <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                                {blunder.category}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500">
                              Suggestion: <strong>{blunder.bestMoveSan}</strong>
                            </span>
                          </div>
                        </div>

                        <span className="text-xs font-mono text-rose-400 font-semibold">
                          -{(blunder.evalDrop / 100).toFixed(1)} pawns
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Coaching Feedback Card */}
              {currentBlunder && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                    <Sparkles className="w-4 h-4" />
                    Coach's Explanation
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {currentBlunder.explanation}
                  </p>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      You played:{" "}
                      <strong className="text-rose-400 font-mono">
                        {currentBlunder.playedMoveSan}
                      </strong>
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                    <span className="text-slate-400">
                      Best move:{" "}
                      <strong className="text-emerald-400 font-mono">
                        {currentBlunder.bestMoveSan}
                      </strong>
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  onClick={onClose}
                  className="py-2 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer transition-colors"
                >
                  Close Review
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
