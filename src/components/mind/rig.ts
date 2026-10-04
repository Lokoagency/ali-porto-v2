import * as THREE from "three";

/**
 * Procedural posing for a humanoid skinned model, whatever its bone axes are.
 * Every rotation is given in *model space* (X = his left, Y = up, Z = forward) and is
 * conjugated into each bone's rest frame, so "rotate the thigh about X" means the
 * same thing on any rig. Child offsets compose on top of their parent's.
 */

export type Joint =
  | "hips"
  | "spine"
  | "chest"
  | "upperChest"
  | "neck"
  | "head"
  | "thighL"
  | "thighR"
  | "kneeL"
  | "kneeR"
  | "footL"
  | "footR"
  | "clavicleL"
  | "clavicleR"
  | "armL"
  | "armR"
  | "elbowL"
  | "elbowR"
  | "handL"
  | "handR";

// Mixamo / Meshy / Quaternius / VRM style names, prefix-agnostic
const PATTERNS: [Joint, RegExp][] = [
  ["hips", /^(hips|pelvis|root_?hips)$/],
  ["spine", /^spine$/],
  ["chest", /^(spine0?1|spine1|chest)$/],
  ["upperChest", /^(spine0?2|spine2|upper_?chest)$/],
  ["neck", /^neck$/],
  ["head", /^head$/],
  ["thighL", /^(left_?up_?leg|l_?thigh|thigh_?l|left_?thigh|upper_?leg_?l)$/],
  ["thighR", /^(right_?up_?leg|r_?thigh|thigh_?r|right_?thigh|upper_?leg_?r)$/],
  ["kneeL", /^(left_?leg|l_?calf|calf_?l|left_?shin|lower_?leg_?l|left_?knee)$/],
  ["kneeR", /^(right_?leg|r_?calf|calf_?r|right_?shin|lower_?leg_?r|right_?knee)$/],
  ["footL", /^(left_?foot|l_?foot|foot_?l)$/],
  ["footR", /^(right_?foot|r_?foot|foot_?r)$/],
  ["clavicleL", /^(left_?shoulder|l_?clavicle|clavicle_?l)$/],
  ["clavicleR", /^(right_?shoulder|r_?clavicle|clavicle_?r)$/],
  ["armL", /^(left_?arm|l_?upper_?arm|upper_?arm_?l|left_?upper_?arm)$/],
  ["armR", /^(right_?arm|r_?upper_?arm|upper_?arm_?r|right_?upper_?arm)$/],
  ["elbowL", /^(left_?fore_?arm|l_?fore_?arm|lower_?arm_?l|left_?lower_?arm)$/],
  ["elbowR", /^(right_?fore_?arm|r_?fore_?arm|lower_?arm_?r|right_?lower_?arm)$/],
  ["handL", /^(left_?hand|l_?hand|hand_?l)$/],
  ["handR", /^(right_?hand|r_?hand|hand_?r)$/],
];

const clean = (n: string) =>
  n
    .toLowerCase()
    .replace(/^(mixamorig|armature|bip0?1|cc_base)[:_ ]?/, "")
    .replace(/[\s.:-]/g, "_");

type J = {
  bone: THREE.Object3D;
  restQ: THREE.Quaternion;
  restP: THREE.Vector3;
  /** bone's rest rotation in model space */
  W: THREE.Quaternion;
  Winv: THREE.Quaternion;
  /** inverse of the parent's rest model matrix (to place the hips in model space) */
  parentInv: THREE.Matrix4;
  restModelPos: THREE.Vector3;
  /** a model-space rotation that takes the A/T-pose to a relaxed stand */
  fix: THREE.Quaternion;
};

const _q = new THREE.Quaternion();
const _q2 = new THREE.Quaternion();
const _e = new THREE.Euler();
const _v = new THREE.Vector3();
const _m = new THREE.Matrix4();

export class Rig {
  j: Partial<Record<Joint, J>> = {};
  /** model-space height of the hips joint at rest */
  hipsY = 0.95;
  /** how far below the hips joint the thighs pivot */
  thighDrop = 0.06;

  constructor(root: THREE.Object3D) {
    // The loaded scene is cached and may already have been posed by an earlier rig
    // (remount, hot reload). Always measure from the bind pose, remembered on first sight.
    root.traverse((o) => {
      if (!(o as THREE.Bone).isBone) return;
      const rest = o.userData.rest as { q: THREE.Quaternion; p: THREE.Vector3 } | undefined;
      if (rest) {
        o.quaternion.copy(rest.q);
        o.position.copy(rest.p);
      } else o.userData.rest = { q: o.quaternion.clone(), p: o.position.clone() };
    });
    root.updateMatrixWorld(true);
    const rootInv = root.matrixWorld.clone().invert();
    const found = new Map<Joint, THREE.Object3D>();
    root.traverse((o) => {
      if (!(o as THREE.Bone).isBone) return;
      const n = clean(o.name);
      for (const [joint, re] of PATTERNS) if (!found.has(joint) && re.test(n)) found.set(joint, o);
    });

    const model = (o: THREE.Object3D) => _m.multiplyMatrices(rootInv, o.matrixWorld);
    for (const [joint, bone] of found) {
      const mm = model(bone);
      const W = new THREE.Quaternion();
      const restModelPos = new THREE.Vector3();
      mm.decompose(restModelPos, W, _v);
      const parentInv = bone.parent ? new THREE.Matrix4().multiplyMatrices(rootInv, bone.parent.matrixWorld).invert() : new THREE.Matrix4();
      this.j[joint] = {
        bone,
        restQ: bone.quaternion.clone(),
        restP: bone.position.clone(),
        W,
        Winv: W.clone().invert(),
        parentInv,
        restModelPos,
        fix: new THREE.Quaternion(),
      };
    }
    if (this.j.hips) this.hipsY = this.j.hips.restModelPos.y;
    const thighY = this.j.thighL?.restModelPos.y ?? this.j.thighR?.restModelPos.y;
    if (thighY !== undefined) this.thighDrop = this.hipsY - thighY;

    // relax an A/T-pose: point each limb segment where a standing person's would point
    const pos = (k: Joint) => this.j[k]?.restModelPos;
    const aim = (from: Joint, to: Joint, dir: THREE.Vector3) => {
      const a = pos(from);
      const b = pos(to);
      const jt = this.j[from];
      if (!a || !b || !jt) return;
      const d = b.clone().sub(a).normalize();
      jt.fix.setFromUnitVectors(d, dir.normalize());
    };
    for (const s of ["L", "R"] as const) {
      const side = Math.sign((pos(`arm${s}`)?.x ?? (s === "L" ? 1 : -1)) || 1);
      aim(`arm${s}`, `elbow${s}`, new THREE.Vector3(side * 0.13, -1, -0.02));
      // forearm relative to the (already relaxed) upper arm: a soft natural bend
      const up = this.j[`arm${s}`];
      const fa = this.j[`elbow${s}`];
      const a = pos(`elbow${s}`);
      const b = pos(`hand${s}`);
      if (up && fa && a && b) {
        const d = b.clone().sub(a).normalize().applyQuaternion(up.fix);
        fa.fix.setFromUnitVectors(d, new THREE.Vector3(side * 0.06, -1, 0.12).normalize());
      }
      const legSide = Math.sign((pos(`thigh${s}`)?.x ?? (s === "L" ? 1 : -1)) || 1);
      aim(`thigh${s}`, `knee${s}`, new THREE.Vector3(legSide * 0.03, -1, 0));
      const th = this.j[`thigh${s}`];
      const kn = this.j[`knee${s}`];
      const ka = pos(`knee${s}`);
      const kb = pos(`foot${s}`);
      if (th && kn && ka && kb) {
        const d = kb.clone().sub(ka).normalize().applyQuaternion(th.fix);
        kn.fix.setFromUnitVectors(d, new THREE.Vector3(0, -1, 0));
      }
    }
  }

  has(k: Joint) {
    return !!this.j[k];
  }

  /** Which side of the model a limb is on: +1 = +X. */
  side(k: Joint) {
    return Math.sign(this.j[k]?.restModelPos.x || 1);
  }

  /** Set a joint to its relaxed rest, then rotate it by a model-space Euler (radians). */
  rotate(k: Joint, x: number, y = 0, z = 0) {
    const jt = this.j[k];
    if (!jt) return;
    _q.setFromEuler(_e.set(x, y, z, "XYZ")).multiply(jt.fix);
    // local = rest * (W⁻¹ · R · W)
    _q2.copy(jt.Winv).multiply(_q).multiply(jt.W);
    jt.bone.quaternion.copy(jt.restQ).multiply(_q2);
  }

  /** Move the hips in model space, relative to where they rest. */
  offsetHips(dx: number, dy: number, dz: number) {
    const jt = this.j.hips;
    if (!jt) return;
    _v.set(jt.restModelPos.x + dx, jt.restModelPos.y + dy, jt.restModelPos.z + dz).applyMatrix4(jt.parentInv);
    jt.bone.position.copy(_v);
  }
}
