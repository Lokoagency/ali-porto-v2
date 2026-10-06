"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { admin, initAdmin, useAdmin, type AdminState } from "@/lib/admin-store";
import { easeOut } from "@/components/primitives";
import { Button } from "./ui";
import { WorkTab } from "./WorkTab";
import { FeaturedTab } from "./FeaturedTab";
import { JournalTab } from "./JournalTab";
import { ClientsTab } from "./ClientsTab";

const tabs = [
  { id: "work", label: "Work" },
  { id: "featured", label: "Featured" },
  { id: "journal", label: "Journal" },
  { id: "clients", label: "Clients" },
] as const;
type Tab = (typeof tabs)[number]["id"];

/**
 * Ali's dashboard (Phase 6, front end). Until the database phase, everything is saved in
 * this browser; "Export changes" downloads a JSON file the agency applies to src/content.
 */
export function AdminApp({ initial }: { initial: AdminState }) {
  initAdmin(initial);
  const s = useAdmin(initial);
  const [tab, setTab] = useState<Tab>("work");
  const [confirmReset, setConfirmReset] = useState(false);
  const counts: Record<Tab, number> = {
    work: s.projects.length,
    featured: s.projects.filter((p) => !p.hidden).length,
    journal: s.posts.length,
    clients: s.clients.length,
  };

  const download = () => {
    const blob = new Blob([admin.exportJson()], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `ali-site-changes-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="mx-auto min-h-[100svh] max-w-[1200px] px-5 pb-24 pt-32 sm:px-8 md:pt-36">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="eyebrow mb-3">Dashboard</p>
          <h1 className="font-display text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.02]">
            Hi Ali. <span className="font-display-italic text-teal">What changed?</span>
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button tone="ink" onClick={download}>
            Export changes
          </Button>
          {confirmReset ? (
            <Button
              tone="danger"
              onClick={() => {
                admin.reset();
                setConfirmReset(false);
              }}
            >
              Yes, discard my edits
            </Button>
          ) : (
            <Button onClick={() => setConfirmReset(true)}>Reset to the live site</Button>
          )}
        </div>
      </div>

      <p className="mt-6 flex items-start gap-2.5 rounded-2xl border border-sun/40 bg-sun/10 px-4 py-3 text-[0.88rem] leading-relaxed text-ink">
        <span className="mt-1.5 size-2 shrink-0 rounded-full bg-sun" aria-hidden />
        Preview mode: your edits are saved in this browser only. The live site changes once the database is connected (a later phase). Until
        then, use “Export changes” and send the file to LKO.AGNCY.
      </p>

      <div className="glass mt-8 inline-flex flex-wrap gap-1 rounded-full p-1" role="tablist" aria-label="Dashboard sections">
        {tabs.map((t) => {
          const on = t.id === tab;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={on}
              onClick={() => setTab(t.id)}
              className={`press relative flex h-10 items-center gap-2 rounded-full px-4 text-[0.86rem] ${on ? "text-paper" : "text-ink-soft hover:text-ink"}`}
            >
              {on && <motion.span layoutId="admin-tab" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
              <span className="relative">{t.label}</span>
              <span className={`relative font-mono text-[0.68rem] tabular ${on ? "text-paper/60" : "text-muted"}`}>{counts[t.id]}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={tab}
          className="mt-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6, transition: { duration: 0.15 } }}
          transition={{ duration: 0.35, ease: easeOut }}
        >
          {tab === "work" && <WorkTab projects={s.projects} />}
          {tab === "featured" && <FeaturedTab projects={s.projects} />}
          {tab === "journal" && <JournalTab posts={s.posts} />}
          {tab === "clients" && <ClientsTab clients={s.clients} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
