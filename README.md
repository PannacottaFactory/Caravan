# Caravan — web

Web port of **Caravan Trading Game** (Unity / Android) — a turn-based trading game: buy, sell, profit.

## Commands

```bash
npm install
npm run dev        # local dev server
npm test           # engine tests (Vitest)
npm run typecheck
npm run build      # production build in dist/
```

## Structure

- `src/engine/` — game rules, pure TypeScript (no DOM). Entry point: `src/engine/index.ts`.
  - `data/` — resources, modes, factions, merchant items, witch powers, disasters, improvements.
  - `state.ts` — game state, creation, day flow, events.
  - `actions.ts` — player actions: `applyAction(state, action) → { state, events }`.
  - `stats.ts` — effective prices, weights, capacity, income, consumption.
  - `scoring.ts`, `meta.ts` — final score, unlocks, best scores, achievements.
- `src/ui/` — interface (to come).
- `tests/` — engine tests.
- `docs/` — analysis of the Unity game and porting decisions (in French).

## Deployment

Pushing to `main` builds and deploys to GitHub Pages (`.github/workflows/deploy.yml`).
In the repository settings, set **Pages → Source** to **GitHub Actions**.
