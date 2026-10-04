"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { PostCard, type PostMeta } from "./PostCard";

export function JournalList({ posts }: { posts: PostMeta[] }) {
  const tags = ["All", ...Array.from(new Set(posts.flatMap((p) => p.tags))).sort()];
  const [tag, setTag] = useState("All");
  const list = tag === "All" ? posts : posts.filter((p) => p.tags.includes(tag));

  if (posts.length === 0) {
    return (
      <div className="rounded-[24px] border border-dashed border-line-strong p-14 text-center text-ink-soft">
        The first entry is being written. Check back soon.
      </div>
    );
  }

  return (
    <>
      <div className="mb-10 flex flex-wrap gap-1.5" role="tablist" aria-label="Filter by topic">
        {tags.map((t) => {
          const on = t === tag;
          return (
            <button
              key={t}
              role="tab"
              aria-selected={on}
              onClick={() => setTag(t)}
              className={`press relative h-9 rounded-full border px-4 text-[0.84rem] ${on ? "border-transparent text-paper" : "border-line text-ink-soft hover:text-ink"}`}
            >
              {on && <motion.span layoutId="journal-tag" className="absolute inset-0 rounded-full bg-teal" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
              <span className="relative">{t}</span>
            </button>
          );
        })}
      </div>
      <ul className="relative grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {list.map((p, i) => (
            <motion.li
              layout="position"
              key={p.slug}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.15 } }}
              transition={{ duration: 0.5, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
            >
              <PostCard post={p} index={i} />
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </>
  );
}
