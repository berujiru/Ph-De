import type { CSSProperties } from 'react';
import { theme } from '../theme';
import { type EnemyDefinition, type EnemyId } from '../../game/data/enemies';
import type { HeroSkin } from '../../game/data/skins';

/**
 * Shared "Movement Archive" card language — the portrait/tier helpers the
 * TCG cards build on. Extracted from InventoryScreen so any screen (Archive,
 * Briefing Room, …) shows heroes/enemies with the same visual DNA.
 */

export const TYPEWRITER_FONT = '"Oswald", "Courier New", Courier, monospace';
export const HERO_PLACEHOLDER_SRC = '/assets/heroes/hero-placeholder.svg';

/** Photo-studio backdrop so the dark hero silhouette reads as a portrait. */
export const PORTRAIT_BG = 'radial-gradient(circle at 50% 34%, rgba(234,88,12,0.15) 0%, #1c1917 50%, #0c0a09 100%)';
// eslint-disable-next-line react-refresh/only-export-components
export const hexColor = (color: number) => `#${color.toString(16).padStart(6, '0')}`;

/**
 * A hero portrait referencing the standalone high-res portrait file 
 * (e.g. eden_portrait.png) for UI showcases. Renders the silhouette 
 * placeholder when `skin` is undefined (hero has no art yet) or if 
 * the portrait asset fails to load.
 */
export function SkinPortrait({
  skin,
  alt = '',
  style,
}: {
  skin?: HeroSkin;
  alt?: string;
  /** Size/border overrides — defaults fill the parent box. */
  style?: CSSProperties;
}) {
  if (!skin) {
    return (
      <img
        src={HERO_PLACEHOLDER_SRC}
        alt={alt}
        style={{ width: '92%', height: '92%', objectFit: 'contain', ...style }}
      />
    );
  }
  return (
    <img
      src={`/assets/heroes/${skin.heroId}_portrait.png`}
      alt={alt}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        ...style,
      }}
      onError={(e) => {
        // Fallback if portrait asset is missing
        (e.target as HTMLImageElement).src = HERO_PLACEHOLDER_SRC;
      }}
    />
  );
}

// ---- Enemy tiering + data-driven "lie debunked" blurbs ---------------------

const MINI_BOSS_IDS = new Set<EnemyId>([
  'ghost_employee', 'bribery', 'epal', 'the_overpriced', 'kickback_courier',
  'shell_company', 'crony_bodyguard', 'hoarder', 'land_grabber', 'tender_rigger', 'red_tape',
]);

export type EnemyTier = 'Minion' | 'Mini-Boss' | 'Boss';
// eslint-disable-next-line react-refresh/only-export-components
export function enemyTier(def: EnemyDefinition): EnemyTier {
  if (def.id.startsWith('boss_')) return 'Boss';
  if (MINI_BOSS_IDS.has(def.id)) return 'Mini-Boss';
  return 'Minion';
}
// eslint-disable-next-line react-refresh/only-export-components
export const TIER_COLOR: Record<EnemyTier, string> = {
  Minion: theme.colors.textMuted,
  'Mini-Boss': theme.colors.accent,
  Boss: theme.colors.danger,
};

/** Derive the mechanic blurb from the enemy's data flags — no hardcoded table. */
// eslint-disable-next-line react-refresh/only-export-components
export function enemyMechanic(def: EnemyDefinition): string {
  if (def.activeSkill) return `Boss skill — ${def.activeSkill.name}.`;
  if (def.stealth) return 'Untargetable until revealed or splashed.';
  if (def.moraleAura) return 'Buffs nearby anomalies with a morale aura.';
  if (def.fakeHpPadding) return 'Padded with fake HP — popped by an Audit.';
  if (def.splitOnDeathCount) return `Shatters into ${def.splitOnDeathCount} on death.`;
  if (def.tauntAura) return 'Redirects your projectiles onto itself.';
  if (def.dropObstacleOnDeath) return 'Drops a barricade blocking your shots on death.';
  if (def.barrierDamageMultiplier) return `Tears through barricades ${def.barrierDamageMultiplier}× faster.`;
  if (def.knockbackPulseCooldown) return 'Shoves your frontline back down the path.';
  if (def.hitImmunityCount) return `Shrugs off its first ${def.hitImmunityCount} hits.`;
  if (def.stealVoicesPerSecond) return 'Drains your Voices while it lives.';
  if (def.maxHp >= 140 && def.speed <= 45) return 'A slow, bloated tank of a lie.';
  if (def.speed >= 100) return 'Fast — rushes the Barrier before you can react.';
  return 'Swarms in raw numbers to drown out the rally.';
}
