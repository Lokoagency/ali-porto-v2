"use client";

import { memo, useCallback, useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Ali } from "./Ali";
import { houseAudio, type Surface } from "./audio";
import { input, moveIntent } from "./input";
import type { Rig } from "./rig";
import { targetStore } from "./store";
import { EYE, HALL, LIVING, MIRRORS, resolve, roomAt, SPOTS, START, type RoomId, type Spot, type SpotId, type V3 } from "./world";

const WALK = 2.2;
const RUN = 4.4;
const ACCEL = 11;
const FRICTION = 13;
const FOV = 64;
const damp = THREE.MathUtils.damp;

export type Mode = { kind: "walk" } | { kind: "seat"; spot: SpotId } | { kind: "inspect"; spot: SpotId; view: number };

/** Rugs: footsteps go soft on these (xz rectangles). */
const RUGS = [
  { x: 0, z: 0.6, w: 1.6, d: 10.8 },
  { x: -5.4, z: -3.5, w: 3.4, d: 2.4 },
  { x: -5.5, z: 2.45, w: 3.6, d: 2.8 },
  { x: 5.6, z: -4.1, w: 2.6, d: 3.4 },
];
function surfaceAt(x: number, z: number): Surface {
  if (RUGS.some((r) => Math.abs(x - r.x) < r.w / 2 && Math.abs(z - r.z) < r.d / 2)) return "rug";
  return roomAt(x, z).floor === "tile" ? "tile" : "wood";
}

/**
 * First-person controller. The camera is your eyes; Ali's body exists on a layer only
 * mirrors can see, so you meet him whenever you pass one.
 */
export const Player = memo(function Player({
  enabled,
  mode,
  onRoom,
  onStand,
}: {
  enabled: boolean;
  mode: Mode;
  onRoom: (id: RoomId) => void;
  onStand: () => void;
}) {
  const body = useRef<THREE.Group>(null);
  const rig = useRef<Rig | null>(null);
  const onRig = useCallback((r: Rig | null) => {
    rig.current = r;
    if (process.env.NODE_ENV !== "production") Object.assign(window, { __rig: r });
  }, []);

  const st = useRef({
    pos: new THREE.Vector3(START[0], 0, START[1]),
    vel: new THREE.Vector2(),
    heading: Math.PI,
    phase: 0,
    lastStep: 0,
    move: 0,
    sit: 0,
    room: "hall" as RoomId,
    camPos: new THREE.Vector3(0.6, 1.7, START[1] + 1.6),
    camQuat: new THREE.Quaternion(),
    tmpQuat: new THREE.Quaternion(),
    tmpPos: new THREE.Vector3(),
    euler: new THREE.Euler(0, 0, 0, "YXZ"),
    m4: new THREE.Matrix4(),
    look: new THREE.Vector3(),
    fwd: new THREE.Vector3(),
    to: new THREE.Vector3(),
    blend: 1, // 0 → just changed mode (ease the camera), 1 → settled
    lastMode: "walk",
    standAt: new THREE.Vector2(),
    fov: FOV,
    /** when the current wave started (clock seconds); each mirror gets one hello */
    waveAt: -10,
    waved: new Set<string>(),
  });

  const cb = useRef({ onRoom, onStand, mode, enabled });
  useEffect(() => {
    cb.current = { onRoom, onStand, mode, enabled };
  });

  // dev only: lets us place Ali anywhere while testing
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") Object.assign(window, { __ali: st.current, __input: input });
  }, []);

  useFrame((state, rawDt) => {
    // real time down to ~12 fps (so a slow frame never slows you down); only a long hitch is clamped
    const dt = Math.min(rawDt, 1 / 12);
    const s = st.current;
    const cam = state.camera as THREE.PerspectiveCamera;
    const t = state.clock.elapsedTime;
    const { mode: md, enabled: on } = cb.current;
    const modeKey = md.kind === "walk" ? "walk" : `${md.kind}:${md.spot}:${md.kind === "inspect" ? md.view : ""}`;
    if (modeKey !== s.lastMode) {
      // remember where we stood before sitting so we can get back up there
      if (s.lastMode === "walk" && md.kind !== "walk") s.standAt.set(s.pos.x, s.pos.z);
      if (md.kind === "walk" && s.lastMode !== "walk") {
        s.pos.x = s.standAt.x;
        s.pos.z = s.standAt.y;
        // keep looking the way the camera was looking
        s.euler.setFromQuaternion(s.camQuat, "YXZ");
        input.yaw = s.euler.y;
        input.pitch = THREE.MathUtils.clamp(s.euler.x, -1.35, 1.35);
      }
      // sitting down turns you to face where the seat faces
      const into = md.kind === "seat" ? SPOTS.find((x) => x.id === md.spot)?.seat : undefined;
      if (into) {
        input.yaw = into.heading - Math.PI;
        input.pitch = -0.12;
      }
      // looking into a mirror on purpose always gets a wave back
      if (md.kind === "inspect" && (md.spot === "hallMirror" || md.spot === "bedMirror")) {
        s.waveAt = t + 0.5;
        s.waved.add(md.spot === "hallMirror" ? "hall" : "bedroom");
      }
      s.lastMode = modeKey;
      s.blend = 0;
    }
    s.blend = Math.min(1, s.blend + dt / 0.6);

    const spot = md.kind !== "walk" ? SPOTS.find((x) => x.id === md.spot) : undefined;
    const seat = spot?.seat && (md.kind === "seat" || md.kind === "inspect") ? spot.seat : undefined;

    /* ---------------- movement ---------------- */
    const intent = on && md.kind === "walk" ? moveIntent() : { x: 0, y: 0, run: false };
    const wants = Math.hypot(intent.x, intent.y) > 0.05;
    if (on && md.kind === "seat" && s.sit > 0.7) {
      const i = moveIntent();
      if (Math.hypot(i.x, i.y) > 0.3) cb.current.onStand();
    }

    const yaw = input.yaw;
    const fx = -Math.sin(yaw);
    const fz = -Math.cos(yaw);
    const rx = Math.cos(yaw);
    const rz = -Math.sin(yaw);
    const speed = intent.run ? RUN : WALK;
    const tx = (rx * intent.x + fx * intent.y) * speed;
    const tz = (rz * intent.x + fz * intent.y) * speed;
    s.vel.x = damp(s.vel.x, tx, wants ? ACCEL : FRICTION, dt);
    s.vel.y = damp(s.vel.y, tz, wants ? ACCEL : FRICTION, dt);

    if (seat) {
      s.pos.x = damp(s.pos.x, seat.hips[0], 8, dt);
      s.pos.z = damp(s.pos.z, seat.hips[2], 8, dt);
      s.vel.set(0, 0);
    } else if (md.kind === "walk") {
      // small sub-steps keep collisions solid even when a frame is long
      const n = Math.ceil(dt * 60);
      for (let i = 0; i < n; i++) {
        s.pos.x += (s.vel.x * dt) / n;
        s.pos.z += (s.vel.y * dt) / n;
        resolve(s.pos);
      }
    }

    const sp = s.vel.length();
    s.move = damp(s.move, sp / WALK, 10, dt);
    s.sit = damp(s.sit, seat ? 1 : 0, 6, dt);
    const m = Math.min(1, s.move);
    const runK = THREE.MathUtils.clamp(s.move - 1, 0, 1);
    s.phase += dt * (2.0 + sp * 2.75) * Math.min(1, s.move * 1.5);

    // footsteps on each half cycle
    if (sp > 0.4 && Math.floor(s.phase / Math.PI) !== s.lastStep) {
      s.lastStep = Math.floor(s.phase / Math.PI);
      houseAudio.step(surfaceAt(s.pos.x, s.pos.z), runK > 0.5);
    }
    houseAudio.update(s.pos.x, s.pos.z, [LIVING.fire.x, 0.6], [HALL.clock.x, HALL.clock.z], [-6.05, 6.65]);

    const room = roomAt(s.pos.x, s.pos.z).id;
    if (room !== s.room) {
      s.room = room;
      cb.current.onRoom(room);
    }

    /* ---------------- camera ---------------- */
    const ease = 1 - Math.pow(1 - s.blend, 3);
    if (md.kind === "inspect" && spot?.views) {
      const v = spot.views[Math.min(md.view, spot.views.length - 1)];
      s.tmpPos.set(...v.pos);
      s.look.set(...v.look);
      s.m4.lookAt(s.tmpPos, s.look, cam.up);
      s.tmpQuat.setFromRotationMatrix(s.m4);
      const k = 1 - Math.exp(-7 * dt);
      s.camPos.lerp(s.tmpPos, k);
      s.camQuat.slerp(s.tmpQuat, k);
    } else {
      // eyes: walking (with head bob) or seated
      const bob = Math.sin(s.phase * 2) * (0.028 + runK * 0.03) * m;
      const sway = Math.sin(s.phase) * (0.018 + runK * 0.012) * m;
      if (seat) s.tmpPos.set(...seat.eye);
      else s.tmpPos.set(s.pos.x + rx * sway, EYE + bob, s.pos.z + rz * sway);
      if (!on) {
        // before you come in: a slow, breathing establishing shot down the hall
        s.tmpPos.set(0.55 + Math.sin(t * 0.2) * 0.12, 1.66, START[1] + 1.7);
        s.euler.set(-0.06 + Math.sin(t * 0.3) * 0.01, 0.12 + Math.sin(t * 0.17) * 0.04, 0, "YXZ");
      } else {
        const roll = Math.sin(s.phase) * 0.006 * m;
        s.euler.set(input.pitch, yaw, roll, "YXZ");
      }
      s.tmpQuat.setFromEuler(s.euler);
      if (s.blend < 1) {
        const k = 1 - Math.exp(-(4 + 30 * ease) * dt);
        s.camPos.lerp(s.tmpPos, k);
        s.camQuat.slerp(s.tmpQuat, k);
      } else {
        // settled: no smoothing at all — first person has to feel direct
        s.camPos.copy(s.tmpPos);
        s.camQuat.copy(s.tmpQuat);
      }
    }
    cam.position.copy(s.camPos);
    cam.quaternion.copy(s.camQuat);
    s.fov = damp(s.fov, md.kind === "inspect" ? 52 : FOV + runK * 6, 6, dt);
    if (Math.abs(cam.fov - s.fov) > 0.01) {
      cam.fov = s.fov;
      cam.updateProjectionMatrix();
    }

    /* ---------------- what are you looking at? ---------------- */
    // walking: anything nearby · seated: only what belongs to that seat (the laptop at the desk)
    let best: Spot | null = null;
    const seatedOn = md.kind === "seat" ? md.spot : undefined;
    cam.getWorldDirection(s.fwd);
    if (on && (md.kind === "walk" || seatedOn)) {
      let bestScore = Infinity;
      for (const sp2 of SPOTS) {
        if (sp2.seatedAt !== seatedOn) continue;
        if (Math.hypot(sp2.x - s.pos.x, sp2.z - s.pos.z) > sp2.r) continue;
        s.to.set(...(sp2.focus as V3)).sub(cam.position);
        const dist = s.to.length();
        const angle = s.fwd.angleTo(s.to.normalize());
        const limit = Math.min(0.55, 0.22 + 0.35 / Math.max(dist, 0.5));
        if (angle < limit && angle * (0.6 + dist * 0.2) < bestScore) {
          best = sp2;
          bestScore = angle * (0.6 + dist * 0.2);
        }
      }
    }
    targetStore.set(best?.id ?? null);

    /* ---------------- the first look into each mirror gets a wave ---------------- */
    if (on && md.kind !== "inspect" && t - s.waveAt > 3) {
      for (const mr of MIRRORS) {
        if (s.waved.has(mr.id)) continue;
        s.to.set(...mr.pos).sub(cam.position);
        const dist = s.to.length();
        if (dist > 4.5) continue;
        s.to.divideScalar(dist);
        // roughly square-on (so he's actually in the glass) and looking right at it
        const facing = -(s.to.x * mr.normal[0] + s.to.z * mr.normal[1]);
        if (facing < 0.6 || s.fwd.angleTo(s.to) > 0.3) continue;
        s.waved.add(mr.id);
        s.waveAt = t + 0.25;
        break;
      }
    }

    /* ---------------- body (seen in mirrors) ---------------- */
    const g = body.current;
    if (!g) return;
    const faceTo = seat ? seat.heading : sp > 0.15 ? Math.atan2(s.vel.x, s.vel.y) : md.kind === "inspect" && spot ? Math.atan2(spot.focus[0] - s.pos.x, spot.focus[2] - s.pos.z) : yaw + Math.PI;
    let dh = faceTo - s.heading;
    dh = Math.atan2(Math.sin(dh), Math.cos(dh));
    // the body only turns when you look far enough away, like a real person
    if (seat || sp > 0.15 || Math.abs(dh) > 0.9 || md.kind === "inspect") s.heading += dh * Math.min(1, 9 * dt);
    g.position.set(s.pos.x, 0, s.pos.z);
    g.rotation.y = s.heading;

    const r = rig.current;
    if (!r) return;
    // every angle below is in model space: X = across the body, Y = up, Z = forward
    const lerp = THREE.MathUtils.lerp;
    const sn = Math.sin(s.phase);
    const cs = Math.cos(s.phase);
    const legA = (0.5 + runK * 0.38) * m;
    const sit = s.sit;
    const breathe = Math.sin(t * 1.7) * (1 - m);
    // wave: raise (0.45 s), a few easy side-to-side swings, lower
    const wt = t - s.waveAt;
    const wave = wt < 0 || wt > 2.7 ? 0 : THREE.MathUtils.smoothstep(wt, 0, 0.45) * (1 - THREE.MathUtils.smoothstep(wt, 2.15, 2.7));
    const wig = Math.sin(Math.max(0, wt - 0.35) * 8.5) * 0.32;
    // seat heights are measured for thighs that pivot 6 cm under the hips joint
    const seatDrop = seat ? seat.hips[1] + (r.thighDrop - 0.06) - r.hipsY : 0;
    r.offsetHips(0, lerp(Math.abs(cs) * 0.035 * m - 0.02 * m - runK * 0.04, seatDrop, sit), 0);
    r.rotate("hips", 0, sn * 0.09 * m, 0);

    // lean into a run, sit up straight, breathe when still
    const lean = 0.05 * m + runK * 0.16 - sit * 0.05;
    const twist = -sn * 0.14 * m;
    r.rotate("spine", lean * 0.5 - breathe * 0.006, twist * 0.5);
    r.rotate("chest", lean * 0.25 - breathe * 0.008, twist * 0.25);
    r.rotate("upperChest", lean * 0.25 - breathe * 0.008, twist * 0.25);

    for (const s2 of ["L", "R"] as const) {
      const sx = r.side(`thigh${s2}`);
      const legSwing = sn * sx;
      r.rotate(`thigh${s2}`, lerp(-legSwing * legA, -Math.PI / 2 + 0.12, sit), 0, lerp(0, sx * 0.06, sit));
      r.rotate(`knee${s2}`, lerp(0.05 + Math.max(0, -cs * sx) * (0.6 + runK * 0.7) * m, Math.PI / 2 - 0.1, sit));
      r.rotate(`foot${s2}`, lerp(Math.max(0, legSwing) * -0.25 * m, 0.1, sit));

      const ax = r.side(`arm${s2}`);
      const armSwing = -sn * ax;
      // he waves with his right hand; the other arm carries on as normal
      const w = s2 === "R" ? wave : 0;
      const armX = lerp(armSwing * (0.42 + runK * 0.4) * m, -0.42, sit);
      const armZ = ax * (0.02 + breathe * 0.008) * (1 - sit) + ax * 0.1 * sit;
      // upper arm out to the side (just under shoulder height) and a little forward
      r.rotate(`arm${s2}`, lerp(armX, 0, w), -ax * 0.4 * w, lerp(armZ, ax * 1.25, w));
      // forearm straight up from the elbow, swinging side to side
      const elbowX = lerp(-0.05 - (0.18 + runK * 1.0) * m - Math.max(0, armSwing) * 0.3 * m, -0.95, sit);
      r.rotate(`elbow${s2}`, lerp(elbowX, 0, w), 0, ax * (Math.PI - 1.25 + wig) * w);
      r.rotate(`hand${s2}`, 0, 0, ax * wig * 0.5 * w);
    }

    // the head follows where you're looking (within a natural range)
    let hy = yaw + Math.PI - s.heading;
    hy = Math.atan2(Math.sin(hy), Math.cos(hy));
    hy = THREE.MathUtils.clamp(hy, -0.9, 0.9);
    const hx = THREE.MathUtils.clamp(-input.pitch * 0.6, -0.4, 0.5);
    r.rotate("neck", hx * 0.35, hy * 0.35);
    // a friendly little head tilt while waving
    r.rotate("head", hx * 0.65, hy * 0.65, -r.side("armR") * 0.1 * wave);
  });

  return (
    <group ref={body} position={[START[0], 0, START[1]]} rotation={[0, Math.PI, 0]}>
      <Ali onRig={onRig} />
    </group>
  );
});
