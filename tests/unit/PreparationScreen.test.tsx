import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { PreparationScreen } from '../../src/ui/mockups/PreparationScreen';
import { HERO_DEFINITIONS } from '../../src/game/data/heroes';

/**
 * The Briefing Room does NOT pre-select a squad — workers arrive mid-battle
 * from the Voices meter. It only *hints* which recruited workers counter this
 * stage's telegraphed weaknesses (Fire → Troll Bot, Frost → Fixer,
 * Earth → Red Tape). Hero references resolve from HERO_DEFINITIONS by id so
 * assertions follow the data if names/damage types are retuned.
 *
 * Recruited counters for this stage: baker (Fire), taho_vendor (Frost),
 * street_sweeper (Earth).
 */
function renderScreen(onDeploy = vi.fn()) {
  render(<PreparationScreen onBack={vi.fn()} onDeploy={onDeploy} />);
  return { onDeploy };
}

describe('PreparationScreen companion hints', () => {
  it('shows Eden as the wave-1 leader', () => {
    renderScreen();
    expect(screen.getByText(HERO_DEFINITIONS['eden'].name)).toBeInTheDocument();
    expect(screen.getByText(/deploys at wave 1/i)).toBeInTheDocument();
  });

  it('recommends recruited workers that counter the stage weaknesses', () => {
    renderScreen();
    for (const id of ['baker', 'taho_vendor', 'street_sweeper'] as const) {
      expect(screen.getByText(HERO_DEFINITIONS[id].name)).toBeInTheDocument();
    }
    expect(screen.getByText(/Counters Troll Bot/)).toBeInTheDocument();
    expect(screen.getByText(/Counters Fixer/)).toBeInTheDocument();
    expect(screen.getByText(/Counters Red Tape/)).toBeInTheDocument();
  });

  it('has no interactive squad selection (workers arrive from drops)', () => {
    renderScreen();
    expect(screen.queryByRole('button', { name: /to squad/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /remove .* from squad/i })).not.toBeInTheDocument();
    // Every telegraphed weakness has a recruited counter → no organizer warning.
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('deploys when the deploy CTA is pressed', () => {
    const { onDeploy } = renderScreen();
    fireEvent.click(screen.getByRole('button', { name: /deploy to the streets/i }));
    expect(onDeploy).toHaveBeenCalledTimes(1);
  });
});
