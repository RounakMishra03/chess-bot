import { Chess } from "chess.js";
import { PIECE_VALUES } from "./constants";

/**
 * Evaluates the current board state based on piece material.
 * Positive score (> 0) means White has an advantage.
 * Negative score (< 0) means Black has an advantage.
 * 
 * Example: If Black captured a White knight (+300), the score becomes -300.
 */
export function evaluateBoard(game: Chess): number {
  // Check terminal (game over) conditions first
  if (game.isCheckmate()) {
    // If it's White's turn and checkmated, Black won (-100,000)
    // If it's Black's turn and checkmated, White won (+100,000)
    return game.turn() === "w" ? -100000 : 100000;
  }

  if (game.isDraw()) {
    return 0; // A draw is completely equal
  }

  let totalScore = 0;
  const board = game.board();

  // Loop through all 64 squares on the 8x8 chessboard
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const square = board[row][col];
      if (square) {
        const pieceValue = PIECE_VALUES[square.type] || 0;
        if (square.color === "w") {
          totalScore += pieceValue;
        } else {
          totalScore -= pieceValue;
        }
      }
    }
  }

  return totalScore;
}
