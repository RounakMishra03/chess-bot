import { Chess, Move } from "chess.js";
import { orderMoves, minimaxAlphaBeta, SearchMetrics } from "./alphaBeta";
import { evaluateBoard } from "./evaluate";

export interface HumanBotOptions {
  ratingLevel?: number; // e.g. 800 (beginner), 1200 (intermediate), 1600 (advanced)
  allowBlindSpots?: boolean;
}

export interface HumanMoveResult {
  move: Move | null;
  score: number;
  thinkingDelayMs: number;
  simulatedPersona: string;
}

/**
 * Checks if a move is a backward diagonal retreat (a classic human blind spot)
 */
function isBackwardDiagonalMove(move: Move): boolean {
  if (move.piece !== "b" && move.piece !== "q") return false;
  const fromFile = move.from.charCodeAt(0);
  const fromRank = parseInt(move.from[1], 10);
  const toFile = move.to.charCodeAt(0);
  const toRank = parseInt(move.to[1], 10);

  // For Black, moving backwards means moving towards Rank 8 (increasing rank number)
  // For White, moving backwards means moving towards Rank 1 (decreasing rank number)
  const isBackwards = move.color === "b" ? toRank > fromRank : toRank < fromRank;
  const isDiagonal = Math.abs(fromFile - toFile) === Math.abs(fromRank - toRank);

  return isBackwards && isDiagonal && Math.abs(fromRank - toRank) >= 2;
}

/**
 * Calculates human-like thinking time based on position complexity:
 * - Immediate recaptures: Very fast (300ms - 500ms)
 * - Forced moves (only 1 or 2 legal moves): Fast (250ms - 400ms)
 * - Sharp tactical positions with multiple threats: Longer pauses (1000ms - 2200ms)
 */
export function calculateHumanThinkingTime(
  game: Chess,
  chosenMove: Move | null,
  isRecapture: boolean
): number {
  if (!chosenMove) return 400;

  const legalMovesCount = game.moves().length;

  // 1. Obvious recapture
  if (isRecapture) {
    return Math.floor(Math.random() * 200) + 300; // 300ms - 500ms
  }

  // 2. Forced reply (e.g. only 1 or 2 moves available)
  if (legalMovesCount <= 2) {
    return Math.floor(Math.random() * 150) + 250; // 250ms - 400ms
  }

  // 3. In check (must defend)
  if (game.inCheck()) {
    return Math.floor(Math.random() * 400) + 600; // 600ms - 1000ms
  }

  // 4. Complex open position
  if (legalMovesCount > 25) {
    return Math.floor(Math.random() * 800) + 1200; // 1200ms - 2000ms
  }

  // Standard move
  return Math.floor(Math.random() * 400) + 600; // 600ms - 1000ms
}

/**
 * Human-Like Move Generator
 * 
 * Instead of cold, mechanical min-max calculation:
 * 1. Gathers top candidate moves within a reasonable threshold.
 * 2. Injects slight human variance (temperature) so the bot doesn't always play the #1 computer line.
 * 3. Applies human blind-spot filters (slight bias against long backward bishop retreats).
 * 4. Determines realistic human thinking time.
 */
export function getHumanLikeMove(
  game: Chess,
  options: HumanBotOptions = {}
): HumanMoveResult {
  const rating = options.ratingLevel || 1200;
  const rawMoves = game.moves({ verbose: true });

  if (rawMoves.length === 0) {
    return {
      move: null,
      score: evaluateBoard(game),
      thinkingDelayMs: 300,
      simulatedPersona: "Resigned",
    };
  }

  // Determine search depth based on rating
  // 800-1100: depth 2
  // 1100-1400: depth 3
  // 1400+: depth 4
  const depth = rating < 1100 ? 2 : rating < 1400 ? 3 : 4;
  const orderedMoves = orderMoves(rawMoves);
  const isMaximizing = game.turn() === "w";

  const scoredMoves: { move: Move; score: number }[] = [];
  const metrics: SearchMetrics = { nodesSearched: 0, cutoffs: 0 };

  let alpha = -Infinity;
  let beta = Infinity;

  // Evaluate candidate moves
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

    let adjustedScore = score;

    // Simulate human blind spots: slightly down-weight backward diagonal retreats for sub-1500 players
    if (options.allowBlindSpots !== false && rating < 1500) {
      if (isBackwardDiagonalMove(move)) {
        // Blind spot: player forgets about a long backward diagonal bishop retreat
        adjustedScore += isMaximizing ? -35 : 35;
      }
    }

    scoredMoves.push({ move, score: adjustedScore });
  }

  // Sort candidate moves from best to worst
  scoredMoves.sort((a, b) =>
    isMaximizing ? b.score - a.score : a.score - b.score
  );

  const bestScore = scoredMoves[0].score;

  // Human inaccuracy model:
  // Rather than always picking index 0 (which is robotic),
  // consider moves within a small score tolerance (e.g. 25-60 centipawns)
  const scoreTolerance = rating < 1000 ? 70 : rating < 1300 ? 40 : 20;

  const viableCandidates = scoredMoves.filter((item) =>
    isMaximizing
      ? item.score >= bestScore - scoreTolerance
      : item.score <= bestScore + scoreTolerance
  );

  // Pick organically among the top human-like candidates
  // 70% chance of top move, 20% second move, 10% third move
  const pickIndex =
    Math.random() < 0.70 || viableCandidates.length === 1
      ? 0
      : Math.random() < 0.85 || viableCandidates.length === 2
      ? 1
      : Math.min(2, viableCandidates.length - 1);

  const chosenItem = viableCandidates[pickIndex] || scoredMoves[0];
  const chosenMove = chosenItem.move;

  // Check if chosen move is a recapture (opponent just captured on this square)
  const history = game.history({ verbose: true });
  const lastMove = history.length > 0 ? history[history.length - 1] : null;
  const isRecapture = Boolean(
    lastMove && lastMove.captured && chosenMove.to === lastMove.to
  );

  const thinkingTime = calculateHumanThinkingTime(
    game,
    chosenMove,
    isRecapture
  );

  // Determine Persona Mood based on evaluation
  let persona = "Thoughtful";
  const evalScore = evaluateBoard(game);
  if (game.turn() === "b") {
    if (evalScore < -200) persona = "Confident";
    else if (evalScore > 200) persona = "Under Pressure";
    else persona = "Focused";
  }

  return {
    move: chosenMove,
    score: chosenItem.score,
    thinkingDelayMs: thinkingTime,
    simulatedPersona: persona,
  };
}
