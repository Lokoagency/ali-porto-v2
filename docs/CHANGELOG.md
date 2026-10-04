# Changelog

Newest first. **Add an entry with every change**, using the template in `DEVELOPMENT.md`. Entries before 4 Oct 2026 were reconstructed afterwards, so their dates are approximate.

---

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
