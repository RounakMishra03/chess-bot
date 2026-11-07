import { Chess } from "chess.js";
import { PIECE_VALUES } from "./constants";
import { getPieceSquareScore } from "./pst";

/**
 * Enhanced Board Evaluation
 * Combines raw material value + positional piece-square table (PST) bonuses.
 * 
 * Positive score (> 0): White has advantage
 * Negative score (< 0): Black has advantage
 */
export function evaluateBoard(game: Chess): number {
  if (game.isCheckmate()) {
    return game.turn() === "w" ? -100000 : 100000;
  }

  if (game.isDraw()) {
    return 0;
  }

  let totalScore = 0;
  const board = game.board();

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const square = board[row][col];
      if (square) {
        const materialValue = PIECE_VALUES[square.type] || 0;
        const pstBonus = getPieceSquareScore(square.type, square.color, row, col);
        const combinedScore = materialValue + pstBonus;

        if (square.color === "w") {
          totalScore += combinedScore;
        } else {
          totalScore -= combinedScore;
        }
      }
    }
  }

  return totalScore;
}
