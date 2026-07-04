import { theme } from '../theme';

interface MainMenuProps {
  onPlay: () => void;
  onStore: () => void;
  onInventory: () => void;
}

export function MainMenu({ onPlay, onStore, onInventory }: MainMenuProps) {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.85)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'auto',
      zIndex: 100,
      backdropFilter: 'blur(8px)'
    }}>
      <h1 style={{
        fontSize: '80px',
        color: theme.colors.textPrimary,
        fontWeight: '900',
        letterSpacing: '8px',
        textTransform: 'uppercase',
        textShadow: `0 0 20px ${theme.colors.accent}`,
        marginBottom: '60px'
      }}>
        PH-DE
      </h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '300px' }}>
        <button
          onClick={onPlay}
          style={{
            padding: '20px',
            fontSize: '24px',
            backgroundColor: theme.colors.success,
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: 'bold',
            boxShadow: '0 4px 0 #166534',
            transition: 'transform 0.1s'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          START CAMPAIGN
        </button>
        
        <button
          onClick={onStore}
          style={{
            padding: '20px',
            fontSize: '24px',
            backgroundColor: theme.colors.surface,
            color: '#fff',
            border: `3px solid ${theme.colors.border}`,
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: 'bold',
            boxShadow: '0 4px 0 #0f172a',
            transition: 'transform 0.1s'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          SARI-SARI STORE
        </button>
        
        <button
          onClick={onInventory}
          style={{
            padding: '20px',
            fontSize: '24px',
            backgroundColor: theme.colors.surface,
            color: '#fff',
            border: `3px solid ${theme.colors.border}`,
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: 'bold',
            boxShadow: '0 4px 0 #0f172a',
            transition: 'transform 0.1s'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          ROSTER & CODEX
        </button>
      </div>
    </div>
  );
}
