# Content: copy, projects and the journal

All of Ali's words and data live in data files, so changing copy never means touching components. Phase 1 is the user sending Ali's real content and us putting it here.

## Where each kind of content lives

| Content | File | Notes |
|---|---|---|
| Copy, links, tools, numbers | `src/content/site.ts` | One exported object per topic (below) |
| Case studies | `src/content/projects.ts` | `Project[]`, plus `getProject(slug)` |
| Journal posts | Notion database, **or** `content/journal/*.md` | See "The journal" |
| Images | Ali's Supabase bucket | Referenced through `asset("file-name.ext")` |
| `/mind` text (plaques, inspect cards, toasts) | `src/components/mind/world.ts` (`PLAQUES`) and `MindExperience.tsx` (`inspectCard`) | Mostly reuses `site.ts` and `projects.ts` |

Section labels, numbers, headlines and the hero copy now live in `story` in `site.ts` (moved 4 Oct). Some short UI phrases are still inside components:
- Hero: "Your idea is brilliant. It's also a mess." and "I'm the one who makes it make sense."
- `SplitHeading` texts in each section.
- The `MindTeaser` copy.
- Contact: "Got a messy idea? Bring it over."

Moving these into `site.ts` is part of Phase 1.

## `src/content/site.ts`, field by field

| Export | Shape | Used by |
|---|---|---|
| `asset(file)` | Returns `https://bwnfyhcmekdzumndknhp.supabase.co/storage/v1/object/public/images/<file>` | Everywhere images come from |
| `person` | `name`, `short`, `tagline`, `photo` (hero portrait), `roles[]` (rotating in the hero), `intro` | Hero, Footer, `/mind` mirror card |
| `contact` | `email`, `call` (Google Calendar template link), `linkedin`, `upwork`, `whatsapp`, `whatsappLabel` | Contact, Footer, `/mind` phone |
| `tools` | `{ name, icon, categories: ("Builds"\|"Systems")[], featured? }[]` | The "What I do" toolbox. **`featured` isn't used** |
| `paths` | Two cards (Builds, Systems): `title`, `body`, `bullets[]`, `quote` | What I do |
| `principles` | 4 items: `title`, `body`, `glyph` (`heart`\|`nodes`\|`spark`\|`doc`) | How I build |
| `competencies` | 4 items | **Not used anywhere.** Use it or delete it in Phase 1 |
| `journey` | 3 chapters: `years`, `role`, `lede`, `body` | The path, `/mind` diploma |
| `translations` | `{ from, to }[]` (grammar → database structures …) | The path's translation card |
| `workingStyle` | 4 items: `title`, `body`, `glyph` (`sun`\|`scope`\|`time`\|`doc`) | Working together, `/mind` fridge |
| `lanes`, `ideaFragments`, `sorterStages` | The Sorting Room's lanes, raw→clean chips (`{ raw, clean, lane }`), and the 5 stage captions | IdeaSorter |
| `stats` | `{ value, suffix, label }[]`: 30+, 120+, 2, 4 yrs | Numbers. **Needs Ali's confirmation** |
| `story` | The home page's narrative: `hero` (lines, scattered word, tagline, sorted phrase, the six notes), then `problem`, `solution`, `how`, `roadmap`, `proof`, `person`, `together`, `contact`, each with an `index`, a `label` and usually a `heading` plus `italic` word positions | Every home section. **Written for the site; needs Ali's approval** |
| `roadmap` | `lede`; `stations[]` (`id`, `name`, `what`, `get`); `joins[]` (`id`, `label`, `at`, `color`, `note`), the branch lines where a project can join | The metro map. **Written for the site; needs Ali's approval** |

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
- Notion image links expire after about an hour. Mirror them before launch (Phase 4).
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

The 3 posts there now (`translation-is-product-work`, `frameworks-are-tools`, `the-next-person`) are **placeholders drafted from Ali's old site copy**. Each starts with a "Seed post" note. Replace them in Phase 1.

Post HTML is injected as-is, so only Ali or the agency should write posts.

## What's real and what's placeholder

| Content | Source | Status |
|---|---|---|
| Person, roles, intro, contact | Ali's Bubble site | Real. Confirm with Ali in Phase 1 |
| Projects (text and images) | Ali's Bubble site and Supabase bucket | Real |
| Paths, principles, journey, working style | Ali's Bubble site, lightly edited | Real; needs Ali's sign-off |
| Sorting Room fragments and stage captions | Written for this site | Invented examples. Check that Ali is happy with them |
| Stats | Derived from his projects | **Confirm** |
| Journal posts | Drafted by us | **Placeholder** |
| Mind teaser copy | Written for this site | **Stale.** It says "Soon / on its way" |
| `/mind` scattered ideas (`IDEAS` in `world.ts`) | Written for this site; each maps to a real plaque | Not wired up yet (Phase 5) |

## Phase 1 intake checklist

When the user sends content:

1. Note what changed, in `CHANGELOG.md`.
2. Update `site.ts` and `projects.ts`. Move any hard-coded section copy into `site.ts` as you touch it.
3. Upload new images to Supabase, or ask the user to; check `next.config.ts` allows the host.
4. Replace the journal placeholders, or set up Notion.
5. Fix the Mind teaser copy, the stats and the unused fields.
6. Read every page at desktop and mobile widths. Then run `tsc`, `lint` and `build`.
7. Update this doc's "What's real and what's placeholder" table.
