"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

/** Small building blocks for the dashboard, in the site's own style. */

export const fieldCls =
  "w-full rounded-2xl border border-line bg-card px-4 py-2.5 text-[0.92rem] text-ink outline-none transition-[border-color,box-shadow] duration-300 placeholder:text-muted focus:border-teal focus:shadow-[0_0_0_4px_var(--teal-tint)]";

/** A labelled input with a live character count; going over the limit is blocked, so the design can't overflow. */
export function Field({
  label,
  value,
  onChange,
  max,
  hint,
  multiline,
  rows = 3,
  placeholder,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  max?: number;
  hint?: string;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
  error?: string;
}) {
  const near = max ? value.length > max * 0.9 : false;
  const Input = multiline ? "textarea" : "input";
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="font-mono text-[0.68rem] uppercase tracking-[0.12em] text-ink-soft">{label}</span>
        {max && (
          <span className={`font-mono text-[0.66rem] tabular transition-colors duration-300 ${near ? "text-sun" : "text-muted"}`}>
            {value.length}/{max}
          </span>
        )}
      </span>
      <Input
        className={`${fieldCls} ${multiline ? "resize-y leading-relaxed" : "h-11"} ${error ? "border-[#c0563b]" : ""}`}
        value={value}
        maxLength={max}
        rows={multiline ? rows : undefined}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      {(error || hint) && <span className={`mt-1 block text-[0.78rem] ${error ? "text-[#c0563b]" : "text-muted"}`}>{error ?? hint}</span>}
    </label>
  );
}

/** A segmented control with a pill that slides between options. */
export function Segmented<T extends string>({
  id,
  value,
  options,
  onChange,
}: {
  id: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="glass inline-flex gap-1 rounded-full p-1" role="radiogroup">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            className={`press relative h-9 rounded-full px-4 text-[0.8rem] ${on ? "text-paper" : "text-ink-soft hover:text-ink"}`}
          >
            {on && <motion.span layoutId={`seg-${id}`} className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
            <span className="relative">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function Button({
  children,
  onClick,
  tone = "ghost",
  type = "button",
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  tone?: "ink" | "ghost" | "danger";
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const cls =
    tone === "ink"
      ? "bg-ink text-paper hover:bg-teal shadow-[var(--shadow-sm)]"
      : tone === "danger"
        ? "border border-[#c0563b]/40 text-[#c0563b] hover:bg-[#c0563b] hover:text-paper"
        : "border border-line-strong text-ink hover:border-teal hover:text-teal";
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`press inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 text-[0.84rem] font-medium transition-[background-color,color,border-color] duration-300 disabled:pointer-events-none disabled:opacity-40 ${cls}`}
    >
      {children}
    </button>
  );
}

export function Panel({ title, children, aside }: { title: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className="rounded-[28px] border border-line bg-paper p-5 md:p-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-[1.5rem] leading-tight">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

/** A toggle switch (show on the site / published). */
export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`relative h-6 w-10 shrink-0 rounded-full transition-colors duration-300 before:absolute before:-inset-2.5 before:content-[""] ${on ? "bg-teal" : "bg-line-strong"}`}
    >
      <motion.span
        className="absolute top-0.5 size-5 rounded-full bg-paper shadow-[var(--shadow-sm)]"
        animate={{ x: on ? 18 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
      />
    </button>
  );
}
