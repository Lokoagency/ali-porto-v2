import type { Metadata } from "next";
import { TrackView } from "@/components/admin/TrackView";

export const metadata: Metadata = {
  title: "Your project",
  robots: { index: false, follow: false },
};

// A client's private view of the protocol. Its data rides in the URL fragment (#…), set by Ali's dashboard.
export default function TrackPage() {
  return <TrackView />;
}
