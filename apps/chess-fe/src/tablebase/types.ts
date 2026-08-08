// Types for Lichess tablebase results. Categories and DTZ/DTM are from the
// perspective of the side to move in the queried position.

export type TablebaseCategory =
  | "win"
  | "cursed-win" // win, but drawn under the 50-move rule
  | "maybe-win"
  | "draw"
  | "blessed-loss" // loss, but drawn under the 50-move rule
  | "maybe-loss"
  | "loss"
  | "unknown";

export interface TablebaseMove {
  uci: string;
  san: string;
  /** Result after this move, from the *opponent's* perspective. */
  category: TablebaseCategory;
  /** Distance to zeroing (pawn move / capture); sign is opponent-relative. */
  dtz: number | null;
  /** Distance to mate in plies, when known. */
  dtm: number | null;
  zeroing: boolean;
}

export interface TablebaseResult {
  category: TablebaseCategory;
  dtz: number | null;
  dtm: number | null;
  checkmate: boolean;
  stalemate: boolean;
  insufficientMaterial: boolean;
  /** Legal moves, ordered best-first by the API. */
  moves: TablebaseMove[];
}
