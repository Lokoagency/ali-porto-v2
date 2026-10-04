"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { BODY_LAYER } from "./Mirror";
import { Rig } from "./rig";

/**
 * Ali as a stylized figure: soft, rounded, a little toy-like, with the things you'd
 * recognise him by: round gold glasses, a full trimmed beard, short faded hair, a white
 * polo and light jeans. Every part hangs off a named bone ("Hips", "LeftUpLeg",
 * "RightForeArm", …) so the controller's Rig can walk, sit and wave him.
 * Faces +Z; his left is +X. Seen only in mirrors.
 */

/** A rounded, tapered limb hanging down from its joint (y = 0 → −len). */
function limb(rTop: number, rBot: number, len: number, seg = 22) {
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i <= 6; i++) {
    const a = -Math.PI / 2 + (i / 6) * (Math.PI / 2);
    pts.push(new THREE.Vector2(rBot * Math.cos(a), -len + rBot * Math.sin(a)));
  }
  for (let i = 0; i <= 6; i++) {
    const a = (i / 6) * (Math.PI / 2);
    pts.push(new THREE.Vector2(rTop * Math.cos(a), rTop * Math.sin(a)));
  }
  return new THREE.LatheGeometry(pts, seg);
}

/** Lathe a profile; points are sorted bottom → top so faces always point outward. */
const lathe = (pts: [number, number][], seg = 32) =>
  new THREE.LatheGeometry(
    [...pts].sort((a, b) => a[1] - b[1]).map(([r, y]) => new THREE.Vector2(r, y)),
    seg,
  );

export function Ali({ onRig }: { onRig: (rig: Rig | null) => void }) {
  const m = useMemo(() => {
    const std = (p: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial(p);
    return {
      skin: std({ color: "#c98d68", roughness: 0.58 }),
      hair: std({ color: "#17110d", roughness: 0.62 }),
      fade: std({ color: "#3a2c23", roughness: 0.9 }),
      beard: std({ color: "#1e1610", roughness: 0.8 }),
      polo: std({ color: "#f3f1eb", roughness: 0.82 }),
      jeans: std({ color: "#87a9cc", roughness: 0.88 }),
      seam: std({ color: "#5d7fa3", roughness: 0.9 }),
      belt: std({ color: "#6b4128", roughness: 0.48 }),
      steel: std({ color: "#c9c9c4", metalness: 1, roughness: 0.3 }),
      gold: std({ color: "#d8b46f", metalness: 1, roughness: 0.26 }),
      shoe: std({ color: "#f6f4ef", roughness: 0.5 }),
      sole: std({ color: "#dcd6ca", roughness: 0.7 }),
      eye: std({ color: "#24160d", roughness: 0.18 }),
      glint: new THREE.MeshBasicMaterial({ color: "#ffffff" }),
      teeth: std({ color: "#fbf8f1", roughness: 0.35 }),
      watch: std({ color: "#151515", roughness: 0.35 }),
      lens: new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.07, depthWrite: false }),
    };
  }, []);

  const g = useMemo(
    () => ({
      pelvis: lathe([
        [0, -0.15],
        [0.12, -0.148],
        [0.15, -0.09],
        [0.156, -0.02],
        [0.152, 0.04],
        [0.146, 0.075],
        [0, 0.08],
      ]),
      torso: lathe([
        [0, -0.13],
        [0.148, -0.125],
        [0.152, -0.06],
        [0.156, 0.04],
        [0.165, 0.14],
        [0.178, 0.24],
        [0.184, 0.31],
        [0.176, 0.36],
        [0.14, 0.4],
        [0.07, 0.425],
        [0, 0.43],
      ]),
      thigh: limb(0.086, 0.066, 0.42),
      shin: limb(0.064, 0.056, 0.34),
      sleeve: limb(0.066, 0.06, 0.15),
      upperArm: limb(0.043, 0.037, 0.25),
      forearm: limb(0.037, 0.03, 0.22),
    }),
    [],
  );

  const root = useRef<THREE.Group>(null);
  const eyes = useRef<THREE.Group>(null);
  useLayoutEffect(() => {
    const r = root.current;
    if (!r) return;
    r.traverse((o) => o.layers.set(BODY_LAYER));
    onRig(new Rig(r));
    return () => onRig(null);
  }, [onRig]);

  // a blink every few seconds: the smallest thing that makes a figure feel alive
  const blink = useRef({ next: 2.5 });
  useFrame(({ clock }) => {
    const e = eyes.current;
    if (!e) return;
    const t = clock.elapsedTime;
    const b = blink.current;
    if (t > b.next + 0.14) b.next = t + 2.4 + ((t * 7.31) % 1) * 3;
    e.scale.y = t > b.next && t < b.next + 0.14 ? 0.12 : 1;
  });

  const leg = (side: 1 | -1) => {
    const s = side === 1 ? "Left" : "Right";
    return (
      <bone name={`${s}UpLeg`} position={[side * 0.09, -0.06, 0]}>
        <mesh material={m.jeans} scale={[1, 1, 0.95]}>
          <sphereGeometry args={[0.085, 18, 14]} />
        </mesh>
        <mesh geometry={g.thigh} material={m.jeans} scale={[1, 1, 0.95]} />
        <bone name={`${s}Leg`} position={[0, -0.42, 0]}>
          <mesh material={m.jeans}>
            <sphereGeometry args={[0.066, 16, 12]} />
          </mesh>
          <mesh geometry={g.shin} material={m.jeans} />
          {/* a soft cuff where the jeans break over the shoe */}
          <mesh position={[0, -0.345, 0]} material={m.jeans}>
            <cylinderGeometry args={[0.064, 0.069, 0.05, 20, 1, true]} />
          </mesh>
          <bone name={`${s}Foot`} position={[0, -0.39, 0]}>
            <RoundedBox args={[0.1, 0.08, 0.25]} radius={0.034} smoothness={4} position={[0, -0.04, 0.045]} material={m.shoe} />
            <mesh position={[0, -0.05, 0.14]} scale={[1, 0.62, 1.05]} material={m.shoe}>
              <sphereGeometry args={[0.05, 16, 12]} />
            </mesh>
            <RoundedBox args={[0.108, 0.024, 0.28]} radius={0.01} smoothness={2} position={[0, -0.074, 0.05]} material={m.sole} />
            {[0.0, 0.035, 0.07].map((z) => (
              <mesh key={z} position={[0, 0.002, z]} material={m.sole}>
                <boxGeometry args={[0.05, 0.005, 0.009]} />
              </mesh>
            ))}
          </bone>
        </bone>
      </bone>
    );
  };

  const arm = (side: 1 | -1) => {
    const s = side === 1 ? "Left" : "Right";
    return (
      <bone name={`${s}Shoulder`} position={[side * 0.06, 0.1, 0]}>
        <bone name={`${s}Arm`} position={[side * 0.13, -0.03, 0]}>
          {/* polo sleeve: a shoulder cap blending into the torso, then a short sleeve with a hem */}
          <mesh position={[-side * 0.012, 0, 0]} scale={[1, 0.85, 0.92]} material={m.polo}>
            <sphereGeometry args={[0.062, 20, 16]} />
          </mesh>
          <mesh geometry={g.sleeve} position={[0, 0.03, 0]} scale={[1, 1, 0.95]} material={m.polo} />
          <mesh position={[0, -0.112, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.polo}>
            <torusGeometry args={[0.058, 0.007, 8, 24]} />
          </mesh>
          <mesh geometry={g.upperArm} position={[0, -0.03, 0]} material={m.skin} />
          <bone name={`${s}ForeArm`} position={[0, -0.28, 0]}>
            <mesh material={m.skin}>
              <sphereGeometry args={[0.038, 14, 12]} />
            </mesh>
            <mesh geometry={g.forearm} material={m.skin} />
            {side === 1 && (
              <group position={[0, -0.2, 0]}>
                <mesh rotation={[0, 0, 0]} scale={[1, 1, 0.85]} material={m.watch}>
                  <cylinderGeometry args={[0.034, 0.034, 0.022, 20, 1, true]} />
                </mesh>
                <mesh position={[0.031, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={m.watch}>
                  <cylinderGeometry args={[0.017, 0.017, 0.01, 18]} />
                </mesh>
              </group>
            )}
            <bone name={`${s}Hand`} position={[0, -0.25, 0]}>
              <RoundedBox args={[0.042, 0.1, 0.074]} radius={0.019} smoothness={3} position={[0, -0.05, 0.004]} material={m.skin} />
              <mesh position={[-side * 0.01, -0.035, 0.04]} rotation={[0.55, 0, side * 0.25]} material={m.skin}>
                <capsuleGeometry args={[0.012, 0.03, 4, 8]} />
              </mesh>
            </bone>
          </bone>
        </bone>
      </bone>
    );
  };

  return (
    <group ref={root}>
      <bone name="Hips" position={[0, 0.95, 0]}>
        <mesh geometry={g.pelvis} material={m.jeans} scale={[1.06, 1, 0.78]} />
        <mesh position={[0, 0.06, 0]} scale={[1.07, 1, 0.79]} material={m.belt}>
          <cylinderGeometry args={[0.149, 0.149, 0.036, 32]} />
        </mesh>
        <mesh position={[0, 0.06, 0.12]} material={m.steel}>
          <boxGeometry args={[0.042, 0.03, 0.01]} />
        </mesh>
        <mesh position={[0.012, -0.045, 0.121]} rotation={[-0.25, 0, 0]} material={m.seam}>
          <boxGeometry args={[0.004, 0.09, 0.003]} />
        </mesh>
        {leg(1)}
        {leg(-1)}

        <bone name="Spine" position={[0, 0.08, 0]}>
          <mesh geometry={g.torso} material={m.polo} scale={[1.12, 1, 0.74]} />
          {/* the polo's hem sits just over the belt */}
          <mesh position={[0, -0.118, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1.13, 0.75, 1]} material={m.polo}>
            <torusGeometry args={[0.15, 0.011, 8, 36]} />
          </mesh>
          <bone name="Chest" position={[0, 0.13, 0]}>
            <bone name="UpperChest" position={[0, 0.13, 0]}>
              {/* collar, placket, two buttons */}
              <mesh position={[0, 0.155, -0.004]} rotation={[Math.PI / 2 + 0.12, 0, 0]} material={m.polo}>
                <torusGeometry args={[0.064, 0.017, 10, 28]} />
              </mesh>
              {[-1, 1].map((sd) => (
                <RoundedBox
                  key={sd}
                  args={[0.07, 0.055, 0.012]}
                  radius={0.005}
                  smoothness={2}
                  position={[sd * 0.042, 0.13, 0.083]}
                  rotation={[0.42, sd * 0.25, sd * 0.62]}
                  material={m.polo}
                />
              ))}
              <mesh position={[0, 0.07, 0.125]} rotation={[-0.2, 0, 0]} material={m.polo}>
                <boxGeometry args={[0.03, 0.1, 0.006]} />
              </mesh>
              {[0.05, 0.09].map((y) => (
                <mesh key={y} position={[0, y, 0.13]} rotation={[Math.PI / 2 - 0.2, 0, 0]} material={m.sole}>
                  <cylinderGeometry args={[0.0065, 0.0065, 0.004, 10]} />
                </mesh>
              ))}
              {arm(1)}
              {arm(-1)}
              <bone name="Neck" position={[0, 0.15, 0]}>
                <mesh position={[0, 0.045, 0.004]} material={m.skin}>
                  <cylinderGeometry args={[0.048, 0.053, 0.12, 18]} />
                </mesh>
                <bone name="Head" position={[0, 0.09, 0]}>
                  <group position={[0, 0.09, 0.006]}>
                    <mesh scale={[0.94, 1.02, 0.98]} material={m.skin}>
                      <sphereGeometry args={[0.118, 40, 30]} />
                    </mesh>
                    {[-1, 1].map((sd) => (
                      <mesh key={sd} position={[sd * 0.113, -0.002, -0.006]} scale={[0.42, 0.8, 0.6]} material={m.skin}>
                        <sphereGeometry args={[0.028, 12, 10]} />
                      </mesh>
                    ))}

                    {/* hair: a crown swept up at the front, short faded sides */}
                    <mesh position={[0, 0.014, -0.006]} rotation={[-0.35, 0, 0]} scale={[0.96, 1, 1.01]} material={m.hair}>
                      <sphereGeometry args={[0.124, 36, 22, 0, Math.PI * 2, 0, Math.PI * 0.44]} />
                    </mesh>
                    <mesh position={[0, 0.112, 0.05]} rotation={[-0.3, 0, 0]} scale={[1.2, 0.48, 0.9]} material={m.hair}>
                      <sphereGeometry args={[0.058, 20, 14]} />
                    </mesh>
                    <mesh position={[0, 0, -0.003]} scale={[0.965, 1.01, 0.99]} material={m.fade}>
                      <sphereGeometry args={[0.1195, 36, 16, Math.PI / 2 + 0.95, Math.PI * 2 - 1.9, Math.PI * 0.36, Math.PI * 0.22]} />
                    </mesh>

                    {/* beard: a full, trimmed shell around the jaw, a fuller chin, a moustache, and a grin */}
                    <mesh position={[0, -0.012, 0.004]} rotation={[0.16, 0, 0]} scale={[0.93, 1, 1]} material={m.beard}>
                      <sphereGeometry args={[0.123, 40, 20, Math.PI / 2 - 1.75, 3.5, Math.PI * 0.55, Math.PI * 0.39]} />
                    </mesh>
                    <mesh position={[0, -0.098, 0.062]} scale={[1.35, 0.95, 1]} material={m.beard}>
                      <sphereGeometry args={[0.055, 20, 14]} />
                    </mesh>
                    <mesh position={[0, -0.036, 0.117]} rotation={[0, 0, Math.PI / 2]} scale={[0.8, 1, 0.7]} material={m.beard}>
                      <capsuleGeometry args={[0.013, 0.048, 4, 10]} />
                    </mesh>
                    <mesh position={[0, -0.052, 0.121]} rotation={[0.25, 0, Math.PI]} material={m.teeth}>
                      <torusGeometry args={[0.02, 0.0055, 6, 16, Math.PI]} />
                    </mesh>

                    {/* eyes (with a glint, and they blink), brows, nose */}
                    <group ref={eyes} position={[0, 0.012, 0]}>
                      {[-1, 1].map((sd) => (
                        <group key={sd} position={[sd * 0.042, 0, 0.1]}>
                          <mesh scale={[0.85, 1.1, 0.45]} material={m.eye}>
                            <sphereGeometry args={[0.017, 16, 12]} />
                          </mesh>
                          <mesh position={[0.005, 0.007, 0.007]} material={m.glint}>
                            <sphereGeometry args={[0.0042, 8, 6]} />
                          </mesh>
                        </group>
                      ))}
                    </group>
                    {[-1, 1].map((sd) => (
                      <mesh key={sd} position={[sd * 0.044, 0.05, 0.104]} rotation={[0.1, 0, Math.PI / 2 - sd * 0.12]} material={m.hair}>
                        <capsuleGeometry args={[0.0075, 0.03, 4, 8]} />
                      </mesh>
                    ))}
                    <mesh position={[0, -0.01, 0.114]} scale={[0.75, 0.85, 0.9]} material={m.skin}>
                      <sphereGeometry args={[0.02, 14, 10]} />
                    </mesh>

                    {/* round gold glasses */}
                    {[-1, 1].map((sd) => (
                      <group key={sd}>
                        <mesh position={[sd * 0.044, 0.012, 0.121]} material={m.gold}>
                          <torusGeometry args={[0.032, 0.0028, 8, 32]} />
                        </mesh>
                        <mesh position={[sd * 0.044, 0.012, 0.12]} material={m.lens}>
                          <circleGeometry args={[0.031, 24]} />
                        </mesh>
                        <mesh position={[sd * 0.093, 0.016, 0.062]} rotation={[0, sd * 0.2, 0]} material={m.gold}>
                          <boxGeometry args={[0.003, 0.004, 0.115]} />
                        </mesh>
                      </group>
                    ))}
                    <mesh position={[0, 0.02, 0.122]} rotation={[0, 0, Math.PI / 2]} material={m.gold}>
                      <cylinderGeometry args={[0.0025, 0.0025, 0.026, 6]} />
                    </mesh>
                  </group>
                </bone>
              </bone>
            </bone>
          </bone>
        </bone>
      </bone>
    </group>
  );
}
