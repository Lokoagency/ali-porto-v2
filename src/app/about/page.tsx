import type { Metadata } from "next";
import { Journey } from "@/components/home/Journey";

export const metadata: Metadata = {
  title: "About",
  description: "Ali Farghaly's path: from translator to builder to developer and product manager.",
};

// Ali's path, moved off the home page (round 7). The dark band starts under the nav.
export default function AboutPage() {
  return <Journey page />;
}
