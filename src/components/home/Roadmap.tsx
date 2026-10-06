"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { contact, roadmap, stationMessage, story, type StationId } from "@/content/site";
import { Arrow, Reveal, SectionLabel, SplitHeading, easeOut } from "../primitives";
import { ROADMAP_PICK } from "./FloatingCta";

/* ----------------------------------------------------------------------------
   A metro map of a project with Ali. The main line runs problem → growth; branch
   lines show where a project can join (Ali can jump on at any station). A train
   rides to whichever station is "you are here". Desktop draws the SVG map;
   phones get the same line, vertical.
---------------------------------------------------------------------------- */

type P = [number, number];
// main line, in map units (viewBox 1000 × 400): straight runs with 45° bends
const LINE: P[] = [
  [40, 300],
  [250, 300],
  [330, 220],
  [610, 220],
  [690, 140],
  [960, 140],
];
const AT: Record<StationId, P> = {
  discovery: [110, 300],
  definition: [210, 300],
  design: [390, 220],
  build: [480, 220],
  qa: [570, 220],
  launch: [760, 140],
  handover: [850, 140],
  grow: [930, 140],
};
// branch lines: from their own terminus to the station they join
const BRANCH: Record<string, { from: P; label: P; anchor: "start" | "end" }> = {
  fresh: { from: [110, 385], label: [124, 389], anchor: "start" },
  specs: { from: [370, 330], label: [358, 334], anchor: "end" },
  messy: { from: [570, 60], label: [584, 64], anchor: "start" },
  stuck: { from: [760, 300], label: [774, 304], anchor: "start" },
};
const LABEL_ABOVE = new Set<StationId>(["discovery", "definition", "launch", "handover", "grow"]);

const seg = (a: P, b: P) => Math.hypot(b[0] - a[0], b[1] - a[1]);
const CUM = LINE.reduce<number[]>((acc, p, i) => [...acc, i === 0 ? 0 : acc[i - 1] + seg(LINE[i - 1], p)], []);
const TOTAL = CUM[CUM.length - 1];
const pointAt = (d: number): P => {
  for (let i = 1; i < LINE.length; i++) {
    if (d <= CUM[i] || i === LINE.length - 1) {
      const t = Math.min(1, Math.max(0, (d - CUM[i - 1]) / (CUM[i] - CUM[i - 1])));
      return [LINE[i - 1][0] + (LINE[i][0] - LINE[i - 1][0]) * t, LINE[i - 1][1] + (LINE[i][1] - LINE[i - 1][1]) * t];
    }
  }
  return LINE[0];
};
// distance along the line of a point that sits on it
const distOf = (p: P) => {
  let best = 0;
  let bestErr = Infinity;
  for (let i = 1; i < LINE.length; i++) {
    const a = LINE[i - 1];
    const b = LINE[i];
    const L = seg(a, b);
    const t = Math.min(1, Math.max(0, ((p[0] - a[0]) * (b[0] - a[0]) + (p[1] - a[1]) * (b[1] - a[1])) / (L * L)));
    const q: P = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    const err = seg(p, q);
    if (err < bestErr) {
      bestErr = err;
      best = CUM[i - 1] + L * t;
    }
  }
  return best;
};
const PATH = `M${LINE.map((p) => p.join(" ")).join(" L")}`;
const ids = roadmap.stations.map((s) => s.id);

/** "Tell Ali where you are": the picked station plus a line, sent as a WhatsApp or email message. */
function SendStation({ station, n, joining, onEngage }: { station: string; n: number; joining?: string; onEngage: () => void }) {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [note, setNote] = useState("");
  const t = story.roadmap.send;
  const text = stationMessage({ name, company, station, n, total: roadmap.stations.length, joining, note });
  const wa = `${contact.whatsapp}?text=${encodeURIComponent(text)}`;
  const mail = `mailto:${contact.email}?subject=${encodeURIComponent(`${t.heading} ${station}`)}&body=${encodeURIComponent(text)}`;
  const field =
    "h-11 w-full rounded-full border border-line bg-card px-4 text-[0.9rem] text-ink outline-none transition-[border-color,box-shadow] duration-300 placeholder:text-muted focus:border-teal focus:shadow-[0_0_0_4px_var(--teal-tint)]";
  return (
    <Reveal id="tell-ali" className="mt-4 grid gap-6 rounded-[28px] border border-line bg-card p-6 md:p-8 lg:grid-cols-[1fr_1.4fr] lg:items-center">
      <div>
        <p className="eyebrow">{t.eyebrow}</p>
        <p className="mt-3 font-display text-[clamp(1.6rem,3vw,2.2rem)] leading-tight">
          {t.heading}{" "}
          <span className="relative inline-grid overflow-hidden align-bottom">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={station}
                className="col-start-1 row-start-1 font-display-italic text-teal"
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                exit={{ y: "-100%", opacity: 0 }}
                transition={{ duration: 0.4, ease: easeOut }}
              >
                {station}.
              </motion.span>
            </AnimatePresence>
          </span>
        </p>
        <p className="mt-3 text-[0.85rem] leading-relaxed text-muted">{t.fine}</p>
      </div>
      <form className="grid gap-3 sm:grid-cols-2" onFocus={onEngage} onSubmit={(e) => e.preventDefault()}>
        <input className={field} value={name} onChange={(e) => setName(e.target.value)} placeholder={t.name} aria-label={t.name} autoComplete="name" />
        <input className={field} value={company} onChange={(e) => setCompany(e.target.value)} placeholder={t.company} aria-label={t.company} autoComplete="organization" />
        <input className={`${field} sm:col-span-2`} value={note} onChange={(e) => setNote(e.target.value)} placeholder={t.note} aria-label={t.note} />
        <a
          href={wa}
          target="_blank"
          rel="noreferrer"
          className="press group flex h-12 items-center justify-center gap-2 rounded-full bg-ink px-5 text-[0.9rem] font-medium text-paper shadow-[var(--shadow-md)] hover:bg-teal"
        >
          {t.whatsapp}
          <span className="transition-transform duration-300 group-hover:translate-x-0.5">
            <Arrow />
          </span>
        </a>
        <a
          href={mail}
          className="press group flex h-12 items-center justify-center gap-2 rounded-full border border-line-strong px-5 text-[0.9rem] text-ink hover:border-teal hover:text-teal"
        >
          {t.email}
          <span className="transition-transform duration-300 group-hover:translate-x-0.5">
            <Arrow />
          </span>
        </a>
      </form>
    </Reveal>
  );
}

/** A client's private view (from Ali's dashboard): their train sits at their station. */
export type Track = { name: string; company: string; station: number; note: string; updated: string };

export function Roadmap({ track }: { track?: Track } = {}) {
  const ref = useRef<HTMLElement>(null);
  const live = useInView(ref, { margin: "-15% 0px" });
  const reduce = useReducedMotion();
  const home = track ? Math.min(Math.max(track.station, 0), ids.length - 1) : 0;
  const [active, setActive] = useState(home);
  const [join, setJoin] = useState<string | null>(null);
  const [pinned, setPinned] = useState(!!track);

  // the train rides to "you are here" on its own until the visitor picks a station
  useEffect(() => {
    if (!live || pinned || reduce) return;
    const id = setInterval(() => setActive((a) => (a + 1) % ids.length), 3200);
    return () => clearInterval(id);
  }, [live, pinned, reduce]);

  const d = useMotionValue(distOf(AT[ids[home]]));
  const x = useTransform(d, (v) => pointAt(v)[0]);
  const y = useTransform(d, (v) => pointAt(v)[1]);
  const travelled = useTransform(d, (v) => v / TOTAL);
  useEffect(() => {
    const target = distOf(AT[ids[active]]);
    // looping back to the start: hop instead of riding the line backwards
    if (reduce || target < d.get() - 1) {
      d.jump(target);
      return;
    }
    const c = animate(d, target, { duration: 1.1, ease: [0.65, 0, 0.35, 1] });
    return () => c.stop();
  }, [active, reduce, d]);

  const pick = (i: number, j: string | null = null) => {
    if (!track) dispatchEvent(new CustomEvent(ROADMAP_PICK, { detail: roadmap.stations[i].name }));
    setPinned(true);
    setJoin(j);
    setActive(i);
  };
  const station = roadmap.stations[active];
  const next = roadmap.stations[active + 1];
  const joining = roadmap.joins.find((j) => j.id === join);
  const s = story.roadmap;
  const t = story.track;
  // in a client's view, "you are here" only means their own station
  const here = !track || active === home;

  return (
    <section id={track ? "track" : "roadmap"} ref={ref} className={`mx-auto max-w-[1200px] px-5 sm:px-8 ${track ? "pb-20 pt-36 md:pb-28 md:pt-44" : "py-20 md:py-28"}`}>
      <SectionLabel index={track ? t.label : s.index}>{track ? [track.name, track.company].filter(Boolean).join(" · ") : s.label}</SectionLabel>
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <SplitHeading
          text={track ? t.heading : s.heading}
          italic={track ? t.italic : s.italic}
          className="max-w-[720px] font-display text-[clamp(2.1rem,4.6vw,3.6rem)] leading-[1.04]"
        />
        <Reveal>
          <p className="max-w-[360px] text-[0.98rem] leading-relaxed text-ink-soft">{track ? track.note || t.fallback : roadmap.lede}</p>
          {track?.updated && (
            <p className="mt-2 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-muted">
              {t.updated} <span className="tabular">{track.updated}</span>
            </p>
          )}
        </Reveal>
      </div>

      {!track && (
        <>
        {/* where are you now? (the branch lines, as buttons) */}
        <Reveal className="mt-10 flex flex-wrap items-center gap-2">
          <span className="eyebrow mr-2 text-muted">Where are you now?</span>
          {roadmap.joins.map((j) => {
            const on = join === j.id;
            return (
              <button
                key={j.id}
                onClick={() => pick(ids.indexOf(j.at), on ? null : j.id)}
                aria-pressed={on}
                className={`press flex h-10 items-center gap-2 rounded-full border px-4 text-[0.82rem] ${on ? "border-transparent bg-ink text-paper" : "border-line text-ink-soft hover:text-ink"}`}
              >
                <span className="size-2 rounded-full" style={{ background: j.color }} />
                {j.label}
              </button>
            );
          })}
        </Reveal>
          </>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_340px]">
        {/* the map (desktop) */}
        <Reveal className="hidden overflow-hidden rounded-[28px] border border-line bg-card p-3 md:block">
          <svg viewBox="0 0 1000 400" className="block h-auto w-full" role="group" aria-label="Project roadmap">
            <defs>
              <pattern id="rm-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M40 0H0V40" fill="none" stroke="var(--line)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="1000" height="400" rx="18" fill="url(#rm-grid)" opacity="0.6" />

            {/* branch lines: where a project can join */}
            {roadmap.joins.map((j, k) => {
              const b = BRANCH[j.id];
              const to = AT[j.at];
              const on = join === j.id;
              return (
                <g key={j.id} style={{ opacity: join && !on ? 0.25 : 1, transition: "opacity 400ms" }}>
                  <motion.path
                    d={`M${b.from.join(" ")} L${to.join(" ")}`}
                    stroke={j.color}
                    strokeWidth={on ? 9 : 7}
                    strokeLinecap="round"
                    fill="none"
                    strokeDasharray="1 0"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, delay: 0.9 + k * 0.08, ease: easeOut }}
                  />
                  <circle cx={b.from[0]} cy={b.from[1]} r="7" fill="var(--card)" stroke={j.color} strokeWidth="4" />
                  <text
                    x={b.label[0]}
                    y={b.label[1]}
                    textAnchor={b.anchor}
                    className="cursor-pointer fill-[var(--ink-soft)] font-mono text-[13px] uppercase tracking-[0.08em]"
                    onClick={() => pick(ids.indexOf(j.at), on ? null : j.id)}
                  >
                    {j.label}
                  </text>
                </g>
              );
            })}

            {/* the main line, and the part already travelled */}
            <motion.path
              d={PATH}
              stroke="var(--line-strong)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.4, ease: easeOut }}
            />
            <motion.path d={PATH} stroke="var(--teal)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none" style={{ pathLength: travelled }} />

            {/* stations */}
            {roadmap.stations.map((st, i) => {
              const [cx, cy] = AT[st.id];
              const passed = i < active;
              const here = i === active;
              const above = LABEL_ABOVE.has(st.id);
              return (
                <motion.g
                  key={st.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`${st.name}${here ? " (you are here)" : ""}`}
                  aria-pressed={here}
                  className="cursor-pointer outline-none"
                  onClick={() => pick(i)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      pick(i);
                    }
                  }}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.5 + i * 0.07, ease: easeOut }}
                >
                  {here && !reduce && (
                    <motion.circle
                      cx={cx}
                      cy={cy}
                      r="16"
                      fill="none"
                      stroke="var(--teal)"
                      strokeWidth="2"
                      animate={{ r: [14, 24], opacity: [0.7, 0] }}
                      transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                    />
                  )}
                  <circle cx={cx} cy={cy} r="20" fill="transparent" />
                  <circle cx={cx} cy={cy} r={here ? 12 : 10} fill={passed || here ? "var(--teal)" : "var(--card)"} stroke={passed || here ? "var(--teal)" : "var(--ink-soft)"} strokeWidth="4" style={{ transition: "all 400ms" }} />
                  <text
                    x={cx}
                    y={above ? cy - 26 : cy + 38}
                    textAnchor="middle"
                    className={`font-display text-[19px] transition-colors duration-300 ${here ? "fill-[var(--teal)]" : "fill-[var(--ink)]"}`}
                  >
                    {st.name}
                  </text>
                  <text x={cx} y={above ? cy - 46 : cy + 56} textAnchor="middle" className="fill-[var(--muted)] font-mono text-[11px]">
                    {String(i + 1).padStart(2, "0")}
                  </text>
                </motion.g>
              );
            })}

            {/* the train */}
            <motion.g style={{ x, y }}>
              <g transform="translate(-19 -11)">
                <rect width="38" height="22" rx="11" fill="var(--ink)" />
                <rect x="6" y="6" width="9" height="7" rx="2" fill="var(--sun)" />
                <rect x="18" y="6" width="9" height="7" rx="2" fill="var(--paper)" opacity="0.85" />
              </g>
            </motion.g>
          </svg>
        </Reveal>

        {/* the line, vertical (phones) */}
        <ol className="relative space-y-1 rounded-[24px] border border-line bg-card p-4 md:hidden">
          <span aria-hidden className="absolute bottom-7 left-[27px] top-7 w-[3px] rounded-full bg-line-strong" />
          {roadmap.stations.map((st, i) => {
            const here = i === active;
            const joinsHere = roadmap.joins.filter((j) => j.at === st.id);
            return (
              <li key={st.id}>
                <button onClick={() => pick(i)} aria-pressed={here} className="relative flex w-full items-center gap-4 rounded-xl px-1.5 py-2 text-left">
                  <span
                    className={`relative z-10 size-[18px] shrink-0 rounded-full border-[3px] transition-colors duration-300 ${i <= active ? "border-teal bg-teal" : "border-ink-soft bg-card"}`}
                  />
                  <span className={`font-display text-[1.15rem] ${here ? "text-teal" : "text-ink"}`}>{st.name}</span>
                  {joinsHere.map((j) => (
                    <span key={j.id} className="ml-auto size-2 rounded-full" style={{ background: j.color }} aria-hidden />
                  ))}
                  {here && <motion.span layoutId="rm-here" className="absolute inset-0 -z-0 rounded-xl bg-teal-tint" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                </button>
              </li>
            );
          })}
        </ol>

        {/* you are here */}
        <div className="relative min-h-[300px] overflow-hidden rounded-[28px] border border-line bg-paper-2 p-6" aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${station.id}-${join ?? ""}`}
              initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8, filter: "blur(4px)", transition: { duration: 0.15 } }}
              transition={{ duration: 0.4, ease: easeOut }}
              className="flex h-full flex-col"
            >
              <p className="eyebrow flex items-center gap-2">
                <span className="pulse-dot size-2 rounded-full bg-teal" />
                {here ? t.here : t.station} · <span className="tabular">{String(active + 1).padStart(2, "0")}/{roadmap.stations.length}</span>
              </p>
              <h3 className="mt-3 font-display text-[2rem] leading-tight">{station.name}</h3>
              {joining && (
                <p className="mt-3 rounded-2xl border border-line bg-card px-4 py-3 text-[0.88rem] leading-relaxed text-ink">
                  <span className="mr-1.5 inline-block size-2 rounded-full align-middle" style={{ background: joining.color }} />
                  <span className="font-medium">{joining.label}.</span> {joining.note}
                </p>
              )}
              <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-soft">{station.what}</p>
              <p className="mt-4 font-mono text-[0.66rem] uppercase tracking-[0.14em] text-muted">You get</p>
              <p className="mt-1 text-[0.95rem] text-ink">{station.get}</p>
              <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Also known as">
                {station.terms.map((t) => (
                  <li key={t} className="rounded-full border border-line bg-card px-2.5 py-0.5 font-mono text-[0.64rem] uppercase tracking-[0.08em] text-ink-soft">
                    {t}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-6">
                {next ? (
                  <button onClick={() => pick(active + 1)} className="press group flex items-center gap-2 text-[0.9rem] text-ink hover:text-teal">
                    <span className="link-draw">Next stop: {next.name}</span>
                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                      <Arrow />
                    </span>
                  </button>
                ) : (
                  <a href="#contact" className="press group flex items-center gap-2 text-[0.9rem] text-ink hover:text-teal">
                    <span className="link-draw">End of the line. Start the next one?</span>
                    <Arrow />
                  </a>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {track ? (
        <Reveal className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-[28px] border border-line bg-card p-6">
          <p className="text-[0.98rem] text-ink-soft">{t.question}</p>
          <a
            href={`${contact.whatsapp}?text=${encodeURIComponent(`Hi Ali, it's ${track.name}. About my product at ${roadmap.stations[home].name}: `)}`}
            target="_blank"
            rel="noreferrer"
            className="press group flex h-12 items-center gap-2 rounded-full bg-ink px-5 text-[0.9rem] font-medium text-paper shadow-[var(--shadow-md)] hover:bg-teal"
          >
            {t.talk}
            <span className="transition-transform duration-300 group-hover:translate-x-0.5">
              <Arrow />
            </span>
          </a>
        </Reveal>
      ) : (
        <SendStation station={station.name} n={active + 1} joining={joining?.label} onEngage={() => setPinned(true)} />
      )}
    </section>
  );
}

