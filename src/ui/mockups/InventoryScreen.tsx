import { useState } from 'react';
import { theme } from '../theme';
import { HERO_DEFINITIONS, type HeroDefinition } from '../../game/data/balance';

interface InventoryScreenProps {
  onBack: () => void;
}

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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
        {allHeroes.map((hero) => {
          // Mock unlocking logic - assume all are unlocked for prototype
          const isUnlocked = true;

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
              }}
              onMouseOver={(e) => { if (isUnlocked) e.currentTarget.style.transform = 'scale(1.05)' }}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: isUnlocked ? `#${hero.color.toString(16).padStart(6, '0')}` : theme.colors.textSecondary,
                marginBottom: '15px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '32px'
              }}>
                {isUnlocked ? '👤' : '🔒'}
              </div>
              <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', color: isUnlocked ? theme.colors.textPrimary : theme.colors.textSecondary }}>
                {isUnlocked ? hero.name : 'Unknown'}
              </h3>
              <div style={{ fontSize: '12px', color: theme.colors.textMuted, marginBottom: '10px' }}>
                {isUnlocked ? hero.profession : '???'}
              </div>
              {isUnlocked && (
                <span style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.1)' }}>
                  {hero.damageType}
                </span>
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
                backgroundColor: `#${selectedHero.color.toString(16).padStart(6, '0')}`,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '48px'
              }}>
                👤
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '28px', color: theme.colors.textPrimary }}>{selectedHero.name}</h2>
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

            <div style={{ marginBottom: '15px' }}>
              <h3 style={{ margin: '0 0 5px 0', color: theme.colors.gold }}>★ Signature Skill: {selectedHero.signatureSkill.name}</h3>
              <p style={{ margin: 0, fontSize: '14px', color: theme.colors.textSecondary }}>{selectedHero.signatureSkill.description}</p>
            </div>

            {selectedHero.passive && (
              <div>
                <h3 style={{ margin: '0 0 5px 0', color: theme.colors.primary }}>❖ Passive: {selectedHero.passive.name}</h3>
                <p style={{ margin: 0, fontSize: '14px', color: theme.colors.textSecondary }}>{selectedHero.passive.description}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
