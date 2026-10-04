"use client";

import { useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { Select } from "@react-three/postprocessing";
import * as THREE from "three";
import { targetStore, useStore } from "./store";
import { wood } from "./textures";
import type { SpotId, V3 } from "./world";

export type { V3 };

let cached: ReturnType<typeof make> | null = null;
function make() {
  const std = (p: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial(p);
  const phys = (p: THREE.MeshPhysicalMaterialParameters) => new THREE.MeshPhysicalMaterial(p);
  const woodMat = (tone: "walnut" | "oak" | "mahogany" | "teak", roughness: number, r: [number, number] = [1, 1]) => {
    const map = wood(tone, r);
    // standard, not physical: wood is everywhere, so it has to be cheap to shade
    return std({ map, bumpMap: map, bumpScale: 0.6, roughness: roughness * 0.85 });
  };
  return {
    walnut: woodMat("walnut", 0.5),
    mahogany: woodMat("mahogany", 0.45, [2, 1]),
    oak: woodMat("oak", 0.55),
    teak: woodMat("teak", 0.5),
    brass: std({ color: "#c9a14f", metalness: 1, roughness: 0.32 }),
    chrome: std({ color: "#e4e6e6", metalness: 1, roughness: 0.16 }),
    black: std({ color: "#1d1b19", roughness: 0.45 }),
    iron: std({ color: "#2a2826", metalness: 0.6, roughness: 0.6 }),
    leather: phys({ color: "#5b2a1e", roughness: 0.48, clearcoat: 0.3, clearcoatRoughness: 0.5 }),
    velvetTeal: phys({ color: "#2f5f5c", roughness: 0.92, sheen: 1, sheenColor: new THREE.Color("#7fb3ab"), sheenRoughness: 0.5 }),
    velvetMustard: phys({ color: "#b98428", roughness: 0.92, sheen: 1, sheenColor: new THREE.Color("#f1d08a"), sheenRoughness: 0.5 }),
    knit: phys({ color: "#e9dcc4", roughness: 1, sheen: 0.8, sheenColor: new THREE.Color("#ffffff"), sheenRoughness: 0.8 }),
    linenWarm: std({ color: "#f3e2b8", emissive: "#ffb85c", emissiveIntensity: 1.1, roughness: 0.8, side: THREE.DoubleSide }),
    bulb: std({ color: "#fff1cf", emissive: "#ffd28a", emissiveIntensity: 5 }),
    flame: new THREE.MeshBasicMaterial({ color: "#ffb347", transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }),
    paper: std({ color: "#f5eedf", roughness: 0.9 }),
    ink: std({ color: "#2a2116", roughness: 0.6 }),
    ceramic: phys({ color: "#efe7d8", roughness: 0.25, clearcoat: 0.6 }),
    mint: phys({ color: "#a9d3c0", roughness: 0.35, clearcoat: 0.7, clearcoatRoughness: 0.2 }),
    cream: std({ color: "#efe6d4", roughness: 0.6 }),
    stone: phys({ color: "#e7dfcf", roughness: 0.35, clearcoat: 0.3 }),
    brick: std({ color: "#7a3d2c", roughness: 0.95 }),
    soot: std({ color: "#120d0a", roughness: 1 }),
    plaster: std({ color: "#efe6d6", roughness: 0.95 }),
    leaf: std({ color: "#3f7a4c", roughness: 0.7, side: THREE.DoubleSide }),
    // plants: per-leaf colour comes from the instance, the base-to-tip gradient from the geometry
    foliage: std({ color: "#ffffff", vertexColors: true, roughness: 0.55, side: THREE.DoubleSide }),
    stem: std({ color: "#55703f", roughness: 0.8 }),
    soil: std({ color: "#3a2a1c", roughness: 1 }),
    terracotta: std({ color: "#b5643f", roughness: 0.8 }),
    fabricTeal: phys({ color: "#2f6b66", roughness: 0.95, sheen: 0.5, sheenColor: new THREE.Color("#8fc9c0") }),
    fabricCream: phys({ color: "#ede3cf", roughness: 0.95, sheen: 0.5, sheenColor: new THREE.Color("#ffffff") }),
    fabricRust: phys({ color: "#9a4a33", roughness: 0.95, sheen: 0.5, sheenColor: new THREE.Color("#e39a7c") }),
    vinyl: phys({ color: "#8f3a2b", roughness: 0.4, clearcoat: 0.6 }),
    cork: std({ color: "#b98d5c", roughness: 1 }),
    // (no transmission: it forces a second full render of the scene whenever a candle is on screen)
    wax: std({ color: "#f3ead8", roughness: 0.5, emissive: "#ffcf8a", emissiveIntensity: 0.06 }),
    fur: phys({ color: "#d08a4a", roughness: 1, sheen: 1, sheenColor: new THREE.Color("#f4c48a"), sheenRoughness: 0.6 }),
    furLight: phys({ color: "#f2e2c8", roughness: 1, sheen: 1, sheenColor: new THREE.Color("#ffffff"), sheenRoughness: 0.6 }),
  };
}
/** Shared materials (created once, on the client). */
export const mats = () => (cached ??= make());

export function Mesh({
  p,
  r,
  s,
  m,
  children,
  cast = true,
  receive = true,
}: {
  p?: V3;
  r?: V3;
  s?: V3 | number;
  m: THREE.Material;
  children: ReactNode;
  cast?: boolean;
  receive?: boolean;
}) {
  return (
    <mesh position={p} rotation={r} scale={s} material={m} castShadow={cast} receiveShadow={receive}>
      {children}
    </mesh>
  );
}

export const Box = ({ w, h, d }: { w: number; h: number; d: number }) => <boxGeometry args={[w, h, d]} />;
export const Cyl = ({ t, b, h, seg = 24 }: { t: number; b: number; h: number; seg?: number }) => <cylinderGeometry args={[t, b, h, seg]} />;
export const Ball = ({ r, seg = 20 }: { r: number; seg?: number }) => <sphereGeometry args={[r, seg, Math.max(8, Math.round((seg * 3) / 4))]} />;

/** Outlines its children while they're under the crosshair. */
export function Hi({ id, children }: { id: SpotId; children: ReactNode }) {
  const target = useStore(targetStore);
  return <Select enabled={target === id}>{children}</Select>;
}

/* ---------------------------------- plants ---------------------------------- */

type LeafShape = "lance" | "heart" | "split" | "round";
const leafCache = new Map<LeafShape, THREE.BufferGeometry>();

/**
 * One leaf, 1 unit long along +Y: a curved blade with a creased midrib and a tip that
 * curls away, darker at the base. "split" is a monstera leaf with fenestrations.
 */
function leafGeometry(shape: LeafShape) {
  const hit = leafCache.get(shape);
  if (hit) return hit;
  const U = 8;
  const V = 14;
  const width = (v: number) => {
    if (shape === "lance") return 0.12 * Math.sin(Math.PI * Math.pow(v, 0.7));
    if (shape === "round") return 0.42 * Math.sin(Math.PI * Math.pow(v, 0.6));
    // heart: lobed at the base, pointed at the tip
    return 0.44 * Math.sin(Math.PI * Math.pow(0.16 + 0.84 * v, 0.85));
  };
  const pos: number[] = [];
  const col: number[] = [];
  for (let j = 0; j <= V; j++) {
    const v = j / V;
    for (let i = 0; i <= U; i++) {
      const u = (i / U) * 2 - 1;
      const hw = width(v);
      // heart leaves: the base lobes sweep back past the stalk, leaving a notch in the middle
      const lobe = shape === "heart" || shape === "split" ? 0.14 * Math.abs(u) * Math.pow(1 - v, 3) : 0;
      pos.push(u * hw, v - lobe, Math.abs(u) * hw * 0.32 - 0.22 * v * v);
      const c = 0.72 + 0.28 * Math.min(1, v * 1.2) * (0.75 + 0.25 * Math.abs(u));
      col.push(c, c, c);
    }
  }
  const idx: number[] = [];
  for (let j = 0; j < V; j++)
    for (let i = 0; i < U; i++) {
      const u = Math.abs(((i + 0.5) / U) * 2 - 1);
      // monstera slits: a few rows open from the edge in towards the midrib
      if (shape === "split" && u > 0.4 && (j === 4 || j === 7 || j === 10)) continue;
      const a = j * (U + 1) + i;
      const b = a + 1;
      const c = a + U + 1;
      const d = c + 1;
      idx.push(a, c, b, b, c, d);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  leafCache.set(shape, g);
  return g;
}

let stemGeo: THREE.BufferGeometry | null = null;
/** A thin stalk, 1 unit long along +Y from its base. */
const stemGeometry = () => (stemGeo ??= new THREE.CylinderGeometry(0.5, 0.7, 1, 6, 1).translate(0, 0.5, 0));

/** deterministic 0..1 noise, so plants look hand-placed but never change between renders */
const rnd = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

type PlantKind = "fern" | "monstera" | "small" | "trailing";
const GREENS = ["#2f6b3f", "#3f7a4c", "#4f8a55", "#5f9a5c", "#386f45"];

function plantLayout(kind: PlantKind) {
  const blades: THREE.Matrix4[] = [];
  const colors: THREE.Color[] = [];
  const stems: THREE.Matrix4[] = [];
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const o = new THREE.Object3D();
  const put = (list: THREE.Matrix4[], x: number, y: number, z: number, rx: number, ry: number, rz: number, sx: number, sy = sx, sz = sx) => {
    o.position.set(x, y, z);
    o.quaternion.copy(q.setFromEuler(e.set(rx, ry, rz, "YXZ")));
    o.scale.set(sx, sy, sz);
    o.updateMatrix();
    list.push(o.matrix.clone());
  };
  const leaf = (i: number) => colors.push(new THREE.Color(GREENS[Math.floor(rnd(i * 3.1) * GREENS.length)]));
  const base = 0.42;

  if (kind === "monstera") {
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + rnd(i) * 0.5;
      const tilt = 0.25 + rnd(i + 9) * 0.55;
      const sl = 0.3 + rnd(i + 4) * 0.35;
      // the stalk leans out; the blade sits on its tip, opened flatter
      put(stems, 0, base, 0, -tilt, a, 0, 0.014, sl, 0.014);
      const tx = -Math.sin(a) * Math.sin(tilt) * sl;
      const tz = -Math.cos(a) * Math.sin(tilt) * sl;
      put(blades, tx, base + Math.cos(tilt) * sl, tz, -(tilt + 0.55 + rnd(i + 2) * 0.3), a, (rnd(i + 7) - 0.5) * 0.4, 0.32 + rnd(i + 5) * 0.12);
      leaf(i);
    }
  } else if (kind === "fern") {
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2 + rnd(i) * 0.4;
      const tilt = 0.15 + rnd(i + 3) * 0.75;
      put(blades, 0, base, 0, -tilt, a, (rnd(i + 1) - 0.5) * 0.5, 0.5 + rnd(i + 6) * 0.35);
      leaf(i);
    }
  } else if (kind === "small") {
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 + rnd(i) * 0.6;
      put(blades, 0, base, 0, -(0.5 + rnd(i + 2) * 0.7), a, 0, 0.13 + rnd(i + 4) * 0.06);
      leaf(i);
    }
  } else {
    // trailing pothos: a few vines spill over the rim and hang down the side
    for (let v = 0; v < 5; v++) {
      const a = (v / 5) * Math.PI * 2 + rnd(v) * 0.7;
      const n = 4 + Math.floor(rnd(v + 3) * 4);
      for (let k = 0; k < n; k++) {
        const r = Math.min(0.21, 0.08 + k * 0.05);
        const y = base + 0.03 - Math.max(0, k - 1) * 0.1;
        const side = k % 2 ? 0.5 : -0.5;
        put(blades, -Math.sin(a) * r, y, -Math.cos(a) * r, -(k < 2 ? 1.1 : 1.9 + rnd(k + v) * 0.4), a + side * 0.6, side, 0.1 + rnd(v * 7 + k) * 0.04);
        leaf(v * 10 + k);
      }
    }
  }
  return { blades, colors, stems };
}

/** A potted plant: curved leaves on stalks, two draw calls, never identical twice. */
export function Plant({ p, s = 1, kind = "fern" }: { p: V3; s?: number; kind?: PlantKind }) {
  const k = mats();
  const layout = useMemo(() => plantLayout(kind), [kind]);
  const shape: LeafShape = kind === "monstera" ? "split" : kind === "fern" ? "lance" : kind === "small" ? "round" : "heart";
  const blades = useRef<THREE.InstancedMesh>(null);
  const stalks = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const b = blades.current;
    if (b) {
      layout.blades.forEach((m, i) => {
        b.setMatrixAt(i, m);
        b.setColorAt(i, layout.colors[i]);
      });
      b.instanceMatrix.needsUpdate = true;
      if (b.instanceColor) b.instanceColor.needsUpdate = true;
      b.computeBoundingSphere();
    }
    const st = stalks.current;
    if (st) {
      layout.stems.forEach((m, i) => st.setMatrixAt(i, m));
      st.instanceMatrix.needsUpdate = true;
      st.computeBoundingSphere();
    }
  }, [layout]);
  const clay = kind === "small" || kind === "trailing";
  return (
    <group position={p} scale={s}>
      <Mesh p={[0, 0.2, 0]} m={clay ? k.terracotta : k.ceramic}>
        <Cyl t={0.2} b={0.15} h={0.4} />
      </Mesh>
      {/* rolled rim, and soil that sits proud of the top of the pot (no coplanar faces to flicker) */}
      <Mesh p={[0, 0.395, 0]} r={[Math.PI / 2, 0, 0]} m={clay ? k.terracotta : k.ceramic} cast={false}>
        <torusGeometry args={[0.2, 0.018, 8, 28]} />
      </Mesh>
      <Mesh p={[0, 0.405, 0]} m={k.soil} cast={false}>
        <Cyl t={0.17} b={0.185} h={0.03} />
      </Mesh>
      <instancedMesh ref={blades} args={[leafGeometry(shape), k.foliage, layout.blades.length]} castShadow />
      {layout.stems.length > 0 && <instancedMesh ref={stalks} args={[stemGeometry(), k.stem, layout.stems.length]} castShadow />}
    </group>
  );
}

/** Floor / table lamp with a warm fabric shade. */
export function ShadeLamp({ p, h = 1.5, intensity = 3, shade = 0.22, light = true }: { p: V3; h?: number; intensity?: number; shade?: number; light?: boolean }) {
  const k = mats();
  return (
    <group position={p}>
      <Mesh p={[0, 0.02, 0]} m={k.brass}>
        <Cyl t={0.14} b={0.16} h={0.04} />
      </Mesh>
      <Mesh p={[0, h / 2, 0]} m={k.brass}>
        <Cyl t={0.015} b={0.015} h={h} seg={8} />
      </Mesh>
      <Mesh p={[0, h + 0.05, 0]} m={k.linenWarm} cast={false}>
        <cylinderGeometry args={[shade * 0.65, shade, shade * 1.1, 24, 1, true]} />
      </Mesh>
      <Mesh p={[0, h, 0]} m={k.bulb} cast={false}>
        <Ball r={0.035} seg={10} />
      </Mesh>
      {light && <pointLight position={[0, h, 0]} color="#ffb867" intensity={intensity} distance={4.5} decay={2} />}
    </group>
  );
}

/** A candle with a flickering flame (no light of its own — the room light does that). */
export function Candle({ p, h = 0.14 }: { p: V3; h?: number }) {
  const k = mats();
  const f = useRef<THREE.Mesh>(null);
  const seed = useRef(p[0] * 13.1 + p[2] * 7.7);
  useFrame(({ clock }) => {
    if (!f.current) return;
    const t = clock.elapsedTime * 9 + seed.current;
    const n = Math.sin(t) * 0.5 + Math.sin(t * 2.3) * 0.3 + Math.sin(t * 5.1) * 0.2;
    f.current.scale.set(0.6 + n * 0.05, 1.6 + n * 0.25, 0.6 + n * 0.05);
    f.current.rotation.z = n * 0.08;
  });
  return (
    <group position={p}>
      <Mesh p={[0, h / 2, 0]} m={k.wax}>
        <Cyl t={0.025} b={0.027} h={h} seg={14} />
      </Mesh>
      <mesh ref={f} position={[0, h + 0.03, 0]} scale={[0.6, 1.6, 0.6]} material={k.flame}>
        <sphereGeometry args={[0.018, 10, 8]} />
      </mesh>
    </group>
  );
}
