import { Hero } from "@/components/home/Hero";
import { Numbers } from "@/components/home/Numbers";
import { ScrollRail } from "@/components/ScrollRail";
import { IdeaSorter } from "@/components/home/IdeaSorter";
import { Paths } from "@/components/home/Paths";
import { Principles } from "@/components/home/Principles";
import { Roadmap } from "@/components/home/Roadmap";
import { Work } from "@/components/home/Work";
import { Journey } from "@/components/home/Journey";
import { HowIWork } from "@/components/home/HowIWork";
import { MindTeaser } from "@/components/home/MindTeaser";
import { Contact } from "@/components/home/Contact";
import { FloatingCta } from "@/components/home/FloatingCta";

// The home page tells one story (copy in src/content/site.ts → story):
// the problem → the solution → how → the roadmap → proof → the person → working together → let's talk.
// The journal lives on its own page, reached from the nav. From the roadmap on, a
// floating "let's talk" pill rides along until the contact section.
export default function Home() {
  return (
    <>
      <ScrollRail />
      <Hero />
      <Numbers />
      <IdeaSorter />
      <Paths />
      <Principles />
      <Roadmap />
      <Work />
      <Journey />
      <HowIWork />
      <MindTeaser />
      <Contact />
      <FloatingCta />
    </>
  );
}
