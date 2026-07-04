import { useState, useEffect } from 'react';
import { theme } from '../theme';

interface LoadingScreenProps {
  onComplete: () => void;
}

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
      zIndex: 1000
    }}>
      <h1 style={{ fontSize: '48px', color: theme.colors.primary, marginBottom: '40px', letterSpacing: '4px' }}>
        FIRST RIPPLE
      </h1>
      
      <div style={{ width: '60%', maxWidth: '400px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ color: theme.colors.textSecondary, textTransform: 'uppercase', fontSize: '14px', fontWeight: 'bold' }}>
            {progress < 100 ? 'Loading Assets...' : 'Ready'}
          </span>
          <span style={{ color: theme.colors.accent, fontWeight: 'bold' }}>{Math.min(progress, 100)}%</span>
        </div>
        <div style={{ width: '100%', height: '12px', backgroundColor: theme.colors.surface, borderRadius: '6px', overflow: 'hidden' }}>
          <div style={{
            width: `${Math.min(progress, 100)}%`,
            height: '100%',
            backgroundColor: theme.colors.primary,
            transition: 'width 0.2s ease-out'
          }} />
        </div>
      </div>
    </div>
  );
}
