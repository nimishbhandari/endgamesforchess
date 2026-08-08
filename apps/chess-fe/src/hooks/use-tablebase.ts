// Fetches the tablebase result for the current position, aborting stale requests.
// Only runs when `enabled` (callers gate this on piece count ≤ 7).

import { useEffect, useState } from "react";
import { lookupTablebase } from "../tablebase/lichess";
import type { TablebaseResult } from "../tablebase/types";

export interface UseTablebase {
  result: TablebaseResult | null;
  loading: boolean;
}

export function useTablebase(fen: string, enabled: boolean): UseTablebase {
  const [result, setResult] = useState<TablebaseResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setResult(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    void lookupTablebase(fen, controller.signal)
      .then((res) => {
        if (!controller.signal.aborted) setResult(res);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [fen, enabled]);

  return { result, loading };
}
