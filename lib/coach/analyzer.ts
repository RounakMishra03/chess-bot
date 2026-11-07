import { Chess, Move } from "chess.js";
import { getSmartBotMove } from "@/lib/engine/alphaBeta";
import { evaluateBoard } from "@/lib/engine/evaluate";
import { PIECE_VALUES } from "@/lib/engine/constants";
import { BlunderReport, GameReviewReport, MistakeCategory, MistakeSeverity } from "@/types/coach";

/**
 * Categorizes a mistake based on board dynamics
 */
function categorizeMistake(
  gameBefore: Chess,
  playedMove: Move,
  bestMove: Move | null,
  evalDrop: number,
  evalBefore: number
): MistakeCategory {
  // 1. Missed Win: Player had a crushing advantage (> +350) and threw it away
  if (evalBefore >= 350 && evalDrop >= 300) {
    return "Missed Win";
  }

  // 2. Check if the moved piece walked into capture or left an important piece undefended
  const testGame = new Chess(gameBefore.fen());
  testGame.move(playedMove);

  // Look at opponent's immediate replies
  const opponentReplies = testGame.moves({ verbose: true });
  const captureOfPlayedPiece = opponentReplies.find((m) => m.to === playedMove.to);

  if (captureOfPlayedPiece) {
    const pieceVal = PIECE_VALUES[playedMove.piece] || 100;
    const attackerVal = PIECE_VALUES[captureOfPlayedPiece.piece] || 100;
    if (pieceVal >= attackerVal) {
      return "Hanging Piece";
    }
  }

  // 3. King Safety: Move caused or allowed dangerous checks
  if (testGame.inCheck()) {
    return "King Safety";
  }

  // 4. Lost Tempo: Moving the same piece repeatedly or quiet passive move in active position
  if (evalDrop < 250) {
    return "Lost Tempo";
  }

  return "Tactical Overlook";
}

/**
 * Creates friendly, plain-English coaching explanations
 */
function generateExplanation(
  turnNumber: number,
  playedMove: Move,
  bestMove: Move | null,
  category: MistakeCategory
): string {
  const pieceNames: Record<string, string> = {
    p: "Pawn",
    n: "Knight",
    b: "Bishop",
    r: "Rook",
    q: "Queen",
    k: "King",
  };

  const playedPieceName = pieceNames[playedMove.piece] || "piece";
  const bestMoveSan = bestMove?.san || "a stronger defensive move";

  switch (category) {
    case "Hanging Piece":
      return `Move ${turnNumber}. ${playedMove.san} placed your ${playedPieceName} on an unprotected square where Black could capture it. Playing ${bestMoveSan} would have kept your pieces guarded.`;

    case "Missed Win":
      return `You had a winning tactical opportunity! ${playedMove.san} let Black off the hook. Instead, ${bestMoveSan} would have seized a decisive material or attacking advantage.`;

    case "King Safety":
      return `${playedMove.san} weakened your king's defense and gave Black immediate counter-play with checks. Prefer ${bestMoveSan} to preserve king protection.`;

    case "Lost Tempo":
      return `${playedMove.san} was slightly passive, giving away the initiative. Playing ${bestMoveSan} develops your pieces faster and maintains control of the board.`;

    case "Tactical Overlook":
    default:
      return `Playing ${playedMove.san} overlooked a tactical threat from Black. The computer suggests ${bestMoveSan}, which maintains strong central pressure and piece harmony.`;
  }
}

/**
 * Analyzes a completed or active game and isolates the player's Top 3 Blunders
 */
export function analyzeGameHistory(historySans: string[]): GameReviewReport {
  if (historySans.length < 2) {
    return {
      totalMovesAnalyzed: 0,
      accuracyScore: 100,
      blunders: [],
    };
  }

  const analysisGame = new Chess();
  const potentialBlunders: BlunderReport[] = [];
  let totalCentipawnLoss = 0;
  let playerMovesCount = 0;

  for (let i = 0; i < historySans.length; i++) {
    const isPlayerTurn = i % 2 === 0; // Even indices (0, 2, 4...) are White (Player)
    const san = historySans[i];
    const turnNumber = Math.floor(i / 2) + 1;

    const fenBefore = analysisGame.fen();
    const evalBefore = evaluateBoard(analysisGame);

    // If it's the player's turn, calculate what the engine would recommend
    let bestMove: Move | null = null;
    if (isPlayerTurn) {
      const bestMoveResult = getSmartBotMove(analysisGame, 3);
      bestMove = bestMoveResult.move;
    }

    // Play the move that actually occurred in the game
    let playedMove: Move;
    try {
      playedMove = analysisGame.move(san);
    } catch {
      break;
    }

    const fenAfter = analysisGame.fen();
    const evalAfter = evaluateBoard(analysisGame);

    if (isPlayerTurn) {
      playerMovesCount++;
      // Centipawn drop: positive means evaluation worsened for White
      const drop = evalBefore - evalAfter;
      if (drop > 0) totalCentipawnLoss += drop;

      // Identify if this is an inaccuracy, mistake, or blunder
      if (drop >= 120) {
        let severity: MistakeSeverity = "inaccuracy";
        if (drop >= 280) severity = "blunder";
        else if (drop >= 180) severity = "mistake";

        const category = categorizeMistake(
          new Chess(fenBefore),
          playedMove,
          bestMove,
          drop,
          evalBefore
        );

        const explanation = generateExplanation(
          turnNumber,
          playedMove,
          bestMove,
          category
        );

        // Calculate fen after the best move for comparison
        let fenAfterBest = fenBefore;
        if (bestMove) {
          const sim = new Chess(fenBefore);
          try {
            sim.move(bestMove);
            fenAfterBest = sim.fen();
          } catch {
            fenAfterBest = fenBefore;
          }
        }

        potentialBlunders.push({
          id: `blunder-${turnNumber}-${i}`,
          turnNumber,
          playerColor: "w",
          playedMoveSan: playedMove.san,
          playedMoveFrom: playedMove.from,
          playedMoveTo: playedMove.to,
          bestMoveSan: bestMove?.san || "Safe move",
          bestMoveFrom: bestMove?.from || "",
          bestMoveTo: bestMove?.to || "",
          fenBefore,
          fenAfterPlayed: fenAfter,
          fenAfterBest,
          evalBefore,
          evalAfter,
          evalDrop: Math.round(drop),
          severity,
          category,
          explanation,
        });
      }
    }
  }

  // Sort by worst drop first (biggest mistakes) and take the top 3
  potentialBlunders.sort((a, b) => b.evalDrop - a.evalDrop);
  const top3Blunders = potentialBlunders.slice(0, 3);

  // Compute accuracy percentage: 100 - (avg centipawn loss * scaling factor)
  const avgLoss = playerMovesCount > 0 ? totalCentipawnLoss / playerMovesCount : 0;
  const rawAccuracy = Math.max(35, Math.min(98, Math.round(100 - avgLoss * 0.12)));

  return {
    totalMovesAnalyzed: playerMovesCount,
    accuracyScore: rawAccuracy,
    blunders: top3Blunders,
  };
}
