import { useEffect, useReducer } from 'react';
import { theme } from '../theme';
import { HopeCoinIcon, RallyPermitIcon, LockIcon, CheckIcon } from '../icons';
import { BackButton } from '../components/BackButton';
import { Embers } from '../components/ApocalypseScenery';
import { TYPEWRITER_FONT } from '../components/ArchiveCards';
import {
  getHope,
  getPermits,
  isAchievementUnlocked,
  subscribeMetaState,
} from '../../game/data/metaState';
import {
  ACHIEVEMENTS,
  ACHIEVEMENT_CATEGORIES,
  type AchievementDef,
} from '../../game/data/achievements';

interface AchievementsScreenProps {
  onBack: () => void;
}

export function AchievementsScreen({ onBack }: AchievementsScreenProps) {
  // Re-render as achievements unlock / currency changes.
  const [, forceUpdate] = useReducer((n: number) => n + 1, 0);
  useEffect(() => subscribeMetaState(forceUpdate), []);

  const currentHope = getHope();
  const currentPermits = getPermits();
  const unlockedCount = ACHIEVEMENTS.filter((a) => isAchievementUnlocked(a.id)).length;

  return (
    <div
      className="rally-screen"
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: theme.materials.corkDark,
        backgroundImage: `
          radial-gradient(ellipse at 15% 0%, rgba(0,0,0,0.6) 0%, transparent 45%),
          radial-gradient(ellipse at 85% 100%, rgba(0,0,0,0.55) 0%, transparent 50%),
          radial-gradient(${theme.materials.charredWall} 10%, transparent 11%),
          radial-gradient(${theme.materials.charredWall} 10%, transparent 11%)
        `,
        backgroundSize: '100% 100%, 100% 100%, 20px 20px, 20px 20px',
        backgroundPosition: '0 0, 0 0, 0 0, 10px 10px',
        display: 'flex',
        flexDirection: 'column',
        padding: 'clamp(12px, 3vw, 24px)',
        color: theme.colors.textPrimary,
        overflowY: 'auto',
        boxShadow: 'inset 0 0 140px rgba(0,0,0,0.95)',
      }}
    >
      <Embers count={7} />

      {/* Header / nav */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 16,
          position: 'relative',
          zIndex: 10,
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div style={{ marginBottom: 15 }}>
            <BackButton onClick={onBack} label="Back to Menu" tone="cork" />
          </div>

          {/* Taped sign title */}
          <div
            style={{
              backgroundColor: '#44403c',
              color: theme.colors.textPrimary,
              padding: '10px clamp(14px, 5vw, 30px)',
              transform: 'rotate(-2deg)',
              boxShadow: '2px 4px 10px rgba(0,0,0,0.6)',
              display: 'inline-block',
              position: 'relative',
              maxWidth: '100%',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: -10,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 40,
                height: 15,
                backgroundColor: theme.materials.tape,
                boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
              }}
            />
            <h1
              style={{
                margin: 0,
                fontSize: 'clamp(20px, 6vw, 32px)',
                fontFamily: TYPEWRITER_FONT,
                fontWeight: 900,
                textTransform: 'uppercase',
                lineHeight: 1.1,
              }}
            >
              Hall of Deeds
            </h1>
            <span style={{ fontSize: 11, color: theme.colors.textMuted, fontWeight: 700, letterSpacing: 1 }}>
              {unlockedCount} / {ACHIEVEMENTS.length} earned
            </span>
          </div>
        </div>

        {/* Currency card */}
        <div
          style={{
            backgroundColor: '#292524',
            padding: '15px 25px',
            borderRadius: 4,
            boxShadow: '2px 4px 15px rgba(0,0,0,0.6)',
            transform: 'rotate(1deg)',
            display: 'flex',
            gap: 30,
            position: 'relative',
            border: `1px solid ${theme.colors.border}`,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 5,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 12,
              height: 12,
              backgroundColor: '#78716c',
              borderRadius: '50%',
              boxShadow: 'inset -2px -2px 4px rgba(0,0,0,0.5), 2px 2px 5px rgba(0,0,0,0.7)',
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: theme.colors.gold, display: 'flex' }}><HopeCoinIcon size={22} /></span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 12, color: theme.colors.textMuted, fontWeight: 'bold' }}>HOPE POINTS</span>
              <span style={{ fontSize: 20, color: theme.colors.textPrimary, fontWeight: 900 }}>{currentHope}</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: theme.colors.textSecondary, display: 'flex' }}><RallyPermitIcon size={22} /></span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 12, color: theme.colors.textMuted, fontWeight: 'bold' }}>RALLY PERMITS</span>
              <span style={{ fontSize: 20, color: theme.colors.textPrimary, fontWeight: 900 }}>{currentPermits}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, position: 'relative', zIndex: 10 }}>
        {ACHIEVEMENT_CATEGORIES.map((cat) => {
          const items = ACHIEVEMENTS.filter((a) => a.category === cat.id);
          if (items.length === 0) return null;
          const done = items.filter((a) => isAchievementUnlocked(a.id)).length;
          return (
            <section key={cat.id}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 10 }}>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 15,
                    fontFamily: TYPEWRITER_FONT,
                    fontWeight: 900,
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    color: theme.colors.textSecondary,
                  }}
                >
                  {cat.label}
                </h2>
                <span style={{ fontSize: 11, color: theme.colors.textMuted, fontWeight: 700 }}>
                  {done}/{items.length}
                </span>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                  gap: 10,
                }}
              >
                {items.map((a) => (
                  <AchievementRow key={a.id} def={a} unlocked={isAchievementUnlocked(a.id)} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function AchievementRow({ def, unlocked }: { def: AchievementDef; unlocked: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 12px',
        borderRadius: 8,
        backgroundColor: unlocked ? 'rgba(41, 37, 34, 0.95)' : 'rgba(20, 18, 16, 0.9)',
        border: `1px solid ${unlocked ? theme.materials.rust : theme.colors.borderGlass}`,
        boxShadow: unlocked ? `inset 0 0 16px ${theme.materials.corruptionEmber}` : 'none',
        opacity: unlocked ? 1 : 0.72,
      }}
    >
      {/* Emblem */}
      <div
        aria-hidden="true"
        style={{
          position: 'relative',
          flexShrink: 0,
          width: 44,
          height: 44,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
          borderRadius: 8,
          backgroundColor: unlocked ? 'rgba(234, 88, 12, 0.12)' : 'rgba(0,0,0,0.35)',
          border: `1px solid ${unlocked ? theme.colors.accent : theme.colors.border}`,
          filter: unlocked ? 'none' : 'grayscale(100%)',
        }}
      >
        <span style={{ opacity: unlocked ? 1 : 0.45 }}>{def.icon}</span>
        {!unlocked && (
          <span
            style={{
              position: 'absolute',
              bottom: -4,
              right: -4,
              width: 18,
              height: 18,
              borderRadius: '50%',
              backgroundColor: '#1c1917',
              border: `1px solid ${theme.colors.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.colors.textMuted,
            }}
          >
            <LockIcon size={10} />
          </span>
        )}
        {unlocked && (
          <span
            style={{
              position: 'absolute',
              bottom: -4,
              right: -4,
              width: 18,
              height: 18,
              borderRadius: '50%',
              backgroundColor: theme.colors.success,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
            }}
          >
            <CheckIcon size={11} />
          </span>
        )}
      </div>

      {/* Text */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, flex: 1 }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: theme.colors.textPrimary, lineHeight: 1.15 }}>
          {def.title}
        </span>
        <span style={{ fontSize: 11, color: theme.colors.textMuted, lineHeight: 1.25 }}>
          {def.description}
        </span>
        <div style={{ display: 'flex', gap: 12, marginTop: 3 }}>
          {def.reward.permits != null && def.reward.permits > 0 && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 800, color: theme.colors.textSecondary }}>
              <RallyPermitIcon size={13} /> +{def.reward.permits}
            </span>
          )}
          {def.reward.hope != null && def.reward.hope > 0 && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 800, color: theme.colors.gold }}>
              <HopeCoinIcon size={13} /> +{def.reward.hope}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
