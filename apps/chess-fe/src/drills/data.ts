// Seed endgame drills. Positions are ≤ 7 pieces so the tablebase can grade every move.
// (This is static data — kept small, but exempt from the file-size hook if it grows.)

import type { Drill } from "./types";

export const DRILLS: Drill[] = [
  {
    id: "kr-vs-k",
    name: "Rook mate (K+R vs K)",
    description: "Checkmate the lone black king with your king and rook.",
    fen: "4k3/8/8/8/8/8/8/R3K3 w - - 0 1",
    trainee: "w",
    objective: "win",
  },
  {
    id: "kq-vs-k",
    name: "Queen mate (K+Q vs K)",
    description: "Checkmate the lone black king with your king and queen.",
    fen: "4k3/8/8/8/8/8/8/3QK3 w - - 0 1",
    trainee: "w",
    objective: "win",
  },
];
