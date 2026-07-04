import { theme } from '../theme';

interface SariSariStoreProps {
  onBack: () => void;
}

// Custom Icons for the store
const HopeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={theme.colors.gold} stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v8M8 12h8" />
  </svg>
);

const CardPackIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="#1e293b" stroke="#e2e8f0" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="4" y1="18" x2="20" y2="18" />
    <circle cx="12" cy="12" r="3" fill="#ef4444" stroke="none" />
  </svg>
);

const PermitIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="#f8fafc" stroke="#000" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="6" width="18" height="12" rx="2" />
    <path d="M3 12h18" strokeDasharray="4 4" />
  </svg>
);

const GearIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="#475569" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 2 13 2 14 5 16 6 19 4 20 6 18 9 19 11 22 12 22 14 19 15 18 17 20 19 19 21 16 19 14 20 13 23 11 23 10 20 8 19 5 21 4 19 6 17 5 15 2 14 2 12 5 11 6 9 4 6 5 4 8 6 10 5 11 2" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EnergyDrinkIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="#10b981" stroke="#fff" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="4" width="12" height="16" rx="2" />
    <path d="M10 2h4" />
    <path d="M11 10l-2 4h4l-2 4" stroke="#fff" strokeWidth="2" fill="none" />
  </svg>
);

const WifiIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12.55a11 11 0 0 1 14.08 0" />
    <path d="M1.42 9a16 16 0 0 1 21.16 0" />
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
    <line x1="12" y1="20" x2="12.01" y2="20" strokeWidth="4" />
  </svg>
);

export function SariSariStore({ onBack }: SariSariStoreProps) {
  const currentHope = 1250;

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      backgroundColor: '#1c1917', // Very dark background
      backgroundImage: `
        repeating-linear-gradient(90deg, transparent, transparent 48px, rgba(0,0,0,0.5) 48px, rgba(0,0,0,0.5) 50px),
        repeating-linear-gradient(0deg, #3f2a1d, #3f2a1d 100px, #291b12 100px, #291b12 102px)
      `, // Metal grille over wooden planks
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 40px',
      color: theme.colors.textPrimary,
      overflowY: 'auto',
      boxShadow: 'inset 0 0 150px rgba(0,0,0,0.9)'
    }}>
      
      {/* Warm Light Glow */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px',
        height: '400px',
        background: 'radial-gradient(ellipse, rgba(253, 224, 71, 0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '50px', position: 'relative', zIndex: 10 }}>
        <div>
          <button onClick={onBack} style={{
            background: 'none',
            border: 'none',
            color: '#e2e8f0',
            cursor: 'pointer',
            fontSize: '18px',
            fontWeight: 'bold',
            padding: '8px 16px',
            backgroundColor: 'rgba(0,0,0,0.6)',
            borderRadius: '8px',
            backdropFilter: 'blur(4px)',
            marginBottom: '15px',
            border: '1px solid #334155'
          }}>
            ← Back to Street
          </button>
          
          {/* Faded Soft Drink Signboard */}
          <div style={{
            backgroundColor: '#ef4444', // Classic red
            border: '4px solid #f8fafc',
            borderRadius: '4px',
            padding: '15px 40px',
            boxShadow: '0 10px 20px rgba(0,0,0,0.5), inset 0 0 20px rgba(0,0,0,0.3)',
            display: 'inline-block',
            position: 'relative',
            transform: 'rotate(-1deg)'
          }}>
            {/* White wave accent */}
            <div style={{
              position: 'absolute',
              bottom: '10px',
              left: '0',
              width: '100%',
              height: '4px',
              backgroundColor: '#f8fafc',
              opacity: 0.8
            }} />
            
            <h1 style={{ 
              margin: 0, 
              fontSize: '42px', 
              fontFamily: '"Arial Black", Impact, sans-serif', 
              color: '#f8fafc',
              textShadow: '2px 2px 0 #991b1b',
              textTransform: 'uppercase',
              letterSpacing: '2px'
            }}>
              Sari-Sari Store
            </h1>
            <div style={{ color: '#fef08a', fontSize: '14px', fontWeight: 'bold', letterSpacing: '4px', textTransform: 'uppercase' }}>
              The Movement's Supply Line
            </div>

            {/* Protest Sticker Slapped on the sign */}
            <div style={{
              position: 'absolute',
              top: '-10px',
              right: '-15px',
              backgroundColor: '#000',
              color: '#fff',
              padding: '5px 10px',
              transform: 'rotate(12deg)',
              fontFamily: '"Courier New", Courier, monospace',
              fontWeight: 'bold',
              fontSize: '12px',
              boxShadow: '2px 2px 5px rgba(0,0,0,0.5)'
            }}>
              WAKE UP!
            </div>
          </div>
        </div>

        {/* Plastic Jar / Ledger for Hope Points */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.1)',
          border: '2px solid rgba(255,255,255,0.2)',
          borderRadius: '16px',
          padding: '15px 30px',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5), inset 0 2px 10px rgba(255,255,255,0.1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '5px',
          transform: 'rotate(1deg)'
        }}>
          <div style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase' }}>
            Current Funds
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '32px', color: theme.colors.gold, fontWeight: '900', fontFamily: '"Courier New", Courier, monospace' }}>
              {currentHope}
            </span>
            <HopeIcon />
          </div>
        </div>
      </div>

      {/* Hanging Wire for Goods */}
      <div style={{
        width: '100%',
        height: '2px',
        backgroundColor: '#94a3b8',
        boxShadow: '0 5px 10px rgba(0,0,0,0.5)',
        position: 'relative',
        marginBottom: '40px',
        zIndex: 5
      }}>
        <div style={{ position: 'absolute', left: '-10px', top: '-4px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#64748b' }} />
        <div style={{ position: 'absolute', right: '-10px', top: '-4px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#64748b' }} />
      </div>

      {/* The Goods */}
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '40px', 
        justifyContent: 'center',
        padding: '20px 0',
        position: 'relative',
        zIndex: 10
      }}>
        {[
          { title: 'Hero Card Pack', desc: 'Contains 3 Random Hero Cards to level up the roster.', cost: 300, icon: <CardPackIcon /> },
          { title: 'Eden Starter Pack', desc: 'Guaranteed 5 Eden Cards.', cost: 500, icon: <CardPackIcon /> },
          { title: 'Rally Permit', desc: 'Energy to start 1 new Campaign Stage.', cost: 100, icon: <PermitIcon /> },
          { title: 'Energy Drink', desc: 'Consumable. Increases attack speed by 15% for 15s.', cost: 50, icon: <EnergyDrinkIcon /> },
          { title: 'Pocket Wi-Fi', desc: 'Consumable. Reveals stealth enemies and extends range.', cost: 80, icon: <WifiIcon /> },
          { title: 'Upgrade Core', desc: 'Material for unlocking Tier 2 abilities.', cost: 1000, icon: <GearIcon /> },
          { title: 'Sturdier Barricade', desc: 'Heroes gain +50 max HP permanently.', cost: 1200, icon: <GearIcon /> }
        ].map((item, i) => {
          
          const swing = (i % 2 === 0 ? 1 : -1) * (1 + Math.random() * 2);

          return (
            <div key={i} style={{
              width: '220px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
              animation: `swing 5s ease-in-out infinite alternate`,
              transformOrigin: 'top center',
              // Fake animation state via transform for initial render
              transform: `rotate(${swing}deg)`
            }}>
              
              {/* Metal Clip connecting to wire */}
              <div style={{
                width: '15px',
                height: '35px',
                backgroundColor: '#cbd5e1',
                border: '1px solid #475569',
                borderRadius: '8px',
                position: 'absolute',
                top: '-45px',
                zIndex: 2,
                boxShadow: 'inset -2px -2px 5px rgba(0,0,0,0.3)'
              }} />

              {/* The Plastic Wrapper / Item Body */}
              <div style={{
                backgroundColor: 'rgba(255,255,255,0.95)',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                padding: '20px',
                width: '100%',
                height: '180px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 10px 20px rgba(0,0,0,0.6), inset 0 0 20px rgba(255,255,255,0.5)',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                zIndex: 3
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.05) translateY(-10px)';
                e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.8), inset 0 0 20px rgba(255,255,255,0.5)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1) translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.6), inset 0 0 20px rgba(255,255,255,0.5)';
              }}
              >
                <div style={{ marginBottom: '15px' }}>
                  {item.icon}
                </div>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#0f172a', textAlign: 'center', fontFamily: '"Arial Black", Impact, sans-serif', textTransform: 'uppercase' }}>
                  {item.title}
                </h3>
                <p style={{ margin: 0, fontSize: '12px', color: '#475569', textAlign: 'center', lineHeight: '1.4' }}>
                  {item.desc}
                </p>
              </div>

              {/* Cardboard Price Tag */}
              <button style={{
                position: 'absolute',
                bottom: '-25px',
                right: '-10px',
                backgroundColor: '#d97706', // Orange cardboard
                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px)',
                color: '#000',
                border: '1px solid #78350f',
                padding: '10px 20px',
                borderRadius: '2px',
                fontWeight: '900',
                fontFamily: '"Marker Felt", "Comic Sans MS", fantasy',
                fontSize: '20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '2px 4px 10px rgba(0,0,0,0.5)',
                transform: 'rotate(-5deg)',
                zIndex: 10,
                transition: 'transform 0.1s'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'rotate(-5deg) scale(1.1)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'rotate(-5deg) scale(1)'}
              onMouseDown={(e) => e.currentTarget.style.transform = 'rotate(-5deg) scale(0.95)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'rotate(-5deg) scale(1.1)'}
              >
                {/* Tag String */}
                <div style={{
                  position: 'absolute',
                  top: '-15px',
                  left: '10px',
                  width: '2px',
                  height: '20px',
                  backgroundColor: '#cbd5e1',
                  transform: 'rotate(20deg)'
                }} />
                <div style={{
                  position: 'absolute',
                  top: '5px',
                  left: '8px',
                  width: '6px',
                  height: '6px',
                  backgroundColor: '#000',
                  borderRadius: '50%'
                }} />
                
                {item.cost} <HopeIcon />
              </button>
            </div>
          );
        })}
      </div>

      {/* Silhouettes / Future Items in the background */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '0',
        width: '100%',
        display: 'flex',
        justifyContent: 'space-around',
        opacity: 0.15, // Very faint
        pointerEvents: 'none',
        zIndex: 1
      }}>
        {/* Fake Jar silhouettes */}
        <div style={{ width: '80px', height: '120px', backgroundColor: '#000', borderRadius: '10px 10px 0 0', clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 100%, 0% 100%, 0% 20%)' }} />
        <div style={{ width: '150px', height: '80px', backgroundColor: '#000', borderRadius: '10px 10px 0 0' }} />
        <div style={{ width: '60px', height: '150px', backgroundColor: '#000', borderRadius: '5px 5px 0 0' }} />
        <div style={{ width: '100px', height: '100px', backgroundColor: '#000', borderRadius: '10px 10px 0 0' }} />
      </div>

    </div>
  );
}
