// Stockfish (lite single-threaded WASM) running in a Web Worker, wrapped in a small
// async UCI API. The engine files are served from /public/stockfish (no COOP/COEP needed).

import { parseBestMove, parseInfoScore } from "./uci";
import type { BestMove, EngineScore } from "./uci";

const ENGINE_URL = `${import.meta.env.BASE_URL}stockfish/stockfish-18-lite-single.js`;

export interface GoOptions {
  /** Think for this many milliseconds (default 800). Ignored if `depth` is set. */
  movetime?: number;
  /** Search to a fixed depth instead of by time. */
  depth?: number;
  /** 0–20 Stockfish skill level; lower = weaker (used to build bots later). */
  skillLevel?: number;
}

export interface EngineResult {
  bestMove: BestMove | null;
  score: EngineScore | null;
}

export class StockfishEngine {
  private worker: Worker | null = null;
  private ready: Promise<void> | null = null;

  /** Boot the worker and complete the `uci`/`uciok` handshake (idempotent). */
  init(): Promise<void> {
    if (this.ready) return this.ready;
    this.ready = new Promise<void>((resolve, reject) => {
      try {
        const worker = new Worker(ENGINE_URL);
        this.worker = worker;
        const onReady = (event: MessageEvent) => {
          if (String(event.data) === "uciok") {
            worker.removeEventListener("message", onReady);
            resolve();
          }
        };
        worker.addEventListener("message", onReady);
        worker.addEventListener("error", (event) =>
          reject(event.error ?? new Error("engine error")),
        );
        worker.postMessage("uci");
      } catch (error) {
        reject(error as Error);
      }
    });
    return this.ready;
  }

  /** Find the best move for `fen`; resolves when the engine replies `bestmove`. */
  async analyse(fen: string, options: GoOptions = {}): Promise<EngineResult> {
    await this.init();
    const worker = this.worker;
    if (!worker) throw new Error("engine not initialised");

    if (options.skillLevel !== undefined) {
      worker.postMessage(`setoption name Skill Level value ${options.skillLevel}`);
    }

    return new Promise<EngineResult>((resolve) => {
      let score: EngineScore | null = null;
      const onMessage = (event: MessageEvent) => {
        const line = String(event.data);
        const parsedScore = parseInfoScore(line);
        if (parsedScore) score = parsedScore;
        if (line.startsWith("bestmove")) {
          worker.removeEventListener("message", onMessage);
          resolve({ bestMove: parseBestMove(line), score });
        }
      };
      worker.addEventListener("message", onMessage);
      worker.postMessage(`position fen ${fen}`);
      worker.postMessage(
        options.depth ? `go depth ${options.depth}` : `go movetime ${options.movetime ?? 800}`,
      );
    });
  }

  /** Interrupt the current search (the engine still emits a `bestmove`). */
  stop(): void {
    this.worker?.postMessage("stop");
  }

  dispose(): void {
    this.worker?.terminate();
    this.worker = null;
    this.ready = null;
  }
}
