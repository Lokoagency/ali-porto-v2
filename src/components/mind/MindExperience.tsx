"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { projects } from "@/content/projects";
import { contact, journey, person, principles, workingStyle } from "@/content/site";
import { ScrambleText } from "../ScrambleText";
import { houseAudio } from "./audio";
import { bindKeyboard, input, look } from "./input";
import type { Mode } from "./Player";
import type { RoomSignals } from "./Rooms";
import { focusStore, targetStore, useStore } from "./store";
import { PLAQUES, ROOMS, SPOTS, spotById, type RoomId, type SpotId } from "./world";

// three.js only runs in the browser
const Scene = dynamic(() => import("./Scene"), { ssr: false });

export type PostLink = { slug: string; title: string; excerpt: string; date: string };

const easeOut = [0.22, 1, 0.36, 1] as const;
const pop = {
  initial: { opacity: 0, y: 12, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: 8, filter: "blur(4px)", transition: { duration: 0.18 } },
  transition: { duration: 0.45, ease: easeOut },
};

type Item = { label: string; sub?: string; href?: string };
type Card = { eyebrow: string; title: string; body?: string; list?: Item[]; accent: string; foot?: string; cta?: Item };

const GOLD = "#c9a661";

/* -------------------------------- what each thing says -------------------------------- */

function inspectCard(id: SpotId, index: number, posts: PostLink[]): Card | null {
  switch (id) {
    case "laptop": {
      const p = projects[index];
      return {
        eyebrow: `Project ${index + 1} of ${projects.length} · ${p.status}`,
        title: p.name,
        body: p.header,
        list: [{ label: "Built with", sub: p.tools.join(" · ") }],
        accent: "#23988f",
        cta: { label: "Open the case study", href: `/work/${p.slug}` },
      };
    }
    case "plaques": {
      if (index === 0)
        return {
          eyebrow: "The wall of milestones",
          title: "Engraved, not exaggerated.",
          accent: GOLD,
          list: PLAQUES.map((p) => ({ label: p.title, sub: p.sub })),
        };
      const p = PLAQUES[index - 1];
      return { eyebrow: `Plaque ${index} of ${PLAQUES.length}`, title: p.title, body: p.detail, accent: GOLD, foot: p.sub };
    }
    case "shelves":
      return {
        eyebrow: "The bookshelf · his journal",
        title: "Notes from a tidy mind.",
        accent: GOLD,
        body: "Every shelf sorted by colour. The newest entries sit at eye level.",
        list: posts.slice(0, 5).map((p) => ({ label: p.title, sub: p.excerpt, href: `/journal/${p.slug}` })),
        cta: { label: "All journal entries", href: "/journal" },
      };
    case "phone":
      return {
        eyebrow: "The telephone",
        title: "Ring Ali.",
        accent: "#a9d3c0",
        list: [
          { label: "Book a Google Meet", sub: "Pick a time that suits you", href: contact.call },
          { label: "Email", sub: contact.email, href: `mailto:${contact.email}` },
          { label: "WhatsApp", sub: contact.whatsappLabel, href: contact.whatsapp },
          { label: "LinkedIn", sub: "linkedin.com/in/aaliadell", href: contact.linkedin },
        ],
      };
    case "hallMirror":
    case "bedMirror":
      return {
        eyebrow: "Have you met Ali?",
        title: "That's him.",
        body: person.intro,
        list: [{ label: person.roles.join(" · ") }],
        accent: GOLD,
      };
    case "diploma":
      return {
        eyebrow: "On the wall",
        title: "Translator. Builder. Product manager.",
        accent: GOLD,
        list: journey.map((j) => ({ label: `${j.role} · ${j.years}`, sub: j.lede })),
      };
    case "clock": {
      const now = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
      return {
        eyebrow: "The grandfather clock",
        title: `It's ${now}.`,
        body: "Ali works mornings, Monday to Friday — deep focus while the house is quiet — and he's offline at night.",
        accent: GOLD,
      };
    }
    case "tv":
      return {
        eyebrow: "Now showing",
        title: "Messy in. Clear out.",
        accent: "#7fe0cf",
        body: "The only programme this TV plays: an idea getting sorted into a roadmap, sprints, QA and docs.",
        cta: { label: "Watch it on the site", href: "/#process" },
      };
    case "fridge":
      return {
        eyebrow: "Notes on the fridge",
        title: "House rules for every project.",
        accent: "#a9d3c0",
        list: workingStyle.map((w) => ({ label: w.title, sub: w.body })),
      };
    case "board":
      return {
        eyebrow: "The corkboard",
        title: "Goals, pinned up.",
        accent: GOLD,
        list: [
          { label: "Ship the rebuild ✓", sub: "Web, iOS, Android and admin — done" },
          { label: "Write the wiki ✓", sub: "So the team never needs to call" },
          { label: "Learn every new tool", sub: "Bubble first, but always adapting" },
          { label: "Next: your idea →", sub: "There's a key waiting for it" },
        ],
        cta: { label: "Bring Ali an idea", href: "/#contact" },
      };
  }
  return null;
}

/** How many things you can flip through with A / D while inspecting. */
const pages = (id: SpotId) => (id === "laptop" ? projects.length : spotById(id).views?.length ?? 1);

/* ----------------------------------- small UI bits ----------------------------------- */

function Key({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <kbd
      className={`inline-flex h-6 min-w-6 items-center justify-center rounded-md border px-1.5 font-mono text-[0.68rem] shadow-[inset_0_-2px_0_rgba(0,0,0,0.25)] ${dark ? "border-black/20 bg-black/10 text-[#2a1d0c]" : "border-white/25 bg-white/10 text-[#f3ead6]"}`}
    >
      {children}
    </kbd>
  );
}

function Joystick() {
  const base = useRef<HTMLDivElement>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const move = (e: React.PointerEvent) => {
    const r = base.current!.getBoundingClientRect();
    let x = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    let y = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    const l = Math.hypot(x, y);
    if (l > 1) {
      x /= l;
      y /= l;
    }
    input.joy.x = x;
    input.joy.y = -y;
    setKnob({ x, y });
  };
  const end = () => {
    input.joy.x = input.joy.y = 0;
    setKnob({ x: 0, y: 0 });
  };
  return (
    <div
      ref={base}
      data-ui
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        move(e);
      }}
      onPointerMove={(e) => e.buttons && move(e)}
      onPointerUp={end}
      onPointerCancel={end}
      className="pointer-events-auto relative size-28 touch-none rounded-full border border-white/20 bg-black/25 backdrop-blur-md"
    >
      <div
        className="absolute left-1/2 top-1/2 size-12 rounded-full bg-[#f3ead6]/80 shadow-lg"
        style={{ transform: `translate(calc(-50% + ${knob.x * 32}px), calc(-50% + ${knob.y * 32}px))` }}
      />
    </div>
  );
}

function CardView({ card, onClose }: { card: Card; onClose: () => void }) {
  return (
    <motion.aside
      key={card.title}
      {...pop}
      data-ui
      className="pointer-events-auto relative max-h-[72svh] w-full max-w-[400px] overflow-y-auto rounded-[22px] border border-[#c9a661]/30 bg-[#17120d]/88 p-6 shadow-2xl backdrop-blur-xl"
    >
      <span className="absolute inset-x-0 top-0 h-[3px]" style={{ background: card.accent }} />
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full text-[#f3ead6]/60 transition-colors hover:bg-white/10 hover:text-[#f3ead6]"
      >
        ×
      </button>
      <p className="pr-8 font-mono text-[0.64rem] uppercase tracking-[0.16em]" style={{ color: card.accent }}>
        {card.eyebrow}
      </p>
      <h2 className="mt-3 font-display text-[1.7rem] leading-tight">
        <ScrambleText text={card.title} duration={650} wrap />
      </h2>
      {card.body && <p className="mt-3 text-[0.92rem] leading-relaxed text-[#f3ead6]/75">{card.body}</p>}
      {card.list && (
        <ul className="mt-4 space-y-1">
          {card.list.map((it, i) => {
            const inner = (
              <>
                <span className="block text-[0.92rem] text-[#f3ead6]">{it.label}</span>
                {it.sub && <span className="mt-0.5 block text-[0.8rem] leading-snug text-[#f3ead6]/55">{it.sub}</span>}
              </>
            );
            return (
              <motion.li key={it.label} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12 + i * 0.05, duration: 0.35, ease: easeOut }}>
                {it.href ? (
                  <a
                    href={it.href}
                    target={it.href.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer"
                    className="group flex items-start justify-between gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-white/10"
                  >
                    <span>{inner}</span>
                    <span className="mt-0.5 text-[#c9a661] transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </a>
                ) : (
                  <div className="rounded-xl px-3 py-2">{inner}</div>
                )}
              </motion.li>
            );
          })}
        </ul>
      )}
      {card.cta?.href && (
        <a
          href={card.cta.href}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#c9a661] px-4 py-2 text-[0.85rem] font-medium text-[#2a1d0c] transition-colors hover:bg-[#e2c27a]"
        >
          {card.cta.label} →
        </a>
      )}
      {card.foot && <p className="mt-4 border-t border-white/10 pt-3 font-display-italic text-[#c9a661]">{card.foot}</p>}
    </motion.aside>
  );
}

const noop = () => () => {};

/* ------------------------------------ experience ------------------------------------ */

export function MindExperience({ posts }: { posts: PostLink[] }) {
  const [ready, setReady] = useState(false);
  const [started, setStarted] = useState(false);
  const [mode, setMode] = useState<Mode>({ kind: "walk" });
  const [room, setRoom] = useState<RoomId>("hall");
  const [toast, setToast] = useState<Card | null>(null);
  const [locked, setLocked] = useState(false);
  // sound is opt-in; the choice is remembered per visitor
  const [muted, setMuted] = useState(() => {
    try {
      return localStorage.getItem("mind-sound") !== "on";
    } catch {
      return true;
    }
  });
  const toggleSound = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      houseAudio.setMuted(next);
      try {
        localStorage.setItem("mind-sound", next ? "off" : "on");
      } catch {}
      return next;
    });
  }, []);
  const [sens, setSens] = useState(() => {
    // remembered per visitor; falls back quietly where storage is blocked
    try {
      const v = Number(localStorage.getItem("mind-sens"));
      if (v >= 0.4 && v <= 2.5) {
        input.sensitivity = v;
        return v;
      }
    } catch {}
    return 1;
  });
  const [signals, setSignals] = useState<RoomSignals>({ record: false, globeAt: 0, kettleAt: 0 });
  const [hint, setHint] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  // dev only: ?nolock lets automated previews (which cannot capture the mouse) play without pausing
  const [devFree] = useState(() => process.env.NODE_ENV !== "production" && typeof location !== "undefined" && location.search.includes("nolock"));
  const onStand = useCallback(() => setMode({ kind: "walk" }), []);
  const onReady = useCallback(() => setReady(true), []);
  const section = useRef<HTMLElement>(null);
  const touchLook = useRef<{ id: number; x: number; y: number } | null>(null);
  const touch = useSyncExternalStore(noop, () => matchMedia("(pointer: coarse)").matches, () => false);
  const target = useStore(targetStore);

  useEffect(() => bindKeyboard(), []);
  useEffect(() => {
    return () => {
      input.enabled = false;
      input.yaw = 0;
      input.pitch = -0.05;
      targetStore.set(null);
      focusStore.set(null);
      houseAudio.stop();
    };
  }, []);

  // while paused, keys do nothing (and nothing stays "held")
  useEffect(() => {
    const paused = started && mode.kind !== "inspect" && (touch ? menuOpen : !locked && !devFree);
    input.enabled = started && !paused;
    if (paused) input.keys.clear();
  }, [started, mode.kind, touch, menuOpen, locked, devFree]);

  // game-style mouse look via pointer lock
  useEffect(() => {
    const onChange = () => setLocked(document.pointerLockElement === section.current);
    const onMove = (e: MouseEvent) => {
      if (document.pointerLockElement === section.current) look(e.movementX, e.movementY);
    };
    document.addEventListener("pointerlockchange", onChange);
    document.addEventListener("mousemove", onMove);
    return () => {
      document.removeEventListener("pointerlockchange", onChange);
      document.removeEventListener("mousemove", onMove);
    };
  }, []);

  const lock = useCallback(() => {
    if (touch || !section.current || document.pointerLockElement) return;
    try {
      const p = section.current.requestPointerLock() as unknown as Promise<void> | undefined;
      p?.catch?.(() => {});
    } catch {}
  }, [touch]);
  const unlock = () => {
    if (document.pointerLockElement) document.exitPointerLock();
  };

  const start = useCallback(() => {
    input.enabled = true;
    houseAudio.setMuted(muted);
    houseAudio.start();
    setStarted(true);
    lock();
    setTimeout(() => setHint(false), 9000);
  }, [lock, muted]);

  const showToast = useCallback((c: Card) => {
    setToast(c);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 7000);
    return () => clearTimeout(t);
  }, [toast]);

  const exitInspect = useCallback(() => {
    focusStore.set(null);
    // closing the laptop leaves you sitting at the desk; everything else puts you back on your feet
    setMode((m) => {
      const back = m.kind === "inspect" ? spotById(m.spot).seatedAt : undefined;
      return back ? { kind: "seat", spot: back } : { kind: "walk" };
    });
    lock();
  }, [lock]);

  const interact = useCallback(
    (id: SpotId | null) => {
      if (!id) return;
      const spot = spotById(id);
      if (spot.kind === "inspect") {
        focusStore.set({ id, index: 0 });
        setMode({ kind: "inspect", spot: id, view: 0 });
        setToast(null);
        unlock(); // a cursor, so the card's links are clickable
        return;
      }
      if (spot.kind === "seat") {
        setMode({ kind: "seat", spot: id });
        if (id === "bed")
          showToast({ eyebrow: "The bedroom", title: "Offline at night.", body: "Rested people ship better products. The laptop stays in the study.", accent: "#3f6b67" });
        else if (id === "desk")
          showToast({
            eyebrow: "The desk",
            title: "Where the sorting happens.",
            body: "Look at the laptop and press E to go through his work. And glance left: someone's in the mirror.",
            accent: "#2f6b66",
          });
        else setToast(null);
        return;
      }
      switch (id) {
        case "globe":
          setSignals((s) => ({ ...s, globeAt: performance.now() }));
          return showToast({
            eyebrow: "The globe",
            title: "Carrying meaning across.",
            body: "Arabic ↔ English for four years, then a media company in Dubai, then products. Same job every time: understand what one side needs, and make sure the other side gets it.",
            accent: "#2f6b66",
          });
        case "fire":
          return showToast({ eyebrow: "By the fire · how Ali builds", title: "Warm, but systematic.", list: principles.map((p) => ({ label: p.title, sub: p.body })), accent: "#ff9a4a" });
        case "record": {
          const playing = !signals.record;
          setSignals((s) => ({ ...s, record: playing }));
          houseAudio.setRecord(playing);
          return playing
            ? showToast({ eyebrow: "Side A · now playing", title: "Calm, clear, no surprises.", body: "Press E again to lift the needle.", accent: "#f0c45e" })
            : setToast(null);
        }
        case "kettle":
          setSignals((s) => ({ ...s, kettleAt: performance.now() }));
          houseAudio.ding();
          return showToast({
            eyebrow: "The kettle",
            title: "Mornings are for deep work.",
            body: "Monday to Friday the kettle goes on early and the focused work happens before noon.",
            accent: "#a9d3c0",
          });
      }
    },
    [showToast, signals.record],
  );

  // keys: E interact · A/D browse while inspecting · E/Esc/S leave
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (!started) {
        if (k === "enter") start();
        return;
      }
      if (mode.kind === "inspect") {
        const n = pages(mode.spot);
        if ((k === "d" || k === "arrowright") && n > 1) {
          const view = (mode.view + 1) % n;
          setMode({ ...mode, view });
          focusStore.set({ id: mode.spot, index: view });
        } else if ((k === "a" || k === "arrowleft") && n > 1) {
          const view = (mode.view - 1 + n) % n;
          setMode({ ...mode, view });
          focusStore.set({ id: mode.spot, index: view });
        } else if (k === "e" || k === "escape" || k === "s" || k === "backspace") {
          exitInspect();
        }
        return;
      }
      if (k === "m") toggleSound();
      if (k === "e") interact(targetStore.get());
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [started, mode, interact, exitInspect, start, toggleSound]);

  const card = mode.kind === "inspect" ? inspectCard(mode.spot, mode.view, posts) : null;
  const prompt = target ? SPOTS.find((s) => s.id === target)?.label : null;
  const roomName = ROOMS.find((r) => r.id === room)?.name ?? "";
  const paused = started && mode.kind !== "inspect" && (touch ? menuOpen : !locked && !devFree);
  const browse = mode.kind === "inspect" && pages(mode.spot) > 1;

  return (
    <section
      ref={section}
      className="relative h-[100svh] select-none overflow-hidden bg-[#0b0907] text-[#f3ead6]"
      aria-label="A deep dive into Ali's mind — a retro home you can walk around"
      onMouseDown={(e) => {
        if (!started || (e.target as HTMLElement).closest("[data-ui]")) return;
        if (locked && e.button === 0 && mode.kind !== "inspect") interact(targetStore.get());
      }}
      onTouchStart={(e) => {
        if (!started) return;
        const t = Array.from(e.changedTouches).find((t) => t.clientX > innerWidth * 0.45 && !(t.target as HTMLElement).closest("[data-ui]"));
        if (t) touchLook.current = { id: t.identifier, x: t.clientX, y: t.clientY };
      }}
      onTouchMove={(e) => {
        const tl = touchLook.current;
        if (!tl) return;
        const t = Array.from(e.changedTouches).find((t) => t.identifier === tl.id);
        if (!t) return;
        look((t.clientX - tl.x) * 1.4, (t.clientY - tl.y) * 1.4);
        tl.x = t.clientX;
        tl.y = t.clientY;
      }}
      onTouchEnd={() => (touchLook.current = null)}
    >
      <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: ready ? 1 : 0 }} transition={{ duration: 1.4 }}>
        <Scene
          enabled={started}
          mode={mode}
          signals={signals}
          onRoom={setRoom}
          onStand={onStand}
          onReady={onReady}
        />
      </motion.div>

      <AnimatePresence>
        {!ready && (
          <motion.div className="absolute inset-0 flex flex-col items-center justify-center gap-4" exit={{ opacity: 0, transition: { duration: 0.6 } }}>
            <motion.div
              className="size-10 rounded-full border-2 border-[#c9a661]/30 border-t-[#c9a661]"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-[#c9a661]">Lighting the fire…</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------------- HUD ---------------- */}
      {started && (
        <div className="pointer-events-none absolute inset-0">
          {/* room name */}
          <AnimatePresence mode="wait">
            <motion.div key={room} {...pop} className="absolute left-6 top-5">
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-[#c9a661]">You&apos;re in</p>
              <p className="font-display text-[1.45rem] leading-tight drop-shadow">
                <ScrambleText text={roomName} duration={600} />
              </p>
            </motion.div>
          </AnimatePresence>

          {/* controls reminder, fades after a while */}
          <AnimatePresence>
            {hint && !touch && mode.kind === "walk" && (
              <motion.div
                {...pop}
                className="absolute right-6 top-5 flex items-center gap-3 rounded-full border border-white/15 bg-black/35 px-4 py-2 text-[0.72rem] text-[#f3ead6]/75 backdrop-blur-md"
              >
                <span className="flex items-center gap-1">
                  <Key>W</Key>
                  <Key>A</Key>
                  <Key>S</Key>
                  <Key>D</Key> walk
                </span>
                <span className="flex items-center gap-1">
                  <Key>Shift</Key> run
                </span>
                <span className="flex items-center gap-1">
                  <Key>E</Key> interact
                </span>
                <span className="flex items-center gap-1">
                  <Key>Esc</Key> menu
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            data-ui
            onClick={toggleSound}
            aria-label={muted ? "Turn sound on" : "Turn sound off"}
            title={muted ? "Sound off (M)" : "Sound on (M)"}
            className={`pointer-events-auto absolute bottom-6 left-6 flex size-10 items-center justify-center rounded-full border border-white/15 bg-black/35 text-[#f3ead6]/80 backdrop-blur-md transition-colors hover:text-[#f3ead6] ${touch && mode.kind === "walk" ? "hidden" : ""}`}
          >
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" stroke="none" />
              {muted ? <path d="M17 9l5 5M22 9l-5 5" /> : <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" />}
            </svg>
          </button>
          {touch && (
            <button
              data-ui
              onClick={() => setMenuOpen((o) => !o)}
              className="pointer-events-auto absolute right-5 top-5 flex size-11 items-center justify-center rounded-full border border-white/20 bg-black/35 backdrop-blur-md"
              aria-label="Menu"
            >
              ☰
            </button>
          )}

          {/* crosshair + prompt (also while seated, for whatever is within reach) */}
          {mode.kind !== "inspect" && (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <motion.div
                className="rounded-full border-[#f3ead6]"
                animate={target ? { width: 22, height: 22, borderWidth: 1.5, backgroundColor: "rgba(243,234,214,0)", opacity: 1 } : { width: 5, height: 5, borderWidth: 0, backgroundColor: "rgba(243,234,214,0.8)", opacity: 0.8 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                style={{ borderStyle: "solid", marginLeft: "auto", marginRight: "auto" }}
              />
              <AnimatePresence>
                {prompt && (
                  <motion.button
                    key={prompt}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, transition: { duration: 0.12 } }}
                    data-ui
                    onClick={() => interact(target)}
                    className="pointer-events-auto absolute left-1/2 top-8 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-black/45 py-1.5 pl-1.5 pr-4 text-[0.85rem] text-[#f3ead6] backdrop-blur-md"
                  >
                    <span className="flex size-7 items-center justify-center rounded-full bg-[#c9a661] font-mono text-[0.75rem] font-semibold text-[#2a1d0c]">E</span>
                    {prompt}
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          )}

          {mode.kind === "seat" && (
            <motion.button
              {...pop}
              data-ui
              onClick={onStand}
              className="pointer-events-auto absolute bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/45 px-4 py-2 text-[0.85rem] backdrop-blur-md transition-colors hover:bg-black/60"
            >
              Comfortable. {touch ? "Tap here" : "Move"} to get up.
            </motion.button>
          )}

          {/* inspect controls */}
          {mode.kind === "inspect" && (
            <motion.div
              {...pop}
              className="absolute bottom-7 left-1/2 flex -translate-x-1/2 items-center gap-4 whitespace-nowrap rounded-full border border-white/15 bg-black/45 px-4 py-2 text-[0.8rem] backdrop-blur-md"
            >
              {browse && (
                <span className="pointer-events-auto flex items-center gap-1.5" data-ui>
                  <button className="flex items-center gap-1" onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }))}>
                    <Key>A</Key> ‹
                  </button>
                  <span className="font-mono text-[0.7rem] text-[#f3ead6]/60 tabular">
                    {mode.view + 1}/{pages(mode.spot)}
                  </span>
                  <button className="flex items-center gap-1" onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "d" }))}>
                    › <Key>D</Key>
                  </button>
                </span>
              )}
              <button className="pointer-events-auto flex items-center gap-1.5" data-ui onClick={exitInspect}>
                <Key>E</Key> back
              </button>
            </motion.div>
          )}

          {touch && mode.kind === "walk" && (
            <div className="absolute bottom-6 left-6">
              <Joystick />
            </div>
          )}

          {/* cards */}
          <div className="absolute bottom-6 right-6 flex w-[min(400px,calc(100vw-3rem))] flex-col items-end gap-3">
            <AnimatePresence mode="wait">
              {card ? <CardView key={card.title} card={card} onClose={exitInspect} /> : toast ? <CardView key={toast.title} card={toast} onClose={() => setToast(null)} /> : null}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* ---------------- pause menu ---------------- */}
      <AnimatePresence>
        {paused && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black/55 px-5 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            data-ui
          >
            <motion.div {...pop} className="w-full max-w-[380px] rounded-[26px] border border-[#c9a661]/30 bg-[#17120d]/92 p-7 shadow-2xl">
              <p className="font-mono text-[0.64rem] uppercase tracking-[0.22em] text-[#c9a661]">Paused</p>
              <h2 className="mt-2 font-display text-[2rem] leading-tight">Ali&apos;s house</h2>
              <div className="mt-6 flex flex-col gap-2.5">
                <button
                  onClick={() => (touch ? setMenuOpen(false) : lock())}
                  className="press flex h-12 items-center justify-between rounded-full bg-[#c9a661] px-6 text-[0.95rem] font-medium text-[#2a1d0c] hover:bg-[#e2c27a]"
                >
                  Resume
                  <Key dark>Click</Key>
                </button>
                <button
                  onClick={toggleSound}
                  className="press flex h-12 items-center justify-between rounded-full border border-white/15 px-6 text-[0.92rem] hover:bg-white/5"
                >
                  Sound
                  <span className="font-mono text-[0.75rem] text-[#c9a661]">{muted ? "Off" : "On"}</span>
                </button>
                <label className="flex h-12 items-center justify-between gap-4 rounded-full border border-white/15 px-6 text-[0.92rem]">
                  Mouse sensitivity
                  <input
                    type="range"
                    min={0.4}
                    max={2.5}
                    step={0.1}
                    value={sens}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setSens(v);
                      input.sensitivity = v;
                      try {
                        localStorage.setItem("mind-sens", String(v));
                      } catch {}
                    }}
                    className="w-28 accent-[#c9a661]"
                  />
                </label>
                <Link
                  href="/"
                  className="press flex h-12 items-center justify-between rounded-full border border-white/15 px-6 text-[0.92rem] hover:bg-white/5"
                >
                  Back to the site
                  <span className="text-[#c9a661]">←</span>
                </Link>
              </div>
              <p className="mt-6 text-[0.75rem] leading-relaxed text-[#f3ead6]/50">
                <Key>W</Key> <Key>A</Key> <Key>S</Key> <Key>D</Key> walk · <Key>Shift</Key> run · mouse to look · <Key>E</Key> or click to interact · <Key>A</Key>/<Key>D</Key> browse
                while inspecting
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------------- welcome ---------------- */}
      <AnimatePresence>
        {ready && !started && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/80 via-black/35 to-black/20 px-5"
            exit={{ opacity: 0, transition: { duration: 0.6 } }}
          >
            <motion.div {...pop} transition={{ duration: 0.8, delay: 0.4, ease: easeOut }} className="max-w-[560px] text-center">
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.24em] text-[#c9a661]">
                <ScrambleText text="A deep dive · a rainy night at Ali's" delay={700} />
              </p>
              <h1 className="mt-4 font-display text-[clamp(2.6rem,7vw,4.6rem)] leading-[0.98]">
                Welcome to <span className="font-display-italic text-[#c9a661]">Ali&apos;s mind.</span>
              </h1>
              <p className="mx-auto mt-5 max-w-[460px] text-[1rem] leading-relaxed text-[#f3ead6]/75">
                The fire&apos;s lit and the kettle&apos;s on. His work is on the laptop in the study, his journal is on the shelves, and the plaques tell the rest.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={start}
                  data-ui
                  className="press group inline-flex items-center gap-3 rounded-full bg-[#c9a661] py-3 pl-7 pr-3 text-[0.95rem] font-medium text-[#2a1d0c] shadow-[0_10px_40px_-10px_rgba(201,166,97,0.7)] hover:bg-[#e2c27a]"
                >
                  Come in
                  <span className="flex size-8 items-center justify-center rounded-full bg-black/10 transition-transform duration-300 group-hover:translate-x-0.5">→</span>
                </button>
                <Link href="/" data-ui className="rounded-full border border-white/20 px-5 py-3 text-[0.9rem] text-[#f3ead6]/80 hover:bg-white/5">
                  Back to the site
                </Link>
              </div>
              <p className="mt-6 flex flex-wrap items-center justify-center gap-2 text-[0.75rem] text-[#f3ead6]/55">
                {touch ? (
                  "Left thumb to walk · swipe the right side to look · tap prompts to interact"
                ) : (
                  <>
                    <Key>W</Key>
                    <Key>A</Key>
                    <Key>S</Key>
                    <Key>D</Key> walk · mouse to look · <Key>E</Key> interact · <Key>M</Key> sound (off by default) · <Key>Esc</Key> menu
                  </>
                )}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
