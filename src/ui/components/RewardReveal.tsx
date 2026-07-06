import type { ReactNode } from 'react';
import { theme } from '../theme';
import { MegaphoneIcon, StarIcon, StarOutlineIcon } from '../icons';
import type { DropRarity } from '../../game/core/GameEvents';

export interface RevealReward {
  id: string;
  title: string;
  subtitle?: string;
  rarity?: DropRarity;
  /** Hero portrait src (drop-card face). Takes priority over `icon`. */
  portraitSrc?: string;
  /** Icon face for non-hero rewards (card packs, permits, cosmetics). */
  icon?: ReactNode;
}

interface RewardRevealProps {
  heading: string;
  rewards: RevealReward[];
  onClose: () => void;
  closeLabel?: string;
}

const RARITY_STARS: Record<DropRarity, number> = { common: 1, rare: 2, epic: 3 };

const RARITY_FRAME: Record<DropRarity, { border: string; glow: string }> = {
  common: { border: theme.colors.borderGlass, glow: 'rgba(148,163,184,0.25)' },
  rare: { border: 'rgba(56, 189, 248, 0.6)', glow: 'rgba(56, 189, 248, 0.45)' },
  epic: { border: theme.colors.accent, glow: 'rgba(56, 189, 248, 0.75)' },
};

function RarityStars({ rarity }: { rarity: DropRarity }) {
  const count = RARITY_STARS[rarity];
  return (
    <span style={{ display: 'inline-flex', gap: 2, color: theme.colors.accent }}>
      {[0, 1, 2].map((i) => (i < count ? <StarIcon key={i} size={13} /> : <StarOutlineIcon key={i} size={13} />))}
    </span>
  );
}

/**
 * Shared reward-reveal overlay. One satisfying card-flip reveal reused by hero
 * unlocks and Sari-Sari Store card/pack purchases so both feel identical.
 */
export function RewardReveal({ heading, rewards, onClose, closeLabel = 'Collect' }: RewardRevealProps) {
  return (
    <div
      className="reward-reveal"
      role="dialog"
      aria-modal="true"
      aria-label={heading}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 500,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 18,
        padding: 16,
        backgroundColor: 'rgba(9, 12, 22, 0.86)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        animation: 'reward-overlay-in 0.2s ease both',
      }}
    >
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <span style={{ color: theme.colors.accent, display: 'flex' }}>
          <MegaphoneIcon size={30} />
        </span>
        <h1
          style={{
            margin: 0,
            fontSize: 'clamp(18px, 5vw, 24px)',
            fontWeight: 900,
            letterSpacing: 1,
            textTransform: 'uppercase',
            color: theme.colors.textPrimary,
            textShadow: `0 0 20px rgba(56, 189, 248, 0.5)`,
          }}
        >
          {heading}
        </h1>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', maxWidth: 720 }}>
        {rewards.map((reward, index) => {
          const rarity = reward.rarity ?? 'common';
          const frame = RARITY_FRAME[rarity];
          return (
            <div
              key={reward.id}
              className="reward-card"
              style={{
                position: 'relative',
                width: 'min(120px, 28vw)',
                minHeight: 140,
                padding: '10px 8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                textAlign: 'center',
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                border: `${rarity === 'epic' ? 2 : 1}px solid ${frame.border}`,
                borderRadius: 10,
                boxShadow: `0 0 26px ${frame.glow}`,
                animationDelay: `${index * 140}ms`,
              }}
            >
              {/* radial burst behind the face */}
              <span
                aria-hidden="true"
                className="reward-burst"
                style={{
                  position: 'absolute',
                  top: '42%',
                  left: '50%',
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${frame.glow} 0%, transparent 70%)`,
                  animation: `reward-burst 0.7s ease-out ${index * 140 + 180}ms both`,
                  pointerEvents: 'none',
                }}
              />
              <RarityStars rarity={rarity} />
              <div
                style={{
                  width: 64,
                  height: 64,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 8,
                  backgroundColor: 'rgba(56, 189, 248, 0.08)',
                  border: `1px solid ${theme.colors.borderGlass}`,
                  color: theme.colors.accent,
                  position: 'relative',
                }}
              >
                {reward.portraitSrc ? (
                  <img
                    src={reward.portraitSrc}
                    alt=""
                    style={{ width: '86%', height: '86%', objectFit: 'contain' }}
                  />
                ) : (
                  reward.icon
                )}
              </div>
              <span style={{ fontSize: 11, fontWeight: 800, color: theme.colors.textPrimary, lineHeight: 1.2 }}>
                {reward.title}
              </span>
              {reward.subtitle && (
                <span style={{ fontSize: 9, color: theme.colors.textMuted, lineHeight: 1.3 }}>{reward.subtitle}</span>
              )}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onClose}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          minHeight: 44,
          padding: '10px 32px',
          borderRadius: 999,
          border: 'none',
          backgroundColor: theme.colors.accent,
          color: theme.colors.background,
          fontSize: 14,
          fontWeight: 900,
          letterSpacing: 1,
          textTransform: 'uppercase',
          cursor: 'pointer',
          fontFamily: 'inherit',
          boxShadow: `0 0 24px rgba(56, 189, 248, 0.5)`,
        }}
      >
        <MegaphoneIcon size={20} />
        {closeLabel}
      </button>
    </div>
  );
}
