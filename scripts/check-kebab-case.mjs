#!/usr/bin/env node
// Pre-commit guard: block the commit if any newly added/renamed file is not kebab-case.
// Kebab-case = each dot-separated segment is lowercase letters/digits joined by hyphens,
// e.g. use-chess-game.ts, board.module.css, drill-panel.test.tsx.

import { execSync } from "node:child_process";

// Conventional non-kebab filenames allowed anywhere (docs / license / repo meta).
const ALLOW_BASENAMES = new Set([
  "README.md",
  "LICENSE",
  "LICENSE.md",
  "CHANGELOG.md",
  "CONTRIBUTING.md",
  "CLAUDE.md",
  "AGENTS.md",
  "MEMORY.md",
  "NOTICE",
  "COPYING",
]);

const SEGMENT = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function isKebab(basename) {
  if (basename.startsWith(".")) return true; // dotfiles: .gitignore, .oxlintrc.json, …
  return basename.split(".").every((segment) => SEGMENT.test(segment));
}

let staged = [];
try {
  staged = execSync("git diff --cached --name-only --diff-filter=ACR", { encoding: "utf8" })
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
} catch {
  process.exit(0); // not a git context / nothing staged — don't block
}

const offenders = staged.filter((path) => {
  const basename = path.split("/").pop();
  if (ALLOW_BASENAMES.has(basename)) return false;
  return !isKebab(basename);
});

if (offenders.length > 0) {
  console.error("✗ Commit blocked — these files are not kebab-case:");
  for (const path of offenders) console.error(`    ${path}`);
  console.error("\nRename to lowercase, hyphen-separated names, e.g. my-component.tsx.");
  console.error("(Conventional docs like README.md/LICENSE are exempt.)");
  process.exit(1);
}
