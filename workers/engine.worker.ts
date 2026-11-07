import { Chess } from "chess.js";
import { getSmartBotMove } from "@/lib/engine/alphaBeta";

/**
 * Web Worker for Chess Engine Calculations
 * 
 * Why this is crucial:
 * Calculating moves at depth 3 or 4 evaluates thousands of positions.
 * If this ran on the browser's main thread, the chessboard, drag animations,
 * and buttons would freeze while the bot thought.
 * 
 * By running in a background Web Worker thread, the UI remains 100% fluid!
 */

addEventListener("message", (event: MessageEvent) => {
  const { type, fen, depth } = event.data;

  if (type === "CALCULATE_MOVE") {
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
