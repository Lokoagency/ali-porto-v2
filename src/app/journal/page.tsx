import type { Metadata } from "next";
import { getAllPosts, toMeta } from "@/lib/journal";
import { JournalList } from "@/components/journal/JournalList";
import { Reveal, SplitHeading } from "@/components/primitives";
import { journalPage } from "@/content/site";

export const metadata: Metadata = {
  title: "Journal",
  description: journalPage.description,
};

export const revalidate = 300;

export default async function JournalPage() {
  const posts = (await getAllPosts()).map(toMeta);
  return (
    <section className="mx-auto min-h-[80vh] max-w-[1200px] px-5 pb-24 pt-36 sm:px-8 md:pt-44">
      <p className="eyebrow mb-6">{journalPage.eyebrow}</p>
      <SplitHeading
        text={journalPage.heading}
        italic={journalPage.italic}
        className="font-display text-[clamp(2.8rem,7vw,5.8rem)] leading-[0.98]"
      />
      <Reveal delay={0.2}>
        <p className="mt-6 max-w-[540px] text-[1.05rem] leading-relaxed text-ink-soft">
          {journalPage.lede}
        </p>
      </Reveal>
      <div className="mt-16">
        <JournalList posts={posts} />
      </div>
    </section>
  );
}
