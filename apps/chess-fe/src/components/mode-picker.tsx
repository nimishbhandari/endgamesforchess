// Switches between free play and the seed drills.

import type { Drill } from "../drills/types";
import styles from "./mode-picker.module.css";

export interface ModePickerProps {
  drills: Drill[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export function ModePicker({ drills, selectedId, onSelect }: ModePickerProps) {
  return (
    <nav className={styles.picker}>
      <button
        type="button"
        className={selectedId === null ? styles.active : styles.button}
        onClick={() => onSelect(null)}
      >
        Free play
      </button>
      {drills.map((drill) => (
        <button
          key={drill.id}
          type="button"
          className={selectedId === drill.id ? styles.active : styles.button}
          onClick={() => onSelect(drill.id)}
        >
          {drill.name}
        </button>
      ))}
    </nav>
  );
}
