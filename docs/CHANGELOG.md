# Changelog

Newest first. **Add an entry with every change**, using the template in `DEVELOPMENT.md`. Entries before 4 Oct 2026 were reconstructed afterwards, so their dates are approximate.

---

## 2026-10-04: Review round 2: one path, an open-ended stack, light by default, the hero line, a floating call to action

**What:**
- **"One person, one path"** (`home/Paths.tsx`): the two "paths" cards are now **one card**. The build ("Build it · The product") and the system ("Run it · The system around it") are two stops on one line, joined by a small portrait of Ali with a dot riding between them (vertical on phones). The heading is now "One person, *one path:* build it right, then make it run." A lede below says there's no handover between a builder and a product manager. One shared quote closes the card. The stack tabs read Everything / Build it / Run it.
- **The stack is open-ended:** the counter reads "16/16+". The last chip is dashed and cycles through tools Ali knows → tools that carry over (Notion → Linear, Bubble.io → FlutterFlow, Zapier → n8n and so on). A note under the chips says this is today's toolbox, not the limit.
- **Light mode is the default.** The theme script no longer follows the system setting; dark only applies if the visitor picked it with the toggle.
- **The hero headline** now reads "Your idea is brilliant. Let's start with the *problem.*" (it was "But first, the problem.").
- **A floating call to action** (`home/FloatingCta.tsx`): a glass pill appears at the bottom once the visitor reaches the roadmap and steps aside at the contact section. It reads "Wherever you are on the line · Let's talk". When the visitor picks a station on the roadmap, it changes to "Start at *Design*" (the roadmap fires a `roadmap:pick` event).
- **The phase order changed:** Content → Optimization → Deep dive (`/mind`) → Polish → Launch.
- **Data:** `paths` gained `sub` and lost the per-card `quote`. Added `onePath` (lede, quote), `stack` (note, learning pairs) and `story.cta`.

**Why:** the user's review:
- "It's not two paths, it's one person one path."
- The tools shown aren't the only ones Ali uses; he learns new ones every day.
- Light mode should be the default.
- The hero was close but not there; they picked the headline wording as the problem.
- They wanted a call to action mid-page, a button rather than a page, from the roadmap on.

**Verified:**
- `tsc`, `lint` and `build` are clean.
- In the browser:
  - The theme starts light with nothing stored.
  - The CTA shows after the roadmap, names the picked station, and hides at contact.
  - At 375 px the pill is 327 px wide, and there's no sideways scroll.
  - At desktop width the card's three columns line up (527 / 56 / 527 px).

**Follow-ups:** all the new copy is ours and needs Ali's approval. The pane still doesn't paint reliably, so the user should review it in a normal browser.

## 2026-10-04: Phases 2–4: the narrative, the roadmap, and the journal off the home page

**What:**
- **Narrative (Phase 2):** the home page now tells one story, "problem first, then the solution".
  - The hero reads "Your idea is brilliant. But first, the *problem.*" ("problem." is the scattered word). The tagline is "I find what is really broken, then build what makes it *make sense.*"
  - The notes are now: The problem, Who has it, What it costs, The fix, The build, The docs.
  - The Sorting Room is chapter "01 The problem", and its stage captions are rewritten problem first.
  - Sections are renamed and renumbered: 01 The problem, 02 The solution, 03 How I build, 04 The roadmap, 05 Proof, 06 The person, 07 Working together, 08 Let's talk.
  - The contact heading is "Got an idea? Let's find the problem first."
  - All of this copy moved into `story` in `src/content/site.ts`.
- **Roadmap (Phase 3):** new `src/components/home/Roadmap.tsx`, an illustrated **metro map**.
  - Eight stations: Discovery → Definition → Design → Build → QA → Launch → Handover → Grow.
  - Four branch lines show where a project can join, and so where Ali can jump on: Just an idea → Discovery, Designs ready → Build, Built but messy → QA, Live but undocumented → Handover.
  - A train rides to "you are here" on its own until the visitor picks a station or a "Where are you now?" chip.
  - A side panel shows what happens there, what you get, and the next stop.
  - Phones get a vertical version of the line.
  - Data lives in `roadmap` in `site.ts`.
- **Journal off the home page (Phase 4):** removed `JournalPreview` (file deleted). The journal is reached from the nav only. The roadmap takes its place in the story, and the home page no longer fetches posts, so it's fully static.
- **Nav, footer and scroll rail:** Process, **Roadmap**, Work, Journal. The rail labels follow the chapter names.

**Why:** the user's Phases 2–4. Their answers: a gentle tone, an illustrated metro map on the site, placed instead of the journal, and the page re-ordered so it tells a coherent story.

**Verified:**
- `tsc`, `lint` and `build` are clean.
- In the browser:
  - The hero renders, and the roadmap auto-advances (01 → 02).
  - On phones, the vertical line shows with no sideways scroll at 375 px.
  - The section order is right.
- Fixed one bug: the stations scaled in around the wrong point, so they now fade in.

**Follow-ups:**
- The roadmap and story copy are written for the site and need Ali's approval.
- The preview pane often fails to paint (blank screenshots), so the user should review it in a normal browser.
- Not pushed to GitHub; the baseline stays until the client approves.

## 2026-10-04: GitHub backup and the new phase order

**What:**
- Initialised git and pushed the baseline to https://github.com/Lokoagency/ali-porto (`main`, commit `6129be9`). That's 79 files; `.env*`, `node_modules` and `.next` were excluded by `.gitignore`. The commit identity is "Lokoagency".
- `PLAN.md` re-ordered to the user's phases:
  1. Backup
  2. Narrative ("problem first; Ali kills the idea")
  3. Client roadmap (metro or world map)
  4. Journal only in the nav
  5. Content
  6. Performance
  7. Polish
  8. Launch
  9. `/mind`

**Why:** the user's instructions. The GitHub copy is a backup until the client approves.

**Verified:** the push succeeded and `main` tracks `origin/main`.

**Follow-ups:** don't push over the baseline without the user's say-so.

## 2026-10-04: Handoff documentation

**What:**
- **New docs:** `CLAUDE.md` (auto-loaded entry point: status, rules, commands, quirks) and `docs/` (`HANDOFF`, `ARCHITECTURE`, `DESIGN`, `CONTENT`, `DEVELOPMENT`, `MIND`, `CHANGELOG`).
- **Updated:** `README.md` refreshed for humans; `PLAN.md` now links to the docs.
- **Pointer file:** `VP/CLAUDE.md` points sessions that start in the workspace folder to this project.
- **Cleanup:** deleted the stray `latin.txt` left over from the font download.

**Why:** the user asked for documentation that lets any new Claude model pick up the project, kept up to date with every change.

**Verified:** every fact was checked against the code, not memory.

**Follow-ups:** keep the docs current after every change (see the `CLAUDE.md` rules).

## 2026-10-04: Phase 0 review and optimisation (website)

**What:**
- **Hero:**
  - The portrait loads early: `fetchPriority="high"` and `loading="eager"` replace the deprecated `priority`, and `sizes` is tighter.
  - The entrance animation moved to pure CSS (`.anim-focus`, `.anim-fade-up`, `.anim-blur-in`, `.anim-portrait`), so it paints without JavaScript.
  - The notes move with transforms, on full-size layers, instead of animating `left`/`top`.
  - The hero's loops (role, "mess.", notes) pause off-screen.
  - On narrow screens, the tidied notes stay inside the portrait.
- **Fonts:** Fraunces is self-hosted with optical size pinned at 72 (`src/fonts/`, OFL). It looks the same and drops from 264 KB to 148 KB.
- **Images:** served as AVIF first. The optimiser allows **only** the Supabase bucket; `*.amazonaws.com` and Unsplash were removed, because they made it an open image proxy.
- **Mobile layout:** removed sideways scroll on phones (the hero glow was clipped, the hero gets `overflow-x-clip`, "The path" grid gets `grid-cols-1`), plus `body { overflow-x: clip }` as a safety net.
- **Sorting Room:** the stage now starts below the measured heading block, so the step labels no longer overlap it on short or mid-width screens.
- **Accessibility:**
  - Screen-reader text replaces `aria-label` on spans (`ScrambleText`).
  - The nav logo and step buttons have accessible names that include their visible text.
  - The scroll-reveal words' minimum opacity went from 0.14 to 0.3.
- **Timers:** the Paths cursor moves with a transform, and the Journey translation card only ticks while visible.

**Why:** the user asked to "review and optimize the website".

**Verified:** Lighthouse on a production build, home page:

| | Before | After |
|---|---|---|
| Mobile performance | 79 | 86 |
| Accessibility | 93 | 97 |
| Mobile LCP (real throttling) | 3.1 s | 3.0 s |
| Total blocking time (real throttling) | 560 ms | 380 ms |
| Speed Index (simulated) | 3.7 s | 1.8 s |
| CLS | 0.027 | 0 |
| Fonts | 316 KB | 196 KB |
| Hero image | 37 KB | 21 KB |

Desktop stays at 99. `tsc`, `lint` and `build` are clean, and there's no sideways scroll at 375, 414 or 768 px.

**Follow-ups:** Phase 2 work (LazyMotion, server components, browserslist); the dim-text contrast decision (Phase 3); the launch items (Phase 4).

## 2026-10-04: "make sense." and "Clear out." animation redone

**What:**
- **New `src/components/SortText.tsx`:** the phrase's own letters start jumbled (muted, tilted, out of order), then sort into place, gaining colour, and an underline draws in. It loops gently, measures kerned glyph positions so nothing shifts, pauses off-screen, and respects reduced motion. Used in the hero and the IdeaSorter heading.
- **`ScrambleText`:** noise is now letters and digits only, and short phrases never wrap (a `wrap` prop allows card titles to wrap).

**Why:** the user said the scramble was "very bad". Noise characters had different widths, so the line jittered and wrapped.

**Verified:** checked in the browser in both the jumbled and sorted states.

## 2026-10-04: `/mind` paused; stylized Ali

**What:**
- **Stylized Ali:** a hand-built, toy-like Ali on named bones (`mind/Ali.tsx`) replaces the AI model; `public/models/ali.glb` was deleted. Beard and shoulder proportions were tweaked afterwards.
- **Quest prompts removed:** the half-built "scattered ideas" pickup spots are gone; the data (`IDEAS`, `WINDOWS`, `questStore`) is kept as groundwork.

**Why:**
- The user asked for a "more stylized" Ali and picked the free, hand-built option.
- They then paused `/mind` until the website is finished, phase by phase.

**Verified:** the bedroom mirror shows Ali correctly, all 20 joints are found, and `tsc`, `lint` and `build` are clean.

## 2026-10-04: game-engine skill vetted and installed

**What:** `npx skillfish add rodolfolermacontreras/microsoft-ai-learning game-engine --global --yes`. It installed to `~/.claude/skills/game-engine`, and skillfish also added a copy to `~/.codex`.

**Why:** the user asked whether it was safe, and to use it if relevant.

**Verified:**
- Every file is byte-for-byte identical to the official `github/awesome-copilot` repo.
- It's Markdown only, with no scripts or hidden instructions.
- The installed files match the reviewed ones.

**Follow-ups:** use it in Phase 5 (`/mind`).

## 2026-10-04: `/mind` performance, plants, desk mirror, wave

**What:**
- **Performance:**
  - Removed 4 decorative lights.
  - Light range cut from 10 m to 6.5 m.
  - No `transmission` on the candle wax.
  - Standard materials on walls, floors, wood and rugs.
  - Mirrors at 512 px and only within 5 m, with a glass stand-in beyond.
  - Resolution starts at 1.25; MSAA ×2; N8AO on "performance".
  - Ambient light raised to compensate.
  - Movement keeps real speed down to about 12 fps, with collision sub-steps.
- **Plants:** rebuilt as instanced curved leaves on stalks (monstera with split leaves). The soil and pot no longer sit at the same height, which caused the flicker.
- **Desk mirror:** the desk is now a seat (`desk`), and the laptop opens while seated. A cheval mirror in the study shows Ali sitting at the desk.
- **The wave:** Ali waves the first time you look into each mirror, and whenever you inspect one.
- **Earlier the same day:** sound made opt-in and much softer.
- **AI Ali:** an AI-generated, rigged realistic Ali (Higgsfield → Meshy) was briefly used, then replaced (see the entry above).

**Why:**
- "fps is low and very stuttery".
- "plants have texture glitch".
- The user asked for a mirror at a seat, and for Ali to wave.
- "the sounds are annoying".

**Verified:** scene render time before → after:

| Room | Before | After |
|---|---|---|
| Hall | 17.3 ms | 4.0 ms |
| Study | 11.9 ms | 2.3 ms |
| Living room | 6.5 ms | 2.8 ms |
| Kitchen | 5.7 ms | 2.3 ms |

The wave was confirmed in the hall and study mirrors.

## 2026-10-03 → 04: `/mind` iterations

- **Dollhouse → reception:** the first idea, a cute dollhouse, was rejected. A vintage hotel reception with WASD and drag-to-look came next; it was rejected too, because dragging caused bugs.
- **Retro home (third person):** a retro home with plaques, books, the desk and laptop, and a bedroom. It was criticised for stutter, flicker, see-through sleeves, sitting inside furniture, and a "very very bad" character.
- **First person with mirrors:**
  - Ali is seen only in mirrors.
  - Plaques zoom in when you interact.
  - Cozier rooms, realistic-ish lighting with baked shadows, correct seat heights.
  - The pause menu with "Back to the site".

## 2026-10-03: The website

- **Initial build:** Next.js 16 site built from Ali's Bubble content.
  - Teal and minimal.
  - Notion or Markdown journal.
  - Case studies and the Sorting Room particle animation.
  - Light and dark themes.
- **Feedback round 1:** bug fixes; the nav no longer hides and reappears on scroll.
- **Feedback round 2:** clearer animations and more micro-animations; everything autoplays instead of needing a hover; less scrolling; scramble text added.
