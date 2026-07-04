import { theme } from '../theme';

interface MainMenuProps {
  onPlay: () => void;
  onStore: () => void;
  onInventory: () => void;
}

// Simple SVG Icons
const PlayIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const StoreIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const RosterIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export function MainMenu({ onPlay, onStore, onInventory }: MainMenuProps) {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      backgroundColor: theme.colors.background,
      overflow: 'hidden',
      pointerEvents: 'auto',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Background Ambience / Rally Scene */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(180deg, rgba(15,23,42,1) 0%, rgba(30,41,59,1) 100%)',
        zIndex: 0
      }} />

      {/* Hero Rally Silhouettes (Placeholder) */}
      <div style={{
        position: 'absolute',
        bottom: '0',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '600px',
        height: '400px',
        zIndex: 1,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: '20px',
        opacity: 0.8
      }}>
        {/* Supporting Hero (Left) */}
        <div style={{ width: '80px', height: '150px', backgroundColor: '#334155', borderRadius: '40px 40px 0 0', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)' }} />
        {/* Main Hero / Eden (Center) */}
        <div style={{ width: '100px', height: '220px', backgroundColor: '#475569', borderRadius: '50px 50px 0 0', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5), 0 -10px 40px rgba(56, 189, 248, 0.2)' }} />
        {/* Supporting Hero (Right) */}
        <div style={{ width: '80px', height: '160px', backgroundColor: '#334155', borderRadius: '40px 40px 0 0', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)' }} />
      </div>

      {/* Foreground UI */}
      <div style={{ position: 'relative', zIndex: 10, width: '100%', height: '100%', display: 'flex', justifyContent: 'space-between' }}>
        
        {/* Left Side: Title & Secondary Buttons */}
        <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          
          <h1 style={{
            fontSize: '72px',
            color: theme.colors.textPrimary,
            fontWeight: '900',
            letterSpacing: '6px',
            textTransform: 'uppercase',
            textShadow: `0 0 30px ${theme.colors.accent}`,
            margin: 0
          }}>
            FIRST RIPPLE
          </h1>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <button
              onClick={onStore}
              title="Sari-Sari Store"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                backgroundColor: theme.colors.surface,
                color: theme.colors.textPrimary,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: '8px',
                cursor: 'pointer',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                transition: 'all 0.1s',
                width: '64px',
                height: '64px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateX(5px)';
                e.currentTarget.style.backgroundColor = 'rgba(56, 189, 248, 0.1)';
                e.currentTarget.style.borderColor = theme.colors.accent;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateX(0)';
                e.currentTarget.style.backgroundColor = theme.colors.surface;
                e.currentTarget.style.borderColor = theme.colors.border;
              }}
            >
              <StoreIcon />
            </button>
            
            <button
              onClick={onInventory}
              title="Roster & Codex"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                backgroundColor: theme.colors.surface,
                color: theme.colors.textPrimary,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: '8px',
                cursor: 'pointer',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                transition: 'all 0.1s',
                width: '64px',
                height: '64px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateX(5px)';
                e.currentTarget.style.backgroundColor = 'rgba(56, 189, 248, 0.1)';
                e.currentTarget.style.borderColor = theme.colors.accent;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateX(0)';
                e.currentTarget.style.backgroundColor = theme.colors.surface;
                e.currentTarget.style.borderColor = theme.colors.border;
              }}
            >
              <RosterIcon />
            </button>
          </div>
        </div>

        {/* Right Side: Primary Action */}
        <div style={{ padding: '40px', display: 'flex', alignItems: 'flex-end' }}>
          <button
            onClick={onPlay}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '24px 40px',
              fontSize: '28px',
              backgroundColor: theme.colors.accent,
              color: '#0f172a',
              border: 'none',
              borderRadius: '16px',
              cursor: 'pointer',
              fontWeight: '900',
              textTransform: 'uppercase',
              boxShadow: `0 0 30px rgba(56, 189, 248, 0.4), 0 6px 0 #0284c7`,
              transition: 'all 0.1s',
              transform: 'translateY(-6px)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = `0 0 40px rgba(56, 189, 248, 0.6), 0 8px 0 #0284c7`;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(-6px)';
              e.currentTarget.style.boxShadow = `0 0 30px rgba(56, 189, 248, 0.4), 0 6px 0 #0284c7`;
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = `0 0 15px rgba(56, 189, 248, 0.3), 0 0 0 #0284c7`;
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = `0 0 40px rgba(56, 189, 248, 0.6), 0 8px 0 #0284c7`;
            }}
          >
            Campaign
            <PlayIcon />
          </button>
        </div>

      </div>
    </div>
  );
}
