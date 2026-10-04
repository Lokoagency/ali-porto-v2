# Changelog

Newest first. **Add an entry with every change**, using the template in `DEVELOPMENT.md`. Entries before 4 Oct 2026 were reconstructed afterwards, so their dates are approximate.

---

## 2026-10-05: Round 6: Ali speaks first, the work moves up, 01 trimmed

**What:**
- **The hero is Ali speaking:** bold and punchy. The headline is now "I build what you *meant.*", which comes from Ali's line about "understanding what someone actually meant, not just what they managed to put into words". The type is bigger. The line under it is first person: "I'm Ali Farghaly, a developer and product manager. Whatever your product looks like right now, I can probably step into it, from the database to the docs."
- **The work is 02:** the order is now hero → 01 Why (the quote and the living philosophy) → **02 Proof** (the work, then the numbers) → 03 How → 04 Knowledge (the path, the stack) → 05 Let's talk. The nav, footer and scroll rail follow: Philosophy, Work, Protocol, Journal.
- **01 is trimmed:** the four principle cards (Read the intention, Four versions one DNA, The calculator rule, Document with purpose) are removed from the home page, along with their glyph animations. The `principles` data stays for `/mind`.
- **More of Ali's own sayings:**
  - The work heading is "What I built, and every hat I wore building it." (from "I was all of those").
  - Working together is "I give honest timelines, and I deliver on them."
  - Its third card is now "Milestones".

**Why:** the user's round 6 asked to:
- reflect what we know about Ali;
- make the work the second thing after the hero and the quote;
- remove the principle cards from 01;
- use Ali's own sayings;
- make the hero sound like Ali, bold, punchy, a hook.

**Verified:**
- `tsc`, `lint` and `build` are clean.
- In the browser at 1440 and 375 px:
  - The headline sits on two lines, and the hero buttons end at 703 px (desktop) and 542 px (phone).
  - The section order and the labels are right.
  - 01 has no cards.
  - There's no sideways scroll.

## 2026-10-05: Round 5: Ali in his own words (Content Bank v2)

**What:** the site's copy is rewritten from Ali's Content Bank v2. The design, animations and structure are unchanged.
- **Hero line:** "Ali Farghaly, developer and product manager. Whatever your product looks like right now, I can probably step into it: from the database to the docs." "Fast" is dropped; it clashed with how Ali works.
- **01 Why:**
  - **The quote** is now Ali's: "The input matters as much as the output…"
  - **The living philosophy** now holds his real AI discipline: garbage in, garbage out; anti-hype, pro-utilization; a tool-agnostic process he keeps improving.
    - The research topics come from his work: context, the seven-step feature lifecycle, Claude Code and Lovable, AI sycophancy, platform-agnostic process.
    - The changes: a build diary per project, AI-drafted docs he reviews line by line, and "measure twice, cut once".
  - **The four principles** are now Read the intention, Four versions one DNA (his framework, said with "product"), The calculator rule, and Document with purpose.
- **02 How:**
  - **The Sorting Room** has its animation untouched. The captions follow his method (intent vs spec, database first).
  - **One path:** the lede is his "building cleanly" and "I was all of those" lines, and the quote is "The mechanism changes. The discipline doesn't." Build it / Run it describe his real capabilities (Stripe, OpenAI, role-based dashboards) and his rule about wearing the PM hat only when it's missing.
  - **The protocol:** the lede is "The entry point doesn't matter; the process adapts." The four branch lines are now **Ali's four entry points**: Nothing built yet → Discovery, Specs ready → Build, A previous developer left a mess → QA, 80% done and stuck → Launch. The branch geometry moved accordingly.
  - **Working together** reflects his real hours and habits: 9 AM to 6 PM GST, Monday to Friday; suggestions, not demands; honest milestone timelines; work you can maintain without him in the room.
- **03 Knowledge:**
  - **Numbers:** 650+ companies on mena.tv at launch, 120+ pages of docs, 2 app stores, 4 years building in Bubble.io.
  - **The path:** rewritten from his real timeline (translator, then ChannelSculptor and the solo mena.tv rebuild, then developer and PM). Nothing from the private part of the bank.
  - **The stack:** the note says the method is tool-agnostic. The "knows → picks up" pairs now start with his real next tools (Bubble.io → Lovable, Claude.ai → Claude Code).
- **04 Let's talk:** the intro is Ali's own closing line about a quick intro call, now in `site.ts`. The old hard-coded line spoke to hiring managers.
- **Clean-ups:** em dashes are gone from the copy, and "ideation" in a case study now reads "first scope".

**Why:** the user shared Ali's Content Bank v2 "for you to learn who is Ali, and to reflect that upon the website", and asked to keep the design and animations.

Their answers:
- Keep the no-"idea" rule.
- No "better X than most Y".
- AI in the philosophy only, with no testimonials.
- Leave the music out.

**Verified:**
- `tsc`, `lint` and `build` are clean.
- In the browser at 1440 and 375 px:
  - The visible text contains no "idea" and no "better than most".
  - The new principles and entry points render, and the map labels stay inside the map.
  - There's no sideways scroll.

**Open:**
- The HYMA Hi-Fi mockups (a claude.ai/design link) need a login, so I couldn't read them.
- The Editorial Rules document mentioned in the bank wasn't shared.
- A TextWing case study needs screenshots.

## 2026-10-04: Round 4: a simple hero, the site in four chapters, no "idea"

**What:**
- **The hero is simplified** to one job: who Ali is, and why you're here.
  - Headline: "Need a product built, *and run properly?*"
  - One line: "Ali Farghaly, product manager and no-code developer. I build products fast, bring messy ones back under control, and run the whole process, roadmap to docs, as one person."
  - Buttons: "Tell me where you are" (→ the protocol form) and "See the work".
  - Removed: the scattered word, the sorting tagline, the rotating role, the six notes and "Mess it up".
- **The site in four chapters:** hero → **01 Why** (the philosophy) → **02 How** (the method, which is the Sorting Room, unchanged; one person one path; the protocol; working together) → **03 Knowledge** (numbers, proof, the path, the stack) → **04 Let's talk**. Labels read "Chapter · Part", and the scroll rail follows them.
- **The philosophy** now opens with "Problem first, product second. I think like a product person, design like a UX thinker, and build with technical depth."
- **The stack moved out of "One path"** into its own section (`home/Stack.tsx`, `#stack`), under Knowledge, with the heading "Today's toolbox. Never the whole of it." The one-path card now alternates its highlight between Build it and Run it on its own.
- **No "idea" anywhere** in the site copy. The client's thing is their product:
  - The Sorting Room's first stage is "Your product".
  - The roadmap join is now "Nothing built yet".
  - The form reads "My product is at…".
  - The contact heading is "Tell me where your product is. Let's find the problem first."
  - The work card reads "Your product could be next."
  - The footer reads "No problem left unsorted".
  - The translator card flips story / قصة.
  - Also changed: the intro, the Mind teaser and the Systems body.
  - `/mind` (on hold) still has its "scattered ideas" until Phase 8.

**Why:** the user's round 4 feedback:
- The hero was too much: it mixed the philosophy and the methodology, and what Ali *is* was hidden underneath.
- It should show visitors why they're on the site. Then why Ali works this way, then how, then the knowledge, then the call to action.
- "We don't want the term 'idea' at all."

Their answers:
- **Visitors:** corporate teams and founders, not hiring managers.
- **Why they're here:** all four reasons:
  - a product built fast;
  - a product that's out of control;
  - someone to run the process;
  - one person for both.
- **Hook:** a question to the visitor.
- **Word:** "product".

**Verified:**
- `tsc`, `lint` and `build` are clean.
- In the browser at 1440 and 375 px:
  - The hero fits one screen on desktop (the buttons end at 726 of 900 px).
  - The section order and the labels are right.
  - The visible page text contains no "idea".
  - There's no sideways scroll.

## 2026-10-04: Round 3: philosophy → methodology → protocol, corporate keywords, "tell Ali where you are", the admin-dashboard phase

**What:**
- **The story's middle is re-chaptered** as philosophy → methodology → protocol. The order is now:
  1. 01 The problem: the Sorting Room, **unchanged** (the mess, the animation and the sorting are as they were).
  2. 02 **The philosophy** (`Principles`, moved up).
  3. 03 **The methodology** (`Paths`, one person, one path).
  4. 04 **The protocol** (`Roadmap`).
  5. 05 Proof, 06 The person, 07 Working together, 08 Let's talk.
- **A living philosophy** (new, inside `Principles`):
  - An "Edition 2026.10 · Updated Oct 2026" badge, and a line saying it isn't a fixed rulebook.
  - A "Currently researching" topic that rotates, with a reading bar that fills for each one.
  - A "Recent changes" list (Added / Changed / Kept).
  - The data is `philosophy` in `site.ts`. **The topics and changes are placeholders for Ali.**
- **The methodology** lede now bridges from the philosophy and names the services in words corporates search for (product discovery, no-code development, QA, technical documentation).
- **The protocol:**
  - The heading is "A protocol you can follow. A line you can track."
  - The lede says eight stations, clear deliverables, always know where you are.
  - Each station shows **keyword tags** (for example Product discovery, Requirements gathering, MVP scope, No-code development, QA testing, UAT, Technical documentation, SOPs).
- **"Tell Ali where you are"** (in `Roadmap`, `#tell-ali`):
  - The heading follows the picked station ("My project is at *Design*.").
  - Fields: name, company, and one line about the project.
  - Send on WhatsApp or Send by email opens a prefilled message: "Hi Ali, I'm … from …. My project is at Design (station 3 of 8 on your protocol)…". It's built by `stationMessage()` in `site.ts`, and nothing is stored.
  - Typing in the form stops the train.
- **The floating pill** steps aside while the form is on screen, and once a station is picked it links to the form.
- **Nav and footer:** Philosophy, Protocol, Work, Journal. The scroll rail follows the new chapter names.
- **Search metadata:** a new default title ("No-code developer & product manager"), a keyword-rich description and a `keywords` list.
- **The plan:**
  - New **Phase 6: an admin dashboard for Ali** on Supabase. It covers:
    - the journal;
    - adding, editing and removing work inside the real card templates, with design-safe limits;
    - drag-and-drop featured work on a board that shows the real grid;
    - per-client tracking on the metro map through a private link.
  - The order is now Content (5) → Admin (6) → Optimization (7) → Deep dive (8) → Polish (9) → Launch (10).

**Why:** the user's round 3:
- Add a narrative while keeping the identity, and keep the keywords corporates search for.
- Ali is a philosophy that updates with trends and research. It turns into a methodology that gives the client a protocol to follow and track.
- Add a roadmap CTA where the client says where they are and sends it to Ali.
- Plan an admin dashboard with design templates and drag-and-drop featured work.

Their answers:
- Re-chapter, but keep the mess and the sorting animation exactly as they are.
- Weave the keywords in and add small tags.
- Send by WhatsApp or email, prefilled.
- The dashboard comes right after Content, with client tracking.

**Verified:**
- `tsc`, `lint` and `build` are clean.
- In the browser at 1280 and 375 px:
  - The section order and the labels are right.
  - The nav reads Philosophy / Protocol / Work / Journal.
  - The research topic shows.
  - The station tags render.
  - The form builds the right WhatsApp text and mailto link.
  - There's no sideways scroll.

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
