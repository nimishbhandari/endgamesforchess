import { useState } from "react";
import { DrillSession } from "./components/drill-session";
import { FreePlay } from "./components/free-play";
import { ModePicker } from "./components/mode-picker";
import { DRILLS } from "./drills/data";
import styles from "./app.module.css";

function App() {
  const [drillId, setDrillId] = useState<string | null>(null);
  const drill = DRILLS.find((d) => d.id === drillId) ?? null;

  return (
    <main className={styles.app}>
      <h1 className={styles.title}>Endgames for Chess</h1>
      <ModePicker drills={DRILLS} selectedId={drillId} onSelect={setDrillId} />
      {drill ? <DrillSession key={drill.id} drill={drill} /> : <FreePlay />}
    </main>
  );
}

export default App;
