import { useState, useEffect } from 'react';
import { theme } from '../theme';
import { gameToUiEvents, uiToGameEvents, type GameStateSnapshot, type DropOption } from '../../game/core/GameEvents';

interface BattleHUDProps {
  onReturnToMenu: () => void;
}

export function BattleHUD({ onReturnToMenu }: BattleHUDProps) {
  const [state, setState] = useState<GameStateSnapshot>({
    barrierHp: 100,
    maxBarrierHp: 100,
    voicesCount: 0,
    maxVoicesCount: 3,
    waveActive: false,
    currentWave: 1,
    totalWaves: 3,
    isPaused: false,
    gameSpeed: 1,
    status: 'playing',
  });
  const [dropOptions, setDropOptions] = useState<DropOption[]>([]);

  useEffect(() => {
    const unsubState = gameToUiEvents.on('stateChanged', (newState: GameStateSnapshot) => {
      setState(newState);
    });

    const unsubVoices = gameToUiEvents.on('voicesFull', ({ options }: { options: DropOption[] }) => {
      setDropOptions(options);
    });

    return () => {
      unsubState();
      unsubVoices();
    };
  }, []);

  const handleSetSpeed = (speed: number) => {
    uiToGameEvents.emit('setSpeed', { speed });
  };

  const handleSurrender = () => {
    uiToGameEvents.emit('surrender', undefined);
  };

  const handleDebugSpawn = () => {
    uiToGameEvents.emit('debugSpawn', undefined);
  };

  const handleSelectDrop = (dropId: string) => {
    uiToGameEvents.emit('selectDrop', { dropId });
    setDropOptions([]);
  };

  const playBtnSound = () => {
    uiToGameEvents.emit('playSound', { key: 'sfx-btn-press' });
  };

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
      {/* Top HUD */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
        {/* Left: Barrier HP */}
        <div style={{
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          padding: '10px 20px',
          borderRadius: '8px',
          border: `2px solid ${theme.colors.border}`,
          pointerEvents: 'auto',
          color: theme.colors.textPrimary,
          fontWeight: 'bold',
          fontSize: '18px'
        }}>
          <div style={{ fontSize: '18px' }}>Barrier HP: {state.barrierHp}</div>
          <div style={{ fontSize: '14px', color: theme.colors.textSecondary, marginTop: '4px' }}>
            {state.waveActive ? `Wave ${state.currentWave} / ${state.totalWaves}` : 'Waiting for Deployment'}
          </div>
        </div>

        {/* Center: Voices */}
        <div style={{
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          padding: '10px 20px',
          borderRadius: '8px',
          border: `2px solid ${theme.colors.border}`,
          pointerEvents: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '5px'
        }}>
          <div style={{ color: theme.colors.textPrimary, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Voices</div>
          <div style={{ width: '150px', height: '12px', backgroundColor: theme.colors.surface, borderRadius: '6px', overflow: 'hidden' }}>
            <div style={{ width: `${(state.voicesCount / state.maxVoicesCount) * 100}%`, height: '100%', backgroundColor: theme.colors.accent, transition: 'width 0.3s' }} />
          </div>
        </div>

        {/* Right: Controls */}
        <div style={{ display: 'flex', gap: '10px', pointerEvents: 'auto', alignItems: 'center' }}>
          {/* Speed Controls */}
          <div style={{ display: 'flex', gap: '5px', backgroundColor: theme.colors.surface, padding: '4px', borderRadius: '8px', border: `1px solid ${theme.colors.border}` }}>
            <button onClick={() => { handleSetSpeed(0); playBtnSound(); }} style={{
              padding: '6px 12px',
              backgroundColor: state.gameSpeed === 0 ? theme.colors.primary : 'transparent',
              color: state.gameSpeed === 0 ? '#fff' : theme.colors.textSecondary,
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }} title="Pause">⏸</button>
            <button onClick={() => { handleSetSpeed(1); playBtnSound(); }} style={{
              padding: '6px 12px',
              backgroundColor: state.gameSpeed === 1 ? theme.colors.primary : 'transparent',
              color: state.gameSpeed === 1 ? '#fff' : theme.colors.textSecondary,
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }} title="Normal Speed">▶</button>
            <button onClick={() => { handleSetSpeed(2); playBtnSound(); }} style={{
              padding: '6px 12px',
              backgroundColor: state.gameSpeed === 2 ? theme.colors.primary : 'transparent',
              color: state.gameSpeed === 2 ? '#fff' : theme.colors.textSecondary,
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }} title="Fast Forward">⏩</button>
          </div>

          <button onClick={() => { handleDebugSpawn(); playBtnSound(); }} style={{
            padding: '8px 16px',
            backgroundColor: theme.colors.accent,
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}>
            Debug Spawn
          </button>

          <button onClick={() => { handleSurrender(); playBtnSound(); }} style={{
            padding: '8px 16px',
            backgroundColor: theme.colors.danger,
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}>
            Surrender
          </button>
        </div>
      </div>

      {/* Bottom HUD - Start Wave Button */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '15px', pointerEvents: 'auto' }}>
      </div>

      {/* Drop Selection Modal */}
      {dropOptions.length > 0 && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'auto',
          zIndex: 100
        }}>
          <h1 style={{ color: theme.colors.textPrimary, textShadow: '2px 2px 4px #000', marginBottom: '30px' }}>
            A Voice Rises! Choose a Boon
          </h1>
          <div style={{ display: 'flex', gap: '20px' }}>
            {dropOptions.map(option => (
              <div 
                key={option.id}
                onClick={() => { handleSelectDrop(option.id); playBtnSound(); }}
                style={{
                  width: '200px',
                  height: '250px',
                  backgroundColor: theme.colors.surface,
                  border: `3px solid ${theme.colors.border}`,
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.1s',
                  boxShadow: '0 8px 0 #0f172a'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <h2 style={{ color: '#fff', fontSize: '20px', textAlign: 'center', marginBottom: '15px' }}>{option.title}</h2>
                <p style={{ color: '#ccc', textAlign: 'center', fontSize: '14px' }}>{option.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Game Over Overlay */}
      {(state.status === 'won' || state.status === 'lost') && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: state.status === 'won' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'auto',
          zIndex: 200,
          backdropFilter: 'blur(4px)'
        }}>
          <h1 style={{ 
            color: '#fff', 
            fontSize: '64px',
            textShadow: '0 4px 8px rgba(0,0,0,0.5)', 
            marginBottom: '10px',
            textTransform: 'uppercase',
            fontWeight: '900',
            letterSpacing: '4px'
          }}>
            {state.status === 'won' ? 'Victory' : 'Barrier Breached'}
          </h1>
          
          <div style={{ color: '#fff', fontSize: '18px', marginBottom: '30px', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            {state.status === 'won' ? 'The barrier holds strong.' : 'The barrier was overwhelmed.'}
          </div>

          <div style={{
            backgroundColor: theme.colors.surface,
            border: `2px solid ${theme.colors.border}`,
            borderRadius: '16px',
            padding: '30px',
            width: '100%',
            maxWidth: '400px',
            textAlign: 'center',
            marginBottom: '30px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
          }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', color: theme.colors.textPrimary, textTransform: 'uppercase' }}>
              Spoils of War
            </h2>
            
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px' }}>
              <div style={{ fontSize: '32px' }}>✨</div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '36px', fontWeight: 'bold', color: theme.colors.gold }}>
                  +{state.status === 'won' ? 250 : 50}
                </span>
                <span style={{ fontSize: '14px', color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: '2px' }}>Hope Earned</span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => { onReturnToMenu(); playBtnSound(); }}
            style={{
              padding: '16px 32px',
              backgroundColor: '#1e293b',
              color: '#fff',
              border: `2px solid ${theme.colors.border}`,
              borderRadius: '8px',
              fontSize: '24px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: `0 4px 0 ${theme.colors.border}`
            }}
          >
            RETURN TO MENU
          </button>
        </div>
      )}
    </div>
  );
}
