"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Chess, Move } from "chess.js";
import { Chessboard } from "react-chessboard";
import { getPracticePuzzles, markPuzzleSolved, PracticePuzzle } from "@/lib/storage/gameStorage";
import {
  CheckCircle2,
  XCircle,
  Lightbulb,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Trophy,
  HelpCircle,
} from "lucide-react";

export default function BlunderPractice() {
  const [puzzles, setPuzzles] = useState<PracticePuzzle[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [fen, setFen] = useState<string>("start");
  const [feedback, setFeedback] = useState<{
    status: "idle" | "correct" | "incorrect" | "revealed";
    message: string;
  }>({ status: "idle", message: "" });
  const [isMounted, setIsMounted] = useState<boolean>(false);

  const gameRef = useRef<Chess>(new Chess());

  // Load puzzles on mount
  useEffect(() => {
    setIsMounted(true);
    const loaded = getPracticePuzzles();
    setPuzzles(loaded);
    if (loaded.length > 0) {
      loadPuzzle(loaded[0]);
    }
  }, []);

  const loadPuzzle = (puzzle: PracticePuzzle) => {
    try {
      gameRef.current = new Chess(puzzle.fenBefore);
      setFen(puzzle.fenBefore);
      setFeedback({
        status: "idle",
        message: `Your turn! Find the best move in this position.`,
      });
    } catch {
      // fallback
    }
  };

  const currentPuzzle: PracticePuzzle | undefined = puzzles[currentIndex];

  const handleNextPuzzle = () => {
    if (currentIndex < puzzles.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      loadPuzzle(puzzles[nextIdx]);
    } else {
      // Loop back or stay at end
      setCurrentIndex(0);
      loadPuzzle(puzzles[0]);
    }
  };

  const handleResetPuzzle = () => {
    if (currentPuzzle) {
      loadPuzzle(currentPuzzle);
    }
  };

  const handleShowHintOrSolution = () => {
    if (!currentPuzzle) return;
    setFeedback({
      status: "revealed",
      message: `Solution: The best move is ${currentPuzzle.bestMoveSan}. ${currentPuzzle.explanation}`,
    });
  };

  const onPieceDrop = useCallback(
    ({
      sourceSquare,
      targetSquare,
    }: {
      piece: unknown;
      sourceSquare: string;
      targetSquare: string | null;
    }): boolean => {
      if (!currentPuzzle || !targetSquare) return false;
      const game = gameRef.current;

      try {
        const move = game.move({
          from: sourceSquare,
          to: targetSquare,
          promotion: "q",
        });

        if (!move) return false;

        setFen(game.fen());

        // Check if the played move matches the best move SAN or square target
        const playedSan = move.san;
        const targetBestSan = currentPuzzle.bestMoveSan;

        if (
          playedSan === targetBestSan ||
          (move.from === currentPuzzle.bestMoveSan.slice(0, 2) &&
            move.to === currentPuzzle.bestMoveSan.slice(2, 4))
        ) {
          // Success! Correct move played
          markPuzzleSolved(currentPuzzle.id);
          setPuzzles((prev) =>
            prev.map((p, idx) => (idx === currentIndex ? { ...p, isSolved: true } : p))
          );
          setFeedback({
            status: "correct",
            message: `Brilliant! You found ${playedSan}! ${currentPuzzle.explanation}`,
          });
        } else if (playedSan === currentPuzzle.playerMoveSan) {
          // Player repeated their original mistake!
          setFeedback({
            status: "incorrect",
            message: `Careful! ${playedSan} was the blunder you made in the original game (${currentPuzzle.category}). Look for a better tactical response!`,
          });
        } else {
          // Other move played
          setFeedback({
            status: "incorrect",
            message: `You played ${playedSan}. That's a playable move, but not the sharpest tactic. Try another candidate!`,
          });
        }

        return true;
      } catch {
        return false;
      }
    },
    [currentPuzzle, currentIndex]
  );

  if (!isMounted || !currentPuzzle) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400">
        Loading blunder practice arena...
      </div>
    );
  }

  const solvedCount = puzzles.filter((p) => p.isSolved).length;

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col lg:flex-row gap-6 items-start justify-center">
      {/* Left: Chessboard */}
      <div className="flex-1 w-full max-w-[520px] mx-auto flex flex-col items-center">
        {/* Puzzle Header Bar */}
        <div className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-t-xl text-xs">
          <div className="flex items-center gap-2 text-slate-200">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="font-semibold">
              Puzzle {currentIndex + 1} of {puzzles.length}
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-amber-400 font-mono text-[11px] uppercase">
              {currentPuzzle.category}
            </span>
          </div>
          {currentPuzzle.isSolved ? (
            <span className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Solved
            </span>
          ) : (
            <span className="text-slate-400 text-[11px]">Unsolved</span>
          )}
        </div>

        {/* Interactive Practice Board */}
        <div className="w-full aspect-square bg-slate-900 border-x border-slate-800 p-2 shadow-2xl relative">
          <Chessboard
            options={{
              position: fen,
              boardOrientation: "white",
              onPieceDrop: onPieceDrop,
              darkSquareStyle: { backgroundColor: "#334155" },
              lightSquareStyle: { backgroundColor: "#cbd5e1" },
              dropSquareStyle: {
                boxShadow: "inset 0 0 1px 4px #f59e0b",
              },
            }}
          />
        </div>

        {/* Puzzle Prompt Bar */}
        <div className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-b-xl text-xs text-slate-300">
          <span className="text-slate-400 font-medium">Scenario: </span>
          <span>
            On move {currentPuzzle.turnNumber}, the previous move was{" "}
            <strong className="text-rose-400 font-mono">
              {currentPuzzle.playerMoveSan}
            </strong>{" "}
            ({currentPuzzle.category}). What should you play instead?
          </span>
        </div>
      </div>

      {/* Right: Feedback & Controls */}
      <div className="w-full lg:w-80 flex flex-col gap-4">
        {/* Progress Tracker Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
              Tactical Mastery
            </span>
            <span className="text-xs text-amber-400 font-bold">
              {solvedCount} / {puzzles.length} Solved
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300"
              style={{
                width: `${Math.round((solvedCount / puzzles.length) * 100)}%`,
              }}
            />
          </div>
        </div>

        {/* Feedback Alert Box */}
        <div
          className={`p-4 rounded-xl border shadow-lg transition-all ${
            feedback.status === "correct"
              ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-200"
              : feedback.status === "incorrect"
              ? "bg-rose-950/30 border-rose-500/40 text-rose-200"
              : feedback.status === "revealed"
              ? "bg-amber-950/30 border-amber-500/40 text-amber-200"
              : "bg-slate-900 border-slate-800 text-slate-300"
          }`}
        >
          <div className="flex items-center gap-2 mb-2 font-semibold text-xs">
            {feedback.status === "correct" ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Brilliant Move!</span>
              </>
            ) : feedback.status === "incorrect" ? (
              <>
                <XCircle className="w-4 h-4 text-rose-400" />
                <span>Try Again</span>
              </>
            ) : feedback.status === "revealed" ? (
              <>
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <span>Solution Hint</span>
              </>
            ) : (
              <>
                <HelpCircle className="w-4 h-4 text-blue-400" />
                <span>Find the Solution</span>
              </>
            )}
          </div>

          <p className="text-xs leading-relaxed opacity-90">{feedback.message}</p>
        </div>

        {/* Puzzle Navigation & Actions */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-2.5">
          <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider block mb-1">
            Puzzle Actions
          </span>

          <button
            onClick={handleNextPuzzle}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-sm cursor-pointer"
          >
            <span>Next Puzzle</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleResetPuzzle}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Board
            </button>

            <button
              onClick={handleShowHintOrSolution}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              Reveal Move
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
