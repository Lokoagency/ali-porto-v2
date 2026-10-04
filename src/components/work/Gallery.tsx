"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

export function Gallery({ shots, name, device }: { shots: string[]; name: string; device?: "phone" }) {
  const [[index, dir], set] = useState<[number, number]>([0, 0]);
  const go = useCallback(
    (to: number) => set(([i]) => [Math.max(0, Math.min(shots.length - 1, to)), to > i ? 1 : -1]),
    [shots.length],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(index + 1);
      if (e.key === "ArrowLeft") go(index - 1);
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [go, index]);

  const phone = device === "phone";
  const frame = phone
    ? "relative mx-auto aspect-[9/19.5] w-[min(300px,70vw)] overflow-hidden rounded-[42px] border-[7px] border-ink bg-ink shadow-[var(--shadow-lg)]"
    : "relative aspect-[16/10] w-full overflow-hidden rounded-b-[18px] bg-paper-2";

  const slides = (
    <AnimatePresence initial={false} custom={dir} mode="popLayout">
      <motion.div
        key={index}
        custom={dir}
        className="absolute inset-0"
        variants={{
          enter: (d: number) => ({ x: `${d * 8}%`, opacity: 0, filter: "blur(6px)" }),
          center: { x: "0%", opacity: 1, filter: "blur(0px)" },
          exit: (d: number) => ({ x: `${d * -8}%`, opacity: 0, filter: "blur(6px)", transition: { duration: 0.2 } }),
        }}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={(_, info) => {
          if (info.offset.x < -60) go(index + 1);
          if (info.offset.x > 60) go(index - 1);
        }}
      >
        <Image
          src={shots[index]}
          alt={`${name} — screen ${index + 1}`}
          fill
          sizes={phone ? "300px" : "(min-width: 1024px) 1100px, 100vw"}
          className={`pointer-events-none select-none ${phone ? "object-cover" : "object-contain object-top"}`}
          priority={index === 0}
        />
      </motion.div>
    </AnimatePresence>
  );

  return (
    <div>
      <div className={`relative ${phone ? "mx-auto max-w-[440px]" : ""}`}>
        {phone ? (
          <div className={frame}>{slides}</div>
        ) : (
          <div className="overflow-hidden rounded-[22px] border border-line bg-card shadow-[var(--shadow-lg)]">
            <div className="flex items-center gap-1.5 border-b border-line px-4 py-3">
              {[0, 1, 2].map((i) => (
                <span key={i} className="size-2.5 rounded-full bg-line-strong" />
              ))}
              <span className="ml-4 h-5 flex-1 rounded-md bg-paper-2" />
            </div>
            <div className={frame}>{slides}</div>
          </div>
        )}

        {shots.length > 1 && (
          <>
            {[-1, 1].map((d) => {
              const disabled = d < 0 ? index === 0 : index === shots.length - 1;
              return (
                <button
                  key={d}
                  onClick={() => go(index + d)}
                  disabled={disabled}
                  aria-label={d < 0 ? "Previous screen" : "Next screen"}
                  className={`press glass absolute top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full text-ink transition-opacity disabled:pointer-events-none disabled:opacity-0 ${d < 0 ? "left-3" : "right-3"}`}
                >
                  <svg viewBox="0 0 16 16" className={`size-4 ${d < 0 ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 3.5 10.5 8 6 12.5" />
                  </svg>
                </button>
              );
            })}
          </>
        )}
      </div>

      {shots.length > 1 && (
        <div className="mt-5 flex items-center justify-center gap-2">
          {shots.map((s, i) => (
            <button
              key={s}
              onClick={() => go(i)}
              aria-label={`Show screen ${i + 1}`}
              className="relative flex h-10 items-center px-1"
            >
              <motion.span
                className="block h-1.5 rounded-full"
                animate={{ width: i === index ? 28 : 8, backgroundColor: i === index ? "var(--teal)" : "var(--line-strong)" }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            </button>
          ))}
          <span className="ml-3 font-mono text-xs text-muted tabular">
            {String(index + 1).padStart(2, "0")} / {String(shots.length).padStart(2, "0")}
          </span>
        </div>
      )}
    </div>
  );
}
