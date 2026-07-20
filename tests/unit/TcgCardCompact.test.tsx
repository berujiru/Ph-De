import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { HeroTcgCard } from '../../src/ui/components/HeroTcgCard';
import { EnemyTcgCard } from '../../src/ui/components/EnemyTcgCard';

describe('HeroTcgCard compact variant', () => {
  it('renders the name strip but none of the full-card stats', () => {
    const onClick = vi.fn();
    render(<HeroTcgCard variant="compact" heroId="eden" onClick={onClick} />);
    expect(screen.getByText('Eden')).toBeInTheDocument();
    expect(screen.queryByText(/DMG:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/SKILL:/)).not.toBeInTheDocument();
  });

  it('is a keyboard-accessible button when onClick is given', () => {
    const onClick = vi.fn();
    render(<HeroTcgCard variant="compact" heroId="eden" onClick={onClick} ariaLabel="Open dossier: Eden" />);
    const card = screen.getByRole('button', { name: 'Open dossier: Eden' });
    fireEvent.click(card);
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('has no button semantics without onClick', () => {
    render(<HeroTcgCard variant="compact" heroId="eden" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('full variant (default) still renders stats and skill text without button semantics', () => {
    render(<HeroTcgCard heroId="eden" />);
    expect(screen.getByText(/DMG:/)).toBeInTheDocument();
    expect(screen.getByText(/SKILL:/)).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

describe('EnemyTcgCard compact variant', () => {
  it('faced: renders name, portrait img, and fires onClick via click and Enter', () => {
    const onClick = vi.fn();
    render(<EnemyTcgCard variant="compact" enemyId="grunt" onClick={onClick} />);
    expect(screen.getByText('Petty Corruptor')).toBeInTheDocument();
    expect(screen.getByAltText('Petty Corruptor')).toBeInTheDocument();
    const card = screen.getByRole('button', { name: 'View Petty Corruptor' });
    fireEvent.click(card);
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('sealed: hides name and art, shows the redacted back, and ignores onClick', () => {
    const onClick = vi.fn();
    const { container } = render(
      <EnemyTcgCard variant="compact" enemyId="grunt" isFacedUp={false} onClick={onClick} />,
    );
    expect(screen.queryByText('Petty Corruptor')).not.toBeInTheDocument();
    expect(screen.getByText('██████')).toBeInTheDocument();
    expect(screen.getByText('?')).toBeInTheDocument();
    // No portrait request at all for sealed entries
    expect(container.querySelector('img')).toBeNull();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('██████'));
    expect(onClick).not.toHaveBeenCalled();
  });
});
