"use client";

import { useEffect, useRef } from "react";
import { animate, motion, useInView } from "motion/react";
import { stats } from "@/content/site";
import { easeOut } from "../primitives";

function CountUp({ to, suffix, delay }: { to: number; suffix: string; delay: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration: 1.6,
      delay,
      ease: easeOut,
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = `${Math.round(v)}${suffix}`;
      },
    });
    return () => controls.stop();
  }, [inView, to, suffix, delay]);
  return (
    <span ref={ref} className="tabular">
      0{suffix}
    </span>
  );
}

/** The short version, for people who scroll fast. */
export function Numbers() {
  return (
    <section aria-label="Ali in numbers" className="mx-auto max-w-[1200px] px-5 sm:px-8">
      <ul className="grid grid-cols-2 overflow-hidden rounded-[28px] border border-line bg-card md:grid-cols-4">
        {stats.map((s, i) => (
          <motion.li
            key={s.label}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -10% 0px" }}
            transition={{ duration: 0.6, delay: i * 0.08, ease: easeOut }}
            className={`spotlight group relative p-6 md:p-8 ${i % 2 ? "border-l border-line" : ""} ${i > 1 ? "border-t border-line md:border-t-0" : ""} ${i === 2 ? "md:border-l" : ""}`}
          >
            <p className="font-display text-[clamp(2.4rem,5vw,3.6rem)] leading-none text-ink">
              <CountUp to={s.value} suffix={s.suffix} delay={0.15 + i * 0.1} />
            </p>
            <p className="mt-3 max-w-[200px] text-[0.88rem] leading-snug text-ink-soft">{s.label}</p>
            <motion.span
              className="absolute bottom-0 left-6 h-[2px] origin-left rounded-full bg-teal md:left-8"
              style={{ width: 28 }}
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5 + i * 0.1, ease: easeOut }}
            />
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
