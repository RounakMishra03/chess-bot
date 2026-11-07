/**
 * Adaptive Difficulty Engine
 * 
 * Why this is exciting:
 * In traditional chess apps, you pick a bot level. If it's too hard, you get crushed.
 * If it's too easy, you get bored.
 * 
 * Adaptive Difficulty acts like a great chess sparring partner:
 * - If you are down material and struggling: the bot gently adjusts down to keep the game fun and let you fight back.
 * - If you are dominating and up material: the bot sharpens up its defense to challenge you.
 */

export interface AdaptiveState {
  baseRating: number;
  currentRating: number;
  recentAdvantage: number; // Positive = White winning, Negative = Black winning
}

/**
 * Computes an adaptive rating based on current board score and recent moves.
 * 
 * @param baseRating Selected baseline rating (e.g. 1200)
 * @param currentEval Current board evaluation in centipawns (from White's perspective)
 */
export function calculateAdaptiveRating(
  baseRating: number = 1200,
  currentEval: number = 0
): { targetRating: number; adaptiveNote: string } {
  // If White (the human player) is losing by a piece or more (-300)
  if (currentEval <= -300) {
    const adjusted = Math.max(850, baseRating - 200);
    return {
      targetRating: adjusted,
      adaptiveNote: "Relaxing pressure (giving you comeback chances)",
    };
  }

  // If White is slightly behind (-100 to -299)
  if (currentEval < -100) {
    const adjusted = Math.max(900, baseRating - 100);
    return {
      targetRating: adjusted,
      adaptiveNote: "Balanced sparring mode",
    };
  }

  // If White is dominating (+300 or more)
  if (currentEval >= 300) {
    const adjusted = Math.min(1600, baseRating + 200);
    return {
      targetRating: adjusted,
      adaptiveNote: "Stepping up defense (challenging your advantage)",
    };
  }

  // If White has slight advantage (+100 to +299)
  if (currentEval > 100) {
    const adjusted = Math.min(1500, baseRating + 100);
    return {
      targetRating: adjusted,
      adaptiveNote: "Sharp counter-attacking mode",
    };
  }

  // Even game (-100 to +100)
  return {
    targetRating: baseRating,
    adaptiveNote: "Playing at target level",
  };
}
