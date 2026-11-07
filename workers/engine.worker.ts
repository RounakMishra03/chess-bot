import { Chess } from "chess.js";
import { getSmartBotMove } from "@/lib/engine/alphaBeta";
import { getHumanLikeMove } from "@/lib/engine/humanBot";

/**
 * Web Worker for Chess Engine Calculations
 * Supports both pure Alpha-Beta calculation and organic Human-Like simulation.
 */

addEventListener("message", (event: MessageEvent) => {
  const { type, fen, depth, ratingLevel, allowBlindSpots } = event.data;

  if (type === "CALCULATE_HUMAN_MOVE") {
    try {
      const game = new Chess(fen);
      const result = getHumanLikeMove(game, {
        ratingLevel: ratingLevel || 1200,
        allowBlindSpots: allowBlindSpots !== false,
      });

      postMessage({
        type: "HUMAN_MOVE_CALCULATED",
        move: result.move,
        score: result.score,
        thinkingDelayMs: result.thinkingDelayMs,
        simulatedPersona: result.simulatedPersona,
      });
    } catch (error) {
      postMessage({
        type: "ERROR",
        error: (error as Error).message,
      });
    }
  } else if (type === "CALCULATE_MOVE") {
    try {
      const game = new Chess(fen);
      const startTime = performance.now();
      const result = getSmartBotMove(game, depth || 3);
      const executionTime = Math.round(performance.now() - startTime);

      postMessage({
        type: "MOVE_CALCULATED",
        move: result.move,
        score: result.score,
        nodesSearched: result.nodesSearched,
        cutoffs: result.cutoffs,
        executionTime,
      });
    } catch (error) {
      postMessage({
        type: "ERROR",
        error: (error as Error).message,
      });
    }
  }
});
