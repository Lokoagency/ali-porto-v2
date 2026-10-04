import { useSyncExternalStore } from "react";
import type { SpotId } from "./world";

// Tiny external stores so per-frame decisions (what you're looking at, which plaque is
// in focus) only re-render the few components that care — never the whole house.

type Store<T> = { get: () => T; set: (v: T) => void; subscribe: (l: () => void) => () => void };

export function createStore<T>(initial: T): Store<T> {
  let value = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => value,
    set: (v) => {
      if (Object.is(v, value)) return;
      value = v;
      listeners.forEach((l) => l());
    },
    subscribe: (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
  };
}

/** The interactable currently under the crosshair. */
export const targetStore = createStore<SpotId | null>(null);
/** The thing being inspected (camera zoomed onto it) and which view of it. */
export const focusStore = createStore<{ id: SpotId; index: number } | null>(null);

/** The scattered-ideas hunt: which notes you have picked up, and when you sorted them. */
export type Quest = { found: number[]; sortedAt: number | null };
export const questStore = createStore<Quest>({ found: [], sortedAt: null });

export function useStore<T>(s: Store<T>) {
  return useSyncExternalStore(s.subscribe, s.get, s.get);
}
