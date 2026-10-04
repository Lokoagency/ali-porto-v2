import Link from "next/link";
import { PostCard, type PostMeta } from "../journal/PostCard";
import { Arrow, Reveal, SectionLabel, SplitHeading } from "../primitives";

export function JournalPreview({ posts }: { posts: PostMeta[] }) {
  if (posts.length === 0) return null;
  return (
    <section id="notes" className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8 md:py-28">
      <SectionLabel index="07">The journal</SectionLabel>
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <SplitHeading
          text="Where the ideas live after hours."
          italic={[4, 5]}
          className="max-w-[680px] font-display text-[clamp(2.1rem,4.6vw,3.6rem)] leading-[1.04]"
        />
        <Reveal>
          <Link href="/journal" className="press group flex items-center gap-2 text-[0.92rem] text-ink hover:text-teal">
            <span className="link-draw">All entries</span>
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              <Arrow />
            </span>
          </Link>
        </Reveal>
      </div>
      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {posts.slice(0, 3).map((p, i) => (
          <Reveal key={p.slug} delay={i * 0.08}>
            <PostCard post={p} index={i} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
