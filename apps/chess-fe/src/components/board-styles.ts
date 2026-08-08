// Builds the per-square style map react-chessboard uses for highlights:
// last move, selected square, legal-move markers (dot / capture ring), and check.

import type { CSSProperties } from "react";
import type { Square } from "../chess/types";

const LAST_MOVE: CSSProperties = { background: "rgba(155, 199, 0, 0.41)" };
const SELECTED: CSSProperties = { background: "rgba(255, 213, 74, 0.55)" };
const CHECK: CSSProperties = {
  background:
    "radial-gradient(circle, rgba(214, 40, 40, 0.85) 0%, rgba(214, 40, 40, 0.45) 42%, transparent 72%)",
};
const MOVE_DOT: CSSProperties = {
  background: "radial-gradient(circle, rgba(0,0,0,0.26) 20%, transparent 21%)",
};
const CAPTURE_RING: CSSProperties = {
  background: "radial-gradient(circle, transparent 54%, rgba(0,0,0,0.26) 55%, transparent 80%)",
};

export interface HighlightInput {
  selected: Square | null;
  targets: Square[];
  lastMove: { from: Square; to: Square } | null;
  checkSquare: Square | null;
  occupied: Set<Square>;
}

export function buildSquareStyles(input: HighlightInput): Record<string, CSSProperties> {
  const styles: Record<string, CSSProperties> = {};
  const merge = (square: Square, style: CSSProperties) => {
    styles[square] = { ...styles[square], ...style };
  };

  if (input.lastMove) {
    merge(input.lastMove.from, LAST_MOVE);
    merge(input.lastMove.to, LAST_MOVE);
  }
  if (input.checkSquare) merge(input.checkSquare, CHECK);
  if (input.selected) merge(input.selected, SELECTED);

  for (const target of input.targets) {
    merge(target, input.occupied.has(target) ? CAPTURE_RING : MOVE_DOT);
  }

  return styles;
}
