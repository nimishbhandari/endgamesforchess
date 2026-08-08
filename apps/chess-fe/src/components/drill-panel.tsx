// Drill sidebar: objective, per-move grade, engine/tablebase status, and outcome.

import type { Grade } from "../drills/grade";
import type { Drill, DrillOutcome } from "../drills/types";
import styles from "./drill-panel.module.css";

export interface DrillPanelProps {
  drill: Drill;
  feedback: Grade | null;
  outcome: DrillOutcome;
  tbLoading: boolean;
  thinking: boolean;
  onRestart: () => void;
}

function outcomeMessage(outcome: DrillOutcome, drill: Drill): string | null {
  switch (outcome) {
    case "won":
      return "Solved — checkmate delivered! ♛";
    case "lost":
      return "You were checkmated. Try again.";
    case "drawn":
      return drill.objective === "draw"
        ? "Held the draw — well done!"
        : "Drawn — the win slipped away. Try again.";
    default:
      return null;
  }
}

export function DrillPanel({
  drill,
  feedback,
  outcome,
  tbLoading,
  thinking,
  onRestart,
}: DrillPanelProps) {
  const result = outcomeMessage(outcome, drill);
  const showGrade = feedback && feedback.quality !== "unknown" && outcome === "playing";

  return (
    <section className={styles.panel}>
      <h2 className={styles.name}>{drill.name}</h2>
      <p className={styles.description}>{drill.description}</p>

      {showGrade && (
        <p className={`${styles.grade} ${styles[feedback.quality]}`} aria-live="polite">
          {feedback.message}
        </p>
      )}

      {result && (
        <p className={styles.outcome} aria-live="polite">
          {result}
        </p>
      )}

      <p className={styles.status}>
        {thinking ? "Stockfish is defending…" : tbLoading ? "Checking tablebase…" : "Your move"}
      </p>

      <button type="button" className={styles.restart} onClick={onRestart}>
        Restart drill
      </button>
    </section>
  );
}
