// Shared chess types for the app. UI code depends on these, never on chess.js directly,
// so the rules engine can be swapped later without touching components.

export type Side = "w" | "b";

/** Algebraic square, e.g. "e4". */
export type Square = string;

/** A legal move in the current position. */
export interface LegalMove {
  from: Square;
  to: Square;
  /** Present only for pawn promotions: "q" | "r" | "b" | "n". */
  promotion?: string;
  /** Standard Algebraic Notation, e.g. "Nf3". */
  san: string;
}

export type GameResult = "white" | "black" | "draw" | null;

export type GameEndReason =
  | "checkmate"
  | "stalemate"
  | "insufficient"
  | "fifty-move"
  | "threefold"
  | "in-progress";

export interface GameStatus {
  isGameOver: boolean;
  inCheck: boolean;
  /** Winner, "draw", or null while the game is in progress. */
  result: GameResult;
  reason: GameEndReason;
  /** Side to move. */
  turn: Side;
}
