"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "motion/react";
import { ideaFragments, lanes, sorterStages, story } from "@/content/site";
import { easeOut } from "../primitives";
import { SortText } from "../SortText";

/* ----------------------------------------------------------------------------
   Geometry lives in "flow space": u runs along the flow (chaos → board),
   v runs across it (which lane). Desktop flows left→right, mobile top→bottom.
   Everything is a pure function of scroll progress, so scrolling back un-sorts.
---------------------------------------------------------------------------- */

const GATES = [0.36, 0.47, 0.58];
const GATE_LABELS = ["Listen", "Scope", "Structure"];
const CHIP_U = 0.655;
const SP = 13; // dot grid spacing (px)
const ACROSS = 5; // dot rows per lane

const clamp = (n: number, a = 0, b = 1) => Math.min(b, Math.max(a, n));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type RGB = [number, number, number];
const hex = (h: string): RGB => {
  const s = h.trim().replace("#", "");
  const n = parseInt(s.length === 3 ? s.replace(/./g, "$&$&") : s, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const mix = (a: RGB, b: RGB, t: number): RGB => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

type Particle = {
  lane: number;
  noise: boolean;
  u0: number;
  v0: number;
  delay: number;
  phase: number;
  r: number;
  slot: number;
  fall: number;
};

const chaosChips = [
  [0.02, 0.06, -9], [0.17, 0.16, 7], [0.06, 0.32, 4], [0.2, 0.42, -6], [0.01, 0.55, -3],
  [0.15, 0.62, 10], [0.05, 0.78, -7], [0.19, 0.84, 5], [0.11, 0.95, -4], [0.24, 0.25, 12],
] as const;

/** Stage boundaries in scroll progress, and where a step click lands (stage fully played). */
const STAGES = [
  [0, 0.14],
  [0.14, 0.34],
  [0.34, 0.5],
  [0.5, 0.68],
  [0.68, 1],
] as const;
const STAGE_TARGET = [0.04, 0.3, 0.47, 0.64, 0.94];

function StepSegment({ progress, i, active, done, onClick }: { progress: MotionValue<number>; i: number; active: boolean; done: boolean; onClick: () => void }) {
  const fill = useTransform(progress, [...STAGES[i]], [0, 1]);
  return (
    <button
      onClick={onClick}
      aria-current={active ? "step" : undefined}
      title={sorterStages[i].label}
      className="group flex flex-1 flex-col gap-2 py-2 text-left"
    >
      <span className="relative h-[3px] w-full overflow-hidden rounded-full bg-line-strong">
        <motion.span className="absolute inset-0 origin-left rounded-full bg-teal" style={{ scaleX: fill }} />
      </span>
      <span
        className={`font-mono text-[0.62rem] uppercase tracking-[0.12em] transition-colors duration-300 ${active ? "text-teal" : done ? "text-ink-soft" : "text-muted group-hover:text-ink-soft"}`}
      >
        0{i + 1}
      </span>
      <span className="sr-only">: {sorterStages[i].label} (jump to this step)</span>
    </button>
  );
}

export function IdeaSorter() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chipRefs = useRef<(HTMLDivElement | null)[]>([]);
  const gateRefs = useRef<(HTMLDivElement | null)[]>([]);
  const laneLabelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [stage, setStage] = useState(0);
  const countRefs = useRef<(HTMLElement | null)[]>([]);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const i = STAGES.findIndex(([, end]) => p < end);
    setStage(i === -1 ? 4 : i);
  });

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const stageEl = stageRef.current!;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    let W = 0, H = 0, mobile = false;
    let rect = { l: 0, r: 0, t: 0, b: 0 };
    let particles: Particle[] = [];
    let laneCounts = [0, 0, 0, 0];
    let palette = { muted: hex("#7b8c8b"), soft: hex("#9cc9c2"), card: hex("#fbf9f5"), line: hex("#0f2e2f"), lanes: [] as RGB[] };

    const readPalette = () => {
      const cs = getComputedStyle(document.documentElement);
      const v = (n: string) => hex(cs.getPropertyValue(n) || "#000");
      palette = {
        muted: v("--muted"),
        soft: v("--teal-soft"),
        card: v("--card"),
        line: v("--ink"),
        lanes: [v("--teal"), v("--teal-bright"), v("--leaf"), v("--sun")],
      };
    };

    const build = () => {
      const rand = rng(7);
      const n = mobile ? 150 : 260;
      particles = [];
      laneCounts = [0, 0, 0, 0];
      for (let i = 0; i < n; i++) {
        const lane = i % 4;
        const noise = rand() < 0.3;
        // cluster the chaos a little so it reads as "piles of thoughts"
        const cluster = Math.floor(rand() * 5);
        const u0 = clamp(0.02 + cluster * 0.05 + (rand() - 0.5) * 0.16, 0.0, 0.29);
        const v0 = clamp(rand() * 0.95 + 0.025);
        particles.push({
          lane,
          noise,
          u0,
          v0,
          delay: rand() * 0.16,
          phase: rand() * Math.PI * 2,
          r: mobile ? 1.6 + rand() * 1.2 : 1.8 + rand() * 1.6,
          slot: noise ? -1 : laneCounts[lane]++,
          fall: rand() < 0.5 ? -1 : 1,
        });
      }
    };

    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      W = stageEl.clientWidth;
      H = stageEl.clientHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const wasMobile = mobile;
      mobile = W < 768;
      // the stage starts below the heading block (it is taller on short or mid-width screens),
      // leaving room for the gate labels that sit above the gates
      const head = headRef.current;
      const below = head ? head.offsetTop + head.offsetHeight : 0;
      const b = H * (mobile ? 0.97 : 0.95);
      const t = Math.min(Math.max(H * (mobile ? 0.48 : 0.38), below + (mobile ? 40 : 52)), b - 160);
      rect = mobile ? { l: W * 0.06, r: W * 0.94, t, b } : { l: W * 0.04, r: W * 0.96, t, b };
      if (wasMobile !== mobile || particles.length === 0) build();
    };

    const map = (u: number, v: number): [number, number] =>
      mobile
        ? [rect.l + v * (rect.r - rect.l), rect.t + u * (rect.b - rect.t)]
        : [rect.l + u * (rect.r - rect.l), rect.t + v * (rect.b - rect.t)];
    // offset in (along, across) pixels
    const off = (p: [number, number], along: number, across: number): [number, number] =>
      mobile ? [p[0] + across, p[1] + along] : [p[0] + along, p[1] + across];

    const laneV = (k: number) => (k + 0.5) / 4;
    const alongCount = (k: number) => Math.ceil(laneCounts[k] / ACROSS);

    const gridPos = (lane: number, slot: number): [number, number] => {
      const n = alongCount(lane);
      const col = Math.floor(slot / ACROSS);
      const row = slot % ACROSS;
      const end = map(1, laneV(lane));
      return off(end, -(n - col - 0.5) * SP, (row - (ACROSS - 1) / 2) * SP);
    };

    const roundRect = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    };

    let raf = 0;
    const draw = (now: number) => {
      const p = scrollYProgress.get();
      const time = reduce ? 0 : now / 1000;
      ctx.clearRect(0, 0, W, H);

      const settleAll = smooth(0.6, 0.86, p);
      const bandSpan = (mobile ? rect.r - rect.l : rect.b - rect.t) / 4;

      // The board waits as a dashed outline, then fills in as things settle
      for (let k = 0; k < 4; k++) {
        const a = smooth(0.58 + k * 0.03, 0.8 + k * 0.03, p);
        const startU = mobile ? 0.68 : CHIP_U - 0.012;
        const [sx, sy] = map(startU, laneV(k));
        const [ex] = map(1, laneV(k));
        if (mobile) {
          const w = bandSpan * 0.88;
          roundRect(sx - w / 2, sy - 8, w, rect.b - sy + 16, 14);
        } else {
          const h = bandSpan * 0.86;
          roundRect(sx - 10, sy - h / 2, ex - sx + 20, h, 16);
        }
        if (a < 1) {
          ctx.globalAlpha = 1 - a;
          ctx.setLineDash([4, 6]);
          ctx.strokeStyle = `rgba(${palette.line.join(",")},0.16)`;
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.setLineDash([]);
        }
        if (a > 0) {
          ctx.globalAlpha = a;
          ctx.fillStyle = `rgba(${palette.card.join(",")},0.75)`;
          ctx.fill();
          ctx.strokeStyle = `rgba(${palette.line.join(",")},0.08)`;
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;

      let cut = 0;
      let sorted = 0;
      for (const pt of particles) {
        const t = ease(clamp((p - 0.1 - pt.delay) / 0.5));
        const s = pt.noise ? 0 : ease(clamp((p - 0.6 - pt.delay * 0.6) / 0.2));
        const wob = (1 - t) * (reduce ? 0 : 1);

        // travel toward the lane entry
        const u = lerp(pt.u0, CHIP_U - 0.02, t) + Math.sin(time * 0.7 + pt.phase) * 0.012 * wob;
        const converge = smooth(0.15, 0.85, t);
        let v =
          lerp(pt.v0, laneV(pt.lane) + Math.sin(pt.phase) * 0.07, converge) +
          Math.cos(time * 0.6 + pt.phase * 1.3) * 0.014 * wob +
          Math.sin(t * Math.PI) * 0.03 * Math.sin(pt.phase * 3);

        let alpha = 0.85;
        let radius = pt.r;

        // the Scope gate drops what doesn't belong
        if (pt.noise) {
          const k = smooth(GATES[1] - 0.02, GATES[1] + 0.07, u);
          alpha *= 1 - k;
          v += k * k * 0.18 * pt.fall;
          radius *= 1 - k * 0.6;
          if (k > 0.6) cut++;
          if (alpha < 0.02) continue;
        }

        // colour: grey thought → soft teal → lane colour
        const c1 = smooth(GATES[0] - 0.02, GATES[0] + 0.03, u);
        const c2 = smooth(GATES[2] - 0.02, GATES[2] + 0.04, u);
        let col = mix(mix(palette.muted, palette.soft, c1), palette.lanes[pt.lane], c2);

        let [x, y] = map(u, v);
        if (s > 0.6) sorted++;
        if (s > 0) {
          const [gx, gy] = gridPos(pt.lane, pt.slot);
          x = lerp(x, gx, s);
          y = lerp(y, gy, s);
          radius = lerp(radius, mobile ? 2.4 : 2.9, s);
          alpha = lerp(alpha, 1, s);
          col = palette.lanes[pt.lane];
        }

        ctx.globalAlpha = alpha;
        ctx.fillStyle = `rgb(${col[0] | 0},${col[1] | 0},${col[2] | 0})`;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        if (u < GATES[0] && !reduce) {
          // faint comet tail while drifting through the funnel
          ctx.globalAlpha = alpha * 0.18 * t;
          ctx.beginPath();
          ctx.arc(x - (mobile ? 0 : 6), y - (mobile ? 6 : 0), radius * 0.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      // Gates — glow while particles pass through them
      GATES.forEach((g, i) => {
        const el = gateRefs.current[i];
        if (!el) return;
        const [x, y] = map(g, 0);
        const len = mobile ? rect.r - rect.l : rect.b - rect.t;
        const lit = smooth(0.1 + i * 0.08, 0.2 + i * 0.08, p) * (1 - smooth(0.62, 0.8, p));
        el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        el.style.setProperty("--len", `${len}px`);
        el.style.setProperty("--lit", lit.toFixed(3));
        el.style.opacity = String(1 - settleAll * 0.75);
      });

      // Lane labels
      lanes.forEach((_, k) => {
        const el = laneLabelRefs.current[k];
        if (!el) return;
        const a = smooth(0.62 + k * 0.03, 0.78 + k * 0.03, p);
        const n = alongCount(k);
        const [ax, ay] = mobile
          ? off(map(0.68, laneV(k)), 10, 0)
          : off(map(1, laneV(k)), -n * SP - 2, -((ACROSS + 1) / 2) * SP - 8);
        el.style.transform = `translate3d(${ax}px, ${ay}px, 0) translate(${mobile ? "-50%" : "0"}, -50%)`;
        el.style.opacity = (0.35 + a * 0.65).toFixed(3);
      });

      // Idea fragments
      const laneSeen = [0, 0, 0, 0];
      const laneTotal = [0, 0, 0, 0];
      ideaFragments.forEach((f) => laneTotal[lanes.indexOf(f.lane)]++);
      ideaFragments.forEach((f, i) => {
        const el = chipRefs.current[i];
        if (!el) return;
        const k = lanes.indexOf(f.lane);
        const m = laneSeen[k]++;
        const [cu, cvRaw, rot] = chaosChips[i];
        // keep chips clear of the screen edges on narrow viewports (they centre on their point)
        const cv = mobile ? 0.28 + cvRaw * 0.44 : cvRaw;
        const d = (i % 5) * 0.025;
        const t = ease(clamp((p - 0.12 - d) / 0.46));
        const wob = (1 - t) * (reduce ? 0 : 1);
        const chipSpacing = mobile ? 0 : Math.min(30, (bandSpan * 0.8) / laneTotal[k]);
        const targetV = laneV(k);
        const u = lerp(cu, CHIP_U, t) + Math.sin(time * 0.5 + i) * 0.008 * wob;
        const v = lerp(cv, targetV, smooth(0.1, 0.9, t)) + Math.cos(time * 0.4 + i * 2) * 0.01 * wob;
        let [x, y] = map(u, v);
        [x, y] = off([x, y], 0, (m - (laneTotal[k] - 1) / 2) * chipSpacing * smooth(0.5, 1, t));
        const r = rot * (1 - smooth(GATES[0], GATES[1], u)) + (reduce ? 0 : Math.sin(time + i) * 2 * wob);
        const clean = smooth(GATES[2] - 0.03, GATES[2] + 0.04, u);
        el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(${mobile ? "-50%" : "0"}, -50%) rotate(${r}deg)`;
        el.style.setProperty("--clean", clean.toFixed(3));
        el.style.opacity = mobile ? String(1 - smooth(GATES[0], GATES[1], u)) : "1";
      });

      // live tally — only touch the DOM when a number actually changes
      [particles.length, cut, sorted].forEach((n, i) => {
        const el = countRefs.current[i];
        if (el && el.textContent !== String(n)) el.textContent = String(n);
      });

      raf = requestAnimationFrame(draw);
    };

    readPalette();
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(stageEl);
    const mo = new MutationObserver(readPalette);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    // only animate while the section is on screen
    const io = new IntersectionObserver(([e]) => {
      cancelAnimationFrame(raf);
      if (e.isIntersecting) raf = requestAnimationFrame(draw);
    });
    io.observe(sectionRef.current!);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      mo.disconnect();
      io.disconnect();
    };
  }, [scrollYProgress]);

  return (
    <section id="process" ref={sectionRef} className="relative h-[320vh]" aria-label="How Ali turns a messy idea into a clear plan">
      <div ref={stageRef} className="sticky top-0 h-[100svh] overflow-hidden">
        {/* Header + stage narration */}
        <div ref={headRef} className="relative z-20 mx-auto flex max-w-[1200px] flex-col gap-5 px-5 pt-24 sm:px-8 md:flex-row md:items-end md:justify-between md:pt-28">
          <div>
            <p className="eyebrow mb-3">{story.problem.index} — {story.problem.label}</p>
            <h2 className="font-display text-[clamp(2rem,4.4vw,3.4rem)] leading-[1.02]">
              {story.problem.lead}{" "}
              <SortText text={story.problem.sort} className="font-display-italic text-teal" delay={450} loop={7500} />
            </h2>
          </div>

          <div className="w-full max-w-[460px]">
            <div className="mb-2 flex gap-1.5">
              {sorterStages.map((_, i) => (
                <StepSegment
                  key={i}
                  i={i}
                  progress={scrollYProgress}
                  active={stage === i}
                  done={stage > i}
                  onClick={() => {
                    const el = sectionRef.current!;
                    const y = el.offsetTop + STAGE_TARGET[i] * (el.offsetHeight - innerHeight);
                    if (window.__lenis) window.__lenis.scrollTo(y, { duration: 1.2 });
                    else scrollTo({ top: y, behavior: "smooth" });
                  }}
                />
              ))}
            </div>
            <div className="relative h-[4.6rem]">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={stage}
                  initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -8, filter: "blur(4px)", transition: { duration: 0.15 } }}
                  transition={{ duration: 0.45, ease: easeOut }}
                  className="absolute inset-0"
                >
                  <p className="font-display text-xl text-ink">{sorterStages[stage].label}</p>
                  <p className="mt-1 text-[0.9rem] leading-snug text-ink-soft">{sorterStages[stage].body}</p>
                </motion.div>
              </AnimatePresence>
            </div>
            {/* live tally of what the sorter is doing */}
            <dl className="mt-2 flex gap-5 font-mono text-[0.66rem] uppercase tracking-[0.1em] text-muted">
              {["Fragments", "Noise cut", "Sorted"].map((label, i) => (
                <div key={label} className="flex items-baseline gap-1.5">
                  <dt>{label}</dt>
                  <dd
                    ref={(el) => {
                      countRefs.current[i] = el;
                    }}
                    className={`tabular text-[0.8rem] ${i === 1 ? "text-sun" : i === 2 ? "text-teal" : "text-ink"}`}
                  >
                    0
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <canvas ref={canvasRef} className="absolute inset-0 z-0" aria-hidden />

        {/* Gates */}
        {GATE_LABELS.map((label, i) => (
          <div
            key={label}
            ref={(el) => {
              gateRefs.current[i] = el;
            }}
            aria-hidden
            className="pointer-events-none absolute left-0 top-0 z-10 will-change-transform"
          >
            <div
              className="absolute left-0 top-0 -translate-x-1/2 max-md:-translate-y-1/2 max-md:translate-x-0 max-md:rotate-0"
              style={{ height: "var(--len)" }}
            >
              <div
                className="h-full w-[10px] rounded-full border border-line-strong max-md:hidden"
                style={{
                  background:
                    "linear-gradient(180deg, transparent, color-mix(in oklab, var(--teal) calc(var(--lit) * 35%), transparent) 50%, transparent)",
                  boxShadow: "0 0 calc(var(--lit) * 28px) color-mix(in oklab, var(--teal) calc(var(--lit) * 60%), transparent)",
                  backdropFilter: "blur(6px)",
                }}
              />
            </div>
            <div
              className="absolute left-0 top-0 hidden h-[10px] -translate-y-1/2 rounded-full border border-line-strong max-md:block"
              style={{
                width: "var(--len)",
                background:
                  "linear-gradient(90deg, transparent, color-mix(in oklab, var(--teal) calc(var(--lit) * 35%), transparent) 50%, transparent)",
                boxShadow: "0 0 calc(var(--lit) * 22px) color-mix(in oklab, var(--teal) calc(var(--lit) * 60%), transparent)",
              }}
            />
            <span className="absolute -translate-x-1/2 -translate-y-[calc(100%+12px)] whitespace-nowrap font-mono text-[0.65rem] uppercase tracking-[0.16em] text-teal max-md:left-[calc(var(--len)+4px)] max-md:translate-x-[-100%] max-md:-translate-y-[calc(100%+8px)]">
              0{i + 2} {label}
            </span>
          </div>
        ))}

        {/* Lane labels */}
        {lanes.map((lane, k) => (
          <div
            key={lane}
            ref={(el) => {
              laneLabelRefs.current[k] = el;
            }}
            className="pointer-events-none absolute left-0 top-0 z-10 whitespace-nowrap font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ink-soft opacity-0"
          >
            <span
              className="mr-1.5 inline-block size-1.5 rounded-full align-middle"
              style={{ background: ["var(--teal)", "var(--teal-bright)", "var(--leaf)", "var(--sun)"][k] }}
            />
            {lane}
          </div>
        ))}

        {/* Idea fragments: raw thought → clean spec */}
        {ideaFragments.map((f, i) => (
          <div
            key={f.raw}
            ref={(el) => {
              chipRefs.current[i] = el;
            }}
            className={`pointer-events-none absolute left-0 top-0 z-10 will-change-transform ${i % 2 ? "max-md:hidden" : ""}`}
            style={{ ["--clean" as string]: 0 }}
          >
            <div className="grid text-[0.74rem] md:text-[0.78rem]">
              <span
                className="col-start-1 row-start-1 whitespace-nowrap rounded-lg border border-dashed border-line-strong bg-paper px-2.5 py-1.5 font-display-italic text-ink-soft"
                style={{ opacity: "calc(1 - var(--clean))" }}
              >
                {f.raw}
              </span>
              <span
                className="glass col-start-1 row-start-1 flex items-center gap-2 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-ink"
                style={{ opacity: "var(--clean)", transform: "scale(calc(0.92 + var(--clean) * 0.08))" }}
              >
                <span
                  className="size-1.5 shrink-0 rounded-full"
                  style={{ background: ["var(--teal)", "var(--teal-bright)", "var(--leaf)", "var(--sun)"][lanes.indexOf(f.lane)] }}
                />
                {f.clean}
              </span>
            </div>
          </div>
        ))}

        {/* Finale */}
        <AnimatePresence>
          {stage === 4 && (
            <motion.p
              initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              transition={{ duration: 0.7, delay: 0.3, ease: easeOut }}
              className="absolute left-5 top-[44%] z-20 font-display text-[clamp(1.5rem,2.6vw,2.2rem)] leading-tight md:bottom-[8%] md:left-[4%] md:top-auto md:max-w-[34%]"
            >
              Clear. Documented.
              <br />
              <span className="font-display-italic text-teal">Ready to build.</span>
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
