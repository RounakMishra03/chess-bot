/**
 * Chess Engine Constants
 * Standard piece values used for evaluation
 */

export const PIECE_VALUES: Record<string, number> = {
  p: 100,   // Pawn
  n: 300,   // Knight
  b: 300,   // Bishop
  r: 500,   // Rook
  q: 900,   // Queen
  k: 20000, // King
};
