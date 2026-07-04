import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { BattleHUD } from '../../src/ui/mockups/BattleHUD';
import {
  gameToUiEvents,
  uiToGameEvents,
  type DropOption,
  type GameStateSnapshot,
} from '../../src/game/core/GameEvents';

function snapshot(overrides: Partial<GameStateSnapshot> = {}): GameStateSnapshot {
  return {
    barrierHp: 100,
    maxBarrierHp: 100,
    voicesCount: 1,
    maxVoicesCount: 3,
    waveActive: true,
    currentWave: 2,
    totalWaves: 5,
    isPaused: false,
    gameSpeed: 1,
    status: 'playing',
    ...overrides,
  };
}

describe('BattleHUD', () => {
  it('renders the floating HUD with no drop overlay or game-over modal by default', () => {
    render(<BattleHUD onReturnToMenu={vi.fn()} />);
    expect(screen.queryByText('A Voice Rises!')).not.toBeInTheDocument();
    expect(screen.queryByText('Spoils of War')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pause' })).toBeEnabled();
  });

  it('shows the drop overlay on voicesFull, including rarity and Buhis-Buhay risk framing', () => {
    render(<BattleHUD onReturnToMenu={vi.fn()} />);
    const options: DropOption[] = [
      { id: 'a', title: 'New Hero: Eden', description: 'Joins the rally.', type: 'spawn', rarity: 'epic', kind: 'hero', damageType: 'Physical' },
      { id: 'b', title: 'Sharper Chants', description: '+10% damage.', type: 'damage' },
      { id: 'c', title: 'Overtime', description: '+200% attack speed.', type: 'speed', rarity: 'rare', kind: 'buhisBuhay', risk: 'barrier healing pauses' },
    ];
    act(() => gameToUiEvents.emit('voicesFull', { options }));

    expect(screen.getByText('A Voice Rises!')).toBeInTheDocument();
    expect(screen.getByText('New Hero: Eden')).toBeInTheDocument();
    expect(screen.getByText('Epic')).toBeInTheDocument();
    // Un-tagged option falls back to common rarity
    expect(screen.getByText('Common')).toBeInTheDocument();
    // Buhis-Buhay drops carry an explicit risk line
    expect(screen.getByText(/high risk: barrier healing pauses/i)).toBeInTheDocument();
  });

  it('emits selectDrop and closes the overlay when a card is chosen', () => {
    render(<BattleHUD onReturnToMenu={vi.fn()} />);
    const selected = vi.fn();
    const unsub = uiToGameEvents.on('selectDrop', selected);

    act(() =>
      gameToUiEvents.emit('voicesFull', {
        options: [{ id: 'drop-1', title: 'Sharper Chants', description: '+10% damage.', type: 'damage' }],
      }),
    );
    fireEvent.click(screen.getByRole('button', { name: /sharper chants/i }));

    expect(selected).toHaveBeenCalledWith({ dropId: 'drop-1' });
    expect(screen.queryByText('A Voice Rises!')).not.toBeInTheDocument();
    unsub();
  });

  it('shows the Victory Spoils of War with star ratings and a single Continue action', () => {
    const onReturnToMenu = vi.fn();
    render(<BattleHUD onReturnToMenu={onReturnToMenu} />);
    act(() => gameToUiEvents.emit('stateChanged', snapshot({ status: 'won', currentWave: 5 })));

    expect(screen.getByText('The Barrier Holds')).toBeInTheDocument();
    expect(screen.getByText('Spoils of War')).toBeInTheDocument();
    expect(screen.getByText('No breach')).toBeInTheDocument();
    expect(screen.getByText('Hope Points')).toBeInTheDocument();
    expect(screen.getByText('Hero Card Drops')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /continue/i }));
    expect(onReturnToMenu).toHaveBeenCalledTimes(1);
  });

  it('shows a hopeful Defeat frame that still pays out Hope Points', () => {
    render(<BattleHUD onReturnToMenu={vi.fn()} />);
    act(() => gameToUiEvents.emit('stateChanged', snapshot({ status: 'lost', barrierHp: 0, currentWave: 3 })));

    expect(screen.getByText('The Rally Breaks')).toBeInTheDocument();
    expect(screen.getByText(/people woke up today/i)).toBeInTheDocument();
    expect(screen.getByText('Hope Points')).toBeInTheDocument();
    expect(screen.getByText(/a failed defense still wakes people up/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
  });

  it('disables battle controls once the run is over', () => {
    render(<BattleHUD onReturnToMenu={vi.fn()} />);
    act(() => gameToUiEvents.emit('stateChanged', snapshot({ status: 'won' })));

    expect(screen.getByRole('button', { name: 'Pause' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Toggle game speed' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Dev: spawn hero' })).toBeDisabled();
  });
});
