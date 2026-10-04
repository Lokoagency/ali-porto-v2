"use client";

import { memo, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { Ball, Box, Cyl, Hi, Mesh, Plant, mats, type V3 } from "./kit";
import { Mirror } from "./Mirror";
import { clockFace, nightSky, paper, parquet, rug, tiles, wall, type WallStyle } from "./textures";
import { DOORWAYS, HALL, HOUSE, ROOMS, WALLS } from "./world";

const { halfW: W, halfD: D, height: H, wallT: T, doorHalf: DH } = HOUSE;

const wallMats = new Map<string, THREE.Material>();
function wallMat(style: WallStyle, len: number) {
  const k = `${style}-${len.toFixed(2)}`;
  if (!wallMats.has(k)) {
    const map = wall(style, len);
    wallMats.set(k, new THREE.MeshStandardMaterial({ map, bumpMap: map, bumpScale: 0.35, roughness: 0.86 }));
  }
  return wallMats.get(k)!;
}

/* ----------------------------------- rain ----------------------------------- */

let rainTex: THREE.CanvasTexture | null = null;
function rainTexture() {
  if (rainTex) return rainTex;
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 256;
  const g = c.getContext("2d")!;
  for (let i = 0; i < 70; i++) {
    const x = Math.random() * 128;
    const y = Math.random() * 256;
    const len = 8 + Math.random() * 26;
    const grad = g.createLinearGradient(x, y, x, y + len);
    grad.addColorStop(0, "rgba(200,220,255,0)");
    grad.addColorStop(1, `rgba(220,235,255,${0.25 + Math.random() * 0.35})`);
    g.strokeStyle = grad;
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + 1, y + len);
    g.stroke();
  }
  rainTex = new THREE.CanvasTexture(c);
  rainTex.wrapS = rainTex.wrapT = THREE.RepeatWrapping;
  return rainTex;
}
/** Scrolls the shared rain texture once per frame for every window. */
function RainDriver() {
  useFrame((_, dt) => {
    const t = rainTexture();
    t.offset.y += dt * 0.9;
  });
  return null;
}

/* -------------------------------- shell -------------------------------- */

function Walls({ onOccluder }: { onOccluder: (m: THREE.Object3D | null) => void }) {
  const edge = mats().cream;
  return (
    <group>
      {WALLS.map((s, i) => {
        const xWall = s.x1 === s.x2;
        const len = xWall ? Math.abs(s.z2 - s.z1) : Math.abs(s.x2 - s.x1);
        const A = wallMat(s.a, len);
        const B = wallMat(s.b, len);
        const faces = xWall ? [A, B, edge, edge, edge, edge] : [edge, edge, edge, edge, A, B];
        return (
          <mesh key={i} ref={onOccluder} position={[(s.x1 + s.x2) / 2, H / 2, (s.z1 + s.z2) / 2]} material={faces} receiveShadow castShadow>
            <boxGeometry args={xWall ? [T, H, len] : [len, H, T]} />
          </mesh>
        );
      })}
      {DOORWAYS.map((d, i) => (
        <group key={i} position={[d.x, 0, d.z]}>
          <mesh position={[0, H - (H - 2.3) / 2, 0]} material={edge} castShadow>
            <boxGeometry args={[T, H - 2.3, DH * 2]} />
          </mesh>
          <Casing />
        </group>
      ))}
      <mesh position={[0, H - (H - 2.3) / 2, D]} material={edge}>
        <boxGeometry args={[DH * 2, H - 2.3, T]} />
      </mesh>
    </group>
  );
}

function Casing() {
  const k = mats();
  return (
    <group>
      {[-1, 1].map((s) => (
        <Mesh key={s} p={[0, 1.15, s * (DH + 0.05)]} m={k.walnut}>
          <Box w={T + 0.1} h={2.3} d={0.12} />
        </Mesh>
      ))}
      <Mesh p={[0, 2.36, 0]} m={k.walnut}>
        <Box w={T + 0.1} h={0.13} d={DH * 2 + 0.22} />
      </Mesh>
    </group>
  );
}

function Floors() {
  const floor = useMemo(() => {
    const m = new Map<string, THREE.Material>();
    for (const r of ROOMS) {
      const w = r.maxX - r.minX;
      const d = r.maxZ - r.minZ;
      const map = r.floor === "tile" ? tiles([w / 1.2, d / 1.2]) : parquet([w / 2, d / 2]);
      m.set(
        r.id,
        new THREE.MeshStandardMaterial({
          map,
          bumpMap: map,
          bumpScale: r.floor === "tile" ? 0.5 : 0.9,
          roughness: r.floor === "tile" ? 0.3 : 0.38,
        }),
      );
    }
    return m;
  }, []);
  const k = mats();
  return (
    <group>
      {ROOMS.map((r) => (
        <mesh key={r.id} position={[(r.minX + r.maxX) / 2, 0, (r.minZ + r.maxZ) / 2]} rotation={[-Math.PI / 2, 0, 0]} material={floor.get(r.id)} receiveShadow>
          <planeGeometry args={[r.maxX - r.minX, r.maxZ - r.minZ]} />
        </mesh>
      ))}
      {/* ceiling (faces down) + crown moulding around every room */}
      <mesh position={[0, H, 0]} rotation={[Math.PI / 2, 0, 0]} material={k.plaster}>
        <planeGeometry args={[W * 2, D * 2]} />
      </mesh>
      {WALLS.map((s, i) => {
        const xWall = s.x1 === s.x2;
        const len = xWall ? Math.abs(s.z2 - s.z1) : Math.abs(s.x2 - s.x1);
        return (
          <mesh key={i} position={[(s.x1 + s.x2) / 2, H - 0.06, (s.z1 + s.z2) / 2]} material={k.cream}>
            <boxGeometry args={xWall ? [T + 0.14, 0.12, len] : [len, 0.12, T + 0.14]} />
          </mesh>
        );
      })}
    </group>
  );
}

export function Rug({ p, w, d, rot = 0, palette = "rust" }: { p: V3; w: number; d: number; rot?: number; palette?: "rust" | "teal" }) {
  const m = useMemo(() => {
    const map = rug(palette);
    return new THREE.MeshStandardMaterial({ map, bumpMap: map, bumpScale: 1.2, roughness: 1 });
  }, [palette]);
  return (
    <mesh position={[p[0], 0.008, p[2]]} rotation={[-Math.PI / 2, 0, rot]} material={m} receiveShadow>
      <planeGeometry args={[w, d]} />
    </mesh>
  );
}

/** A window onto a rainy night street, with sill and curtains. */
export function Window({ p, rotY, w = 1.2, h = 1.3 }: { p: V3; rotY: number; w?: number; h?: number }) {
  const k = mats();
  const sky = useMemo(() => new THREE.MeshBasicMaterial({ map: nightSky(), toneMapped: false, color: new THREE.Color(0.75, 0.78, 0.85) }), []);
  const rain = useMemo(() => new THREE.MeshBasicMaterial({ map: rainTexture(), transparent: true, depthWrite: false, toneMapped: false }), []);
  return (
    <group position={p} rotation={[0, rotY, 0]}>
      <mesh position={[0, 0, 0.01]} material={sky}>
        <planeGeometry args={[w, h]} />
      </mesh>
      <mesh position={[0, 0, 0.02]} material={rain}>
        <planeGeometry args={[w, h]} />
      </mesh>
      {[h / 2, -h / 2].map((y) => (
        <Mesh key={y} p={[0, y, 0.04]} m={k.cream}>
          <Box w={w + 0.12} h={0.08} d={0.08} />
        </Mesh>
      ))}
      {[-w / 2, 0, w / 2].map((x) => (
        <Mesh key={x} p={[x, 0, 0.04]} m={k.cream}>
          <Box w={x === 0 ? 0.04 : 0.08} h={h} d={0.08} />
        </Mesh>
      ))}
      <Mesh p={[0, 0.1, 0.04]} m={k.cream}>
        <Box w={w} h={0.04} d={0.06} />
      </Mesh>
      <Mesh p={[0, -h / 2 - 0.06, 0.1]} m={k.walnut}>
        <Box w={w + 0.3} h={0.05} d={0.22} />
      </Mesh>
      {[-1, 1].map((s) => (
        <group key={s} position={[s * (w / 2 + 0.24), 0.05, 0.15]}>
          <Mesh m={k.fabricRust} s={[1, 1, 0.45]}>
            <cylinderGeometry args={[0.11, 0.19, h + 0.6, 14]} />
          </Mesh>
        </group>
      ))}
      <Mesh p={[0, h / 2 + 0.34, 0.17]} r={[0, 0, Math.PI / 2]} m={k.brass}>
        <Cyl t={0.018} b={0.018} h={w + 0.9} seg={8} />
      </Mesh>
    </group>
  );
}

/** Ceiling pendant. One per room casts (baked) shadows. */
export function Pendant({
  p,
  kind = "globe",
  intensity = 12,
  castShadow = false,
}: {
  p: V3;
  kind?: "globe" | "enamel" | "green" | "drum";
  intensity?: number;
  castShadow?: boolean;
}) {
  const k = mats();
  const drop = 0.38;
  const shade = useMemo(() => {
    if (kind === "green") return new THREE.MeshPhysicalMaterial({ color: "#1f6b4e", emissive: "#2a8a62", emissiveIntensity: 0.35, roughness: 0.15, clearcoat: 1, side: THREE.DoubleSide });
    if (kind === "enamel") return new THREE.MeshPhysicalMaterial({ color: "#2f5f5c", roughness: 0.3, clearcoat: 1, side: THREE.DoubleSide });
    if (kind === "drum") return k.linenWarm;
    return new THREE.MeshStandardMaterial({ color: "#fff3dc", emissive: "#ffd9a0", emissiveIntensity: 1.6, roughness: 0.4 });
  }, [kind, k.linenWarm]);
  return (
    <group position={[p[0], H, p[2]]}>
      <Mesh p={[0, -0.02, 0]} m={k.brass} cast={false}>
        <Cyl t={0.08} b={0.08} h={0.04} />
      </Mesh>
      <Mesh p={[0, -drop / 2, 0]} m={k.black} cast={false}>
        <Cyl t={0.006} b={0.006} h={drop} seg={6} />
      </Mesh>
      <mesh position={[0, -drop - 0.12, 0]} material={shade}>
        {kind === "globe" ? (
          <sphereGeometry args={[0.16, 24, 18]} />
        ) : kind === "drum" ? (
          <cylinderGeometry args={[0.3, 0.3, 0.26, 28, 1, true]} />
        ) : (
          <coneGeometry args={[0.24, 0.24, 28, 1, true]} />
        )}
      </mesh>
      {kind !== "globe" && (
        <Mesh p={[0, -drop - 0.16, 0]} m={k.bulb} cast={false}>
          <Ball r={0.05} />
        </Mesh>
      )}
      <pointLight
        position={[0, -drop - 0.32, 0]}
        color="#ffc68a"
        intensity={intensity * 1.25}
        distance={6.5}
        decay={2}
        castShadow={castShadow}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.002}
        shadow-normalBias={0.04}
        shadow-radius={5}
        shadow-camera-near={0.1}
        shadow-camera-far={10}
      />
    </group>
  );
}

/** Clock face + hands that tell the visitor's real time. */
export function ClockHands({ r = 0.2 }: { r?: number }) {
  const hour = useRef<THREE.Mesh>(null);
  const minute = useRef<THREE.Mesh>(null);
  const k = mats();
  const face = useMemo(() => new THREE.MeshStandardMaterial({ map: clockFace(), roughness: 0.6 }), []);
  useFrame(() => {
    const d = new Date();
    const m = d.getMinutes() + d.getSeconds() / 60;
    const h = (d.getHours() % 12) + m / 60;
    if (minute.current) minute.current.rotation.z = -(m / 60) * Math.PI * 2;
    if (hour.current) hour.current.rotation.z = -(h / 12) * Math.PI * 2;
  });
  return (
    <group>
      <mesh material={face}>
        <circleGeometry args={[r, 40]} />
      </mesh>
      <mesh ref={hour} position={[0, 0, 0.01]} material={k.ink}>
        <boxGeometry args={[r * 0.07, r * 0.55, 0.005]} />
      </mesh>
      <mesh ref={minute} position={[0, 0, 0.015]} material={k.ink}>
        <boxGeometry args={[r * 0.045, r * 0.8, 0.005]} />
      </mesh>
    </group>
  );
}

/* --------------------------------- hall --------------------------------- */

function FrontDoor() {
  const k = mats();
  const glass = useMemo(() => new THREE.MeshBasicMaterial({ map: nightSky(), toneMapped: false, color: new THREE.Color(0.6, 0.62, 0.7) }), []);
  return (
    <group position={[0, 0, D - 0.1]}>
      <Mesh p={[0, 1.15, 0]} m={k.mahogany}>
        <Box w={DH * 2 - 0.05} h={2.3} d={0.07} />
      </Mesh>
      {[0, 1].map((r) =>
        [0, 1].map((c) => (
          <mesh key={`${r}${c}`} position={[-0.2 + c * 0.4, 1.55 + r * 0.38, -0.042]} rotation={[0, Math.PI, 0]} material={glass}>
            <planeGeometry args={[0.32, 0.32]} />
          </mesh>
        )),
      )}
      {[-0.2, 0.2].map((x) => (
        <Mesh key={x} p={[x, 0.7, -0.045]} m={k.walnut} cast={false}>
          <Box w={0.3} h={0.7} d={0.01} />
        </Mesh>
      ))}
      <Mesh p={[0.55, 1.05, -0.07]} m={k.brass}>
        <Ball r={0.04} />
      </Mesh>
      <Mesh p={[0, 0.98, -0.05]} m={k.brass}>
        <Box w={0.3} h={0.04} d={0.012} />
      </Mesh>
      {[-1, 1].map((s) => (
        <Mesh key={s} p={[s * (DH + 0.05), 1.15, -0.07]} m={k.walnut}>
          <Box w={0.12} h={2.3} d={0.08} />
        </Mesh>
      ))}
      <Mesh p={[0, 2.37, -0.07]} m={k.walnut}>
        <Box w={DH * 2 + 0.22} h={0.13} d={0.08} />
      </Mesh>
    </group>
  );
}

function Hall() {
  const k = mats();
  const diploma = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: paper(["Bachelor of Arts", "Translation & Interpretation", "Al-Alsun Faculty", "", "awarded to", "Ali Farghaly"], {
          title: "Diploma",
          size: 26,
          w: 512,
          h: 400,
        }),
        roughness: 0.8,
      }),
    [],
  );
  const art = useMemo(
    () => [
      new THREE.MeshStandardMaterial({ map: paper(["Cairo", "2017"], { bg: "#2f5f5c", ink: "#e9d7a8", size: 44, w: 300, h: 380 }), roughness: 0.9 }),
      new THREE.MeshStandardMaterial({ map: paper(["Dubai", "2021"], { bg: "#c99a4a", ink: "#2a2116", size: 44, w: 300, h: 380 }), roughness: 0.9 }),
    ],
    [],
  );
  return (
    <group>
      <FrontDoor />
      <Rug p={[0, 0, 0.6]} w={1.6} d={10.8} palette="teal" />

      {/* console: rotary phone, key bowl, a round mirror above */}
      <group position={[HALL.console.x, 0, HALL.console.z]}>
        <Mesh p={[0, 0.82, 0]} m={k.teak}>
          <Box w={0.42} h={0.05} d={1.15} />
        </Mesh>
        <Mesh p={[0, 0.7, 0]} m={k.teak}>
          <Box w={0.38} h={0.16} d={1.05} />
        </Mesh>
        {[-0.5, 0.5].map((z) =>
          [-0.15, 0.15].map((x) => (
            <Mesh key={`${x}${z}`} p={[x, 0.31, z]} m={k.teak}>
              <Cyl t={0.02} b={0.014} h={0.62} seg={8} />
            </Mesh>
          )),
        )}
        <Hi id="phone">
          <group position={[0.02, 0.88, -0.22]} rotation={[0, Math.PI / 2, 0]}>
            <RoundedBox args={[0.26, 0.1, 0.22]} radius={0.04} material={k.mint} castShadow />
            <Mesh p={[0, 0.06, 0.03]} r={[-0.5, 0, 0]} m={k.cream}>
              <Cyl t={0.07} b={0.07} h={0.01} seg={24} />
            </Mesh>
            <group position={[0, 0.11, -0.04]}>
              <RoundedBox args={[0.26, 0.05, 0.06]} radius={0.025} material={k.mint} castShadow />
              {[-0.13, 0.13].map((x) => (
                <Mesh key={x} p={[x, -0.02, 0]} m={k.mint}>
                  <Ball r={0.035} />
                </Mesh>
              ))}
            </group>
          </group>
        </Hi>
        <Mesh p={[0, 0.88, 0.28]} m={k.ceramic}>
          <Cyl t={0.1} b={0.06} h={0.06} />
        </Mesh>
        <Mesh p={[0.03, 0.92, 0.28]} r={[0, 0.5, 0]} m={k.brass}>
          <Box w={0.02} h={0.01} d={0.07} />
        </Mesh>
        <Plant p={[0, 0.85, 0.45]} s={0.45} kind="small" />
      </group>
      {/* the mirror: brass ring, facing into the hall */}
      <group position={[HALL.mirror.x, HALL.mirror.y, HALL.mirror.z]} rotation={[0, Math.PI / 2, 0]}>
        <Hi id="hallMirror">
          <Mesh p={[0, 0, 0.005]} m={k.brass}>
            <torusGeometry args={[0.39, 0.035, 12, 48]} />
          </Mesh>
        </Hi>
        <Mesh p={[0, 0, -0.01]} r={[Math.PI / 2, 0, 0]} m={k.walnut} cast={false}>
          <Cyl t={0.4} b={0.4} h={0.02} seg={40} />
        </Mesh>
      </group>
      <Mirror position={[HALL.mirror.x + 0.012, HALL.mirror.y, HALL.mirror.z]} rotation={[0, Math.PI / 2, 0]} w={0.76} h={0.76} round />

      {/* diploma and two framed prints on the opposite wall (clear of the doorways) */}
      <Hi id="diploma">
        <group position={[HALL.diploma.x - 0.1, 1.65, HALL.diploma.z]} rotation={[0, -Math.PI / 2, 0]}>
          <Mesh p={[0, 0, -0.02]} m={k.walnut}>
            <Box w={0.9} h={0.72} d={0.04} />
          </Mesh>
          <mesh position={[0, 0, 0.004]} material={diploma}>
            <planeGeometry args={[0.78, 0.6]} />
          </mesh>
        </group>
      </Hi>
      {HALL.frames.map((z, i) => (
        <group key={z} position={[1.9, 1.7, z]} rotation={[0, -Math.PI / 2, 0]}>
          <Mesh m={k.brass}>
            <Box w={0.46} h={0.58} d={0.03} />
          </Mesh>
          <mesh position={[0, 0, 0.018]} material={art[i]}>
            <planeGeometry args={[0.38, 0.5]} />
          </mesh>
        </group>
      ))}

      {/* coat stand + umbrella stand by the door */}
      <group position={[HALL.coat.x, 0, HALL.coat.z]}>
        <Mesh p={[0, 0.9, 0]} m={k.walnut}>
          <Cyl t={0.025} b={0.03} h={1.8} seg={10} />
        </Mesh>
        {[0, 1, 2, 3].map((i) => (
          <Mesh key={i} p={[Math.cos(i * 1.57) * 0.18, 0.04, Math.sin(i * 1.57) * 0.18]} r={[0, -i * 1.57, 0.6]} m={k.walnut}>
            <Box w={0.3} h={0.03} d={0.03} />
          </Mesh>
        ))}
        <Mesh p={[0.06, 1.3, 0]} s={[1, 1.7, 0.55]} m={k.fabricRust}>
          <Ball r={0.17} />
        </Mesh>
        <Mesh p={[0, 1.86, 0]} m={k.black}>
          <Cyl t={0.11} b={0.13} h={0.1} />
        </Mesh>
        <Mesh p={[0, 1.81, 0]} m={k.black}>
          <Cyl t={0.2} b={0.2} h={0.015} />
        </Mesh>
      </group>
      <group position={[1.6, 0, 6.65]}>
        <Mesh p={[0, 0.25, 0]} m={k.brass}>
          <cylinderGeometry args={[0.12, 0.12, 0.5, 20, 1, true]} />
        </Mesh>
        <Mesh p={[0.03, 0.55, 0]} r={[0, 0, 0.12]} m={k.black}>
          <Cyl t={0.012} b={0.012} h={0.7} seg={6} />
        </Mesh>
      </group>

      {/* shoe bench */}
      <group position={[HALL.shoes.x, 0, HALL.shoes.z]}>
        <Mesh p={[0, 0.42, 0]} m={k.teak}>
          <Box w={0.4} h={0.05} d={0.9} />
        </Mesh>
        <Mesh p={[0, 0.15, 0]} m={k.teak}>
          <Box w={0.38} h={0.03} d={0.86} />
        </Mesh>
        {[-0.42, 0.42].map((z) => (
          <Mesh key={z} p={[0, 0.21, z]} m={k.teak}>
            <Box w={0.38} h={0.42} d={0.04} />
          </Mesh>
        ))}
        {[-0.22, 0.05].map((z, i) => (
          <group key={z} position={[0.02, 0.2, z]}>
            {[-0.06, 0.06].map((x) => (
              <RoundedBox key={x} args={[0.1, 0.08, 0.26]} radius={0.035} position={[x, 0, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
                <meshStandardMaterial color={i ? "#5b2a1e" : "#efebe2"} roughness={0.6} />
              </RoundedBox>
            ))}
          </group>
        ))}
        <RoundedBox args={[0.34, 0.08, 0.5]} radius={0.04} position={[0, 0.49, 0.15]} material={k.fabricTeal} castShadow />
      </group>

      {/* grandfather clock at the end of the hall */}
      <Hi id="clock">
        <group position={[HALL.clock.x, 0, HALL.clock.z]}>
          <Mesh p={[0, 1.0, 0]} m={k.mahogany}>
            <Box w={0.55} h={2.0} d={0.36} />
          </Mesh>
          <Mesh p={[0, 2.1, 0.02]} m={k.mahogany}>
            <Box w={0.62} h={0.24} d={0.4} />
          </Mesh>
          <Mesh p={[0, 2.27, 0.02]} m={k.brass} cast={false}>
            <Box w={0.5} h={0.04} d={0.36} />
          </Mesh>
          <group position={[0, 1.65, 0.185]}>
            <Mesh r={[Math.PI / 2, 0, 0]} m={k.brass}>
              <Cyl t={0.21} b={0.21} h={0.02} seg={32} />
            </Mesh>
            <group position={[0, 0, 0.012]}>
              <ClockHands r={0.19} />
            </group>
          </group>
          <Pendulum />
        </group>
      </Hi>
      <Plant p={[-1.45, 0, -6.4]} s={1.3} kind="fern" />
      <Plant p={[1.45, 0, -6.4]} s={1.0} kind="monstera" />
    </group>
  );
}

function Pendulum() {
  const g = useRef<THREE.Group>(null);
  const k = mats();
  useFrame(({ clock }) => {
    if (g.current) g.current.rotation.z = Math.sin(clock.elapsedTime * Math.PI) * 0.12;
  });
  return (
    <group position={[0, 1.4, 0.185]}>
      <mesh position={[0, -0.45, 0]}>
        <planeGeometry args={[0.36, 1.0]} />
        <meshStandardMaterial color="#1a120c" />
      </mesh>
      <group ref={g}>
        <Mesh p={[0, -0.35, 0.012]} m={k.brass} cast={false}>
          <Box w={0.012} h={0.7} d={0.005} />
        </Mesh>
        <Mesh p={[0, -0.72, 0.02]} r={[Math.PI / 2, 0, 0]} m={k.brass} cast={false}>
          <Cyl t={0.07} b={0.07} h={0.015} />
        </Mesh>
      </group>
    </group>
  );
}

export const HomeShell = memo(function HomeShell({ onOccluder }: { onOccluder: (m: THREE.Object3D | null) => void }) {
  return (
    <group>
      <RainDriver />
      <Floors />
      <Walls onOccluder={onOccluder} />
      <Hall />
      <Pendant p={[0, 0, -3.6]} kind="globe" intensity={9} castShadow />
      <Pendant p={[0, 0, 3.4]} kind="globe" intensity={8} />
    </group>
  );
});
