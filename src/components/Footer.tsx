"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { contact, person, story } from "@/content/site";
import { SortText } from "./SortText";

export function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/mind")) return null;
  const year = new Date().getFullYear();
  return (
    <footer className="mx-auto max-w-[1200px] px-5 pb-10 sm:px-8">
      <div className="flex flex-col gap-10 border-t border-line pt-10 md:flex-row md:items-start md:justify-between">
        <div>
          <Link href="/" className="font-display text-3xl">
            Ali<span className="text-teal">.</span>
          </Link>
          <p className="mt-2 max-w-[260px] text-[0.9rem] text-ink-soft">{person.tagline} Everything in its place.</p>
        </div>
        <div className="grid grid-cols-2 gap-12 text-[0.9rem]">
          <ul className="space-y-2">
            <li className="eyebrow mb-3 text-muted">Pages</li>
            {[
              ["Philosophy", "/#how"],
              ["Work", "/#work"],
              ["Protocol", "/#roadmap"],
              ["About", "/about"],
              ["Journal", "/journal"],
              ["Ali's mind", "/mind"],
            ].map(([l, h]) => (
              <li key={h}>
                <Link href={h} className="link-draw text-ink-soft hover:text-ink">
                  {l}
                </Link>
              </li>
            ))}
          </ul>
          <ul className="space-y-2">
            <li className="eyebrow mb-3 text-muted">Connect</li>
            {[
              ["Email", `mailto:${contact.email}`],
              ["LinkedIn", contact.linkedin],
              ["Upwork", contact.upwork],
              ["WhatsApp", contact.whatsapp],
            ].map(([l, h]) => (
              <li key={l}>
                <a href={h} target="_blank" rel="noreferrer" className="link-draw text-ink-soft hover:text-ink">
                  {l}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-12 flex flex-wrap items-center justify-between gap-3 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-muted">
        <span className="tabular">© {year} {person.name}</span>
        <span>
          {story.footer.lead} · <SortText text={story.footer.sort} className="text-teal" underline={false} delay={300} loop={9000} />
        </span>
      </div>
    </footer>
  );
}
