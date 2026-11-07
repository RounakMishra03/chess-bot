import { Chess } from "chess.js";
import { getSmartBotMove } from "./alphaBeta";

/**
 * Benchmark Script
 * Tests the calculation performance of our Alpha-Beta search engine at Depth 4.
 * Used to verify our roadmap target: "Bot reaches depth 4 in under 1 second per move".
 */
export function runBenchmark() {
  const testPositions = [
    { name: "Starting Position", fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" },
    { name: "Middlegame Complex", fen: "r1bqkb1r/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 2 4" },
    { name: "Tactical Position", fen: "r2qkb1r/ppp2ppp/2n1bn2/3pp3/4P3/2NP1N2/PPP2PPP/R1BQKB1R w KQkq - 0 6" },
  ];

  const results = [];

  for (const pos of testPositions) {
    const game = new Chess(pos.fen);
    const start = performance.now();
    const result = getSmartBotMove(game, 4);
    const duration = Math.round(performance.now() - start);

    results.push({
      position: pos.name,
      chosenMove: result.move?.san,
      score: result.score,
      nodesSearched: result.nodesSearched,
      cutoffs: result.cutoffs,
      durationMs: duration,
      passedUnder1s: duration < 1000,
    });
  }

  return results;
}
