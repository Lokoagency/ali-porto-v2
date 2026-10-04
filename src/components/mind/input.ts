// One tiny mutable store the 3D loop reads every frame. React never re-renders from it.

export const input = {
  keys: new Set<string>(),
  /** touch joystick, -1..1 on each axis (y: up = forward) */
  joy: { x: 0, y: 0 },
  /** first-person look angles (radians). yaw 0 = looking down the hall toward the back. */
  yaw: 0,
  pitch: -0.05,
  sensitivity: 1,
  enabled: false,
};

const MOVE_KEYS = ["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright", "shift"];

export function bindKeyboard() {
  const down = (e: KeyboardEvent) => {
    const k = e.key.toLowerCase();
    if (!input.enabled || !MOVE_KEYS.includes(k)) return;
    if (k.startsWith("arrow")) e.preventDefault(); // don't scroll the page
    input.keys.add(k);
  };
  const up = (e: KeyboardEvent) => input.keys.delete(e.key.toLowerCase());
  const clear = () => input.keys.clear();
  addEventListener("keydown", down);
  addEventListener("keyup", up);
  addEventListener("blur", clear);
  return () => {
    removeEventListener("keydown", down);
    removeEventListener("keyup", up);
    removeEventListener("blur", clear);
    clear();
  };
}

/** Desired move direction relative to where you look: x = right, y = forward. */
export function moveIntent() {
  const k = input.keys;
  let x = (k.has("d") || k.has("arrowright") ? 1 : 0) - (k.has("a") || k.has("arrowleft") ? 1 : 0);
  let y = (k.has("w") || k.has("arrowup") ? 1 : 0) - (k.has("s") || k.has("arrowdown") ? 1 : 0);
  x += input.joy.x;
  y += input.joy.y;
  const len = Math.hypot(x, y);
  if (len > 1) {
    x /= len;
    y /= len;
  }
  return { x, y, run: k.has("shift") || Math.hypot(input.joy.x, input.joy.y) > 0.92 };
}

/**
 * Mouse look. Browsers occasionally report huge spikes right after pointer lock;
 * those single events are dropped instead of whipping the camera around.
 */
export function look(dx: number, dy: number) {
  if (Math.abs(dx) > 300 || Math.abs(dy) > 300) return;
  const s = 0.0022 * input.sensitivity;
  input.yaw -= dx * s;
  input.pitch = Math.max(-1.35, Math.min(1.35, input.pitch - dy * s));
}
