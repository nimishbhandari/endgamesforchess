# Project conventions for Claude

Chess training app (`endgamesforchess`). Read this every session and follow it without exception.
Roadmap and architecture live in the approved plan; this file is the enforced coding standard.

## File size & structure (enforced)

- **All filenames are kebab-case** — lowercase, hyphen-separated (`use-chess-game.ts`,
  `drill-panel.module.css`, `board.test.tsx`). Component _identifiers_ stay PascalCase; only the
  _file_ is kebab. A pre-commit hook (`scripts/check-kebab-case.mjs`, wired into
  `.vite-hooks/pre-commit`) blocks any commit that adds a non-kebab file. Conventional docs
  (`README.md`, `LICENSE`, `CLAUDE.md`, `AGENTS.md`, …) and dotfiles are exempt.
- **Keep every source file ≤ 300 lines.** Split _before_ it grows past that.
- **500 lines is a hard cap** — a `PostToolUse` hook (`.claude/hooks/check-file-size.mjs`) blocks
  any hand-written source file over 500 lines and warns between 300 and 500. Do not work around it;
  split the file instead.
- **One React component per file.** Never put two components in one file. Name the file after the
  component (`Board.tsx`).
- **One responsibility per module.** Hooks, the engine wrapper, the tablebase client, and drill
  logic each live in their own file. Prefer many small, well-named files over few large ones.
- **Co-locate** a component's CSS Module and test beside it: `Board.tsx`, `Board.module.css`,
  `Board.test.tsx`.

## Style

- TypeScript with typed public interfaces; keep internals private to the module.
- Clear names over cleverness. No dead code, no commented-out blocks.
- Plain CSS Modules for styling — no CSS framework. Responsive and touch-first (tap-to-move as well
  as drag); the board is always square and sized to fit the viewport.
- Keep pure logic (rules, engine, tablebase) UI-agnostic so it can later move into a shared
  `packages/chess-core` package reused by the future backend.

## Toolchain (Vite+)

This repo uses Vite+ (`vp`), not raw Vite. See `AGENTS.md` (auto-generated — don't edit inside its
`VITE PLUS` markers).

- Install: `vp install`
- Format + lint + typecheck + test: `vp check` then `vp test`
- Dev server: `pnpm dev` (root) or `vp run chess-fe#dev`
- Full gate before done: `pnpm ready`

## Exemptions from the size hook

Generated files (`*.generated.*`), type decls (`*.d.ts`), minified files (`*.min.*`), lockfiles,
and anything under `node_modules/`, `dist/`, `build/`, `coverage/` are not policed. Large static
data (e.g. drill datasets under a `data/` directory) is exempt too — but split logic, never data.
