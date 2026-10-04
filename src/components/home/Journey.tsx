"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useScroll, useSpring, useTransform } from "motion/react";
import { journey, translations } from "@/content/site";
import { Reveal, SectionLabel, SplitHeading, easeOut } from "../primitives";

/** Old medium → new medium, flipping like a translation being made. */
function TranslationCard() {
  const ref = useRef<HTMLDivElement>(null);
  const live = useInView(ref);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => setTick((t) => t + 1), 2200);
    return () => clearInterval(id);
  }, [live]);
  const word = tick % 2 === 0;

  return (
    <div ref={ref} className="glass mt-10 rounded-[24px] p-6">
      <div className="flex items-center justify-between">
        <span className="eyebrow text-muted">Same craft, new medium</span>
        <div className="relative h-9 w-24 overflow-hidden text-right">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={word ? "ar" : "en"}
              initial={{ y: 20, opacity: 0, filter: "blur(4px)" }}
              animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
              exit={{ y: -20, opacity: 0, filter: "blur(4px)" }}
              transition={{ duration: 0.5, ease: easeOut }}
              className="absolute right-0 top-0 font-display text-2xl text-teal"
              lang={word ? "ar" : "en"}
              dir={word ? "rtl" : "ltr"}
            >
              {word ? "فكرة" : "idea"}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
      <ul className="mt-5 space-y-3">
        {translations.map((t, i) => {
          const flipped = (tick + i) % 4 >= 2;
          return (
            <li key={t.from} className="flex items-center gap-3 text-[0.95rem]">
              <span className={`w-32 shrink-0 whitespace-nowrap transition-colors duration-500 ${flipped ? "text-muted line-through decoration-teal/50" : "text-ink"}`}>
                {t.from}
              </span>
              <span className="relative h-px flex-1 overflow-hidden bg-line-strong">
                <motion.span
                  className="absolute inset-y-0 left-0 w-full origin-left bg-teal"
                  animate={{ scaleX: flipped ? 1 : 0 }}
                  transition={{ duration: 0.6, ease: easeOut }}
                />
              </span>
              <motion.span
                className="w-40 shrink-0 whitespace-nowrap text-right font-display-italic"
                animate={{ opacity: flipped ? 1 : 0.25, x: flipped ? 0 : -6 }}
                transition={{ duration: 0.5, ease: easeOut }}
              >
                {t.to}
              </motion.span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function Journey() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const line = useSpring(useTransform(scrollYProgress, [0, 1], [0, 1]), { stiffness: 120, damping: 30 });

  return (
    <section id="path" className="section-deep relative overflow-hidden py-20 md:py-28">
      <div aria-hidden className="pointer-events-none absolute -left-40 top-20 size-[520px] rounded-full bg-teal opacity-20 blur-[140px]" />
      <div className="relative mx-auto grid max-w-[1200px] grid-cols-1 gap-16 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionLabel index="05">The path</SectionLabel>
          <SplitHeading
            text="From translator to builder to product manager."
            italic={[2, 4, 6, 7]}
            className="font-display text-[clamp(2.1rem,4.4vw,3.6rem)] leading-[1.04]"
          />
          <Reveal>
            <p className="mt-6 max-w-[440px] text-[1rem] leading-relaxed text-ink-soft">
              Translation taught me something useful: understand what one side needs and make sure the other side gets it.
              That&apos;s product work, really. Bridging gaps. Preserving meaning.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <div>
              <TranslationCard />
            </div>
          </Reveal>
        </div>

        <div ref={ref} className="relative pl-10 md:pl-14">
          <div className="absolute bottom-2 left-[7px] top-2 w-px bg-white/10 md:left-[11px]" />
          <motion.div className="absolute bottom-2 left-[7px] top-2 w-px origin-top bg-teal md:left-[11px]" style={{ scaleY: line }} />
          {journey.map((j, i) => (
            <Chapter key={j.role} j={j} i={i} progress={line} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Chapter({ j, i, progress }: { j: (typeof journey)[number]; i: number; progress: ReturnType<typeof useSpring> }) {
  const at = i / (journey.length - 0.6);
  const lit = useTransform(progress, [at - 0.02, at + 0.06], [0, 1]);
  const scale = useTransform(lit, [0, 1], [0.6, 1]);
  return (
    <div className="relative pb-14 last:pb-0">
      <motion.span
        className="absolute -left-10 top-1.5 flex size-[15px] items-center justify-center rounded-full border border-white/25 bg-[var(--deep)] md:-left-14 md:size-[23px]"
        style={{ scale }}
      >
        <motion.span className="size-[7px] rounded-full bg-sun md:size-[9px]" style={{ opacity: lit }} />
      </motion.span>
      <Reveal>
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-teal tabular">{j.years}</p>
        <h3 className="mt-3 font-display text-[clamp(2rem,4vw,3rem)] leading-none">{j.role}</h3>
        <p className="mt-5 font-display-italic text-[1.3rem] leading-snug text-ink">{j.lede}</p>
        <p className="mt-4 max-w-[560px] text-[0.98rem] leading-relaxed text-ink-soft">{j.body}</p>
      </Reveal>
    </div>
  );
}
