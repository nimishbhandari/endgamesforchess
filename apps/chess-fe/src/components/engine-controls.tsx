// Toggle for playing against Stockfish, plus a "thinking" indicator.

import styles from "./engine-controls.module.css";

export interface EngineControlsProps {
  vsEngine: boolean;
  onToggle: (value: boolean) => void;
  thinking: boolean;
}

export function EngineControls({ vsEngine, onToggle, thinking }: EngineControlsProps) {
  return (
    <div className={styles.controls}>
      <label className={styles.toggle}>
        <input
          type="checkbox"
          checked={vsEngine}
          onChange={(event) => onToggle(event.target.checked)}
        />
        Play vs Stockfish (you are White)
      </label>
      {vsEngine && (
        <span className={styles.status} aria-live="polite">
          {thinking ? "Stockfish is thinking…" : "Your move"}
        </span>
      )}
    </div>
  );
}
