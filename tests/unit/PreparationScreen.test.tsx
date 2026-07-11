import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { PreparationScreen } from '../../src/ui/mockups/PreparationScreen';
import { HERO_DEFINITIONS } from '../../src/game/data/heroes';

/**
 * The Briefing Room does NOT pre-select a squad — workers arrive mid-battle
 * from the Voices meter. It only *hints* which recruited workers counter this
 * stage's telegraphed weaknesses. Hero references resolve from HERO_DEFINITIONS by id so
 * assertions follow the data if names/damage types are retuned.
 */
function renderScreen(onDeploy = vi.fn()) {
  // Test with Act 1, Stage 1 which has Grunts (weak to physical)
  render(<PreparationScreen act={1} stageIdx={0} onBack={vi.fn()} onDeploy={onDeploy} />);
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
    // For Stage 1, Grunt is expected, which is assigned 'physical' weakness in the mock.
    // 'student' has 'physical' damage type.
    expect(screen.getByText(HERO_DEFINITIONS['student'].name)).toBeInTheDocument();
    expect(screen.getAllByText(/Counters Grunt/).length).toBeGreaterThan(0);
  });

  it('has no interactive squad selection (workers arrive from drops)', () => {
    renderScreen();
    expect(screen.queryByRole('button', { name: /to squad/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /remove .* from squad/i })).not.toBeInTheDocument();
  });

  it('deploys when the deploy CTA is pressed', () => {
    const { onDeploy } = renderScreen();
    fireEvent.click(screen.getByRole('button', { name: /deploy to the streets/i }));
    expect(onDeploy).toHaveBeenCalledTimes(1);
  });
});
