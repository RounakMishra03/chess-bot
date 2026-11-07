/**
 * Core type definitions for Chess-Bot
 */

export type GameStatus = 
  | 'in_progress'
  | 'check'
  | 'checkmate'
  | 'stalemate'
  | 'draw_repetition'
  | 'draw_insufficient_material'
  | 'draw_50_moves';

export type BotType = 'random' | 'minimax-v1' | 'smart-v2' | 'human-like';

export type PlayerColor = 'white' | 'black';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface MoveHistoryItem {
  from: string;
  to: string;
  san: string;
  piece: string;
  color: 'w' | 'b';
  captured?: string;
  fen: string;
}
