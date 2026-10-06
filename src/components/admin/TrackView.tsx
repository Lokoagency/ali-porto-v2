"use client";

import { useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { Roadmap } from "@/components/home/Roadmap";
import { readTrack } from "@/lib/admin-store";
import { story } from "@/content/site";

const onHash = (cb: () => void) => {
  addEventListener("hashchange", cb);
  return () => removeEventListener("hashchange", cb);
};

/** Reads the client's data from the link's #fragment and shows the protocol with their train in place. */
export function TrackView() {
  const hash = useSyncExternalStore(onHash, () => location.hash, () => null);
  const track = useMemo(() => (hash ? readTrack(hash) : null), [hash]);

  if (hash === null) return <div className="min-h-[100svh]" />; // server render: wait for the browser to read the link
  if (!track) {
    return (
      <section className="mx-auto flex min-h-[80svh] max-w-[720px] flex-col justify-center px-5 pt-32 sm:px-8">
        <p className="eyebrow mb-4">{story.track.label}</p>
        <h1 className="font-display text-[clamp(2rem,5vw,3.2rem)] leading-tight">{story.track.bad}</h1>
        <Link href="/" className="link-draw mt-6 w-fit text-teal">
          Have you met Ali?
        </Link>
      </section>
    );
  }
  // keyed, so a new link (another client or an update) starts the map fresh at their station
  return <Roadmap key={hash} track={track} />;
}
