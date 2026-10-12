// Ambiances sonores du « poème vivant », fabriquées par le navigateur (Web Audio) : aucun
// fichier son à télécharger, et rien qui tourne tant que le lecteur n'a pas choisi une ambiance.

export type Ambience = "aucune" | "pluie" | "vagues" | "feu" | "nappe";

export const AMBIENCES: { id: Ambience; label: string }[] = [
  { id: "aucune", label: "Silence" },
  { id: "pluie", label: "Pluie" },
  { id: "vagues", label: "Vagues" },
  { id: "feu", label: "Feu de cheminée" },
  { id: "nappe", label: "Nappe musicale" },
];

/** Bruit blanc ou brun en boucle (2 s), base des pluies, vagues et feux. */
function noiseBuffer(ctx: AudioContext, brown: boolean): AudioBuffer {
  const length = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;
    if (brown) {
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    } else {
      data[i] = white;
    }
  }
  return buffer;
}

function loop(ctx: AudioContext, buffer: AudioBuffer): AudioBufferSourceNode {
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  src.loop = true;
  src.start();
  return src;
}

/** Joue une ambiance ; renvoie de quoi régler le volume et l'arrêter. */
export function startAmbience(kind: Ambience, volume: number): { setVolume: (v: number) => void; stop: () => void } | null {
  if (kind === "aucune" || typeof window === "undefined") return null;
  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  const ctx = new Ctx();
  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);
  // Montée douce : pas de son qui surgit.
  master.gain.linearRampToValueAtTime(volume, ctx.currentTime + 2);
  const timers: ReturnType<typeof setInterval>[] = [];

  if (kind === "pluie") {
    const src = loop(ctx, noiseBuffer(ctx, false));
    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = 2600;
    band.Q.value = 0.6;
    const g = ctx.createGain();
    g.gain.value = 0.25;
    src.connect(band).connect(g).connect(master);
    // Gouttes plus grosses, au hasard.
    const drop = noiseBuffer(ctx, false);
    timers.push(
      setInterval(() => {
        if (Math.random() > 0.55) return;
        const d = ctx.createBufferSource();
        d.buffer = drop;
        const hp = ctx.createBiquadFilter();
        hp.type = "highpass";
        hp.frequency.value = 3000 + Math.random() * 3000;
        const env = ctx.createGain();
        const t = ctx.currentTime;
        env.gain.setValueAtTime(0.18 * Math.random(), t);
        env.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
        d.connect(hp).connect(env).connect(master);
        d.start(t, Math.random(), 0.06);
      }, 70),
    );
  } else if (kind === "vagues") {
    const src = loop(ctx, noiseBuffer(ctx, true));
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 900;
    const swell = ctx.createGain();
    swell.gain.value = 0.35;
    // Houle lente : une vague toutes les 8 secondes environ.
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.12;
    const depth = ctx.createGain();
    depth.gain.value = 0.3;
    lfo.connect(depth).connect(swell.gain);
    lfo.start();
    src.connect(lp).connect(swell).connect(master);
  } else if (kind === "feu") {
    const src = loop(ctx, noiseBuffer(ctx, true));
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 500;
    const g = ctx.createGain();
    g.gain.value = 0.5;
    src.connect(lp).connect(g).connect(master);
    const crackle = noiseBuffer(ctx, false);
    timers.push(
      setInterval(() => {
        if (Math.random() > 0.3) return;
        const c = ctx.createBufferSource();
        c.buffer = crackle;
        const hp = ctx.createBiquadFilter();
        hp.type = "highpass";
        hp.frequency.value = 1500;
        const env = ctx.createGain();
        const t = ctx.currentTime;
        env.gain.setValueAtTime(0.25 + Math.random() * 0.3, t);
        env.gain.exponentialRampToValueAtTime(0.0001, t + 0.02 + Math.random() * 0.04);
        c.connect(hp).connect(env).connect(master);
        c.start(t, Math.random(), 0.08);
      }, 90),
    );
  } else if (kind === "nappe") {
    // Accord de la mineur, très doux, qui respire.
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 1200;
    lp.connect(master);
    for (const [freq, detune] of [
      [110, -4],
      [164.81, 3],
      [220, 0],
      [261.63, 5],
      [329.63, -3],
    ]) {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      osc.detune.value = detune;
      const g = ctx.createGain();
      g.gain.value = 0.06;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.05 + Math.random() * 0.08;
      const depth = ctx.createGain();
      depth.gain.value = 0.04;
      lfo.connect(depth).connect(g.gain);
      osc.connect(g).connect(lp);
      osc.start();
      lfo.start();
    }
  }

  return {
    setVolume: (v) => master.gain.linearRampToValueAtTime(v, ctx.currentTime + 0.3),
    stop: () => {
      timers.forEach(clearInterval);
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
      setTimeout(() => void ctx.close(), 900);
    },
  };
}
