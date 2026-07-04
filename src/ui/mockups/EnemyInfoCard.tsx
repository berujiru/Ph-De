import type { CSSProperties } from 'react';
import { theme } from '../theme';
import { CloseIcon, InfoIcon, damageTypeIcons } from '../icons';
import { battleCss, glass, glassPanel, withAlpha } from './battleStyles';

export type EnemyTier = 'Minion' | 'Mini-Boss' | 'Boss';

/**
 * All props are optional with mock defaults so the current zero-arg usage
 * (`<EnemyInfoCard />`) keeps working while callers migrate to real data.
 */
export interface EnemyInfoCardProps {
  name?: string;
  tier?: EnemyTier;
  /** Damage type ids (damageTypeIcons keys) this enemy takes bonus damage from. */
  weakTo?: string[];
  /** Damage type ids this enemy resists. */
  resists?: string[];
  /** One-line behavior blurb ("what it does to your rally"). */
  behavior?: string;
  onClose?: () => void;
}

const TIER_COLOR: Record<EnemyTier, string> = {
  Minion: theme.colors.textMuted,
  'Mini-Boss': theme.colors.accent,
  Boss: theme.colors.danger,
};

function TypeChip({ type, color }: { type: string; color: string }) {
  const Icon = damageTypeIcons[type] ?? InfoIcon;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '3px 8px',
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 700,
        color,
        backgroundColor: withAlpha(color === theme.colors.textMuted ? theme.colors.background : color, 0.15),
        border: `1px solid ${withAlpha(color === theme.colors.textMuted ? theme.colors.background : color, 0.4)}`,
      }}
    >
      <Icon size={12} />
      {type}
    </span>
  );
}

const rowLabel: CSSProperties = {
  fontSize: 9,
  fontWeight: 800,
  letterSpacing: 1.5,
  textTransform: 'uppercase',
  color: theme.colors.textMuted,
  width: 62,
  flexShrink: 0,
  paddingTop: 4,
};

export function EnemyInfoCard({
  name = 'Troll Bot',
  tier = 'Minion',
  weakTo = ['Frost', 'Lightning'],
  resists = ['Physical'],
  behavior = 'Rushes the frontline and spams noise to drown out the rally.',
  onClose,
}: EnemyInfoCardProps) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'flex-end',
        padding: 16,
      }}
    >
      <style>{battleCss}</style>

      {/* Cardboard placard / manifesto card */}
      <div
        style={{
          ...glassPanel,
          position: 'relative',
          width: 'min(260px, 78vw)',
          padding: '18px 14px 14px',
          marginTop: 8,
          pointerEvents: 'auto',
          color: theme.colors.textPrimary,
          transform: 'rotate(-1.2deg)',
          boxShadow: `0 10px 24px ${withAlpha(theme.colors.background, 0.7)}`,
          animation: 'placard-drop 0.3s ease both',
        }}
      >
        {/* Tape strip pinning the placard */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: -8,
            left: '50%',
            width: 72,
            height: 16,
            transform: 'translateX(-50%) rotate(-4deg)',
            backgroundColor: withAlpha(theme.colors.textPrimary, 0.22),
            borderRadius: 2,
          }}
        />

        {/* Header: stencil name + tier tag + close */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3
              style={{
                margin: 0,
                fontSize: 17,
                fontWeight: 900,
                letterSpacing: 1.5,
                textTransform: 'uppercase',
                lineHeight: 1.2,
              }}
            >
              {name}
            </h3>
            <span
              style={{
                display: 'inline-block',
                marginTop: 4,
                padding: '2px 8px',
                borderRadius: 6,
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: 1,
                textTransform: 'uppercase',
                color: TIER_COLOR[tier],
                border: `1px solid ${withAlpha(TIER_COLOR[tier] === theme.colors.textMuted ? theme.colors.background : TIER_COLOR[tier], 0.5)}`,
                backgroundColor: withAlpha(theme.colors.background, 0.45),
              }}
            >
              {tier}
            </span>
          </div>
          {onClose && (
            <button
              type="button"
              className="hud-btn"
              onClick={onClose}
              aria-label="Close enemy info"
              title="Close"
              style={{
                width: 44,
                height: 44,
                marginTop: -8,
                marginRight: -6,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                border: 'none',
                borderRadius: 10,
                color: theme.colors.textMuted,
                cursor: 'pointer',
              }}
            >
              <CloseIcon size={18} />
            </button>
          )}
        </div>

        {/* Caution-tape style divider (subtle, neutral) */}
        <div
          aria-hidden="true"
          style={{
            height: 3,
            margin: '10px 0',
            background: `repeating-linear-gradient(45deg, ${withAlpha(theme.colors.textPrimary, 0.18)} 0px, ${withAlpha(theme.colors.textPrimary, 0.18)} 6px, transparent 6px, transparent 12px)`,
          }}
        />

        {/* Weak to / resists */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={rowLabel}>Weak to</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {weakTo.length > 0 ? (
                weakTo.map((type) => <TypeChip key={type} type={type} color={theme.colors.success} />)
              ) : (
                <span style={{ fontSize: 11, color: theme.colors.textMuted, paddingTop: 4 }}>None known</span>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={rowLabel}>Resists</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {resists.length > 0 ? (
                resists.map((type) => <TypeChip key={type} type={type} color={theme.colors.danger} />)
              ) : (
                <span style={{ fontSize: 11, color: theme.colors.textMuted, paddingTop: 4 }}>None</span>
              )}
            </div>
          </div>
        </div>

        {/* Behavior blurb — manifesto footnote */}
        <p
          style={{
            margin: '12px 0 0',
            paddingTop: 8,
            borderTop: `1px solid ${glass.border}`,
            fontSize: 12,
            lineHeight: 1.5,
            fontStyle: 'italic',
            color: theme.colors.textMuted,
          }}
        >
          "{behavior}"
        </p>
      </div>
    </div>
  );
}
