import type { Metadata } from "next";
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { projects } from "@/content/projects";
import { AdminApp } from "@/components/admin/AdminApp";
import type { AdminPost, AdminState } from "@/lib/admin-store";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

// The dashboard starts from what the live site shows today: projects.ts and content/journal/*.md.
async function journalSeed(): Promise<AdminPost[]> {
  const dir = path.join(process.cwd(), "content", "journal");
  const files = (await fs.readdir(dir).catch(() => [] as string[])).filter((f) => f.endsWith(".md"));
  return Promise.all(
    files.map(async (f) => {
      const { data, content } = matter(await fs.readFile(path.join(dir, f), "utf8"));
      const date = data.date instanceof Date ? data.date.toISOString().slice(0, 10) : String(data.date ?? "");
      return {
        slug: String(data.slug ?? f.replace(/\.md$/, "")),
        title: String(data.title ?? ""),
        excerpt: String(data.excerpt ?? ""),
        date,
        tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
        published: data.published !== false,
        body: content.trim(),
      };
    }),
  );
}

export default async function AdminPage() {
  const initial: AdminState = { version: 1, projects, posts: await journalSeed(), clients: [] };
  return <AdminApp initial={initial} />;
}
