import { Hero } from "@/components/home/Hero";
import { ScrollRail } from "@/components/ScrollRail";
import { IdeaSorter } from "@/components/home/IdeaSorter";
import { Paths } from "@/components/home/Paths";
import { Principles } from "@/components/home/Principles";
import { Roadmap } from "@/components/home/Roadmap";
import { Work } from "@/components/home/Work";
import { Stack } from "@/components/home/Stack";
import { HowIWork } from "@/components/home/HowIWork";
import { MindTeaser } from "@/components/home/MindTeaser";
import { Contact } from "@/components/home/Contact";
import { FloatingCta } from "@/components/home/FloatingCta";

// The home page (copy in src/content/site.ts → story):
// the hero (Ali speaking) → 01 why: Ali's quote → 02 proof: the work →
// 03 how: the method (the Sorting Room, unchanged), one person one path, the protocol, working together →
// 04 knowledge: the stack → 05 let's talk. Ali's path (translator → builder → PM) lives on /about.
// The journal lives on its own page, reached from the nav. From the protocol on, a
// floating "let's talk" pill rides along until the contact section.
export default function Home() {
  return (
    <>
      <ScrollRail />
      <Hero />
      <Principles />
      <Work />
      <IdeaSorter />
      <Paths />
      <Roadmap />
      <HowIWork />
      <Stack />
      <MindTeaser />
      <Contact />
      <FloatingCta />
    </>
  );
}
