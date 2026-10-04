# Handoff: start here

If you've just been handed this project, read this first. It covers what the project is, where it stands, how the user likes to work, and the decisions that shaped it. Keep it current: see "Keeping these docs current" at the end.

---

## The project in one minute

- **Client:** Ali Farghaly, a no-code developer (Bubble.io) and product manager. He used to be an Arabic↔English translator, and his career now centres on the mena.tv platform.
- **Agency:** LKO.AGNCY. This is who you talk to. They relay Ali's needs and will supply his content.
- **What it is:** Ali's personal portfolio, "Have you met Ali?". It replaces his old Bubble site (https://have-you-met-ali.bubbleapps.io/version-test), which was the source of the original copy and images.
- **Core message:** "Your idea is brilliant. It's also a *mess.* I'm the one who makes it *make sense.*" Position Ali as one of a kind: the person who turns a messy idea into a clear plan, a build, and the docs.
- **Brief:**
  - Teal-led, minimal, premium and cozy. Ali likes teal, yellow and green; teal leads and the others are only accents.
  - Very organized.
  - Outstanding animations and micro-animations that help people understand the content.
- **Ali's no-code policy:** he must be able to post without code. That's why the journal reads from Notion (or Markdown as a fallback).
- **Stack:**
  - Next.js 16 (App Router), React 19 and Tailwind v4.
  - `motion` (Framer Motion) for animation and Lenis for smooth scrolling.
  - three.js with react-three-fiber for `/mind`.
  - No database. Copy lives in TypeScript files and images in Ali's Supabase bucket.

## Where everything stands (4 Oct 2026)

| Area | Status | Notes |
|---|---|---|
| Home page (`/`) | Built and reviewed | 12 sections. See `ARCHITECTURE.md` |
| Case studies (`/work/[slug]`) | Built | 7 projects, statically generated |
| Journal (`/journal`, `/journal/[slug]`) | Built | Notion isn't connected yet; the 3 Markdown posts are placeholders |
| Ali's mind (`/mind`) | Paused until Phase 5 | Working 3D house. See `MIND.md` |
| Content | Waiting on the user | They will send Ali's real content: Phase 1 |
| SEO and social | Not started | No share images, sitemap, robots file or 404 page: Phase 4 |
| Deployment | Not started | Vercel is planned: Phase 4 |
| Version control | None | The folder isn't a git repo. Recommend `git init` |

Quality after Phase 0 (Lighthouse, production build, home page):

| | Score or metric |
|---|---|
| Mobile (simulated) | performance 86, accessibility 97, best practices 100, SEO 100 |
| Mobile (real throttling) | LCP 3.0 s, total blocking time 380 ms |
| Desktop | performance 99 |

## The phases (full detail in `PLAN.md`)

0. **Review and quick wins.** Done 4 Oct 2026.
1. **Content.** Bring in the user's content and replace placeholders. Waiting on the user.
2. **Performance and code health.** Lighter animation setup (LazyMotion), more server components, aim for 90+ on mobile.
3. **Polish and UX.** Every width, both themes, a 404 page, accessibility.
4. **Launch.** SEO and share images, analytics, Vercel, domain, Notion images.
5. **Ali's mind (`/mind`).** Lighting, character, the scattered-ideas hunt.

The user asked to go phase by phase, with `/mind` last. Don't drift into later phases unless asked.

## How this user works, and what they want

**How they communicate:**
- Short, casual messages, often with typos or numbered lists.
- They send follow-ups while you're mid-task. Fold them in as you go, and don't drop the earlier request.

**What they want:**
- Act, then give a short summary of what changed and what was verified.
- Real numbers, not adjectives: before/after tables went down well.

**Taste:**
- **Animation:**
  - Autoplay, never hover-only. They explicitly complained about hover-to-play.
  - Clear and meaningful: each one should tell "messy → clear".
  - Lots of micro-interactions.
- **Avoid:**
  - "Hacker" effects. They called the random-symbol text scramble "very bad"; it's now `SortText`, where letters sort into place.
  - A nav that hides on scroll; they reported it as a bug.
  - Long scrolling.
- **Look:** minimal and premium, but cozy and with character.
- **3D:** they want realistic lighting and an environment worth exploring. They criticise stutter, low fps, see-through or ugly characters, and anything that "lacks character" or is buggy.

**Process:**
- Wants a plan and phases.
- Wants docs updated with every change: "update it whenever we make something".
- Vets third-party skills: check a skill's files before installing it (`npx skillfish add …`).
- Spending Higgsfield credits (AI image and 3D generation) needs their OK every time. They chose the free route the second time.

## Decision log (why things are the way they are)

| When | Decision | Why |
|---|---|---|
| 3 Oct | Teal tokens; sun/leaf only as accents; Fraunces + Geist | Brief: teal, minimal, premium |
| 3 Oct | Journal from Notion, falling back to Markdown | Ali's no-code policy |
| 3 Oct | The nav stays fixed and never hides | User reported hide-on-scroll as a bug |
| 3 Oct | Animations autoplay and loop while visible | User disliked hover-to-play |
| 3–4 Oct | `/mind` went through dollhouse → hotel reception → retro home in third person → **first person, with Ali seen only in mirrors** | The earlier versions were rejected or criticised: drag-to-look bugs, a bad character model, stutter |
| 4 Oct | `/mind` sound is opt-in and soft | "the sounds are annoying" |
| 4 Oct | An AI-generated realistic Ali (Meshy, 46 credits) was tried, then **dropped for a hand-built stylized Ali** | User asked for "a more stylized one" and chose the free route |
| 4 Oct | `/mind` performance pass: few short-range lights, no transmission materials, mirrors 512 px and only within 5 m | "fps is low and very stuttery" |
| 4 Oct | "make sense." and "Clear out." use `SortText` | Scramble was "very bad" |
| 4 Oct | The hero's entrance is pure CSS | It's visible on first paint, so mobile LCP no longer waits for JavaScript |
| 4 Oct | Fraunces self-hosted with optical size pinned at 72 | Looks the same, 148 KB instead of 264 KB. Keeps the SOFT and WONK axes the design uses |
| 4 Oct | The image optimiser allows only Ali's Supabase bucket | `*.amazonaws.com` made it an open image proxy |
| 4 Oct | `/mind` paused, website first, phase by phase | User's call |

## Known issues and open questions

- **No git.** Nothing is version-controlled. Backups of older `/mind` files sit in `%TEMP%\mind-backup\`, a temporary folder that can be wiped.
- **Leftover starter files:** the favicon is still the default Next.js one, and `public/` holds unused starter SVGs (`file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`).
- **Stale teaser copy:** the home page Mind teaser still says "Soon" and "on its way", although `/mind` exists but is paused. Decide in Phase 1 or Phase 5.
- **Placeholder content:**
  - The 3 journal posts in `content/journal/` were drafted from Ali's old copy.
  - The `stats` numbers (30+, 120+, 2, 4 yrs) need Ali's confirmation.
  - `competencies` and the tools' `featured` flag in `site.ts` aren't used anywhere.
- **Journal limits:**
  - Notion image links expire after an hour, so they need mirroring before launch.
  - Only the first 100 blocks of a Notion page are read, with no nested blocks.
  - Markdown and Notion HTML are injected unsanitised. That's fine while only Ali writes.
- **Dim words:** the scroll-revealed words in "How I build" start at 30% opacity, which is below contrast guidelines by design. Lighthouse flags it. Decide in Phase 3.
- **Missing pages and metadata:** no `not-found.tsx`, `sitemap.ts`, `robots.ts`, `metadataBase` or Open Graph images (Phase 4).
- **`/mind` specifics** are in `MIND.md`.

## Things that live outside this folder

| What | Where |
|---|---|
| Images | Ali's Supabase storage bucket: `https://bwnfyhcmekdzumndknhp.supabase.co/storage/v1/object/public/images/…`, through the `asset()` helper in `src/content/site.ts` |
| Old site | Ali's Bubble site, the original source of the content |
| AI generations | The user's Higgsfield account. Credits are spent there |
| Preview launchers | `.claude/launch.json` in both `VP/` and `VP/ali-portfolio/`: `ali-portfolio` (dev, :3000) and `ali-portfolio-prod` (`next start`, :3100) |
| Skills | Installed in `~/.claude/skills/`: frontend-patterns, liquid-glass-design, make-interfaces-feel-better, motion-advanced (an empty stub), motion-patterns, game-engine (vetted on 4 Oct, for `/mind`) |

## Keeping these docs current (the user asked for this)

After every change, in the same turn:

1. **Changelog:** add an entry at the top of `docs/CHANGELOG.md` with the date, what changed, why, and how it was verified.
2. **Topic doc:** update the doc that covers the area. Code structure goes in `ARCHITECTURE.md`, look or motion in `DESIGN.md`, copy or data in `CONTENT.md`, tooling in `DEVELOPMENT.md`, and 3D in `MIND.md`.
3. **Plan:** update `PLAN.md` (tick off tasks, move the phase).
4. **This file:** update it if the status, the user's preferences or a decision changed.
5. **Status:** fix the Status list in `CLAUDE.md` if the phase moved.
