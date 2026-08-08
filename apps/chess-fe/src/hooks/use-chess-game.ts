// React binding for ChessGame: keeps the mutable engine in a ref and mirrors the
// derived position (FEN, status, last move) into state so components re-render on change.

import { useCallback, useMemo, useRef, useState } from "react";
import { ChessGame } from "../chess/game";
import type { GameStatus, Square } from "../chess/types";

export interface UseChessGame {
  fen: string;
  status: GameStatus;
  lastMove: { from: Square; to: Square } | null;
  /** Try a move; returns true if it was legal and applied. */
  makeMove: (from: Square, to: Square, promotion?: string) => boolean;
  /** Destination squares of legal moves from `square`. */
  legalTargets: (square: Square) => Square[];
  /** King square to highlight when the side to move is in check, else null. */
  checkSquare: Square | null;
  reset: () => void;
  undo: () => void;
  loadFen: (fen: string) => boolean;
}

export function useChessGame(initialFen?: string): UseChessGame {
  const gameRef = useRef<ChessGame>(new ChessGame(initialFen));
  const [fen, setFen] = useState(() => gameRef.current.fen());
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);

  const sync = useCallback(() => setFen(gameRef.current.fen()), []);

  const makeMove = useCallback(
    (from: Square, to: Square, promotion?: string) => {
      const move = gameRef.current.move(from, to, promotion);
      if (!move) return false;
      setLastMove({ from: move.from, to: move.to });
      sync();
      return true;
    },
    [sync],
  );

  const legalTargets = useCallback(
    (square: Square) => gameRef.current.legalMovesFrom(square).map((m) => m.to),
    [],
  );

  const reset = useCallback(() => {
    gameRef.current.reset();
    setLastMove(null);
    sync();
  }, [sync]);

  const undo = useCallback(() => {
    if (gameRef.current.undo()) {
      setLastMove(null);
      sync();
    }
  }, [sync]);

  const loadFen = useCallback(
    (next: string) => {
      const ok = gameRef.current.load(next);
      if (ok) {
        setLastMove(null);
        sync();
      }
      return ok;
    },
    [sync],
  );

  // Recompute derived values whenever the position (fen) changes.
  const status = useMemo(() => gameRef.current.status(), [fen]);
  const checkSquare = useMemo(
    () => (status.inCheck ? gameRef.current.kingSquare(status.turn) : null),
    [status, fen],
  );

  return {
    fen,
    status,
    lastMove,
    makeMove,
    legalTargets,
    checkSquare,
    reset,
    undo,
    loadFen,
  };
}
