import type { Metadata } from "next";
import { getAllPosts, toMeta } from "@/lib/journal";
import { JournalList } from "@/components/journal/JournalList";
import { Reveal, SplitHeading } from "@/components/primitives";

export const metadata: Metadata = {
  title: "Journal",
  description: "Ali's journal — the work, the journey, and the thinking in between.",
};

export const revalidate = 300;

export default async function JournalPage() {
  const posts = (await getAllPosts()).map(toMeta);
  return (
    <section className="mx-auto min-h-[80vh] max-w-[1200px] px-5 pb-24 pt-36 sm:px-8 md:pt-44">
      <p className="eyebrow mb-6">The journal</p>
      <SplitHeading
        text="Notes from a tidy mind."
        italic={[3, 4]}
        className="font-display text-[clamp(2.8rem,7vw,5.8rem)] leading-[0.98]"
      />
      <Reveal delay={0.2}>
        <p className="mt-6 max-w-[540px] text-[1.05rem] leading-relaxed text-ink-soft">
          Where the work gets reflected on. Builds, systems, the journey from translator to product — and the thinking in between.
        </p>
      </Reveal>
      <div className="mt-16">
        <JournalList posts={posts} />
      </div>
    </section>
  );
}
