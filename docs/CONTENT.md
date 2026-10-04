# Content: copy, projects and the journal

All of Ali's words and data live in data files, so changing copy never means touching components. Phase 5 is the user sending Ali's real content and us putting it here. From Phase 6, Ali edits projects, featured work and the journal from his admin dashboard (Supabase) instead.

## Who Ali is: the source of truth

Since 5 Oct 2026 the copy comes from **Ali's Content Bank v2** (May 2026), which the user pasted into the session. It isn't stored in the repo, because its Part B is private. Ask the user for it when you need more of Ali's words. What matters:

- **Identity:** a developer who is also a PM by nature, and both sides can't be separated. The running thread is taking what's in someone's head and making it real in another medium: translation, then apps, then docs, then process.
- **Philosophy:** input matters as much as output. "Garbage in, garbage out." Ali stays anti-hype but uses AI for real (the calculator analogy), and his process is tool-agnostic and always being improved.
- **The four versions:** every product exists four times: in your head, in what you manage to say, in what gets built, and in how each user lives it. They should share the same DNA.
- **Method:** building cleanly. Database first, then logic, then interface, documented as he goes. He does PM work only where it's missing. He scopes and documents only when it serves a purpose.
- **Entry points:** nothing built yet / specs ready / a previous developer left a mess / 80% done and stuck. These are the roadmap's branch lines.
- **Working style:** 9 AM to 6 PM GST, Monday to Friday. Honest timelines and milestone-based delivery. Suggestions, not demands.

**House rules (the user's decisions):**
- **Never "idea":** say "product".
- **No "better X than most Y" lines.**
- **No em dashes in copy.**
- **AI appears only in the philosophy.** No AI-testimonials section.
- **Leave out the music side** (drummer, composer).
- **Nothing from the bank's Part B goes on the site:**
  - the persona split;
  - the jobless months and the customer-service job;
  - MovieDNA;
  - his LinkedIn writing as a claim (show the posts instead, if ever);
  - rates.
- **Don't claim** traditional coding, UI/UX as a primary skill, formal PM training, DevOps or large-scale architecture.

## Where each kind of content lives

| Content | File | Notes |
|---|---|---|
| Copy, links, tools, numbers | `src/content/site.ts` | One exported object per topic (below) |
| Case studies | `src/content/projects.ts` | `Project[]`, plus `getProject(slug)` |
| Journal posts | Notion database, **or** `content/journal/*.md` | See "The journal" |
| Images | Ali's Supabase bucket | Referenced through `asset("file-name.ext")` |
| `/mind` text (plaques, inspect cards, toasts) | `src/components/mind/world.ts` (`PLAQUES`) and `MindExperience.tsx` (`inspectCard`) | Mostly reuses `site.ts` and `projects.ts` |

**Rule (the user, 4 Oct): never use the word "idea" in site copy.** Say "product" for the client's thing. (`/mind` still has its "scattered ideas" until Phase 8.)

Section labels, numbers, headlines and the hero copy now live in `story` in `site.ts` (moved 4 Oct). Labels read "Chapter · Part" (for example "How · The protocol"). Some short UI phrases are still inside components:
- `SplitHeading` texts in each section.
- The `MindTeaser` copy.
- Contact: "Got a messy idea? Bring it over."

Moving these into `site.ts` is part of Phase 5.

## `src/content/site.ts`, field by field

| Export | Shape | Used by |
|---|---|---|
| `asset(file)` | Returns `https://bwnfyhcmekdzumndknhp.supabase.co/storage/v1/object/public/images/<file>` | Everywhere images come from |
| `person` | `name`, `short`, `tagline`, `photo` (hero portrait), `roles[]` (rotating in the hero), `intro` | Hero, Footer, `/mind` mirror card |
| `contact` | `email`, `call` (Google Calendar template link), `linkedin`, `upwork`, `whatsapp`, `whatsappLabel` | Contact, Footer, `/mind` phone |
| `tools` | `{ name, icon, categories: ("Builds"\|"Systems")[], featured? }[]` | The "What I do" toolbox. **`featured` isn't used** |
| `paths` | The two halves of the one path (keys Builds, Systems): `title` ("Build it", "Run it"), `sub`, `body`, `bullets[]`. Titles also name the stack tabs | The methodology |
| `onePath` | `lede` (the philosophy becomes a method; no handover; keywords), `quote` | The methodology |
| `stack` | `note` (today's toolbox, not the limit), `learning[]`: `{ knows, next }` pairs cycled on the last chip | Knowledge · The stack (`Stack.tsx`) |
| `principles` | 4 items: `title`, `body`, `glyph` (`heart`\|`nodes`\|`spark`\|`doc`) | How I build |
| `competencies` | 4 items | **Not used anywhere.** Use it or delete it in Phase 5 |
| `journey` | 3 chapters: `years`, `role`, `lede`, `body` | The path, `/mind` diploma |
| `translations` | `{ from, to }[]` (grammar → database structures …) | The path's translation card |
| `workingStyle` | 4 items: `title`, `body`, `glyph` (`sun`\|`scope`\|`time`\|`doc`) | Working together, `/mind` fridge |
| `lanes`, `ideaFragments`, `sorterStages` | The Sorting Room's lanes, raw→clean chips (`{ raw, clean, lane }`), and the 5 stage captions | IdeaSorter |
| `stats` | `{ value, suffix, label }[]`: 30+, 120+, 2, 4 yrs | Numbers. **Needs Ali's confirmation** |
| `story` | The home page's narrative: `hero` (`eyebrow`, `lead` + `em` = the headline, `who`, `role`, `line`, `primary`, `secondary`, `badge`), then `stack`, `sameCraft` (the translator word), `footer`, `nextCard`, then `problem`, `solution`, `how`, `roadmap`, `proof`, `person`, `together`, `cta` (the floating pill: `idle`, `picked`, `action`), `roadmap.send` (the form's copy), `contact`, each with an `index`, a `label` and usually a `heading` plus `italic` word positions | Every home section. **Written for the site; needs Ali's approval** |
| `stationMessage()` | Builds the WhatsApp/email text from the roadmap form | The protocol |
| `roadmap` | `lede`; `stations[]` (`id`, `name`, `what`, `get`, `terms[]` = the keyword tags); `joins[]` (`id`, `label`, `at`, `color`, `note`), the branch lines where a project can join | The metro map. **Written for the site; needs Ali's approval** |

Ali's contact details are public on purpose: they appear on the live site.

## Case studies (`src/content/projects.ts`)

```ts
type Project = {
  slug: string;              // URL: /work/<slug>
  name: string;
  category: "No-Code" | "Product";   // drives the Work filter ("The Builds" / "The Systems")
  status: "Live" | "Private" | "Obsolete";
  summary: string;           // card text (2 lines)
  header: string;            // case-study intro paragraph
  story: string[];           // numbered paragraphs ("How it was organized")
  tools: string[];
  link?: string;             // "Visit live site"
  ecosystem?: string;        // e.g. "mena.tv ecosystem"
  thumbnail: string;         // asset(...)
  screenshots: string[];     // gallery, in order
  device?: "phone";          // portrait screenshots shown in a phone frame
};
```

There are 7 projects today, and the first one in the list gets the double-width card:

| Slug | Category | Status |
|---|---|---|
| `b2b-media-marketplace` | No-Code | Live |
| `admin-dashboard` | No-Code | Private |
| `native-mobile-app` | No-Code | Live (`device: "phone"`) |
| `product-backlogs` | Product | Private |
| `qa-coordination` | Product | Private |
| `mena-tv-wiki` | Product | Private |
| `analytics-subscription-portal` | No-Code | Obsolete |

**To add a project:**
1. Upload the images to the Supabase `images` bucket.
2. Add an entry to the `projects` array.
3. Build.

The page, the static route, the next/previous links and the `/mind` laptop pick it up automatically. The six `/mind` plaques are separate (`PLAQUES` in `mind/world.ts`).

## The journal

`src/lib/journal.ts` has two interchangeable sources. Pages revalidate every 5 minutes.

### 1. Notion: the no-code path, and the plan for launch

Setup (also in `README.md`):

1. **Create the database.** Make a full-page database called *Journal* with these properties:

   | Property | Type | Notes |
   |---|---|---|
   | Name | Title | |
   | Slug | Text | Optional; generated from the title if empty |
   | Date | Date | |
   | Excerpt | Text | |
   | Tags | Multi-select | |
   | Published | Checkbox | Only ticked pages appear |
   | Cover | Files | Optional; not displayed yet |

2. **Connect an integration.** Create one at <https://www.notion.so/my-integrations> and share the database with it (••• → Connections).
3. **Set the environment variables:** `NOTION_TOKEN` and `NOTION_JOURNAL_DB` (the database ID from its URL). Locally they go in `.env.local`; in production, in the host's settings.

**Supported blocks:** paragraphs, headings (h1 is shown as h2), bulleted and numbered lists, quotes and callouts (both shown as quotes), code, dividers and images.

**Limits:**
- Only the first 100 blocks of a page are read, and nested blocks such as toggles and sub-lists are skipped.
- Notion image links expire after about an hour. The Phase 6 dashboard replaces Notion, which removes this problem.
- If Notion fails, the site logs the error and falls back to Markdown.

### 2. Markdown: the fallback and local development

Put files in `content/journal/<slug>.md`:

```md
---
title: "Translation was product work all along"
excerpt: "One-line summary shown on cards."
date: 2026-09-12
tags: [Journey, Reflection]
# optional: slug: custom-slug · published: false (hides it) · cover: <url>
---

Body in Markdown…
```

The 3 posts there now (`translation-is-product-work`, `frameworks-are-tools`, `the-next-person`) are **placeholders drafted from Ali's old site copy**. Each starts with a "Seed post" note. Replace them in Phase 5.

Post HTML is injected as-is, so only Ali or the agency should write posts.

## What's real and what's placeholder

| Content | Source | Status |
|---|---|---|
| Person, roles, intro, contact | Content Bank v2 + Ali's Bubble site | Real (rewritten from the bank, 5 Oct) |
| Projects (text and images) | Ali's Bubble site and Supabase bucket | Real |
| Paths, principles, journey, working style, the hero line, the method lede, the contact lede | Content Bank v2 (Ali's words, lightly fitted) | Real; needs Ali's sign-off on the fitting |
| Station keyword tags, protocol copy | Written for this site; the branch lines are Ali's four entry points | Needs Ali's sign-off |
| Sorting Room fragments and stage captions | Written for this site; the captions now use Ali's method (intent vs spec, database first) | Fragments are invented examples. Check with Ali |
| Journal posts | Drafted by us | **Placeholder** |
| Mind teaser copy | Written for this site | **Stale.** It says "Soon / on its way" |
| TextWing case study | In the bank (AI dating assistant, GPT-4o Vision, Stripe, two 5-star reviews) | **Missing.** Needs screenshots and the client's OK to show it |
| `/mind` scattered ideas (`IDEAS` in `world.ts`) | Written for this site; each maps to a real plaque | Not wired up yet (Phase 8) |

## Phase 5 intake checklist

When the user sends content:

1. Note what changed, in `CHANGELOG.md`.
2. Update `site.ts` and `projects.ts`. Move any hard-coded section copy into `site.ts` as you touch it.
3. Upload new images to Supabase, or ask the user to; check `next.config.ts` allows the host.
4. Replace the journal placeholders, or set up Notion.
5. Fix the Mind teaser copy, the stats and the unused fields.
6. Read every page at desktop and mobile widths. Then run `tsc`, `lint` and `build`.
7. Update this doc's "What's real and what's placeholder" table.
