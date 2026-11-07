"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { getRandomMove } from "@/lib/engine/randomBot";
import { getMinimaxMove } from "@/lib/engine/minimax";
import { evaluateBoard } from "@/lib/engine/evaluate";
import { BotType } from "@/types/chess";
import {
  RotateCcw,
  RefreshCw,
  ArrowLeftRight,
  Bot,
  User,
  AlertTriangle,
  Trophy,
  Flag,
  Cpu,
  Zap,
} from "lucide-react";

export default function ChessGame() {
  // Store chess.js game instance in a ref so it persists across renders without unnecessary re-instantiations
  const gameRef = useRef<Chess>(new Chess());
  const botTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // React state to trigger UI re-renders
  const [fen, setFen] = useState<string>(gameRef.current.fen());
  const [boardOrientation, setBoardOrientation] = useState<"white" | "black">("white");
  const [botType, setBotType] = useState<BotType>("minimax-v1");
  const [isBotThinking, setIsBotThinking] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("Your turn (White)");
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isInCheck, setIsInCheck] = useState<boolean>(false);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [currentEval, setCurrentEval] = useState<number>(0);
  const [calcTimeMs, setCalcTimeMs] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Client-side mount check to prevent Next.js hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Updates status messages based on game state
  const updateGameStatus = useCallback(() => {
    const game = gameRef.current;
    const inCheck = game.inCheck();
    setIsInCheck(inCheck);

    // Compute board evaluation score (material balance)
    const score = evaluateBoard(game);
    setCurrentEval(score);

    if (game.isCheckmate()) {
      setIsGameOver(true);
      const winner = game.turn() === "w" ? "Black (Bot)" : "White (You)";
      setStatusMessage(`Checkmate! ${winner} wins! 🏆`);
    } else if (game.isDraw()) {
      setIsGameOver(true);
      if (game.isStalemate()) {
        setStatusMessage("Game Draw by Stalemate!");
      } else if (game.isThreefoldRepetition()) {
        setStatusMessage("Game Draw by Threefold Repetition!");
      } else if (game.isInsufficientMaterial()) {
        setStatusMessage("Game Draw by Insufficient Material!");
      } else {
        setStatusMessage("Game Draw (50-move rule)!");
      }
    } else if (inCheck) {
      const activePlayer = game.turn() === "w" ? "You (White)" : "Bot (Black)";
      setStatusMessage(`Check! ${activePlayer} is in check! ⚠️`);
    } else {
      const activePlayer = game.turn() === "w" ? "Your turn (White)" : "Bot's turn (Black)";
      setStatusMessage(activePlayer);
    }
  }, []);

  // Bot move logic: switches between Random Bot and Bot v1 (Minimax)
  const triggerBotMove = useCallback(() => {
    const game = gameRef.current;
    if (game.isGameOver() || game.turn() !== "b") return;

    setIsBotThinking(true);

    // Give a realistic 350ms delay so the UI feels responsive rather than instantaneously mechanical
    botTimeoutRef.current = setTimeout(() => {
      const startTime = performance.now();
      let chosenMove = null;

      if (botType === "random") {
        chosenMove = getRandomMove(game);
      } else {
        // Bot v1: Minimax depth 2 (calculates 1 bot move + 1 player counter-move)
        const minimaxResult = getMinimaxMove(game, 2);
        chosenMove = minimaxResult.move;
      }

      const elapsed = Math.round(performance.now() - startTime);
      setCalcTimeMs(elapsed);

      if (chosenMove) {
        try {
          game.move(chosenMove);
          setFen(game.fen());
          setMoveHistory(game.history());
          updateGameStatus();
        } catch {
          // If move fails, do nothing
        }
      }
      setIsBotThinking(false);
    }, 350);
  }, [botType, updateGameStatus]);

  // Handle player drag & drop
  const onPieceDrop = useCallback(
    ({
      sourceSquare,
      targetSquare,
    }: {
      piece: unknown;
      sourceSquare: string;
      targetSquare: string | null;
    }): boolean => {
      const game = gameRef.current;

      // Don't allow moves if game is over, if target is null, or if it's bot's turn
      if (isGameOver || !targetSquare || game.turn() !== "w") {
        return false;
      }

      // Try executing the move in chess.js
      try {
        const move = game.move({
          from: sourceSquare,
          to: targetSquare,
          promotion: "q", // Auto-promote to Queen for Phase 1/2 simplicity
        });

        if (!move) return false;

        // Move is legal! Update board and history
        setFen(game.fen());
        setMoveHistory(game.history());
        updateGameStatus();

        // If game continues, trigger the bot move
        if (!game.isGameOver()) {
          triggerBotMove();
        }

        return true;
      } catch {
        // Illegal move attempted
        return false;
      }
    },
    [isGameOver, updateGameStatus, triggerBotMove]
  );

  // New Game: Resets everything to the initial board position
  const handleNewGame = useCallback(() => {
    if (botTimeoutRef.current) {
      clearTimeout(botTimeoutRef.current);
    }
    gameRef.current.reset();
    setFen(gameRef.current.fen());
    setMoveHistory([]);
    setIsGameOver(false);
    setIsInCheck(false);
    setIsBotThinking(false);
    setCurrentEval(0);
    setCalcTimeMs(null);
    setStatusMessage("Your turn (White)");
  }, []);

  // Undo Move: Undoes both the bot's move and the player's last move so the player can try again
  const handleUndo = useCallback(() => {
    if (botTimeoutRef.current) {
      clearTimeout(botTimeoutRef.current);
      setIsBotThinking(false);
    }

    const game = gameRef.current;
    const historyLength = game.history().length;

    if (historyLength === 0) return;

    // If it's currently White's turn, bot already replied, so undo 2 half-moves (bot + user)
    // If it was somehow Black's turn (during bot delay), undo 1 half-move
    if (game.turn() === "w" && historyLength >= 2) {
      game.undo();
      game.undo();
    } else {
      game.undo();
    }

    setFen(game.fen());
    setMoveHistory(game.history());
    setIsGameOver(false);
    updateGameStatus();
  }, [updateGameStatus]);

  // Flip Board: Toggles perspective between White and Black
  const handleFlipBoard = useCallback(() => {
    setBoardOrientation((prev) => (prev === "white" ? "black" : "white"));
  }, []);

  // Format move history into numbered turns (e.g. 1. e4 e5)
  const formattedHistory = [];
  for (let i = 0; i < moveHistory.length; i += 2) {
    formattedHistory.push({
      turnNumber: Math.floor(i / 2) + 1,
      white: moveHistory[i],
      black: moveHistory[i + 1] || "",
    });
  }

  // Format evaluation score into readable format
  const formattedEval = (currentEval / 100).toFixed(1);
  const evalLabel =
    currentEval === 0
      ? "Even (0.0)"
      : currentEval > 0
      ? `White +${formattedEval}`
      : `Black ${formattedEval}`;

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-[500px] text-slate-400">
        Loading chessboard...
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 items-start justify-center">
      {/* Left Column: Chessboard */}
      <div className="flex-1 w-full max-w-[560px] mx-auto flex flex-col items-center">
        {/* Opponent Info Bar */}
        <div className="w-full flex items-center justify-between px-3 py-2 bg-slate-900 border border-slate-800 rounded-t-xl text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-slate-800 text-blue-400">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-slate-100">
                {botType === "minimax-v1" ? "Bot v1 (Minimax)" : "Random Bot"}{" "}
                <span className="text-slate-400 font-normal">(Black)</span>
              </span>
              <span className="ml-2 text-slate-500">
                {botType === "minimax-v1" ? "Calculates 2 moves ahead" : "Plays randomly"}
              </span>
            </div>
          </div>
          {isBotThinking ? (
            <span className="flex items-center gap-1.5 text-blue-400 font-medium animate-pulse">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Thinking...
            </span>
          ) : calcTimeMs !== null ? (
            <span className="text-slate-500 font-mono text-[11px] flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              {calcTimeMs}ms
            </span>
          ) : null}
        </div>

        {/* Board Component */}
        <div className="w-full aspect-square bg-slate-900 border-x border-slate-800 p-2 shadow-2xl relative">
          <Chessboard
            options={{
              position: fen,
              boardOrientation: boardOrientation,
              onPieceDrop: onPieceDrop,
              darkSquareStyle: { backgroundColor: "#334155" }, // Slate-700
              lightSquareStyle: { backgroundColor: "#cbd5e1" }, // Slate-300
              dropSquareStyle: {
                boxShadow: "inset 0 0 1px 4px #3b82f6",
              },
            }}
          />
        </div>

        {/* Player Info Bar */}
        <div className="w-full flex items-center justify-between px-3 py-2 bg-slate-900 border border-slate-800 rounded-b-xl text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-slate-800 text-emerald-400">
              <User className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-slate-100">You (White)</span>
              <span className="ml-2 text-slate-500">Student Developer</span>
            </div>
          </div>
          {!isBotThinking && !isGameOver && (
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              Your turn
            </span>
          )}
        </div>
      </div>

      {/* Right Column: Controls & Game Details */}
      <div className="w-full lg:w-80 flex flex-col gap-4">
        {/* Opponent Selector */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
          <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider flex items-center gap-1.5 mb-2.5">
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            Select Bot Opponent
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setBotType("minimax-v1")}
              className={`py-2 px-2.5 rounded-lg text-xs font-medium border transition-all text-left flex flex-col cursor-pointer ${
                botType === "minimax-v1"
                  ? "bg-blue-600/20 border-blue-500 text-blue-300 shadow-sm"
                  : "bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
              }`}
            >
              <span className="font-semibold text-slate-100">Bot v1</span>
              <span className="text-[10px] text-slate-400 mt-0.5">Minimax Depth 2</span>
            </button>

            <button
              onClick={() => setBotType("random")}
              className={`py-2 px-2.5 rounded-lg text-xs font-medium border transition-all text-left flex flex-col cursor-pointer ${
                botType === "random"
                  ? "bg-blue-600/20 border-blue-500 text-blue-300 shadow-sm"
                  : "bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
              }`}
            >
              <span className="font-semibold text-slate-100">Random Bot</span>
              <span className="text-[10px] text-slate-400 mt-0.5">Phase 1 Baseline</span>
            </button>
          </div>
        </div>

        {/* Status Card & Material Balance */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
              Game Status
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-mono font-medium ${
                currentEval === 0
                  ? "bg-slate-800 text-slate-300"
                  : currentEval > 0
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
              }`}
            >
              {evalLabel}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            {isGameOver ? (
              <Trophy className="w-5 h-5 text-amber-400 flex-shrink-0" />
            ) : isInCheck ? (
              <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 animate-bounce" />
            ) : (
              <Flag className="w-5 h-5 text-blue-400 flex-shrink-0" />
            )}
            <p
              className={`text-sm font-semibold ${
                isGameOver
                  ? "text-amber-300"
                  : isInCheck
                  ? "text-rose-300"
                  : "text-slate-100"
              }`}
            >
              {statusMessage}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-2.5">
          <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider block mb-1">
            Controls
          </span>

          <button
            onClick={handleNewGame}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors shadow-sm cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            New Game
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleUndo}
              disabled={moveHistory.length === 0}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 text-xs font-medium transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Undo
            </button>

            <button
              onClick={handleFlipBoard}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              Flip Board
            </button>
          </div>
        </div>

        {/* Move History Log */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex-1 min-h-[200px] flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
              Move History
            </span>
            <span className="text-xs text-slate-500">{moveHistory.length} moves</span>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[220px] pr-1 space-y-1 font-mono text-xs">
            {formattedHistory.length === 0 ? (
              <p className="text-slate-600 italic py-4 text-center">No moves yet. Make your first move!</p>
            ) : (
              formattedHistory.map((item) => (
                <div
                  key={item.turnNumber}
                  className="flex items-center justify-between px-2 py-1 rounded bg-slate-950/40 text-slate-300"
                >
                  <span className="text-slate-500 w-8">{item.turnNumber}.</span>
                  <span className="flex-1 text-slate-200">{item.white}</span>
                  <span className="flex-1 text-slate-400">{item.black}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
