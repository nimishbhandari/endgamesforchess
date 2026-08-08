// A single drill: board (trainee to move) + drill panel. Remounted per drill via `key`.

import { Board } from "./board";
import { DrillPanel } from "./drill-panel";
import { useDrill } from "../hooks/use-drill";
import type { Drill } from "../drills/types";
import styles from "../app.module.css";

export interface DrillSessionProps {
  drill: Drill;
}

export function DrillSession({ drill }: DrillSessionProps) {
  const session = useDrill(drill);
  const traineeToMove = session.status.turn === drill.trainee;

  return (
    <div className={styles.layout}>
      <Board
        fen={session.fen}
        orientation={session.orientation}
        onMove={session.makeMove}
        legalTargets={session.legalTargets}
        lastMove={session.lastMove}
        checkSquare={session.checkSquare}
        interactive={traineeToMove && session.outcome === "playing"}
      />
      <div className={styles.side}>
        <DrillPanel
          drill={drill}
          feedback={session.feedback}
          outcome={session.outcome}
          tbLoading={session.tbLoading}
          thinking={session.thinking}
          onRestart={session.restart}
        />
      </div>
    </div>
  );
}
