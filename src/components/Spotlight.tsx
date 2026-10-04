"use client";

import { useEffect } from "react";

/**
 * One delegated listener feeds the cursor position to whichever `.spotlight` card
 * is under the pointer, so cards get a soft teal glow that follows the mouse.
 */
export function Spotlight() {
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const el = (e.target as HTMLElement).closest<HTMLElement>(".spotlight");
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    addEventListener("pointermove", onMove, { passive: true });
    return () => {
      removeEventListener("pointermove", onMove);
    };
  }, []);
  return null;
}
