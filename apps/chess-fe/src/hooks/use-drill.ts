// Orchestrates one endgame drill: the trainee plays the winning side, Stockfish
// defends, and every trainee move is graded against the tablebase.

import { useCallback, useState } from "react";
import { gradeMove } from "../drills/grade";
import type { Grade } from "../drills/grade";
import type { Drill, DrillOutcome } from "../drills/types";
import type { GameStatus, Side, Square } from "../chess/types";
import { useChessGame } from "./use-chess-game";
import { useEngineOpponent } from "./use-engine-opponent";
import { useTablebase } from "./use-tablebase";

export interface UseDrill {
  fen: string;
  status: GameStatus;
  lastMove: { from: Square; to: Square } | null;
  checkSquare: Square | null;
  legalTargets: (square: Square) => Square[];
  makeMove: (from: Square, to: Square, promotion?: string) => boolean;
  orientation: "white" | "black";
  feedback: Grade | null;
  tbLoading: boolean;
  thinking: boolean;
  outcome: DrillOutcome;
  restart: () => void;
}

function deriveOutcome(status: GameStatus, trainee: Side): DrillOutcome {
  if (!status.isGameOver) return "playing";
  if (status.reason === "checkmate") {
    const traineeName = trainee === "w" ? "white" : "black";
    return status.result === traineeName ? "won" : "lost";
  }
  return "drawn";
}

export function useDrill(drill: Drill): UseDrill {
  const game = useChessGame(drill.fen);
  const defender: Side = drill.trainee === "w" ? "b" : "w";
  const [feedback, setFeedback] = useState<Grade | null>(null);

  const traineesTurn = game.status.turn === drill.trainee && !game.status.isGameOver;
  const { result: tb, loading: tbLoading } = useTablebase(game.fen, traineesTurn);

  // Grade trainee moves before applying them; pass engine moves straight through.
  const makeMove = useCallback(
    (from: Square, to: Square, promotion?: string) => {
      if (game.status.turn === drill.trainee) {
        setFeedback(gradeMove(`${from}${to}${promotion ?? ""}`, tb));
      }
      return game.makeMove(from, to, promotion);
    },
    [game, tb, drill.trainee],
  );

  const { thinking } = useEngineOpponent({
    fen: game.fen,
    turn: game.status.turn,
    isGameOver: game.status.isGameOver,
    playAs: defender,
    makeMove: game.makeMove,
    movetime: 500,
  });

  const restart = useCallback(() => {
    game.loadFen(drill.fen);
    setFeedback(null);
  }, [game, drill.fen]);

  return {
    fen: game.fen,
    status: game.status,
    lastMove: game.lastMove,
    checkSquare: game.checkSquare,
    legalTargets: game.legalTargets,
    makeMove,
    orientation: drill.trainee === "w" ? "white" : "black",
    feedback,
    tbLoading,
    thinking,
    outcome: deriveOutcome(game.status, drill.trainee),
    restart,
  };
}
