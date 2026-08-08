// Copies the Stockfish lite single-threaded engine from node_modules into public/stockfish
// so it is served as a static asset. The binaries are gitignored (see .gitignore); this
// script regenerates them, and runs automatically before `dev` and `build`.

import { copyFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const srcDir = join(root, "node_modules", "stockfish", "bin");
const outDir = join(root, "public", "stockfish");

const FILES = ["stockfish-18-lite-single.js", "stockfish-18-lite-single.wasm"];

mkdirSync(outDir, { recursive: true });

for (const file of FILES) {
  const from = join(srcDir, file);
  const to = join(outDir, file);
  if (!existsSync(from)) {
    console.error(`[setup-engine] missing ${from} — run "pnpm install" first.`);
    process.exit(1);
  }
  if (existsSync(to) && statSync(to).size === statSync(from).size) continue; // already current
  copyFileSync(from, to);
  console.log(`[setup-engine] copied ${file}`);
}
