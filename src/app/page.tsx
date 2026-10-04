import { Hero } from "@/components/home/Hero";
import { Numbers } from "@/components/home/Numbers";
import { ScrollRail } from "@/components/ScrollRail";
import { IdeaSorter } from "@/components/home/IdeaSorter";
import { Paths } from "@/components/home/Paths";
import { Principles } from "@/components/home/Principles";
import { Roadmap } from "@/components/home/Roadmap";
import { Work } from "@/components/home/Work";
import { Journey } from "@/components/home/Journey";
import { Stack } from "@/components/home/Stack";
import { HowIWork } from "@/components/home/HowIWork";
import { MindTeaser } from "@/components/home/MindTeaser";
import { Contact } from "@/components/home/Contact";
import { FloatingCta } from "@/components/home/FloatingCta";

// The home page in four chapters (copy in src/content/site.ts → story):
// the hero (who Ali is, why you're here) → 01 why: the philosophy →
// 02 how: the method (the Sorting Room, unchanged), one person one path, the protocol, working together →
// 03 knowledge: numbers, proof, the path, the stack → 04 let's talk.
// The journal lives on its own page, reached from the nav. From the protocol on, a
// floating "let's talk" pill rides along until the contact section.
export default function Home() {
  return (
    <>
      <ScrollRail />
      <Hero />
      <Principles />
      <IdeaSorter />
      <Paths />
      <Roadmap />
      <HowIWork />
      <Numbers />
      <Work />
      <Journey />
      <Stack />
      <MindTeaser />
      <Contact />
      <FloatingCta />
    </>
  );
}
