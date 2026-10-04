"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Reflector } from "three/examples/jsm/objects/Reflector.js";
import type { V3 } from "./world";

/** Layer the player's body lives on: invisible to the first-person camera, visible in mirrors. */
export const BODY_LAYER = 1;

// what a mirror looks like from across the room: dark, glossy glass catching the lamps
const glass = new THREE.MeshStandardMaterial({ color: "#7d8786", metalness: 1, roughness: 0.12 });

/**
 * A real mirror. Its reflection camera also renders the body layer, so this is the
 * one place you see Ali in first person. A live reflection is a whole extra render
 * of the house, so it only runs while you're close; from further away the glass
 * just catches the light.
 */
export function Mirror({
  position,
  rotation = [0, 0, 0],
  w,
  h,
  round = false,
  range = 5,
}: {
  position: V3;
  rotation?: V3;
  w: number;
  h: number;
  round?: boolean;
  range?: number;
}) {
  const geo = useMemo(() => (round ? new THREE.CircleGeometry(w / 2, 48) : new THREE.PlaneGeometry(w, h)), [w, h, round]);
  const mirror = useMemo(() => {
    // 512 px across is plenty for a mirror you look into from a metre or two
    const tw = 512;
    const th = Math.min(1024, Math.round(tw * (h / w)));
    const r = new Reflector(geo, { textureWidth: tw, textureHeight: th, color: new THREE.Color("#c9d1cf"), clipBias: 0.003 });
    const base = r.getReflectionCamera.bind(r);
    r.getReflectionCamera = (camera: THREE.Camera) => {
      const c = base(camera);
      c.layers.enable(BODY_LAYER);
      return c;
    };
    return r;
  }, [geo, w, h]);

  useEffect(
    () => () => {
      mirror.getRenderTarget().dispose();
      (mirror.material as THREE.Material).dispose();
      geo.dispose();
    },
    [mirror, geo],
  );

  const ref = useRef<THREE.Object3D>(null);
  const center = useRef(new THREE.Vector3());
  useFrame(({ camera }) => {
    const o = ref.current;
    if (!o) return;
    // world position, so a mirror inside a rotated stand still knows where it is
    o.getWorldPosition(center.current);
    o.visible = camera.position.distanceTo(center.current) < range;
  });

  return (
    <group position={position} rotation={rotation}>
      <primitive ref={ref} object={mirror} />
      <mesh geometry={geo} material={glass} position={[0, 0, -0.002]} />
    </group>
  );
}
