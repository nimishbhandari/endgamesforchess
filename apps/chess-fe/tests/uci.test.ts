import { expect, test } from "vite-plus/test";
import { parseBestMove, parseInfoScore } from "../src/engine/uci";

test("parseBestMove reads a normal move with ponder", () => {
  expect(parseBestMove("bestmove e2e4 ponder e7e5")).toEqual({
    from: "e2",
    to: "e4",
    promotion: undefined,
  });
});

test("parseBestMove reads a promotion", () => {
  expect(parseBestMove("bestmove e7e8q")).toEqual({ from: "e7", to: "e8", promotion: "q" });
});

test("parseBestMove returns null for (none)", () => {
  expect(parseBestMove("bestmove (none)")).toBeNull();
});

test("parseInfoScore reads centipawns", () => {
  expect(parseInfoScore("info depth 12 score cp 34 nodes 1000")).toEqual({ type: "cp", value: 34 });
});

test("parseInfoScore reads a negative mate score", () => {
  expect(parseInfoScore("info depth 20 score mate -3 pv e1e2")).toEqual({
    type: "mate",
    value: -3,
  });
});

test("parseInfoScore returns null when there is no score", () => {
  expect(parseInfoScore("info string hello")).toBeNull();
});
