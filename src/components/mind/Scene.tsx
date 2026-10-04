"use client";

import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { BakeShadows, Environment, Lightformer, PerformanceMonitor, Preload } from "@react-three/drei";
import { Bloom, EffectComposer, N8AO, Noise, Outline, Selection, ToneMapping, Vignette } from "@react-three/postprocessing";
import { BlendFunction, ToneMappingMode } from "postprocessing";
import * as THREE from "three";
import { HomeShell } from "./Home";
import { Player, type Mode } from "./Player";
import { Rooms, type RoomSignals } from "./Rooms";
import type { RoomId } from "./world";

const noOccluder = () => {};

export default function Scene({
  enabled,
  mode,
  signals,
  onRoom,
  onStand,
  onReady,
}: {
  enabled: boolean;
  mode: Mode;
  signals: RoomSignals;
  onRoom: (id: RoomId) => void;
  onStand: () => void;
  onReady: () => void;
}) {
  // resolution adapts to the device so the frame rate stays steady; a slow device also drops AO and MSAA
  const [dpr, setDpr] = useState(1.25);
  const [low, setLow] = useState(false);

  return (
    <Canvas
      shadows="percentage"
      dpr={dpr}
      camera={{ fov: 64, position: [0.55, 1.66, 6.3], near: 0.05, far: 60 }}
      gl={{ antialias: false, powerPreference: "high-performance", stencil: false }}
      onCreated={({ gl, scene, camera }) => {
        gl.toneMapping = THREE.NoToneMapping; // tone mapping happens in the post stack
        if (process.env.NODE_ENV !== "production") Object.assign(window, { __gl: gl, __scene: scene, __cam: camera });
        onReady();
      }}
    >
      <PerformanceMonitor
        onIncline={() => setDpr(1.5)}
        onDecline={() => setDpr(1)}
        flipflops={3}
        onFallback={() => {
          setDpr(1);
          setLow(true);
        }}
      />
      <color attach="background" args={["#0b0907"]} />

      {/* the night outside is dark; most light comes from lamps, the fire and pendants */}
      <hemisphereLight args={["#ffe2bd", "#2a1d14", 0.22]} />
      <Environment resolution={128} frames={1} environmentIntensity={0.44}>
        <Lightformer form="rect" intensity={1.6} color="#ffd9a0" position={[0, 4, -6]} scale={[10, 2, 1]} />
        <Lightformer form="rect" intensity={1.0} color="#fff1dc" position={[-7, 2, 0]} rotation={[0, Math.PI / 2, 0]} scale={[8, 2, 1]} />
        <Lightformer form="rect" intensity={1.0} color="#ffe6c0" position={[7, 2, 0]} rotation={[0, -Math.PI / 2, 0]} scale={[8, 2, 1]} />
        <Lightformer form="circle" intensity={2.2} color="#ffcf8a" position={[0, 5, 0]} scale={2} />
        <Lightformer form="rect" intensity={0.6} color="#8fa8c8" position={[0, 2, 8]} rotation={[0, Math.PI, 0]} scale={[6, 2, 1]} />
      </Environment>

      <Selection>
        <HomeShell onOccluder={noOccluder} />
        <Rooms s={signals} />
        <Player enabled={enabled} mode={mode} onRoom={onRoom} onStand={onStand} />

        <EffectComposer multisampling={low ? 0 : 2}>
          {!low ? <N8AO aoRadius={0.55} intensity={2.0} distanceFalloff={0.5} halfRes quality="performance" color="#140d08" /> : <></>}
          <Outline visibleEdgeColor={0xffe0a6} hiddenEdgeColor={0xffe0a6} edgeStrength={2.6} blur xRay={false} />
          <Bloom intensity={0.55} luminanceThreshold={0.9} luminanceSmoothing={0.25} mipmapBlur />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
          <Vignette offset={0.32} darkness={0.5} />
          <Noise opacity={0.028} blendFunction={BlendFunction.SOFT_LIGHT} />
        </EffectComposer>
      </Selection>

      {/* static scene → render shadows once; compile every shader up front (no hitches entering rooms) */}
      <BakeShadows />
      <Preload all />
    </Canvas>
  );
}
