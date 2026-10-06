"use client";

import { useSyncExternalStore } from "react";
import type { Project } from "@/content/projects";

/*
 * Ali's dashboard state, kept in this browser (localStorage) until the database phase.
 * The public site still reads src/content/*; "Export" hands the agency a JSON file to apply.
 */

export type AdminProject = Project & { hidden?: boolean };
export type AdminPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string; // yyyy-mm-dd
  tags: string[];
  published: boolean;
  body: string; // markdown
};
export type AdminClient = {
  id: string;
  name: string;
  company: string;
  station: number; // index into roadmap.stations
  note: string;
  updated: string; // yyyy-mm-dd
};
export type AdminState = { version: 1; projects: AdminProject[]; posts: AdminPost[]; clients: AdminClient[] };

const KEY = "ali-admin-v1";
let state: AdminState | null = null;
let seed: AdminState | null = null;
const listeners = new Set<() => void>();

function read(): AdminState | null {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as AdminState) : null;
    return parsed?.version === 1 ? parsed : null;
  } catch {
    return null;
  }
}

function write(next: AdminState) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // storage full or blocked: the session still works, it just won't persist
  }
  listeners.forEach((l) => l());
}

/** Call once with the site's current content; stored edits (if any) win over it. */
export function initAdmin(initial: AdminState) {
  seed = initial;
}

export const admin = {
  get: () => state ?? seed!,
  set: (fn: (s: AdminState) => AdminState) => write(fn(admin.get())),
  reset: () => {
    try {
      localStorage.removeItem(KEY);
    } catch {}
    state = null;
    listeners.forEach((l) => l());
  },
  /** Everything Ali changed, as a file the agency can apply to src/content. */
  exportJson: () => JSON.stringify(admin.get(), null, 2),
};

function subscribe(cb: () => void) {
  if (!state) state = read();
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      state = read();
      cb();
    }
  };
  addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    removeEventListener("storage", onStorage);
  };
}

export function useAdmin(initial: AdminState): AdminState {
  return useSyncExternalStore(
    subscribe,
    () => state ?? initial,
    () => initial,
  );
}

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "untitled";

export const today = () => new Date().toISOString().slice(0, 10);

/** The private tracking link: the client's data rides in the URL fragment, which never reaches a server. */
export function trackLink(origin: string, c: AdminClient) {
  const data = { n: c.name, c: c.company, s: c.station, o: c.note, u: c.updated };
  const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(data))))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `${origin}/track#${b64}`;
}

export function readTrack(hash: string): { name: string; company: string; station: number; note: string; updated: string } | null {
  try {
    const b64 = hash.replace(/^#/, "").replace(/-/g, "+").replace(/_/g, "/");
    const d = JSON.parse(decodeURIComponent(escape(atob(b64))));
    if (typeof d.s !== "number") return null;
    return { name: String(d.n ?? ""), company: String(d.c ?? ""), station: d.s, note: String(d.o ?? ""), updated: String(d.u ?? "") };
  } catch {
    return null;
  }
}
