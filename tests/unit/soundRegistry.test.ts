import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  AUDIO_MANIFEST,
  SFX,
  bossThemeForAct,
  enemyDeathSfx,
  enemyHitSfx,
  heroAttackSfx,
  heroVoice,
} from '../../src/game/data/soundRegistry';
import { HERO_DEFINITIONS, type HeroId } from '../../src/game/data/heroes';

/**
 * The sound registry is the audio "tracking spine": every key must resolve, and
 * every file listed in the manifest must actually exist on disk (a missing file
 * would 404 at preload). Resolvers must always return a usable fallback so the
 * game is never silent for an entity whose bespoke clip isn't authored yet.
 */

const PUBLIC_DIR = path.resolve(__dirname, '../../public');

describe('audio manifest', () => {
  it('points every manifest key at a file that exists', () => {
    for (const [key, url] of Object.entries(AUDIO_MANIFEST)) {
      const file = path.join(PUBLIC_DIR, url);
      expect(fs.existsSync(file), `manifest key "${key}" -> missing file ${url}`).toBe(true);
    }
  });

  it('preloads the core combat + UI SFX', () => {
    for (const key of [SFX.btnPress, SFX.shoot, SFX.enemyHit, SFX.enemyDie, SFX.victory, SFX.defeat]) {
      expect(AUDIO_MANIFEST[key], `core key "${key}" should be in the manifest`).toBeTruthy();
    }
  });
});

describe('sound resolvers', () => {
  it('falls back to the generic shoot cue for a hero without a bespoke attack clip', () => {
    expect(heroAttackSfx('eden')).toBe(SFX.shoot);
  });

  it('resolves an attack cue for every recruitable hero', () => {
    for (const id of Object.keys(HERO_DEFINITIONS) as HeroId[]) {
      expect(heroAttackSfx(id)).toBeTruthy();
    }
  });

  it('gives each of the 20 heroes a voice-line key for Milestone 3', () => {
    const voiced = (Object.keys(HERO_DEFINITIONS) as HeroId[]).filter((id) => !id.startsWith('sandbox_'));
    for (const id of voiced) {
      expect(heroVoice(id), `hero "${id}" should have a voice key`).toBeTruthy();
    }
  });

  it('falls back to generic hit/death cues for minions', () => {
    expect(enemyHitSfx('grunt')).toBe(SFX.enemyHit);
    expect(enemyDeathSfx('grunt')).toBe(SFX.enemyDie);
  });

  it('maps each act to a boss theme and defaults otherwise', () => {
    expect(bossThemeForAct(5)).toBeTruthy();
    expect(bossThemeForAct(null)).toBeTruthy();
    expect(bossThemeForAct(999)).toBe(bossThemeForAct(null));
  });
});
