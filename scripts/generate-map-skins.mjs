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
 * Art direction: a souls-like ruined battlefield seen top-down — scorched
 * earth, cracked pavement, collapsed buildings and burning wreckage flanking
 * the marching lane, with fire glow and drifting smoke. Each act escalates the
 * ruin (ashen dawn -> smoldering -> blood dusk -> blackened inferno).
 *
 * Composition (matches the "center pathway, decor on the sides" principle in
 * mapSkins.ts):
 *   sky        opaque scorched-ground backdrop; scroll factor 0, never wraps.
 *              Kept low-detail (no hard shapes) so it doesn't visibly stick
 *              against the scrolling layers.
 *   skyline    far ruins hugging the left/right screen edges, partially
 *              tucked behind the street slab.
 *   street     opaque causeway slab (x 50..490) with the road at center
 *              (x 170..370) and per-skin cracked/scorched shoulder dressing.
 *   foreground near ruined roadside props overlapping the slab edges; center
 *              stays clear so units always read.
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
// Act palettes — escalating ruin moods. Same keys throughout; skyTop/Mid/Bot
// now describe the scorched-ground backdrop gradient, `glow` the fire haze,
// `lit` the ember/flame highlight. Ground/road darken and redden per act.
// ---------------------------------------------------------------------------

const ACT_PALETTES = {
  1: { // Barangay — ashen dawn (gray-brown ash, pale cold light)
    skyTop: '#2b2a2e', skyMid: '#3d3a3a', skyBot: '#524a45',
    glow: '#c9683a', glowOp: 0.22,
    ground: '#5c5852', road: '#4f4b46', curb: '#37332f', dash: '#b9b2a6',
    near: '#403c37', far: '#3a3733', lit: '#e8823a', accent: '#8a94a0', accent2: '#d1502a',
  },
  2: { // Bayan — smoldering (charcoal grays, stronger ember glow)
    skyTop: '#232022', skyMid: '#332c2b', skyBot: '#48372f',
    glow: '#e0722c', glowOp: 0.32,
    ground: '#4a443f', road: '#403a35', curb: '#2c2724', dash: '#a89b8b',
    near: '#3a352f', far: '#2f2b27', lit: '#fb923c', accent: '#8a7f74', accent2: '#e0531f',
  },
  3: { // Province — blood dusk (rust/red-browns, heavy fire glow)
    skyTop: '#241416', skyMid: '#3a1c1a', skyBot: '#552420',
    glow: '#e8451f', glowOp: 0.42,
    ground: '#48332f', road: '#3f2b28', curb: '#2a1c1a', dash: '#c88a5a',
    near: '#3a2723', far: '#2f201d', lit: '#ff7a2e', accent: '#c25a3a', accent2: '#f2401c',
  },
  4: { // National — blackened inferno (near-black ground, intense flame)
    skyTop: '#171214', skyMid: '#2a1614', skyBot: '#431a12', // deepest red-black
    glow: '#ff5a1e', glowOp: 0.50,
    ground: '#332e2b', road: '#2a2522', curb: '#191614', dash: '#b47a4a',
    near: '#2a2320', far: '#211b19', lit: '#ff8a3a', accent: '#d64a2a', accent2: '#ff3a12',
  },
};

// ---------------------------------------------------------------------------
// Prop library. Every prop is anchored at (cx, baseY) = horizontal center of
// its footprint and the y of its base. `side` is -1 (left) / 1 (right) for
// mirroring. All shapes stay within ~[baseY - height, baseY].
// ---------------------------------------------------------------------------

const PROPS = {
  // --- Ruin/fire props (souls-like chaos) -------------------------------
  flame(r, cx, y, p) {
    // A cluster of 2-3 flame tongues over a radial glow. Anchored at (cx, y).
    const glow = `<circle cx="${cx}" cy="${f(y - 14)}" r="${f(30 + r() * 16)}" fill="${p.glow}" opacity="0.28"/>` +
      `<circle cx="${cx}" cy="${f(y - 14)}" r="${f(16 + r() * 8)}" fill="${p.lit}" opacity="0.32"/>`;
    let tongues = '';
    const n = 2 + Math.floor(r() * 2);
    for (let i = 0; i < n; i++) {
      const tx = f(cx + (r() * 2 - 1) * 12);
      const h = f(26 + r() * 22);
      const c = i === 0 ? p.lit : (r() < 0.5 ? p.accent2 : p.glow);
      tongues += `<path d="M${tx} ${y} q${f(-6 - r() * 4)} ${f(-h * 0.5)} 0 ${f(-h)} q${f(6 + r() * 4)} ${f(h * 0.5)} 0 ${f(h)} z" fill="${c}" opacity="0.9"/>`;
    }
    // Inner bright core.
    tongues += `<path d="M${cx} ${f(y - 4)} q-3 ${f(-10 - r() * 6)} 0 ${f(-20 - r() * 8)} q3 ${f(10 + r() * 6)} 0 ${f(20 + r() * 8)} z" fill="#ffe6a3" opacity="0.85"/>`;
    return glow + tongues;
  },
  bonfire(r, cx, y, p) {
    // Souls-style: a coal/ash mound with a flame and a strong glow.
    const glow = `<circle cx="${cx}" cy="${f(y - 20)}" r="${f(46 + r() * 12)}" fill="${p.glow}" opacity="0.3"/>`;
    const mound = `<ellipse cx="${cx}" cy="${y}" rx="${f(30 + r() * 8)}" ry="10" fill="${p.curb}"/>` +
      `<ellipse cx="${cx}" cy="${f(y - 2)}" rx="${f(20 + r() * 6)}" ry="7" fill="${p.lit}" opacity="0.4"/>`;
    const logs = `<g stroke="${p.near}" stroke-width="4" stroke-linecap="round">` +
      `<line x1="${f(cx - 18)}" y1="${f(y + 2)}" x2="${f(cx + 14)}" y2="${f(y - 10)}"/>` +
      `<line x1="${f(cx + 18)}" y1="${f(y + 2)}" x2="${f(cx - 14)}" y2="${f(y - 10)}"/></g>`;
    return glow + mound + logs + PROPS.flame(r, cx, f(y - 6), p);
  },
  rubble(r, cx, y, p) {
    // Irregular pile of broken masonry chunks.
    let chunks = `<ellipse cx="${cx}" cy="${y}" rx="${f(34 + r() * 16)}" ry="12" fill="${p.far}"/>`;
    const n = 5 + Math.floor(r() * 4);
    for (let i = 0; i < n; i++) {
      const bx = f(cx + (r() * 2 - 1) * 34);
      const by = f(y - r() * 26);
      const s = f(6 + r() * 12);
      chunks += `<rect x="${bx}" y="${by}" width="${s}" height="${f(s * (0.6 + r() * 0.6))}" transform="rotate(${f((r() * 2 - 1) * 40)} ${bx} ${by})" fill="${r() < 0.5 ? p.near : p.curb}"/>`;
    }
    return chunks;
  },
  debris(r, cx, y, p) {
    // Scattered small chunks + bent rebar lines, hugging the ground.
    let d = '';
    for (let i = 0; i < 6; i++) {
      const bx = f(cx + (r() * 2 - 1) * 30), by = f(y - r() * 10);
      d += `<rect x="${bx}" y="${by}" width="${f(4 + r() * 7)}" height="${f(3 + r() * 5)}" transform="rotate(${f(r() * 90)} ${bx} ${by})" fill="${p.curb}" opacity="0.9"/>`;
    }
    d += `<path d="M${f(cx - 20)} ${y} q10 -14 22 -6 q8 6 18 -4" stroke="${p.near}" stroke-width="2" fill="none" opacity="0.7"/>`;
    return d;
  },
  crater(r, cx, y, p) {
    // Dark scorched blast mark with a debris rim.
    const rx = f(30 + r() * 18), ry = f(12 + r() * 6);
    return `<ellipse cx="${cx}" cy="${y}" rx="${rx}" ry="${ry}" fill="#0d0a09" opacity="0.55"/>` +
      `<ellipse cx="${cx}" cy="${y}" rx="${f(rx * 0.6)}" ry="${f(ry * 0.6)}" fill="${p.glow}" opacity="0.18"/>` +
      `<ellipse cx="${cx}" cy="${y}" rx="${rx}" ry="${ry}" fill="none" stroke="${p.curb}" stroke-width="3" opacity="0.6"/>`;
  },
  smoke(r, cx, y, p) {
    // Soft gray wisp rising from the ground; low opacity.
    let d = '';
    const n = 3 + Math.floor(r() * 2);
    for (let i = 0; i < n; i++) {
      const t = i / n;
      const sx = f(cx + (r() * 2 - 1) * 16 + t * 14);
      const sy = f(y - 20 - i * 30 - r() * 12);
      const rr = f(16 + i * 8 + r() * 8);
      d += `<circle cx="${sx}" cy="${sy}" r="${rr}" fill="#0e0c0c" opacity="${f(0.22 - t * 0.05)}"/>`;
    }
    return d;
  },
  charredTree(r, cx, y, p) {
    // Bare, blackened trunk with jagged snapped branches.
    const h = f(50 + r() * 30);
    return `<rect x="${f(cx - 3)}" y="${f(y - h)}" width="6" height="${h}" fill="#1a1512"/>` +
      `<g stroke="#1a1512" stroke-width="3" fill="none" stroke-linecap="round">` +
      `<path d="M${cx} ${f(y - h + 8)} l-16 -10 l-6 -14"/>` +
      `<path d="M${cx} ${f(y - h + 18)} l18 -8 l4 -16"/>` +
      `<path d="M${cx} ${f(y - h)} l-8 -16"/></g>` +
      `<circle cx="${f(cx - 6)}" cy="${f(y - 4)}" r="4" fill="${p.lit}" opacity="0.4"/>`;
  },
  house(r, cx, y, p) {
    // Ruined: caved roof, jagged wall top, fire-lit gap.
    const w = f(60 + r() * 36), h = f(46 + r() * 26);
    const x = f(cx - w / 2);
    const mid = f(x + w * (0.4 + r() * 0.2));
    return `<g fill="${p.near}">` +
      `<polygon points="${x},${y} ${x},${f(y - h)} ${mid},${f(y - h + 14)} ${f(x + w * 0.7)},${f(y - h - 6)} ${f(x + w)},${f(y - h + 20)} ${f(x + w)},${y}"/></g>` +
      `<polygon points="${f(x + 4)},${f(y - h + 20)} ${f(x + w * 0.5)},${f(y - h - 2)} ${f(x + w * 0.5)},${f(y - 6)} ${f(x + 4)},${f(y - 6)}" fill="#100c0a" opacity="0.45"/>` +
      `<rect x="${f(cx - 6)}" y="${f(y - h + 22)}" width="14" height="18" fill="${p.lit}" opacity="0.5"/>` +
      PROPS.rubble(r, f(x + w * 0.2), y, p);
  },
  building(r, cx, y, p) {
    // Ruined high-rise: collapsed upper floors (jagged top), sparse windows,
    // some lit by fire within.
    const w = f(52 + r() * 30), h = f(150 + r() * 120);
    const x = f(cx - w / 2);
    // Jagged broken silhouette top instead of a flat roofline.
    const topL = f(y - h + r() * 40), topR = f(y - h + r() * 40), topM = f(y - h - 8);
    let windows = '';
    for (let row = 0; row < Math.floor(h / 34); row++) {
      for (let col = 0; col < 2; col++) {
        const roll = r();
        if (roll < 0.45) continue;
        const lit = roll > 0.85; // a few windows glowing with fire
        windows += `<rect x="${f(x + 10 + col * (w / 2))}" y="${f(y - h + 40 + row * 34)}" width="10" height="12" fill="${lit ? p.lit : '#0d0a09'}" opacity="${lit ? 0.7 : 0.5}"/>`;
      }
    }
    return `<polygon points="${x},${y} ${x},${topL} ${f(x + w * 0.5)},${topM} ${f(x + w)},${topR} ${f(x + w)},${y}" fill="${p.far}"/>` +
      windows +
      `<rect x="${f(x + w * 0.3)}" y="${f(y - h * 0.35)}" width="${f(w * 0.4)}" height="${f(h * 0.35)}" fill="#0d0a09" opacity="0.4"/>`;
  },
  tower(r, cx, y, p) {
    // Snapped tower: leans and breaks off partway up.
    const h = f(160 + r() * 70);
    const lean = f((r() * 2 - 1) * 10);
    const topX = f(cx + lean);
    return `<polygon points="${f(cx - 14)},${y} ${f(cx - 14)},${f(y - h)} ${f(topX - 8)},${f(y - h - 10)} ${f(topX + 10)},${f(y - h + 6)} ${f(cx + 14)},${y}" fill="${p.far}"/>` +
      `<rect x="${f(cx - 10)}" y="${f(y - h * 0.5)}" width="8" height="14" fill="#0d0a09" opacity="0.45"/>` +
      `<circle cx="${topX}" cy="${f(y - h)}" r="4" fill="${p.lit}" opacity="0.5"/>`;
  },
  mountain(r, cx, y, p) {
    const w = f(180 + r() * 120), h = f(90 + r() * 70);
    return `<polygon points="${f(cx - w / 2)},${y} ${cx},${f(y - h)} ${f(cx + w / 2)},${y}" fill="${p.far}" opacity="0.8"/>`;
  },
  belltower(r, cx, y, p) {
    // Broken spire: the roof is gone, the top edge jagged.
    const h = f(110 + r() * 36);
    return `<g fill="${p.far}"><polygon points="${f(cx - 16)},${y} ${f(cx - 16)},${f(y - h)} ${f(cx - 4)},${f(y - h + 12)} ${f(cx + 8)},${f(y - h - 6)} ${f(cx + 16)},${f(y - h + 8)} ${f(cx + 16)},${y}"/></g>` +
      `<rect x="${f(cx - 6)}" y="${f(y - h + 24)}" width="12" height="16" rx="6" fill="#0d0a09" opacity="0.5"/>` +
      `<rect x="${f(cx - 6)}" y="${f(y - h + 24)}" width="12" height="6" fill="${p.lit}" opacity="0.4"/>`;
  },
  dome(r, cx, y, p) {
    // Cracked half-dome with the cupola broken off.
    const w = 120, h = 80;
    return `<g fill="${p.far}"><rect x="${f(cx - w / 2)}" y="${f(y - h)}" width="${w}" height="${h}"/>` +
      `<path d="M${f(cx - 34)} ${f(y - h)} a34 30 0 0 1 68 0 z"/></g>` +
      `<path d="M${f(cx - 30)} ${f(y - h - 8)} l10 -14 l6 16 l8 -10" stroke="#0d0a09" stroke-width="2.5" fill="none" opacity="0.6"/>` +
      `<g opacity="0.5"><rect x="${f(cx - 44)}" y="${f(y - 50)}" width="10" height="24" fill="#0d0a09"/>` +
      `<rect x="${f(cx + 34)}" y="${f(y - 50)}" width="10" height="24" fill="#0d0a09"/>` +
      `<rect x="${f(cx - 6)}" y="${f(y - h + 10)}" width="12" height="10" fill="${p.lit}"/></g>`;
  },
  crane(r, cx, y, p, side) {
    // Toppled/leaning jib: the mast leans and the arm sags toward the ground.
    const h = f(120 + r() * 40);
    const tilt = f(side * (10 + r() * 8));
    return `<g fill="${p.far}"><polygon points="${f(cx - 5)},${y} ${f(cx + 5)},${y} ${f(cx + 5 + tilt)},${f(y - h)} ${f(cx - 5 + tilt)},${f(y - h)}"/>` +
      `<rect x="${side < 0 ? f(cx + tilt) : f(cx + tilt - 90)}" y="${f(y - h)}" width="90" height="8" transform="rotate(${f(side * 14)} ${f(cx + tilt)} ${f(y - h)})"/></g>` +
      `<circle cx="${f(cx + tilt)}" cy="${f(y - h)}" r="4" fill="${p.lit}" opacity="0.4"/>`;
  },
  boat(r, cx, y, p) {
    // Half-sunk, listing hull with a snapped mast.
    return `<g fill="${p.far}"><path d="M${f(cx - 40)} ${f(y - 14)} h80 l-12 14 h-56 z" transform="rotate(6 ${cx} ${y})"/>` +
      `<rect x="${f(cx - 2)}" y="${f(y - 44)}" width="4" height="30" transform="rotate(12 ${cx} ${f(y - 14)})"/></g>` +
      `<circle cx="${f(cx - 6)}" cy="${f(y - 8)}" r="4" fill="${p.lit}" opacity="0.5"/>` +
      PROPS.smoke(r, cx, f(y - 12), p);
  },
  palm(r, cx, y, p) {
    // Charred, drooping fronds on a scorched trunk.
    const h = f(64 + r() * 26);
    const top = f(y - h);
    return `<path d="M${cx} ${y} q${f(8)} ${f(-h / 2)} 3 ${f(-h)}" stroke="#1a1512" stroke-width="7" fill="none"/>` +
      `<g stroke="#1a1512" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.9">` +
      `<path d="M${f(cx + 3)} ${top} q-22 4 -34 22"/><path d="M${f(cx + 3)} ${top} q24 6 34 24"/>` +
      `<path d="M${f(cx + 3)} ${top} q-14 -6 -26 2"/></g>` +
      `<circle cx="${cx}" cy="${f(y - 4)}" r="4" fill="${p.lit}" opacity="0.4"/>`;
  },
  tree(r, cx, y, p) {
    // Charred bare tree (no canopy).
    return PROPS.charredTree(r, cx, y, p);
  },
  lamp(r, cx, y, p) {
    // Bent, dead lamp post; head hangs and only a faint ember remains.
    const bend = f((r() * 2 - 1) * 12);
    return `<path d="M${cx} ${y} L${cx} ${f(y - 60)} L${f(cx + bend)} ${f(y - 76)}" stroke="${p.near}" stroke-width="5" fill="none"/>` +
      `<circle cx="${f(cx + bend)}" cy="${f(y - 76)}" r="5" fill="${p.lit}" opacity="0.4"/>`;
  },
  stall(r, cx, y, p) {
    // Collapsed market stall: sagging, scorched awning and a broken frame.
    const w = 66;
    const x = f(cx - w / 2);
    let stripes = '';
    for (let i = 0; i < 5; i++) {
      stripes += `<rect x="${f(x - 4 + i * (w + 8) / 5)}" y="${f(y - 54 + (i % 2) * 4)}" width="${f((w + 8) / 10)}" height="12" fill="${i % 2 ? '#3a2f28' : p.accent2}" opacity="0.6"/>`;
    }
    return `<rect x="${x}" y="${f(y - 34)}" width="${w}" height="34" fill="${p.near}"/>${stripes}` +
      `<path d="M${f(x - 4)} ${f(y - 44)} l${f(w * 0.5)} 6 l${f(w * 0.5 + 8)} -8" stroke="${p.near}" stroke-width="5" fill="none"/>` +
      `<rect x="${f(x + 6)}" y="${f(y - 20)}" width="16" height="20" fill="#0d0a09" opacity="0.4"/>`;
  },
  jeepney(r, cx, y, p) {
    // Burnt-out wreck: dark scorched body, blown-out windows, ember glow.
    const w = 56, h = 88; // seen from above-ish: long body along the march axis
    const x = f(cx - w / 2);
    return `<g><rect x="${x}" y="${f(y - h)}" width="${w}" height="${h}" rx="12" fill="#1c1815"/>` +
      `<rect x="${f(x + 8)}" y="${f(y - h + 14)}" width="${w - 16}" height="${h - 34}" rx="8" fill="#0d0a09"/>` +
      `<rect x="${f(x + 10)}" y="${f(y - h + 20)}" width="${w - 20}" height="10" fill="${p.lit}" opacity="0.45"/>` +
      `<circle cx="${f(x + 14)}" cy="${f(y - h + 40)}" r="5" fill="${p.glow}" opacity="0.5"/></g>` +
      PROPS.smoke(r, cx, f(y - h + 10), p);
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
    // Snapped pole with a scorched, tattered flag.
    const h = f(76 + r() * 20);
    return `<path d="M${cx} ${y} L${cx} ${f(y - h)} l${f((r() * 2 - 1) * 8)} ${f(-10)}" stroke="${p.near}" stroke-width="4" fill="none"/>` +
      `<path d="M${f(cx + 2)} ${f(y - h)} l30 6 l-8 6 l8 8 l-30 -2 z" fill="${p.accent2}" opacity="0.6"/>`;
  },
  placard(r, cx, y, p) {
    // Toppled, scorched protest placard leaning at a sharp angle.
    const tilt = f((r() * 2 - 1) * 24 + (r() < 0.5 ? -18 : 18));
    return `<g transform="rotate(${tilt} ${cx} ${y})">` +
      `<rect x="${f(cx - 2)}" y="${f(y - 54)}" width="4" height="54" fill="${p.near}"/>` +
      `<rect x="${f(cx - 20)}" y="${f(y - 76)}" width="40" height="26" rx="3" fill="#3a2f28" opacity="0.9"/>` +
      `<rect x="${f(cx - 13)}" y="${f(y - 68)}" width="26" height="4" fill="${p.curb}"/>` +
      `<rect x="${f(cx - 13)}" y="${f(y - 61)}" width="18" height="4" fill="${p.curb}"/></g>`;
  },
  hoop(r, cx, y, p, side) {
    return `<rect x="${f(cx - 3)}" y="${f(y - 96)}" width="6" height="96" fill="${p.near}"/>` +
      `<rect x="${f(cx - side * 4 - (side < 0 ? 0 : 26))}" y="${f(y - 96)}" width="26" height="20" rx="2" fill="${p.near}"/>` +
      `<circle cx="${f(cx - side * 18)}" cy="${f(y - 76)}" r="5" stroke="${p.accent2}" stroke-width="2.5" fill="none" opacity="0.9"/>`;
  },
  gazebo(r, cx, y, p) {
    // Collapsed roof: one post buckled, roof caved to one side.
    return `<g fill="${p.near}"><rect x="${f(cx - 34)}" y="${f(y - 8)}" width="68" height="8"/>` +
      `<rect x="${f(cx - 28)}" y="${f(y - 46)}" width="6" height="38"/>` +
      `<path d="M${f(cx + 22)} ${f(y - 8)} l4 -30 l-8 -8" stroke="${p.near}" stroke-width="6" fill="none"/>` +
      `<polygon points="${f(cx - 40)},${f(y - 46)} ${f(cx - 6)},${f(y - 64)} ${f(cx + 18)},${f(y - 40)}"/></g>` +
      PROPS.rubble(r, f(cx + 16), y, p);
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
    // Torn billboard: bent support, panel ripped and hanging.
    return `<path d="M${cx} ${y} L${cx} ${f(y - 92)} l${f((r() * 2 - 1) * 8)} -6" stroke="${p.near}" stroke-width="7" fill="none"/>` +
      `<polygon points="${f(cx - 34)},${f(y - 138)} ${f(cx + 34)},${f(y - 132)} ${f(cx + 30)},${f(y - 96)} ${f(cx + 4)},${f(y - 104)} ${f(cx - 10)},${f(y - 92)} ${f(cx - 34)},${f(y - 100)}" fill="${p.far}"/>` +
      `<rect x="${f(cx - 26)}" y="${f(y - 128)}" width="40" height="10" fill="${p.accent}" opacity="0.4"/>`;
  },
  barrier(r, cx, y, p) {
    return `<g><rect x="${f(cx - 32)}" y="${f(y - 24)}" width="64" height="24" rx="3" fill="${p.near}"/>` +
      `<polygon points="${f(cx - 26)},${f(y - 24)} ${f(cx - 12)},${f(y - 24)} ${f(cx - 22)},${y} ${f(cx - 36)},${y}" fill="${p.lit}" opacity="0.45"/>` +
      `<polygon points="${f(cx + 4)},${f(y - 24)} ${f(cx + 18)},${f(y - 24)} ${f(cx + 8)},${y} ${f(cx - 6)},${y}" fill="${p.lit}" opacity="0.45"/></g>`;
  },
  gatepillar(r, cx, y, p) {
    // Cracked, partly-toppled gate pillar with a fire cresset burning on top.
    const h = f(72 + r() * 16);
    return `<g fill="${p.near}"><polygon points="${f(cx - 16)},${y} ${f(cx - 16)},${f(y - h)} ${f(cx - 2)},${f(y - h - 6)} ${f(cx + 16)},${f(y - h + 8)} ${f(cx + 16)},${y}"/></g>` +
      `<path d="M${f(cx - 10)} ${f(y - h * 0.5)} l8 10 l-4 12" stroke="#0d0a09" stroke-width="2" fill="none" opacity="0.5"/>` +
      PROPS.flame(r, cx, f(y - h + 4), p);
  },
  wall(r, cx, y, p) {
    // Breached wall: a jagged gap blown through the middle, rubble at the base.
    return `<polygon points="${f(cx - 44)},${y} ${f(cx - 44)},${f(y - 46)} ${f(cx - 16)},${f(y - 46)} ${f(cx - 8)},${f(y - 20)} ${f(cx + 6)},${f(y - 24)} ${f(cx + 16)},${f(y - 46)} ${f(cx + 44)},${f(y - 46)} ${f(cx + 44)},${y}" fill="${p.near}"/>` +
      `<rect x="${f(cx - 44)}" y="${f(y - 52)}" width="28" height="8" fill="${p.curb}"/>` +
      `<rect x="${f(cx + 16)}" y="${f(y - 52)}" width="28" height="8" fill="${p.curb}"/>` +
      PROPS.rubble(r, cx, y, p);
  },
  hedge(r, cx, y, p) {
    return `<rect x="${f(cx - 36)}" y="${f(y - 18)}" width="72" height="18" rx="9" fill="${p.near}" opacity="0.9"/>`;
  },
  crate(r, cx, y, p) {
    return `<g fill="${p.near}"><rect x="${f(cx - 14)}" y="${f(y - 24)}" width="28" height="24"/>` +
      `<rect x="${f(cx - 8)}" y="${f(y - 44)}" width="24" height="20" opacity="0.9"/></g>`;
  },
  banderitas(r, cx, y, p, side) {
    // Torn, burnt pennant string sagging low; only a few charred flags remain.
    const x2 = f(cx + side * 90), y2 = f(y - 12);
    let flags = '';
    for (let i = 1; i <= 5; i++) {
      if (r() < 0.4) continue; // most flags burnt away
      const t = i / 6;
      const fx = f(cx + (x2 - cx) * t), fy = f(y - 48 + 40 * t + Math.sin(t * Math.PI) * 4);
      const c = [p.accent2, '#3a2f28', p.curb][i % 3];
      flags += `<polygon points="${fx},${fy} ${f(fx + 7)},${fy} ${f(fx + 3)},${f(fy + 9)}" fill="${c}" opacity="0.7"/>`;
    }
    return `<path d="M${cx} ${f(y - 48)} Q ${f((cx + x2) / 2)} ${f(y - 4)} ${x2} ${y2}" stroke="${p.curb}" stroke-width="1.5" fill="none" opacity="0.5"/>${flags}`;
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
  { id: 'default',         act: 1, skyline: ['house', 'rubble', 'house'],         shoulders: ['flame', 'placard', 'debris', 'crater', 'lamp'],      fg: ['rubble', 'flame', 'lamp'],        groundStyle: 'alley' },
  { id: 'brgy-eskenita',   act: 1, skyline: ['house', 'rubble', 'belltower'],     shoulders: ['tricycle', 'stall', 'flame', 'debris', 'smoke'],     fg: ['rubble', 'flame', 'tricycle'],    groundStyle: 'alley' },
  { id: 'brgy-court',      act: 1, skyline: ['house', 'rubble', 'house'],         shoulders: ['hoop', 'crater', 'flame', 'debris', 'hoop'],         fg: ['bench', 'rubble', 'flame'],       groundStyle: 'court' },
  { id: 'brgy-plaza',      act: 1, skyline: ['belltower', 'rubble', 'house'],     shoulders: ['gazebo', 'flame', 'banderitas', 'crater', 'smoke'],  fg: ['rubble', 'flame', 'charredTree'], groundStyle: 'plaza' },
  { id: 'bayan-palengke',  act: 2, skyline: ['building', 'rubble', 'building'],   shoulders: ['stall', 'flame', 'crate', 'smoke', 'stall'],         fg: ['crate', 'flame', 'stall'],        groundStyle: 'market' },
  { id: 'bayan-terminal',  act: 2, skyline: ['building', 'rubble', 'building'],   shoulders: ['jeepney', 'flame', 'jeepney', 'crater', 'jeepney'],  fg: ['jeepney', 'flame', 'debris'],     groundStyle: 'terminal' },
  { id: 'bayan-cityhall',  act: 2, skyline: ['dome', 'building', 'rubble'],       shoulders: ['flagpole', 'flame', 'rubble', 'smoke', 'flagpole'],  fg: ['rubble', 'flame', 'debris'],      groundStyle: 'civic' },
  { id: 'prov-highway',    act: 3, skyline: ['mountain', 'charredTree', 'smoke'], shoulders: ['epost', 'crater', 'charredTree', 'flame', 'debris'], fg: ['charredTree', 'flame', 'epost'],  groundStyle: 'highway' },
  { id: 'prov-port',       act: 3, skyline: ['crane', 'boat', 'container'],       shoulders: ['bollard', 'container', 'flame', 'crate', 'smoke'],   fg: ['container', 'flame', 'crate'],    groundStyle: 'port' },
  { id: 'prov-capitol',    act: 3, skyline: ['dome', 'charredTree', 'building'],  shoulders: ['palm', 'flame', 'rubble', 'crater', 'flagpole'],     fg: ['palm', 'flame', 'rubble'],        groundStyle: 'civic' },
  { id: 'natl-avenue',     act: 4, skyline: ['building', 'billboard', 'rubble'],  shoulders: ['flame', 'billboard', 'bonfire', 'crater', 'flame'],  fg: ['flame', 'barrier', 'rubble'],     groundStyle: 'avenue' },
  { id: 'natl-govt',       act: 4, skyline: ['building', 'dome', 'rubble'],       shoulders: ['barrier', 'flame', 'wall', 'bonfire', 'flagpole'],   fg: ['barrier', 'flame', 'rubble'],     groundStyle: 'civic' },
  { id: 'natl-palace',     act: 4, skyline: ['dome', 'tower', 'charredTree'],     shoulders: ['gatepillar', 'wall', 'bonfire', 'gatepillar', 'flame'], fg: ['gatepillar', 'flame', 'rubble'], groundStyle: 'palace' },
];

// ---------------------------------------------------------------------------
// Layer generators.
// ---------------------------------------------------------------------------

function svg(body, { opaque = false } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"${opaque ? ' preserveAspectRatio="none"' : ''}>\n${body}\n</svg>\n`;
}

function skySvg(act, r) {
  const p = ACT_PALETTES[act];
  // Scorched-ground backdrop behind everything. This layer is pinned
  // (scrollFactor 0) while the rest scrolls, so it stays LOW-DETAIL and
  // symmetric — no hard shapes that would visibly "stick" against the moving
  // ground. Fire glow bleeds in from the left/right edges (an offscreen
  // burning city), with faint embers and an ash-haze band for atmosphere.
  let detail = '';
  // Edge fire-glow columns, brighter each act. Soft vertical bands hugging the
  // screen edges, drawn with a fade-to-transparent gradient (id per side).
  detail +=
    `<rect x="0" y="0" width="${f(W * 0.42)}" height="${H}" fill="url(#glowL)"/>` +
    `<rect x="${f(W * 0.58)}" y="0" width="${f(W * 0.42)}" height="${H}" fill="url(#glowR)"/>`;
  // Faint ember bokeh — a handful of soft dots, low opacity so they read as
  // ambient light rather than fixed objects.
  const embers = { 1: 8, 2: 12, 3: 16, 4: 22 }[act];
  for (let i = 0; i < embers; i++) {
    const ex = f(r() * W), ey = f(r() * H), er = f(2 + r() * 5);
    detail += `<circle cx="${ex}" cy="${ey}" r="${er}" fill="${p.lit}" opacity="${f(0.05 + r() * 0.12)}"/>`;
  }
  // Ash-haze bands: a couple of very soft horizontal smears.
  for (let i = 0; i < 3; i++) {
    const hy = f(140 + i * 260 + r() * 80);
    detail += `<ellipse cx="${f(W / 2)}" cy="${hy}" rx="${f(W * 0.7)}" ry="${f(40 + r() * 30)}" fill="${p.skyTop}" opacity="0.25"/>`;
  }
  const body =
    `  <defs>\n` +
    `    <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">\n` +
    `      <stop offset="0" stop-color="${p.skyTop}"/>\n` +
    `      <stop offset="0.55" stop-color="${p.skyMid}"/>\n` +
    `      <stop offset="1" stop-color="${p.skyBot}"/>\n` +
    `    </linearGradient>\n` +
    `    <linearGradient id="glowL" x1="0" y1="0" x2="1" y2="0">\n` +
    `      <stop offset="0" stop-color="${p.glow}" stop-opacity="${p.glowOp}"/>\n` +
    `      <stop offset="1" stop-color="${p.glow}" stop-opacity="0"/>\n` +
    `    </linearGradient>\n` +
    `    <linearGradient id="glowR" x1="1" y1="0" x2="0" y2="0">\n` +
    `      <stop offset="0" stop-color="${p.glow}" stop-opacity="${p.glowOp}"/>\n` +
    `      <stop offset="1" stop-color="${p.glow}" stop-opacity="0"/>\n` +
    `    </linearGradient>\n` +
    `  </defs>\n` +
    `  <rect width="${W}" height="${H}" fill="url(#ground)"/>\n` +
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

/**
 * Jagged fissures fracturing the whole slab (road included — a crack reads fine
 * under marching units, unlike a solid prop). Each crack is a short seam-safe
 * polyline that stays inside the y band.
 */
function cracks(r, p, count = 7) {
  let d = '<g stroke="#0d0a09" stroke-width="2" fill="none" opacity="0.5">';
  for (let i = 0; i < count; i++) {
    let x = f(SLAB_X + 6 + r() * (SLAB_W - 12));
    let y = f(Y_MIN + 20 + r() * (Y_MAX - Y_MIN - 120));
    let path = `M${x} ${y}`;
    const segs = 3 + Math.floor(r() * 3);
    for (let s = 0; s < segs; s++) {
      x = f(x + (r() * 2 - 1) * 26);
      y = f(y + 18 + r() * 26);
      path += ` L${x} ${y}`;
    }
    d += `<path d="${path}"/>`;
  }
  return d + '</g>';
}

/** Dark scorch stains scattered on the slab (seam-safe within the y band). */
function scorch(r, p, count = 6) {
  let d = '';
  for (let i = 0; i < count; i++) {
    const cx = f(SLAB_X + 14 + r() * (SLAB_W - 28));
    const cy = f(Y_MIN + 30 + r() * (Y_MAX - Y_MIN - 60));
    d += `<ellipse cx="${cx}" cy="${cy}" rx="${f(20 + r() * 26)}" ry="${f(10 + r() * 12)}" fill="#0d0a09" opacity="${f(0.16 + r() * 0.14)}"/>`;
  }
  return d;
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
      // Half-court paint on the left shoulder — faded, barely legible.
      const cy = 480;
      d += `<g stroke="${p.accent}" stroke-width="3" fill="none" ${acc(0.1)}>` +
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
      // Faded edge lines + charred cinder scatter along the shoulders.
      d += `<rect x="${ROAD_X - 14}" y="0" width="4" height="${H}" fill="${p.dash}" ${acc(0.15)}/>` +
        `<rect x="${ROAD_X + ROAD_W + 10}" y="0" width="4" height="${H}" fill="${p.dash}" ${acc(0.15)}/>`;
      for (let i = 0; i < 14; i++) {
        const x = r() < 0.5 ? SLAB_X + 4 + r() * 40 : SLAB_X + SLAB_W - 44 + r() * 40;
        d += `<circle cx="${f(x)}" cy="${f(Y_MIN + 20 + r() * (Y_MAX - Y_MIN - 40))}" r="${f(3 + r() * 5)}" fill="#0d0a09" ${acc(0.7)}/>`;
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
  // Every ruined road gets scorch stains and fissures on top of its dressing.
  d += scorch(r, p) + cracks(r, p);
  return d;
}

/** An eroded pedestrian crossing — most dashes scorched away or faded. */
function crosswalk(p) {
  let d = '';
  for (let i = 0; i < 8; i++) {
    if (i % 3 === 1) continue; // gaps where the paint has burned off
    d += `<rect x="${ROAD_X + 12 + i * 23}" y="452" width="14" height="56" fill="${p.dash}" opacity="0.22"/>`;
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
  // Broken, faded centerline: period 120 divides 960 → seamless across the
  // wrap; some dashes are scorched away so the road reads abandoned.
  body += `  <g fill="${p.dash}" opacity="0.3">\n`;
  for (let i = 0; i < 8; i++) {
    if (r() < 0.35) continue; // burned-off gaps
    body += `    <rect x="${W / 2 - 4}" y="${i * 120 + 40}" width="8" height="${f(24 + r() * 16)}"/>\n`;
  }
  body += `  </g>\n`;
  body += `  ${groundDetail(cfg.groundStyle, r, p)}\n`;
  // Rubble/debris crumbling from the two outer slab edges (never in the road).
  for (const edge of [SLAB_X + 4, SLAB_X + SLAB_W - 4]) {
    for (let i = 0; i < 6; i++) {
      const bx = f(edge + (r() * 2 - 1) * 16);
      const by = f(Y_MIN + 30 + r() * (Y_MAX - Y_MIN - 60));
      body += `  <rect x="${bx}" y="${by}" width="${f(4 + r() * 8)}" height="${f(4 + r() * 6)}" transform="rotate(${f(r() * 90)} ${bx} ${by})" fill="${p.curb}" opacity="0.8"/>\n`;
    }
  }
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
