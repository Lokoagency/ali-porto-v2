# Design: look, motion and voice

## The idea

**The story (since 4 Oct; reordered in round 6): hero → why → proof → how → knowledge → let's talk.**
- **The hero** is Ali speaking: bold, punchy and first person, "I build what you *meant.*" It stays calm: one headline, one line, two buttons and the portrait.
- **The work comes second**, right after the philosophy's quote, so visitors see proof early.
- **Never use the word "idea" in site copy.** The client's thing is their **product**. Ali solves the problem first, then builds the product.
- Ali is **one person on one path**: he builds the product and the system that runs it, so there's no handover. Don't present his work as two separate tracks. The page runs in chapters: **01 Why** (Ali's quote) → **02 Proof** (the work) → **03 How** (the method, one path, the protocol, working together) → **04 Knowledge** (the stack) → **05 Let's talk**. Ali's path is on its own page, `/about`. Ali is a living philosophy (researched, updated with trends). It becomes a methodology, which gives the client a protocol to follow and track. The messy → clear identity stays: the Sorting Room, unchanged, opens "How". Keep new sections inside that arc.

**Keywords:** keep Ali's warm voice, but use the words corporates search for (product discovery, requirements, MVP, no-code development, agile delivery, QA, technical documentation, process automation) where they fit naturally, and as small mono tags on the protocol stations. No keyword stuffing.

**Messy in → clear out.** Ali takes a client's tangled idea and organizes it into a roadmap, a build and the docs. The design shows that over and over: scattered things settle into order. When you add something, ask: *does this show disorder becoming order, or support someone who wants that?* If it does neither, it probably doesn't belong.

The mood is minimal and premium, but cozy and human, never cold: warm paper, deep teal ink, soft rounded type, a little play.

## Colour

Teal leads. **Sun (yellow) and leaf (green) are accents only**, never large areas. All colours are CSS tokens in `src/app/globals.css`; use the Tailwind names, never raw hex values, inside components.

| Token (Tailwind) | Light | Dark | Use |
|---|---|---|---|
| `paper` / `paper-2` / `paper-3` | #f6f3ec / #efeae0 / #e6e0d3 | #0b1a1b / #0f2223 / #15302f | Page and section backgrounds |
| `card` | #fbf9f5 | #112627 | Cards |
| `ink` / `ink-soft` / `muted` | #0f2e2f / #3d5859 / #7b8c8b | #e7efec / #a9bdba / #6f8a87 | Text levels |
| `line` / `line-strong` | ink at 11% / 20% | white at 9% / 18% | Hairlines, borders |
| `teal` / `teal-bright` / `teal-soft` / `teal-tint` | #12706b / #23988f / #9cc9c2 / #dcebe6 | #4cc3b6 / #6fd8cb / #2b6f69 / #143534 | Brand, emphasis, active states |
| `sun` | #e5b54a | #f0c45e | Small accents: noise, warnings, warmth |
| `leaf` | #6e9f68 | #8cc184 | Small accents |

- `.section-deep` is an always-dark teal band that looks the same in both themes. "The path" uses it.
- **Light is the default** (the user's call); dark is opt-in through the toggle. The theme is set on `<html data-theme>`. Switching it cross-fades colours (`.theme-fade`).
- `/mind` has its own warm palette, with **gold `#c9a661`** for its UI, because it's a cozy night-time house rather than the site.

## Type

| Role | Face | Notes |
|---|---|---|
| Display, headings | **Fraunces** (`.font-display`) | Uses `"SOFT" 100`, which gives the rounded, cozy letter endings. Tight letter-spacing (−0.02em). Headings use `text-wrap: balance` |
| Emphasis | **Fraunces italic** (`.font-display-italic`, in teal) | Uses `"WONK" 1`, the quirky italic letterforms. This is how key words are highlighted, such as "*mess.*", "*make sense.*" and "*Clear out.*". In `SplitHeading`, pass the word positions in the `italic` prop |
| Body | **Geist** | 15–17 px. Paragraphs use `text-wrap: pretty` |
| Labels | **Geist Mono** (`.eyebrow`) | Uppercase, letter-spaced, teal, with numbers like "01 — The Sorting Room" |

- Fraunces is self-hosted with **optical size pinned at 72** (see `CHANGELOG.md`, 4 Oct). Don't swap back to Google's full Fraunces: it's 264 KB instead of 148 KB, and at our sizes it looks the same.
- Every section has a numbered eyebrow (01–08) and a headline with one or two teal italic words.

## Layout and surfaces

| Element | Rule |
|---|---|
| Content width | `max-w-[1200px]`, with side padding `px-5 sm:px-8` |
| Section spacing | `py-20 md:py-28` |
| Cards | `bg-card`, `border-line`, large radius (24–32 px) |
| Nested corners | Concentric: outer radius = inner radius + padding (for example, 28 = 16 + 12) |
| Glass (`.glass`) | Floating UI only: the nav, tab groups, chips, the floating pill |
| Hover glow (`.spotlight`) | On interactive cards |
| Press (`.press`) | Scales to 0.97 on press. Use it on every clickable element |
| Link underline (`.link-draw`) | Draws in on text links |
| Grain overlay | Covers the whole page, so big flat areas don't feel digital |
| Images | Rounded corners with `.img-outline` |

## Motion: the rules

These come straight from the user's feedback; follow them.

1. **Autoplay; never hover-only.** Loops run while a section is on screen, and hovering only intensifies or takes over. The user explicitly disliked hover-to-play.
2. **Meaningful.** Every motion should tell "messy → clear" or explain the content. No decoration for its own sake, and no "hacker" effects: random-symbol scrambles were called "very bad".
3. **Lots of micro-interactions:**
   - presses, tabs moving into place, arrows that nudge;
   - the copy-email tick;
   - the theme icon morphing;
   - the cursor bubble on project cards.
4. **Pause when off-screen.** Gate every loop with `useInView` or an IntersectionObserver.
5. **Respect reduced motion.**
   - CSS animations are cut by the global rule.
   - `SortText` and `IdeaSorter` check the setting themselves.
   - Anything new must do the same.
6. **Cheap properties only.**
   - Animate `transform` and `opacity`. Never animate `top`, `left`, `width` or `height` every frame.
   - Don't blur large blocks while scrolling.
   - Transformed layers count towards page width, so check phones for sideways scroll.
7. **First paint first.** Anything above the fold must be visible without JavaScript. The hero's entrance is pure CSS (`.anim-*`); keep it that way.
8. **Curves:** `easeOut = [0.22, 1, 0.36, 1]` for entrances, `[0.65, 0, 0.35, 1]` for moves, and springs (stiffness about 300–420, damping 26–36) for UI.

## Signature animations

| Where | What |
|---|---|
| Hero | Deliberately calm since round 4: a CSS entrance, the wave, and the portrait's parallax. No loops |
| Sorting Room (`IdeaSorter`) | The scroll-driven particle funnel: gates → cut noise → lanes → board |
| "Clear out." | `SortText` |
| The solution (`Paths`) | One card: a wireframe assembles itself (Build it), a dot rides the line through Ali's portrait, a kanban card walks to Done (Run it). The toolbox sorts itself, and its last chip keeps cycling "Notion → Linear" to show the stack never stops growing |
| Tell Ali where you are | The heading's station rolls to whatever you pick on the map |
| Floating CTA | A glass pill rises in from the roadmap on and names the station you picked; it steps aside at the contact section |
| How I build (`Principles`) | The quote reads itself as you scroll. Each glyph draws in, then keeps an idle motion that matches its meaning |
| Work | Cards slide into place when you filter. The dots on the "next idea" card sort into a line |
| The path (`Journey`) | Translation words flip. The timeline draws as you scroll |
| Working together (`HowIWork`) | The sun rises, a scope rejects an extra request, a timeline flags early, a doc writes itself |
| Mind teaser | The door opens and a little visitor walks up |
| Roadmap | A metro map: the line draws in, a train rides to "you are here" on its own, stations fill as they're passed, branch lines show where a project can join |

## Voice and copy

- **Ali in the first person, in his own words.** Take lines from the Content Bank wherever possible (see `CONTENT.md`). Short, declarative, warm and calm. Concrete: real numbers, real tools, real outcomes. It should never sound like AI wrote it: no em dashes, no "not just X, it's Y" flourishes, no "better X than most Y". And no hurry words like "fast" or "effortless": Ali's work takes the time it needs.
- **No hype or buzzwords.** Let the specifics impress.
- **Small jokes** that serve the theme are welcome: "Bring the mess", "Clear out.", "No problem left unsorted".
- **US spelling** in site copy (organized, color).
- All copy lives in `src/content/`. See [CONTENT.md](CONTENT.md).

## Don'ts

- **Filler panels and stat strips.** The user removed the living philosophy, the numbers strip and the principle cards as "slop" (round 7). Keep each section to one clear thing. Don't add decorative data blocks.

- A nav that hides on scroll. It was reported as a bug.
- Hover-only animation.
- Random-symbol or "matrix" text effects.
- Big yellow or green areas: they're accents.
- Long scroll lengths without a payoff. The user wants less scrolling.
- Off-palette colours.
- New fonts.
- Hard-coded copy.
