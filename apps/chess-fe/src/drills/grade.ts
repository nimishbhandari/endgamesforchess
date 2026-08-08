// Pure grading of a trainee's move against the tablebase. The tablebase ranks every
// legal move best-first; we compare the played move's outcome to the optimal one.

import type { TablebaseCategory, TablebaseResult } from "../tablebase/types";

export type MoveQuality = "best" | "good" | "inaccuracy" | "blunder" | "unknown";

export interface Grade {
  quality: MoveQuality;
  message: string;
}

// Lower is better for the side to move (the opponent ends up worse off).
const CATEGORY_RANK: Record<TablebaseCategory, number> = {
  loss: 0,
  "blessed-loss": 1,
  "maybe-loss": 1,
  draw: 2,
  unknown: 2,
  "cursed-win": 3,
  "maybe-win": 3,
  win: 4,
};

/** Plies-to-mate/zero magnitude used to compare two moves of the same category. */
function distance(dtm: number | null, dtz: number | null): number {
  return Math.abs(dtm ?? dtz ?? 0);
}

export function gradeMove(playedUci: string, tb: TablebaseResult | null): Grade {
  if (!tb || tb.moves.length === 0) return { quality: "unknown", message: "" };

  const best = tb.moves[0];
  const played = tb.moves.find((m) => m.uci === playedUci);
  if (!played) return { quality: "unknown", message: "" };

  const rankDrop = CATEGORY_RANK[played.category] - CATEGORY_RANK[best.category];

  if (rankDrop >= 2) {
    return { quality: "blunder", message: `Threw away the result — best was ${best.san}.` };
  }
  if (rankDrop === 1) {
    return { quality: "inaccuracy", message: `Inaccurate — ${best.san} was better.` };
  }

  // Same category as the best move: reward keeping the mate/zero distance short.
  if (played.uci === best.uci || distance(played.dtm, played.dtz) <= distance(best.dtm, best.dtz)) {
    return { quality: "best", message: "Best move!" };
  }
  return { quality: "good", message: `Good — but ${best.san} was quicker.` };
}
