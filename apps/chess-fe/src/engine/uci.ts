// Pure parsers for the UCI text lines Stockfish emits. Kept separate from the worker
// plumbing so they can be unit-tested without spawning an engine.

export interface EngineScore {
  /** "cp" = centipawns (from side-to-move's perspective); "mate" = mate in N. */
  type: "cp" | "mate";
  value: number;
}

export interface BestMove {
  from: string;
  to: string;
  /** Promotion piece letter for promotion moves, e.g. "q". */
  promotion?: string;
}

/** Parse a `bestmove e2e4 [ponder ...]` line. Returns null for `bestmove (none)`. */
export function parseBestMove(line: string): BestMove | null {
  const match = line.match(/^bestmove\s+(\S+)/);
  if (!match || match[1] === "(none)") return null;
  const uci = match[1];
  if (uci.length < 4) return null;
  return {
    from: uci.slice(0, 2),
    to: uci.slice(2, 4),
    promotion: uci.length > 4 ? uci[4] : undefined,
  };
}

/** Parse the `score cp N` / `score mate N` field from an `info ...` line. */
export function parseInfoScore(line: string): EngineScore | null {
  const match = line.match(/\bscore\s+(cp|mate)\s+(-?\d+)/);
  if (!match) return null;
  return { type: match[1] as "cp" | "mate", value: Number(match[2]) };
}
