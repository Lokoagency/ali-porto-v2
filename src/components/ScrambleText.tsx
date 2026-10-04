"use client";

import { useEffect, useRef } from "react";
import { useInView } from "motion/react";

// letters and digits only: symbols read as "hacker", not "tidy"
const NOISE = "abcdefghijklmnopqrstuvwxyz0123456789";
const esc = (c: string) => (c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === "&" ? "&amp;" : c);

/**
 * Text that starts as noise and straightens out, left to right — the site's whole
 * idea in one line. The final string is laid out invisibly underneath, so the
 * scramble never shifts the layout around it.
 */
export function ScrambleText({
  text,
  className,
  loop = 0,
  delay = 0,
  duration = 1100,
  wrap = false,
}: {
  text: string;
  className?: string;
  /** ms between replays; 0 = play once when it scrolls into view */
  loop?: number;
  delay?: number;
  /** roughly how long the resolve takes */
  duration?: number;
  /** let long text wrap (card titles); short inline phrases stay on one line so the noise never reflows */
  wrap?: boolean;
}) {
  const box = useRef<HTMLSpanElement>(null);
  const overlay = useRef<HTMLSpanElement>(null);
  const inView = useInView(box, { once: !loop, margin: "0px 0px -8% 0px" });

  useEffect(() => {
    const el = overlay.current;
    if (!el || !inView) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = text;
      return;
    }

    const chars = [...text];
    let frame = 0;
    let timers: ReturnType<typeof setTimeout>[] = [];

    const play = () => {
      const start = performance.now();
      // each letter settles at its own moment, left to right with a little jitter
      const settleAt = chars.map((_, i) => (i / chars.length) * duration * 0.75 + Math.random() * duration * 0.25);
      const tick = (now: number) => {
        const t = now - start;
        let done = true;
        el.innerHTML = chars
          .map((c, i) => {
            if (c === " " || t >= settleAt[i]) return esc(c);
            done = false;
            const n = NOISE[(Math.random() * NOISE.length) | 0];
            return `<span style="opacity:.45">${esc(n)}</span>`;
          })
          .join("");
        if (!done) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };

    timers.push(setTimeout(play, delay));
    let interval: ReturnType<typeof setInterval> | undefined;
    if (loop) interval = setInterval(play, loop);

    return () => {
      cancelAnimationFrame(frame);
      timers.forEach(clearTimeout);
      timers = [];
      clearInterval(interval);
    };
  }, [inView, text, loop, delay, duration]);

  return (
    <span ref={box} className={`relative inline-block ${wrap ? "max-w-full" : "whitespace-nowrap"} ${className ?? ""}`}>
      <span className="sr-only">{text}</span>
      <span aria-hidden className="invisible">
        {text}
      </span>
      <span ref={overlay} aria-hidden className={wrap ? "absolute inset-0" : "absolute left-0 top-0 whitespace-nowrap"}>
        {text}
      </span>
    </span>
  );
}
