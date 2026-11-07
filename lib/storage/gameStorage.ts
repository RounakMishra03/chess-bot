import { BlunderReport } from "@/types/coach";

export interface SavedGame {
  id: string;
  date: string;
  opponent: string;
  result: "win" | "loss" | "draw";
  movesCount: number;
  accuracy: number;
  historySans: string[];
  blunders: BlunderReport[];
}

export interface PracticePuzzle {
  id: string;
  gameId: string;
  fenBefore: string;
  turnNumber: number;
  playerMoveSan: string;
  bestMoveSan: string;
  category: string;
  explanation: string;
  isSolved: boolean;
}

const STORAGE_GAMES_KEY = "chess_bot_saved_games";
const STORAGE_PUZZLES_KEY = "chess_bot_practice_puzzles";

// Pre-seeded starter puzzles so students can immediately practice tactics
const STARTER_PUZZLES: PracticePuzzle[] = [
  {
    id: "puzzle-starter-1",
    gameId: "sample-1",
    fenBefore: "r1bqkb1r/pppp1ppp/2n5/4p3/2B1n3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4",
    turnNumber: 4,
    playerMoveSan: "Qe2",
    bestMoveSan: "Bxf7+",
    category: "Missed Win",
    explanation: "Black played an early Nxe4! You have a devastating tactical reply with Bxf7+ sacrificing the bishop to strip Black's king of castling rights and winning back the material with Qe2+ or d4.",
    isSolved: false,
  },
  {
    id: "puzzle-starter-2",
    gameId: "sample-2",
    fenBefore: "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2",
    turnNumber: 2,
    playerMoveSan: "f6",
    bestMoveSan: "Nc6",
    category: "Hanging Piece",
    explanation: "White attacks your e5 pawn with Nf3. Defending with f6 (Damiano Defense) severely weakens your kingside diagonals. The sound master move is Nc6 developing a knight while defending e5.",
    isSolved: false,
  },
  {
    id: "puzzle-starter-3",
    gameId: "sample-3",
    fenBefore: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 4 5",
    turnNumber: 5,
    playerMoveSan: "h3",
    bestMoveSan: "O-O",
    category: "Lost Tempo",
    explanation: "Both sides have active pieces. Playing h3 is a slow pawn move that wastes tempo. Castling (O-O) immediately tucks your King into safety and activates your Rook.",
    isSolved: false,
  },
];

export function getSavedGames(): SavedGame[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_GAMES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveGame(game: SavedGame): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getSavedGames();
    const updated = [game, ...existing].slice(0, 50); // Store up to 50 recent games
    localStorage.setItem(STORAGE_GAMES_KEY, JSON.stringify(updated));

    // Automatically convert any blunders from this game into practice puzzles!
    if (game.blunders && game.blunders.length > 0) {
      const existingPuzzles = getPracticePuzzles();
      const newPuzzles: PracticePuzzle[] = game.blunders.map((b) => ({
        id: `puzzle-${game.id}-${b.id}`,
        gameId: game.id,
        fenBefore: b.fenBefore,
        turnNumber: b.turnNumber,
        playerMoveSan: b.playedMoveSan,
        bestMoveSan: b.bestMoveSan,
        category: b.category,
        explanation: b.explanation,
        isSolved: false,
      }));

      const mergedPuzzles = [...newPuzzles, ...existingPuzzles].slice(0, 40);
      localStorage.setItem(STORAGE_PUZZLES_KEY, JSON.stringify(mergedPuzzles));
    }
  } catch (err) {
    console.warn("Failed to persist game:", err);
  }
}

export function getPracticePuzzles(): PracticePuzzle[] {
  if (typeof window === "undefined") return STARTER_PUZZLES;
  try {
    const raw = localStorage.getItem(STORAGE_PUZZLES_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_PUZZLES_KEY, JSON.stringify(STARTER_PUZZLES));
      return STARTER_PUZZLES;
    }
    const parsed = JSON.parse(raw);
    return parsed.length > 0 ? parsed : STARTER_PUZZLES;
  } catch {
    return STARTER_PUZZLES;
  }
}

export function markPuzzleSolved(puzzleId: string): void {
  if (typeof window === "undefined") return;
  try {
    const puzzles = getPracticePuzzles();
    const updated = puzzles.map((p) =>
      p.id === puzzleId ? { ...p, isSolved: true } : p
    );
    localStorage.setItem(STORAGE_PUZZLES_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn("Failed to mark puzzle solved:", err);
  }
}
