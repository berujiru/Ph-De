import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { EnemyInfoCard } from '../../src/ui/mockups/EnemyInfoCard';

describe('EnemyInfoCard', () => {
  it('renders mock defaults with a tier tag when called without props', () => {
    render(<EnemyInfoCard />);
    expect(screen.getByText('Troll Bot')).toBeInTheDocument();
    expect(screen.getByText('Minion')).toBeInTheDocument();
    expect(screen.getByText('Weak to')).toBeInTheDocument();
    expect(screen.getByText('Resists')).toBeInTheDocument();
    // No onClose prop -> no close button rendered
    expect(screen.queryByRole('button', { name: /close enemy info/i })).not.toBeInTheDocument();
  });

  it('renders custom enemy data with damage-type chips and empty-state fallbacks', () => {
    render(
      <EnemyInfoCard
        name="Pork Barrel"
        tier="Boss"
        weakTo={['Fire', 'Holy']}
        resists={[]}
        behavior="Devours the budget and bloats with every bite."
      />,
    );
    expect(screen.getByText('Pork Barrel')).toBeInTheDocument();
    expect(screen.getByText('Boss')).toBeInTheDocument();
    expect(screen.getByText('Fire')).toBeInTheDocument();
    expect(screen.getByText('Holy')).toBeInTheDocument();
    expect(screen.getByText('None')).toBeInTheDocument();
    expect(screen.getByText(/devours the budget/i)).toBeInTheDocument();
  });

  it('shows a real close control when onClose is provided', () => {
    const onClose = vi.fn();
    render(<EnemyInfoCard onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: /close enemy info/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
