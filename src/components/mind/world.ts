// The floor plan of Ali's home. Units are metres, y is up, the front door is at +z.
//
//                    back (z = -7)
//   ┌──────────────────┬──────┬──────────────────┐
//   │      STUDY       │      │     BEDROOM      │
//   │ desk + laptop,   │      │  bed, mirror,    │
//   │ shelves, plaques │ HALL │  corkboard       │
//   ├────────▓▓────────┤      ├──────────────────┤
//   │   LIVING ROOM    │      │     KITCHEN      │
//   │ fireplace, sofa, │      │ fridge, kettle   │
//   │ TV, record       │      │                  │
//   └──────────────────┴─┤  ├─┴──────────────────┘
//                     front door (z = +7)

import type { WallStyle } from "./textures";

export type V3 = [number, number, number];

export const HOUSE = { halfW: 9, halfD: 7, height: 3, hallHalf: 2, wallT: 0.16, doorHalf: 0.75 };
export const PLAYER_RADIUS = 0.3;
export const EYE = 1.64;
export const START: [number, number] = [0, 4.6];

export type RoomId = "hall" | "study" | "living" | "kitchen" | "bedroom";
export const ROOMS: { id: RoomId; name: string; minX: number; maxX: number; minZ: number; maxZ: number; style: WallStyle; floor: "wood" | "tile" }[] = [
  { id: "hall", name: "The Hall", minX: -2, maxX: 2, minZ: -7, maxZ: 7, style: "hall", floor: "wood" },
  { id: "study", name: "The Study", minX: -9, maxX: -2, minZ: -7, maxZ: 0, style: "study", floor: "wood" },
  { id: "living", name: "The Living Room", minX: -9, maxX: -2, minZ: 0, maxZ: 7, style: "living", floor: "wood" },
  { id: "kitchen", name: "The Kitchen", minX: 2, maxX: 9, minZ: 0, maxZ: 7, style: "kitchen", floor: "tile" },
  { id: "bedroom", name: "The Bedroom", minX: 2, maxX: 9, minZ: -7, maxZ: 0, style: "bedroom", floor: "wood" },
];
export const roomAt = (x: number, z: number) =>
  ROOMS.find((r) => r.id !== "hall" && x >= r.minX && x <= r.maxX && z >= r.minZ && z <= r.maxZ) ?? ROOMS[0];

/* ---------------------------------- walls ---------------------------------- */

/** `a` / `b` = the room style on the wall's positive / negative side. */
export type WallSeg = { x1: number; z1: number; x2: number; z2: number; a: WallStyle; b: WallStyle };

const { halfW: W, halfD: D, hallHalf: HH, doorHalf: DH } = HOUSE;
const DOOR_Z = 3.5;

function withDoors(fixed: number, from: number, to: number, doors: number[], axis: "x" | "z", a: WallStyle, b: WallStyle): WallSeg[] {
  const cuts = [from, ...doors.flatMap((d) => [d - DH, d + DH]), to];
  const segs: WallSeg[] = [];
  for (let i = 0; i < cuts.length; i += 2) {
    const [s, e] = [cuts[i], cuts[i + 1]];
    segs.push(axis === "x" ? { x1: fixed, z1: s, x2: fixed, z2: e, a, b } : { x1: s, z1: fixed, x2: e, z2: fixed, a, b });
  }
  return segs;
}

export const WALLS: WallSeg[] = [
  { x1: -W, z1: -D, x2: -HH, z2: -D, a: "study", b: "plain" },
  { x1: -HH, z1: -D, x2: HH, z2: -D, a: "hall", b: "plain" },
  { x1: HH, z1: -D, x2: W, z2: -D, a: "bedroom", b: "plain" },
  { x1: -W, z1: D, x2: -HH, z2: D, a: "plain", b: "living" },
  ...withDoors(D, -HH, HH, [0], "z", "plain", "hall"),
  { x1: HH, z1: D, x2: W, z2: D, a: "plain", b: "kitchen" },
  { x1: -W, z1: -D, x2: -W, z2: 0, a: "study", b: "plain" },
  { x1: -W, z1: 0, x2: -W, z2: D, a: "living", b: "plain" },
  { x1: W, z1: -D, x2: W, z2: 0, a: "plain", b: "bedroom" },
  { x1: W, z1: 0, x2: W, z2: D, a: "plain", b: "kitchen" },
  ...withDoors(-HH, -D, 0, [-DOOR_Z], "x", "hall", "study"),
  ...withDoors(-HH, 0, D, [DOOR_Z], "x", "hall", "living"),
  ...withDoors(HH, -D, 0, [-DOOR_Z], "x", "bedroom", "hall"),
  ...withDoors(HH, 0, D, [DOOR_Z], "x", "kitchen", "hall"),
  { x1: -W, z1: 0, x2: -HH, z2: 0, a: "living", b: "study" },
  { x1: HH, z1: 0, x2: W, z2: 0, a: "kitchen", b: "bedroom" },
];

export const DOORWAYS = [
  { x: -HH, z: -DOOR_Z },
  { x: -HH, z: DOOR_Z },
  { x: HH, z: -DOOR_Z },
  { x: HH, z: DOOR_Z },
];

/* ---------------------------------- layout ---------------------------------- */

export const HALL = {
  console: { x: -1.68, z: 1.2 },
  mirror: { x: -1.905, y: 1.72, z: 1.2 },
  diploma: { x: 1.9, z: 1.2 },
  frames: [-0.4, 2.45],
  coat: { x: 1.55, z: 6.0 },
  shoes: { x: -1.6, z: 6.1 },
  clock: { x: 0, z: -6.72 },
};
export const STUDY = {
  desk: { x: -5.5, z: -6.35 },
  chair: { x: -5.5, z: -5.55 },
  shelves: { x: -8.7, z: -3.6 },
  plaques: { x: -5.5, z: -0.115 },
  globe: { x: -3.0, z: -6.2 },
  reading: { x: -7.6, z: -1.3 },
  /** a freestanding cheval mirror in the corner, turned to face the desk chair */
  mirror: { x: -7.55, z: -6.3, rotY: 1.23 },
};
export const LIVING = {
  fire: { x: -5.5, z: 0.08 },
  table: { x: -5.5, z: 2.3 },
  sofa: { x: -5.5, z: 3.78 },
  armchair: { x: -7.6, z: 1.45, heading: 2.0 },
  tv: { x: -8.65, z: 4.9 },
  sideboard: { x: -5.6, z: 6.65 },
};
export const KITCHEN = {
  counter: { x: 8.55, z: 3.0 },
  fridge: { x: 8.45, z: 6.2 },
  table: { x: 5.0, z: 3.2 },
};
export const BEDROOM = {
  bed: { x: 5.6, z: -5.85 },
  board: { x: 8.88, z: -3.2 },
  wardrobe: { x: 3.0, z: -6.55 },
  nightstands: [4.4, 6.8],
  mirror: { x: 2.1, z: -1.35 },
};

/* --------------------------------- collision --------------------------------- */

export type Box = { minX: number; minZ: number; maxX: number; maxZ: number };
const box = (cx: number, cz: number, w: number, d: number): Box => ({ minX: cx - w / 2, minZ: cz - d / 2, maxX: cx + w / 2, maxZ: cz + d / 2 });

export const BOXES: Box[] = [
  ...WALLS.map((s) => ({
    minX: Math.min(s.x1, s.x2) - HOUSE.wallT / 2,
    maxX: Math.max(s.x1, s.x2) + HOUSE.wallT / 2,
    minZ: Math.min(s.z1, s.z2) - HOUSE.wallT / 2,
    maxZ: Math.max(s.z1, s.z2) + HOUSE.wallT / 2,
  })),
  box(0, D, 1.6, 0.4),
  // hall
  box(HALL.console.x, HALL.console.z, 0.45, 1.2),
  box(HALL.coat.x, HALL.coat.z, 0.5, 0.5),
  box(HALL.shoes.x, HALL.shoes.z, 0.42, 0.9),
  box(HALL.clock.x, HALL.clock.z, 0.65, 0.45),
  // study
  box(STUDY.desk.x, STUDY.desk.z, 2.0, 0.85),
  box(STUDY.chair.x, STUDY.chair.z, 0.6, 0.6),
  box(STUDY.shelves.x, STUDY.shelves.z, 0.5, 4.2),
  box(STUDY.globe.x, STUDY.globe.z, 0.6, 0.6),
  box(STUDY.reading.x, STUDY.reading.z, 0.95, 0.95),
  box(STUDY.mirror.x, STUDY.mirror.z, 0.8, 0.8),
  box(-8.4, -0.45, 0.4, 0.4),
  // living
  box(LIVING.fire.x, 0.4, 2.1, 0.75),
  box(LIVING.table.x, LIVING.table.z, 1.15, 0.65),
  box(LIVING.sofa.x, LIVING.sofa.z, 2.3, 0.9),
  box(LIVING.armchair.x, LIVING.armchair.z, 0.95, 0.95),
  box(-8.35, 2.6, 0.5, 0.5),
  box(LIVING.tv.x, LIVING.tv.z, 0.55, 1.65),
  box(LIVING.sideboard.x, LIVING.sideboard.z, 2.2, 0.55),
  box(-3.3, 5.0, 0.45, 0.45),
  // kitchen
  box(KITCHEN.counter.x, KITCHEN.counter.z, 0.75, 3.8),
  box(KITCHEN.fridge.x, KITCHEN.fridge.z, 0.85, 0.8),
  box(KITCHEN.table.x, KITCHEN.table.z, 1.9, 1.9),
  // bedroom
  box(BEDROOM.bed.x, BEDROOM.bed.z, 1.75, 2.3),
  box(BEDROOM.wardrobe.x, BEDROOM.wardrobe.z, 1.4, 0.75),
  ...BEDROOM.nightstands.map((x) => box(x, -6.65, 0.55, 0.5)),
];

/** Push a point out of every collider (two passes so corners resolve cleanly). */
export function resolve(p: { x: number; z: number }) {
  const r = PLAYER_RADIUS;
  for (let pass = 0; pass < 2; pass++)
    for (const b of BOXES) {
      const cx = Math.max(b.minX, Math.min(p.x, b.maxX));
      const cz = Math.max(b.minZ, Math.min(p.z, b.maxZ));
      const dx = p.x - cx;
      const dz = p.z - cz;
      const d = Math.hypot(dx, dz);
      if (d >= r) continue;
      if (d > 1e-5) {
        p.x = cx + (dx / d) * r;
        p.z = cz + (dz / d) * r;
      } else {
        const out = [p.x - b.minX, b.maxX - p.x, p.z - b.minZ, b.maxZ - p.z];
        const i = out.indexOf(Math.min(...out));
        if (i === 0) p.x = b.minX - r;
        if (i === 1) p.x = b.maxX + r;
        if (i === 2) p.z = b.minZ - r;
        if (i === 3) p.z = b.maxZ + r;
      }
    }
}

/* ------------------------------- interactions ------------------------------- */

export type SpotId =
  | "phone"
  | "hallMirror"
  | "diploma"
  | "clock"
  | "desk"
  | "laptop"
  | "shelves"
  | "plaques"
  | "globe"
  | "fire"
  | "sofa"
  | "armchair"
  | "tv"
  | "record"
  | "kettle"
  | "fridge"
  | "bed"
  | "board"
  | "bedMirror";

export type View = { pos: V3; look: V3 };
export type Seat = { hips: V3; heading: number; eye: V3 };
export type Spot = {
  id: SpotId;
  label: string;
  /** inspect = camera zooms onto it; action = something happens; seat = sit down */
  kind: "inspect" | "action" | "seat";
  /** where you need to stand (xz) and how close */
  x: number;
  z: number;
  r: number;
  /** what you look at to select it */
  focus: V3;
  views?: View[];
  seat?: Seat;
  /** only reachable while sitting on this seat (and never while walking) */
  seatedAt?: SpotId;
};

/** The six milestone plaques on the study wall (world positions of their faces). */
export const PLAQUES: { title: string; sub: string; detail: string; pos: V3 }[] = [
  ["B2B Media Marketplace", "Live · web, iOS & Android", "A marketplace connecting media professionals across the Middle East. Built solo in Bubble: 30+ data types, bilingual, native apps on both stores."],
  ["Admin Dashboard", "For non-technical teams", "The control centre: user verification, company approvals, moderation, news publishing, CRM sync. Built so operations never needs a developer."],
  ["mena.tv Wiki", "120+ pages", "User guides, admin procedures, technical architecture, troubleshooting. The team runs the platform without calling him."],
  ["QA Coordination", "Every critical bug closed", "Recruited and managed remote testers, ran testing episodes, and closed every critical bug before launch."],
  ["Product Backlogs", "Roadmap → sprint → done", "Interconnected Airtable bases: epics, user stories, sprints, bugs, QA and CRM in one tidy system."],
  ["First Bubble Build", "Analytics portal · 2021", "A subscription portal for TV viewership analytics. Where it all started — learned the platform by building it."],
].map(([title, sub, detail], i) => ({
  title,
  sub,
  detail,
  // the board hangs on the study side of the divider; reading order runs left → right
  pos: [STUDY.plaques.x + (1 - (i % 3)) * 0.95, i < 3 ? 2.05 : 1.5, STUDY.plaques.z - 0.03] as V3,
}));

/**
 * Groundwork for the "scattered ideas" hunt (not wired up yet; see PLAN.md).
 * The scattered ideas: six messy notes hidden around the house. Each is the raw,
 * tangled version of something Ali actually shipped (the plaque it belongs to).
 */
export const IDEAS: { pos: V3; stand: [number, number]; where: string; messy: string; scrawl: string; plaque: number }[] = [
  {
    pos: [0.62, 0.05, -6.35],
    stand: [0.6, -5.5],
    where: "by the grandfather clock",
    messy: "A marketplace for media people?? Gigs, chat, payments, reviews... in Arabic AND English. Apps too!!",
    scrawl: "media gigs?? chat + $ + arabic!!",
    plaque: 0,
  },
  {
    pos: [-6.75, 0.25, -0.6],
    stand: [-6.4, -1.45],
    where: "on the stack of books",
    messy: "Ops keep messaging the devs to approve every new user by hand. There has to be a button for this.",
    scrawl: "stop asking devs to approve users",
    plaque: 1,
  },
  {
    pos: [-6.05, 0.63, 3.7],
    stand: [-5.9, 2.85],
    where: "between the sofa cushions",
    messy: "Every time something breaks, the whole team calls the same person. Can the platform explain itself?",
    scrawl: "why does everyone call me??",
    plaque: 2,
  },
  {
    pos: [5.3, 0.79, 3.45],
    stand: [5.3, 2.15],
    where: "on the kitchen table",
    messy: "Launch is in three weeks and nobody has tested anything. Who tests? When? Where do bugs even go?",
    scrawl: "testing?? who?? when??",
    plaque: 3,
  },
  {
    pos: [6.95, 0.6, -6.52],
    stand: [7.25, -5.75],
    where: "on the nightstand",
    messy: "Tasks in a spreadsheet, bugs in a group chat, features in someone's notes app... where is the plan?",
    scrawl: "tasks in 5 places. plan = ?",
    plaque: 4,
  },
  {
    pos: [-8.6, 0.6, 4.3],
    stand: [-7.65, 4.15],
    where: "on the TV console",
    messy: "Sell TV viewership numbers by subscription. Monthly? Per channel? With charts?? Something like that.",
    scrawl: "TV ratings subscription?? charts?",
    plaque: 5,
  },
];

/** Window openings (centre, which way they face into the room, size) for the moonlight. */
export const WINDOWS: { x: number; y: number; z: number; rotY: number; w: number; h: number }[] = [
  { x: STUDY.desk.x, y: 1.75, z: -D + 0.09, rotY: 0, w: 1.4, h: 1.3 },
  { x: LIVING.sideboard.x, y: 1.85, z: D - 0.09, rotY: Math.PI, w: 1.4, h: 1.3 },
  { x: 5.0, y: 1.75, z: D - 0.09, rotY: Math.PI, w: 1.3, h: 1.3 },
  { x: 7.95, y: 1.75, z: -D + 0.09, rotY: 0, w: 1.1, h: 1.3 },
];

const v = (pos: V3, look: V3): View => ({ pos, look });

export const SPOTS: Spot[] = [
  // hall
  { id: "phone", label: "Pick up the phone", kind: "inspect", x: -1.0, z: 1.2, r: 1.3, focus: [-1.66, 0.92, 0.98], views: [v([-1.0, 1.42, 0.98], [-1.66, 0.88, 0.98])] },
  { id: "hallMirror", label: "Look in the mirror", kind: "inspect", x: -0.9, z: 1.3, r: 1.6, focus: [HALL.mirror.x, HALL.mirror.y, HALL.mirror.z], views: [v([-0.45, 1.7, 1.26], [HALL.mirror.x, 1.66, 1.2])] },
  { id: "diploma", label: "Read the diploma", kind: "inspect", x: 1.1, z: 1.2, r: 1.3, focus: [1.79, 1.65, 1.2], views: [v([1.12, 1.64, 1.2], [1.8, 1.63, 1.2])] },
  { id: "clock", label: "Check the time", kind: "inspect", x: 0, z: -5.6, r: 1.3, focus: [0, 1.65, -6.5], views: [v([0, 1.68, -5.75], [0, 1.62, -6.55])] },
  // study
  { id: "desk", label: "Sit at the desk", kind: "seat", x: -5.5, z: -5.0, r: 1.2, focus: [-5.5, 0.9, -6.3], seat: { hips: [-5.5, 0.55, -5.5], heading: Math.PI, eye: [-5.5, 1.15, -5.62] } },
  {
    id: "laptop",
    label: "Open the laptop",
    kind: "inspect",
    seatedAt: "desk",
    x: -5.5,
    z: -5.5,
    r: 0.8,
    focus: [-5.5, 0.95, -6.45],
    views: [v([-5.5, 1.13, -5.86], [-5.5, 0.93, -6.5])],
    seat: { hips: [-5.5, 0.55, -5.5], heading: Math.PI, eye: [-5.5, 1.15, -5.62] },
  },
  { id: "shelves", label: "Browse the bookshelf", kind: "inspect", x: -7.7, z: -3.6, r: 1.6, focus: [-8.6, 1.35, -3.6], views: [v([-7.45, 1.55, -3.6], [-8.7, 1.3, -3.6])] },
  {
    id: "plaques",
    label: "Read the plaques",
    kind: "inspect",
    x: -5.5,
    z: -1.4,
    r: 1.7,
    focus: [-5.5, 1.78, -0.15],
    views: [v([-5.5, 1.75, -2.3], [-5.5, 1.76, -0.15]), ...PLAQUES.map((p) => v([p.pos[0], p.pos[1], -0.9], [p.pos[0], p.pos[1], p.pos[2]]))],
  },
  { id: "globe", label: "Spin the globe", kind: "action", x: -3.0, z: -5.2, r: 1.0, focus: [-3.0, 0.98, -6.2] },
  // living
  { id: "fire", label: "Warm your hands", kind: "action", x: -5.5, z: 1.3, r: 1.1, focus: [-5.5, 0.45, 0.4] },
  { id: "sofa", label: "Sit on the sofa", kind: "seat", x: -5.0, z: 2.95, r: 1.2, focus: [-5.0, 0.6, 3.75], seat: { hips: [-5.0, 0.6, 3.72], heading: Math.PI, eye: [-5.0, 1.2, 3.62] } },
  {
    id: "armchair",
    label: "Sit by the fire",
    kind: "seat",
    x: -6.8,
    z: 1.9,
    r: 1.0,
    focus: [-7.6, 0.55, 1.45],
    seat: { hips: [-7.56, 0.56, 1.43], heading: LIVING.armchair.heading, eye: [-7.48, 1.16, 1.39] },
  },
  { id: "tv", label: "Watch the TV", kind: "inspect", x: -7.4, z: 4.9, r: 1.4, focus: [-8.4, 0.87, 4.85], views: [v([-7.5, 1.02, 4.85], [-8.42, 0.87, 4.85])] },
  { id: "record", label: "Play a record", kind: "action", x: -6.0, z: 5.75, r: 1.2, focus: [-6.05, 1.0, 6.65] },
  // kitchen
  { id: "kettle", label: "Put the kettle on", kind: "action", x: 7.6, z: 2.1, r: 1.2, focus: [8.55, 1.05, 2.06] },
  { id: "fridge", label: "Read the fridge notes", kind: "inspect", x: 7.3, z: 6.1, r: 1.2, focus: [8.09, 0.92, 6.2], views: [v([7.42, 1.02, 6.2], [8.1, 0.92, 6.2])] },
  // bedroom
  { id: "bed", label: "Sit on the bed", kind: "seat", x: 5.6, z: -4.0, r: 1.3, focus: [5.6, 0.6, -5.3], seat: { hips: [5.6, 0.62, -4.98], heading: 0, eye: [5.6, 1.2, -4.86] } },
  { id: "board", label: "Look at the corkboard", kind: "inspect", x: 7.8, z: -3.2, r: 1.4, focus: [8.85, 1.65, -3.2], views: [v([7.85, 1.66, -3.2], [8.9, 1.62, -3.2])] },
  {
    id: "bedMirror",
    label: "Look in the mirror",
    kind: "inspect",
    x: 3.1,
    z: -1.35,
    r: 1.6,
    focus: [BEDROOM.mirror.x, 1.2, BEDROOM.mirror.z],
    views: [v([3.75, 1.62, -1.3], [BEDROOM.mirror.x, 1.3, BEDROOM.mirror.z])],
  },
];

/** Every mirror in the house: the glass centre and the way it faces. */
export const MIRRORS: { id: string; pos: V3; normal: [number, number] }[] = [
  { id: "hall", pos: [HALL.mirror.x + 0.012, HALL.mirror.y, HALL.mirror.z], normal: [1, 0] },
  { id: "bedroom", pos: [BEDROOM.mirror.x + 0.012, 1.0, BEDROOM.mirror.z], normal: [1, 0] },
  { id: "study", pos: [STUDY.mirror.x, 1.0, STUDY.mirror.z], normal: [Math.sin(STUDY.mirror.rotY), Math.cos(STUDY.mirror.rotY)] },
];

export const spotById = (id: SpotId) => SPOTS.find((s) => s.id === id)!;
