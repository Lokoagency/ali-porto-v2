"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import {
  animate,
  useInView,
  useReducedMotion,
  type AnimationOptions,
  type AnimationPlaybackControls,
  type DOMKeyframesDefinition,
} from "motion/react";

const SORT_EASE = [0.65, 0, 0.35, 1] as const;
const OUT_EASE = [0.22, 1, 0.36, 1] as const;
const MESSY = "blur(1.4px) saturate(0.15)";
const CLEAR = "blur(0px) saturate(1)";

type Slot = { x: number; w: number };

/** Shuffle the slots so (nearly) every letter starts somewhere other than its own place. */
function derange(ids: number[]) {
  const out = [...ids];
  for (let k = 0; k < 6; k++) {
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    if (out.filter((v, i) => v === ids[i]).length <= 1) break;
  }
  return new Map(ids.map((id, i) => [id, out[i]]));
}

/**
 * A phrase whose own letters start jumbled — muted, tilted, out of order — and then sort
 * themselves into place one by one, taking on their colour as they land. Once it reads
 * right, a hairline underline draws in. With `loop`, it gently re-jumbles and re-sorts.
 *
 * The real (kerned) text sets the layout and stays in the DOM for screen readers and
 * no-JS; the moving letters are pinned to where those glyphs sit, so nothing around the
 * phrase ever shifts.
 */
export function SortText({
  text,
  className,
  delay = 0,
  loop = 0,
  underline = true,
}: {
  text: string;
  className?: string;
  /** ms after it scrolls into view before the first sort */
  delay?: number;
  /** ms to hold the sorted phrase before jumbling it again; 0 = sort once */
  loop?: number;
  underline?: boolean;
}) {
  const box = useRef<HTMLSpanElement>(null);
  const ghost = useRef<HTMLSpanElement>(null);
  const baseline = useRef<HTMLSpanElement>(null);
  const layer = useRef<HTMLSpanElement>(null);
  const line = useRef<HTMLSpanElement>(null);
  const els = useRef<(HTMLSpanElement | null)[]>([]);
  const slots = useRef<Slot[]>([]);
  const phase = useRef<"idle" | "messy" | "sorted">("idle");
  const inView = useInView(box, { margin: "0px 0px -10% 0px" });
  const reduce = useReducedMotion();

  // Measure where each glyph really sits (kerning included) and pin the letters there.
  useLayoutEffect(() => {
    const el = box.current;
    const g = ghost.current;
    if (!el || !g) return;
    const measure = () => {
      const node = g.firstChild;
      if (!node) return;
      const rect = el.getBoundingClientRect();
      const scale = el.offsetWidth ? rect.width / el.offsetWidth : 1; // ignore ancestor transforms
      const range = document.createRange();
      let at = 0;
      slots.current = Array.from(text).map((ch) => {
        range.setStart(node, at);
        range.setEnd(node, at + ch.length);
        at += ch.length;
        const r = range.getBoundingClientRect();
        return { x: (r.left - rect.left) / scale, w: r.width / scale };
      });
      slots.current.forEach((s, i) => {
        const l = els.current[i];
        if (l) l.style.left = `${s.x}px`;
      });
      // the underline: from the first letter to the last one (not the full stop), just under the baseline
      const ln = line.current;
      const b = baseline.current;
      if (ln && b) {
        const size = parseFloat(getComputedStyle(el).fontSize) || 16;
        const letters = slots.current.filter((_, i) => /[\p{L}\p{N}]/u.test(Array.from(text)[i] ?? ""));
        const first = letters[0] ?? slots.current[0];
        const last = letters[letters.length - 1] ?? first;
        if (first && last) {
          ln.style.left = `${first.x}px`;
          ln.style.width = `${last.x + last.w - first.x}px`;
        }
        ln.style.top = `${(b.getBoundingClientRect().top - rect.top) / scale + size * 0.1}px`;
        ln.style.height = `${Math.max(2, size * 0.05)}px`;
      }
    };
    measure();
    document.fonts?.ready.then(measure);
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [text]);

  useEffect(() => {
    const el = box.current;
    if (!el || !inView) return;
    if (reduce) {
      // no motion: the plain text stays, already underlined
      if (underline && line.current) line.current.style.transform = "scaleX(1)";
      return;
    }
    const chars = Array.from(text);
    let alive = true;
    const running: AnimationPlaybackControls[] = [];
    const timers: ReturnType<typeof setTimeout>[] = [];
    const wait = (ms: number) => new Promise<void>((res) => timers.push(setTimeout(res, ms)));
    const run = (target: Element, keyframes: DOMKeyframesDefinition, options: AnimationOptions) => {
      const a = animate(target, keyframes, options);
      running.push(a);
      return a.finished;
    };
    const size = () => parseFloat(getComputedStyle(el).fontSize) || 16;
    const letters = () =>
      els.current.flatMap((l, i) => (l && chars[i]?.trim() ? [{ l, i }] : []));

    const scatter = async (instant: boolean) => {
      const s = slots.current;
      const fs = size();
      const to = derange(letters().map(({ i }) => i));
      phase.current = "messy";
      const jobs = letters().map(({ l, i }) => {
        const j = to.get(i) ?? i;
        const x = s[j] && s[i] ? s[j].x + s[j].w / 2 - (s[i].x + s[i].w / 2) : 0;
        const y = (Math.random() - 0.5) * 0.36 * fs;
        const rotate = (Math.random() - 0.5) * 24;
        return instant
          ? run(l, { x, y, rotate, opacity: 0.45, filter: MESSY }, { duration: 0 })
          : run(
              l,
              { x, y: [null, (i % 2 ? 0.26 : -0.26) * fs, y], rotate, opacity: 0.45, filter: MESSY },
              { duration: 0.6, ease: [0.45, 0, 0.55, 1], delay: Math.random() * 0.12 },
            );
      });
      if (line.current) {
        line.current.style.transformOrigin = "100% 50%";
        jobs.push(run(line.current, { scaleX: 0 }, { duration: instant ? 0 : 0.35, ease: OUT_EASE }));
      }
      await Promise.all(jobs);
    };

    const sort = async () => {
      const fs = size();
      // letters land in reading order, so the phrase visibly assembles left to right
      await Promise.all(
        letters().map(({ l, i }, k) =>
          run(
            l,
            { x: 0, y: [null, (i % 2 ? 0.3 : -0.3) * fs, 0], rotate: 0, opacity: 1, filter: CLEAR },
            { duration: 0.8, ease: SORT_EASE, delay: k * 0.055 },
          ),
        ),
      );
      phase.current = "sorted";
      if (underline && line.current && alive) {
        line.current.style.transformOrigin = "0% 50%";
        await run(line.current, { scaleX: 1 }, { duration: 0.65, ease: OUT_EASE });
      }
    };

    (async () => {
      if (phase.current === "idle") {
        // first time on screen: swap the plain text for the jumble, then sort it
        await scatter(true);
        if (ghost.current) ghost.current.style.visibility = "hidden";
        if (layer.current) layer.current.style.visibility = "visible";
        await wait(delay);
        if (!alive) return;
        await sort();
      } else if (phase.current === "messy") {
        await wait(250);
        if (!alive) return;
        await sort();
      }
      while (alive && loop) {
        await wait(loop);
        if (!alive) return;
        await scatter(false);
        await wait(900);
        if (!alive) return;
        await sort();
      }
    })();

    return () => {
      alive = false;
      running.forEach((a) => a.stop());
      timers.forEach(clearTimeout);
    };
  }, [inView, reduce, loop, delay, underline, text]);

  return (
    <span ref={box} className={`relative inline-block whitespace-nowrap ${className ?? ""}`}>
      <span className="sr-only">{text}</span>
      {/* the real text: sets the layout, and is what you see without JS or with reduced motion */}
      <span ref={ghost} aria-hidden>
        {text}
        <span ref={baseline} className="inline-block h-0 w-0 align-baseline" />
      </span>
      <span ref={layer} aria-hidden className="pointer-events-none absolute inset-0" style={{ visibility: "hidden" }}>
        {Array.from(text).map((ch, i) =>
          ch.trim() ? (
            <span
              key={i}
              ref={(n) => {
                els.current[i] = n;
              }}
              className="absolute top-0 inline-block will-change-transform"
            >
              {ch}
            </span>
          ) : null,
        )}
      </span>
      {underline && <span ref={line} aria-hidden className="pointer-events-none absolute rounded-full bg-current" style={{ transform: "scaleX(0)" }} />}
    </span>
  );
}
