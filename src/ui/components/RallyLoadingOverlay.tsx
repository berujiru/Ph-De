import { useState, useEffect, useRef } from 'react';
import { theme } from '../theme';
import { MegaphoneIcon, RaisedFistIcon } from '../icons';
import { gameToUiEvents } from '../../game/core/GameEvents';

interface RallyLoadingOverlayProps {
  /** Called once assets are loaded and the scene is built — safe to reveal the game. */
  onReady: () => void;
}

const RALLY_TIPS = [
  'Adjacent heroes buff each other — Bayanihan!',
  'Kills fill the Voices meter. A full meter means a new drop.',
  'Hope is earned win or lose — a failed defense still wakes people up.',
  'Match your squad\'s damage types to the stage\'s telegraphed weaknesses.',
  'Melee workers brawl at the frontline; ranged workers fire from behind.',
  'Each rally costs a permit — make it count!',
  'Boss stages have tougher anomalies. Watch the intel!',
];

/**
 * Full-screen overlay shown while Phaser loads assets for a rally.
 * Driven by real `loadProgress` / `sceneReady` events from GameScene.
 * Fades out once everything is ready, then tells the parent via onReady().
 */
export function RallyLoadingOverlay({ onReady }: RallyLoadingOverlayProps) {
  const [progress, setProgress] = useState(0);
  const [sceneReady, setSceneReady] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  // Pick a random tip on mount so we don't always start at the same one.
  const [tipIndex] = useState(() => Math.floor(Math.random() * RALLY_TIPS.length));

  useEffect(() => {
    const unsubProgress = gameToUiEvents.on('loadProgress', ({ progress: p }) => {
      setProgress(Math.round(p * 100));
    });
    const unsubReady = gameToUiEvents.on('sceneReady', () => {
      setSceneReady(true);
    });

    return () => {
      unsubProgress();
      unsubReady();
    };
  }, []);

  // When both conditions are met, start fade-out.
  useEffect(() => {
    if (sceneReady && progress >= 100 && !fadingOut) {
      // Small pause so the "100% — Handa na!" text is visible.
      const t = setTimeout(() => setFadingOut(true), 400);
      return () => clearTimeout(t);
    }
  }, [sceneReady, progress, fadingOut]);

  // After fade animation, notify parent.
  useEffect(() => {
    if (fadingOut) {
      const t = setTimeout(() => onReadyRef.current(), 350);
      return () => clearTimeout(t);
    }
  }, [fadingOut]);

  const clamped = Math.min(progress, 100);
  // Cycle tips based on progress so the player sees multiple during a slow load.
  const tip = RALLY_TIPS[(tipIndex + Math.floor(clamped / 25)) % RALLY_TIPS.length];

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: theme.colors.background,
        background: `radial-gradient(ellipse 120% 80% at 50% 110%, ${theme.materials.corruptionEmber}, transparent 60%), ${theme.colors.background}`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        color: theme.colors.textPrimary,
        zIndex: 999,
        overflow: 'hidden',
        opacity: fadingOut ? 0 : 1,
        transition: 'opacity 0.35s ease-out',
        pointerEvents: fadingOut ? 'none' : 'auto',
      }}
    >
      <style>{`
        @keyframes rally-megaphone-pulse {
          0%, 100% { transform: scale(1) rotate(-8deg); filter: drop-shadow(0 0 6px ${theme.colors.accent}); }
          50% { transform: scale(1.08) rotate(-8deg); filter: drop-shadow(0 0 14px ${theme.colors.accent}); }
        }
        @keyframes rally-ripple-out {
          0%   { transform: translate(-50%, -50%) scale(0.1); opacity: 0.65; box-shadow: 0 0 8px ${theme.colors.accent}; }
          50%  { opacity: 0.20; box-shadow: 0 0 4px ${theme.colors.accent}; }
          100% { transform: translate(-50%, -50%) scale(1);   opacity: 0; box-shadow: none; }
        }
        @keyframes rally-ember-float {
          0%   { transform: translateY(0) translateX(0) scale(1); opacity: 0; }
          10%  { opacity: 1; }
          50%  { transform: translateY(-40vh) translateX(12px) scale(0.7); opacity: 0.7; }
          100% { transform: translateY(-90vh) translateX(-8px) scale(0.3); opacity: 0; }
        }
        @keyframes rally-ember-text-pulse {
          0%, 100% { text-shadow: 0 0 6px ${theme.colors.accent}; color: ${theme.colors.textPrimary}; }
          50% { text-shadow: 0 0 18px ${theme.colors.accent}, 0 0 30px rgba(234,88,12,0.3); color: ${theme.colors.accent}; }
        }
        @keyframes rally-fist-glow {
          0%, 100% { filter: drop-shadow(0 0 3px ${theme.colors.accent}); }
          50% { filter: drop-shadow(0 0 8px ${theme.colors.accent}) drop-shadow(0 0 14px rgba(234,88,12,0.4)); }
        }
        .rally-loading-ember {
          position: absolute;
          bottom: -10px;
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: ${theme.colors.accent};
          box-shadow: 0 0 4px ${theme.colors.accent}, 0 0 8px rgba(234,88,12,0.5);
          animation: rally-ember-float linear infinite;
          pointer-events: none;
        }
        @media (prefers-reduced-motion: reduce) {
          .rally-loading-ember { animation: none !important; opacity: 0; }
        }
      `}</style>

      {/* Drifting ember particles */}
      {Array.from({ length: 14 }, (_, i) => (
        <div
          key={`ember-${i}`}
          className="rally-loading-ember"
          style={{
            left: `${5 + (i * 6.8) % 90}%`,
            animationDuration: `${3 + (i * 1.7) % 5}s`,
            animationDelay: `${(i * 0.6) % 4}s`,
            width: `${2 + (i % 3)}px`,
            height: `${2 + (i % 3)}px`,
            opacity: 0,
          }}
        />
      ))}

      {/* Crowd silhouettes */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '120px',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: '6px',
        opacity: 0.18,
        pointerEvents: 'none',
      }}>
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            style={{
              width: '22px',
              height: `${35 + ((i * 13) % 45)}px`,
              backgroundColor: '#0c0a09',
              borderRadius: '11px 11px 0 0',
              boxShadow: '0 0 12px rgba(0,0,0,0.8)',
            }}
          />
        ))}
      </div>
      {/* Fog gradient */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '80px',
        background: `linear-gradient(to top, ${theme.materials.corruptionFog}, transparent)`,
        pointerEvents: 'none',
        zIndex: 1,
      }} />

      {/* Pulsing megaphone with ripples */}
      <div style={{
        position: 'relative',
        width: 'min(180px, 50vw)',
        height: 'min(180px, 50vw)',
        maxWidth: '90%',
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              border: `2px solid ${theme.colors.accent}`,
              background: `radial-gradient(circle, transparent 60%, ${theme.materials.corruptionEmber} 100%)`,
              transform: 'translate(-50%, -50%) scale(0.1)',
              opacity: 0,
              animation: `rally-ripple-out 2.8s ease-out ${i * 0.7}s infinite`,
            }}
          />
        ))}
        <div style={{
          color: theme.colors.accent,
          animation: 'rally-megaphone-pulse 1.2s ease-in-out infinite',
          display: 'flex',
          filter: `drop-shadow(0 0 10px ${theme.colors.accent})`,
        }}>
          <MegaphoneIcon size={44} />
        </div>
      </div>

      {/* Status text */}
      <div style={{
        textTransform: 'uppercase',
        fontSize: 12,
        letterSpacing: 3,
        color: theme.colors.textMuted,
        marginBottom: 16,
        fontWeight: 700,
      }}>
        {clamped < 100 ? 'Preparing the rally…' : 'Handa na — deploying!'}
      </div>

      {/* Progress bar */}
      <div style={{ width: '65%', maxWidth: '340px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{
            color: clamped < 100 ? theme.colors.textSecondary : theme.colors.textPrimary,
            textTransform: 'uppercase',
            fontSize: '13px',
            fontWeight: 'bold',
            ...(clamped >= 100 ? { animation: 'rally-ember-text-pulse 1.8s ease-in-out infinite' } : {}),
          }}>
            {clamped < 100 ? 'Loading assets…' : 'Ang bayan ay handa na!'}
          </span>
          <span style={{
            color: theme.colors.accent,
            fontWeight: 'bold',
            textShadow: `0 0 8px ${theme.materials.corruptionEmber}`,
          }}>
            {clamped}%
          </span>
        </div>

        <div style={{
          width: '100%',
          height: '14px',
          backgroundColor: theme.materials.woodDark,
          borderRadius: '7px',
          overflow: 'hidden',
          border: `1px solid ${theme.materials.metalDark}`,
          position: 'relative',
          boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.6)',
        }}>
          <div style={{
            width: `${clamped}%`,
            height: '100%',
            background: `repeating-linear-gradient(45deg, ${theme.colors.accent}, ${theme.colors.accent} 12px, ${theme.colors.danger} 12px, ${theme.colors.danger} 24px)`,
            transition: 'width 0.2s ease-out',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            boxShadow: `0 0 12px ${theme.materials.corruptionEmber}, inset 0 0 8px rgba(234, 88, 12, 0.3)`,
          }}>
            <span style={{
              color: theme.colors.textPrimary,
              display: 'flex',
              marginRight: '2px',
              animation: 'rally-fist-glow 1.5s ease-in-out infinite',
            }}>
              <RaisedFistIcon size={10} />
            </span>
          </div>
        </div>
      </div>

      {/* Rotating rally tip */}
      <div style={{
        position: 'absolute',
        left: 16,
        right: 16,
        bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
        textAlign: 'center',
        fontSize: '12px',
        color: theme.materials.paperAged,
        fontStyle: 'italic',
        minHeight: '20px',
        zIndex: 2,
        opacity: 0.55,
        textShadow: '0 1px 2px rgba(0,0,0,0.6)',
      }}>
        {tip}
      </div>
    </div>
  );
}
