import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { PreparationScreen } from '../../src/ui/mockups/PreparationScreen';
import { HERO_DEFINITIONS, type HeroId } from '../../src/game/data/balance';

/**
 * Guards the squad-coverage warning + roster disabled-state logic in
 * PreparationScreen. Hero references are looked up from HERO_DEFINITIONS by
 * id so the assertions follow the data if names/damage types are retuned —
 * only the stage's enemy intel (Fire/Frost/Earth weaknesses) is treated as
 * fixed content of this screen.
 *
 * Covering heroes for this stage's telegraphed weaknesses:
 *   baker → Fire (Troll Bot), taho_vendor → Frost (Fixer),
 *   street_sweeper → Earth (Red Tape).
 */
function addHero(id: HeroId) {
  const hero = HERO_DEFINITIONS[id];
  fireEvent.click(
    screen.getByRole('button', { name: `Add ${hero.name} (${hero.damageType}) to squad` }),
  );
}

function renderScreen() {
  return render(<PreparationScreen onBack={vi.fn()} onDeploy={vi.fn()} />);
}

describe('PreparationScreen squad coverage', () => {
  it('warns about uncovered enemies and every open slot on an empty squad', () => {
    renderScreen();
    const note = screen.getByRole('status');
    // Eden only covers Physical, so all three telegraphed weaknesses are open.
    expect(within(note).getByText(/no Fire, Frost, Earth coverage/i)).toBeInTheDocument();
    expect(within(note).getByText(/Troll Bot, Fixer, Red Tape/)).toBeInTheDocument();
    expect(within(note).getByText(/4 squad slots still open/i)).toBeInTheDocument();
  });

  it('drops an enemy from the coverage warning once a matching damage type is picked', () => {
    renderScreen();
    addHero('baker'); // Fire → covers Troll Bot
    const note = screen.getByRole('status');
    expect(within(note).queryByText(/Troll Bot/)).not.toBeInTheDocument();
    expect(within(note).getByText(/no Frost, Earth coverage/i)).toBeInTheDocument();
    expect(within(note).getByText(/Fixer, Red Tape/)).toBeInTheDocument();
    expect(within(note).getByText(/3 squad slots still open/i)).toBeInTheDocument();
  });

  it('hides the organizer note once the squad is full and all weaknesses are covered', () => {
    renderScreen();
    addHero('baker'); // Fire
    addHero('taho_vendor'); // Frost
    addHero('street_sweeper'); // Earth
    addHero('teacher'); // fills the 4th slot; coverage already complete
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('still warns when the squad is full but a weakness is left uncovered', () => {
    renderScreen();
    // Four heroes, none of them Fire/Frost/Earth → no open slots but no coverage.
    addHero('teacher'); // Physical
    addHero('student'); // Physical
    addHero('jeepney_driver'); // Wind
    addHero('fisherfolk'); // Water
    const note = screen.getByRole('status');
    expect(within(note).getByText(/no Fire, Frost, Earth coverage/i)).toBeInTheDocument();
    expect(within(note).queryByText(/squad slots still open/i)).not.toBeInTheDocument();
  });

  it('disables the remaining roster once four heroes are chosen', () => {
    renderScreen();
    addHero('baker');
    addHero('taho_vendor');
    addHero('street_sweeper');
    addHero('teacher');
    // A hero not in the squad can no longer be added.
    const electrician = HERO_DEFINITIONS['electrician'];
    expect(
      screen.getByRole('button', {
        name: `Add ${electrician.name} (${electrician.damageType}) to squad`,
      }),
    ).toBeDisabled();
  });

  it('re-opens a slot when a squad member is removed', () => {
    renderScreen();
    addHero('baker');
    const baker = HERO_DEFINITIONS['baker'];
    fireEvent.click(screen.getByRole('button', { name: `Remove ${baker.name} from squad slot 1` }));
    expect(within(screen.getByRole('status')).getByText(/4 squad slots still open/i)).toBeInTheDocument();
  });
});
