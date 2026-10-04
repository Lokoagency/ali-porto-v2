"use client";

import { memo, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { projects } from "@/content/projects";
import { Ball, Box, Candle, Cyl, Hi, Mesh, Plant, ShadeLamp, mats } from "./kit";
import { Pendant, Rug, Window, ClockHands } from "./Home";
import { Mirror } from "./Mirror";
import { focusStore, useStore } from "./store";
import { paper, plaque, screenshot, spine, tvScreen } from "./textures";
import { BEDROOM, HOUSE, KITCHEN, LIVING, PLAQUES, STUDY } from "./world";

const { halfD: D } = HOUSE;
const E = 0.004; // keeps fronts/insets just proud of their surfaces (no z-fighting)

export type RoomSignals = { record: boolean; globeAt: number; kettleAt: number };

/* ================================ STUDY ================================ */

/** Ali's laptop. Idle, it cycles project covers; when you sit and browse, it shows that project's screens. */
function Laptop() {
  const k = mats();
  const focus = useStore(focusStore);
  const browsing = focus?.id === "laptop" ? focus.index : null;
  const screen = useRef<THREE.MeshBasicMaterial>(null);
  const state = useRef({ last: -10, i: 0, key: "" });

  useFrame(({ clock }) => {
    const m = screen.current;
    if (!m) return;
    const t = clock.elapsedTime;
    const list = browsing === null ? projects.map((p) => p.thumbnail) : projects[browsing].screenshots;
    const key = browsing === null ? "idle" : `p${browsing}`;
    const s = state.current;
    if (key !== s.key) {
      s.key = key;
      s.i = 0;
      s.last = t;
      m.map = screenshot(list[0]);
      m.needsUpdate = true;
    } else if (t - s.last > (browsing === null ? 4.5 : 3.2)) {
      s.last = t;
      s.i = (s.i + 1) % list.length;
      m.map = screenshot(list[s.i]);
      m.needsUpdate = true;
    }
    const f = Math.min(1, (t - s.last) / 0.3);
    m.color.setScalar((browsing === null ? 0.7 : 1) * (0.3 + 0.7 * f));
  });

  return (
    <group position={[0, 0.8, 0.05]}>
      <RoundedBox args={[0.42, 0.018, 0.3]} radius={0.008} material={k.chrome} castShadow />
      <Mesh p={[0, 0.0105, 0.05]} m={k.black} cast={false}>
        <Box w={0.36} h={0.002} d={0.13} />
      </Mesh>
      <group position={[0, 0.009, -0.15]} rotation={[-0.32, 0, 0]}>
        <RoundedBox args={[0.42, 0.28, 0.012]} radius={0.008} position={[0, 0.14, 0]} material={k.chrome} castShadow />
        <mesh position={[0, 0.145, 0.0075]}>
          <planeGeometry args={[0.38, 0.24]} />
          <meshBasicMaterial ref={screen} map={screenshot(projects[0].thumbnail)} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

/** Two tall shelves of books, sorted by colour (one instanced mesh, hundreds of spines). */
function Bookshelves() {
  const k = mats();
  const ref = useRef<THREE.InstancedMesh>(null);
  const shelves = 5;
  const perShelf = 22;
  const units = useMemo(() => [-1.05, 1.05], []);
  const count = shelves * perShelf * units.length;
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ map: spine(), roughness: 0.6 }), []);
  useLayoutEffect(() => {
    const im = ref.current!;
    const m = new THREE.Matrix4();
    const c = new THREE.Color();
    const q = new THREE.Quaternion();
    const palette = ["#12706b", "#7d2f26", "#1d3b37", "#c9a661", "#2f5f5c", "#5b2a1e", "#e9d7a8", "#3f6b67", "#8a5a32"];
    let i = 0;
    units.forEach((uz, u) => {
      for (let s = 0; s < shelves; s++) {
        const cols = Array.from({ length: perShelf }, (_, b) => palette[(b * 3 + s * 2 + u) % palette.length]).sort();
        let z = uz - 0.9;
        for (let b = 0; b < perShelf; b++) {
          const h = 0.26 + ((b * 7 + s * 3 + u) % 5) * 0.025;
          const w = 0.06 + ((b * 5 + s) % 3) * 0.012;
          // the last book on some shelves leans
          const lean = b === perShelf - 1 && s % 2 ? 0.25 : 0;
          q.setFromEuler(new THREE.Euler(lean, 0, 0));
          m.compose(new THREE.Vector3(0.02, 0.3 + s * 0.42 + h / 2, z + w / 2), q, new THREE.Vector3(0.22, h, w));
          im.setMatrixAt(i, m);
          im.setColorAt(i, c.set(cols[b]));
          z += w + 0.004;
          i++;
        }
      }
    });
    im.instanceMatrix.needsUpdate = true;
    if (im.instanceColor) im.instanceColor.needsUpdate = true;
  }, [units]);
  return (
    <group position={[STUDY.shelves.x, 0, STUDY.shelves.z]}>
      {units.map((z) => (
        <group key={z} position={[0, 0, z]}>
          <Mesh p={[-0.12, 1.15, 0]} m={k.walnut}>
            <Box w={0.04} h={2.3} d={2.0} />
          </Mesh>
          {[-1, 1].map((s) => (
            <Mesh key={s} p={[0, 1.15, s * 0.98]} m={k.walnut}>
              <Box w={0.3} h={2.3} d={0.04} />
            </Mesh>
          ))}
          {Array.from({ length: shelves + 1 }, (_, i) => (
            <Mesh key={i} p={[0, 0.28 + i * 0.42, 0]} m={k.walnut}>
              <Box w={0.3} h={0.03} d={1.96} />
            </Mesh>
          ))}
          <Mesh p={[0.02, 2.33, 0]} m={k.walnut}>
            <Box w={0.36} h={0.06} d={2.06} />
          </Mesh>
        </group>
      ))}
      <instancedMesh ref={ref} args={[undefined, undefined, count]} material={mat} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
      </instancedMesh>
      <group position={[0.38, 0, 0.1]} rotation={[0, 0, 0.18]}>
        {[-0.22, 0.22].map((z) => (
          <Mesh key={z} p={[0, 1.15, z]} m={k.brass}>
            <Cyl t={0.015} b={0.015} h={2.3} seg={8} />
          </Mesh>
        ))}
        {Array.from({ length: 7 }, (_, i) => (
          <Mesh key={i} p={[0, 0.3 + i * 0.3, 0]} r={[Math.PI / 2, 0, 0]} m={k.walnut}>
            <Cyl t={0.018} b={0.018} h={0.44} seg={8} />
          </Mesh>
        ))}
      </group>
    </group>
  );
}

/** The wall of brass milestone plaques. The one you're reading glows a little. */
function Plaques() {
  const k = mats();
  const focus = useStore(focusStore);
  const active = focus?.id === "plaques" && focus.index > 0 ? focus.index - 1 : -1;
  const plates = useMemo(
    () => PLAQUES.map((p) => new THREE.MeshStandardMaterial({ map: plaque(p.title, p.sub), metalness: 0.55, roughness: 0.32, emissive: "#ffd9a0", emissiveIntensity: 0 })),
    [],
  );
  useFrame((_, dt) => {
    plates.forEach((m, i) => {
      m.emissiveIntensity = THREE.MathUtils.damp(m.emissiveIntensity, i === active ? 0.07 : 0, 6, dt);
    });
  });
  return (
    <group position={[STUDY.plaques.x, 0, STUDY.plaques.z]} rotation={[0, Math.PI, 0]}>
      {plates.map((m, i) => {
        const x = ((i % 3) - 1) * 0.95;
        const y = i < 3 ? 2.05 : 1.5;
        return (
          <group key={i} position={[x, y, 0]}>
            <RoundedBox args={[0.82, 0.44, 0.04]} radius={0.015} material={k.walnut} castShadow />
            <mesh position={[0, 0, 0.021]} material={m}>
              <planeGeometry args={[0.68, 0.3]} />
            </mesh>
          </group>
        );
      })}
      {/* picture light */}
      <Mesh p={[0, 2.52, 0.12]} r={[0, 0, Math.PI / 2]} m={k.brass} cast={false}>
        <Cyl t={0.04} b={0.04} h={1.6} seg={12} />
      </Mesh>
      <mesh position={[0, 2.5, 0.12]}>
        <boxGeometry args={[1.5, 0.02, 0.05]} />
        <meshStandardMaterial color="#fff1cf" emissive="#ffd28a" emissiveIntensity={2} />
      </mesh>
    </group>
  );
}

function Globe({ spinAt }: { spinAt: number }) {
  const k = mats();
  const g = useRef<THREE.Group>(null);
  const spin = useRef({ vel: 0.1, last: 0 });
  const map = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 256;
    const g2 = c.getContext("2d")!;
    g2.fillStyle = "#2f6b66";
    g2.fillRect(0, 0, 512, 256);
    g2.fillStyle = "#e3cf9b";
    for (const [x, y, rx, ry] of [
      [120, 80, 60, 40],
      [150, 160, 30, 55],
      [270, 70, 45, 30],
      [285, 140, 40, 60],
      [380, 80, 80, 35],
      [430, 170, 30, 20],
    ]) {
      g2.beginPath();
      g2.ellipse(x, y, rx, ry, 0.3, 0, Math.PI * 2);
      g2.fill();
    }
    g2.strokeStyle = "rgba(255,255,255,0.2)";
    for (let y = 32; y < 256; y += 32) {
      g2.beginPath();
      g2.moveTo(0, y);
      g2.lineTo(512, y);
      g2.stroke();
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return new THREE.MeshPhysicalMaterial({ map: t, roughness: 0.35, clearcoat: 0.8 });
  }, []);
  useFrame((_, dt) => {
    const s = spin.current;
    if (spinAt !== s.last) {
      s.last = spinAt;
      s.vel = 9;
    }
    s.vel = THREE.MathUtils.damp(s.vel, 0.12, 0.9, dt);
    if (g.current) g.current.rotation.y += s.vel * dt;
  });
  return (
    <group position={[STUDY.globe.x, 0, STUDY.globe.z]}>
      {[0, 1, 2].map((i) => (
        <Mesh key={i} p={[Math.cos(i * 2.1) * 0.12, 0.35, Math.sin(i * 2.1) * 0.12]} r={[Math.sin(i * 2.1) * 0.15, 0, -Math.cos(i * 2.1) * 0.15]} m={k.walnut}>
          <Cyl t={0.018} b={0.022} h={0.7} seg={8} />
        </Mesh>
      ))}
      <group position={[0, 0.98, 0]} rotation={[0, 0, 0.41]}>
        <Mesh m={k.brass} r={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.3, 0.012, 8, 40, Math.PI * 1.4]} />
        </Mesh>
        <group ref={g}>
          <mesh material={map} castShadow>
            <sphereGeometry args={[0.27, 32, 24]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

function Armchair({ m, throwOn = false }: { m: THREE.Material; throwOn?: boolean }) {
  const k = mats();
  return (
    <group>
      <RoundedBox args={[0.85, 0.38, 0.78]} radius={0.1} position={[0, 0.36, 0]} material={m} castShadow receiveShadow />
      <RoundedBox args={[0.85, 0.72, 0.2]} radius={0.1} position={[0, 0.76, -0.32]} material={m} castShadow />
      {[-0.42, 0.42].map((x) => (
        <RoundedBox key={x} args={[0.15, 0.45, 0.78]} radius={0.07} position={[x, 0.55, 0]} material={m} castShadow />
      ))}
      {[-0.33, 0.33].map((x) =>
        [-0.28, 0.28].map((z) => (
          <Mesh key={`${x}${z}`} p={[x, 0.07, z]} m={k.walnut}>
            <Cyl t={0.03} b={0.022} h={0.14} seg={8} />
          </Mesh>
        )),
      )}
      {throwOn && <RoundedBox args={[0.5, 0.05, 0.86]} radius={0.025} position={[0.42, 0.8, 0.02]} rotation={[0, 0, -0.5]} material={k.knit} castShadow />}
    </group>
  );
}

/** A tall freestanding mirror on a walnut stand, angled so you can watch yourself at the desk. */
function ChevalMirror() {
  const k = mats();
  const { x, z, rotY } = STUDY.mirror;
  const w = 0.62;
  const h = 1.42;
  return (
    <group position={[x, 0, z]} rotation={[0, rotY, 0]}>
      {/* stand: two turned posts on splayed feet, joined low down */}
      {[-1, 1].map((sd) => (
        <group key={sd} position={[sd * (w / 2 + 0.07), 0, 0]}>
          <Mesh p={[0, 0.66, 0]} m={k.walnut}>
            <Cyl t={0.022} b={0.03} h={1.3} seg={12} />
          </Mesh>
          <Mesh p={[0, 1.33, 0]} m={k.brass}>
            <Ball r={0.032} />
          </Mesh>
          <Mesh p={[0, 0.025, 0]} m={k.walnut}>
            <Box w={0.06} h={0.05} d={0.5} />
          </Mesh>
          <Mesh p={[-sd * 0.025, 1.0, 0]} r={[0, 0, Math.PI / 2]} m={k.brass}>
            <Cyl t={0.018} b={0.018} h={0.03} seg={12} />
          </Mesh>
        </group>
      ))}
      <Mesh p={[0, 0.16, 0]} m={k.walnut}>
        <Box w={w + 0.14} h={0.035} d={0.035} />
      </Mesh>
      {/* the glass pivots between the posts, tipped forward a touch toward the chair */}
      <group position={[0, 1.0, 0]} rotation={[0.05, 0, 0]}>
        <Mesh p={[0, 0, -0.022]} m={k.walnut}>
          <Box w={w + 0.08} h={h + 0.08} d={0.03} />
        </Mesh>
        {[-1, 1].map((sd) => (
          <group key={sd}>
            <Mesh p={[sd * (w / 2 + 0.02), 0, 0]} m={k.walnut} cast={false}>
              <Box w={0.04} h={h + 0.08} d={0.02} />
            </Mesh>
            <Mesh p={[0, sd * (h / 2 + 0.02), 0]} m={k.walnut} cast={false}>
              <Box w={w + 0.08} h={0.04} d={0.02} />
            </Mesh>
          </group>
        ))}
        <Mirror position={[0, 0, -0.004]} w={w} h={h} />
      </group>
    </group>
  );
}

function Study({ s }: { s: RoomSignals }) {
  const k = mats();
  const photo = useMemo(() => new THREE.MeshStandardMaterial({ map: paper(["Shipped."], { bg: "#2f5f5c", ink: "#e9d7a8", size: 40, w: 260, h: 320 }), roughness: 0.9 }), []);
  return (
    <group>
      <Rug p={[-5.4, 0, -3.5]} w={3.4} d={2.4} palette="rust" />
      <Window p={[STUDY.desk.x, 1.75, -D + 0.09]} rotY={0} w={1.4} />

      <group position={[STUDY.desk.x, 0, STUDY.desk.z]}>
        <Mesh p={[0, 0.76, 0]} m={k.walnut}>
          <Box w={1.9} h={0.05} d={0.8} />
        </Mesh>
        {[-0.72, 0.72].map((x) => (
          <Mesh key={x} p={[x, 0.37, 0]} m={k.walnut}>
            <Box w={0.42} h={0.74} d={0.74} />
          </Mesh>
        ))}
        {[-0.72, 0.72].map((x) =>
          [0.18, 0.4, 0.62].map((y) => (
            <group key={`${x}${y}`}>
              <Mesh p={[x, y, 0.37 + 0.006 + E]} m={k.teak} cast={false}>
                <Box w={0.36} h={0.18} d={0.012} />
              </Mesh>
              <Mesh p={[x, y, 0.37 + 0.02 + E]} m={k.brass} cast={false}>
                <Box w={0.08} h={0.015} d={0.015} />
              </Mesh>
            </group>
          )),
        )}
        <Hi id="laptop">
          <Laptop />
        </Hi>
        <group position={[-0.68, 0.79, -0.18]}>
          <Mesh p={[0, 0.02, 0]} m={k.brass}>
            <Cyl t={0.09} b={0.1} h={0.03} />
          </Mesh>
          <Mesh p={[0, 0.17, 0]} m={k.brass}>
            <Cyl t={0.012} b={0.012} h={0.3} seg={8} />
          </Mesh>
          <mesh position={[0, 0.33, 0.05]} rotation={[0.25, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.075, 0.075, 0.34, 24, 1, false, 0, Math.PI]} />
            <meshPhysicalMaterial color="#1f6b4e" emissive="#2a8a62" emissiveIntensity={0.55} roughness={0.12} clearcoat={1} side={THREE.DoubleSide} />
          </mesh>
          <pointLight position={[0, 0.26, 0.12]} color="#ffcf8a" intensity={1.6} distance={2.5} decay={2} />
        </group>
        <Mesh p={[0.45, 0.84, 0.12]} m={k.ceramic}>
          <Cyl t={0.042} b={0.038} h={0.1} />
        </Mesh>
        <Mesh p={[0.6, 0.795, -0.05]} r={[0, 0.2, 0]} m={k.leather}>
          <Box w={0.2} h={0.02} d={0.28} />
        </Mesh>
        <Mesh p={[0.6, 0.81, -0.05]} r={[Math.PI / 2, 0, 0.5]} m={k.brass}>
          <Cyl t={0.005} b={0.005} h={0.15} seg={6} />
        </Mesh>
        {["#e5b54a", "#9cc9c2", "#f0c9a0"].map((c, i) => (
          <mesh key={c} position={[0.3 + i * 0.09, 0.787 + i * 0.001, 0.28]} rotation={[-Math.PI / 2, 0, i * 0.2 - 0.2]}>
            <planeGeometry args={[0.07, 0.07]} />
            <meshStandardMaterial color={c} roughness={0.9} />
          </mesh>
        ))}
        <group position={[0.82, 0.79, -0.25]} rotation={[-0.15, -0.4, 0]}>
          <Mesh p={[0, 0.11, 0]} m={k.brass}>
            <Box w={0.16} h={0.2} d={0.015} />
          </Mesh>
          <mesh position={[0, 0.11, 0.009]} material={photo}>
            <planeGeometry args={[0.13, 0.17]} />
          </mesh>
        </group>
      </group>

      <Hi id="desk">
      <group position={[STUDY.chair.x, 0, STUDY.chair.z]}>
        <RoundedBox args={[0.52, 0.1, 0.5]} radius={0.04} position={[0, 0.48, 0]} material={k.leather} castShadow />
        <RoundedBox args={[0.52, 0.55, 0.09]} radius={0.04} position={[0, 0.8, 0.24]} material={k.leather} castShadow />
        <Mesh p={[0, 0.25, 0]} m={k.chrome}>
          <Cyl t={0.03} b={0.03} h={0.42} seg={10} />
        </Mesh>
        {[0, 1, 2, 3, 4].map((i) => (
          <Mesh key={i} p={[Math.cos((i / 5) * Math.PI * 2) * 0.16, 0.04, Math.sin((i / 5) * Math.PI * 2) * 0.16]} r={[0, -(i / 5) * Math.PI * 2, 0]} m={k.chrome}>
            <Box w={0.32} h={0.025} d={0.04} />
          </Mesh>
        ))}
      </group>
      </Hi>

      <ChevalMirror />

      <Hi id="shelves">
        <Bookshelves />
      </Hi>
      <Hi id="plaques">
        <Plaques />
      </Hi>
      <Hi id="globe">
        <Globe spinAt={s.globeAt} />
      </Hi>

      {/* reading nook */}
      <group position={[STUDY.reading.x, 0, STUDY.reading.z]} rotation={[0, Math.PI * 0.8, 0]}>
        <Armchair m={k.velvetTeal} throwOn />
      </group>
      <ShadeLamp p={[-8.4, 0, -0.45]} h={1.45} intensity={2.4} />
      {/* a stack of books waiting by the chair */}
      {["#7d2f26", "#e9d7a8", "#12706b", "#c9a661"].map((c, i) => (
        <mesh key={c} position={[-6.75, 0.035 + i * 0.05, -0.6]} rotation={[0, i * 0.35, 0]} castShadow>
          <boxGeometry args={[0.24, 0.045, 0.17]} />
          <meshStandardMaterial color={c} roughness={0.7} />
        </mesh>
      ))}
      <Pendant p={[-5.5, 0, -3.5]} kind="green" intensity={9} castShadow />
      <Plant p={[-3.0, 0, -0.65]} s={1.2} kind="monstera" />
    </group>
  );
}

/* ================================ LIVING ================================ */

/** A real hearth: logs, flickering flames, glowing embers, and firelight that dances. */
function Fireplace() {
  const k = mats();
  const light = useRef<THREE.PointLight>(null);
  const flames = useRef<THREE.Group>(null);
  const embers = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const n = Math.sin(t * 7.3) * 0.5 + Math.sin(t * 13.1) * 0.3 + Math.sin(t * 23.7) * 0.2;
    if (light.current) light.current.intensity = 7.5 + n * 1.6;
    if (embers.current) embers.current.opacity = 0.75 + n * 0.15;
    flames.current?.children.forEach((c, i) => {
      const f = Math.sin(t * (6 + i * 1.7) + i * 2) * 0.5 + Math.sin(t * (11 + i) + i) * 0.5;
      c.scale.set(1 + f * 0.08, 1 + f * 0.25, 1 + f * 0.08);
      c.position.x = Math.sin(t * 3 + i) * 0.015 + (i - 2) * 0.1;
    });
  });
  const art = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: paper(["All products are ideas.", "All ideas deserve", "to be told properly."], { bg: "#1d3b37", ink: "#e9d7a8", size: 34, w: 512, h: 400 }),
        roughness: 0.85,
      }),
    [],
  );
  const z0 = LIVING.fire.z; // the wall face
  return (
    <group position={[LIVING.fire.x, 0, 0]}>
      {/* chimney breast with an opening */}
      {[-1, 1].map((s) => (
        <Mesh key={s} p={[s * 0.71, 1.5, z0 + 0.15]} m={k.plaster}>
          <Box w={0.48} h={3} d={0.3} />
        </Mesh>
      ))}
      <Mesh p={[0, 1.93, z0 + 0.15]} m={k.plaster}>
        <Box w={0.94} h={2.14} d={0.3} />
      </Mesh>
      {/* firebox */}
      <Mesh p={[0, 0.43, z0 + 0.02]} m={k.soot} cast={false}>
        <Box w={0.94} h={0.86} d={0.04} />
      </Mesh>
      {[-1, 1].map((s) => (
        <Mesh key={s} p={[s * 0.45, 0.43, z0 + 0.16]} m={k.brick} cast={false}>
          <Box w={0.04} h={0.86} d={0.28} />
        </Mesh>
      ))}
      {/* marble surround + mantel */}
      {[-1, 1].map((s) => (
        <Mesh key={s} p={[s * 0.62, 0.55, z0 + 0.34]} m={k.stone}>
          <Box w={0.28} h={1.1} d={0.1} />
        </Mesh>
      ))}
      <Mesh p={[0, 1.0, z0 + 0.34]} m={k.stone}>
        <Box w={1.52} h={0.28} d={0.1} />
      </Mesh>
      <Mesh p={[0, 1.18, z0 + 0.38]} m={k.walnut}>
        <Box w={1.95} h={0.08} d={0.34} />
      </Mesh>
      <Mesh p={[0, 0.03, z0 + 0.42]} m={k.stone}>
        <Box w={2.0} h={0.06} d={0.72} />
      </Mesh>
      {/* logs on an iron grate */}
      {[-0.18, 0.18].map((x) => (
        <Mesh key={x} p={[x, 0.08, z0 + 0.22]} m={k.iron}>
          <Box w={0.04} h={0.1} d={0.28} />
        </Mesh>
      ))}
      {[
        [0, 0.16, 0.2, 0, 0.1],
        [0.02, 0.24, 0.22, 0, -0.25],
        [-0.05, 0.2, 0.26, 0.2, 0.4],
      ].map(([x, y, z, rx, ry], i) => (
        <Mesh key={i} p={[x, y, z0 + z]} r={[rx, ry, Math.PI / 2]} m={k.teak}>
          <Cyl t={0.055} b={0.06} h={0.62} seg={10} />
        </Mesh>
      ))}
      <mesh position={[0, 0.13, z0 + 0.24]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.7, 0.3]} />
        <meshBasicMaterial ref={embers} color="#ff6a1f" transparent opacity={0.8} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      <group ref={flames} position={[0, 0.32, z0 + 0.24]}>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} position={[(i - 2) * 0.1, (i % 2) * 0.02, (i % 3) * 0.02]} material={k.flame}>
            <coneGeometry args={[0.07 - Math.abs(i - 2) * 0.012, 0.32 - Math.abs(i - 2) * 0.06, 12, 1, true]} />
          </mesh>
        ))}
      </group>
      <pointLight
        ref={light}
        position={[0, 0.5, z0 + 0.7]}
        color="#ff9a4a"
        intensity={7.5}
        distance={6.5}
        decay={2}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.002}
        shadow-normalBias={0.04}
        shadow-radius={5}
        shadow-camera-near={0.1}
        shadow-camera-far={9}
      />
      {/* fire irons */}
      <group position={[0.95, 0, z0 + 0.62]}>
        <Mesh p={[0, 0.02, 0]} m={k.iron}>
          <Cyl t={0.08} b={0.09} h={0.03} />
        </Mesh>
        {[-0.03, 0.03].map((x) => (
          <Mesh key={x} p={[x, 0.36, 0]} m={k.iron}>
            <Cyl t={0.008} b={0.008} h={0.68} seg={6} />
          </Mesh>
        ))}
        <Mesh p={[0, 0.72, 0]} m={k.brass}>
          <Ball r={0.03} />
        </Mesh>
      </group>
      {/* mantel: candles, a small clock, a photo, a trailing plant */}
      <Candle p={[-0.75, 1.22, z0 + 0.4]} h={0.18} />
      <Candle p={[-0.62, 1.22, z0 + 0.42]} h={0.12} />
      <group position={[0.1, 1.33, z0 + 0.42]}>
        <Mesh r={[Math.PI / 2, 0, 0]} m={k.brass}>
          <Cyl t={0.11} b={0.11} h={0.06} seg={28} />
        </Mesh>
        <group position={[0, 0, 0.032]}>
          <ClockHands r={0.09} />
        </group>
      </group>
      <Plant p={[0.72, 1.22, z0 + 0.4]} s={0.42} kind="trailing" />
      <group position={[0, 1.95, z0 + 0.31]}>
        <Mesh m={k.brass}>
          <Box w={1.1} h={0.88} d={0.04} />
        </Mesh>
        <mesh position={[0, 0, 0.022]} material={art}>
          <planeGeometry args={[1.0, 0.78]} />
        </mesh>
      </group>
    </group>
  );
}

function RecordPlayer({ playing }: { playing: boolean }) {
  const k = mats();
  const disc = useRef<THREE.Group>(null);
  const arm = useRef<THREE.Group>(null);
  const label = useMemo(() => new THREE.MeshStandardMaterial({ color: "#c9a661", roughness: 0.6 }), []);
  useFrame((_, dt) => {
    if (disc.current) disc.current.rotation.y -= (playing ? 3.5 : 0) * dt;
    if (arm.current) arm.current.rotation.y = THREE.MathUtils.damp(arm.current.rotation.y, playing ? 0.55 : 0, 4, dt);
  });
  return (
    <group position={[0.45, 0.92, 0]}>
      <RoundedBox args={[0.5, 0.1, 0.4]} radius={0.02} material={k.teak} castShadow />
      <group ref={disc} position={[-0.04, 0.056, 0]}>
        <Mesh m={k.black} cast={false}>
          <Cyl t={0.15} b={0.15} h={0.008} seg={40} />
        </Mesh>
        <mesh position={[0, 0.0045, 0]} material={label}>
          <cylinderGeometry args={[0.05, 0.05, 0.002, 24]} />
        </mesh>
      </group>
      <group ref={arm} position={[0.19, 0.08, -0.14]}>
        <Mesh p={[-0.07, 0, 0.06]} r={[0, 0.7, Math.PI / 2]} m={k.chrome} cast={false}>
          <Cyl t={0.006} b={0.006} h={0.22} seg={6} />
        </Mesh>
      </group>
    </group>
  );
}

function Living({ s }: { s: RoomSignals }) {
  const k = mats();
  const tv = useMemo(() => new THREE.MeshBasicMaterial({ map: tvScreen(), toneMapped: false }), []);
  return (
    <group>
      <Rug p={[-5.5, 0, 2.45]} w={3.6} d={2.8} palette="teal" />
      <Window p={[LIVING.sideboard.x, 1.85, D - 0.09]} rotY={Math.PI} w={1.4} />

      <Hi id="fire">
        <Fireplace />
      </Hi>

      {/* sofa facing the fire */}
      <Hi id="sofa">
        <group position={[LIVING.sofa.x, 0, LIVING.sofa.z]} rotation={[0, Math.PI, 0]}>
          <RoundedBox args={[2.2, 0.22, 0.85]} radius={0.06} position={[0, 0.36, 0]} material={k.velvetMustard} castShadow receiveShadow />
          {[-0.53, 0.53].map((x) => (
            <RoundedBox key={x} args={[1.02, 0.14, 0.8]} radius={0.06} position={[x, 0.53, 0.02]} material={k.velvetMustard} castShadow />
          ))}
          <RoundedBox args={[2.2, 0.5, 0.18]} radius={0.08} position={[0, 0.72, -0.36]} material={k.velvetMustard} castShadow />
          {[-1.08, 1.08].map((x) => (
            <RoundedBox key={x} args={[0.12, 0.3, 0.85]} radius={0.05} position={[x, 0.55, 0]} material={k.teak} castShadow />
          ))}
          {[-0.95, 0.95].map((x) =>
            [-0.3, 0.3].map((z) => (
              <Mesh key={`${x}${z}`} p={[x, 0.13, z]} r={[z * 0.4, 0, -x * 0.12]} m={k.teak}>
                <Cyl t={0.025} b={0.015} h={0.26} seg={8} />
              </Mesh>
            )),
          )}
          <RoundedBox args={[0.42, 0.42, 0.13]} radius={0.06} position={[0.75, 0.75, -0.18]} rotation={[-0.2, -0.15, -0.08]} material={k.velvetTeal} castShadow />
          <RoundedBox args={[0.4, 0.4, 0.12]} radius={0.06} position={[-0.78, 0.74, -0.18]} rotation={[-0.2, 0.1, 0.08]} material={k.fabricRust} castShadow />
          {/* a knitted throw over the back */}
          <RoundedBox args={[0.7, 0.04, 0.6]} radius={0.02} position={[-0.3, 0.92, -0.32]} rotation={[-1.1, 0, 0]} material={k.knit} castShadow />
        </group>
      </Hi>

      {/* coffee table: books, tea, a candle */}
      <group position={[LIVING.table.x, 0, LIVING.table.z]}>
        <RoundedBox args={[1.1, 0.05, 0.6]} radius={0.02} position={[0, 0.42, 0]} material={k.teak} castShadow />
        {[-0.48, 0.48].map((x) =>
          [-0.22, 0.22].map((z) => (
            <Mesh key={`${x}${z}`} p={[x, 0.2, z]} m={k.teak}>
              <Cyl t={0.02} b={0.014} h={0.4} seg={8} />
            </Mesh>
          )),
        )}
        {["#7d2f26", "#12706b", "#e9d7a8"].map((c, i) => (
          <mesh key={c} position={[-0.28, 0.468 + i * 0.034, 0.05]} rotation={[0, 0.2 * i - 0.2, 0]} castShadow>
            <boxGeometry args={[0.28, 0.03, 0.2]} />
            <meshStandardMaterial color={c} roughness={0.7} />
          </mesh>
        ))}
        <Mesh p={[0.2, 0.49, 0.05]} m={k.ceramic}>
          <Cyl t={0.042} b={0.036} h={0.08} />
        </Mesh>
        <Mesh p={[0.2, 0.448, 0.05]} m={k.ceramic}>
          <Cyl t={0.07} b={0.07} h={0.008} />
        </Mesh>
        <Candle p={[0.38, 0.445, -0.12]} h={0.09} />
      </group>

      {/* armchair angled to the fire, side table with a lamp */}
      <Hi id="armchair">
        <group position={[LIVING.armchair.x, 0, LIVING.armchair.z]} rotation={[0, LIVING.armchair.heading, 0]}>
          <Armchair m={k.leather} throwOn />
        </group>
      </Hi>
      <group position={[-8.35, 0, 2.6]}>
        <Mesh p={[0, 0.3, 0]} m={k.walnut}>
          <Cyl t={0.24} b={0.24} h={0.04} seg={28} />
        </Mesh>
        <Mesh p={[0, 0.58, 0]} m={k.walnut}>
          <Cyl t={0.22} b={0.22} h={0.04} seg={28} />
        </Mesh>
        <Mesh p={[0, 0.3, 0]} m={k.walnut}>
          <Cyl t={0.035} b={0.035} h={0.56} seg={8} />
        </Mesh>
        <ShadeLamp p={[0, 0.6, 0]} h={0.38} shade={0.15} light={false} />
      </group>

      {/* CRT on a teak console */}
      <Hi id="tv">
        <group position={[LIVING.tv.x, 0, LIVING.tv.z]} rotation={[0, Math.PI / 2, 0]}>
          <RoundedBox args={[1.6, 0.55, 0.5]} radius={0.03} position={[0, 0.3, 0]} material={k.teak} castShadow />
          {[-0.4, 0.4].map((x) => (
            <Mesh key={x} p={[x, 0.3, 0.25 + 0.006 + E]} m={k.walnut} cast={false}>
              <Box w={0.72} h={0.42} d={0.012} />
            </Mesh>
          ))}
          <RoundedBox args={[0.72, 0.56, 0.5]} radius={0.06} position={[0, 0.86, -0.02]} material={k.walnut} castShadow />
          <RoundedBox args={[0.56, 0.42, 0.02]} radius={0.05} position={[-0.05, 0.87, 0.235]} material={k.black} />
          <mesh position={[-0.05, 0.87, 0.248]} material={tv}>
            <planeGeometry args={[0.5, 0.37]} />
          </mesh>
          {[0.95, 0.83].map((y) => (
            <Mesh key={y} p={[0.29, y, 0.245]} r={[Math.PI / 2, 0, 0]} m={k.brass} cast={false}>
              <Cyl t={0.025} b={0.025} h={0.02} seg={14} />
            </Mesh>
          ))}
          {[-0.12, 0.12].map((x) => (
            <Mesh key={x} p={[x, 1.32, -0.05]} r={[0, 0, x * 3]} m={k.chrome} cast={false}>
              <Cyl t={0.004} b={0.004} h={0.38} seg={6} />
            </Mesh>
          ))}
        </group>
      </Hi>

      {/* sideboard: record player, sleeves, a vase */}
      <group position={[LIVING.sideboard.x, 0, LIVING.sideboard.z]} rotation={[0, Math.PI, 0]}>
        <RoundedBox args={[2.1, 0.62, 0.48]} radius={0.02} position={[0, 0.55, 0]} material={k.teak} castShadow />
        {[-0.7, 0, 0.7].map((x) => (
          <Mesh key={x} p={[x, 0.55, 0.24 + 0.006 + E]} m={k.walnut} cast={false}>
            <Box w={0.66} h={0.52} d={0.012} />
          </Mesh>
        ))}
        {[-0.9, 0.9].map((x) => (
          <Mesh key={x} p={[x, 0.12, 0]} r={[0, 0, x * 0.15]} m={k.teak}>
            <Cyl t={0.025} b={0.015} h={0.26} seg={8} />
          </Mesh>
        ))}
        <Hi id="record">
          <RecordPlayer playing={s.record} />
        </Hi>
        {["#7d2f26", "#12706b", "#c9a661", "#1d1b19"].map((c, i) => (
          <mesh key={c} position={[-0.25 + i * 0.03, 1.02, -0.05]} rotation={[0, 0, 0.08 * i]} castShadow>
            <boxGeometry args={[0.012, 0.3, 0.3]} />
            <meshStandardMaterial color={c} roughness={0.6} />
          </mesh>
        ))}
        <Mesh p={[-0.75, 1.0, 0]} m={k.ceramic}>
          <Cyl t={0.05} b={0.09} h={0.28} />
        </Mesh>
      </group>

      <ShadeLamp p={[-3.3, 0, 5.0]} h={1.5} intensity={3} shade={0.26} />
      <Pendant p={[-5.5, 0, 3.6]} kind="globe" intensity={3.5} />
      <Plant p={[-8.45, 0, 6.35]} s={1.3} kind="monstera" />
      <Plant p={[-2.6, 0, 0.6]} s={1.1} kind="fern" />
    </group>
  );
}

/* ================================ KITCHEN ================================ */

function Kettle({ at }: { at: number }) {
  const k = mats();
  const steam = useRef<THREE.Group>(null);
  useFrame(() => {
    const t = (performance.now() - at) / 1000;
    const on = at > 0 && t < 6;
    steam.current?.children.forEach((c, i) => {
      const p = (((t * 0.6 + i / 4) % 1) + 1) % 1;
      c.position.set(Math.sin(p * 5 + i) * 0.04, 0.15 + p * 0.5, 0);
      c.scale.setScalar(0.5 + p);
      ((c as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = on ? Math.sin(p * Math.PI) * 0.3 : 0;
    });
  });
  return (
    <group>
      <Mesh p={[0, 0.09, 0]} s={[1, 0.85, 1]} m={k.mint}>
        <Ball r={0.11} />
      </Mesh>
      <Mesh p={[0.11, 0.1, 0]} r={[0, 0, -0.9]} m={k.mint}>
        <Cyl t={0.012} b={0.025} h={0.12} seg={8} />
      </Mesh>
      <Mesh p={[0, 0.2, 0]} r={[0, 0, Math.PI / 2]} m={k.black}>
        <torusGeometry args={[0.07, 0.012, 8, 20, Math.PI]} />
      </Mesh>
      <group ref={steam}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i}>
            <sphereGeometry args={[0.04, 10, 8]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0} depthWrite={false} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Kitchen({ s }: { s: RoomSignals }) {
  const k = mats();
  const notes = useMemo(
    () =>
      [
        ["Clear scope", "in / out, agreed"],
        ["Honest timelines", "flag it early"],
        ["Document", "everything"],
        ["Mornings only", "Mon – Fri"],
      ].map(
        ([t, l], i) =>
          new THREE.MeshStandardMaterial({
            map: paper([l], { title: t, bg: ["#f6e6a8", "#cfe8df", "#f3d2c1", "#e9e2f5"][i], size: 34, w: 400, h: 300 }),
            roughness: 0.9,
          }),
      ),
    [],
  );
  return (
    <group>
      <Window p={[5.0, 1.75, D - 0.09]} rotY={Math.PI} w={1.3} />
      {/* herbs on the sill */}
      {[4.6, 5.0, 5.4].map((x) => (
        <Plant key={x} p={[x, 1.03, 6.8]} s={0.3} kind="small" />
      ))}

      <group position={[KITCHEN.counter.x, 0, KITCHEN.counter.z]}>
        <RoundedBox args={[0.65, 0.86, 3.7]} radius={0.02} position={[0, 0.43, 0]} material={k.mint} castShadow />
        {[-1.4, -0.47, 0.47, 1.4].map((z) => (
          <group key={z}>
            <Mesh p={[-0.325 - 0.006 - E, 0.45, z]} m={k.cream} cast={false}>
              <Box w={0.012} h={0.7} d={0.86} />
            </Mesh>
            <Mesh p={[-0.35, 0.72, z + 0.3]} m={k.chrome} cast={false}>
              <Box w={0.02} h={0.12} d={0.02} />
            </Mesh>
          </group>
        ))}
        <Mesh p={[0, 0.89, 0]} m={k.oak}>
          <Box w={0.72} h={0.05} d={3.76} />
        </Mesh>
        <group position={[0, 0.92, -0.8]}>
          <Mesh m={k.black} cast={false}>
            <Box w={0.55} h={0.02} d={0.6} />
          </Mesh>
          {[-0.14, 0.14].map((z) => (
            <Mesh key={z} p={[0, 0.012, z]} r={[Math.PI / 2, 0, 0]} m={k.chrome} cast={false}>
              <torusGeometry args={[0.08, 0.01, 6, 20]} />
            </Mesh>
          ))}
          <Hi id="kettle">
            <group position={[0, 0.02, -0.14]}>
              <Kettle at={s.kettleAt} />
            </group>
          </Hi>
        </group>
        <Mesh p={[0, 0.9, 0.7]} m={k.chrome} cast={false}>
          <Box w={0.45} h={0.022} d={0.6} />
        </Mesh>
        <Mesh p={[0.18, 1.08, 0.7]} r={[0, 0, 0.3]} m={k.chrome}>
          <Cyl t={0.015} b={0.015} h={0.35} seg={8} />
        </Mesh>
        {[1.25, 1.45, 1.65].map((z, i) => (
          <Mesh key={z} p={[0.12, 1.02 + i * 0.01, z]} m={k.ceramic}>
            <Cyl t={0.07} b={0.07} h={0.2 + i * 0.03} />
          </Mesh>
        ))}
        <Mesh p={[0.2, 1.1, 0.0]} r={[0, 0, -0.2]} m={k.oak}>
          <Box w={0.03} h={0.35} d={0.4} />
        </Mesh>
        <Mesh p={[0.25, 1.75, 0.2]} m={k.oak}>
          <Box w={0.3} h={0.04} d={1.6} />
        </Mesh>
        {[-0.5, -0.32, -0.14].map((z) => (
          <Mesh key={z} p={[0.25, 1.88, 0.2 + z]} r={[0, 0, Math.PI / 2]} m={k.ceramic}>
            <Cyl t={0.1} b={0.1} h={0.015} />
          </Mesh>
        ))}
        <Plant p={[0.25, 1.77, 0.65]} s={0.4} kind="trailing" />
        {/* tea towel hanging off the counter */}
        <mesh position={[-0.34, 0.68, -1.5]} rotation={[0, Math.PI / 2, 0]} castShadow>
          <planeGeometry args={[0.28, 0.4]} />
          <meshStandardMaterial color="#e9d7a8" roughness={1} side={THREE.DoubleSide} />
        </mesh>
      </group>

      <Hi id="fridge">
        <group position={[KITCHEN.fridge.x, 0, KITCHEN.fridge.z]} rotation={[0, -Math.PI / 2, 0]}>
          <RoundedBox args={[0.78, 1.75, 0.7]} radius={0.14} smoothness={6} position={[0, 0.9, 0]} material={k.mint} castShadow />
          <Mesh p={[0, 1.28, 0.355 + E]} m={k.mint} cast={false}>
            <Box w={0.66} h={0.008} d={0.01} />
          </Mesh>
          <Mesh p={[0.3, 1.05, 0.38]} m={k.chrome}>
            <Box w={0.03} h={0.36} d={0.04} />
          </Mesh>
          {notes.map((m, i) => (
            <group key={i} position={[-0.17 + (i % 2) * 0.27, 1.05 - Math.floor(i / 2) * 0.32, 0.36 + i * 0.001]} rotation={[0, 0, (i % 2 ? 1 : -1) * 0.06]}>
              <mesh material={m}>
                <planeGeometry args={[0.24, 0.18]} />
              </mesh>
              <Mesh p={[0, 0.07, 0.01]} m={k.fabricRust} cast={false}>
                <Ball r={0.015} />
              </Mesh>
            </group>
          ))}
        </group>
      </Hi>

      <group position={[KITCHEN.table.x, 0, KITCHEN.table.z]}>
        <Mesh p={[0, 0.74, 0]} m={k.cream}>
          <Cyl t={0.55} b={0.55} h={0.04} seg={40} />
        </Mesh>
        <Mesh p={[0, 0.37, 0]} m={k.chrome}>
          <Cyl t={0.04} b={0.04} h={0.72} seg={10} />
        </Mesh>
        <Mesh p={[0, 0.02, 0]} m={k.chrome}>
          <Cyl t={0.25} b={0.28} h={0.04} seg={28} />
        </Mesh>
        {/* fruit bowl */}
        <Mesh p={[-0.12, 0.8, -0.05]} m={k.ceramic}>
          <cylinderGeometry args={[0.16, 0.09, 0.09, 24, 1, true]} />
        </Mesh>
        {[
          [-0.18, 0.84, -0.05, "#e0a32e"],
          [-0.08, 0.85, -0.02, "#b8402c"],
          [-0.12, 0.85, -0.12, "#9cbb4a"],
          [-0.06, 0.88, -0.1, "#e0a32e"],
        ].map(([x, y, z, c], i) => (
          <mesh key={i} position={[x as number, y as number, z as number]} castShadow>
            <sphereGeometry args={[0.045, 14, 12]} />
            <meshPhysicalMaterial color={c as string} roughness={0.45} clearcoat={0.4} />
          </mesh>
        ))}
        <Mesh p={[0.2, 0.8, 0.12]} m={k.ceramic}>
          <Cyl t={0.045} b={0.04} h={0.09} />
        </Mesh>
        <Candle p={[0.12, 0.76, -0.22]} h={0.12} />
        {[0.95, -0.95].map((x) => (
          <group key={x} position={[x, 0, 0]} rotation={[0, x > 0 ? -Math.PI / 2 : Math.PI / 2, 0]}>
            <RoundedBox args={[0.45, 0.07, 0.45]} radius={0.03} position={[0, 0.47, 0]} material={k.vinyl} castShadow />
            <RoundedBox args={[0.42, 0.3, 0.06]} radius={0.025} position={[0, 0.76, -0.21]} material={k.vinyl} castShadow />
            {[-0.18, 0.18].map((xx) =>
              [-0.18, 0.18].map((z) => (
                <Mesh key={`${xx}${z}`} p={[xx, 0.23, z]} m={k.chrome}>
                  <Cyl t={0.012} b={0.012} h={0.46} seg={6} />
                </Mesh>
              )),
            )}
            {[-0.18, 0.18].map((xx) => (
              <Mesh key={xx} p={[xx, 0.62, -0.21]} m={k.chrome}>
                <Cyl t={0.01} b={0.01} h={0.3} seg={6} />
              </Mesh>
            ))}
          </group>
        ))}
      </group>

      <group position={[5.0, 2.35, 0.09]}>
        <Mesh r={[Math.PI / 2, 0, 0]} m={k.mint}>
          <Cyl t={0.24} b={0.24} h={0.04} seg={32} />
        </Mesh>
        <group position={[0, 0, 0.022]}>
          <ClockHands r={0.21} />
        </group>
      </group>
      <Pendant p={[5, 0, 3.2]} kind="enamel" intensity={10} castShadow />
      <Plant p={[2.6, 0, 6.4]} s={1.1} kind="fern" />
    </group>
  );
}

/* ================================ BEDROOM ================================ */

/** A ginger cat, curled up asleep at the foot of the bed. Breathing slowly. */
function Cat() {
  const k = mats();
  const body = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (body.current) body.current.scale.y = 1 + Math.sin(clock.elapsedTime * 1.4) * 0.035;
  });
  return (
    <group position={[6.05, 0.62, -5.55]} rotation={[0, 0.6, 0]}>
      <group ref={body}>
        <mesh scale={[1.25, 0.62, 1]} material={k.fur} castShadow>
          <sphereGeometry args={[0.15, 24, 18]} />
        </mesh>
        <mesh position={[0.02, 0.035, 0.11]} scale={[1, 0.6, 0.6]} material={k.furLight}>
          <sphereGeometry args={[0.07, 16, 12]} />
        </mesh>
      </group>
      <group position={[0.15, 0.05, 0.08]} rotation={[0.2, 0.7, 0.35]}>
        <mesh scale={[1, 0.85, 0.95]} material={k.fur} castShadow>
          <sphereGeometry args={[0.075, 20, 16]} />
        </mesh>
        <mesh position={[0, -0.015, 0.06]} scale={[1, 0.75, 0.7]} material={k.furLight}>
          <sphereGeometry args={[0.035, 12, 10]} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.04, 0.065, -0.005]} rotation={[0, 0, -s * 0.3]} material={k.fur}>
            <coneGeometry args={[0.025, 0.05, 8]} />
          </mesh>
        ))}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.026, 0.01, 0.068]} rotation={[0, 0, s * 0.2]}>
            <boxGeometry args={[0.022, 0.003, 0.002]} />
            <meshBasicMaterial color="#2a1a10" />
          </mesh>
        ))}
      </group>
      <mesh position={[-0.02, -0.02, 0.0]} rotation={[Math.PI / 2, 0, 0.3]} material={k.fur}>
        <torusGeometry args={[0.17, 0.028, 10, 30, Math.PI * 1.1]} />
      </mesh>
    </group>
  );
}

function Bedroom() {
  const k = mats();
  const cards = useMemo(
    () =>
      ["Ship the rebuild ✓", "Write the wiki ✓", "Native apps ✓", "Learn every new tool", "Deep work, mornings", "Next: your idea →"].map(
        (t, i) => new THREE.MeshStandardMaterial({ map: paper([t], { bg: ["#f5eedf", "#f6e6a8", "#cfe8df"][i % 3], size: 40, w: 420, h: 260 }), roughness: 0.9 }),
      ),
    [],
  );
  const b = BEDROOM.bed;
  const mr = BEDROOM.mirror;
  return (
    <group>
      <Rug p={[5.6, 0, -4.1]} w={2.6} d={3.4} palette="rust" />
      <Window p={[7.95, 1.75, -D + 0.09]} rotY={0} w={1.1} />

      <Hi id="bed">
        <group position={[b.x, 0, b.z]}>
          <Mesh p={[0, 0.2, 0]} m={k.walnut}>
            <Box w={1.7} h={0.3} d={2.2} />
          </Mesh>
          <RoundedBox args={[1.6, 0.22, 2.05]} radius={0.08} position={[0, 0.45, 0.04]} material={k.fabricCream} castShadow receiveShadow />
          <RoundedBox args={[1.66, 0.12, 1.3]} radius={0.06} position={[0, 0.58, 0.42]} material={k.fabricTeal} castShadow />
          <RoundedBox args={[1.68, 0.06, 0.32]} radius={0.03} position={[0, 0.66, 0.92]} material={k.knit} castShadow />
          {[-0.4, 0.4].map((x) => (
            <RoundedBox key={x} args={[0.62, 0.16, 0.38]} radius={0.08} position={[x, 0.64, -0.78]} rotation={[-0.25, 0, 0]} material={k.fabricCream} castShadow />
          ))}
          <RoundedBox args={[1.78, 1.1, 0.1]} radius={0.04} position={[0, 0.75, -1.08]} material={k.walnut} castShadow />
          {[-0.45, 0, 0.45].map((x) => (
            <Mesh key={x} p={[x, 0.85, -1.03 + 0.006 + E]} m={k.teak} cast={false}>
              <Box w={0.38} h={0.6} d={0.012} />
            </Mesh>
          ))}
        </group>
      </Hi>
      <Cat />
      {BEDROOM.nightstands.map((x, i) => (
        <group key={x} position={[x, 0, -6.65]}>
          <RoundedBox args={[0.5, 0.55, 0.45]} radius={0.02} position={[0, 0.3, 0]} material={k.teak} castShadow />
          <Mesh p={[0, 0.38, 0.225 + 0.006 + E]} m={k.brass} cast={false}>
            <Box w={0.1} h={0.015} d={0.012} />
          </Mesh>
          <ShadeLamp p={[0, 0.57, -0.05]} h={0.32} intensity={2.2} shade={0.15} light={i === 0} />
          {i === 0 && (
            <>
              {["#12706b", "#e9d7a8"].map((c, j) => (
                <mesh key={c} position={[0.1, 0.6 + j * 0.035, 0.1]} rotation={[0, 0.3 + j * 0.2, 0]} castShadow>
                  <boxGeometry args={[0.18, 0.03, 0.13]} />
                  <meshStandardMaterial color={c} roughness={0.7} />
                </mesh>
              ))}
              <Mesh p={[-0.13, 0.62, 0.12]} m={k.ceramic}>
                <Cyl t={0.035} b={0.03} h={0.08} />
              </Mesh>
            </>
          )}
        </group>
      ))}

      <group position={[BEDROOM.wardrobe.x, 0, BEDROOM.wardrobe.z]}>
        <RoundedBox args={[1.35, 2.2, 0.65]} radius={0.03} position={[0, 1.12, 0]} material={k.walnut} castShadow />
        {[-0.33, 0.33].map((x) => (
          <group key={x}>
            <Mesh p={[x, 1.15, 0.325 + 0.006 + E]} m={k.teak} cast={false}>
              <Box w={0.6} h={1.9} d={0.012} />
            </Mesh>
            <Mesh p={[x * 0.12, 1.15, 0.35]} m={k.brass}>
              <Box w={0.02} h={0.2} d={0.02} />
            </Mesh>
          </group>
        ))}
        {[-0.4, 0.4].map((x) => (
          <Mesh key={x} p={[x, 0.04, 0.2]} m={k.teak}>
            <Cyl t={0.03} b={0.02} h={0.08} seg={8} />
          </Mesh>
        ))}
        <RoundedBox args={[0.5, 0.3, 0.4]} radius={0.04} position={[0.2, 2.38, 0]} material={k.leather} castShadow />
      </group>

      {/* full-length mirror on the wall by the door */}
      <group position={[mr.x - 0.01, 1.0, mr.z]} rotation={[0, Math.PI / 2, 0]}>
        <Hi id="bedMirror">
          <group>
            {[-1, 1].map((sx) => (
              <Mesh key={sx} p={[sx * 0.39, 0, 0]} m={k.walnut}>
                <Box w={0.08} h={1.82} d={0.05} />
              </Mesh>
            ))}
            {[-1, 1].map((sy) => (
              <Mesh key={sy} p={[0, sy * 0.89, 0]} m={k.walnut}>
                <Box w={0.86} h={0.08} d={0.05} />
              </Mesh>
            ))}
          </group>
        </Hi>
      </group>
      <Mirror position={[mr.x + 0.012, 1.0, mr.z]} rotation={[0, Math.PI / 2, 0]} w={0.7} h={1.7} />

      <Hi id="board">
        <group position={[BEDROOM.board.x, 1.65, BEDROOM.board.z]} rotation={[0, -Math.PI / 2, 0]}>
          <Mesh m={k.walnut}>
            <Box w={1.5} h={1.0} d={0.04} />
          </Mesh>
          <Mesh p={[0, 0, 0.0225]} m={k.cork} cast={false}>
            <Box w={1.38} h={0.88} d={0.005} />
          </Mesh>
          {cards.map((m, i) => (
            <group key={i} position={[-0.43 + (i % 3) * 0.43, 0.2 - Math.floor(i / 3) * 0.4, 0.03 + i * 0.0008]} rotation={[0, 0, ((i * 37) % 7) * 0.02 - 0.06]}>
              <mesh material={m}>
                <planeGeometry args={[0.36, 0.22]} />
              </mesh>
              <Mesh p={[0, 0.09, 0.01]} m={k.fabricRust} cast={false}>
                <Ball r={0.014} />
              </Mesh>
            </group>
          ))}
        </group>
      </Hi>
      <Pendant p={[5.6, 0, -3.3]} kind="drum" intensity={6} castShadow />
      <Plant p={[8.4, 0, -0.6]} s={1.2} kind="monstera" />
      {[-0.12, 0.12].map((x) => (
        <Mesh key={x} p={[b.x - 0.55 + x, 0.03, b.z + 1.35]} s={[1, 0.5, 1]} m={k.fabricRust}>
          <capsuleGeometry args={[0.05, 0.14, 4, 8]} />
        </Mesh>
      ))}
    </group>
  );
}

/* ================================ export ================================ */

export const Rooms = memo(function Rooms({ s }: { s: RoomSignals }) {
  return (
    <group>
      <Study s={s} />
      <Living s={s} />
      <Kitchen s={s} />
      <Bedroom />
    </group>
  );
});
