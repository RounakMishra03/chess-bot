/**
 * Piece-Square Tables (PST)
 * 
 * Why we use them:
 * Material alone doesn't teach a bot good chess habits.
 * A Knight on the edge (a1) controls only 2 squares, but in the center (d4) it controls 8 squares.
 * 
 * Piece-Square tables give bonus/penalty points based on WHERE a piece sits on the board:
 * - Pawns: rewarded for pushing forward and occupying the center (d4, e4).
 * - Knights: rewarded for central control and penalized for sitting on the rim ("Knights on the rim are dim").
 * - Bishops: rewarded for open diagonals and active positions.
 * - Rooks: rewarded for 7th rank and open central files.
 * - Queens: rewarded for active central squares without reckless early exposure.
 * - King: rewarded for castling safely in corners during the opening/midgame.
 * 
 * Tables are written from White's perspective (Rank 8 at index 0 down to Rank 1 at index 7).
 */

export const PAWN_PST = [
  [ 0,   0,   0,   0,   0,   0,   0,   0],
  [50,  50,  50,  50,  50,  50,  50,  50],
  [10,  10,  20,  30,  30,  20,  10,  10],
  [ 5,   5,  10,  25,  25,  10,   5,   5],
  [ 0,   0,   0,  20,  20,   0,   0,   0],
  [ 5,  -5, -10,   0,   0, -10,  -5,   5],
  [ 5,  10,  10, -20, -20,  10,  10,   5],
  [ 0,   0,   0,   0,   0,   0,   0,   0]
];

export const KNIGHT_PST = [
  [-50, -40, -30, -30, -30, -30, -40, -50],
  [-40, -20,   0,   0,   0,   0, -20, -40],
  [-30,   0,  10,  15,  15,  10,   0, -30],
  [-30,   5,  15,  20,  20,  15,   5, -30],
  [-30,   0,  15,  20,  20,  15,   0, -30],
  [-30,   5,  10,  15,  15,  10,   5, -30],
  [-40, -20,   0,   5,   5,   0, -20, -40],
  [-50, -40, -30, -30, -30, -30, -40, -50]
];

export const BISHOP_PST = [
  [-20, -10, -10, -10, -10, -10, -10, -20],
  [-10,   0,   0,   0,   0,   0,   0, -10],
  [-10,   0,   5,  10,  10,   5,   0, -10],
  [-10,   5,   5,  10,  10,   5,   5, -10],
  [-10,   0,  10,  10,  10,  10,   0, -10],
  [-10,  10,  10,  10,  10,  10,  10, -10],
  [-10,   5,   0,   0,   0,   0,   5, -10],
  [-20, -10, -10, -10, -10, -10, -10, -20]
];

export const ROOK_PST = [
  [ 0,   0,   0,   0,   0,   0,   0,   0],
  [ 5,  10,  10,  10,  10,  10,  10,   5],
  [-5,   0,   0,   0,   0,   0,   0,  -5],
  [-5,   0,   0,   0,   0,   0,   0,  -5],
  [-5,   0,   0,   0,   0,   0,   0,  -5],
  [-5,   0,   0,   0,   0,   0,   0,  -5],
  [-5,   0,   0,   0,   0,   0,   0,  -5],
  [ 0,   0,   0,   5,   5,   5,   0,   0]
];

export const QUEEN_PST = [
  [-20, -10, -10,  -5,  -5, -10, -10, -20],
  [-10,   0,   0,   0,   0,   0,   0, -10],
  [-10,   0,   5,   5,   5,   5,   0, -10],
  [ -5,   0,   5,   5,   5,   5,   0,  -5],
  [  0,   0,   5,   5,   5,   5,   0,  -5],
  [-10,   5,   5,   5,   5,   5,   0, -10],
  [-10,   0,   5,   0,   0,   0,   0, -10],
  [-20, -10, -10,  -5,  -5, -10, -10, -20]
];

export const KING_PST_MIDGAME = [
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-20, -30, -30, -40, -40, -30, -30, -20],
  [-10, -20, -20, -20, -20, -20, -20, -10],
  [ 20,  20,   0,   0,   0,   0,  20,  20],
  [ 20,  30,  10,   0,   0,  10,  30,  20]
];

const PST_MAP: Record<string, number[][]> = {
  p: PAWN_PST,
  n: KNIGHT_PST,
  b: BISHOP_PST,
  r: ROOK_PST,
  q: QUEEN_PST,
  k: KING_PST_MIDGAME,
};

/**
 * Gets the positional bonus/penalty for a piece on square (row, col).
 * For Black, we mirror the board vertically (row becomes 7 - row)
 * so Black evaluates from their perspective.
 */
export function getPieceSquareScore(
  pieceType: string,
  color: "w" | "b",
  row: number,
  col: number
): number {
  const table = PST_MAP[pieceType];
  if (!table) return 0;

  // For White, row 7 is rank 1 (home), row 0 is rank 8
  // For Black, row 0 is rank 8 (home), row 7 is rank 1
  const effectiveRow = color === "w" ? row : 7 - row;
  return table[effectiveRow][col];
}
