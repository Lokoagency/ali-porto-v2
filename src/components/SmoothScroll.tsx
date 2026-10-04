"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

/** Unhurried, cozy scrolling. Also routes in-page anchor links through Lenis. */
export function SmoothScroll() {
  const pathname = usePathname();
  // the 3D house is a full-screen game; no smooth-scroll engine running under it
  const immersive = pathname.startsWith("/mind");

  useEffect(() => {
    if (immersive || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.12, wheelMultiplier: 1.1, touchMultiplier: 1.2, anchors: false });
    window.__lenis = lenis;
    let raf = requestAnimationFrame(function loop(t) {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    });

    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest("a");
      const href = a?.getAttribute("href");
      if (!href) return;
      const hash = href.startsWith("#") ? href : href.startsWith("/#") && location.pathname === "/" ? href.slice(1) : null;
      if (!hash) return;
      const el = document.querySelector(hash);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el as HTMLElement, { offset: -24, duration: 1.4 });
      history.replaceState(null, "", hash);
    };
    // Capture phase: runs before Next <Link> so it never navigates *and* smooth-scrolls.
    document.addEventListener("click", onClick, true);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("click", onClick, true);
      lenis.destroy();
      window.__lenis = undefined;
    };
  }, [immersive]);

  // Land at the top (or the hash target) on route change.
  useEffect(() => {
    const lenis = window.__lenis;
    const el = location.hash ? document.querySelector(location.hash) : null;
    if (el) requestAnimationFrame(() => (lenis ? lenis.scrollTo(el as HTMLElement, { offset: -24, immediate: true }) : el.scrollIntoView()));
    else lenis?.scrollTo(0, { immediate: true });
  }, [pathname]);

  return null;
}
