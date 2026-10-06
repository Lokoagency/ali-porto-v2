"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { roadmap } from "@/content/site";
import { admin, today, trackLink, type AdminClient } from "@/lib/admin-store";
import { Button, Field, Panel } from "./ui";

const stations = roadmap.stations;

/** A tiny metro line: tap a station to move the client's train there. */
function MiniLine({ at, onPick }: { at: number; onPick: (i: number) => void }) {
  return (
    <div className="relative py-2">
      <span className="absolute inset-x-3 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-line-strong" aria-hidden />
      <motion.span
        aria-hidden
        className="absolute left-3 top-1/2 h-[3px] -translate-y-1/2 origin-left rounded-full bg-teal"
        style={{ right: 12 }}
        initial={false}
        animate={{ scaleX: at / (stations.length - 1) }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
      />
      <ol className="relative flex justify-between">
        {stations.map((s, i) => (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => onPick(i)}
              aria-label={`${s.name}${i === at ? " (current)" : ""}`}
              aria-pressed={i === at}
              title={s.name}
              className="group relative flex size-6 items-center justify-center before:absolute before:-inset-2.5 before:content-['']"
            >
              <span
                className={`block size-5 rounded-full border-[3px] transition-[transform,background-color,border-color] duration-300 ${
                  i <= at ? "border-teal bg-teal" : "border-ink-soft bg-card group-hover:border-teal"
                } ${i === at ? "scale-100" : "scale-[0.7]"}`}
              />
              {i === at && (
                <motion.span layoutId="mini-here" className="absolute -inset-1 rounded-full ring-2 ring-teal/40" transition={{ type: "spring", stiffness: 420, damping: 34 }} />
              )}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

function ClientCard({ c }: { c: AdminClient }) {
  const [copied, setCopied] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const update = (patch: Partial<AdminClient>) =>
    admin.set((s) => ({ ...s, clients: s.clients.map((x) => (x.id === c.id ? { ...x, ...patch, updated: today() } : x)) }));
  const link = () => trackLink(location.origin, c);
  const st = stations[c.station];
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.15 } }}
      className="rounded-[22px] border border-line bg-card p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-[1.3rem] leading-tight">{c.name || "Unnamed client"}</p>
          <p className="text-[0.85rem] text-muted">{c.company}</p>
        </div>
        <p className="font-mono text-[0.68rem] uppercase tracking-[0.1em] text-muted">
          Updated <span className="tabular">{c.updated}</span>
        </p>
      </div>
      <div className="mt-4">
        <MiniLine at={c.station} onPick={(i) => update({ station: i })} />
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={st.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4, transition: { duration: 0.12 } }}
            className="mt-2 text-[0.9rem]"
          >
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-teal">
              Station <span className="tabular">{String(c.station + 1).padStart(2, "0")}</span>
            </span>{" "}
            <span className="font-medium">{st.name}</span> <span className="text-muted">· they get: {st.get}</span>
          </motion.p>
        </AnimatePresence>
      </div>
      <div className="mt-4">
        <Field label="Note for the client" value={c.note} onChange={(v) => update({ note: v })} max={240} multiline rows={2} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          tone="ink"
          onClick={() => {
            navigator.clipboard?.writeText(link()).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1600);
            });
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={copied ? "y" : "n"} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}>
              {copied ? "Link copied ✓" : "Copy private link"}
            </motion.span>
          </AnimatePresence>
        </Button>
        <Button onClick={() => window.open(link(), "_blank", "noopener")}>Preview their view</Button>
        {confirm ? (
          <Button tone="danger" onClick={() => admin.set((s) => ({ ...s, clients: s.clients.filter((x) => x.id !== c.id) }))}>
            Yes, remove
          </Button>
        ) : (
          <Button tone="danger" onClick={() => setConfirm(true)}>
            Remove
          </Button>
        )}
      </div>
    </motion.li>
  );
}

export function ClientsTab({ clients }: { clients: AdminClient[] }) {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  return (
    <Panel title="Clients on the line">
      <p className="mb-5 max-w-[640px] text-[0.92rem] leading-relaxed text-ink-soft">
        Put each client on the protocol and move them along as the work moves. Their private link shows the same metro map with their train at
        their station. The link carries its own data, so send a fresh one after an update.
      </p>
      <form
        className="mb-6 grid gap-3 rounded-[22px] border border-dashed border-line-strong p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          const c: AdminClient = { id: crypto.randomUUID(), name: name.trim(), company: company.trim(), station: 0, note: "", updated: today() };
          admin.set((s) => ({ ...s, clients: [c, ...s.clients] }));
          setName("");
          setCompany("");
        }}
      >
        <Field label="Client name" value={name} onChange={setName} max={60} />
        <Field label="Company" value={company} onChange={setCompany} max={60} />
        <Button tone="ink" type="submit" disabled={!name.trim()}>
          + Add client
        </Button>
      </form>
      {clients.length === 0 && <p className="text-ink-soft">No clients yet.</p>}
      <ul className="grid gap-4 lg:grid-cols-2">
        <AnimatePresence initial={false}>
          {clients.map((c) => (
            <ClientCard key={c.id} c={c} />
          ))}
        </AnimatePresence>
      </ul>
    </Panel>
  );
}
