# Architecture

How the code is organized: what runs where, and which file to open for which job. The 3D page has its own doc, [MIND.md](MIND.md).

## Stack

| | Version | Used for |
|---|---|---|
| Next.js (App Router, Turbopack) | 16.3.8 | Routing, server components, ISR, `next/image`, `next/font` |
| React | 19.2.8 | UI |
| Tailwind CSS | v4 (`@tailwindcss/postcss`) | Styling. Tokens are mapped with `@theme inline` in `globals.css` |
| motion (`motion/react`) | 14.0.0 | Component animation, scroll-linked values, `animate()` |
| lenis | 1.3 | Smooth scrolling (off on `/mind` and for reduced motion) |
| gray-matter + marked | | Markdown journal posts |
| three, @react-three/fiber 9, drei 10, @react-three/postprocessing 3 | three r186 | `/mind` only (loaded with `next/dynamic`, `ssr: false`) |
| TypeScript (strict), ESLint 9 (`eslint-config-next` + react-hooks v7) | | Path alias `@/*` → `src/*` |

No database, no API routes, no auth. Data is static TypeScript plus Notion (optional) and Ali's Supabase image bucket.

## Rendering model

- **Pages are server components.** They read content and pass plain data to client sections; most home sections are client components because they animate.
- **ISR:** both journal pages and `/mind` set `revalidate = 300`, so new Notion posts appear within 5 minutes without a deploy. The home page is fully static (it no longer shows posts).
- **Static pages:**
  - `/work/[slug]` builds from `projects` (`generateStaticParams`).
  - `/journal/[slug]` builds from posts at build time and revalidates.
- **`/mind`** loads its three.js scene client-side only (`dynamic(() => import("./Scene"), { ssr: false })`).

## Routes

| Route | File | What it shows | Data |
|---|---|---|---|
| `/` | `src/app/page.tsx` | The home page: one story in 11 sections, plus the scroll rail. Fully static | none (copy from `site.ts`) |
| `/work/[slug]` | `src/app/work/[slug]/page.tsx` | A case study: header, `Gallery`, numbered story, tools aside, live link, next case | `projects` |
| `/journal` | `src/app/journal/page.tsx` | The journal index with tag filter (`JournalList`) | `getAllPosts()` |
| `/journal/[slug]` | `src/app/journal/[slug]/page.tsx` | A post (`.prose-ali`), `ReadingProgress`, "Keep reading" | `getAllPosts()` |
| `/mind` | `src/app/mind/page.tsx` | `MindExperience`, the 3D house (paused) | post links for the bookshelf |

Metadata: `layout.tsx` sets the title template (`"%s · Ali Farghaly"`, default "Have you met Ali?") and the description. Case studies and posts set their own titles. There's no `metadataBase`, Open Graph image, sitemap or robots file yet.

## Root layout (`src/app/layout.tsx`)

- **Fonts:**
  - **Fraunces** is self-hosted through `next/font/local`, from `src/fonts/fraunces-opsz72-latin-{normal,italic}.woff2`. These are the variable weight, SOFT and WONK axes, with optical size pinned at 72. The licence is `src/fonts/Fraunces-OFL.txt`. The CSS variable is `--font-fraunces`.
  - **Geist** and **Geist Mono** come from `next/font/google` (`--font-geist-sans`, `--font-geist-mono`).
- **Theme:** an inline script runs before paint. **Light is the default** (since 4 Oct): it reads `localStorage.theme` and uses dark only if that is `"dark"` (the system setting is ignored), then sets `<html data-theme="light|dark">`. `<html>` has `suppressHydrationWarning` because of this.
- **Body:** has the `grain` class (a fixed paper-noise overlay) and renders, in order: `<SmoothScroll/>`, `<Spotlight/>`, `<Nav/>`, `<main>{children}</main>`, `<Footer/>`.
- **On `/mind`:** Nav, Footer and SmoothScroll all switch themselves off, because the 3D page is full-screen.

## Home page sections (`src/app/page.tsx`, in order)

`ScrollRail` (home only) sits on top of all of them. So does `home/FloatingCta.tsx`: a glass "Let's talk" pill fixed at the bottom centre, visible from the roadmap until the contact section (it checks on scroll, throttled to one frame). It names the station the visitor picked on the roadmap, via the `roadmap:pick` window event (`ROADMAP_PICK`). Labels, numbers and headlines come from `story` in `src/content/site.ts`. IDs are what the nav, the scroll rail and anchor links use. The order tells a story: problem → solution → how → roadmap → proof → person → working together → let's talk. The journal isn't on the home page; it's in the nav.

| # | Component | `id` | What it does |
|---|---|---|---|
| — | `home/Hero.tsx` | `top` | The hero. Details below |
| — | `home/Numbers.tsx` | — (aria-label "Ali in numbers") | 4 stats from `stats` that count up when visible |
| 01 | `home/IdeaSorter.tsx` | `process` | "The problem": the Sorting Room. Details below |
| 02 | `home/Paths.tsx` | `paths` | "The solution": **one person, one path**. One card with two halves (Build it, Run it), each with a looping sketch, joined by a junction with Ali's portrait. Then the stack: tool chips, a cycling "knows → picks up" chip and a note that the list isn't the limit |
| 03 | `home/Principles.tsx` | `how` | "How I build": a scroll-revealed quote and 4 principle cards with drawn glyphs |
| 04 | `home/Roadmap.tsx` | `roadmap` | "The roadmap": the metro map. Details below |
| 05 | `home/Work.tsx` | `work` | "Proof": project cards, the next-idea card and the filter |
| 06 | `home/Journey.tsx` | `path` | "The person": the dark band, a translation card and a timeline |
| 07 | `home/HowIWork.tsx` | `together` | "Working together": 4 cards from `workingStyle`, each with its own looping sketch |
| — | `home/MindTeaser.tsx` | — | Link card to `/mind` |
| 08 | `home/Contact.tsx` | `contact` | "Let's talk": contact options |

**Hero** (`home/Hero.tsx`):
- **Text:**
  - The `MessyWord` "mess." scatters and settles every 5.2 s.
  - The tagline plays `SortText` "make sense.".
  - `RotatingRole` cycles `person.roles` every 2.6 s.
- **Buttons:** "Watch an idea get sorted" (→ #process) and "See the work" (→ #work).
- **Portrait:** Ali's portrait with a pointer-parallax tilt.
- **Notes:** six glass notes that organize themselves every 9 s. The "Mess it up / Tidy up" button takes over.
- **Entrance:** pure CSS (`.anim-*` classes), so it paints before JavaScript loads.
- **Loops:** they pause when the hero is off-screen (`useInView`).

**IdeaSorter** (`home/IdeaSorter.tsx`), the signature animation:
- **Scroll-driven:** a sticky, 320vh-tall section with a canvas of 260 particles. Particles pass three gates (Listen, Scope, Structure); noise is cut at Scope; the rest sort into four lanes (Roadmap, Sprints, QA, Docs).
- **Overlays:**
  - Chips that turn from a raw thought into a clean spec (`ideaFragments`).
  - Clickable step segments with narration (`sorterStages`), a live tally, and a finale line.
- **Geometry:** a pure function of scroll progress, so scrolling back un-sorts. It flows left→right on desktop and top→bottom on mobile. The stage starts below the measured heading block.
- **Cost:** it only draws while on screen, and it reads its colours from CSS variables, so it follows the theme.

**Roadmap** (`home/Roadmap.tsx`), the client metro map:
- **The map:** an SVG with a viewBox of 1000×400. The main line (`LINE` points, with 45° bends) carries 8 stations (`AT`). Branch lines (`BRANCH`) join at stations to show where Ali can jump on.
- **The train:** a motion value `d` (distance along the line) moves the train with `animate()`. The travelled part of the line is drawn with `pathLength` = `d` / total length.
- **Behaviour:**
  - "You are here" advances every 3.2 s while on screen. It stops once the visitor clicks a station or a "Where are you now?" chip. Reduced motion turns the auto-advance off.
  - The panel (`AnimatePresence`, keyed) shows the station, what happens there, what you get, and the next stop.
- **Phones** (below `md`) get a vertical list version of the line.
- **Data:** `roadmap` in `site.ts`. To move stations or branches, edit `LINE`, `AT` and `BRANCH`. Stations must sit on the line.

**Work** (`home/Work.tsx`):
- **Filter:** Everything / The Builds / The Systems, matching the categories All / No-Code / Product, with counts.
- **Project cards:** a cursor-following "Open case" bubble and a status tag (Live pulses, Private, Obsolete).
- **Next-idea card:** "Your idea could be next.", with dots that keep sorting into a line.

**Journey** (`home/Journey.tsx`):
- `.section-deep` is an always-dark teal band, and the scroll rail flips to light ink over it.
- **Left column (sticky):** the heading and the `TranslationCard`, which flips words (Arabic/English) while visible.
- **Right column:** a timeline drawn by scroll, with chapter dots that light up.

**Contact** (`home/Contact.tsx`):
- **Main button:** "Book a Google Meet" (a calendar template link).
- **Email:** `CopyEmail`, a clipboard copy that falls back to `mailto`.
- **Channel cards:** LinkedIn, Upwork and WhatsApp.

## Shared components (`src/components/`)

| File | Role |
|---|---|
| `Nav.tsx` | Fixed glass pill: Process, Roadmap, Work, Journal, theme toggle, "Let's talk", animated mobile menu. The active-section pill moves between items (`layoutId`) and follows whichever section is at the middle of the viewport. **It never hides on scroll.** Hidden on `/mind`. |
| `Footer.tsx` | Page and contact links, "Built with care · No idea left unsorted". Hidden on `/mind`. |
| `SmoothScroll.tsx` | Lenis (`lerp 0.12`), exposed as `window.__lenis`. Catches `#hash` and `/#hash` links in the capture phase and smooth-scrolls to them. Resets scroll on route change. Off on `/mind` and for reduced motion. |
| `ScrollRail.tsx` | Home only, `xl` screens and up. A section index on the right (labels appear on hover) and a back-to-top button with a progress ring after 700 px. |
| `Spotlight.tsx` | One delegated `pointermove` listener. It sets `--mx`/`--my` on the hovered `.spotlight` element, which draws a teal glow that follows the cursor (mouse only). |
| `ThemeToggle.tsx` | Flips `<html data-theme>` and stores it in `localStorage.theme`. Adds the `theme-fade` class for 450 ms so colours cross-fade. It reads the theme with `useSyncExternalStore` and a `MutationObserver`. |
| `SortText.tsx` | The phrase's letters start jumbled and sort into place, gaining colour, then an underline draws in. Props: `text`, `delay`, `loop` (ms, 0 = once), `underline`. Real kerned text sets the layout and is shown without JavaScript or with reduced motion. Letters are pinned to measured glyph positions. Pauses off-screen. Used for "make sense." and "Clear out.". |
| `ScrambleText.tsx` | Letter/digit noise that resolves left to right. Used for small mono labels: section eyebrows through `SectionLabel`, and `/mind` labels. A `wrap` prop allows multi-line text (card titles). Screen-reader text through `sr-only`. |
| `primitives.tsx` | **`Reveal`:** fades and rises in once when visible. **`SplitHeading`:** words rise in sequence; the `italic` word indices become teal italic. **`SectionLabel`:** number, line, scrambled label. **`Magnetic`:** follows the pointer with a spring. **`Arrow`** icon, and the `easeOut` curve. |
| `journal/JournalList.tsx` | Tag-filter tabs and an animated grid of `PostCard`s. Shows an empty state when there are no posts. |
| `journal/PostCard.tsx` | Post card. Also exports `formatDate` (en-GB) and the `PostMeta` type. |
| `journal/ReadingProgress.tsx` | Fixed top progress bar on post pages. |
| `work/Gallery.tsx` | Screenshot slider with arrow keys. `device: "phone"` shows a phone frame. |
| `mind/*` | The 3D house. See [MIND.md](MIND.md). |

## Content and data

| File | Holds |
|---|---|
| `src/content/site.ts` | All of Ali's copy: person, contact, tools, paths, principles, journey, translations, workingStyle, the sorter data, stats, `story` (the home page's narrative, labels and headlines) and `roadmap` (the metro map). Also the `asset()` helper for Supabase image URLs. Details in [CONTENT.md](CONTENT.md) |
| `src/content/projects.ts` | The 7 case studies (`Project` type) and `getProject(slug)` |
| `src/lib/journal.ts` | The journal engine (`server-only`): `getAllPosts()`, `getPost()`, `toMeta()`. Reads Notion when `NOTION_TOKEN` and `NOTION_JOURNAL_DB` are set, and Markdown from `content/journal/*.md` otherwise or on a Notion error. Posts are sorted newest first. `toMeta` strips the post body so it doesn't reach client bundles |
| `content/journal/*.md` | Markdown posts with front matter. Currently 3 placeholders |

## Styling system (`src/app/globals.css`)

- **Tokens:**
  - Light values on `:root`, dark values on `:root[data-theme="dark"]`.
  - `@theme inline` maps them to Tailwind classes such as `bg-paper`, `bg-card`, `text-ink`, `text-ink-soft`, `text-muted`, `border-line`, `text-teal`, `bg-teal-tint`, `text-sun` and `text-leaf`.
  - Fonts become `font-sans`, `font-mono` and `font-display`.
- **Utility classes:**

  | Class | What it does |
  |---|---|
  | `.font-display` | Fraunces with SOFT 100 and WONK 0 |
  | `.font-display-italic` | Fraunces italic with WONK 1, for the quirky italic |
  | `.eyebrow` | Mono, uppercase, letter-spaced, teal |
  | `.tabular` | Tabular numbers |
  | `.anim-focus`, `.anim-fade-up`, `.anim-blur-in`, `.anim-portrait` | The hero's CSS entrance |
  | `.grain` | Paper-noise overlay |
  | `.glass` | The liquid-glass surface |
  | `.img-outline` | Hairline outline on images |
  | `.press` | Tactile scale on press |
  | `.link-draw` | Underline that draws in |
  | `.prose-ali` | Journal typography |
  | `.pulse-dot` | Pulsing status dot |
  | `.section-deep` | Always-dark teal band with its own token overrides |
  | `.theme-fade` | Cross-fades colours during a theme switch |
  | `.spotlight` | Cursor-following glow |

- **Global behaviour:**
  - `:focus-visible` shows a teal outline.
  - A global `prefers-reduced-motion` rule shortens all CSS animations and transitions to almost nothing.
  - `body { overflow-x: clip }` is a safety net against sideways scroll.

## Images

- **`next/image`:** used for the hero portrait and the project images.
  - Images are served as AVIF first, then WebP (`next.config.ts` → `images.formats`).
  - **Only Ali's Supabase bucket** is allowed (`images.remotePatterns`). Add an exact hostname if another source is ever needed; never use a wildcard.
- **Plain `<img>`:** used for the small tool icons and for journal post images, which come out of Markdown or Notion HTML.
- **Hero portrait:** uses `loading="eager"` and `fetchPriority="high"`, because it's the mobile LCP element.

## File map

```
ali-portfolio/
├─ CLAUDE.md               ← loaded automatically by Claude Code; points to these docs
├─ AGENTS.md               ← Next.js-managed block (next dev rewrites it); leave as is
├─ PLAN.md                 ← the phases
├─ README.md               ← human quick start
├─ docs/                   ← HANDOFF, ARCHITECTURE, DESIGN, CONTENT, DEVELOPMENT, MIND, CHANGELOG
├─ content/journal/        ← Markdown posts (fallback when Notion isn't configured)
├─ public/                 ← only unused create-next-app SVGs right now
├─ src/
│  ├─ app/                 ← layout.tsx, globals.css, page.tsx, work/[slug], journal, journal/[slug], mind, favicon.ico (default)
│  ├─ components/          ← shared components (above), home/*, journal/*, work/*, mind/*
│  ├─ content/             ← site.ts, projects.ts
│  ├─ fonts/               ← self-hosted Fraunces + OFL licence
│  └─ lib/journal.ts       ← Notion / Markdown engine
├─ next.config.ts          ← images: AVIF/WebP, Supabase-only remotePatterns
├─ eslint.config.mjs       ← next core-web-vitals + typescript
├─ .env.example            ← NOTION_TOKEN, NOTION_JOURNAL_DB
└─ .claude/launch.json     ← preview servers: ali-portfolio (:3000), ali-portfolio-prod (:3100)
```
