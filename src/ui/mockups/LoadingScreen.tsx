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
        padding: '16px 48px',
        transform: 'rotate(-2deg)',
        boxShadow: `0 0 40px rgba(56, 189, 248, 0.15), 0 8px 20px rgba(0,0,0,0.5)`,
        marginBottom: '40px',
        position: 'relative'
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
          fontSize: '48px',
          color: theme.colors.textPrimary,
          margin: 0,
          letterSpacing: '4px',
          fontWeight: 900,
          textTransform: 'uppercase',
          textShadow: `0 0 20px ${theme.colors.accent}`
        }}>
          FIRST RIPPLE
        </h1>
      </div>

      {/* Pulsing megaphone */}
      <div style={{
        color: theme.colors.accent,
        marginBottom: '32px',
        animation: 'megaphone-pulse 1.2s ease-in-out infinite',
        display: 'flex'
      }}>
        <MegaphoneIcon size={48} />
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
