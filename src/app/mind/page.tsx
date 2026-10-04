import type { Metadata } from "next";
import { MindExperience } from "@/components/mind/MindExperience";
import { getAllPosts } from "@/lib/journal";

export const metadata: Metadata = {
  title: "A deep dive into Ali's mind",
  description: "Walk around Ali's retro, well-kept home — his work on the laptop, his journal on the shelves.",
};

export const revalidate = 300;

export default async function MindPage() {
  const posts = (await getAllPosts()).map(({ slug, title, excerpt, date }) => ({ slug, title, excerpt, date }));
  return <MindExperience posts={posts} />;
}
