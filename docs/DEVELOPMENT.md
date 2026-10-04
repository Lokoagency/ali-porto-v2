# Development: commands, testing and quirks

## Setup

- **Runtime:** Node 22 (22.23 is installed) and npm. `npm install` sets everything up.
- **Environment variables (all optional):** copy `.env.example` to `.env.local`.

  | Variable | Value |
  |---|---|
  | `NOTION_TOKEN` | The Notion integration secret |
  | `NOTION_JOURNAL_DB` | The Journal database ID |

  Without them, the journal reads `content/journal/*.md`.

## Commands

| Command | What |
|---|---|
| `npm run dev` | Dev server, http://localhost:3000 |
| `npm run build` | Production build. **Must pass before anything counts as done.** Its route table shows which pages are static (○), statically generated (●) and on a 5-minute revalidate |
| `npm run start -- -p 3100` | Serves the last build. Rebuild and restart it after every change |
| `npx tsc --noEmit` | Typecheck |
| `npm run lint` | ESLint: Next core-web-vitals, TypeScript, react-hooks v7 |
| `npx next typegen` | Regenerates the `PageProps<"/route">` types if TypeScript says they're missing |

**Preview servers** (Claude desktop app, `.claude/launch.json` in both `VP/` and `VP/ali-portfolio/`). Use `preview_start`, not Bash, to run them.

| Name | Port | Runs |
|---|---|---|
| `ali-portfolio` | 3000 | `npm run dev` |
| `ali-portfolio-prod` | 3100 | `npm run start -- -p 3100`. Build first. It only picks up new files in `public/` on restart |

## Done means verified

1. **Checks:** `npx tsc --noEmit`, `npm run lint` and `npm run build` all come back clean.
2. **Desktop:** look at the change in the browser. Screenshots are fine as proof.
3. **Mobile:** check at **375 px wide** (`resize_window` preset `mobile`). Confirm there's no sideways scroll; `document.documentElement.scrollWidth` should equal the viewport width. Transformed or decorative layers have caused this before.
4. **Both themes:** check light and dark if you touched colours or surfaces.
5. **Performance:** if the change could affect it, measure with Lighthouse (below) and record the numbers in `CHANGELOG.md`.
6. **Docs:** update them (see `HANDOFF.md`, last section).

## The preview pane (important)

- The browser pane is often **hidden**. Then `requestAnimationFrame` and `IntersectionObserver` barely run:
  - motion and Lenis animations look frozen;
  - `useInView` never turns true;
  - a 3D page runs at about 3 fps.

  It's the pane, not the site.
- **A screenshot forces a frame.** Spacing out screenshots lets time-based animations (CSS, Web Animations) move on.
- **Poll with `setTimeout`, not `requestAnimationFrame`,** in `javascript_tool` scripts. rAF loops can hang until the 45-second timeout.
- **Prefer numeric checks:** `getBoundingClientRect`, computed styles, `scrollWidth`.
- **Emulated sizes:** `resize_window` scales them down to fit the pane. Reset with preset `desktop` when you're done.
- **Local files:** `file://` pages open only as static snapshots. To view a scratch HTML page, put it in `public/` temporarily, load it from the dev server, then delete it.

## Lighthouse: how to measure performance

Use a production build on :3100 and Chrome at its default install path:

```bash
export CHROME_PATH="/c/Program Files/Google/Chrome/Application/chrome.exe"
# simulated mobile (the standard score)
npx -y lighthouse@12 http://localhost:3100/ --quiet --chrome-flags="--headless=new --no-sandbox" \
  --output=json --output-path=lh-mobile.json --only-categories=performance,accessibility,best-practices,seo
# real throttling: slow 4G + 4x CPU actually applied; closest to a real phone
npx -y lighthouse@12 http://localhost:3100/ --quiet --throttling-method=devtools --chrome-flags="--headless=new --no-sandbox" \
  --output=json --output-path=lh-mobile-real.json --only-categories=performance
# desktop
npx -y lighthouse@12 http://localhost:3100/ --quiet --preset=desktop --chrome-flags="--headless=new --no-sandbox" \
  --output=json --output-path=lh-desktop.json --only-categories=performance,accessibility,best-practices,seo
```

Write the JSON files to the scratchpad, not the project. Read them with a small `node -e` script:
- `categories.*.score`;
- `audits['largest-contentful-paint'].displayValue`, and the same for the other metrics;
- `audits['largest-contentful-paint-element'].details` for the LCP element and its phases;
- `audits['metrics'].details.items[0]` for the observed timings.

**Gotchas:**
- **Simulated mobile LCP is pessimistic on localhost.** All the scripts finish downloading before first paint, so the simulator assumes the paint waited for them. If the observed LCP equals the observed first paint, the page is fine. Trust the `--throttling-method=devtools` run for real-world numbers.
- **The "1.4 s style and layout" figure** is the observed time multiplied by 4 for the CPU slowdown. Run once with `--save-assets` and add up the `Layout` and `UpdateLayoutTree` events in the trace to see what's real.

**Baseline after Phase 0, home page, 4 Oct 2026:**

| Run | Score | FCP | LCP | TBT | CLS |
|---|---|---|---|---|---|
| Mobile, simulated | perf 86, a11y 97, best practices 100, SEO 100 | 0.9 s | 4.2 s (artefact) | 60 ms | 0 |
| Mobile, real throttling | perf 81 | 2.6 s | 3.0 s | 380 ms | 0.026 |
| Desktop | perf 99 | 0.3 s | 0.9 s | 0 ms | 0 |

Weight: JavaScript and CSS about 283 KB gzipped, fonts 196 KB, hero portrait about 21 KB AVIF.

**Bundle check:**
1. Take `.next/server/app/index.html` after a build.
2. List its `/_next/static/chunks/*` scripts and stylesheets.
3. Gzip each one and add up the sizes.

The biggest chunks are react-dom (about 70 KB), the Next.js router (about 44 KB) and motion (about 48 KB). Phase 2 targets motion with LazyMotion and `m` components.

## Lint patterns that pass (react-hooks v7)

The linter blocks several common React habits. Use these instead:

| Need | Pattern | Example in the code |
|---|---|---|
| Reset state when something changes | Compare against a "previous" state during render, not in an effect | `Nav.tsx` (`prevPath`) |
| Read browser state (theme, media query, store) | `useSyncExternalStore(subscribe, get, getServer)` | `ThemeToggle.tsx`, Hero (`narrow`), `mind/store.ts` |
| Initial value from `localStorage` | A lazy `useState(() => { try { … } catch { … } })` | `MindExperience.tsx` (sound, sensitivity) |
| Timers that update state | `setState` inside a `setInterval` or `setTimeout` callback is fine. Calling it directly in the effect body is not | Hero loops, Paths |
| Imperative DOM work (measuring, animating) | Refs plus effects, writing to `el.style`, with no React state | `SortText.tsx`, `IdeaSorter.tsx` |
| Ref arrays | Callback refs, `ref={(n) => { refs.current[i] = n; }}` | IdeaSorter, SortText |
| Per-frame 3D | Mutate refs or objects you own, never values from `useMemo` or `useThree` | `mind/Player.tsx` |

## Next.js 16 notes (also in `AGENTS.md`)

- **Read the bundled docs** in `node_modules/next/dist/docs/` before using an API you haven't checked. Things moved.
- **Params:** `params` is a Promise (`const { slug } = await params`), and pages are typed as `PageProps<"/work/[slug]">`.
- **Images:** `next/image` uses `preload` or `fetchPriority="high"`/`loading="eager"`; `priority` is deprecated. `images.qualities` defaults to `[75]`, so any other `q=` returns 400.
- **Turbopack** is the default; dev output lives in `.next/dev`, so a build can run while dev is running.
- **Agent files:** `next dev` rewrites the marked block in `AGENTS.md`. `CLAUDE.md` is ours: Next leaves it alone once `AGENTS.md` holds the block.

## Windows and OneDrive quirks

- **The project lives on OneDrive.** The Write and Edit tools sometimes fail with "modified since read". Delete the file and write it again, or edit with a small `node` script.
- **Shells:** PowerShell and Git Bash. Python isn't installed, so use `node -e` or a `.cjs` script for scripted edits.
- **Heredocs:** a Bash heredoc containing an apostrophe breaks the tool's quoting. Write scripts to a file (scratchpad) with the Write tool, then run `node file.cjs`.
- **Working directory:** a `cd` in a Bash call can change your working directory for later calls. Prefer absolute paths.

## No version control (yet)

This folder **isn't a git repository**, so nothing can be undone. Until the user agrees to `git init` (recommend it):
- copy a file before a big rewrite;
- record every change in `CHANGELOG.md`.

Old `/mind` versions are in `%TEMP%\mind-backup\`, which the system may clean.

## Deployment (planned, Phase 4)

- **Host:** Vercel. Set `NOTION_TOKEN` and `NOTION_JOURNAL_DB` there.
- **Images:** the image optimiser runs on Vercel, and `next.config.ts` allows only the Supabase bucket. Add exact hosts only; never wildcards.
- **Before launch:**
  - favicon;
  - `metadataBase`, Open Graph and Twitter images (`next/og`);
  - `sitemap.ts`, `robots.ts`, `not-found.tsx`;
  - JSON-LD Person schema;
  - mirroring Notion images.

## Changelog entry template

```md
## YYYY-MM-DD: short title
**What:** what changed (files, behaviour).
**Why:** the request or problem.
**Verified:** tsc/lint/build, browser checks, numbers.
**Follow-ups:** anything left open.
```
