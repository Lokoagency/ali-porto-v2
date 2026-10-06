"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { marked } from "marked";
import { admin, slugify, today, type AdminPost } from "@/lib/admin-store";
import { Button, Field, Panel, Toggle } from "./ui";

const LIMITS = { title: 80, excerpt: 160, tags: 4 };
const blank = (): AdminPost => ({ slug: "", title: "", excerpt: "", date: today(), tags: [], published: false, body: "" });
const minutes = (md: string) => Math.max(1, Math.round(md.split(/\s+/).filter(Boolean).length / 220));

function Editor({ start, editing, onDone }: { start: AdminPost; editing: string | null; onDone: () => void }) {
  const [p, setP] = useState(start);
  const [tried, setTried] = useState(false);
  const set = <K extends keyof AdminPost>(k: K, v: AdminPost[K]) => setP((c) => ({ ...c, [k]: v }));
  const html = useMemo(() => marked.parse(p.body || "_Start writing on the left…_", { async: false }) as string, [p.body]);
  const slug = slugify(p.slug || p.title);
  const taken = admin.get().posts.some((x) => x.slug === slug && x.slug !== editing);
  const errors = { title: !p.title.trim() ? "Give the post a title." : undefined, slug: taken ? "Another post already uses this address." : undefined };

  const save = () => {
    setTried(true);
    if (errors.title || errors.slug) return;
    const next = { ...p, slug, tags: p.tags.map((t) => t.trim()).filter(Boolean) };
    admin.set((s) => ({ ...s, posts: editing ? s.posts.map((x) => (x.slug === editing ? next : x)) : [next, ...s.posts] }));
    onDone();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <Field label="Title" value={p.title} onChange={(v) => set("title", v)} max={LIMITS.title} error={tried ? errors.title : undefined} />
        <Field label="Excerpt (shown on the journal list)" value={p.excerpt} onChange={(v) => set("excerpt", v)} max={LIMITS.excerpt} multiline rows={2} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Date" value={p.date} onChange={(v) => set("date", v)} placeholder="2026-10-06" />
          <Field label="Tags (comma-separated)" value={p.tags.join(", ")} onChange={(v) => set("tags", v.split(",").slice(0, LIMITS.tags))} max={60} />
        </div>
        <Field label="Page address" value={p.slug} onChange={(v) => set("slug", v)} max={60} placeholder={slugify(p.title || "my-post")} hint={`/journal/${slug}`} error={tried ? errors.slug : undefined} />
        <Field
          label="The post (Markdown)"
          value={p.body}
          onChange={(v) => set("body", v)}
          multiline
          rows={14}
          hint="## for a heading, **bold**, > for a quote, - for a list. Your own words: no AI drafting."
        />
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-card px-4 py-3">
          <span className="text-[0.9rem]">{p.published ? "Published: visible on the journal" : "Draft: only you can see it"}</span>
          <Toggle on={p.published} onChange={(v) => set("published", v)} label="Published" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button tone="ink" type="submit">
            {editing ? "Save post" : "Add post"}
          </Button>
          <Button onClick={onDone}>Cancel</Button>
        </div>
      </form>

      {/* live preview: the journal post template */}
      <div className="min-w-0 lg:sticky lg:top-28 lg:self-start">
        <p className="mb-3 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-muted">Live preview · the post page</p>
        <article className="max-h-[75vh] overflow-auto rounded-[22px] border border-line bg-paper p-6 md:p-8">
          <p className="eyebrow mb-4 flex flex-wrap gap-x-3 text-muted">
            <span className="tabular">{p.date}</span>
            <span>{minutes(p.body)} min read</span>
            {p.tags.filter((t) => t.trim()).map((t) => (
              <span key={t}>{t.trim()}</span>
            ))}
          </p>
          <h1 className="font-display text-[clamp(1.8rem,3vw,2.6rem)] leading-[1.05]">{p.title || "Untitled"}</h1>
          {p.excerpt && <p className="mt-4 text-[1.05rem] leading-relaxed text-ink-soft">{p.excerpt}</p>}
          {/* the author's own Markdown, rendered locally for the preview only */}
          <div className="prose-ali mt-8" dangerouslySetInnerHTML={{ __html: html }} />
        </article>
      </div>
    </div>
  );
}

export function JournalTab({ posts }: { posts: AdminPost[] }) {
  const [editing, setEditing] = useState<{ start: AdminPost; slug: string | null } | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);
  if (editing) {
    return (
      <Panel title={editing.slug ? `Edit: ${editing.start.title}` : "New post"}>
        <Editor start={editing.start} editing={editing.slug} onDone={() => setEditing(null)} />
      </Panel>
    );
  }
  const sorted = [...posts].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <Panel title="Journal" aside={<Button tone="ink" onClick={() => setEditing({ start: blank(), slug: null })}>+ New post</Button>}>
      {sorted.length === 0 && <p className="text-ink-soft">No posts yet.</p>}
      <ul className="divide-y divide-line">
        <AnimatePresence initial={false}>
          {sorted.map((p) => (
            <motion.li
              key={p.slug}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -16, transition: { duration: 0.15 } }}
              className="flex flex-wrap items-center gap-4 py-3"
            >
              <span className={`size-2 shrink-0 rounded-full ${p.published ? "bg-teal" : "bg-sun"}`} aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{p.title}</p>
                <p className="font-mono text-[0.68rem] uppercase tracking-[0.1em] text-muted">
                  <span className="tabular">{p.date}</span> · {p.published ? "Published" : "Draft"}
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setEditing({ start: p, slug: p.slug })}>Edit</Button>
                {confirm === p.slug ? (
                  <Button
                    tone="danger"
                    onClick={() => {
                      admin.set((s) => ({ ...s, posts: s.posts.filter((x) => x.slug !== p.slug) }));
                      setConfirm(null);
                    }}
                  >
                    Yes, delete
                  </Button>
                ) : (
                  <Button tone="danger" onClick={() => setConfirm(p.slug)}>
                    Delete
                  </Button>
                )}
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </Panel>
  );
}
