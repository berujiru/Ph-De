import { useState } from 'react';
import { theme } from '../theme';
import { uiToGameEvents } from '../../game/core/GameEvents';
import { HERO_DEFINITIONS } from '../../game/data/balance';

interface SandboxHUDProps {
  onReturnToMenu: () => void;
}

export function SandboxHUD({ onReturnToMenu }: SandboxHUDProps) {
  const [selectedHero, setSelectedHero] = useState<string>('sandbox_projectile');
  const [gameSpeed, setGameSpeed] = useState<number>(1);

  const handleSetSpeed = (speed: number) => {
    setGameSpeed(speed);
    uiToGameEvents.emit('setSpeed', { speed });
  };

  const handleSpawnDummy = () => {
    uiToGameEvents.emit('debugSpawn', { heroId: selectedHero || undefined });
    playBtnSound();
  };

  const handleSpawnTarget = () => {
    uiToGameEvents.emit('spawnSandboxTarget', undefined);
    playBtnSound();
  };

  const playBtnSound = () => {
    uiToGameEvents.emit('playSound', { key: 'sfx-btn-press' });
  };

  const sandboxHeroes = Object.entries(HERO_DEFINITIONS).filter(([id]) => id.startsWith('sandbox_'));

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '20px'
    }}>
      {/* Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        {/* Left: Info */}
        <div style={{ pointerEvents: 'auto' }}>
          <div style={{
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            padding: '10px 20px',
            borderRadius: '8px',
            border: `2px solid ${theme.colors.accent}`,
            color: '#fff',
            marginBottom: '10px'
          }}>
            <h2 style={{ margin: 0, color: theme.colors.accent }}>ATTACK SANDBOX</h2>
            <div style={{ color: theme.colors.textMuted, fontSize: '12px' }}>Wave mechanics disabled.</div>
          </div>
        </div>

        {/* Right: Controls */}
        <div style={{ display: 'flex', gap: '10px', pointerEvents: 'auto', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '5px' }}>
            <select 
              value={selectedHero} 
              onChange={(e) => setSelectedHero(e.target.value)}
              style={{
                padding: '8px',
                backgroundColor: theme.colors.surface,
                color: '#fff',
                border: `1px solid ${theme.colors.border}`,
                borderRadius: '6px'
              }}
            >
              {sandboxHeroes.map(([id, def]) => (
                <option key={id} value={id}>{def.attackStyle.toUpperCase()}</option>
              ))}
            </select>
            <button onClick={handleSpawnDummy} style={{
              padding: '8px 16px',
              backgroundColor: theme.colors.accent,
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}>
              Spawn Attack
            </button>
          </div>

          <button onClick={handleSpawnTarget} style={{
            padding: '8px 16px',
            backgroundColor: theme.colors.danger,
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}>
            Drop Punching Bag
          </button>
          <div style={{ display: 'flex', gap: '5px', backgroundColor: theme.colors.surface, padding: '4px', borderRadius: '8px', border: `1px solid ${theme.colors.border}` }}>
            <button onClick={() => { handleSetSpeed(0); playBtnSound(); }} style={{
              padding: '6px 12px',
              backgroundColor: gameSpeed === 0 ? theme.colors.primary : 'transparent',
              color: gameSpeed === 0 ? '#fff' : theme.colors.textSecondary,
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}>II</button>
            <button onClick={() => { handleSetSpeed(1); playBtnSound(); }} style={{
              padding: '6px 12px',
              backgroundColor: gameSpeed === 1 ? theme.colors.primary : 'transparent',
              color: gameSpeed === 1 ? '#fff' : theme.colors.textSecondary,
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}>▶</button>
            <button onClick={() => { handleSetSpeed(2); playBtnSound(); }} style={{
              padding: '6px 12px',
              backgroundColor: gameSpeed === 2 ? theme.colors.primary : 'transparent',
              color: gameSpeed === 2 ? '#fff' : theme.colors.textSecondary,
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}>▶▶</button>
          </div>
          
          <button 
            onClick={() => { onReturnToMenu(); playBtnSound(); }}
            style={{
              padding: '8px 16px',
              backgroundColor: '#1e293b',
              color: '#fff',
              border: '1px solid #475569',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Leave Sandbox
          </button>
        </div>
      </div>
    </div>
  );
}
