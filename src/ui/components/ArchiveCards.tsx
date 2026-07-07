import type { ReactNode } from 'react';
import { theme } from '../theme';
import { LockIcon, SkullIcon } from '../icons';
import type { EnemyDefinition, EnemyId } from '../../game/data/balance';

/**
 * Shared "Movement Archive" card language — the pinned polaroid hero card and
 * the manila enemy case file. Extracted from InventoryScreen so any screen
 * (Archive, Briefing Room, …) shows heroes/enemies with the same visual DNA.
 */

export const TYPEWRITER_FONT = '"Courier New", Courier, monospace';
export const HERO_PLACEHOLDER_SRC = '/assets/heroes/hero-placeholder.svg';

/** Photo-studio backdrop so the dark hero silhouette reads as a portrait. */
export const PORTRAIT_BG = 'radial-gradient(circle at 50% 34%, #e2e8f0 0%, #94a3b8 52%, #475569 100%)';
export const PORTRAIT_BG_LOCKED = 'radial-gradient(circle at 50% 34%, #64748b 0%, #334155 55%, #1e293b 100%)';

export const hexColor = (color: number) => `#${color.toString(16).padStart(6, '0')}`;

// ---- Enemy tiering + data-driven "lie debunked" blurbs ---------------------

const MINI_BOSS_IDS = new Set<EnemyId>([
  'ghost_employee', 'illegal_logger', 'epal', 'the_overpriced', 'kickback_courier',
  'shell_company', 'crony_bodyguard', 'hoarder', 'land_grabber', 'tender_rigger',
]);

export type EnemyTier = 'Minion' | 'Mini-Boss' | 'Boss';

export function enemyTier(def: EnemyDefinition): EnemyTier {
  if (def.id.startsWith('boss_')) return 'Boss';
  if (MINI_BOSS_IDS.has(def.id)) return 'Mini-Boss';
  return 'Minion';
}

export const TIER_COLOR: Record<EnemyTier, string> = {
  Minion: theme.colors.textMuted,
  'Mini-Boss': theme.colors.accent,
  Boss: theme.colors.danger,
};

/** Derive the mechanic blurb from the enemy's data flags — no hardcoded table. */
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

// ---- Hero polaroid card ----------------------------------------------------

export interface HeroPolaroidCardProps {
  name: string;
  /** Small line under the name (profession, or a locked teaser). */
  subtitle?: string;
  unlocked?: boolean;
  /** Shows the yellow LVL badge on the photo when provided. */
  level?: number;
  /** Stable tilt in degrees. */
  rotation?: number;
  onClick?: () => void;
  /** Extra content under the divider (damage chip, cards pill, counters…). */
  children?: ReactNode;
}

/** The pinned-polaroid hero card from the Movement Archive. */
export function HeroPolaroidCard({
  name,
  subtitle,
  unlocked = true,
  level,
  rotation = 0,
  onClick,
  children,
}: HeroPolaroidCardProps) {
  const interactive = unlocked && !!onClick;
  return (
    <div
      onClick={() => interactive && onClick!()}
      style={{
        backgroundColor: '#f8fafc',
        padding: '5px 5px 10px 5px', // Extra padding at bottom for polaroid look
        boxShadow: '2px 5px 15px rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        filter: unlocked ? 'none' : 'grayscale(100%)',
        opacity: unlocked ? 1 : 0.7,
        cursor: interactive ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s',
        position: 'relative',
        transform: `rotate(${rotation}deg)`,
        zIndex: 1,
      }}
      onMouseOver={(e) => {
        if (interactive) {
          e.currentTarget.style.transform = 'scale(1.1) rotate(0deg)';
          e.currentTarget.style.zIndex = '10';
          e.currentTarget.style.boxShadow = '5px 15px 25px rgba(0,0,0,0.6)';
        }
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = `scale(1) rotate(${rotation}deg)`;
        e.currentTarget.style.zIndex = '1';
        e.currentTarget.style.boxShadow = '2px 5px 15px rgba(0,0,0,0.5)';
      }}
    >
      {/* Push Pin */}
      <div
        style={{
          position: 'absolute',
          top: '-5px',
          width: '10px',
          height: '10px',
          backgroundColor: rotation >= 0 ? '#ef4444' : '#3b82f6',
          borderRadius: '50%',
          boxShadow: 'inset -2px -2px 3px rgba(0,0,0,0.3), 1px 2px 3px rgba(0,0,0,0.5)',
          zIndex: 2,
        }}
      />

      {/* Photo Area */}
      <div
        style={{
          width: '100%',
          aspectRatio: '1',
          background: unlocked ? PORTRAIT_BG : PORTRAIT_BG_LOCKED,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-end',
          border: '1px solid #e2e8f0',
          marginBottom: '5px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <img
          src={HERO_PLACEHOLDER_SRC}
          alt={unlocked ? name : 'Locked hero silhouette'}
          style={{
            width: '92%',
            height: '92%',
            objectFit: 'contain',
            filter: unlocked ? 'none' : 'brightness(0)',
          }}
        />
        {!unlocked && (
          <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#94a3b8', display: 'flex' }}>
            <LockIcon size={22} />
          </span>
        )}

        {unlocked && level !== undefined && (
          <div
            style={{
              position: 'absolute',
              bottom: '5px',
              right: '5px',
              backgroundColor: theme.materials.cautionYellow,
              color: '#000',
              fontWeight: '900',
              padding: '2px 5px',
              fontSize: '10px',
              border: '1px solid #000',
              transform: 'rotate(-5deg)',
            }}
          >
            LVL {level}
          </div>
        )}
      </div>

      {/* Text Area */}
      <div style={{ width: '100%', textAlign: 'center' }}>
        <h3 style={{ margin: '0 0 3px 0', fontSize: '9.5px', color: '#0f172a', fontFamily: '"Marker Felt", "Comic Sans MS", fantasy', lineHeight: 1.1 }}>
          {unlocked ? name : 'REDACTED'}
        </h3>
        {subtitle && (
          <div style={{ fontSize: '7.5px', color: '#475569', fontWeight: 'bold', marginBottom: '4px', fontStyle: unlocked ? 'normal' : 'italic', lineHeight: 1.2 }}>
            {subtitle}
          </div>
        )}

        {unlocked && children && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', borderTop: '1px dashed #cbd5e1', paddingTop: '4px' }}>
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Enemy case-file card ---------------------------------------------------

export interface EnemyCaseCardProps {
  name: string;
  /** Mugshot tint — a `#rrggbb` string (use hexColor() for numeric colors). */
  colorHex?: string;
  /** Small tag above the name (tier, headcount…). */
  tag?: { label: string; color: string };
  /** Sealed files render the redacted "?" treatment. */
  faced?: boolean;
  rotation?: number;
  onClick?: () => void;
  ariaLabel?: string;
  /** Extra content under the name (weakness chip, tap hint, SEALED row…). */
  children?: ReactNode;
}

/** The pinned manila case-file card from the Truth Codex. */
export function EnemyCaseCard({
  name,
  colorHex,
  tag,
  faced = true,
  rotation = 0,
  onClick,
  ariaLabel,
  children,
}: EnemyCaseCardProps) {
  const interactive = faced && !!onClick;
  return (
    <div
      onClick={() => interactive && onClick!()}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={interactive ? ariaLabel ?? `Open case file: ${name}` : undefined}
      onKeyDown={(e) => {
        if (interactive && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick!();
        }
      }}
      style={{
        backgroundColor: faced ? '#e5d5b5' : '#4b5563',
        color: '#1c1917',
        borderRadius: 4,
        padding: '6px 5px 8px',
        position: 'relative',
        transform: `rotate(${rotation}deg)`,
        boxShadow: '2px 6px 16px rgba(0,0,0,0.5)',
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(0,0,0,0.03) 20px, rgba(0,0,0,0.03) 21px)',
        cursor: interactive ? 'pointer' : 'default',
        transition: 'transform 0.15s, box-shadow 0.15s',
      }}
      onMouseOver={(e) => {
        if (interactive) {
          e.currentTarget.style.transform = 'rotate(0deg) scale(1.04)';
          e.currentTarget.style.boxShadow = '4px 10px 22px rgba(0,0,0,0.6)';
        }
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = `rotate(${rotation}deg)`;
        e.currentTarget.style.boxShadow = '2px 6px 16px rgba(0,0,0,0.5)';
      }}
    >
      {/* Pin */}
      <div
        style={{
          position: 'absolute', top: -6, left: '50%', transform: 'translateX(-50%)',
          width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ef4444',
          boxShadow: 'inset -2px -2px 4px rgba(0,0,0,0.3), 1px 2px 4px rgba(0,0,0,0.5)',
        }}
      />

      {/* Mugshot */}
      <div
        style={{
          width: '100%', height: 36, borderRadius: 3, marginBottom: 6,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: faced && colorHex
            ? `radial-gradient(circle at 50% 40%, ${colorHex} 0%, #1e293b 78%)`
            : 'radial-gradient(circle at 50% 40%, #334155 0%, #1e293b 80%)',
          border: '2px solid rgba(0,0,0,0.35)',
        }}
      >
        {faced ? (
          <span style={{ color: '#e2e8f0', display: 'flex' }}><SkullIcon size={22} /></span>
        ) : (
          <span style={{ fontFamily: TYPEWRITER_FONT, fontSize: 24, fontWeight: 900, color: '#94a3b8' }}>?</span>
        )}
      </div>

      {/* Tag (tier / headcount) */}
      {tag && (
        <span
          style={{
            display: 'inline-block', fontSize: 7, fontWeight: 900, letterSpacing: 0.5,
            textTransform: 'uppercase', padding: '2px 5px', borderRadius: 4, marginBottom: 3,
            color: '#fff', backgroundColor: tag.color,
          }}
        >
          {tag.label}
        </span>
      )}

      <h3 style={{ margin: '0 0 2px 0', fontSize: 9, fontWeight: 900, textTransform: 'uppercase', fontFamily: TYPEWRITER_FONT, lineHeight: 1.1 }}>
        {faced ? name : '██████'}
      </h3>

      {children}
    </div>
  );
}
