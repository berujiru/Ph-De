import { useState } from 'react';
import { theme } from '../theme';
import { HERO_DEFINITIONS, type HeroDefinition } from '../../game/data/balance';

interface InventoryScreenProps {
  onBack: () => void;
}

// Simple Hero SVG Icon
const HeroIcon = ({ color }: { color: string }) => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill={color} stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export function InventoryScreen({ onBack }: InventoryScreenProps) {
  const [selectedHero, setSelectedHero] = useState<HeroDefinition | null>(null);

  const allHeroes = Object.values(HERO_DEFINITIONS);

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      backgroundColor: theme.colors.background,
      display: 'flex',
      flexDirection: 'column',
      padding: '40px',
      color: theme.colors.textPrimary,
      overflowY: 'auto'
    }}>
      <div style={{ marginBottom: '40px' }}>
        <button onClick={onBack} style={{
          background: 'none',
          border: 'none',
          color: theme.colors.textSecondary,
          cursor: 'pointer',
          fontSize: '16px',
          marginBottom: '10px',
          padding: 0,
          textDecoration: 'underline'
        }}>
          ← Back to Menu
        </button>
        <h1 style={{ margin: 0, fontSize: '32px', textTransform: 'uppercase', color: theme.colors.accent }}>Roster & Codex</h1>
        <div style={{ color: theme.colors.textMuted }}>Your Unlocked Citizens</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
        {allHeroes.map((hero) => {
          // Mock unlocking and leveling logic
          const isUnlocked = true;
          const mockLevel = hero.id === 'eden' ? 3 : 1;
          const mockCards = hero.id === 'eden' ? 4 : 8;
          const mockCardsNeeded = mockLevel * 5;

          return (
            <div 
              key={hero.id} 
              onClick={() => isUnlocked && setSelectedHero(hero)}
              style={{
                backgroundColor: isUnlocked ? theme.colors.surface : 'rgba(30, 41, 59, 0.5)',
                border: `2px solid ${isUnlocked ? theme.colors.border : 'rgba(51, 65, 85, 0.5)'}`,
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                filter: isUnlocked ? 'none' : 'grayscale(100%)',
                opacity: isUnlocked ? 1 : 0.6,
                cursor: isUnlocked ? 'pointer' : 'default',
                transition: 'transform 0.1s',
                position: 'relative'
              }}
              onMouseOver={(e) => { if (isUnlocked) e.currentTarget.style.transform = 'scale(1.05)' }}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {isUnlocked && (
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '-10px',
                  backgroundColor: theme.colors.gold,
                  color: '#000',
                  fontWeight: 'bold',
                  width: '32px',
                  height: '32px',
                  borderRadius: '16px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.5)',
                  fontSize: '14px'
                }}>
                  L{mockLevel}
                </div>
              )}
              
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: isUnlocked ? 'rgba(255,255,255,0.05)' : theme.colors.textSecondary,
                border: `3px solid #${hero.color.toString(16).padStart(6, '0')}`,
                marginBottom: '15px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                {isUnlocked ? <HeroIcon color={`#${hero.color.toString(16).padStart(6, '0')}`} /> : '🔒'}
              </div>
              <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', color: isUnlocked ? theme.colors.textPrimary : theme.colors.textSecondary }}>
                {isUnlocked ? hero.name : 'Unknown'}
              </h3>
              <div style={{ fontSize: '12px', color: theme.colors.textMuted, marginBottom: '10px' }}>
                {isUnlocked ? hero.profession : '???'}
              </div>
              {isUnlocked && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.1)' }}>
                    {hero.damageType}
                  </span>
                  <div style={{ fontSize: '12px', color: mockCards >= mockCardsNeeded ? theme.colors.success : theme.colors.textSecondary }}>
                    Cards: {mockCards} / {mockCardsNeeded}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Hero Info Modal */}
      {selectedHero && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: theme.colors.background,
            border: `2px solid ${theme.colors.border}`,
            borderRadius: '16px',
            padding: '30px',
            width: '90%',
            maxWidth: '500px',
            position: 'relative'
          }}>
            <button 
              onClick={() => setSelectedHero(null)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'none',
                border: 'none',
                color: theme.colors.textSecondary,
                fontSize: '24px',
                cursor: 'pointer'
              }}
            >
              ×
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: `4px solid #${selectedHero.color.toString(16).padStart(6, '0')}`,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <HeroIcon color={`#${selectedHero.color.toString(16).padStart(6, '0')}`} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h2 style={{ margin: 0, fontSize: '28px', color: theme.colors.textPrimary }}>{selectedHero.name}</h2>
                  <div style={{
                    backgroundColor: theme.colors.gold,
                    color: '#000',
                    fontWeight: 'bold',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '14px'
                  }}>
                    Level {selectedHero.id === 'eden' ? 3 : 1}
                  </div>
                </div>
                <div style={{ color: theme.colors.textMuted, fontSize: '16px' }}>{selectedHero.profession}</div>
                <div style={{ marginTop: '5px' }}>
                  <span style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.1)' }}>
                    {selectedHero.damageType}
                  </span>
                  <span style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.1)', marginLeft: '10px' }}>
                    {selectedHero.attackKind === 'melee' ? 'Melee' : 'Ranged'}
                  </span>
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: theme.colors.surface,
              borderRadius: '8px',
              padding: '15px',
              marginBottom: '20px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              textAlign: 'center',
              gap: '10px'
            }}>
              <div>
                <div style={{ color: theme.colors.textMuted, fontSize: '12px' }}>Damage</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{selectedHero.damage}</div>
              </div>
              <div>
                <div style={{ color: theme.colors.textMuted, fontSize: '12px' }}>Atk Rate</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{(selectedHero.attackRateMs / 1000).toFixed(1)}s</div>
              </div>
              <div>
                <div style={{ color: theme.colors.textMuted, fontSize: '12px' }}>Range</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{selectedHero.range}px</div>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 5px 0', color: theme.colors.gold }}>★ Signature Skill: {selectedHero.signatureSkill.name}</h3>
              <p style={{ margin: 0, fontSize: '14px', color: theme.colors.textSecondary }}>{selectedHero.signatureSkill.description}</p>
            </div>

            {selectedHero.passive && (
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ margin: '0 0 5px 0', color: theme.colors.primary }}>❖ Passive: {selectedHero.passive.name}</h3>
                <p style={{ margin: 0, fontSize: '14px', color: theme.colors.textSecondary }}>{selectedHero.passive.description}</p>
              </div>
            )}

            {/* Upgrade Section */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              borderTop: `1px solid ${theme.colors.border}`,
              paddingTop: '20px'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '12px', color: theme.colors.textMuted }}>Cards Required</span>
                <span style={{ fontSize: '16px', fontWeight: 'bold', color: theme.colors.success }}>
                  {selectedHero.id === 'eden' ? '4 / 15' : '8 / 5'}
                </span>
              </div>
              <button style={{
                backgroundColor: (selectedHero.id === 'eden') ? 'rgba(34, 197, 94, 0.3)' : theme.colors.success,
                color: (selectedHero.id === 'eden') ? theme.colors.textSecondary : '#000',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: (selectedHero.id === 'eden') ? 'not-allowed' : 'pointer',
                textTransform: 'uppercase',
                transition: 'transform 0.1s'
              }}
              onMouseOver={(e) => { if (selectedHero.id !== 'eden') e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                Upgrade Hero
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
