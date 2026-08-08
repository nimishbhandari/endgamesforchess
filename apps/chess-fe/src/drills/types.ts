import type { Side } from "../chess/types";

export interface Drill {
  id: string;
  name: string;
  description: string;
  /** Starting position. */
  fen: string;
  /** Side the trainee plays (the engine plays the other side). */
  trainee: Side;
  /** "win" = must checkmate; "draw" = must hold the draw. */
  objective: "win" | "draw";
}

export type DrillOutcome = "playing" | "won" | "drawn" | "lost";
