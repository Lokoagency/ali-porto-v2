import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

/**
 * The journal has two interchangeable sources:
 *
 * 1. Notion (the no-code path) — when NOTION_TOKEN and NOTION_JOURNAL_DB are set,
 *    Ali writes in a Notion database and ticks "Published". The site picks it up
 *    within REVALIDATE seconds. No deploys, no code.
 * 2. Markdown files in /content/journal — the fallback, used for local dev and seed posts.
 */

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string; // ISO
  tags: string[];
  cover?: string;
  minutes: number;
  html: string;
};

export const REVALIDATE = 300;

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_DB = process.env.NOTION_JOURNAL_DB;
const LOCAL_DIR = path.join(process.cwd(), "content", "journal");

const minutesFor = (text: string) => Math.max(1, Math.round(text.split(/\s+/).length / 220));

const byDateDesc = (a: Post, b: Post) => +new Date(b.date) - +new Date(a.date);

export async function getAllPosts(): Promise<Post[]> {
  const posts = NOTION_TOKEN && NOTION_DB ? await fromNotion() : await fromMarkdown();
  return posts.sort(byDateDesc);
}

export async function getPost(slug: string): Promise<Post | undefined> {
  return (await getAllPosts()).find((p) => p.slug === slug);
}

/* ------------------------------ Markdown ------------------------------ */

async function fromMarkdown(): Promise<Post[]> {
  let files: string[] = [];
  try {
    files = (await fs.readdir(LOCAL_DIR)).filter((f) => f.endsWith(".md"));
  } catch {
    return [];
  }
  const posts = await Promise.all(
    files.map(async (file): Promise<Post | null> => {
      const raw = await fs.readFile(path.join(LOCAL_DIR, file), "utf8");
      const { data, content } = matter(raw);
      if (data.published === false) return null;
      return {
        slug: data.slug ?? file.replace(/\.md$/, ""),
        title: data.title ?? "Untitled",
        excerpt: data.excerpt ?? "",
        date: new Date(data.date ?? Date.now()).toISOString(),
        tags: data.tags ?? [],
        cover: data.cover,
        minutes: minutesFor(content),
        html: await marked.parse(content),
      };
    }),
  );
  return posts.filter((p): p is Post => p !== null);
}

/* ------------------------------- Notion ------------------------------- */
// Expected database properties:
//   Name (title) · Slug (text) · Date (date) · Excerpt (text)
//   Tags (multi-select) · Published (checkbox) · Cover (files, optional)

type RichText = { plain_text: string; href: string | null; annotations: Record<string, boolean> };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

async function notion(endpoint: string, body?: object) {
  const res = await fetch(`https://api.notion.com/v1/${endpoint}`, {
    method: body ? "POST" : "GET",
    headers: {
      Authorization: `Bearer ${NOTION_TOKEN}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
    next: { revalidate: REVALIDATE, tags: ["journal"] },
  });
  if (!res.ok) throw new Error(`Notion ${endpoint} → ${res.status}`);
  return res.json();
}

const plain = (rt: RichText[] = []) => rt.map((t) => t.plain_text).join("");
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").slice(0, 80);

function rich(rt: RichText[] = []) {
  return rt
    .map((t) => {
      let s = esc(t.plain_text);
      const a = t.annotations;
      if (a.code) s = `<code>${s}</code>`;
      if (a.bold) s = `<strong>${s}</strong>`;
      if (a.italic) s = `<em>${s}</em>`;
      if (a.strikethrough) s = `<s>${s}</s>`;
      if (t.href) s = `<a href="${esc(t.href)}">${s}</a>`;
      return s;
    })
    .join("");
}

function blocksToHtml(blocks: Any[]) {
  const out: string[] = [];
  let list: "ul" | "ol" | null = null;
  const close = () => {
    if (list) out.push(`</${list}>`);
    list = null;
  };
  for (const b of blocks) {
    const v = b[b.type];
    const listType = b.type === "bulleted_list_item" ? "ul" : b.type === "numbered_list_item" ? "ol" : null;
    if (listType !== list) {
      close();
      if (listType) out.push(`<${listType}>`);
      list = listType;
    }
    switch (b.type) {
      case "paragraph":
        out.push(`<p>${rich(v.rich_text)}</p>`);
        break;
      case "heading_1":
      case "heading_2":
        out.push(`<h2>${rich(v.rich_text)}</h2>`);
        break;
      case "heading_3":
        out.push(`<h3>${rich(v.rich_text)}</h3>`);
        break;
      case "bulleted_list_item":
      case "numbered_list_item":
        out.push(`<li>${rich(v.rich_text)}</li>`);
        break;
      case "quote":
      case "callout":
        out.push(`<blockquote>${rich(v.rich_text)}</blockquote>`);
        break;
      case "code":
        out.push(`<pre><code>${esc(plain(v.rich_text))}</code></pre>`);
        break;
      case "divider":
        out.push("<hr/>");
        break;
      case "image": {
        const src = v.type === "external" ? v.external.url : v.file.url;
        out.push(`<figure><img src="${esc(src)}" alt="${esc(plain(v.caption))}"/></figure>`);
        break;
      }
    }
  }
  close();
  return out.join("\n");
}

async function fromNotion(): Promise<Post[]> {
  try {
    const { results } = await notion(`databases/${NOTION_DB}/query`, {
      filter: { property: "Published", checkbox: { equals: true } },
      sorts: [{ property: "Date", direction: "descending" }],
    });
    return Promise.all(
      results.map(async (page: Any) => {
        const p = page.properties;
        const title = plain(p.Name?.title);
        const { results: blocks } = await notion(`blocks/${page.id}/children?page_size=100`);
        const text = blocks.map((b: Any) => plain(b[b.type]?.rich_text)).join(" ");
        const coverFile = p.Cover?.files?.[0];
        return {
          slug: plain(p.Slug?.rich_text) || slugify(title),
          title,
          excerpt: plain(p.Excerpt?.rich_text),
          date: p.Date?.date?.start ?? page.created_time,
          tags: p.Tags?.multi_select?.map((t: Any) => t.name) ?? [],
          cover: coverFile ? (coverFile.external?.url ?? coverFile.file?.url) : undefined,
          minutes: minutesFor(text),
          html: blocksToHtml(blocks),
        } satisfies Post;
      }),
    );
  } catch (err) {
    console.error("[journal] Notion unavailable, falling back to markdown:", err);
    return fromMarkdown();
  }
}

/** Listing data only — keeps post bodies out of client bundles. */
export const toMeta = ({ slug, title, excerpt, date, tags, cover, minutes }: Post) => ({ slug, title, excerpt, date, tags, cover, minutes });
