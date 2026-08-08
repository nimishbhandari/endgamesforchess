// Drives Stockfish as an automatic opponent: whenever it's the engine's turn and the
// game is live, it thinks and plays a move. Owns one engine instance for its lifetime.

import { useEffect, useRef, useState } from "react";
import { StockfishEngine } from "../engine/stockfish";
import type { Side } from "../chess/types";

export interface EngineOpponentParams {
  fen: string;
  turn: Side;
  isGameOver: boolean;
  /** Engine plays this side; null disables it. */
  playAs: Side | null;
  makeMove: (from: string, to: string, promotion?: string) => boolean;
  movetime?: number;
  skillLevel?: number;
}

export function useEngineOpponent(params: EngineOpponentParams): { thinking: boolean } {
  const { fen, turn, isGameOver, playAs, makeMove, movetime = 800, skillLevel } = params;
  const engineRef = useRef<StockfishEngine | null>(null);
  const busyRef = useRef(false);
  const [thinking, setThinking] = useState(false);

  // One engine per mounted hook.
  useEffect(() => {
    engineRef.current = new StockfishEngine();
    return () => {
      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine || !playAs || isGameOver || turn !== playAs || busyRef.current) return;

    let cancelled = false;
    busyRef.current = true;
    setThinking(true);

    engine
      .analyse(fen, { movetime, skillLevel })
      .then((result) => {
        if (!cancelled && result.bestMove) {
          makeMove(result.bestMove.from, result.bestMove.to, result.bestMove.promotion);
        }
      })
      .catch(() => {
        /* engine failed — leave the move to the human */
      })
      .finally(() => {
        busyRef.current = false;
        setThinking(false);
      });

    return () => {
      cancelled = true;
    };
  }, [fen, turn, isGameOver, playAs, makeMove, movetime, skillLevel]);

  return { thinking };
}
