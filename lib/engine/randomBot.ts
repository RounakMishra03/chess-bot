import { Chess, Move } from "chess.js";

/**
 * Random Move Bot
 * Picks a random legal move from all available moves in the current position.
 * Used as our baseline opponent in Phase 1.
 */
export function getRandomMove(game: Chess): Move | null {
  const possibleMoves = game.moves({ verbose: true });
  if (possibleMoves.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * possibleMoves.length);
  return possibleMoves[randomIndex];
}
