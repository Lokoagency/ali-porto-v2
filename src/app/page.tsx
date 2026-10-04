import { Hero } from "@/components/home/Hero";
import { Numbers } from "@/components/home/Numbers";
import { ScrollRail } from "@/components/ScrollRail";
import { IdeaSorter } from "@/components/home/IdeaSorter";
import { Paths } from "@/components/home/Paths";
import { Principles } from "@/components/home/Principles";
import { Work } from "@/components/home/Work";
import { Journey } from "@/components/home/Journey";
import { HowIWork } from "@/components/home/HowIWork";
import { JournalPreview } from "@/components/home/JournalPreview";
import { MindTeaser } from "@/components/home/MindTeaser";
import { Contact } from "@/components/home/Contact";
import { getAllPosts, toMeta } from "@/lib/journal";

// Journal posts from Notion refresh every 5 minutes without a deploy.
export const revalidate = 300;

export default async function Home() {
  const posts = (await getAllPosts()).map(toMeta);
  return (
    <>
      <ScrollRail />
      <Hero />
      <Numbers />
      <IdeaSorter />
      <Paths />
      <Principles />
      <Work />
      <Journey />
      <HowIWork />
      <JournalPreview posts={posts} />
      <MindTeaser />
      <Contact />
    </>
  );
}
