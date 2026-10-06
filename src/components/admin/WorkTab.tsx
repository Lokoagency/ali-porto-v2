"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ProjectCard } from "@/components/home/Work";
import { admin, slugify, type AdminProject } from "@/lib/admin-store";
import { story } from "@/content/site";
import { Button, Field, Panel, Segmented } from "./ui";

// the limits the design can hold without overflowing a card or the case-study header
const LIMITS = { name: 60, summary: 140, header: 420, story: 600, tools: 6, link: 200 };
const IMAGE_HOST = "https://bwnfyhcmekdzumndknhp.supabase.co/storage/v1/object/public/";

const blank = (): AdminProject => ({
  slug: "",
  name: "",
  category: "No-Code",
  status: "Live",
  summary: "",
  header: "",
  story: [],
  tools: [],
  thumbnail: "",
  screenshots: [],
});

function validate(p: AdminProject, all: AdminProject[], editing: string | null) {
  const e: Partial<Record<"name" | "summary" | "thumbnail" | "slug", string>> = {};
  if (!p.name.trim()) e.name = "Every project needs a name.";
  if (!p.summary.trim()) e.summary = "Two lines that say what it is.";
  if (!p.thumbnail.startsWith(IMAGE_HOST)) e.thumbnail = "Upload the image to the Supabase images bucket, then paste its public URL here.";
  const slug = slugify(p.slug || p.name);
  if (all.some((x) => x.slug === slug && x.slug !== editing)) e.slug = "Another project already uses this address.";
  return e;
}

function Editor({ start, editing, onDone }: { start: AdminProject; editing: string | null; onDone: () => void }) {
  const [p, setP] = useState<AdminProject>(start);
  const [tried, setTried] = useState(false);
  const all = admin.get().projects;
  const errors = validate(p, all, editing);
  const ok = Object.keys(errors).length === 0;
  const set = <K extends keyof AdminProject>(k: K, v: AdminProject[K]) => setP((cur) => ({ ...cur, [k]: v }));

  const save = () => {
    setTried(true);
    if (!ok) return;
    const next = { ...p, slug: slugify(p.slug || p.name), story: p.story.map((s) => s.trim()).filter(Boolean) };
    admin.set((s) => ({
      ...s,
      projects: editing ? s.projects.map((x) => (x.slug === editing ? next : x)) : [...s.projects, next],
    }));
    onDone();
  };
  const err = (k: keyof typeof errors) => (tried ? errors[k] : undefined);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,420px)]">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <Field label="Name" value={p.name} onChange={(v) => set("name", v)} max={LIMITS.name} error={err("name")} />
        <Field
          label="Page address"
          value={p.slug}
          onChange={(v) => set("slug", v)}
          max={60}
          placeholder={slugify(p.name || "my-project")}
          hint={`/work/${slugify(p.slug || p.name || "my-project")}`}
          error={err("slug")}
        />
        <div className="flex flex-wrap gap-4">
          <div>
            <span className="mb-1.5 block font-mono text-[0.68rem] uppercase tracking-[0.12em] text-ink-soft">Half of the path</span>
            <Segmented
              id="cat"
              value={p.category}
              onChange={(v) => set("category", v)}
              options={[
                { value: "No-Code", label: story.proof.filters["No-Code"] },
                { value: "Product", label: story.proof.filters.Product },
              ]}
            />
          </div>
          <div>
            <span className="mb-1.5 block font-mono text-[0.68rem] uppercase tracking-[0.12em] text-ink-soft">Status</span>
            <Segmented
              id="status"
              value={p.status}
              onChange={(v) => set("status", v)}
              options={[
                { value: "Live", label: "Live" },
                { value: "Private", label: "Private" },
                { value: "Obsolete", label: "Obsolete" },
              ]}
            />
          </div>
        </div>
        <Field label="Card summary (two lines)" value={p.summary} onChange={(v) => set("summary", v)} max={LIMITS.summary} multiline rows={2} error={err("summary")} />
        <Field label="Case-study intro" value={p.header} onChange={(v) => set("header", v)} max={LIMITS.header} multiline rows={3} />
        <Field
          label="How it was organized (one paragraph per line)"
          value={p.story.join("\n")}
          onChange={(v) => set("story", v.split("\n").map((l) => l.slice(0, LIMITS.story)))}
          multiline
          rows={5}
          hint="Each line becomes a numbered paragraph on the case-study page."
        />
        <Field
          label={`Tools (comma-separated, the card shows the first 3)`}
          value={p.tools.join(", ")}
          onChange={(v) => set("tools", v.split(",").map((t) => t.trimStart()).slice(0, LIMITS.tools))}
          max={200}
        />
        <Field label="Cover image URL" value={p.thumbnail} onChange={(v) => set("thumbnail", v.trim())} placeholder={IMAGE_HOST + "images/…"} error={err("thumbnail")} />
        <Field
          label="Screenshots (one URL per line)"
          value={p.screenshots.join("\n")}
          onChange={(v) => set("screenshots", v.split("\n").map((l) => l.trim()))}
          multiline
          rows={3}
        />
        <Field label="Live link (optional)" value={p.link ?? ""} onChange={(v) => set("link", v || undefined)} max={LIMITS.link} />
        <div className="flex flex-wrap gap-2 pt-2">
          <Button tone="ink" type="submit">
            {editing ? "Save changes" : "Add project"}
          </Button>
          <Button onClick={onDone}>Cancel</Button>
        </div>
      </form>

      {/* live preview: the real card from the home page */}
      <div className="lg:sticky lg:top-28 lg:self-start">
        <p className="mb-3 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-muted">Live preview · exactly as on the site</p>
        <ul className="pointer-events-none grid" aria-hidden>
          {p.thumbnail.startsWith(IMAGE_HOST) && p.name ? (
            <ProjectCard p={{ ...p, slug: p.slug || "preview", tools: p.tools.filter(Boolean) }} index={1} />
          ) : (
            <li className="flex aspect-[4/3] items-center justify-center rounded-[26px] border border-dashed border-line-strong p-6 text-center text-[0.88rem] text-muted">
              Add a name and a cover image to see the card.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

export function WorkTab({ projects }: { projects: AdminProject[] }) {
  const [editing, setEditing] = useState<{ start: AdminProject; slug: string | null } | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);

  if (editing) {
    return (
      <Panel title={editing.slug ? `Edit: ${editing.start.name}` : "New project"}>
        <Editor start={editing.start} editing={editing.slug} onDone={() => setEditing(null)} />
      </Panel>
    );
  }

  return (
    <Panel title="Work" aside={<Button tone="ink" onClick={() => setEditing({ start: blank(), slug: null })}>+ Add project</Button>}>
      <ul className="divide-y divide-line">
        <AnimatePresence initial={false}>
          {projects.map((p) => (
            <motion.li
              key={p.slug}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -16, transition: { duration: 0.15 } }}
              className="flex flex-wrap items-center gap-4 py-3"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.thumbnail} alt="" className="h-12 w-20 shrink-0 rounded-lg bg-paper-2 object-cover object-top" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{p.name}</p>
                <p className="font-mono text-[0.68rem] uppercase tracking-[0.1em] text-muted">
                  {story.proof.filters[p.category]} · {p.status}
                  {p.hidden ? " · hidden" : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setEditing({ start: p, slug: p.slug })}>Edit</Button>
                {confirm === p.slug ? (
                  <Button
                    tone="danger"
                    onClick={() => {
                      admin.set((s) => ({ ...s, projects: s.projects.filter((x) => x.slug !== p.slug) }));
                      setConfirm(null);
                    }}
                  >
                    Yes, remove
                  </Button>
                ) : (
                  <Button tone="danger" onClick={() => setConfirm(p.slug)}>
                    Remove
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
