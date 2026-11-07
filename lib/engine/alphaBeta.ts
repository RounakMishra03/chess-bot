import { Chess, Move } from "chess.js";
import { evaluateBoard } from "./evaluate";
import { PIECE_VALUES } from "./constants";

export interface SearchMetrics {
  nodesSearched: number;
  cutoffs: number;
}

/**
 * Move Ordering Heuristic
 * 
 * Alpha-Beta pruning is at its fastest when the best moves are searched first.
 * If we check high-value captures first, alpha-beta cutoffs happen almost immediately,
 * saving 70% to 90% of search work!
 */
export function orderMoves(moves: Move[]): Move[] {
  return [...moves].sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    // 1. Prioritize Captures: MVV-LVA (Most Valuable Victim - Least Valuable Attacker)
    if (a.captured) {
      const victimValue = PIECE_VALUES[a.captured] || 0;
      const attackerValue = PIECE_VALUES[a.piece] || 0;
      scoreA += 1000 + (victimValue - attackerValue);
    }
    if (b.captured) {
      const victimValue = PIECE_VALUES[b.captured] || 0;
      const attackerValue = PIECE_VALUES[b.piece] || 0;
      scoreB += 1000 + (victimValue - attackerValue);
    }

    // 2. Prioritize Promotions
    if (a.promotion) scoreA += 800;
    if (b.promotion) scoreB += 800;

    // 3. Prioritize Checks (notated with '+' in san)
    if (a.san.includes("+")) scoreA += 50;
    if (b.san.includes("+")) scoreB += 50;

    return scoreB - scoreA;
  });
}

/**
 * Minimax Search with Alpha-Beta Pruning
 * 
 * @param game Active Chess instance
 * @param depth Remaining search depth in plies
 * @param alpha Best score guaranteed for Maximizer (White)
 * @param beta Best score guaranteed for Minimizer (Black)
 * @param isMaximizing True for White, False for Black
 * @param metrics Object tracking nodes evaluated and cutoffs triggered
 */
export function minimaxAlphaBeta(
  game: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  metrics: SearchMetrics
): number {
  metrics.nodesSearched++;

  if (depth === 0 || game.isGameOver()) {
    return evaluateBoard(game);
  }

  const rawMoves = game.moves({ verbose: true });
  const orderedMoves = orderMoves(rawMoves);

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of orderedMoves) {
      game.move(move);
      const evaluation = minimaxAlphaBeta(
        game,
        depth - 1,
        alpha,
        beta,
        false,
        metrics
      );
      game.undo();

      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);

      // Alpha-Beta Cutoff: Black already has a better move elsewhere
      if (beta <= alpha) {
        metrics.cutoffs++;
        break; // Prune remaining branches!
      }
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of orderedMoves) {
      game.move(move);
      const evaluation = minimaxAlphaBeta(
        game,
        depth - 1,
        alpha,
        beta,
        true,
        metrics
      );
      game.undo();

      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);

      // Alpha-Beta Cutoff: White already has a better move elsewhere
      if (beta <= alpha) {
        metrics.cutoffs++;
        break; // Prune remaining branches!
      }
    }
    return minEval;
  }
}

/**
 * Root function to find the best move using Alpha-Beta pruning
 */
export function getSmartBotMove(
  game: Chess,
  depth: number = 3
): {
  move: Move | null;
  score: number;
  nodesSearched: number;
  cutoffs: number;
} {
  const metrics: SearchMetrics = { nodesSearched: 0, cutoffs: 0 };
  const rawMoves = game.moves({ verbose: true });
  if (rawMoves.length === 0) {
    return {
      move: null,
      score: evaluateBoard(game),
      nodesSearched: 0,
      cutoffs: 0,
    };
  }

  const orderedMoves = orderMoves(rawMoves);
  const isMaximizing = game.turn() === "w";

  let bestScore = isMaximizing ? -Infinity : Infinity;
  let alpha = -Infinity;
  let beta = Infinity;
  let bestMoves: Move[] = [];

  for (const move of orderedMoves) {
    game.move(move);
    const score = minimaxAlphaBeta(
      game,
      depth - 1,
      alpha,
      beta,
      !isMaximizing,
      metrics
    );
    game.undo();

    if (isMaximizing) {
      if (score > bestScore) {
        bestScore = score;
        bestMoves = [move];
      } else if (score === bestScore) {
        bestMoves.push(move);
      }
      alpha = Math.max(alpha, bestScore);
    } else {
      if (score < bestScore) {
        bestScore = score;
        bestMoves = [move];
      } else if (score === bestScore) {
        bestMoves.push(move);
      }
      beta = Math.min(beta, bestScore);
    }
  }

  // Choose among top tied moves for variety
  const chosenMove =
    bestMoves[Math.floor(Math.random() * bestMoves.length)] || null;

  return {
    move: chosenMove,
    score: bestScore,
    nodesSearched: metrics.nodesSearched,
    cutoffs: metrics.cutoffs,
  };
}
