"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { story } from "@/content/site";
import { SectionLabel } from "../primitives";

function Word({ word, range, progress }: { word: string; range: [number, number]; progress: MotionValue<number> }) {
  const opacity = useTransform(progress, range, [0.3, 1]);
  return (
    <span className="relative mr-[0.25em] inline-block">
      <motion.span style={{ opacity }}>{word}</motion.span>
    </span>
  );
}

/** A sentence that reads itself as you scroll. */
function ScrollQuote({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 45%"] });
  const words = text.split(" ");
  return (
    <p ref={ref} className="font-display text-[clamp(1.9rem,4.6vw,3.8rem)] leading-[1.12] text-ink">
      {words.map((w, i) => (
        <Word key={i} word={w} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} />
      ))}
    </p>
  );
}

export function Principles() {
  return (
    <section id="how" className="relative bg-paper-2/70 py-20 md:py-28">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        <SectionLabel index={story.how.index}>{story.how.label}</SectionLabel>
        <ScrollQuote text={story.how.quote} />
      </div>
    </section>
  );
}
