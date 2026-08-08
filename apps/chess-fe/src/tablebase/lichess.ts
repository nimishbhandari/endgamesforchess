// Client for the free Lichess tablebase API (perfect play for ≤ 7 pieces).
// Any failure resolves to null so the feature degrades without breaking play.

import type { TablebaseCategory, TablebaseMove, TablebaseResult } from "./types";

const ENDPOINT = "https://tablebase.lichess.ovh/standard";

interface RawMove {
  uci: string;
  san: string;
  category: TablebaseCategory;
  dtz: number | null;
  dtm: number | null;
  zeroing: boolean;
}

interface RawResult {
  category: TablebaseCategory;
  dtz: number | null;
  dtm: number | null;
  checkmate: boolean;
  stalemate: boolean;
  insufficient_material: boolean;
  moves: RawMove[];
}

function normalize(raw: RawResult): TablebaseResult {
  const moves: TablebaseMove[] = (raw.moves ?? []).map((m) => ({
    uci: m.uci,
    san: m.san,
    category: m.category,
    dtz: m.dtz,
    dtm: m.dtm,
    zeroing: m.zeroing,
  }));
  return {
    category: raw.category,
    dtz: raw.dtz,
    dtm: raw.dtm,
    checkmate: raw.checkmate,
    stalemate: raw.stalemate,
    insufficientMaterial: raw.insufficient_material,
    moves,
  };
}

/** Look up `fen` in the tablebase. Returns null on network error or non-2xx. */
export async function lookupTablebase(
  fen: string,
  signal?: AbortSignal,
): Promise<TablebaseResult | null> {
  try {
    const response = await fetch(`${ENDPOINT}?fen=${encodeURIComponent(fen)}`, { signal });
    if (!response.ok) return null;
    return normalize((await response.json()) as RawResult);
  } catch {
    return null;
  }
}
