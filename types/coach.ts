/**
 * Types for Mistake Coach and Game Review
 */

export type MistakeSeverity = "inaccuracy" | "mistake" | "blunder";

export type MistakeCategory =
  | "Hanging Piece"
  | "Missed Win"
  | "Lost Tempo"
  | "Self-Pin"
  | "Tactical Overlook"
  | "King Safety";

export interface BlunderReport {
  id: string;
  turnNumber: number;
  playerColor: "w" | "b";
  playedMoveSan: string;
  playedMoveFrom: string;
  playedMoveTo: string;
  bestMoveSan: string;
  bestMoveFrom: string;
  bestMoveTo: string;
  fenBefore: string;
  fenAfterPlayed: string;
  fenAfterBest: string;
  evalBefore: number;
  evalAfter: number;
  evalDrop: number; // Centipawn loss (e.g. 250)
  severity: MistakeSeverity;
  category: MistakeCategory;
  explanation: string;
}

export interface GameReviewReport {
  totalMovesAnalyzed: number;
  accuracyScore: number; // 0% to 100%
  blunders: BlunderReport[]; // Top blunders (up to 3)
}
