import { expect, test } from "vite-plus/test";
import { ChessGame } from "../src/chess/game";

test("legal moves from e2 include e4 at the start", () => {
  const game = new ChessGame();
  expect(game.legalMovesFrom("e2").map((m) => m.to)).toContain("e4");
});

test("an illegal move returns null and does not change the position", () => {
  const game = new ChessGame();
  const before = game.fen();
  expect(game.move("e2", "e5")).toBeNull();
  expect(game.fen()).toBe(before);
});

test("a legal move flips the side to move", () => {
  const game = new ChessGame();
  game.move("e2", "e4");
  expect(game.turn()).toBe("b");
});

test("detects checkmate (fool's mate)", () => {
  const game = new ChessGame();
  game.move("f2", "f3");
  game.move("e7", "e5");
  game.move("g2", "g4");
  game.move("d8", "h4"); // Qh4#
  const status = game.status();
  expect(status.isGameOver).toBe(true);
  expect(status.reason).toBe("checkmate");
  expect(status.result).toBe("black");
});

test("auto-promotes a pawn to a queen", () => {
  const game = new ChessGame("4k3/P7/8/8/8/8/8/4K3 w - - 0 1");
  const move = game.move("a7", "a8");
  expect(move).not.toBeNull();
  expect(game.fen().startsWith("Q3k3")).toBe(true);
});
