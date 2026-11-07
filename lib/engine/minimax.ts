import { Chess, Move } from "chess.js";
import { evaluateBoard } from "./evaluate";

/**
 * Minimax Search Algorithm
 * 
 * Think of Minimax like looking ahead into a decision tree:
 * 1. White wants the highest possible score (Maximizer).
 * 2. Black wants the lowest possible score (Minimizer).
 * 3. Each side assumes the other player will always pick their best reply.
 * 
 * @param game Active Chess instance
 * @param depth How many plies (half-moves) to look ahead
 * @param isMaximizing True when it's White's turn, False when Black's
 */
export function minimax(
  game: Chess,
  depth: number,
  isMaximizing: boolean
): number {
  // Base case: stop searching when depth reaches 0 or game is over
  if (depth === 0 || game.isGameOver()) {
    return evaluateBoard(game);
  }

  const moves = game.moves({ verbose: true });

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      game.move(move);
      const evaluation = minimax(game, depth - 1, false);
      game.undo();
      maxEval = Math.max(maxEval, evaluation);
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      game.move(move);
      const evaluation = minimax(game, depth - 1, true);
      game.undo();
      minEval = Math.min(minEval, evaluation);
    }
    return minEval;
  }
}

/**
 * Finds the optimal move for the current player using Minimax.
 * 
 * @param game Active Chess instance
 * @param depth Number of plies to calculate (depth 2 = 1 bot move + 1 opponent reply)
 */
export function getMinimaxMove(
  game: Chess,
  depth: number = 2
): { move: Move | null; score: number } {
  const moves = game.moves({ verbose: true });
  if (moves.length === 0) {
    return { move: null, score: evaluateBoard(game) };
  }

  const isMaximizing = game.turn() === "w";
  let bestScore = isMaximizing ? -Infinity : Infinity;
  let bestMoves: Move[] = [];

  for (const move of moves) {
    game.move(move);
    // After our move, calculate the opponent's best response
    const score = minimax(game, depth - 1, !isMaximizing);
    game.undo();

    if (isMaximizing) {
      if (score > bestScore) {
        bestScore = score;
        bestMoves = [move];
      } else if (score === bestScore) {
        bestMoves.push(move);
      }
    } else {
      if (score < bestScore) {
        bestScore = score;
        bestMoves = [move];
      } else if (score === bestScore) {
        bestMoves.push(move);
      }
    }
  }

  // Pick randomly among moves that share the highest score for natural variety
  const chosenMove =
    bestMoves[Math.floor(Math.random() * bestMoves.length)] || null;

  return { move: chosenMove, score: bestScore };
}
