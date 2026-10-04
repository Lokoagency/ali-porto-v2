import * as THREE from "three";

// Every surface in the house is painted here on a canvas — no image downloads, and
// every pattern stays in the palette. Patterns are drawn once and cloned per size.

function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")!] as const;
}

const bases = new Map<string, THREE.CanvasTexture>();
function base(key: string, draw: () => HTMLCanvasElement, color = true) {
  if (!bases.has(key)) {
    const t = new THREE.CanvasTexture(draw());
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 8;
    if (color) t.colorSpace = THREE.SRGBColorSpace;
    bases.set(key, t);
  }
  return bases.get(key)!;
}
const sized = new Map<string, THREE.Texture>();
/** Same image, different repeat — cheap clones that share the canvas. */
function repeat(key: string, t: THREE.Texture, r: [number, number]) {
  const k = `${key}@${r.join("x")}`;
  if (!sized.has(k)) {
    const c = t.clone();
    c.repeat.set(...r);
    c.needsUpdate = true;
    sized.set(k, c);
  }
  return sized.get(k)!;
}

/* ------------------------------- floors ------------------------------- */

/** Staggered oak floorboards, seamless; one tile = 2 m. */
export const parquet = (r: [number, number]) =>
  repeat(
    "parquet",
    base("parquet", () => {
      const S = 512;
      const [c, g] = canvas(S, S);
      const rand = rng(21);
      const rowH = 32; // 8 rows per metre-ish
      for (let y = 0; y < S; y += rowH) {
        let x = -rand() * 200;
        while (x < S) {
          const len = 140 + rand() * 180;
          const tone = 0.8 + rand() * 0.34;
          const col = `rgb(${(150 * tone) | 0},${(104 * tone) | 0},${(64 * tone) | 0})`;
          // draw with wrap-around so the texture tiles
          for (const off of [0, S, -S]) {
            g.fillStyle = col;
            g.fillRect(x + off, y, len, rowH);
            for (let i = 0; i < 4; i++) {
              g.strokeStyle = `rgba(70,40,20,${0.06 + rand() * 0.12})`;
              g.lineWidth = 1;
              g.beginPath();
              const yy = y + rand() * rowH;
              g.moveTo(x + off, yy);
              g.lineTo(x + off + len, yy + rand() * 3 - 1.5);
              g.stroke();
            }
            g.fillStyle = "rgba(35,20,8,0.6)";
            g.fillRect(x + off + len - 1.5, y, 1.5, rowH);
          }
          x += len;
        }
        g.fillStyle = "rgba(35,20,8,0.55)";
        g.fillRect(0, y, S, 1.5);
      }
      return c;
    }),
    r,
  );

/** Small retro checker tiles for the kitchen. */
export const tiles = (r: [number, number]) =>
  repeat(
    "tiles",
    base("tiles", () => {
      const S = 256;
      const [c, g] = canvas(S, S);
      const n = 4;
      const t = S / n;
      for (let y = 0; y < n; y++)
        for (let x = 0; x < n; x++) {
          g.fillStyle = (x + y) % 2 ? "#a3463a" : "#ece2cc";
          g.fillRect(x * t, y * t, t, t);
          g.strokeStyle = "rgba(60,40,30,0.35)";
          g.lineWidth = 2;
          g.strokeRect(x * t + 1, y * t + 1, t - 2, t - 2);
        }
      return c;
    }),
    r,
  );

/* -------------------------------- walls -------------------------------- */

export type WallStyle = "study" | "hall" | "living" | "kitchen" | "bedroom" | "plain";

/**
 * A wall strip 1.2 m wide × 3 m tall: decoration above, wainscot / tiles below.
 * Repeats only horizontally (len / 1.2) so the dado line stays at 1 m everywhere.
 */
export const wall = (style: WallStyle, len: number) =>
  repeat(
    `wall-${style}`,
    base(`wall-${style}`, () => {
      const W = 384;
      const H = 960;
      const [c, g] = canvas(W, H);
      const dado = H * (2 / 3);
      const rand = rng(style.length * 13);

      const top: Record<WallStyle, string> = {
        study: "#2f4f47",
        hall: "#e6dbc4",
        living: "#c4964a",
        kitchen: "#cfe0d2",
        bedroom: "#3f6b67",
        plain: "#e6dbc4",
      };
      g.fillStyle = top[style];
      g.fillRect(0, 0, W, dado);

      if (style === "study") {
        for (let y = 0; y < 4; y++)
          for (let x = 0; x < 3; x++) {
            const cx = x * 128 + (y % 2) * 64 + 32;
            const cy = y * 160 + 80;
            g.fillStyle = "rgba(201,166,97,0.38)";
            g.beginPath();
            g.moveTo(cx, cy - 34);
            g.bezierCurveTo(cx + 22, cy - 16, cx + 18, cy + 8, cx, cy + 20);
            g.bezierCurveTo(cx - 18, cy + 8, cx - 22, cy - 16, cx, cy - 34);
            g.fill();
          }
      } else if (style === "hall" || style === "living") {
        const s = style === "hall" ? "rgba(47,95,92,0.16)" : "rgba(255,240,200,0.18)";
        for (let x = 0; x < W; x += 48) {
          g.fillStyle = s;
          g.fillRect(x, 0, 18, dado);
        }
      } else if (style === "bedroom") {
        for (let i = 0; i < 40; i++) {
          const x = rand() * W;
          const y = rand() * (dado - 30);
          g.fillStyle = "rgba(233,215,168,0.55)";
          for (let p = 0; p < 5; p++) {
            const a = (p / 5) * Math.PI * 2;
            g.beginPath();
            g.arc(x + Math.cos(a) * 5, y + Math.sin(a) * 5, 3.2, 0, Math.PI * 2);
            g.fill();
          }
          g.fillStyle = "rgba(229,181,74,0.8)";
          g.beginPath();
          g.arc(x, y, 2.5, 0, Math.PI * 2);
          g.fill();
        }
      }
      for (let i = 0; i < 2500; i++) {
        g.fillStyle = `rgba(0,0,0,${rand() * 0.035})`;
        g.fillRect(rand() * W, rand() * dado, 2, 2);
      }

      if (style === "kitchen") {
        g.fillStyle = "#f2ede2";
        g.fillRect(0, dado, W, H - dado);
        g.strokeStyle = "rgba(120,110,95,0.45)";
        g.lineWidth = 2;
        const th = 40;
        for (let y = dado; y < H; y += th) {
          g.beginPath();
          g.moveTo(0, y);
          g.lineTo(W, y);
          g.stroke();
          const off = Math.round((y - dado) / th) % 2 ? 48 : 0;
          for (let x = off; x < W; x += 96) {
            g.beginPath();
            g.moveTo(x, y);
            g.lineTo(x, y + th);
            g.stroke();
          }
        }
      } else {
        const light = style === "bedroom" || style === "plain";
        g.fillStyle = light ? "#efe7d6" : style === "living" ? "#7d5233" : "#5a3a26";
        g.fillRect(0, dado, W, H - dado);
        if (!light)
          for (let i = 0; i < 90; i++) {
            g.strokeStyle = `rgba(30,15,5,${0.06 + rand() * 0.12})`;
            g.lineWidth = 1;
            g.beginPath();
            const y = dado + rand() * (H - dado);
            g.moveTo(0, y);
            g.lineTo(W, y + rand() * 4 - 2);
            g.stroke();
          }
        g.strokeStyle = "rgba(0,0,0,0.3)";
        g.lineWidth = 5;
        g.strokeRect(36, dado + 50, W - 72, H - dado - 110);
        g.strokeStyle = "rgba(255,230,190,0.18)";
        g.lineWidth = 2;
        g.strokeRect(42, dado + 56, W - 84, H - dado - 122);
      }
      g.fillStyle = style === "kitchen" ? "#2f5f5c" : "#3b2416";
      g.fillRect(0, dado - 8, W, 14);
      g.fillRect(0, H - 34, W, 34);
      g.fillStyle = "rgba(255,230,190,0.18)";
      g.fillRect(0, dado - 8, W, 3);
      return c;
    }),
    [len / 1.2, 1],
  );

/* ------------------------------ wood etc. ------------------------------ */

export const wood = (tone: "walnut" | "oak" | "mahogany" | "teak", r: [number, number] = [1, 1]) =>
  repeat(
    `wood-${tone}`,
    base(`wood-${tone}`, () => {
      const S = 512;
      const [c, g] = canvas(S, S);
      const baseC = { walnut: "#5a3a26", oak: "#a4774b", mahogany: "#6b2f22", teak: "#8a5a32" }[tone];
      const line = { walnut: "40,22,12", oak: "90,58,30", mahogany: "45,15,10", teak: "70,40,18" }[tone];
      const rand = rng(tone.length * 7);
      g.fillStyle = baseC;
      g.fillRect(0, 0, S, S);
      for (let i = 0; i < 140; i++) {
        const y = rand() * S;
        const amp = 2 + rand() * 6;
        const freq = 0.005 + rand() * 0.02;
        g.strokeStyle = `rgba(${line},${0.08 + rand() * 0.22})`;
        g.lineWidth = 0.5 + rand() * 2.2;
        g.beginPath();
        for (let x = 0; x <= S; x += 8) g.lineTo(x, y + Math.sin(x * freq + i) * amp);
        g.stroke();
      }
      for (let i = 0; i < 30; i++) {
        g.fillStyle = `rgba(255,220,180,${rand() * 0.04})`;
        g.fillRect(0, rand() * S, S, 2 + rand() * 8);
      }
      return c;
    }),
    r,
  );

/** Persian-style rug. */
export const rug = (palette: "rust" | "teal" = "rust") =>
  base(`rug-${palette}`, () => {
    const W = 1024;
    const H = 680;
    const [c, g] = canvas(W, H);
    const r = rng(palette === "rust" ? 5 : 9);
    const field = palette === "rust" ? "#7d2f26" : "#244a46";
    const alt = palette === "rust" ? "#2f5f5c" : "#7d2f26";
    g.fillStyle = field;
    g.fillRect(0, 0, W, H);
    const band = (inset: number, w: number, col: string) => {
      g.strokeStyle = col;
      g.lineWidth = w;
      g.strokeRect(inset, inset, W - inset * 2, H - inset * 2);
    };
    band(14, 22, "#1d2f2c");
    band(40, 10, "#c9a661");
    band(60, 18, alt);
    band(82, 4, "#c9a661");
    g.save();
    g.translate(W / 2, H / 2);
    (
      [
        [190, "#1d2f2c"],
        [160, "#c9a661"],
        [130, field],
        [96, alt],
        [60, "#e9d7a8"],
        [28, field],
      ] as [number, string][]
    ).forEach(([s, col]) => {
      g.fillStyle = col;
      g.beginPath();
      g.moveTo(0, -s * 0.8);
      g.lineTo(s * 1.3, 0);
      g.lineTo(0, s * 0.8);
      g.lineTo(-s * 1.3, 0);
      g.closePath();
      g.fill();
    });
    g.restore();
    for (let i = 0; i < 9000; i++) {
      g.fillStyle = `rgba(${r() > 0.5 ? "255,240,220" : "0,0,0"},${r() * 0.06})`;
      g.fillRect(r() * W, r() * H, 2, 2);
    }
    return c;
  });

/** White book-spine with gilt bands; tinted per book via instance colour. */
export const spine = () =>
  base("spine", () => {
    const [c, g] = canvas(64, 256);
    g.fillStyle = "#ffffff";
    g.fillRect(0, 0, 64, 256);
    g.fillStyle = "#e8cf8f";
    for (const y of [22, 30, 220, 228]) g.fillRect(0, y, 64, 4);
    g.fillStyle = "rgba(0,0,0,0.25)";
    g.fillRect(14, 90, 36, 70);
    g.fillStyle = "rgba(0,0,0,0.12)";
    g.fillRect(0, 0, 6, 256);
    g.fillRect(58, 0, 6, 256);
    return c;
  });

/* ------------------------------ signage ------------------------------ */

/** Engraved brass plate with serif lettering. */
export const plaque = (title: string, sub = "") =>
  base(`plaque-${title}-${sub}`, () => {
    const W = 512;
    const H = 200;
    const [c, g] = canvas(W, H);
    const grad = g.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "#e9cb85");
    grad.addColorStop(0.5, "#b8934a");
    grad.addColorStop(1, "#dcb96d");
    g.fillStyle = grad;
    g.fillRect(0, 0, W, H);
    g.strokeStyle = "rgba(60,40,10,0.6)";
    g.lineWidth = 4;
    g.strokeRect(12, 12, W - 24, H - 24);
    g.fillStyle = "#3a2a10";
    g.textAlign = "center";
    g.textBaseline = "middle";
    let size = 50;
    g.font = `italic 600 ${size}px Georgia, serif`;
    while (g.measureText(title).width > W - 60 && size > 24) g.font = `italic 600 ${--size}px Georgia, serif`;
    g.fillText(title, W / 2, sub ? H / 2 - 18 : H / 2);
    if (sub) {
      g.font = "600 22px Georgia, serif";
      g.fillText(sub.toUpperCase(), W / 2, H / 2 + 38);
    }
    return c;
  });

/** Paper / card with lines of text (notes, diploma, corkboard cards). */
export const paper = (
  lines: string[],
  opts: { bg?: string; ink?: string; title?: string; w?: number; h?: number; size?: number } = {},
) =>
  base(`paper-${lines.join("|")}-${opts.title}-${opts.bg}`, () => {
    const W = opts.w ?? 512;
    const H = opts.h ?? 512;
    const [c, g] = canvas(W, H);
    g.fillStyle = opts.bg ?? "#f5eedf";
    g.fillRect(0, 0, W, H);
    g.fillStyle = opts.ink ?? "#2a2116";
    g.textAlign = "center";
    let y = H * 0.16;
    if (opts.title) {
      g.font = `italic 600 ${(opts.size ?? 30) * 1.45}px Georgia, serif`;
      g.fillText(opts.title, W / 2, y);
      y += (opts.size ?? 30) * 2.2;
    }
    g.font = `italic ${opts.size ?? 30}px Georgia, serif`;
    for (const l of lines) {
      g.fillText(l, W / 2, y);
      y += (opts.size ?? 30) * 1.45;
    }
    return c;
  });

/** Night sky for the windows: deep blue gradient, a moon, stars, rooftops. */
export const nightSky = () =>
  base("sky", () => {
    const W = 256;
    const H = 320;
    const [c, g] = canvas(W, H);
    const grad = g.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#0d1a2b");
    grad.addColorStop(1, "#2c4a5c");
    g.fillStyle = grad;
    g.fillRect(0, 0, W, H);
    const r = rng(4);
    for (let i = 0; i < 60; i++) {
      g.fillStyle = `rgba(255,250,230,${0.3 + r() * 0.7})`;
      g.fillRect(r() * W, r() * H * 0.7, 1.5, 1.5);
    }
    const moon = g.createRadialGradient(180, 70, 4, 180, 70, 60);
    moon.addColorStop(0, "rgba(255,245,215,1)");
    moon.addColorStop(0.3, "rgba(255,240,200,0.9)");
    moon.addColorStop(0.31, "rgba(255,240,200,0.25)");
    moon.addColorStop(1, "rgba(255,240,200,0)");
    g.fillStyle = moon;
    g.fillRect(100, 0, 156, 150);
    g.fillStyle = "#0a131c";
    let x = 0;
    while (x < W) {
      const w = 30 + r() * 50;
      const h = 30 + r() * 60;
      g.fillRect(x, H - h, w, h);
      if (r() > 0.5) {
        g.fillStyle = "rgba(255,210,130,0.8)";
        g.fillRect(x + 8, H - h + 10, 5, 7);
        g.fillStyle = "#0a131c";
      }
      x += w;
    }
    return c;
  });

/** The CRT shows the site's thesis. */
export const tvScreen = () =>
  base("tv", () => {
    const W = 512;
    const H = 384;
    const [c, g] = canvas(W, H);
    const grad = g.createRadialGradient(W / 2, H / 2, 40, W / 2, H / 2, 320);
    grad.addColorStop(0, "#1b5a54");
    grad.addColorStop(1, "#071c1a");
    g.fillStyle = grad;
    g.fillRect(0, 0, W, H);
    g.fillStyle = "#bff3e8";
    g.textAlign = "center";
    g.font = "italic 600 56px Georgia, serif";
    g.fillText("Messy in.", W / 2, 165);
    g.fillStyle = "#f0c45e";
    g.fillText("Clear out.", W / 2, 235);
    for (let y = 0; y < H; y += 4) {
      g.fillStyle = "rgba(0,0,0,0.18)";
      g.fillRect(0, y, W, 2);
    }
    return c;
  });

/** Clock face (hands are separate meshes so they can tell the real time). */
export const clockFace = () =>
  base("clock", () => {
    const S = 512;
    const [c, g] = canvas(S, S);
    g.fillStyle = "#f3ead6";
    g.fillRect(0, 0, S, S);
    g.translate(S / 2, S / 2);
    g.strokeStyle = "#2a2116";
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * Math.PI * 2;
      const long = i % 5 === 0;
      g.lineWidth = long ? 8 : 3;
      g.beginPath();
      g.moveTo(Math.sin(a) * (long ? 200 : 214), -Math.cos(a) * (long ? 200 : 214));
      g.lineTo(Math.sin(a) * 228, -Math.cos(a) * 228);
      g.stroke();
    }
    g.fillStyle = "#2a2116";
    g.font = "600 44px Georgia, serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    ["XII", "III", "VI", "IX"].forEach((n, i) => {
      const a = (i / 4) * Math.PI * 2;
      g.fillText(n, Math.sin(a) * 160, -Math.cos(a) * 160);
    });
    return c;
  });

/** One of Ali's real screenshots, loaded through Next's same-origin image optimizer. */
const shots = new Map<string, THREE.Texture>();
export function screenshot(src: string) {
  if (!shots.has(src)) {
    const t = new THREE.TextureLoader().load(`/_next/image?url=${encodeURIComponent(src)}&w=1080&q=75`);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    shots.set(src, t);
  }
  return shots.get(src)!;
}
