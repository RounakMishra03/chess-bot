"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Chess, Move } from "chess.js";
import { Chessboard } from "react-chessboard";
import { getRandomMove } from "@/lib/engine/randomBot";
import { getMinimaxMove } from "@/lib/engine/minimax";
import { getSmartBotMove } from "@/lib/engine/alphaBeta";
import { evaluateBoard } from "@/lib/engine/evaluate";
import { BotType, DifficultyLevel } from "@/types/chess";
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
  Activity,
  Scissors,
} from "lucide-react";

export default function ChessGame() {
  const gameRef = useRef<Chess>(new Chess());
  const botTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const workerRef = useRef<Worker | null>(null);

  // Core Game State
  const [fen, setFen] = useState<string>(gameRef.current.fen());
  const [boardOrientation, setBoardOrientation] = useState<"white" | "black">("white");
  const [botType, setBotType] = useState<BotType>("smart-v2");
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("medium");
  const [isBotThinking, setIsBotThinking] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("Your turn (White)");
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isInCheck, setIsInCheck] = useState<boolean>(false);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [currentEval, setCurrentEval] = useState<number>(0);

  // Engine Performance Metrics
  const [calcTimeMs, setCalcTimeMs] = useState<number | null>(null);
  const [nodesSearched, setNodesSearched] = useState<number | null>(null);
  const [cutoffsCount, setCutoffsCount] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Updates status messages based on game state
  const updateGameStatus = useCallback(() => {
    const game = gameRef.current;
    const inCheck = game.inCheck();
    setIsInCheck(inCheck);

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

  // Applies the calculated bot move to the real board
  const applyBotMove = useCallback(
    (
      chosenMove: Move | null,
      score: number,
      nodes?: number,
      cutoffs?: number,
      executionTime?: number
    ) => {
      const game = gameRef.current;
      if (nodes !== undefined) setNodesSearched(nodes);
      if (cutoffs !== undefined) setCutoffsCount(cutoffs);
      if (executionTime !== undefined) setCalcTimeMs(executionTime);

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
    },
    [updateGameStatus]
  );

  // Initialize background Web Worker
  useEffect(() => {
    setIsMounted(true);

    try {
      // Create Web Worker for non-blocking engine calculation
      const worker = new Worker(
        new URL("../workers/engine.worker.ts", import.meta.url)
      );

      worker.onmessage = (event: MessageEvent) => {
        if (event.data.type === "MOVE_CALCULATED") {
          const { move, score, nodesSearched, cutoffs, executionTime } = event.data;
          applyBotMove(move, score, nodesSearched, cutoffs, executionTime);
        }
      };

      workerRef.current = worker;
    } catch {
      console.warn("Web worker initialization skipped or unsupported in environment.");
    }

    return () => {
      workerRef.current?.terminate();
    };
  }, [applyBotMove]);

  // Convert difficulty to search depth
  const getDepthForDifficulty = useCallback((): number => {
    switch (difficulty) {
      case "easy":
        return 2;
      case "medium":
        return 3;
      case "hard":
        return 4;
      default:
        return 3;
    }
  }, [difficulty]);

  // Bot move logic: Web Worker with fallback
  const triggerBotMove = useCallback(() => {
    const game = gameRef.current;
    if (game.isGameOver() || game.turn() !== "b") return;

    setIsBotThinking(true);

    botTimeoutRef.current = setTimeout(() => {
      const depth = getDepthForDifficulty();

      if (botType === "random") {
        const move = getRandomMove(game);
        applyBotMove(move, evaluateBoard(game), 1, 0, 1);
      } else if (botType === "minimax-v1") {
        const start = performance.now();
        const result = getMinimaxMove(game, 2);
        const elapsed = Math.round(performance.now() - start);
        applyBotMove(result.move, result.score, undefined, undefined, elapsed);
      } else {
        // Smart Bot v2: Try Web Worker first, fallback to synchronous alpha-beta
        if (workerRef.current) {
          workerRef.current.postMessage({
            type: "CALCULATE_MOVE",
            fen: game.fen(),
            depth,
          });
        } else {
          const start = performance.now();
          const result = getSmartBotMove(game, depth);
          const elapsed = Math.round(performance.now() - start);
          applyBotMove(
            result.move,
            result.score,
            result.nodesSearched,
            result.cutoffs,
            elapsed
          );
        }
      }
    }, 300);
  }, [botType, getDepthForDifficulty, applyBotMove]);

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

      if (isGameOver || !targetSquare || game.turn() !== "w") {
        return false;
      }

      try {
        const move = game.move({
          from: sourceSquare,
          to: targetSquare,
          promotion: "q",
        });

        if (!move) return false;

        setFen(game.fen());
        setMoveHistory(game.history());
        updateGameStatus();

        if (!game.isGameOver()) {
          triggerBotMove();
        }

        return true;
      } catch {
        return false;
      }
    },
    [isGameOver, updateGameStatus, triggerBotMove]
  );

  // New Game
  const handleNewGame = useCallback(() => {
    if (botTimeoutRef.current) clearTimeout(botTimeoutRef.current);
    gameRef.current.reset();
    setFen(gameRef.current.fen());
    setMoveHistory([]);
    setIsGameOver(false);
    setIsInCheck(false);
    setIsBotThinking(false);
    setCurrentEval(0);
    setCalcTimeMs(null);
    setNodesSearched(null);
    setCutoffsCount(null);
    setStatusMessage("Your turn (White)");
  }, []);

  // Undo Move
  const handleUndo = useCallback(() => {
    if (botTimeoutRef.current) {
      clearTimeout(botTimeoutRef.current);
      setIsBotThinking(false);
    }

    const game = gameRef.current;
    const historyLength = game.history().length;

    if (historyLength === 0) return;

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

  // Flip Board
  const handleFlipBoard = useCallback(() => {
    setBoardOrientation((prev) => (prev === "white" ? "black" : "white"));
  }, []);

  const formattedHistory = [];
  for (let i = 0; i < moveHistory.length; i += 2) {
    formattedHistory.push({
      turnNumber: Math.floor(i / 2) + 1,
      white: moveHistory[i],
      black: moveHistory[i + 1] || "",
    });
  }

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
                {botType === "smart-v2"
                  ? `Smart Bot v2 (${difficulty.toUpperCase()})`
                  : botType === "minimax-v1"
                  ? "Bot v1 (Minimax)"
                  : "Random Bot"}{" "}
                <span className="text-slate-400 font-normal">(Black)</span>
              </span>
              <span className="ml-2 text-slate-500">
                {botType === "smart-v2"
                  ? `Alpha-Beta Depth ${getDepthForDifficulty()} + PST`
                  : botType === "minimax-v1"
                  ? "Depth 2 Minimax"
                  : "Plays randomly"}
              </span>
            </div>
          </div>
          {isBotThinking ? (
            <span className="flex items-center gap-1.5 text-blue-400 font-medium animate-pulse">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Thinking (Worker)...
            </span>
          ) : calcTimeMs !== null ? (
            <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1.5">
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
              darkSquareStyle: { backgroundColor: "#334155" },
              lightSquareStyle: { backgroundColor: "#cbd5e1" },
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

      {/* Right Column: Controls & Engine Insights */}
      <div className="w-full lg:w-80 flex flex-col gap-4">
        {/* Opponent & Engine Selector */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
          <div>
            <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider flex items-center gap-1.5 mb-2">
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
              Select Bot Opponent
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => setBotType("smart-v2")}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-all text-center flex flex-col items-center cursor-pointer ${
                  botType === "smart-v2"
                    ? "bg-blue-600/20 border-blue-500 text-blue-300 shadow-sm"
                    : "bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                <span className="font-semibold text-slate-100">Smart v2</span>
                <span className="text-[9px] text-slate-400">Alpha-Beta</span>
              </button>

              <button
                onClick={() => setBotType("minimax-v1")}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-all text-center flex flex-col items-center cursor-pointer ${
                  botType === "minimax-v1"
                    ? "bg-blue-600/20 border-blue-500 text-blue-300 shadow-sm"
                    : "bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                <span className="font-semibold text-slate-100">Bot v1</span>
                <span className="text-[9px] text-slate-400">Minimax</span>
              </button>

              <button
                onClick={() => setBotType("random")}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-all text-center flex flex-col items-center cursor-pointer ${
                  botType === "random"
                    ? "bg-blue-600/20 border-blue-500 text-blue-300 shadow-sm"
                    : "bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                <span className="font-semibold text-slate-100">Random</span>
                <span className="text-[9px] text-slate-400">Phase 1</span>
              </button>
            </div>
          </div>

          {/* Difficulty Selection (Active when Smart v2 is selected) */}
          {botType === "smart-v2" && (
            <div className="pt-2 border-t border-slate-800/80">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                Difficulty Level
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {(["easy", "medium", "hard"] as DifficultyLevel[]).map((level) => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={`py-1 px-2 rounded-md text-xs font-medium border capitalize transition-all cursor-pointer ${
                      difficulty === level
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold"
                        : "bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {level}
                    <span className="text-[9px] block text-slate-500 font-normal">
                      Depth {level === "easy" ? 2 : level === "medium" ? 3 : 4}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Engine Telemetry & Evaluation */}
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

          {/* Real-time search telemetry */}
          {botType === "smart-v2" && nodesSearched !== null && (
            <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400">
              <div className="flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-cyan-400" />
                <span>Nodes: <strong className="text-slate-200">{nodesSearched.toLocaleString()}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Scissors className="w-3 h-3 text-emerald-400" />
                <span>Pruned: <strong className="text-slate-200">{cutoffsCount?.toLocaleString()}</strong></span>
              </div>
            </div>
          )}
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
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex-1 min-h-[180px] flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
              Move History
            </span>
            <span className="text-xs text-slate-500">{moveHistory.length} moves</span>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[190px] pr-1 space-y-1 font-mono text-xs">
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
