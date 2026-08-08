import { expect, test } from "vite-plus/test";
import { countPieces, occupiedSquares } from "../src/chess/fen";

const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

test("counts all 32 pieces at the start", () => {
  expect(countPieces(START)).toBe(32);
});

test("counts pieces in an endgame", () => {
  expect(countPieces("4k3/8/8/8/8/8/8/R3K3 w - - 0 1")).toBe(3);
});

test("occupiedSquares marks starting pieces and empty squares correctly", () => {
  const occupied = occupiedSquares(START);
  expect(occupied.has("e2")).toBe(true);
  expect(occupied.has("e1")).toBe(true);
  expect(occupied.has("e8")).toBe(true);
  expect(occupied.has("e4")).toBe(false);
});
