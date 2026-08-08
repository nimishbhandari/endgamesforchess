// Free-play mode: a full board, optional Stockfish opponent, and a live tablebase
// readout once the position drops to ≤ 7 pieces.

import { useState } from "react";
import { Board } from "./board";
import { EngineControls } from "./engine-controls";
import { StatusPanel } from "./status-panel";
import { TablebasePanel } from "./tablebase-panel";
import { countPieces } from "../chess/fen";
import { useChessGame } from "../hooks/use-chess-game";
import { useEngineOpponent } from "../hooks/use-engine-opponent";
import { useTablebase } from "../hooks/use-tablebase";
import styles from "../app.module.css";

export function FreePlay() {
  const game = useChessGame();
  const [orientation, setOrientation] = useState<"white" | "black">("white");
  const [vsEngine, setVsEngine] = useState(false);

  const { thinking } = useEngineOpponent({
    fen: game.fen,
    turn: game.status.turn,
    isGameOver: game.status.isGameOver,
    playAs: vsEngine ? "b" : null,
    makeMove: game.makeMove,
  });

  const pieceCount = countPieces(game.fen);
  const tbEnabled = pieceCount <= 7 && !game.status.isGameOver;
  const { result, loading } = useTablebase(game.fen, tbEnabled);

  const flip = () => setOrientation((o) => (o === "white" ? "black" : "white"));

  return (
    <div className={styles.layout}>
      <Board
        fen={game.fen}
        orientation={orientation}
        onMove={game.makeMove}
        legalTargets={game.legalTargets}
        lastMove={game.lastMove}
        checkSquare={game.checkSquare}
      />
      <div className={styles.side}>
        <StatusPanel status={game.status} onReset={game.reset} onUndo={game.undo} onFlip={flip} />
        <EngineControls vsEngine={vsEngine} onToggle={setVsEngine} thinking={thinking} />
        <TablebasePanel
          result={result}
          loading={loading}
          enabled={tbEnabled}
          pieceCount={pieceCount}
        />
      </div>
    </div>
  );
}
