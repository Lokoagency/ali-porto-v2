# Ali Farghaly portfolio: the plan

We finish the website phase by phase. **Ali's mind (`/mind`) is on hold** and comes back last.
Each phase ends with a review in the browser and a production build.

> Docs: start with [`docs/HANDOFF.md`](docs/HANDOFF.md). Every change gets an entry in [`docs/CHANGELOG.md`](docs/CHANGELOG.md), an update to the relevant doc, and an update to this plan. The rules are in `CLAUDE.md`.

**Where things stand (6 Oct 2026).** V2 is live on Vercel at https://ali-porto-v2.vercel.app (repo `Lokoagency/ali-porto-v2`). The site has these routes:
- `/`: the hero (Ali speaking: "I build what you meant."), then 01 Why (Ali's quote), 02 Proof (the work), 03 How (the Sorting Room, one path, the protocol, working together), 04 Knowledge (the stack), the Mind teaser, 05 Let's talk
- `/about`: Ali's path (translator → builder → developer & PM)
- `/work/[slug]`: 7 case studies
- `/journal` and `/journal/[slug]`: Notion-backed, with a Markdown fallback
- `/admin`: Ali's dashboard (front end, browser-only storage for now)
- `/track#…`: a client's private view of the protocol
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

The client approves this version before anything replaces it. Updated 4 Oct (review round 2): the order is **Content (5) → Admin dashboard, front end (6, built) → Database and login (7) → Optimization (8) → Deep dive, `/mind` (9) → Polish (10) → Launch (11)**. The dashboard comes before optimization because it changes where the data comes from. Polish comes after the deep dive so it covers `/mind` too.

## Phase 1: GitHub backup (done)

The approved-baseline backup is at https://github.com/Lokoagency/ali-porto (branch `main`, commit `6129be9`). Don't push new work over it until the client approves; commit locally, or on a branch, until then.

## Phase 2: Narrative (storytelling) — built 4 Oct, waiting for the client's approval

**Goal:** the site tells one story. **Ali tackles the problem first, then the solution, not "the idea".** "Your idea is brilliant, but Ali will kill it for you": he strips the idea back to the real problem, then builds what solves it.

- Done: a gentle tone. The hero reads "Your idea is brilliant. But first, the problem." The chapters run problem → solution → how → roadmap → proof → person → together → contact, and the copy lives in `story` in `site.ts`.
- Review round 2 (4 Oct): the headline became "Your idea is brilliant. Let's start with the problem." The solution is "one person, one path" (one card, not two). The stack says it isn't the limit. Light mode is the default. A floating "Let's talk" pill rides along from the roadmap on.
- Round 3 (4 Oct): **philosophy → methodology → protocol**. Ali is a living philosophy (an edition badge, what he's researching now, recent changes). It becomes a methodology (one person, one path), which gives the client a protocol to follow and track (the metro map). The Sorting Room and its messy → clear animation are unchanged. Corporate keywords are woven into the copy, the station tags and the page metadata.
- Round 4 (4 Oct): **simplified**. The hero only says who Ali is and why you're here ("Need a product built, and run properly?"). The page reads why → how → knowledge → let's talk. The word "idea" is gone (it's "product"). The stack moved under Knowledge.
- Next: Ali reviews the wording.

## Phase 3: The client roadmap (metro-map style) — built 4 Oct, waiting for the client's approval

**Goal:** an illustrated, animated map of how a project moves with Ali. It has two jobs:
1. Ali can join a project at any stage, adapt, and guide the client from there.
2. The client sees where they are on the map and what comes next.

- Done: an illustrated metro map on the home page (`home/Roadmap.tsx`), in the journal's old spot. It has 8 stations, 4 branch lines (where Ali can join), an auto-riding train, a "you are here" panel, and a vertical version for phones.
- Round 3: it's now "The protocol". Each station has keyword tags, and a "tell Ali where you are" form sends the station plus a line by WhatsApp or email (prefilled, nothing stored).
- The private per-client tracker is part of Phase 6.

## Phase 4: Journal only in the nav — done 4 Oct

- Remove the journal section from the home page. The journal stays reachable from the nav (`/journal`).

## Phase 5: Content (active; waiting on Ali's material)

**Goal:** every word, number, project and image on the site is Ali's real, approved content.

- **5 Oct, in progress (the active phase):** the version for Ali's review is on the GitHub `review` branch. The groundwork is done: all copy lives in `site.ts`, there are no em dashes in visitor-facing text, and unused data is removed. Waiting on Ali's material: his published posts (to replace the three placeholder journal posts), TextWing screenshots and approval, the HYMA mockups, and the Editorial Rules.
- **Started 5 Oct:** the copy is rewritten from Ali's Content Bank v2 (see `docs/CONTENT.md`, "Who Ali is"). Still to come: the HYMA Hi-Fi mockups (they need a claude.ai login to view), the Editorial Rules document, a TextWing case study (screenshots), and Ali's sign-off.
- Bring in the content you send. Copy lives in `src/content/site.ts` and projects in `src/content/projects.ts`, so components don't change.
- Replace the three placeholder journal posts in `content/journal/` with real ones. Or connect Notion (`NOTION_TOKEN` and `NOTION_JOURNAL_DB`, see README) so Ali can post without touching code.
- Check the numbers (650+ companies, 120+ wiki pages and so on), the job history and each case study against Ali's own records.
- Add proper photos and screenshots for each project at high resolution, plus alt text.
- Get Ali's sign-off on tone and claims.

**Done when** Ali has read every page and approved it.

## Polish pass (pulled forward, 5 Oct)

The user asked to polish now, while Phase 5 waits on Ali's material. Pass 2 is done too: the DNA strip is fully animated, plus the contact underline, the footer sort, the pill's arrow nudge and the chip lift. Pass 1: one thread ("keeping what you meant"), simple 01–08 labels, the hero underline, the four-versions strip, and skill-checklist fixes (hit areas, steady-width numbers, the quote's spacing). The full Phase 10 polish (every width, both themes, a 404 page, accessibility) still comes later.

## Phase 6: Admin dashboard for Ali (front end) — built 6 Oct

**Goal:** Ali runs his own site (journal, work, featured work) and tracks each client on the protocol, **without being able to break the design**.

Built (front end only, at the user's request: "keep it in the front end till now"):
- **`/admin`**, "Hi Ali. What changed?", with four tabs:
  - **Work:** add, edit and remove projects. A live preview shows the real project card from the home page. Fields have design-safe limits (name 60, summary 140, and so on), and cover images must come from the Supabase bucket. Removing asks for confirmation.
  - **Featured:** drag-and-drop ordering (motion `Reorder`, drag handles) with show/hide switches and a live, zoomed-out preview of the home grid. The first visible project is the double-width featured card.
  - **Journal:** write and edit posts in Markdown with a draft/published switch, plus a live preview in the post template (`prose-ali`).
  - **Clients:** add a client, move them along a mini metro line, add a note, and **copy a private link**.
- **`/track#…`:** the client's private view of the metro map, with their train at their station, Ali's note, the date, and a "Message Ali" WhatsApp button. The data rides in the URL fragment, so nothing is stored on a server, and Ali sends a fresh link after each update.
- **Storage for now:** this browser's localStorage. "Export changes" downloads a JSON file for the agency to apply to `src/content`, and "Reset to the live site" discards local edits. A yellow banner says so.
- **Not yet:** the login (magic link), saving to a database, and publishing from the dashboard. All of that is Phase 7. `/admin` is `noindex` and not linked from the site; edits only ever affect the browser they're made in.

## Phase 7: Connect the dashboard: database and login (Supabase)

**Goal:** what Ali changes in `/admin` goes live on the site, and only Ali can get in.

- **The project:** Supabase, either Ali's (it already hosts the images) or a new agency one. Decide then.
- **Login:** a magic link to Ali's email (the user's choice), with an allow-list and row-level security. `/admin` redirects to the login when signed out.
- **Tables:** projects (with order and hidden), posts, clients and, optionally, requests. Seed them from today's `projects.ts` and `content/journal`, using the dashboard's export format.
- **The site reads from the database** with on-demand revalidation (`revalidateTag`) whenever Ali saves, so pages stay static and fast.
- **Uploads:** cover images and screenshots go straight to Storage from the dashboard, resized automatically.
- **Client tracking:** `/track/<token>` reads from the database, so links stay valid after an update and can be revoked.
- Version history and undo.

**Done when** Ali logs in with his email, publishes a post, re-orders featured work and updates a client's station, and the live site reflects it within seconds.

## Phase 8: Optimization (performance and code health)

**Goal:** a mobile performance score of at least 90 under real throttling, with the motion and feel kept.

- Switch the animation library to its lazy-loading mode (`LazyMotion` with `m` components). That's about 30 KB less JavaScript.
- Turn static parts of the home sections into server components, so less of the page needs JavaScript to start. Today almost the whole home page hydrates.
- Target modern browsers only (browserslist), which drops about 13 KB of legacy polyfills.
- Tighten `sizes` on the project gallery images and preconnect to the Supabase image host.
- Re-check animation loops: they should only run while visible, and none should animate layout properties.
- Keep a Lighthouse budget for `/`, one case study and one journal post.

**Done when** the targets hold on two consecutive runs and nothing looks or moves differently.

## Phase 9: The deep dive, Ali's mind (`/mind`)

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

- **Reported 5 Oct:** the user finds `/mind` "very very stuttery". Profile and fix it first in this phase (frame time, draw calls, shadows, post-processing, and React re-renders in the loop).

**Done when** a first-time visitor gets it within about 10 seconds, finds something to do, and it stays smooth.

---

## Phase 10: Polish and UX

**Goal:** every section feels deliberate on phone, tablet and desktop, in light and dark themes.

- Go section by section, at 375, 768, 1024 and 1440 px, in both themes.
- Add a custom 404 page in the site's style. Today it's Next.js's default.
- Polish the case-study pages: gallery, next and previous project, and the call to action.
- Improve the journal reading experience: typography, reading time and sharing.
- Accessibility: focus states, keyboard paths and a reduced-motion check of every animation. Also decide on the dim scroll-reveal text, which is still below contrast guidelines at 30% by design.
- Run make-interfaces-feel-better and motion-patterns over each section, `/mind` included.

**Done when** there are no layout bugs at those widths and keyboard and screen-reader paths work.

## Phase 11: Launch

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
- Journal images come from Supabase Storage through the dashboard (Phase 6), so the Notion image-expiry problem goes away.
- Final checks across devices and browsers: iPhone Safari, Android Chrome, desktop Safari, Firefox and Chrome.

**Done when** the site is live, sharing previews look right, and Ali can publish a journal post himself.

---

## What we need from you

- **Phase 2 (now):** Ali's approval of the narrative, and his real "currently researching" topics and recent changes for the living philosophy.
- **Phase 5:** the content (copy, project details, images and journal posts).
- **Phase 7:** access to a Supabase project (Ali's or a new one). The login is decided: a magic link.
- **Phase 11:** the domain, an analytics preference, and approval of the share-image design.
