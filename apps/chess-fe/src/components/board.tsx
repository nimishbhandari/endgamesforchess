// Chessboard UI: wraps react-chessboard v5 and adds tap-to-move on top of drag.
// Pure presentation — it reports attempted moves via `onMove` and knows nothing about rules.

import { useMemo, useState } from "react";
import { Chessboard } from "react-chessboard";
import type { PieceDropHandlerArgs, SquareHandlerArgs } from "react-chessboard";
import { occupiedSquares } from "../chess/fen";
import type { Square } from "../chess/types";
import { buildSquareStyles } from "./board-styles";
import styles from "./board.module.css";

export interface BoardProps {
  fen: string;
  orientation?: "white" | "black";
  /** Attempt a move; return true if it was legal and applied. */
  onMove: (from: Square, to: Square) => boolean;
  /** Destination squares of legal moves from `square`. */
  legalTargets: (square: Square) => Square[];
  lastMove: { from: Square; to: Square } | null;
  checkSquare: Square | null;
  interactive?: boolean;
}

export function Board({
  fen,
  orientation = "white",
  onMove,
  legalTargets,
  lastMove,
  checkSquare,
  interactive = true,
}: BoardProps) {
  const [selected, setSelected] = useState<Square | null>(null);
  const [targets, setTargets] = useState<Square[]>([]);

  const clearSelection = () => {
    setSelected(null);
    setTargets([]);
  };

  const selectSquare = (square: Square) => {
    const next = legalTargets(square);
    if (next.length === 0) {
      clearSelection();
      return;
    }
    setSelected(square);
    setTargets(next);
  };

  const attempt = (from: Square, to: Square): boolean => {
    const ok = onMove(from, to);
    clearSelection();
    return ok;
  };

  const handleSquareClick = ({ square }: SquareHandlerArgs) => {
    if (!interactive) return;
    if (selected && targets.includes(square)) {
      attempt(selected, square);
      return;
    }
    if (selected === square) {
      clearSelection();
      return;
    }
    selectSquare(square);
  };

  const handlePieceDrop = ({ sourceSquare, targetSquare }: PieceDropHandlerArgs): boolean => {
    if (!interactive || !targetSquare) {
      clearSelection();
      return false;
    }
    return attempt(sourceSquare, targetSquare);
  };

  const squareStyles = useMemo(
    () =>
      buildSquareStyles({
        selected,
        targets,
        lastMove,
        checkSquare,
        occupied: occupiedSquares(fen),
      }),
    [selected, targets, lastMove, checkSquare, fen],
  );

  return (
    <div className={styles.board}>
      <Chessboard
        options={{
          position: fen,
          boardOrientation: orientation,
          allowDragging: interactive,
          onSquareClick: handleSquareClick,
          onPieceDrop: handlePieceDrop,
          squareStyles,
          animationDurationInMs: 200,
        }}
      />
    </div>
  );
}
