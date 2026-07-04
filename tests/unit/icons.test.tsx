import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { damageTypeIcons, MegaphoneIcon, StarIcon, StarOutlineIcon } from '../../src/ui/icons';
import { HERO_DEFINITIONS } from '../../src/game/data/balance';

describe('icon library', () => {
  it('has an icon for every damage type used by hero definitions', () => {
    const usedTypes = new Set(
      Object.values(HERO_DEFINITIONS).map((hero) => hero.damageType),
    );
    for (const type of usedTypes) {
      expect(damageTypeIcons[type], `missing icon for damage type "${type}"`).toBeDefined();
    }
  });

  it('renders damage-type icons as 24x24 stroke SVGs', () => {
    for (const [type, Icon] of Object.entries(damageTypeIcons)) {
      const { container, unmount } = render(<Icon />);
      const svg = container.querySelector('svg');
      expect(svg, `damage type "${type}" did not render an svg`).not.toBeNull();
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
      expect(svg).toHaveAttribute('stroke', 'currentColor');
      unmount();
    }
  });

  it('respects the size prop', () => {
    const { container } = render(<MegaphoneIcon size={44} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '44');
    expect(svg).toHaveAttribute('height', '44');
  });

  it('star variants differ (filled vs outline)', () => {
    const filled = render(<StarIcon />).container.querySelector('path');
    const outline = render(<StarOutlineIcon />).container.querySelector('path');
    expect(filled).toHaveAttribute('fill', 'currentColor');
    expect(outline).not.toHaveAttribute('fill');
  });
});
