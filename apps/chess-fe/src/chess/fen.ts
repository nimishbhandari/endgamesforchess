// Small FEN helpers that don't need a full chess.js instance.

import type { Square } from "./types";

const FILES = "abcdefgh";

/** Total number of pieces on the board (used to gate tablebase lookups at ≤ 7). */
export function countPieces(fen: string): number {
  const placement = fen.split(" ")[0] ?? "";
  let count = 0;
  for (const ch of placement) {
    if (/[prnbqkPRNBQK]/.test(ch)) count += 1;
  }
  return count;
}

/** Squares that currently hold a piece, parsed from a FEN's placement field. */
export function occupiedSquares(fen: string): Set<Square> {
  const placement = fen.split(" ")[0] ?? "";
  const occupied = new Set<Square>();
  const ranks = placement.split("/");

  ranks.forEach((rankStr, rankIndex) => {
    const rankNumber = 8 - rankIndex; // FEN lists rank 8 first
    let fileIndex = 0;
    for (const ch of rankStr) {
      if (ch >= "1" && ch <= "8") {
        fileIndex += Number(ch);
      } else {
        occupied.add(`${FILES[fileIndex]}${rankNumber}`);
        fileIndex += 1;
      }
    }
  });

  return occupied;
}
