"use client";

import { Reorder, useDragControls } from "motion/react";
import { ProjectCard } from "@/components/home/Work";
import { admin, type AdminProject } from "@/lib/admin-store";
import { Panel, Toggle } from "./ui";

function Row({ p, i, onToggle }: { p: AdminProject; i: number; onToggle: (v: boolean) => void }) {
  const drag = useDragControls();
  return (
    <Reorder.Item
      value={p}
      dragListener={false}
      dragControls={drag}
      className="relative flex items-center gap-3 rounded-2xl border border-line bg-card p-2 pr-4 shadow-[var(--shadow-sm)]"
      whileDrag={{ scale: 1.02, boxShadow: "var(--shadow-lg)", zIndex: 10 }}
      transition={{ type: "spring", stiffness: 420, damping: 34 }}
    >
      <button
        type="button"
        aria-label={`Drag ${p.name}`}
        onPointerDown={(e) => drag.start(e)}
        className="flex size-10 shrink-0 cursor-grab touch-none items-center justify-center rounded-xl text-muted hover:bg-paper-2 hover:text-ink active:cursor-grabbing"
      >
        <svg viewBox="0 0 16 16" className="size-4" fill="currentColor">
          {[4, 8, 12].flatMap((y) => [5, 11].map((x) => <circle key={`${x}${y}`} cx={x} cy={y} r="1.3" />))}
        </svg>
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={p.thumbnail} alt="" className={`h-10 w-16 shrink-0 rounded-lg object-cover object-top transition-opacity duration-300 ${p.hidden ? "opacity-30" : ""}`} />
      <div className="min-w-0 flex-1">
        <p className={`truncate text-[0.92rem] transition-colors duration-300 ${p.hidden ? "text-muted line-through" : "text-ink"}`}>{p.name}</p>
        <p className="font-mono text-[0.64rem] uppercase tracking-[0.1em] text-muted">
          {p.hidden ? "Hidden" : i === 0 ? "Featured · double width" : `Position ${i + 1}`}
        </p>
      </div>
      <Toggle on={!p.hidden} onChange={onToggle} label={`Show ${p.name} on the site`} />
    </Reorder.Item>
  );
}

/** Drag projects into the order the home page shows them; the first visible one is the big featured card. */
export function FeaturedTab({ projects }: { projects: AdminProject[] }) {
  const visible = projects.filter((p) => !p.hidden);
  return (
    <Panel title="Featured work">
      <div className="grid gap-8 xl:grid-cols-[minmax(0,440px)_1fr]">
        <div>
          <p className="mb-4 text-[0.92rem] leading-relaxed text-ink-soft">
            Drag the handle to reorder. The first visible project becomes the large featured card. Switch one off to hide it from the home page
            without deleting it.
          </p>
          <Reorder.Group
            axis="y"
            values={projects}
            onReorder={(next) => admin.set((s) => ({ ...s, projects: next }))}
            className="space-y-2"
          >
            {projects.map((p) => (
              <Row
                key={p.slug}
                p={p}
                i={visible.indexOf(p)}
                onToggle={(show) => admin.set((s) => ({ ...s, projects: s.projects.map((x) => (x.slug === p.slug ? { ...x, hidden: !show } : x)) }))}
              />
            ))}
          </Reorder.Group>
        </div>

        {/* the home grid, scaled down: what visitors will see */}
        <div className="min-w-0">
          <p className="mb-3 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-muted">Live preview · the home page grid</p>
          <div className="overflow-hidden rounded-[22px] border border-line bg-paper-2 p-4">
            {/* zoom (not scale) so the preview also takes half the height */}
            <div className="pointer-events-none w-[200%]" style={{ zoom: 0.5 }} aria-hidden>
              <ul className="grid grid-cols-3 gap-4">
                {visible.map((p, i) => (
                  <ProjectCard key={p.slug} p={p} index={i} />
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}
