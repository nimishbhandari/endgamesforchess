// Shows the tablebase verdict for the current position: theoretical result,
// distance to mate, and the best move. Only meaningful for ≤ 7 pieces.

import type { TablebaseCategory, TablebaseResult } from "../tablebase/types";
import styles from "./tablebase-panel.module.css";

export interface TablebasePanelProps {
  result: TablebaseResult | null;
  loading: boolean;
  enabled: boolean;
  pieceCount: number;
}

const CATEGORY_LABEL: Record<TablebaseCategory, string> = {
  win: "Winning",
  "cursed-win": "Winning (drawn by 50-move rule)",
  "maybe-win": "Winning (unproven)",
  draw: "Drawn",
  "blessed-loss": "Losing (saved by 50-move rule)",
  "maybe-loss": "Losing (unproven)",
  loss: "Losing",
  unknown: "Unknown",
};

function matesIn(dtm: number | null): string | null {
  if (dtm === null || dtm === 0) return null;
  return `Mate in ${Math.ceil(Math.abs(dtm) / 2)}`;
}

export function TablebasePanel({ result, loading, enabled, pieceCount }: TablebasePanelProps) {
  let body: string;
  const bestMove = result?.moves[0]?.san;
  const mate = matesIn(result?.dtm ?? null);

  if (!enabled) {
    body = `Available for ≤ 7 pieces (this position has ${pieceCount}).`;
  } else if (loading) {
    body = "Looking up…";
  } else if (!result) {
    body = "Unavailable (offline or not in tablebase).";
  } else {
    const parts = [`Side to move: ${CATEGORY_LABEL[result.category]}`];
    if (mate) parts.push(mate);
    if (bestMove) parts.push(`Best: ${bestMove}`);
    body = parts.join(" · ");
  }

  return (
    <section className={styles.panel}>
      <h2 className={styles.heading}>Tablebase</h2>
      <p className={styles.body} aria-live="polite">
        {body}
      </p>
    </section>
  );
}
