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
          0%, 100% { transform: scale(1) rotate(-8deg); }
          50% { transform: scale(1.08) rotate(-8deg); }
        }
        @keyframes march {
          from { transform: translateX(0); }
          to { transform: translateX(-24px); }
        }
        /* The "first ripple" — concentric rings spreading from the megaphone.
           Max scale is 1 (ring base = 220px) so the outermost ring always stays
           inside the 9:16 portrait frame and never clips at the edges. */
        @keyframes ripple-out {
          0% { transform: translate(-50%, -50%) scale(0.1); opacity: 0.6; }
          80% { opacity: 0.12; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .ripple-ring { animation: none !important; opacity: 0.12; }
        }
      `}</style>

      {/* Distant crowd silhouettes along the bottom */}
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
        opacity: 0.35,
        pointerEvents: 'none'
      }}>
        {Array.from({ length: 24 }, (_, i) => (
          <div
            key={i}
            style={{
              width: '22px',
              height: `${40 + ((i * 13) % 50)}px`,
              backgroundColor: '#1e293b',
              borderRadius: '11px 11px 0 0'
            }}
          />
        ))}
      </div>

      {/* Title placard */}
      <div style={{
        backgroundColor: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        padding: 'clamp(12px, 3vw, 16px) clamp(20px, 7vw, 48px)',
        transform: 'rotate(-2deg)',
        boxShadow: `0 0 40px rgba(56, 189, 248, 0.15), 0 8px 20px rgba(0,0,0,0.5)`,
        marginBottom: '40px',
        position: 'relative',
        maxWidth: '90%'
      }}>
        {/* Placard stick */}
        <div style={{
          position: 'absolute',
          bottom: '-28px',
          left: '50%',
          width: '8px',
          height: '30px',
          backgroundColor: '#334155',
          transform: 'translateX(-50%)'
        }} />
        <h1 style={{
          fontSize: 'clamp(30px, 9vw, 48px)',
          color: theme.colors.textPrimary,
          margin: 0,
          letterSpacing: 'clamp(2px, 1vw, 4px)',
          fontWeight: 900,
          textTransform: 'uppercase',
          textShadow: `0 0 20px ${theme.colors.accent}`,
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
        {/* Concentric ripple rings — contained within this square box */}
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
              animation: `ripple-out 2.4s ease-out ${i * 0.8}s infinite`,
            }}
          />
        ))}
        <div style={{
          color: theme.colors.accent,
          animation: 'megaphone-pulse 1.2s ease-in-out infinite',
          display: 'flex'
        }}>
          <MegaphoneIcon size={48} />
        </div>
      </div>

      <div style={{ width: '60%', maxWidth: '400px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ color: theme.colors.textSecondary, textTransform: 'uppercase', fontSize: '14px', fontWeight: 'bold' }}>
            {clamped < 100 ? 'Gathering the movement…' : 'Ang bayan ay handa na!'}
          </span>
          <span style={{ color: theme.colors.accent, fontWeight: 'bold' }}>{clamped}%</span>
        </div>

        {/* Marching progress bar — caution-tape track, fist at the front */}
        <div style={{
          width: '100%',
          height: '16px',
          backgroundColor: theme.colors.surface,
          borderRadius: '8px',
          overflow: 'hidden',
          border: `1px solid ${theme.colors.border}`,
          position: 'relative'
        }}>
          <div style={{
            width: `${clamped}%`,
            height: '100%',
            background: `repeating-linear-gradient(45deg, ${theme.colors.accent}, ${theme.colors.accent} 12px, #0284c7 12px, #0284c7 24px)`,
            transition: 'width 0.2s ease-out',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end'
          }}>
            <span style={{ color: '#0f172a', display: 'flex', marginRight: '2px' }}>
              <RaisedFistIcon size={12} />
            </span>
          </div>
        </div>

        {/* Rotating rally tip */}
        <div style={{
          marginTop: '20px',
          textAlign: 'center',
          fontSize: '13px',
          color: theme.colors.textMuted,
          fontStyle: 'italic',
          minHeight: '20px'
        }}>
          {tip}
        </div>
      </div>
    </div>
  );
}
