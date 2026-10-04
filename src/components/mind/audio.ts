// The house's soundscape, synthesized with WebAudio — no audio files.
// Footsteps by surface, rain on the windows, a crackling fire and a ticking clock that
// get louder as you approach, and the record player when it's on.

type Surface = "wood" | "tile" | "rug";

class HouseAudio {
  ctx: AudioContext | null = null;
  master!: GainNode;
  private noise!: AudioBuffer;
  private rainGain!: GainNode;
  private fireGain!: GainNode;
  private clockGain!: GainNode;
  private musicGain!: GainNode;
  private timers: ReturnType<typeof setInterval>[] = [];
  private music: ReturnType<typeof setInterval> | null = null;
  private chord = 0;
  muted = true;

  start() {
    if (this.ctx) return;
    try {
      const ctx = new AudioContext();
      this.ctx = ctx;
      this.master = ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.6;
      const comp = ctx.createDynamicsCompressor();
      this.master.connect(comp).connect(ctx.destination);

      // one second of white noise, reused everywhere
      this.noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const d = this.noise.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;

      // rain: band-limited noise, always on, quiet
      this.rainGain = this.bus(0.012);
      const rain = this.loop();
      const hp = ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = 250;
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 900;
      rain.connect(hp).connect(lp).connect(this.rainGain);

      // fire: low rumble + random crackles
      this.fireGain = this.bus(0);
      const rumble = this.loop();
      const rlp = ctx.createBiquadFilter();
      rlp.type = "lowpass";
      rlp.frequency.value = 180;
      const rg = ctx.createGain();
      rg.gain.value = 0.35;
      rumble.connect(rlp).connect(rg).connect(this.fireGain);
      this.timers.push(
        setInterval(() => {
          if (Math.random() < 0.12) this.burst(this.fireGain, 600 + Math.random() * 700, 0.03 + Math.random() * 0.03, 0.08 + Math.random() * 0.12, 0.8);
        }, 160),
      );

      // clock tick-tock
      this.clockGain = this.bus(0);
      let tock = false;
      this.timers.push(
        setInterval(() => {
          this.burst(this.clockGain, tock ? 900 : 1100, 0.025, 0.12, 2);
          tock = !tock;
        }, 1000),
      );

      this.musicGain = this.bus(0);
    } catch {
      this.ctx = null;
    }
  }

  private bus(gain: number) {
    const g = this.ctx!.createGain();
    g.gain.value = gain;
    g.connect(this.master);
    return g;
  }

  private loop() {
    const s = this.ctx!.createBufferSource();
    s.buffer = this.noise;
    s.loop = true;
    s.start();
    return s;
  }

  /** A short filtered noise burst: footsteps, crackles, ticks. */
  private burst(out: AudioNode, freq: number, dur: number, amp: number, q = 1.2) {
    const ctx = this.ctx!;
    const s = ctx.createBufferSource();
    s.buffer = this.noise;
    const f = ctx.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = freq;
    f.Q.value = q;
    const g = ctx.createGain();
    const t = ctx.currentTime;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(amp, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f).connect(g).connect(out);
    s.start(t, Math.random());
    s.stop(t + dur + 0.02);
  }

  step(surface: Surface, run: boolean) {
    if (!this.ctx || this.muted) return;
    const freq = { wood: 220, tile: 420, rug: 140 }[surface] * (0.9 + Math.random() * 0.2);
    const amp = { wood: 0.09, tile: 0.07, rug: 0.04 }[surface] * (run ? 1.25 : 1);
    this.burst(this.master, freq, 0.07, amp, 0.7);
  }

  /** Distance-based levels for the fire, clock and record. */
  update(x: number, z: number, fire: [number, number], clock: [number, number], record: [number, number]) {
    if (!this.ctx) return;
    const near = (p: [number, number], range: number) => Math.max(0, 1 - Math.hypot(x - p[0], z - p[1]) / range) ** 2;
    const t = this.ctx.currentTime;
    this.fireGain.gain.setTargetAtTime(0.18 * near(fire, 6), t, 0.3);
    this.clockGain.gain.setTargetAtTime(0.5 * near(clock, 4), t, 0.3);
    this.musicGain.gain.setTargetAtTime(0.1 * Math.max(0.2, near(record, 9)), t, 0.3);
  }

  setRecord(playing: boolean) {
    if (!this.ctx) return;
    if (this.music) clearInterval(this.music);
    this.music = null;
    if (!playing) return;
    const chords = [
      [220, 277.18, 329.63, 415.3],
      [185, 233.08, 277.18, 369.99],
      [246.94, 311.13, 369.99, 440],
      [207.65, 261.63, 311.13, 392],
    ];
    const play = () => {
      const ctx = this.ctx!;
      const now = ctx.currentTime;
      chords[this.chord++ % chords.length].forEach((f, n) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        const lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 1500;
        o.type = n === 0 ? "triangle" : "sine";
        o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, now + n * 0.04);
        g.gain.exponentialRampToValueAtTime(0.5, now + n * 0.04 + 0.03);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 2.3);
        o.connect(lp).connect(g).connect(this.musicGain);
        o.start(now + n * 0.04);
        o.stop(now + 2.4);
      });
    };
    play();
    this.music = setInterval(play, 2200);
  }

  ding() {
    if (!this.ctx || this.muted) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    [1046.5, 1568, 2093].forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime([0.05, 0.02, 0.01][i], now + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
      o.connect(g).connect(this.master);
      o.start(now);
      o.stop(now + 1);
    });
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (this.ctx) this.master.gain.setTargetAtTime(m ? 0 : 0.6, this.ctx.currentTime, 0.15);
  }

  stop() {
    this.timers.forEach(clearInterval);
    this.timers = [];
    if (this.music) clearInterval(this.music);
    this.music = null;
    this.ctx?.close();
    this.ctx = null;
  }
}

export const houseAudio = new HouseAudio();
export type { Surface };
