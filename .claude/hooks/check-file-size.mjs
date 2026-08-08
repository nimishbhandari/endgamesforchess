#!/usr/bin/env node
// PostToolUse hook: enforce the project's file-size convention.
//   > 500 lines  -> block (exit 2), feeding the reason back to Claude so it splits the file.
//   300-500      -> advisory warning on stdout (non-blocking).
//   <= 300       -> silent.
// See CLAUDE.md. Only hand-written source is policed; generated/data/lockfiles are exempt.

import { readFileSync } from "node:fs";
import { basename } from "node:path";

const WARN_AT = 300;
const BLOCK_AT = 500;

// Only these extensions are policed.
const POLICED = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".css", ".scss"]);

// Paths matching any of these are never policed.
const EXEMPT_PATH = [
  /[\\/]node_modules[\\/]/,
  /[\\/](dist|build|coverage|\.git|\.vite-hooks)[\\/]/,
  /[\\/]data[\\/]/, // static datasets (e.g. drill data)
];
const EXEMPT_NAME = [
  /\.generated\./,
  /\.min\./,
  /\.d\.ts$/,
  /^pnpm-lock\.yaml$/,
  /^package-lock\.json$/,
  /^yarn\.lock$/,
];

function readStdin() {
  try {
    return readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

function extname(p) {
  const b = basename(p);
  const i = b.lastIndexOf(".");
  return i <= 0 ? "" : b.slice(i);
}

function main() {
  let payload;
  try {
    payload = JSON.parse(readStdin() || "{}");
  } catch {
    process.exit(0); // never break the tool flow on bad input
  }

  const filePath = payload?.tool_input?.file_path;
  if (typeof filePath !== "string" || filePath.length === 0) process.exit(0);

  if (!POLICED.has(extname(filePath))) process.exit(0);
  if (EXEMPT_PATH.some((re) => re.test(filePath))) process.exit(0);
  if (EXEMPT_NAME.some((re) => re.test(basename(filePath)))) process.exit(0);

  let lineCount;
  try {
    const text = readFileSync(filePath, "utf8");
    lineCount = text.length === 0 ? 0 : text.split("\n").length;
  } catch {
    process.exit(0); // file gone / unreadable — nothing to check
  }

  const rel = filePath.replace(process.cwd() + "/", "");

  if (lineCount > BLOCK_AT) {
    console.error(
      `File-size limit exceeded: ${rel} is ${lineCount} lines (hard cap ${BLOCK_AT}). ` +
        `Split it into smaller single-responsibility files (one component per file) per CLAUDE.md.`,
    );
    process.exit(2); // blocking: reason is fed back to Claude
  }

  if (lineCount > WARN_AT) {
    console.log(
      `[file-size] ${rel} is ${lineCount} lines (target ${WARN_AT}, cap ${BLOCK_AT}). ` +
        `Consider splitting soon.`,
    );
  }

  process.exit(0);
}

main();
