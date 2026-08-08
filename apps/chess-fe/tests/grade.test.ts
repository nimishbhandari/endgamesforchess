import { expect, test } from "vite-plus/test";
import { gradeMove } from "../src/drills/grade";
import type { TablebaseMove, TablebaseResult } from "../src/tablebase/types";

// Move categories are from the opponent's perspective, so "loss" = the opponent
// is losing = a good move for the (winning) side to move.
function move(uci: string, category: TablebaseMove["category"], dtm: number): TablebaseMove {
  return { uci, san: uci, category, dtm, dtz: dtm, zeroing: false };
}

const tb: TablebaseResult = {
  category: "win",
  dtz: 10,
  dtm: 10,
  checkmate: false,
  stalemate: false,
  insufficientMaterial: false,
  moves: [
    move("a1a7", "loss", -10), // best
    move("a1a8", "loss", -14), // same category, slower
    move("a1a6", "blessed-loss", -20), // one category worse
    move("e1e2", "draw", 0), // throws the win away
  ],
};

test("the top move is graded best", () => {
  expect(gradeMove("a1a7", tb).quality).toBe("best");
});

test("a same-category but slower move is graded good", () => {
  expect(gradeMove("a1a8", tb).quality).toBe("good");
});

test("a one-category drop is an inaccuracy", () => {
  expect(gradeMove("a1a6", tb).quality).toBe("inaccuracy");
});

test("giving up the win is a blunder", () => {
  expect(gradeMove("e1e2", tb).quality).toBe("blunder");
});

test("an unknown move or missing tablebase grades as unknown", () => {
  expect(gradeMove("h1h8", tb).quality).toBe("unknown");
  expect(gradeMove("a1a7", null).quality).toBe("unknown");
});
