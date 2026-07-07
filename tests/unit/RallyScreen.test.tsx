import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { RallyScreen } from '../../src/ui/components/RallyScreen';
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
    activeHeroes: [],
    activeEnemies: [],
    ...overrides,
  };
}

describe('RallyScreen', () => {
  it('renders the floating HUD with no drop overlay or game-over modal by default', () => {
    render(<RallyScreen onReturnToMenu={vi.fn()} />);
    expect(screen.queryByText('A Voice Rises!')).not.toBeInTheDocument();
    expect(screen.queryByText('Spoils of War')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Game speed' })).toBeEnabled();
  });

  it('shows the drop overlay on voicesFull, hiding hero descriptions and showing Buhis-Buhay risk', () => {
    render(<RallyScreen onReturnToMenu={vi.fn()} />);
    const options: DropOption[] = [
      { id: 'hero:eden', title: 'New Hero: Eden', description: 'Joins the rally.', type: 'spawn', rarity: 'epic', kind: 'hero', damageType: 'Physical' },
      { id: 'b', title: 'Sharper Chants', description: '+10% damage.', type: 'damage' },
      { id: 'c', title: 'Overtime', description: '+200% attack speed.', type: 'speed', rarity: 'rare', kind: 'buhisBuhay', risk: 'barrier healing pauses' },
    ];
    act(() => gameToUiEvents.emit('voicesFull', { options }));

    expect(screen.getByText('A Voice Rises!')).toBeInTheDocument();
    expect(screen.getByText('New Hero: Eden')).toBeInTheDocument();
    // Hero recruit drops hide the description copy (portrait + name carry it).
    expect(screen.queryByText('Joins the rally.')).not.toBeInTheDocument();
    // Non-hero drops still show their purpose copy.
    expect(screen.getByText('+10% damage.')).toBeInTheDocument();
    // Rarity is shown as stars only — no rarity label text.
    expect(screen.queryByText('Epic')).not.toBeInTheDocument();
    expect(screen.queryByText('Common')).not.toBeInTheDocument();
    // Buhis-Buhay drops carry an explicit risk line
    expect(screen.getByText(/high risk: barrier healing pauses/i)).toBeInTheDocument();
  });

  it('emits selectDrop and closes the overlay when a card is chosen', () => {
    render(<RallyScreen onReturnToMenu={vi.fn()} />);
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
    render(<RallyScreen onReturnToMenu={onReturnToMenu} />);
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
    render(<RallyScreen onReturnToMenu={vi.fn()} />);
    act(() => gameToUiEvents.emit('stateChanged', snapshot({ status: 'lost', barrierHp: 0, currentWave: 3 })));

    expect(screen.getByText('The Rally Breaks')).toBeInTheDocument();
    expect(screen.getByText(/people woke up today/i)).toBeInTheDocument();
    expect(screen.getByText('Hope Points')).toBeInTheDocument();
    expect(screen.getByText(/a failed defense still wakes people up/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
  });

  it('disables battle controls once the run is over', () => {
    render(<RallyScreen onReturnToMenu={vi.fn()} />);
    act(() => gameToUiEvents.emit('stateChanged', snapshot({ status: 'won' })));

    expect(screen.getByRole('button', { name: 'Game speed' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Surrender' })).toBeDisabled();
  });

  it('cycles the speed control 1x → 2x → paused → 1x', () => {
    render(<RallyScreen onReturnToMenu={vi.fn()} />);
    const setSpeed = vi.fn();
    const unsub = uiToGameEvents.on('setSpeed', setSpeed);
    const btn = screen.getByRole('button', { name: 'Game speed' });

    fireEvent.click(btn); // 1x -> 2x
    expect(setSpeed).toHaveBeenLastCalledWith({ speed: 2 });

    act(() => gameToUiEvents.emit('stateChanged', snapshot({ gameSpeed: 2 })));
    fireEvent.click(btn); // 2x -> paused
    expect(setSpeed).toHaveBeenLastCalledWith({ speed: 0 });

    act(() => gameToUiEvents.emit('stateChanged', snapshot({ gameSpeed: 0 })));
    fireEvent.click(btn); // paused -> 1x
    expect(setSpeed).toHaveBeenLastCalledWith({ speed: 1 });
    unsub();
  });

  it('pauses on opening Battle Intel and restores the previous speed on close', () => {
    render(<RallyScreen onReturnToMenu={vi.fn()} />);
    act(() => gameToUiEvents.emit('stateChanged', snapshot({ gameSpeed: 2 })));

    const setSpeed = vi.fn();
    const unsub = uiToGameEvents.on('setSpeed', setSpeed);

    fireEvent.click(screen.getByRole('button', { name: 'Battle Intel' }));
    expect(screen.getByText('Battle Intel', { selector: 'h2' })).toBeInTheDocument();
    expect(setSpeed).toHaveBeenCalledWith({ speed: 0 });

    fireEvent.click(screen.getByRole('button', { name: 'Close intel' }));
    expect(setSpeed).toHaveBeenLastCalledWith({ speed: 2 });
    expect(setSpeed).toHaveBeenCalledTimes(2);
    unsub();
  });

  it('does not unpause a user-paused game when Battle Intel closes', () => {
    render(<RallyScreen onReturnToMenu={vi.fn()} />);
    act(() => gameToUiEvents.emit('stateChanged', snapshot({ isPaused: true, gameSpeed: 0 })));

    const setSpeed = vi.fn();
    const unsub = uiToGameEvents.on('setSpeed', setSpeed);

    fireEvent.click(screen.getByRole('button', { name: 'Battle Intel' }));
    fireEvent.click(screen.getByRole('button', { name: 'Close intel' }));

    expect(setSpeed).not.toHaveBeenCalled();
    unsub();
  });

  it('does not emit a resume into a finished game when Battle Intel closes', () => {
    render(<RallyScreen onReturnToMenu={vi.fn()} />);

    const setSpeed = vi.fn();
    const unsub = uiToGameEvents.on('setSpeed', setSpeed);

    fireEvent.click(screen.getByRole('button', { name: 'Battle Intel' }));
    expect(setSpeed).toHaveBeenCalledWith({ speed: 0 });
    setSpeed.mockClear();

    act(() => gameToUiEvents.emit('stateChanged', snapshot({ status: 'lost', barrierHp: 0 })));
    fireEvent.click(screen.getByRole('button', { name: 'Close intel' }));

    expect(setSpeed).not.toHaveBeenCalled();
    unsub();
  });
});
