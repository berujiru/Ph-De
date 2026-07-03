import { useEffect, useState } from 'react';
import { gameToUiEvents, uiToGameEvents, type GameStateSnapshot } from '../game/core/GameEvents';
import { TOWER_DEFINITIONS, type TowerId } from '../game/data/balance';

const INITIAL_STATE: GameStateSnapshot = {
  gold: 0,
  lives: 0,
  waveNumber: 0,
  totalWaves: 0,
  waveActive: false,
  status: 'playing',
};

export function HUD() {
  const [state, setState] = useState<GameStateSnapshot>(INITIAL_STATE);
  const [selectedTower, setSelectedTower] = useState<TowerId | null>(null);

  useEffect(() => gameToUiEvents.on('stateChanged', setState), []);

  function selectTower(id: TowerId) {
    const next = selectedTower === id ? null : id;
    setSelectedTower(next);
    uiToGameEvents.emit('selectTowerType', next);
  }

  function startWave() {
    uiToGameEvents.emit('startWave', undefined);
  }

  function restart() {
    setSelectedTower(null);
    uiToGameEvents.emit('restart', undefined);
  }

  return (
    <div className="hud">
      <div className="hud-stats">
        <span className="stat stat-gold">Gold: {state.gold}</span>
        <span className="stat stat-lives">Lives: {state.lives}</span>
        <span className="stat">
          Wave: {state.waveNumber}/{state.totalWaves}
        </span>
      </div>

      <div className="hud-towers">
        {Object.values(TOWER_DEFINITIONS).map((definition) => (
          <button
            key={definition.id}
            type="button"
            className={selectedTower === definition.id ? 'tower-btn selected' : 'tower-btn'}
            disabled={state.gold < definition.cost || state.status !== 'playing'}
            onClick={() => selectTower(definition.id)}
          >
            {definition.name}
            <span className="tower-cost">{definition.cost}g</span>
          </button>
        ))}
        <button
          type="button"
          className="start-wave-btn"
          onClick={startWave}
          disabled={state.waveActive || state.status !== 'playing'}
        >
          {state.waveActive ? 'Wave in progress…' : 'Start Wave'}
        </button>
      </div>

      {state.status !== 'playing' && (
        <div className="game-over-overlay">
          <p>{state.status === 'won' ? 'Victory!' : 'Defeat'}</p>
          <button type="button" onClick={restart}>
            Restart
          </button>
        </div>
      )}
    </div>
  );
}
