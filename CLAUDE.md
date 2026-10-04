@AGENTS.md

# Ali Farghaly's portfolio: read this first

This is **"Have you met Ali?"**, the portfolio site the agency **LKO.AGNCY** is building for its client **Ali Farghaly**, a no-code developer and product manager. The person you're working with is the agency, not Ali.

The site's whole idea is one line: **your idea is messy; Ali organizes it.** Almost every animation shows something messy becoming clear.

## Start here

1. **`docs/HANDOFF.md`:** the story so far, where everything stands, and what this user likes and dislikes. Read it before changing anything.
2. **`PLAN.md`:** the phases. Work happens one phase at a time; check which phase is active.
3. **`docs/CHANGELOG.md`:** what changed recently, and why.

Then read whatever the task needs:

| Doc | Covers |
|---|---|
| `docs/ARCHITECTURE.md` | Code map, routes, sections, shared components, styling |
| `docs/DESIGN.md` | Look, motion rules, copy voice |
| `docs/CONTENT.md` | Copy, projects and journal |
| `docs/DEVELOPMENT.md` | Commands, testing, Lighthouse, lint patterns, environment quirks |
| `docs/MIND.md` | The 3D `/mind` experience |

## Status (keep this current)

- **Phase 0** (review and optimisation): done, 4 Oct 2026.
- **Phase 1** (GitHub backup): done, 4 Oct 2026.
- **Phases 2–4** (narrative, roadmap metro map, journal only in the nav): built 4 Oct, plus review round 2 the same day (one path, open-ended stack, light default, hero line, floating CTA). Waiting for the client's approval.
- **Next, after approval:** content (5), optimization (6), the deep dive `/mind` (7), polish (8), launch (9).
- **`/mind` is on hold until Phase 7.** Don't work on it unless the user asks.

## Rules

- **Keep the docs current.** After every change, in the same turn:
  - add a dated entry at the top of `docs/CHANGELOG.md`;
  - update the doc that describes what you changed;
  - adjust `PLAN.md`;
  - fix the Status list above if the phase moved.

  Docs that drift are worse than no docs.
- **Copy and data live in `src/content/`** (and `content/journal/`). Never hard-code Ali's words in components.
- **This is Next.js 16**, so read `AGENTS.md`:
  - Params are async.
  - Page types are `PageProps<"/route">`; run `npx next typegen` if they're missing.
  - `next/image` uses `preload` or `fetchPriority="high"`. The `priority` prop is deprecated.
- **Lint is strict** (react-hooks v7):
  - No `setState` directly in an effect body.
  - No reading refs during render.
  - Don't mutate values returned by hooks.

  Patterns that pass are in `docs/DEVELOPMENT.md`.
- **Motion:**
  - Animations play on their own; never hover-only.
  - They pause when off-screen and respect `prefers-reduced-motion`.
  - Animate only `transform` and `opacity`, never `top`/`left`/`width`/`height` frame by frame. A transformed layer can still widen the page, so check phones for sideways scroll.
- **Verify before saying it's done:**
  - `npx tsc --noEmit`, `npm run lint` and `npm run build`.
  - Look at it in the browser at desktop and 375 px width.
  - Measure performance work with Lighthouse (see `docs/DEVELOPMENT.md`).
- **Ask the user first** before you:
  - spend their Higgsfield credits;
  - download outside assets;
  - install a third-party skill (vet its files first);
  - publish or deploy anything;
  - do anything irreversible.
- **Git:** the client-approval baseline is on GitHub at `Lokoagency/ali-porto` (`main`, commit `6129be9`). **Don't push over it until the client approves.** Commit locally, or on a branch, and push only when the user says so.

## Commands

```bash
npm run dev        # http://localhost:3000  (preview config "ali-portfolio")
npm run build      # production build; must pass before you call anything done
npm run start -- -p 3100   # serve the build (preview config "ali-portfolio-prod")
npx tsc --noEmit   # typecheck
npm run lint       # eslint (strict react-hooks rules)
```

## Environment quirks (Windows 11, OneDrive)

- **Write fails with "modified since read":** delete the file, then write it again.
- **Bash heredocs that contain apostrophes break.** Write the script to a file and run it with `node`.
- Python isn't installed.
- **The preview pane is usually hidden.** `requestAnimationFrame` and `IntersectionObserver` barely run there, so animations look frozen. A screenshot forces a frame, and you can check state numerically with JavaScript. `/mind?nolock` skips the pointer-lock pause in development.
