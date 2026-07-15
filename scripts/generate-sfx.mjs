/**
 * Generates the core UI/combat SFX under public/assets/sounds/.
 *
 *   node scripts/generate-sfx.mjs   (or: npm run gen:sounds)
 *
 * These are synthesized from scratch (no samples, no deps) so the palette is
 * reproducible: re-run to tweak, commit the resulting .wav. The house style is
 * "Souls-like" — deliberately heavy and grim rather than bright/arcadey:
 *
 *   1. Weight   — every impact carries a sub-bass thump (40-120 Hz sine body),
 *                 so hits feel like they have mass, not just treble.
 *   2. Metal    — clangs/breaks use INHARMONIC partials (struck-metal ratios,
 *                 not octaves), the sound of blades and shields.
 *   3. Grit     — soft saturation adds odd harmonics so nothing is sterile.
 *   4. Space    — a Freeverb-style reverb gives long, cavernous tails; UI cues
 *                 stay dry-ish, combat/stinger cues bloom into the room.
 *
 * All clips are 44.1 kHz mono 16-bit PCM to match the existing manifest.
 */
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'public', 'assets', 'sounds');
const SR = 44100;
const TAU = Math.PI * 2;

// --- Signal primitives ---------------------------------------------------------

const buf = (sec) => new Float32Array(Math.max(1, Math.round(sec * SR)));

/** Deterministic PRNG so regenerated files are byte-identical. */
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}
const noise = rng(0x50f1a3);

/** Exponential decay envelope value at time t (sec), decaying by `k` per sec. */
const expEnv = (t, k) => Math.exp(-k * t);

/** Adds a sine partial with an exponential-decay envelope into `b`. */
function tone(b, { freq, amp = 1, decay = 8, start = 0, sweep = 0, phase = 0 }) {
  const i0 = Math.round(start * SR);
  for (let i = 0; i < b.length - i0; i++) {
    const t = i / SR;
    // linear pitch glide over the tail (sweep = end/start ratio, 0 = none)
    const f = sweep ? freq * (1 + (sweep - 1) * Math.min(1, t * 2)) : freq;
    b[i0 + i] += Math.sin(TAU * f * t + phase) * amp * expEnv(t, decay);
  }
}

/** Struck-metal cluster: inharmonic partials sharing one strike envelope. */
function metal(b, { freq, amp = 1, decay = 5, start = 0, ratios }) {
  // Ratios lifted from idealised bell/plate spectra — deliberately inharmonic.
  const r = ratios ?? [1, 1.502, 2.001, 2.514, 3.017, 4.106, 5.412];
  const gains = [1, 0.62, 0.48, 0.4, 0.32, 0.22, 0.15];
  r.forEach((ratio, k) =>
    tone(b, { freq: freq * ratio, amp: amp * gains[k], decay: decay * (1 + k * 0.35), start }),
  );
}

/** Band-limited noise burst (one-pole low-pass on white noise). */
function noiseBurst(b, { amp = 1, decay = 12, start = 0, cutoff = 0.5, hp = 0 }) {
  const i0 = Math.round(start * SR);
  let lp = 0;
  let prev = 0;
  let hpState = 0;
  for (let i = 0; i < b.length - i0; i++) {
    const t = i / SR;
    const white = noise() * 2 - 1;
    lp += (white - lp) * cutoff; // low-pass
    let s = lp;
    if (hp) {
      // one-pole high-pass to thin out the rumble when wanted
      hpState = hp * (hpState + s - prev);
      prev = s;
      s = hpState;
    }
    b[i0 + i] += s * amp * expEnv(t, decay);
  }
}

/** Rising band-limited noise swell: ramps 0→1 over `peak` sec, then decays. */
function swell(b, { amp = 1, peak = 0.4, decay = 20, cutoff = 0.5, start = 0 }) {
  const i0 = Math.round(start * SR);
  const pk = peak * SR;
  let lp = 0;
  for (let i = 0; i < b.length - i0; i++) {
    const white = noise() * 2 - 1;
    lp += (white - lp) * cutoff;
    const env = i < pk ? i / pk : expEnv((i - pk) / SR, decay);
    b[i0 + i] += lp * amp * env;
  }
}

/** Soft saturation — adds odd harmonics / grit and tames peaks. */
function saturate(b, drive = 2) {
  for (let i = 0; i < b.length; i++) b[i] = Math.tanh(b[i] * drive) / Math.tanh(drive);
}

/** Freeverb-style reverb; returns a new, longer buffer with a cavernous tail. */
function reverb(input, { mix = 0.3, room = 0.84, damp = 0.28, tailSec = 1.2 } = {}) {
  const n = input.length + Math.round(tailSec * SR);
  const src = new Float32Array(n);
  src.set(input);

  const combs = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617];
  const allpasses = [556, 441, 341, 225];
  let wet = new Float32Array(n);

  for (const size of combs) {
    const line = new Float32Array(size);
    let idx = 0;
    let store = 0;
    for (let i = 0; i < n; i++) {
      const y = line[idx];
      store = y * (1 - damp) + store * damp;
      line[idx] = src[i] + store * room;
      if (++idx >= size) idx = 0;
      wet[i] += y;
    }
  }
  for (let i = 0; i < n; i++) wet[i] *= 0.12;

  for (const size of allpasses) {
    const line = new Float32Array(size);
    let idx = 0;
    const g = 0.5;
    for (let i = 0; i < n; i++) {
      const bufout = line[idx];
      line[idx] = wet[i] + bufout * g;
      wet[i] = bufout - wet[i];
      if (++idx >= size) idx = 0;
    }
  }

  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const dry = i < input.length ? input[i] : 0;
    out[i] = dry * (1 - mix) + wet[i] * mix;
  }
  return out;
}

// --- Mastering -----------------------------------------------------------------

/** Peak-normalize to `peak`, then apply short fades to kill boundary clicks. */
function master(b, peak = 0.92) {
  let max = 0;
  for (let i = 0; i < b.length; i++) max = Math.max(max, Math.abs(b[i]));
  if (max > 0) {
    const g = peak / max;
    for (let i = 0; i < b.length; i++) b[i] *= g;
  }
  const fi = Math.min(64, (b.length / 2) | 0); // ~1.5 ms fade-in
  const fo = Math.min(2200, (b.length / 2) | 0); // ~50 ms fade-out
  for (let i = 0; i < fi; i++) b[i] *= i / fi;
  for (let i = 0; i < fo; i++) b[b.length - 1 - i] *= i / fo;
  return b;
}

function toWav(b) {
  const bytes = b.length * 2;
  const out = Buffer.alloc(44 + bytes);
  out.write('RIFF', 0);
  out.writeUInt32LE(36 + bytes, 4);
  out.write('WAVE', 8);
  out.write('fmt ', 12);
  out.writeUInt32LE(16, 16);
  out.writeUInt16LE(1, 20); // PCM
  out.writeUInt16LE(1, 22); // mono
  out.writeUInt32LE(SR, 24);
  out.writeUInt32LE(SR * 2, 28); // byte rate
  out.writeUInt16LE(2, 32); // block align
  out.writeUInt16LE(16, 34); // bits
  out.write('data', 36);
  out.writeUInt32LE(bytes, 40);
  for (let i = 0; i < b.length; i++) {
    const s = Math.max(-1, Math.min(1, b[i]));
    out.writeInt16LE((s < 0 ? s * 0x8000 : s * 0x7fff) | 0, 44 + i * 2);
  }
  return out;
}

// --- Voices --------------------------------------------------------------------
// Each returns a finished float buffer (post-reverb where wanted).

const VOICES = {
  // Menu confirm: a low, muted wooden "tok" with a faint metal ring. Grim, quiet.
  'btn-press': () => {
    const b = buf(0.22);
    tone(b, { freq: 180, amp: 0.7, decay: 55 });
    tone(b, { freq: 320, amp: 0.35, decay: 40 });
    noiseBurst(b, { amp: 0.25, decay: 90, cutoff: 0.35, hp: 0.6 });
    saturate(b, 1.6);
    return reverb(b, { mix: 0.12, tailSec: 0.25, room: 0.7 });
  },

  // Hero basic attack: a weighted blade swing — down-swept airy whoosh + low body.
  shoot: () => {
    const b = buf(0.4);
    noiseBurst(b, { amp: 0.9, decay: 16, cutoff: 0.5, hp: 0.5 }); // the "swish"
    tone(b, { freq: 140, amp: 0.6, decay: 22, sweep: 0.5 }); // low body drop
    tone(b, { freq: 900, amp: 0.25, decay: 30, sweep: 0.4 }); // steel edge
    saturate(b, 2.2);
    return reverb(b, { mix: 0.22, tailSec: 0.5, room: 0.78 });
  },

  // Landing a hit: meaty flesh/armor impact — transient crack over a sub thud.
  'enemy-hit': () => {
    const b = buf(0.35);
    noiseBurst(b, { amp: 1, decay: 60, cutoff: 0.7 }); // crack transient
    noiseBurst(b, { amp: 0.5, decay: 22, cutoff: 0.25, start: 0.004 }); // crunch
    tone(b, { freq: 90, amp: 0.9, decay: 26, sweep: 0.7 }); // sub thud
    saturate(b, 3);
    return reverb(b, { mix: 0.2, tailSec: 0.45, room: 0.8 });
  },

  // Enemy death: heavier collapse — a groaning descending tone + body fall.
  'enemy-die': () => {
    const b = buf(0.9);
    tone(b, { freq: 220, amp: 0.7, decay: 6, sweep: 0.35 }); // descending groan
    tone(b, { freq: 70, amp: 0.9, decay: 9, sweep: 0.6 }); // sub body
    noiseBurst(b, { amp: 0.7, decay: 30, cutoff: 0.6 }); // initial hit
    noiseBurst(b, { amp: 0.4, decay: 10, cutoff: 0.18, start: 0.05 }); // fall/rubble
    saturate(b, 2.6);
    return reverb(b, { mix: 0.32, tailSec: 1.0, room: 0.85 });
  },

  // Shield/ward struck: a bright metallic clang that rings and decays fast.
  'barrier-hit': () => {
    const b = buf(0.6);
    metal(b, { freq: 440, amp: 0.9, decay: 9 });
    noiseBurst(b, { amp: 0.5, decay: 80, cutoff: 0.8, hp: 0.7 }); // strike attack
    tone(b, { freq: 110, amp: 0.5, decay: 30 }); // weight behind the clang
    saturate(b, 2);
    return reverb(b, { mix: 0.28, tailSec: 0.8, room: 0.82 });
  },

  // Ward shatters: a violent crack into cascading inharmonic debris + long tail.
  'barrier-break': () => {
    const b = buf(1.4);
    noiseBurst(b, { amp: 1, decay: 55, cutoff: 0.85, hp: 0.6 }); // the crack
    metal(b, { freq: 520, amp: 0.8, decay: 4 });
    metal(b, { freq: 300, amp: 0.6, decay: 3, start: 0.02, ratios: [1, 1.64, 2.31, 3.11, 4.02] });
    tone(b, { freq: 60, amp: 1, decay: 12, sweep: 0.7 }); // deep collapse
    // scattered shard pings
    for (let k = 0; k < 6; k++) {
      metal(b, { freq: 700 + noise() * 900, amp: 0.18, decay: 12, start: 0.04 + noise() * 0.3 });
    }
    saturate(b, 2.4);
    return reverb(b, { mix: 0.4, tailSec: 1.6, room: 0.88 });
  },

  // Signature-skill activation: a charged surge that blooms into a heroic
  // metallic chord over a deep impact — the default when a hero has no bespoke
  // skill foley. Times the peak to land under the cut-in punch.
  skill: () => {
    const b = buf(1.8);
    const hit = 0.5; // when the charge resolves into the strike
    swell(b, { amp: 0.8, peak: hit, decay: 24, cutoff: 0.45 }); // rising tension
    tone(b, { freq: 330, amp: 0.4, decay: 3, sweep: 1.8, start: 0.02 }); // pitch riser
    // Bloom: a bright, mostly-consonant bell cluster (power-chord flavored).
    metal(b, { freq: 262, amp: 0.9, decay: 4, start: hit, ratios: [1, 1.5, 2, 3, 4] }); // C4 + 5th/8ve
    noiseBurst(b, { amp: 0.7, decay: 45, cutoff: 0.8, hp: 0.6, start: hit }); // strike attack
    tone(b, { freq: 80, amp: 1, decay: 14, sweep: 0.8, start: hit }); // sub impact
    saturate(b, 2.2);
    return reverb(b, { mix: 0.38, tailSec: 1.5, room: 0.88, damp: 0.24 });
  },

  // Victory: a warm, somber bell/gong swell — bonfire-lit, earned rather than perky.
  victory: () => {
    const b = buf(2.6);
    // Low struck bell, minor-third stack for a grave, hopeful color.
    metal(b, { freq: 196, amp: 0.9, decay: 1.6 }); // G3
    metal(b, { freq: 233, amp: 0.6, decay: 1.5, start: 0.02 }); // A#3 (min 3rd)
    metal(b, { freq: 294, amp: 0.5, decay: 1.4, start: 0.04 }); // D4 (5th)
    tone(b, { freq: 98, amp: 0.6, decay: 3 }); // sub foundation
    saturate(b, 1.5);
    return reverb(b, { mix: 0.45, tailSec: 2.4, room: 0.9, damp: 0.22 });
  },

  // Defeat: the "YOU DIED" gut-punch — a deep, filtered boom sinking into a void.
  defeat: () => {
    const b = buf(3.0);
    tone(b, { freq: 130, amp: 0.9, decay: 1.4, sweep: 0.45 }); // sinking tolling tone
    tone(b, { freq: 65, amp: 1, decay: 1.1, sweep: 0.55 }); // deep sub drop
    metal(b, { freq: 87, amp: 0.5, decay: 1.0, ratios: [1, 1.41, 2.11, 2.9] }); // dark clang
    noiseBurst(b, { amp: 0.6, decay: 8, cutoff: 0.2 }); // dull impact
    saturate(b, 2);
    return reverb(b, { mix: 0.5, tailSec: 2.8, room: 0.92, damp: 0.2 });
  },
};

// --- Render --------------------------------------------------------------------

for (const [name, render] of Object.entries(VOICES)) {
  const wav = toWav(master(render()));
  writeFileSync(join(OUT, `${name}.wav`), wav);
  console.log(`  ${name}.wav  (${(wav.length / 1024).toFixed(1)} KB)`);
}
console.log('Done — regenerated Souls-like SFX in public/assets/sounds/');
