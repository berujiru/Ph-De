import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  STYLE_DEFAULT_ART,
  allAttackArtStems,
  attackArtKey,
  attackArtPath,
  resolveAttackArt,
} from '../../src/game/data/attackArt';
import { HERO_DEFINITIONS } from '../../src/game/data/heroes';

/**
 * Attack-art registry: every hero basic attack renders a white/grayscale SVG
 * from public/assets/attacks/, tinted with DAMAGE_TYPE_COLORS at runtime.
 * These tests are the fail-loud guard: the engine falls back softly to the
 * style default when a texture is missing, but a missing/colored file is a
 * content bug and must fail CI.
 */

const ATTACKS_DIR = path.resolve(__dirname, '../../public/assets/attacks');

const svgFileFor = (stem: string) => path.join(ATTACKS_DIR, `${stem}.svg`);

describe('attack art registry', () => {
  it('has a default stem for every attack style', () => {
    const styles = new Set(Object.values(HERO_DEFINITIONS).map((d) => d.attackStyle));
    for (const style of styles) {
      expect(STYLE_DEFAULT_ART[style], `style "${style}" needs a default art stem`).toBeTruthy();
    }
  });

  it('every hero resolves to an SVG that exists on disk', () => {
    for (const def of Object.values(HERO_DEFINITIONS)) {
      const stem = resolveAttackArt(def);
      expect(fs.existsSync(svgFileFor(stem)), `${def.id} -> ${stem}.svg missing`).toBe(true);
    }
  });

  it('every recruitable (non-sandbox) hero declares its own attackArt', () => {
    for (const def of Object.values(HERO_DEFINITIONS)) {
      if (def.id.startsWith('sandbox_')) continue;
      expect(def.attackArt, `${def.id} needs a per-hero attackArt`).toBeTruthy();
    }
  });

  it('allAttackArtStems is a deduped superset of style defaults and hero art', () => {
    const stems = allAttackArtStems(HERO_DEFINITIONS);
    expect(new Set(stems).size).toBe(stems.length);
    for (const stem of Object.values(STYLE_DEFAULT_ART)) {
      expect(stems).toContain(stem);
    }
    for (const def of Object.values(HERO_DEFINITIONS)) {
      expect(stems).toContain(resolveAttackArt(def));
    }
  });

  it('keys and paths follow the atk-/assets convention', () => {
    expect(attackArtKey('pebble')).toBe('atk-pebble');
    expect(attackArtPath('pebble')).toBe('/assets/attacks/pebble.svg');
  });
});

describe('attack art SVG tint contract', () => {
  // setTint MULTIPLIES the texture's RGB, so any hue baked into the art
  // corrupts the damage-type color. Fills/strokes must be grayscale
  // (r == g == b) or the near-black cel outline #0f172a.
  const ALLOWED_NON_GRAY = new Set(['#0f172a']);
  const HEX_COLOR = /(?:fill|stroke|stop-color)\s*[:=]\s*["']?(#[0-9a-fA-F]{3,8})/g;

  const isGray = (hex: string): boolean => {
    let h = hex.slice(1).toLowerCase();
    if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join('');
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return r === g && g === b;
  };

  const stems = allAttackArtStems(HERO_DEFINITIONS).filter((stem) => fs.existsSync(svgFileFor(stem)));

  it.each(stems)('%s.svg uses only grayscale or outline colors', (stem) => {
    const svg = fs.readFileSync(svgFileFor(stem), 'utf-8');
    for (const match of svg.matchAll(HEX_COLOR)) {
      const hex = match[1].toLowerCase();
      const ok = isGray(hex) || ALLOWED_NON_GRAY.has(hex);
      expect(ok, `${stem}.svg uses non-grayscale color ${hex}`).toBe(true);
    }
  });

  it('covers every stem (no silently skipped files)', () => {
    expect(stems.length).toBe(allAttackArtStems(HERO_DEFINITIONS).length);
  });
});
