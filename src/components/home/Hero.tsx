"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { person, story } from "@/content/site";
import { Arrow, Magnetic } from "../primitives";

/**
 * The hero answers two things at a glance: who Ali is, and why you're here.
 * Ali speaks first: one bold line, one line about him, two ways forward, the portrait.
 * (The messy → clear story lives in the Sorting Room, further down.)
 */
export function Hero() {
  const h = story.hero;

  // Subtle pointer parallax on the portrait
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [4, -4]), { stiffness: 120, damping: 20 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-5, 5]), { stiffness: 120, damping: 20 });

  return (
    <section
      id="top"
      className="relative mx-auto grid min-h-[100svh] max-w-[1200px] items-center gap-14 overflow-x-clip px-5 pb-20 pt-32 sm:px-8 lg:grid-cols-[1.2fr_1fr] lg:gap-10 lg:pt-28"
      onPointerMove={(e) => {
        mx.set(e.clientX / innerWidth - 0.5);
        my.set(e.clientY / innerHeight - 0.5);
      }}
    >
      {/* soft teal glow (clipped to the hero so it can never widen the page on phones) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 right-[-10%] size-[620px] rounded-full bg-teal-tint opacity-70 blur-[110px]" />
      </div>

      <div>
        {/* The entrance is plain CSS (.anim-* in globals.css): it plays on first paint,
            so the headline and portrait never wait for JavaScript. */}
        <p className="eyebrow anim-fade-up mb-7 flex items-center gap-2.5" style={{ animationDuration: "0.7s" }}>
          <motion.span
            className="inline-block origin-[70%_80%] text-base"
            animate={{ rotate: [0, 18, -8, 18, 0] }}
            transition={{ duration: 1.6, delay: 0.8, ease: "easeInOut" }}
          >
            👋
          </motion.span>
          {h.eyebrow}
        </p>

        {/* Ali says it himself: one bold line, his core belief (intention over spec) */}
        <h1 className="font-display text-[clamp(3rem,7.4vw,6.2rem)] leading-[0.98] text-ink">
          <span className="anim-focus block pb-[0.08em]" style={{ animationDelay: "0.1s" }}>
            {h.lead}{" "}
            <span className="relative inline-block font-display-italic text-teal">
              {h.em}
              {/* a pen stroke underlines "meant." once the line has landed (pure CSS, so it plays before JS) */}
              <svg aria-hidden viewBox="0 0 200 16" preserveAspectRatio="none" className="absolute -bottom-[0.06em] left-[2%] h-[0.16em] w-[96%] overflow-visible text-teal/70">
                <path
                  d="M2 11c34-6 70-9 104-8 30 1 58 3 92 6"
                  pathLength="1"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="anim-draw"
                  style={{ animationDelay: "0.85s" }}
                />
              </svg>
            </span>
          </span>
        </h1>

        <p
          className="anim-fade-up mt-7 max-w-[540px] text-[1.08rem] leading-relaxed text-ink-soft"
          style={{ animationDelay: "0.45s", animationDuration: "0.9s" }}
        >
          <span className="font-medium text-ink">{h.who}</span>, {h.role} {h.line}
        </p>

        <div className="anim-fade-up mt-9 flex flex-wrap items-center gap-3" style={{ animationDelay: "0.6s", animationDuration: "0.9s" }}>
          <Magnetic>
            <Link
              href="#tell-ali"
              className="press group flex h-12 items-center gap-2.5 rounded-full bg-ink pl-6 pr-5 text-[0.92rem] font-medium text-paper shadow-[var(--shadow-md)] hover:bg-teal"
            >
              {h.primary}
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                <Arrow />
              </span>
            </Link>
          </Magnetic>
          <Link
            href="#work"
            className="press group flex h-12 items-center gap-2 rounded-full border border-line-strong px-6 text-[0.92rem] text-ink hover:border-teal hover:text-teal"
          >
            {h.secondary}
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              <Arrow />
            </span>
          </Link>
        </div>
      </div>

      {/* The portrait */}
      <div className="relative mx-auto w-full max-w-[400px] lg:mr-6">
        <div className="anim-portrait [perspective:1200px]">
          <motion.div
            className="relative aspect-[4/5] overflow-hidden rounded-[32px] bg-paper-2 shadow-[var(--shadow-lg)]"
            style={{ rotateX: rx, rotateY: ry }}
          >
            <Image
              src={person.photo}
              alt="Ali Farghaly"
              fill
              loading="eager"
              fetchPriority="high"
              sizes="(min-width: 1024px) 400px, min(400px, 90vw)"
              className="img-outline object-cover object-[60%_30%]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/35 via-transparent to-transparent" />
            <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full glass px-3.5 py-2 text-[0.78rem] text-ink">
              <span className="pulse-dot size-2 rounded-full bg-teal" />
              {h.badge}
            </div>
          </motion.div>
        </div>
      </div>

      <motion.div
        aria-hidden
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 lg:flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
      >
        <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted">Scroll</span>
        <span className="relative h-10 w-px overflow-hidden bg-line-strong">
          <motion.span
            className="absolute inset-x-0 top-0 h-4 bg-teal"
            animate={{ y: [-16, 40] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
      </motion.div>
    </section>
  );
}
