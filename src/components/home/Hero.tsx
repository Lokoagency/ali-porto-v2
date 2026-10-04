"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useInView, useMotionValue, useSpring, useTransform } from "motion/react";
import { person, story } from "@/content/site";
import { Arrow, Magnetic, easeOut } from "../primitives";
import { SortText } from "../SortText";

// scattered spots for the six notes (labels: story.hero.notes, problem first)
const scatter = [
  { left: "-14%", top: "6%", rotate: -14 },
  { left: "70%", top: "-4%", rotate: 11 },
  { left: "78%", top: "38%", rotate: -8 },
  { left: "-18%", top: "52%", rotate: 9 },
  { left: "64%", top: "80%", rotate: 16 },
  { left: "4%", top: "88%", rotate: -6 },
];
const notes = story.hero.notes.map((label, i) => ({ label, messy: scatter[i % scatter.length] }));

// tidied notes line up just off the portrait's left edge; on narrow screens they tuck inside it
const tidy = (i: number, narrow: boolean) => ({ left: narrow ? "3%" : "-10%", top: `${14 + i * 12}%`, rotate: 0 });
const NARROW = "(max-width: 1023px)";
const onNarrowChange = (cb: () => void) => {
  const m = matchMedia(NARROW);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};
const spring = { type: "spring", stiffness: 140, damping: 18, mass: 0.9 } as const;

function RotatingRole({ live }: { live: boolean }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!live) return; // nothing ticks while the hero is off-screen
    const id = setInterval(() => setI((n) => (n + 1) % person.roles.length), 2600);
    return () => clearInterval(id);
  }, [live]);
  return (
    <span className="relative inline-grid h-[1.4em] overflow-hidden align-bottom">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={i}
          className="col-start-1 row-start-1 whitespace-nowrap text-teal"
          initial={{ y: "100%", opacity: 0, filter: "blur(6px)" }}
          animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
          exit={{ y: "-100%", opacity: 0, filter: "blur(6px)" }}
          transition={{ duration: 0.6, ease: easeOut }}
        >
          {person.roles[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/** The key word (story.hero.word): letters start scattered and straighten out. Hover to scatter again. */
function MessyWord({ live }: { live: boolean }) {
  const [settled, setSettled] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const settleIn = (ms: number) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setSettled(true), ms);
  };
  useEffect(() => {
    if (!live) return;
    settleIn(1900);
    // every few seconds the mess comes back for a beat, then tidies itself
    const id = setInterval(() => {
      setSettled(false);
      settleIn(520);
    }, 5200);
    return () => {
      clearInterval(id);
      clearTimeout(timer.current);
    };
  }, [live]);
  // Hover = one playful shake that tidies itself; it ignores pointer-leave so moving
  // letters can't flicker the state back and forth under the cursor.
  const shake = () => {
    if (!settled) return;
    setSettled(false);
    settleIn(420);
  };
  const chaos = Array.from(story.hero.word, (_, i) => ({ y: [-10, 8, -4, 12, -6, 6, -9, 3][i % 8], rotate: [-18, 14, -9, 22, 0, -12, 10, -5][i % 8] }));
  return (
    <span
      className="font-display-italic inline-flex text-teal"
      onPointerEnter={shake}
    >
      {Array.from(story.hero.word).map((ch, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={chaos[i]}
          animate={settled ? { y: 0, rotate: 0 } : chaos[i]}
          transition={{ type: "spring", stiffness: 300, damping: 16, delay: settled ? i * 0.04 : 0 }}
        >
          {ch}
        </motion.span>
      ))}
    </span>
  );
}

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const live = useInView(ref);
  const [organized, setOrganized] = useState(false);
  const [manual, setManual] = useState(false);
  const narrow = useSyncExternalStore(onNarrowChange, () => matchMedia(NARROW).matches, () => false);
  useEffect(() => {
    if (manual || !live) return; // the visitor took over with the button, or scrolled away
    let t = setTimeout(() => setOrganized(true), 1500);
    // replay the story: scatter, then sort, every ~9s
    const id = setInterval(() => {
      setOrganized(false);
      clearTimeout(t);
      t = setTimeout(() => setOrganized(true), 1300);
    }, 9000);
    return () => {
      clearInterval(id);
      clearTimeout(t);
    };
  }, [manual, live]);

  // Subtle pointer parallax on the portrait
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [4, -4]), { stiffness: 120, damping: 20 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-5, 5]), { stiffness: 120, damping: 20 });

  return (
    <section
      ref={ref}
      id="top"
      className="relative mx-auto grid overflow-x-clip min-h-[100svh] max-w-[1200px] items-center gap-14 px-5 pb-20 pt-32 sm:px-8 lg:grid-cols-[1.15fr_1fr] lg:gap-10 lg:pt-28"
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
        {/* The hero's entrance is plain CSS (see .anim-* in globals.css): it plays on first
            paint, so the headline and portrait never wait for JavaScript to show up. */}
        <p className="eyebrow anim-fade-up mb-7 flex items-center gap-2.5" style={{ animationDuration: "0.7s" }}>
          <motion.span
            className="inline-block origin-[70%_80%] text-base"
            animate={{ rotate: [0, 18, -8, 18, 0] }}
            transition={{ duration: 1.6, delay: 0.8, ease: "easeInOut" }}
          >
            👋
          </motion.span>
          Have you met Ali?
        </p>

        <h1 className="font-display text-[clamp(2.7rem,6.6vw,5.4rem)] leading-[1.02] text-ink">
          {story.hero.lines.map((line, i) => (
            // fully visible from the first frame (it just comes into focus), so the headline
            // is readable at once and is never held back waiting for the rest of the page
            <span key={i} className="anim-focus block pb-[0.06em]" style={{ animationDelay: `${0.1 + i * 0.12}s` }}>
              {line} {i === 1 && <MessyWord live={live} />}
            </span>
          ))}
        </h1>

        <p
          className="anim-blur-in mt-6 font-display text-[clamp(1.4rem,2.6vw,2rem)] leading-snug text-ink-soft"
          style={{ animationDelay: "1.9s" }}
        >
          {story.hero.tagline}{" "}
          <SortText text={story.hero.sort} className="font-display-italic text-teal" delay={2100} loop={7000} />
        </p>

        <div className="anim-fade-up mt-9 max-w-[520px] space-y-6" style={{ animationDelay: "0.7s", animationDuration: "0.9s" }}>
          <p className="text-[1.02rem] leading-relaxed text-ink-soft">
            <span className="font-medium text-ink">Ali Farghaly</span> — <RotatingRole live={live} />
            <br />
            {person.intro}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Magnetic>
              <Link
                href="#process"
                className="press group flex h-12 items-center gap-2.5 rounded-full bg-ink pl-6 pr-5 text-[0.92rem] font-medium text-paper shadow-[var(--shadow-md)] hover:bg-teal"
              >
                Watch an idea get sorted
                <span className="transition-transform duration-300 group-hover:translate-y-0.5">
                  <Arrow className="size-4 rotate-90" />
                </span>
              </Link>
            </Magnetic>
            <Link
              href="#work"
              className="press group flex h-12 items-center gap-2 rounded-full border border-line-strong px-6 text-[0.92rem] text-ink hover:border-teal hover:text-teal"
            >
              See the work
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                <Arrow />
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Portrait + the notes that organize themselves */}
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
            Open to projects
          </div>
        </motion.div>
        </div>

        {notes.map((n, i) => {
          const at = organized ? tidy(i, narrow) : n.messy;
          const move = { ...spring, delay: organized ? i * 0.07 : 0.4 + i * 0.06 };
          return (
            // A full-size layer slides by a % of the portrait (transform only, so no layout work
            // per frame); the note rides at its top-left corner and does its own tilt and pop.
            // (The section clips overflow-x, so these layers never widen the page on phones.)
            <motion.div
              key={n.label}
              className="pointer-events-none absolute inset-0 z-10"
              initial={{ x: n.messy.left, y: n.messy.top }}
              animate={{ x: at.left, y: at.top }}
              transition={move}
            >
          <motion.div
            className="glass pointer-events-auto absolute left-0 top-0 flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-[0.8rem] text-ink"
            initial={{ opacity: 0, scale: 0.6, rotate: n.messy.rotate }}
            animate={{ opacity: 1, scale: 1, rotate: at.rotate }}
            transition={move}
          >
            <span className="relative flex size-4 items-center justify-center rounded-[5px] border border-teal/50">
              <motion.svg
                viewBox="0 0 12 12"
                className="size-3 text-teal"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <motion.path
                  d="M2.5 6.5l2.2 2L9.5 3.5"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: organized ? 1 : 0 }}
                  transition={{ duration: 0.35, delay: organized ? 0.35 + i * 0.07 : 0 }}
                />
              </motion.svg>
            </span>
            {n.label}
          </motion.div>
            </motion.div>
          );
        })}

        <motion.button
          onClick={() => {
            setManual(true);
            setOrganized((o) => !o);
          }}
          className="press absolute -bottom-14 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full px-4 py-2 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-muted hover:text-teal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.4 }}
        >
          <motion.span animate={{ rotate: organized ? 0 : 180 }} transition={spring} className="inline-block">
            ↻
          </motion.span>
          {organized ? "Mess it up" : "Tidy up"}
        </motion.button>
      </div>

      <motion.div
        aria-hidden
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 lg:flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.6 }}
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
