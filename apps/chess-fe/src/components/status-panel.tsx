// Side/below panel: shows whose turn it is or the game result, plus board controls.

import type { GameStatus } from "../chess/types";
import styles from "./status-panel.module.css";

export interface StatusPanelProps {
  status: GameStatus;
  onReset: () => void;
  onUndo: () => void;
  onFlip: () => void;
}

function statusMessage(status: GameStatus): string {
  if (!status.isGameOver) {
    const side = status.turn === "w" ? "White" : "Black";
    return status.inCheck ? `${side} to move — check` : `${side} to move`;
  }
  switch (status.reason) {
    case "checkmate":
      return `Checkmate — ${status.result === "white" ? "White" : "Black"} wins`;
    case "stalemate":
      return "Draw — stalemate";
    case "insufficient":
      return "Draw — insufficient material";
    case "threefold":
      return "Draw — threefold repetition";
    case "fifty-move":
      return "Draw — fifty-move rule";
    default:
      return "Game over";
  }
}

export function StatusPanel({ status, onReset, onUndo, onFlip }: StatusPanelProps) {
  return (
    <aside className={styles.panel}>
      <p className={styles.status} aria-live="polite">
        {statusMessage(status)}
      </p>
      <div className={styles.controls}>
        <button type="button" onClick={onReset}>
          New game
        </button>
        <button type="button" onClick={onUndo}>
          Undo
        </button>
        <button type="button" onClick={onFlip}>
          Flip
        </button>
      </div>
    </aside>
  );
}
