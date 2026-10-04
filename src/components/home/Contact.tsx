"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { contact, story } from "@/content/site";
import { Arrow, Magnetic, Reveal, SplitHeading } from "../primitives";

const channels = [
  { label: "LinkedIn", value: "linkedin.com/in/aaliadell", href: contact.linkedin },
  { label: "Upwork", value: "Upwork profile", href: contact.upwork },
  { label: "WhatsApp", value: contact.whatsappLabel, href: contact.whatsapp },
];

function CopyEmail() {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(contact.email);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        } catch {
          location.href = `mailto:${contact.email}`;
        }
      }}
      className="spotlight press group flex w-full items-center justify-between gap-4 rounded-[20px] border border-line bg-card px-5 py-4 text-left hover:border-teal/40"
    >
      <span>
        <span className="block font-mono text-[0.66rem] uppercase tracking-[0.14em] text-muted">Email</span>
        <span className="mt-1 block text-[0.98rem] text-ink">{contact.email}</span>
      </span>
      <span className="relative flex size-9 items-center justify-center rounded-full bg-teal-tint text-teal">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.svg
            key={copied ? "ok" : "copy"}
            viewBox="0 0 16 16"
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ opacity: 0, scale: 0.5, filter: "blur(3px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.5, filter: "blur(3px)" }}
            transition={{ type: "spring", stiffness: 420, damping: 26 }}
          >
            {copied ? <path d="M3 8.5l3 3 7-7" /> : <path d="M5.5 5.5V3.5h7v7h-2M3.5 5.5h7v7h-7z" />}
          </motion.svg>
        </AnimatePresence>
      </span>
      <span className="sr-only" aria-live="polite">
        {copied ? "Email copied" : ""}
      </span>
    </button>
  );
}

export function Contact() {
  return (
    <section id="contact" className="relative mx-auto max-w-[1200px] px-5 pb-20 pt-20 sm:px-8 md:pt-28">
      <div className="grid gap-14 lg:grid-cols-[1.2fr_1fr] lg:items-end">
        <div>
          <p className="eyebrow mb-6">{story.contact.index} — {story.contact.label}</p>
          <SplitHeading
            text={story.contact.heading}
            italic={story.contact.italic}
            className="font-display text-[clamp(2.6rem,6.4vw,5.4rem)] leading-[0.98]"
          />
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-[460px] text-[1.02rem] leading-relaxed text-ink-soft">
              Looking for a no-code developer or a product manager? Project, question, or just a conversation — I&apos;d like to hear from you.
            </p>
            <div className="mt-9">
              <Magnetic strength={0.3}>
                <a
                  href={contact.call}
                  target="_blank"
                  rel="noreferrer"
                  className="press group flex h-14 items-center gap-3 rounded-full bg-teal pl-7 pr-2 text-[0.98rem] font-medium text-paper shadow-[var(--shadow-md)] hover:bg-ink"
                >
                  Book a Google Meet
                  <span className="flex size-10 items-center justify-center rounded-full bg-paper/15 transition-transform duration-300 group-hover:rotate-[-45deg]">
                    <Arrow />
                  </span>
                </a>
              </Magnetic>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="space-y-2.5">
          <CopyEmail />
          {channels.map((c) => (
            <a
              key={c.label}
              href={c.href}
              target="_blank"
              rel="noreferrer"
              className="spotlight press group flex items-center justify-between gap-4 rounded-[20px] border border-line bg-card px-5 py-4 hover:border-teal/40"
            >
              <span>
                <span className="block font-mono text-[0.66rem] uppercase tracking-[0.14em] text-muted">{c.label}</span>
                <span className="mt-1 block text-[0.98rem] text-ink">{c.value}</span>
              </span>
              <span className="flex size-9 items-center justify-center rounded-full border border-line-strong text-ink transition-[transform,background-color,color,border-color] duration-300 group-hover:-rotate-45 group-hover:border-teal group-hover:bg-teal group-hover:text-paper">
                <Arrow />
              </span>
            </a>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
