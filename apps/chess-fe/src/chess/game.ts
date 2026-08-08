// Thin, typed wrapper around chess.js. This is the ONLY module that imports chess.js —
// everything else in the app talks to `ChessGame`. That keeps the rules engine swappable.

import { Chess, DEFAULT_POSITION } from "chess.js";
import type { PieceSymbol, Square as CjsSquare } from "chess.js";
import type { GameStatus, LegalMove, Side, Square } from "./types";

export const STARTING_FEN = DEFAULT_POSITION;

export class ChessGame {
  private chess: Chess;

  constructor(fen: string = STARTING_FEN) {
    this.chess = new Chess(fen);
  }

  fen(): string {
    return this.chess.fen();
  }

  turn(): Side {
    return this.chess.turn();
  }

  /** Replace the position. Returns false if the FEN is invalid. */
  load(fen: string): boolean {
    try {
      this.chess.load(fen);
      return true;
    } catch {
      return false;
    }
  }

  reset(): void {
    this.chess.load(STARTING_FEN);
  }

  /** Legal moves originating from `square` (empty if none / not that side's turn). */
  legalMovesFrom(square: Square): LegalMove[] {
    return this.chess
      .moves({ square: square as CjsSquare, verbose: true })
      .map((m) => ({ from: m.from, to: m.to, promotion: m.promotion, san: m.san }));
  }

  /** True if `from`->`to` is legal in the current position. */
  isLegal(from: Square, to: Square): boolean {
    return this.legalMovesFrom(from).some((m) => m.to === to);
  }

  /**
   * Attempt a move. Auto-promotes to queen unless `promotion` is given.
   * Returns the move, or null if illegal.
   */
  move(from: Square, to: Square, promotion?: string): LegalMove | null {
    try {
      const args: { from: string; to: string; promotion?: PieceSymbol } = { from, to };
      if (this.isPromotion(from, to)) {
        args.promotion = (promotion ?? "q") as PieceSymbol;
      }
      const m = this.chess.move(args);
      return m ? { from: m.from, to: m.to, promotion: m.promotion, san: m.san } : null;
    } catch {
      return null;
    }
  }

  /** Undo the last move. Returns false if there was nothing to undo. */
  undo(): boolean {
    return this.chess.undo() !== null;
  }

  isGameOver(): boolean {
    return this.chess.isGameOver();
  }

  /** Square of the given side's king, or null (should never be null in legal positions). */
  kingSquare(side: Side): Square | null {
    for (const row of this.chess.board()) {
      for (const cell of row) {
        if (cell && cell.type === "k" && cell.color === side) return cell.square;
      }
    }
    return null;
  }

  status(): GameStatus {
    const turn = this.turn();
    const inCheck = this.chess.inCheck();
    let reason: GameStatus["reason"] = "in-progress";
    let result: GameStatus["result"] = null;

    if (this.chess.isCheckmate()) {
      reason = "checkmate";
      result = turn === "w" ? "black" : "white";
    } else if (this.chess.isStalemate()) {
      reason = "stalemate";
      result = "draw";
    } else if (this.chess.isInsufficientMaterial()) {
      reason = "insufficient";
      result = "draw";
    } else if (this.chess.isThreefoldRepetition()) {
      reason = "threefold";
      result = "draw";
    } else if (this.chess.isDrawByFiftyMoves()) {
      reason = "fifty-move";
      result = "draw";
    }

    return { isGameOver: this.chess.isGameOver(), inCheck, result, reason, turn };
  }

  private isPromotion(from: Square, to: Square): boolean {
    const piece = this.chess.get(from as CjsSquare);
    if (!piece || piece.type !== "p") return false;
    const rank = to[1];
    return rank === "8" || rank === "1";
  }
}
