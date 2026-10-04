# Ali Farghaly portfolio: the plan

We finish the website phase by phase. **Ali's mind (`/mind`) is on hold** and comes back last.
Each phase ends with a review in the browser and a production build.

> Docs: start with [`docs/HANDOFF.md`](docs/HANDOFF.md). Every change gets an entry in [`docs/CHANGELOG.md`](docs/CHANGELOG.md), an update to the relevant doc, and an update to this plan. The rules are in `CLAUDE.md`.

**Where things stand (4 Oct 2026).** The site has four routes:
- `/`: Hero, Numbers, Sorting Room, What I do, Principles, Work, The path, How I work, Journal, Mind teaser, Contact
- `/work/[slug]`: 7 case studies
- `/journal` and `/journal/[slug]`: Notion-backed, with a Markdown fallback
- `/mind`: on hold

---

## Phase 0: Review and quick wins (done)

Measured with Lighthouse on a production build of the home page:

| | Before | After |
|---|---|---|
| Mobile performance | 79 | 86 |
| Accessibility | 93 | 97 |
| Desktop performance | 99 | 99 |
| Mobile LCP (real throttling) | 3.1 s | 3.0 s |
| Blocking time (real throttling) | 560 ms | 380 ms |
| Layout shift (CLS) | 0.027 | 0 |
| Fonts | 316 KB | 196 KB |
| Hero image | 37 KB | 21 KB |

- **"make sense." and "Clear out."** now use the new `SortText` animation: the phrase's own letters start jumbled, then sort into place and an underline draws in. It replaces the random-symbol scramble.
- **Hero:**
  - The portrait loads with high priority and is served as AVIF.
  - The entrance animation is plain CSS, so the hero is readable before JavaScript loads.
  - The notes move with transforms instead of layout.
  - The hero's loops pause when it's off-screen.
- **Fraunces:** self-hosted with the optical-size axis pinned at 72. It looks the same and weighs 148 KB instead of 264 KB.
- **Mobile layout:** the home page no longer scrolls sideways on phones (hero glow, hero notes, and the column in "The path").
- **Sorting Room:** the step labels no longer overlap the heading on short or mid-width screens.
- **Accessibility:**
  - Screen-reader text replaces invalid ARIA labels.
  - The logo and step buttons announce names that match their visible text.
  - Dim "not yet revealed" words went from 14% to 30% opacity.
- **Security:** the image optimiser only accepts Ali's Supabase bucket. Previously `*.amazonaws.com` made it an open image proxy.

---

## Phase order (set by the user, 4 Oct 2026)

The client approves this version before anything replaces it. Updated 4 Oct (review round 2): after approval the order is **Content (5) → Optimization (6) → Deep dive, `/mind` (7) → Polish (8) → Launch (9)**. Polish comes after the deep dive so it covers `/mind` too.

## Phase 1: GitHub backup (done)

The approved-baseline backup is at https://github.com/Lokoagency/ali-porto (branch `main`, commit `6129be9`). Don't push new work over it until the client approves; commit locally, or on a branch, until then.

## Phase 2: Narrative (storytelling) — built 4 Oct, waiting for the client's approval

**Goal:** the site tells one story. **Ali tackles the problem first, then the solution, not "the idea".** "Your idea is brilliant, but Ali will kill it for you": he strips the idea back to the real problem, then builds what solves it.

- Done: a gentle tone. The hero reads "Your idea is brilliant. But first, the problem." The chapters run problem → solution → how → roadmap → proof → person → together → contact, and the copy lives in `story` in `site.ts`.
- Review round 2 (4 Oct): the headline became "Your idea is brilliant. Let's start with the problem." The solution is "one person, one path" (one card, not two). The stack says it isn't the limit. Light mode is the default. A floating "Let's talk" pill rides along from the roadmap on.
- Next: Ali reviews the wording.

## Phase 3: The client roadmap (metro-map style) — built 4 Oct, waiting for the client's approval

**Goal:** an illustrated, animated map of how a project moves with Ali. It has two jobs:
1. Ali can join a project at any stage, adapt, and guide the client from there.
2. The client sees where they are on the map and what comes next.

- Done: an illustrated metro map on the home page (`home/Roadmap.tsx`), in the journal's old spot. It has 8 stations, 4 branch lines (where Ali can join), an auto-riding train, a "you are here" panel, and a vertical version for phones.
- Later, if wanted: a private, per-client tracker on top of it.

## Phase 4: Journal only in the nav — done 4 Oct

- Remove the journal section from the home page. The journal stays reachable from the nav (`/journal`).

## Phase 5: Content (waiting on your content)

**Goal:** every word, number, project and image on the site is Ali's real, approved content.

- Bring in the content you send. Copy lives in `src/content/site.ts` and projects in `src/content/projects.ts`, so components don't change.
- Replace the three placeholder journal posts in `content/journal/` with real ones. Or connect Notion (`NOTION_TOKEN` and `NOTION_JOURNAL_DB`, see README) so Ali can post without touching code.
- Check the numbers (30+ data types, 120+ wiki pages and so on), the job history and each case study against Ali's own records.
- Add proper photos and screenshots for each project at high resolution, plus alt text.
- Get Ali's sign-off on tone and claims.

**Done when** Ali has read every page and approved it.

## Phase 6: Optimization (performance and code health)

**Goal:** a mobile performance score of at least 90 under real throttling, with the motion and feel kept.

- Switch the animation library to its lazy-loading mode (`LazyMotion` with `m` components). That's about 30 KB less JavaScript.
- Turn static parts of the home sections into server components, so less of the page needs JavaScript to start. Today almost the whole home page hydrates.
- Target modern browsers only (browserslist), which drops about 13 KB of legacy polyfills.
- Tighten `sizes` on the project gallery images and preconnect to the Supabase image host.
- Re-check animation loops: they should only run while visible, and none should animate layout properties.
- Keep a Lighthouse budget for `/`, one case study and one journal post.

**Done when** the targets hold on two consecutive runs and nothing looks or moves differently.

## Phase 7: The deep dive, Ali's mind (`/mind`)

**Goal:** a cozy, explorable home with character, running smoothly on ordinary laptops.

Groundwork already in place:
- A stylized, hand-built Ali, seen in mirrors, who walks, sits and waves.
- A cheval mirror by the desk in the study.
- A performance pass: rendering is roughly 3 to 4× cheaper.
- The game-engine skill is installed.

What's left:
- A polish pass on the stylized Ali: face and proportions.
- **Lighting:**
  - Moonlight through the windows with soft light shafts.
  - Dust in the air, a little haze, and occasional lightning.
  - Window positions are already in `world.ts` (`WINDOWS`).
- **Something to explore:** the "scattered ideas" hunt. Six messy client ideas are hidden around the house; sorting them onto the plaque wall shows the real project each became. The data is already in `world.ts` (`IDEAS`).
- **Character:** Ali narrates a line on entering each room, and you can pet the cat.
- **Bugs and controls:** a playtest pass on desktop, and touch controls on phones.

**Done when** a first-time visitor gets it within about 10 seconds, finds something to do, and it stays smooth.

---

## What we need from you

- **Phase 1:** the content (copy, project details, images and journal posts).
- **Phase 1:** whether Ali will use Notion for the journal, and access to it.
- **Phase 4:** the domain, an analytics preference, and approval of the share-image design.

## Phase 8: Polish and UX

**Goal:** every section feels deliberate on phone, tablet and desktop, in light and dark themes.

- Go section by section, at 375, 768, 1024 and 1440 px, in both themes.
- Add a custom 404 page in the site's style. Today it's Next.js's default.
- Polish the case-study pages: gallery, next and previous project, and the call to action.
- Improve the journal reading experience: typography, reading time and sharing.
- Accessibility: focus states, keyboard paths and a reduced-motion check of every animation. Also decide on the dim scroll-reveal text, which is still below contrast guidelines at 30% by design.
- Run make-interfaces-feel-better and motion-patterns over each section, `/mind` included.

**Done when** there are no layout bugs at those widths and keyboard and screen-reader paths work.

## Phase 9: Launch

**Goal:** live on Ali's domain, findable and shareable.

- **SEO:**
  - `metadataBase`, plus a title and description per page.
  - Open Graph and Twitter images, generated per page with `next/og`.
  - `sitemap.xml` and `robots.txt`.
  - JSON-LD Person schema.
- Choose a privacy-friendly analytics tool, and decide whether to add error monitoring.
- Deploy to Vercel:
  - Environment variables (Notion).
  - The domain and HTTPS.
  - Preview deployments for review.
- **Notion images:** Notion image links expire after an hour. Mirror them (for example to Supabase) so journal images never break on cached pages.
- Final checks across devices and browsers: iPhone Safari, Android Chrome, desktop Safari, Firefox and Chrome.

**Done when** the site is live, sharing previews look right, and Ali can publish a journal post himself.
