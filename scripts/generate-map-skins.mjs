/**
 * Generates the portrait parallax background art: the 4 default `bg-*` layers
 * plus every campaign map skin under public/assets/backgrounds/skins/.
 *
 *   node scripts/generate-map-skins.mjs   (or: npm run gen:maps)
 *
 * Canvas is 540x960 (9:16) — ParallaxBackground stretches ONE copy of each
 * layer to exactly cover the 1080x1920 viewport, so nothing ever repeats
 * within a single screen. Layers other than the sky wrap vertically as the
 * camera scrolls, so this generator enforces two seamlessness rules:
 *   1. Continuous elements (road, curbs, slab, edge lines) span the full
 *      0..960 height and are vertically uniform, or use a period that divides
 *      960 evenly (road dashes).
 *   2. Discrete props are always placed fully inside y ∈ [30, 930] so no
 *      shape is cut by the tile's top/bottom edge.
 *
 * Composition (matches the "center pathway, decor on the sides" principle in
 * mapSkins.ts):
 *   sky        opaque act-mood backdrop; scroll factor 0, never wraps.
 *   skyline    far scenery hugging the left/right screen edges, partially
 *              tucked behind the street slab.
 *   street     opaque causeway slab (x 50..490) with the road at center
 *              (x 170..370) and per-skin shoulder dressing.
 *   foreground near roadside props overlapping the slab edges; center stays
 *              clear so units always read.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'public', 'assets', 'backgrounds');

const W = 540;
const H = 960;
// Street geometry (texture px; x2 on screen).
const SLAB_X = 50, SLAB_W = 440;          // causeway slab
const ROAD_X = 170, ROAD_W = 200;         // clear marching lane
const Y_MIN = 30, Y_MAX = 930;            // discrete props stay inside this

// ---------------------------------------------------------------------------
// Deterministic PRNG (mulberry32) so re-running the script is a no-op diff.
// ---------------------------------------------------------------------------

function hashSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const f = (n) => Math.round(n * 10) / 10;

/** `count` y-positions spread over the safe band with jitter, seam-safe. */
function ySlots(r, count, jitter = 40, pad = 60) {
  const y0 = Y_MIN + pad, y1 = Y_MAX - pad;
  const step = (y1 - y0) / count;
  return Array.from({ length: count }, (_, i) => {
    const y = y0 + step * (i + 0.5) + (r() * 2 - 1) * jitter;
    return f(Math.min(y1, Math.max(y0, y)));
  });
}

// ---------------------------------------------------------------------------
// Act palettes — bright daylight variants (sunlit slate base + warm accents).
// ---------------------------------------------------------------------------

const ACT_PALETTES = {
  1: { // Barangay — bright morning
    skyTop: '#4da5e8', skyMid: '#86c5f0', skyBot: '#d6edfb',
    glow: '#fff3c4', glowOp: 0.35,
    ground: '#aab6c6', road: '#98a6b8', curb: '#6b7c92', dash: '#f8fafc',
    near: '#7d90ad', far: '#7387a3', lit: '#facc15', accent: '#38bdf8', accent2: '#ef4444',
  },
  2: { // Bayan — mid-morning
    skyTop: '#3d9be2', skyMid: '#7fc4ef', skyBot: '#d2f0fb',
    glow: '#e8fbf0', glowOp: 0.40,
    ground: '#7c8bb0', road: '#8697b8', curb: '#a5b0d4', dash: '#f8fafc',
    near: '#97a5d8', far: '#8c9cc4', lit: '#fb923c', accent: '#f472b6', accent2: '#38bdf8',
  },
  3: { // Province — golden afternoon
    skyTop: '#5fa9e4', skyMid: '#a9d3ef', skyBot: '#ffe3a3',
    glow: '#ffd166', glowOp: 0.45,
    ground: '#6f5563', road: '#7d5f6b', curb: '#ad7889', dash: '#fcd34d',
    near: '#a5707f', far: '#8f6274', lit: '#fbbf24', accent: '#fb7185', accent2: '#f97316',
  },
  4: { // National — clear high noon
    skyTop: '#2f8ad8', skyMid: '#6ebcee', skyBot: '#c6e7fa',
    glow: '#eaf7ff', glowOp: 0.40,
    ground: '#93a2b6', road: '#9cabbf', curb: '#7f93b0', dash: '#475569',
    near: '#8ba0bf', far: '#9db0c4', lit: '#7cc8ea', accent: '#a78bfa', accent2: '#f43f5e',
  },
};

// ---------------------------------------------------------------------------
// Prop library. Every prop is anchored at (cx, baseY) = horizontal center of
// its footprint and the y of its base. `side` is -1 (left) / 1 (right) for
// mirroring. All shapes stay within ~[baseY - height, baseY].
// ---------------------------------------------------------------------------

const PROPS = {
  house(r, cx, y, p) {
    const w = f(60 + r() * 36), h = f(50 + r() * 30);
    const x = f(cx - w / 2);
    return `<g fill="${p.near}"><rect x="${x}" y="${f(y - h)}" width="${w}" height="${h}"/>` +
      `<polygon points="${f(x - 8)},${f(y - h)} ${f(x + w / 2)},${f(y - h - 26)} ${f(x + w + 8)},${f(y - h)}"/></g>` +
      `<rect x="${f(cx - 8)}" y="${f(y - h + 12)}" width="14" height="16" fill="${p.lit}" opacity="0.25"/>`;
  },
  building(r, cx, y, p) {
    const w = f(52 + r() * 30), h = f(150 + r() * 120);
    const x = f(cx - w / 2);
    let windows = '';
    for (let row = 0; row < Math.floor(h / 34); row++) {
      for (let col = 0; col < 2; col++) {
        if (r() < 0.45) continue;
        windows += `<rect x="${f(x + 10 + col * (w / 2))}" y="${f(y - h + 14 + row * 34)}" width="10" height="12"/>`;
      }
    }
    return `<rect x="${x}" y="${f(y - h)}" width="${w}" height="${h}" fill="${p.far}"/>` +
      `<g fill="${p.lit}" opacity="0.22">${windows}</g>`;
  },
  tower(r, cx, y, p) {
    const h = f(220 + r() * 90);
    return `<rect x="${f(cx - 14)}" y="${f(y - h)}" width="28" height="${h}" fill="${p.far}"/>` +
      `<rect x="${f(cx - 1.5)}" y="${f(y - h - 24)}" width="3" height="24" fill="${p.far}"/>` +
      `<circle cx="${cx}" cy="${f(y - h - 24)}" r="3" fill="${p.accent2}" opacity="0.8"/>`;
  },
  mountain(r, cx, y, p) {
    const w = f(180 + r() * 120), h = f(90 + r() * 70);
    return `<polygon points="${f(cx - w / 2)},${y} ${cx},${f(y - h)} ${f(cx + w / 2)},${y}" fill="${p.far}" opacity="0.8"/>`;
  },
  belltower(r, cx, y, p) {
    const h = f(120 + r() * 40);
    return `<g fill="${p.far}"><rect x="${f(cx - 16)}" y="${f(y - h)}" width="32" height="${h}"/>` +
      `<polygon points="${f(cx - 22)},${f(y - h)} ${cx},${f(y - h - 30)} ${f(cx + 22)},${f(y - h)}"/></g>` +
      `<rect x="${f(cx - 6)}" y="${f(y - h + 12)}" width="12" height="16" rx="6" fill="${p.lit}" opacity="0.2"/>`;
  },
  dome(r, cx, y, p) {
    const w = 120, h = 80;
    return `<g fill="${p.far}"><rect x="${f(cx - w / 2)}" y="${f(y - h)}" width="${w}" height="${h}"/>` +
      `<ellipse cx="${cx}" cy="${f(y - h)}" rx="34" ry="30"/>` +
      `<rect x="${f(cx - 2)}" y="${f(y - h - 44)}" width="4" height="16"/></g>` +
      `<g fill="${p.lit}" opacity="0.2"><rect x="${f(cx - 44)}" y="${f(y - 50)}" width="10" height="24"/>` +
      `<rect x="${f(cx + 34)}" y="${f(y - 50)}" width="10" height="24"/></g>`;
  },
  crane(r, cx, y, p, side) {
    const h = f(160 + r() * 50);
    return `<g fill="${p.far}"><rect x="${f(cx - 5)}" y="${f(y - h)}" width="10" height="${h}"/>` +
      `<rect x="${side < 0 ? cx : f(cx - 90)}" y="${f(y - h)}" width="90" height="8"/>` +
      `<rect x="${f(cx + side * 60 - 2)}" y="${f(y - h + 8)}" width="4" height="30"/></g>`;
  },
  boat(r, cx, y, p) {
    return `<g fill="${p.far}"><path d="M${f(cx - 40)} ${f(y - 14)} h80 l-12 14 h-56 z"/>` +
      `<rect x="${f(cx - 2)}" y="${f(y - 54)}" width="4" height="40"/></g>` +
      `<circle cx="${cx}" cy="${f(y - 54)}" r="2.5" fill="${p.lit}" opacity="0.7"/>`;
  },
  palm(r, cx, y, p) {
    const h = f(70 + r() * 30);
    const top = f(y - h);
    return `<path d="M${cx} ${y} q${f(6)} ${f(-h / 2)} 2 ${f(-h)}" stroke="${p.near}" stroke-width="7" fill="none"/>` +
      `<g stroke="${p.near}" stroke-width="5" fill="none" stroke-linecap="round">` +
      `<path d="M${f(cx + 2)} ${top} q-26 -6 -38 8"/><path d="M${f(cx + 2)} ${top} q26 -6 38 8"/>` +
      `<path d="M${f(cx + 2)} ${top} q-16 -16 -30 -12"/><path d="M${f(cx + 2)} ${top} q16 -16 30 -12"/></g>`;
  },
  tree(r, cx, y, p) {
    const rr = f(18 + r() * 10);
    return `<rect x="${f(cx - 3)}" y="${f(y - 26)}" width="6" height="26" fill="${p.near}"/>` +
      `<circle cx="${cx}" cy="${f(y - 26 - rr * 0.7)}" r="${rr}" fill="${p.near}" opacity="0.9"/>`;
  },
  lamp(r, cx, y, p) {
    return `<rect x="${f(cx - 2.5)}" y="${f(y - 78)}" width="5" height="78" fill="${p.near}"/>` +
      `<circle cx="${cx}" cy="${f(y - 80)}" r="6" fill="${p.lit}" opacity="0.9"/>` +
      `<circle cx="${cx}" cy="${f(y - 80)}" r="16" fill="${p.lit}" opacity="0.12"/>`;
  },
  stall(r, cx, y, p) {
    const w = 66;
    const x = f(cx - w / 2);
    let stripes = '';
    for (let i = 0; i < 5; i++) {
      stripes += `<rect x="${f(x - 4 + i * (w + 8) / 5)}" y="${f(y - 58)}" width="${f((w + 8) / 10)}" height="14" fill="${i % 2 ? '#e2e8f0' : p.accent2}" opacity="0.7"/>`;
    }
    return `<rect x="${x}" y="${f(y - 40)}" width="${w}" height="40" fill="${p.near}"/>${stripes}` +
      `<rect x="${f(x - 4)}" y="${f(y - 46)}" width="${w + 8}" height="6" fill="${p.near}"/>`;
  },
  jeepney(r, cx, y, p) {
    const w = 56, h = 88; // seen from above-ish: long body along the march axis
    const x = f(cx - w / 2);
    return `<g><rect x="${x}" y="${f(y - h)}" width="${w}" height="${h}" rx="12" fill="${p.near}"/>` +
      `<rect x="${f(x + 8)}" y="${f(y - h + 14)}" width="${w - 16}" height="${h - 34}" rx="8" fill="${p.far}"/>` +
      `<rect x="${f(x + 8)}" y="${f(y - h + 14)}" width="${w - 16}" height="6" fill="${p.accent2}" opacity="0.8"/>` +
      `<circle cx="${f(x + 12)}" cy="${f(y - 8)}" r="4" fill="${p.lit}" opacity="0.6"/>` +
      `<circle cx="${f(x + w - 12)}" cy="${f(y - 8)}" r="4" fill="${p.lit}" opacity="0.6"/></g>`;
  },
  tricycle(r, cx, y, p) {
    return `<g fill="${p.near}"><rect x="${f(cx - 24)}" y="${f(y - 34)}" width="48" height="26" rx="6"/>` +
      `<rect x="${f(cx - 30)}" y="${f(y - 44)}" width="30" height="14" rx="4"/>` +
      `<circle cx="${f(cx - 14)}" cy="${f(y - 6)}" r="7"/><circle cx="${f(cx + 14)}" cy="${f(y - 6)}" r="7"/></g>`;
  },
  bench(r, cx, y, p) {
    return `<g fill="${p.near}"><rect x="${f(cx - 26)}" y="${f(y - 18)}" width="52" height="7" rx="2"/>` +
      `<rect x="${f(cx - 22)}" y="${f(y - 11)}" width="5" height="11"/><rect x="${f(cx + 17)}" y="${f(y - 11)}" width="5" height="11"/></g>`;
  },
  planter(r, cx, y, p) {
    return `<rect x="${f(cx - 16)}" y="${f(y - 20)}" width="32" height="20" rx="4" fill="${p.near}"/>` +
      `<circle cx="${f(cx - 7)}" cy="${f(y - 26)}" r="10" fill="${p.near}" opacity="0.85"/>` +
      `<circle cx="${f(cx + 8)}" cy="${f(y - 28)}" r="12" fill="${p.near}" opacity="0.85"/>`;
  },
  barrel(r, cx, y, p) {
    return `<g><rect x="${f(cx - 13)}" y="${f(y - 36)}" width="26" height="36" rx="3" fill="${p.near}"/>` +
      `<rect x="${f(cx - 15)}" y="${f(y - 28)}" width="30" height="4" fill="${p.curb}"/>` +
      `<rect x="${f(cx - 15)}" y="${f(y - 14)}" width="30" height="4" fill="${p.curb}"/></g>`;
  },
  flagpole(r, cx, y, p) {
    return `<rect x="${f(cx - 2)}" y="${f(y - 110)}" width="4" height="110" fill="${p.near}"/>` +
      `<polygon points="${f(cx + 2)},${f(y - 110)} ${f(cx + 34)},${f(y - 102)} ${f(cx + 2)},${f(y - 94)}" fill="${p.accent2}" opacity="0.8"/>`;
  },
  placard(r, cx, y, p) {
    const tilt = f((r() * 2 - 1) * 8);
    return `<g transform="rotate(${tilt} ${cx} ${y})">` +
      `<rect x="${f(cx - 2)}" y="${f(y - 54)}" width="4" height="54" fill="${p.near}"/>` +
      `<rect x="${f(cx - 20)}" y="${f(y - 76)}" width="40" height="26" rx="3" fill="#e2e8f0" opacity="0.85"/>` +
      `<rect x="${f(cx - 13)}" y="${f(y - 68)}" width="26" height="4" fill="${p.near}"/>` +
      `<rect x="${f(cx - 13)}" y="${f(y - 61)}" width="18" height="4" fill="${p.near}"/></g>`;
  },
  hoop(r, cx, y, p, side) {
    return `<rect x="${f(cx - 3)}" y="${f(y - 96)}" width="6" height="96" fill="${p.near}"/>` +
      `<rect x="${f(cx - side * 4 - (side < 0 ? 0 : 26))}" y="${f(y - 96)}" width="26" height="20" rx="2" fill="${p.near}"/>` +
      `<circle cx="${f(cx - side * 18)}" cy="${f(y - 76)}" r="5" stroke="${p.accent2}" stroke-width="2.5" fill="none" opacity="0.9"/>`;
  },
  gazebo(r, cx, y, p) {
    return `<g fill="${p.near}"><rect x="${f(cx - 34)}" y="${f(y - 8)}" width="68" height="8"/>` +
      `<rect x="${f(cx - 28)}" y="${f(y - 52)}" width="6" height="44"/><rect x="${f(cx + 22)}" y="${f(y - 52)}" width="6" height="44"/>` +
      `<polygon points="${f(cx - 40)},${f(y - 52)} ${cx},${f(y - 76)} ${f(cx + 40)},${f(y - 52)}"/></g>`;
  },
  container(r, cx, y, p) {
    const c = r() < 0.5 ? p.accent2 : p.accent;
    return `<rect x="${f(cx - 30)}" y="${f(y - 26)}" width="60" height="26" fill="${p.near}"/>` +
      `<rect x="${f(cx - 30)}" y="${f(y - 26)}" width="60" height="5" fill="${c}" opacity="0.5"/>` +
      `<rect x="${f(cx - 22)}" y="${f(y - 48)}" width="44" height="22" fill="${p.near}" opacity="0.9"/>`;
  },
  bollard(r, cx, y, p) {
    return `<rect x="${f(cx - 5)}" y="${f(y - 22)}" width="10" height="22" rx="4" fill="${p.near}"/>` +
      `<rect x="${f(cx - 5)}" y="${f(y - 18)}" width="10" height="3" fill="${p.lit}" opacity="0.5"/>`;
  },
  kmpost(r, cx, y, p) {
    return `<rect x="${f(cx - 6)}" y="${f(y - 34)}" width="12" height="34" rx="5" fill="#e2e8f0" opacity="0.7"/>` +
      `<rect x="${f(cx - 3)}" y="${f(y - 26)}" width="6" height="8" fill="${p.near}"/>`;
  },
  epost(r, cx, y, p, side) {
    return `<g fill="${p.near}"><rect x="${f(cx - 3)}" y="${f(y - 120)}" width="6" height="120"/>` +
      `<rect x="${f(cx - 20)}" y="${f(y - 116)}" width="40" height="4"/></g>` +
      `<path d="M${f(cx - 18)} ${f(y - 112)} q${f(side * 30)} 22 ${f(side * 46)} 20" stroke="${p.near}" stroke-width="2" fill="none" opacity="0.7"/>`;
  },
  billboard(r, cx, y, p) {
    return `<rect x="${f(cx - 4)}" y="${f(y - 96)}" width="8" height="96" fill="${p.near}"/>` +
      `<rect x="${f(cx - 34)}" y="${f(y - 140)}" width="68" height="44" rx="3" fill="${p.far}"/>` +
      `<rect x="${f(cx - 26)}" y="${f(y - 130)}" width="52" height="10" fill="${p.accent}" opacity="0.5"/>` +
      `<rect x="${f(cx - 26)}" y="${f(y - 114)}" width="34" height="6" fill="#e2e8f0" opacity="0.4"/>`;
  },
  barrier(r, cx, y, p) {
    return `<g><rect x="${f(cx - 32)}" y="${f(y - 24)}" width="64" height="24" rx="3" fill="${p.near}"/>` +
      `<polygon points="${f(cx - 26)},${f(y - 24)} ${f(cx - 12)},${f(y - 24)} ${f(cx - 22)},${y} ${f(cx - 36)},${y}" fill="${p.lit}" opacity="0.45"/>` +
      `<polygon points="${f(cx + 4)},${f(y - 24)} ${f(cx + 18)},${f(y - 24)} ${f(cx + 8)},${y} ${f(cx - 6)},${y}" fill="${p.lit}" opacity="0.45"/></g>`;
  },
  gatepillar(r, cx, y, p) {
    return `<g fill="${p.near}"><rect x="${f(cx - 16)}" y="${f(y - 92)}" width="32" height="92"/>` +
      `<rect x="${f(cx - 20)}" y="${f(y - 100)}" width="40" height="10"/></g>` +
      `<circle cx="${cx}" cy="${f(y - 106)}" r="6" fill="${p.lit}" opacity="0.8"/>`;
  },
  wall(r, cx, y, p) {
    return `<rect x="${f(cx - 44)}" y="${f(y - 46)}" width="88" height="46" fill="${p.near}"/>` +
      `<rect x="${f(cx - 44)}" y="${f(y - 52)}" width="88" height="8" fill="${p.curb}"/>`;
  },
  hedge(r, cx, y, p) {
    return `<rect x="${f(cx - 36)}" y="${f(y - 18)}" width="72" height="18" rx="9" fill="${p.near}" opacity="0.9"/>`;
  },
  crate(r, cx, y, p) {
    return `<g fill="${p.near}"><rect x="${f(cx - 14)}" y="${f(y - 24)}" width="28" height="24"/>` +
      `<rect x="${f(cx - 8)}" y="${f(y - 44)}" width="24" height="20" opacity="0.9"/></g>`;
  },
  banderitas(r, cx, y, p, side) {
    // Short string of pennants angled from the roadside toward the screen edge.
    const x2 = f(cx + side * 90), y2 = f(y - 24);
    let flags = '';
    for (let i = 1; i <= 5; i++) {
      const t = i / 6;
      const fx = f(cx + (x2 - cx) * t), fy = f(y - 60 + 36 * t + Math.sin(t * Math.PI) * -6);
      const c = [p.accent2, '#e2e8f0', p.lit][i % 3];
      flags += `<polygon points="${fx},${fy} ${f(fx + 8)},${fy} ${f(fx + 4)},${f(fy + 10)}" fill="${c}" opacity="0.75"/>`;
    }
    return `<path d="M${cx} ${f(y - 60)} Q ${f((cx + x2) / 2)} ${f(y - 18)} ${x2} ${y2}" stroke="#e2e8f0" stroke-width="1.5" fill="none" opacity="0.5"/>${flags}`;
  },
};

// ---------------------------------------------------------------------------
// Skin configs — which props dress each act/stage.
// ---------------------------------------------------------------------------

/**
 * skyline/shoulders/fg: prop names cycled through the generated slots.
 * groundStyle: extra painted detail on the street slab.
 */
const SKINS = [
  { id: 'default',         act: 1, skyline: ['house', 'tower', 'house'],          shoulders: ['lamp', 'placard', 'flagpole', 'placard', 'barrel'], fg: ['barrel', 'placard', 'lamp'],      groundStyle: 'alley' },
  { id: 'brgy-eskenita',   act: 1, skyline: ['house', 'house', 'belltower'],      shoulders: ['tricycle', 'stall', 'planter', 'barrel', 'lamp'],   fg: ['barrel', 'planter', 'tricycle'],  groundStyle: 'alley' },
  { id: 'brgy-court',      act: 1, skyline: ['house', 'tower', 'house'],          shoulders: ['hoop', 'bench', 'lamp', 'bench', 'hoop'],           fg: ['bench', 'barrel', 'planter'],     groundStyle: 'court' },
  { id: 'brgy-plaza',      act: 1, skyline: ['belltower', 'house', 'house'],      shoulders: ['gazebo', 'flagpole', 'bench', 'banderitas', 'planter'], fg: ['planter', 'lamp', 'bench'],   groundStyle: 'plaza' },
  { id: 'bayan-palengke',  act: 2, skyline: ['building', 'house', 'building'],    shoulders: ['stall', 'crate', 'stall', 'barrel', 'stall'],       fg: ['crate', 'barrel', 'stall'],       groundStyle: 'market' },
  { id: 'bayan-terminal',  act: 2, skyline: ['building', 'tower', 'building'],    shoulders: ['jeepney', 'lamp', 'jeepney', 'kmpost', 'jeepney'],  fg: ['barrel', 'lamp', 'bollard'],      groundStyle: 'terminal' },
  { id: 'bayan-cityhall',  act: 2, skyline: ['dome', 'building', 'building'],     shoulders: ['flagpole', 'planter', 'lamp', 'planter', 'flagpole'], fg: ['planter', 'lamp', 'hedge'],     groundStyle: 'civic' },
  { id: 'prov-highway',    act: 3, skyline: ['mountain', 'mountain', 'tree'],     shoulders: ['epost', 'kmpost', 'tree', 'epost', 'tree'],         fg: ['tree', 'kmpost', 'epost'],        groundStyle: 'highway' },
  { id: 'prov-port',       act: 3, skyline: ['crane', 'boat', 'container'],       shoulders: ['bollard', 'container', 'crate', 'bollard', 'barrel'], fg: ['container', 'bollard', 'crate'], groundStyle: 'port' },
  { id: 'prov-capitol',    act: 3, skyline: ['dome', 'palm', 'building'],         shoulders: ['palm', 'hedge', 'lamp', 'palm', 'flagpole'],        fg: ['palm', 'planter', 'lamp'],        groundStyle: 'civic' },
  { id: 'natl-avenue',     act: 4, skyline: ['building', 'billboard', 'tower'],   shoulders: ['lamp', 'billboard', 'lamp', 'bollard', 'lamp'],     fg: ['lamp', 'barrier', 'bollard'],     groundStyle: 'avenue' },
  { id: 'natl-govt',       act: 4, skyline: ['building', 'dome', 'building'],     shoulders: ['barrier', 'lamp', 'wall', 'barrier', 'flagpole'],   fg: ['barrier', 'bollard', 'lamp'],     groundStyle: 'civic' },
  { id: 'natl-palace',     act: 4, skyline: ['dome', 'tower', 'tree'],            shoulders: ['gatepillar', 'wall', 'lamp', 'gatepillar', 'hedge'], fg: ['gatepillar', 'planter', 'lamp'],  groundStyle: 'palace' },
];

// ---------------------------------------------------------------------------
// Layer generators.
// ---------------------------------------------------------------------------

function svg(body, { opaque = false } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"${opaque ? ' preserveAspectRatio="none"' : ''}>\n${body}\n</svg>\n`;
}

function skySvg(act, r) {
  const p = ACT_PALETTES[act];
  // Daylight skies: a sun + soft cumulus per act mood. Act 3 rides low
  // (golden afternoon); the others sit high in a clear blue sky.
  const sun = {
    1: { cx: 300, cy: 150, r: 34, core: '#fff7cd', halo: '#ffe9a3' },
    2: { cx: 380, cy: 130, r: 30, core: '#fffbe6', halo: '#ffedad' },
    3: { cx: 270, cy: 680, r: 52, core: '#fff1b8', halo: '#ffd766' },
    4: { cx: 160, cy: 110, r: 26, core: '#ffffff', halo: '#fff3b8' },
  }[act];
  let detail =
    `<circle cx="${sun.cx}" cy="${sun.cy}" r="${f(sun.r * 2.2)}" fill="${sun.halo}" opacity="0.25"/>` +
    `<circle cx="${sun.cx}" cy="${sun.cy}" r="${f(sun.r * 1.45)}" fill="${sun.halo}" opacity="0.4"/>` +
    `<circle cx="${sun.cx}" cy="${sun.cy}" r="${sun.r}" fill="${sun.core}"/>`;
  const cloudCount = { 1: 5, 2: 4, 3: 4, 4: 3 }[act];
  const cloudTint = act === 3 ? '#fff6e0' : '#ffffff';
  for (let i = 0; i < cloudCount; i++) {
    const cx = f(40 + r() * (W - 80));
    const cy = f(80 + r() * H * 0.58);
    const rx = f(55 + r() * 60), ry = f(14 + r() * 10);
    detail += `<g fill="${cloudTint}" opacity="${f(0.6 + r() * 0.3)}">` +
      `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"/>` +
      `<ellipse cx="${f(cx - rx * 0.45)}" cy="${f(cy + ry * 0.45)}" rx="${f(rx * 0.55)}" ry="${f(ry * 0.8)}"/>` +
      `<ellipse cx="${f(cx + rx * 0.4)}" cy="${f(cy + ry * 0.35)}" rx="${f(rx * 0.6)}" ry="${f(ry * 0.85)}"/></g>`;
  }
  const body =
    `  <defs>\n` +
    `    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">\n` +
    `      <stop offset="0" stop-color="${p.skyTop}"/>\n` +
    `      <stop offset="0.55" stop-color="${p.skyMid}"/>\n` +
    `      <stop offset="1" stop-color="${p.skyBot}"/>\n` +
    `    </linearGradient>\n` +
    `    <linearGradient id="horizon" x1="0" y1="0" x2="0" y2="1">\n` +
    `      <stop offset="0" stop-color="${p.glow}" stop-opacity="0"/>\n` +
    `      <stop offset="1" stop-color="${p.glow}" stop-opacity="${p.glowOp}"/>\n` +
    `    </linearGradient>\n` +
    `  </defs>\n` +
    `  <rect width="${W}" height="${H}" fill="url(#sky)"/>\n` +
    `  <rect y="${H * 0.5}" width="${W}" height="${H * 0.5}" fill="url(#horizon)"/>\n` +
    `  ${detail}`;
  return svg(body, { opaque: true });
}

/** Far scenery hugging the screen edges, half-tucked behind the street slab. */
function skylineSvg(cfg, r) {
  const p = ACT_PALETTES[cfg.act];
  let body = '';
  for (const side of [-1, 1]) {
    const cx = side < 0 ? 26 : W - 26;
    const ys = ySlots(r, cfg.skyline.length, 46, 90);
    cfg.skyline.forEach((name, i) => {
      body += '  ' + PROPS[name](r, f(cx + side * (r() * 18)), ys[i], p, side) + '\n';
    });
  }
  return svg(body.trimEnd());
}

/**
 * A horizontal pavement joint drawn only on the two shoulders — never across
 * the road, so the marching lane always reads clean.
 */
function shoulderLine(y, h, fill, opacity) {
  return `<rect x="${SLAB_X}" y="${y}" width="${ROAD_X - SLAB_X}" height="${h}" fill="${fill}" opacity="${opacity}"/>` +
    `<rect x="${ROAD_X + ROAD_W}" y="${y}" width="${SLAB_X + SLAB_W - ROAD_X - ROAD_W}" height="${h}" fill="${fill}" opacity="${opacity}"/>`;
}

/** Per-groundStyle painted detail on the slab (all vertically seam-safe). */
function groundDetail(style, r, p) {
  const acc = (o) => `opacity="${o}"`;
  let d = '';
  switch (style) {
    case 'alley':
      for (let i = 0; i < 5; i++) {
        d += `<ellipse cx="${f(SLAB_X + 20 + r() * (SLAB_W - 40))}" cy="${f(Y_MIN + 40 + r() * (Y_MAX - Y_MIN - 80))}" rx="${f(14 + r() * 16)}" ry="${f(4 + r() * 4)}" fill="${p.accent}" ${acc(0.05)}/>`;
      }
      break;
    case 'court': {
      // Half-court paint on the left shoulder, sliced by the road.
      const cy = 480;
      d += `<g stroke="${p.accent}" stroke-width="3" fill="none" ${acc(0.18)}>` +
        `<rect x="${SLAB_X + 8}" y="${cy - 180}" width="${ROAD_X - SLAB_X - 16}" height="360"/>` +
        `<circle cx="${SLAB_X + 8}" cy="${cy}" r="56"/>` +
        `<line x1="${SLAB_X + 8}" y1="${cy}" x2="${ROAD_X - 8}" y2="${cy}"/></g>`;
      break;
    }
    case 'plaza':
      for (let y = 120; y <= 840; y += 120) {
        d += shoulderLine(y, 2, p.curb, 0.35);
      }
      break;
    case 'market':
      for (let y = 90; y <= 870; y += 78) {
        d += shoulderLine(y, 1.5, p.curb, 0.4);
      }
      d += `<rect x="${SLAB_X}" y="0" width="4" height="${H}" fill="${p.curb}" ${acc(0.4)}/>`;
      break;
    case 'terminal':
      // Bay markings on both shoulders.
      for (const x of [SLAB_X + 14, ROAD_X + ROAD_W + 14]) {
        for (let y = 100; y <= 800; y += 190) {
          d += `<rect x="${x}" y="${y}" width="92" height="130" rx="4" stroke="${p.dash}" stroke-width="2.5" fill="none" ${acc(0.4)}/>`;
        }
      }
      break;
    case 'civic':
      for (let y = 160; y <= 800; y += 160) {
        d += shoulderLine(y, 2, p.curb, 0.3);
      }
      d += crosswalk(p);
      break;
    case 'highway':
      // Solid edge lines + grass fringe.
      d += `<rect x="${ROAD_X - 14}" y="0" width="4" height="${H}" fill="#e2e8f0" ${acc(0.2)}/>` +
        `<rect x="${ROAD_X + ROAD_W + 10}" y="0" width="4" height="${H}" fill="#e2e8f0" ${acc(0.2)}/>`;
      for (let i = 0; i < 14; i++) {
        const x = r() < 0.5 ? SLAB_X + 4 + r() * 40 : SLAB_X + SLAB_W - 44 + r() * 40;
        d += `<circle cx="${f(x)}" cy="${f(Y_MIN + 20 + r() * (Y_MAX - Y_MIN - 40))}" r="${f(4 + r() * 5)}" fill="${p.near}" ${acc(0.8)}/>`;
      }
      break;
    case 'port':
      for (let y = 140; y <= 820; y += 170) {
        d += shoulderLine(y, 3, p.curb, 0.5);
      }
      break;
    case 'avenue':
      // Extra lane dashes on the shoulders (period divides 960 → seamless).
      for (const x of [f((SLAB_X + ROAD_X) / 2), f(ROAD_X + ROAD_W + (SLAB_X + SLAB_W - ROAD_X - ROAD_W) / 2)]) {
        for (let i = 0; i < 8; i++) {
          d += `<rect x="${x - 3}" y="${i * 120 + 46}" width="6" height="34" fill="${p.dash}" ${acc(0.35)}/>`;
        }
      }
      d += crosswalk(p);
      break;
    case 'palace':
      for (let y = 200; y <= 760; y += 280) {
        d += shoulderLine(y, 2, p.curb, 0.3);
      }
      d += crosswalk(p);
      break;
  }
  return d;
}

/** A pedestrian crossing band across the road, mid-tile (seam-safe). */
function crosswalk(p) {
  let d = '';
  for (let i = 0; i < 8; i++) {
    d += `<rect x="${ROAD_X + 12 + i * 23}" y="452" width="14" height="56" fill="${p.dash}" opacity="0.4"/>`;
  }
  return d;
}

function streetSvg(cfg, r) {
  const p = ACT_PALETTES[cfg.act];
  let body =
    `  <!-- causeway slab: continuous full-height, uniform -> wraps seamlessly -->\n` +
    `  <rect x="${SLAB_X}" y="0" width="${SLAB_W}" height="${H}" fill="${p.ground}"/>\n` +
    `  <rect x="${SLAB_X}" y="0" width="6" height="${H}" fill="${p.near}"/>\n` +
    `  <rect x="${SLAB_X + SLAB_W - 6}" y="0" width="6" height="${H}" fill="${p.near}"/>\n` +
    `  <!-- center road (the marching lane stays clear of props) -->\n` +
    `  <rect x="${ROAD_X}" y="0" width="${ROAD_W}" height="${H}" fill="${p.road}"/>\n` +
    `  <rect x="${ROAD_X}" y="0" width="6" height="${H}" fill="${p.curb}"/>\n` +
    `  <rect x="${ROAD_X + ROAD_W - 6}" y="0" width="6" height="${H}" fill="${p.curb}"/>\n`;
  // Dashed centerline, period 120 divides 960 → seamless across the wrap.
  // Daylight: markings read clearly (night builds kept these faint).
  body += `  <g fill="${p.dash}" opacity="0.5">\n`;
  for (let i = 0; i < 8; i++) {
    body += `    <rect x="${W / 2 - 4}" y="${i * 120 + 40}" width="8" height="40"/>\n`;
  }
  body += `  </g>\n`;
  body += `  ${groundDetail(cfg.groundStyle, r, p)}\n`;
  // Shoulder dressing: props on both shoulders, clear of the road and edges.
  for (const side of [-1, 1]) {
    const cx = side < 0 ? (SLAB_X + ROAD_X) / 2 : ROAD_X + ROAD_W + (SLAB_X + SLAB_W - ROAD_X - ROAD_W) / 2;
    const ys = ySlots(r, cfg.shoulders.length, 30, 40);
    cfg.shoulders.forEach((name, i) => {
      body += '  ' + PROPS[name](r, f(cx + (r() * 2 - 1) * 12), ys[i], p, side) + '\n';
    });
  }
  return svg(body.trimEnd());
}

function foregroundSvg(cfg, r) {
  const p = ACT_PALETTES[cfg.act];
  let body = '';
  for (const side of [-1, 1]) {
    const cx = side < 0 ? 92 : W - 92;
    const ys = ySlots(r, cfg.fg.length, 60, 90);
    cfg.fg.forEach((name, i) => {
      // Foreground props render ~1.5x via a transform so they read nearer.
      const x = f(cx + (r() * 2 - 1) * 16), y = ys[i];
      body += `  <g transform="translate(${x} ${y}) scale(1.5) translate(${-x} ${-y})" opacity="0.95">` +
        PROPS[name](r, x, y, p, side) + `</g>\n`;
    });
  }
  return svg(body.trimEnd());
}

// ---------------------------------------------------------------------------
// Emit.
// ---------------------------------------------------------------------------

let count = 0;
for (const cfg of SKINS) {
  const isDefault = cfg.id === 'default';
  const dir = isDefault ? OUT : join(OUT, 'skins', cfg.id);
  mkdirSync(dir, { recursive: true });
  const layers = {
    sky: skySvg(cfg.act, mulberry32(hashSeed(cfg.id + ':sky'))),
    skyline: skylineSvg(cfg, mulberry32(hashSeed(cfg.id + ':skyline'))),
    street: streetSvg(cfg, mulberry32(hashSeed(cfg.id + ':street'))),
    foreground: foregroundSvg(cfg, mulberry32(hashSeed(cfg.id + ':fg'))),
  };
  for (const [layer, content] of Object.entries(layers)) {
    const file = isDefault ? join(dir, `bg-${layer}.svg`) : join(dir, `${layer}.svg`);
    writeFileSync(file, content);
    count++;
  }
  console.log(`generated ${cfg.id}`);
}
console.log(`\n${count} SVGs written under public/assets/backgrounds/`);
