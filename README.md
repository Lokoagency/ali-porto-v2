# Have you met Ali? (portfolio)

Ali Farghaly's portfolio, built by LKO.AGNCY. It's minimal, teal and cozy, and built around one idea: **messy idea in → clear plan out.**

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build (must pass)
```

## Pages

| Page | What |
|---|---|
| `/` | The home page: hero, numbers, the Sorting Room, what Ali does, how he builds, work, his path, working together, journal, contact |
| `/work/[slug]` | The 7 case studies |
| `/journal` | Ali's journal, written in Notion (or Markdown) |
| `/mind` | "A deep dive into Ali's mind", a walkable 3D house. Paused until the last phase |

## Where things live

| What | File |
|---|---|
| All of Ali's copy (roles, paths, principles, journey, contact, numbers, Sorting Room fragments) | `src/content/site.ts` |
| Projects and case studies | `src/content/projects.ts` |
| Colours, type and shared styles (light and dark) | `src/app/globals.css` |
| The signature scroll animation | `src/components/home/IdeaSorter.tsx` |
| Journal engine (Notion or Markdown) | `src/lib/journal.ts` |
| The 3D house | `src/components/mind/` |

Images come from Ali's Supabase storage bucket. It's the only image host allowed in `next.config.ts`.

## The journal: no code needed

Ali writes in **Notion**, and the site picks up new posts within 5 minutes, with no deploy.

1. In Notion, create a database called *Journal* with these properties:
   - Name (title)
   - Slug (text, optional)
   - Date
   - Excerpt (text)
   - Tags (multi-select)
   - Published (checkbox)
   - Cover (files, optional)
2. Create an integration at <https://www.notion.so/my-integrations> and share the database with it (••• → Connections).
3. Set `NOTION_TOKEN` and `NOTION_JOURNAL_DB` (the database ID) on the host, or in `.env.local` locally.
4. Write a page and tick **Published**.

Without those variables, the journal reads Markdown from `content/journal/`. The three posts there now are placeholders. Full details are in [`docs/CONTENT.md`](docs/CONTENT.md).

## Docs

| Doc | For |
|---|---|
| [`PLAN.md`](PLAN.md) | The phase-by-phase plan |
| [`docs/HANDOFF.md`](docs/HANDOFF.md) | **Start here:** status, decisions, the user's preferences |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | How the code is organized |
| [`docs/DESIGN.md`](docs/DESIGN.md) | Look, motion rules, voice |
| [`docs/CONTENT.md`](docs/CONTENT.md) | Editing copy, projects, the journal |
| [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md) | Commands, testing, Lighthouse, quirks |
| [`docs/MIND.md`](docs/MIND.md) | The 3D house |
| [`docs/CHANGELOG.md`](docs/CHANGELOG.md) | What changed, and when |

`CLAUDE.md` is read automatically by Claude Code. It holds the working rules, including "update the docs with every change".
