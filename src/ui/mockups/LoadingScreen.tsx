import { useState, useEffect } from 'react';
import { theme } from '../theme';
import { MegaphoneIcon, RaisedFistIcon } from '../icons';

interface LoadingScreenProps {
  onComplete: () => void;
}

const RALLY_TIPS = [
  'Adjacent heroes buff each other — Bayanihan!',
  'Kills fill the Voices meter. A full meter means a new drop.',
  'Hope is earned win or lose — a failed defense still wakes people up.',
  'Match your squad’s damage types to the stage’s telegraphed weaknesses.',
  'Melee workers brawl at the frontline; ranged workers fire from behind.',
];

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500); // Small delay before transitioning
          return 100;
        }
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [onComplete]);

  const clamped = Math.min(progress, 100);
  const tip = RALLY_TIPS[Math.min(Math.floor(clamped / (100 / RALLY_TIPS.length)), RALLY_TIPS.length - 1)];

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      backgroundColor: theme.colors.background,
      background: `radial-gradient(ellipse 120% 80% at 50% 110%, ${theme.materials.corruptionEmber}, transparent 60%), ${theme.colors.background}`,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      color: theme.colors.textPrimary,
      zIndex: 1000,
      overflow: 'hidden'
    }}>
      <style>{`
        @keyframes megaphone-pulse {
          0%, 100% { transform: scale(1) rotate(-8deg); filter: drop-shadow(0 0 6px ${theme.colors.accent}); }
          50% { transform: scale(1.08) rotate(-8deg); filter: drop-shadow(0 0 14px ${theme.colors.accent}); }
        }
        @keyframes march {
          from { transform: translateX(0); }
          to { transform: translateX(-24px); }
        }
        /* The "first ripple" — concentric rings spreading from the megaphone.
           translate(-50%,-50%) lives on the element style so rings stay centred
           even between animation cycles. The keyframes only animate scale +
           opacity. Max scale is 1 (ring base = 220px) so the outermost ring
           always stays inside the 9:16 portrait frame. */
        @keyframes ripple-out {
          0%   { transform: translate(-50%, -50%) scale(0.1); opacity: 0.65; box-shadow: 0 0 8px ${theme.colors.accent}; }
          50%  { opacity: 0.20; box-shadow: 0 0 4px ${theme.colors.accent}; }
          100% { transform: translate(-50%, -50%) scale(1);   opacity: 0; box-shadow: none; }
        }
        /* Drifting ember particles — ash and sparks floating upward */
        @keyframes ember-float {
          0%   { transform: translateY(0) translateX(0) scale(1); opacity: 0; }
          10%  { opacity: 1; }
          50%  { transform: translateY(-40vh) translateX(12px) scale(0.7); opacity: 0.7; }
          100% { transform: translateY(-90vh) translateX(-8px) scale(0.3); opacity: 0; }
        }
        /* Pulsing ember warmth on completion text */
        @keyframes ember-text-pulse {
          0%, 100% { text-shadow: 0 0 6px ${theme.colors.accent}; color: ${theme.colors.textPrimary}; }
          50% { text-shadow: 0 0 18px ${theme.colors.accent}, 0 0 30px rgba(234,88,12,0.3); color: ${theme.colors.accent}; }
        }
        /* Fist glow at front of progress bar */
        @keyframes fist-glow {
          0%, 100% { filter: drop-shadow(0 0 3px ${theme.colors.accent}); }
          50% { filter: drop-shadow(0 0 8px ${theme.colors.accent}) drop-shadow(0 0 14px rgba(234,88,12,0.4)); }
        }
        .loading-ember {
          position: absolute;
          bottom: -10px;
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: ${theme.colors.accent};
          box-shadow: 0 0 4px ${theme.colors.accent}, 0 0 8px rgba(234,88,12,0.5);
          animation: ember-float linear infinite;
          pointer-events: none;
        }
        @media (prefers-reduced-motion: reduce) {
          .ripple-ring { animation: none !important; opacity: 0.12; }
          .loading-ember { animation: none !important; opacity: 0; }
        }
      `}</style>

      {/* Drifting ember particles */}
      {Array.from({ length: 18 }, (_, i) => (
        <div
          key={`ember-${i}`}
          className="loading-ember"
          style={{
            left: `${5 + (i * 5.3) % 90}%`,
            animationDuration: `${3 + (i * 1.7) % 5}s`,
            animationDelay: `${(i * 0.6) % 4}s`,
            width: `${2 + (i % 3)}px`,
            height: `${2 + (i % 3)}px`,
            opacity: 0,
          }}
        />
      ))}

      {/* Distant crowd silhouettes along the bottom — ominous shadows in fog */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '140px',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: '6px',
        opacity: 0.22,
        pointerEvents: 'none'
      }}>
        {Array.from({ length: 24 }, (_, i) => (
          <div
            key={i}
            style={{
              width: '22px',
              height: `${40 + ((i * 13) % 50)}px`,
              backgroundColor: '#0c0a09',
              borderRadius: '11px 11px 0 0',
              boxShadow: '0 0 12px rgba(0,0,0,0.8)'
            }}
          />
        ))}
      </div>
      {/* Corruption fog gradient at the bottom */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '100px',
        background: `linear-gradient(to top, ${theme.materials.corruptionFog}, transparent)`,
        pointerEvents: 'none',
        zIndex: 1
      }} />

      {/* Title placard — charred, weathered surface */}
      <div style={{
        backgroundColor: theme.materials.woodDark,
        border: `1px solid ${theme.materials.metalDark}`,
        padding: 'clamp(12px, 3vw, 16px) clamp(20px, 7vw, 48px)',
        transform: 'rotate(-2deg)',
        boxShadow: `0 0 40px ${theme.materials.corruptionEmber}, 0 0 60px rgba(234, 88, 12, 0.08), 0 8px 24px rgba(0,0,0,0.7)`,
        marginBottom: '40px',
        position: 'relative',
        maxWidth: '90%',
        backgroundImage: `linear-gradient(135deg, rgba(255,255,255,0.02) 0%, transparent 50%, rgba(0,0,0,0.15) 100%)`
      }}>
        {/* Placard stick — charred wood */}
        <div style={{
          position: 'absolute',
          bottom: '-28px',
          left: '50%',
          width: '8px',
          height: '30px',
          backgroundColor: theme.materials.wood,
          transform: 'translateX(-50%)',
          backgroundImage: `linear-gradient(to bottom, ${theme.materials.woodDark}, ${theme.materials.wood})`,
          boxShadow: `0 0 6px rgba(0,0,0,0.6)`
        }} />
        <h1 style={{
          fontSize: 'clamp(22px, 6.5vw, 36px)',
          color: theme.colors.textPrimary,
          margin: 0,
          letterSpacing: 'clamp(1px, 0.6vw, 3px)',
          fontWeight: 900,
          textTransform: 'uppercase',
          textShadow: `0 0 12px ${theme.colors.accent}, 0 0 30px ${theme.colors.accent}, 0 0 50px rgba(234, 88, 12, 0.25)`,
          whiteSpace: 'nowrap'
        }}>
          FIRST RIPPLE
        </h1>
      </div>

      {/* Pulsing megaphone, ringed by the "first ripple" */}
      <div style={{
        position: 'relative',
        width: 'min(220px, 62vw)',
        height: 'min(220px, 62vw)',
        maxWidth: '90%',
        marginBottom: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none'
      }}>
        {/* Concentric ripple rings — ember fire spreading outward */}
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            aria-hidden="true"
            className="ripple-ring"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              border: `2px solid ${theme.colors.accent}`,
              background: `radial-gradient(circle, transparent 60%, ${theme.materials.corruptionEmber} 100%)`,
              /* Base transform keeps the ring centred; the animation
                 overrides the full transform property each frame. */
              transform: 'translate(-50%, -50%) scale(0.1)',
              opacity: 0,
              animation: `ripple-out 2.8s ease-out ${i * 0.7}s infinite`,
            }}
          />
        ))}
        <div style={{
          color: theme.colors.accent,
          animation: 'megaphone-pulse 1.2s ease-in-out infinite',
          display: 'flex',
          filter: `drop-shadow(0 0 10px ${theme.colors.accent})`
        }}>
          <MegaphoneIcon size={48} />
        </div>
      </div>

      <div style={{ width: '60%', maxWidth: '400px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{
            color: clamped < 100 ? theme.colors.textSecondary : theme.colors.textPrimary,
            textTransform: 'uppercase',
            fontSize: '14px',
            fontWeight: 'bold',
            ...(clamped >= 100 ? { animation: 'ember-text-pulse 1.8s ease-in-out infinite' } : {})
          }}>
            {clamped < 100 ? 'Gathering the movement…' : 'Ang bayan ay handa na!'}
          </span>
          <span style={{ color: theme.colors.accent, fontWeight: 'bold', textShadow: `0 0 8px ${theme.materials.corruptionEmber}` }}>{clamped}%</span>
        </div>

        {/* Marching progress bar — ember-striped track on ashen background */}
        <div style={{
          width: '100%',
          height: '16px',
          backgroundColor: theme.materials.woodDark,
          borderRadius: '8px',
          overflow: 'hidden',
          border: `1px solid ${theme.materials.metalDark}`,
          position: 'relative',
          boxShadow: `inset 0 1px 4px rgba(0,0,0,0.6)`
        }}>
          <div style={{
            width: `${clamped}%`,
            height: '100%',
            background: `repeating-linear-gradient(45deg, ${theme.colors.accent}, ${theme.colors.accent} 12px, ${theme.colors.danger} 12px, ${theme.colors.danger} 24px)`,
            transition: 'width 0.2s ease-out',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            boxShadow: `0 0 12px ${theme.materials.corruptionEmber}, inset 0 0 8px rgba(234, 88, 12, 0.3)`
          }}>
            <span style={{ color: theme.colors.textPrimary, display: 'flex', marginRight: '2px', animation: 'fist-glow 1.5s ease-in-out infinite' }}>
              <RaisedFistIcon size={12} />
            </span>
          </div>
        </div>

      </div>

      {/* Rotating rally tip — faded text on scorched paper, above fog */}
      <div style={{
        position: 'absolute',
        left: 16,
        right: 16,
        bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
        textAlign: 'center',
        fontSize: '13px',
        color: theme.materials.paperAged,
        fontStyle: 'italic',
        minHeight: '20px',
        zIndex: 2,
        opacity: 0.55,
        textShadow: `0 1px 2px rgba(0,0,0,0.6)`,
      }}>
        {tip}
      </div>
    </div>
  );
}
