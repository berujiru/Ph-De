import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { LoadingScreen } from '../../src/ui/mockups/LoadingScreen';

describe('LoadingScreen', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('renders the title and an initial progress read-out', () => {
    render(<LoadingScreen onComplete={vi.fn()} />);
    expect(screen.getByText('FIRST RIPPLE')).toBeInTheDocument();
    // Progress starts before any timer tick.
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('renders exactly two concentric ripple rings, contained in a bounded box', () => {
    const { container } = render(<LoadingScreen onComplete={vi.fn()} />);
    const rings = container.querySelectorAll('.ripple-ring');
    expect(rings).toHaveLength(2);
    // The ring box must be a percentage of a bounded parent (never a raw vw/vh
    // that could overflow the portrait frame) so the outermost ring stays in view.
    rings.forEach((ring) => {
      expect((ring as HTMLElement).style.width).toBe('100%');
      expect((ring as HTMLElement).style.borderRadius).toBe('50%');
    });
  });
});
