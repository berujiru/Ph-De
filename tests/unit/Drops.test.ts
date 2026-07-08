import { describe, expect, it } from 'vitest';
import {
  buildCandidatePool,
  makeRng,
  rollDrops,
  type ActiveHeroState,
  type DropContext,
} from '../../src/game/core/Drops';
import { UPGRADE_DEFS, UPGRADE_MATRIX } from '../../src/game/data/drops';

/** A projectile hero (eligible for damage/attackSpeed/range/pierce). */
function projectileHero(overrides: Partial<ActiveHeroState> = {}): ActiveHeroState {
  return { id: 'eden', name: 'Eden', attackStyle: 'projectile', stacks: {}, ...overrides };
}

function baseCtx(overrides: Partial<DropContext> = {}): DropContext {
  return {
    currentWave: 1,
    activeHeroes: [projectileHero()],
    availableRecruits: [{ id: 'teacher', name: 'Teacher', purpose: 'Teaches' }],
    hasOpenSlot: true,
    barrierHp: 100,
    barrierMaxHp: 100,
    ...overrides,
  };
}

/** All candidate option ids the pool would ever produce for a context. */
function candidateIds(ctx: DropContext): string[] {
  // Use a fixed rng so the newHero recruit resolves deterministically.
  return buildCandidatePool(ctx, makeRng(1)).map((c) => c.option.id);
}

describe('rollDrops — determinism', () => {
  it('same seed + same context yields identical results', () => {
    const ctx = baseCtx();
    const a = rollDrops(ctx, makeRng(42), 3);
    const b = rollDrops(ctx, makeRng(42), 3);
    expect(a).toEqual(b);
  });

  it('different seeds can produce different orderings', () => {
    // Wide pool so ordering has room to vary.
    const ctx = baseCtx({
      activeHeroes: [
        projectileHero(),
        { id: 'call_center_agent', name: 'Agent', attackStyle: 'chain', stacks: {} },
        { id: 'fishball_vendor', name: 'Vendor', attackStyle: 'pierce', stacks: {} },
      ],
      barrierHp: 50,
    });
    const seeds = [1, 2, 3, 4, 5, 6, 7, 8].map((s) => rollDrops(ctx, makeRng(s), 3).map((o) => o.id).join('|'));
    expect(new Set(seeds).size).toBeGreaterThan(1);
  });
});

describe('rollDrops — count & distinctness', () => {
  it('returns 3 distinct options when the pool is large enough', () => {
    const ctx = baseCtx({ barrierHp: 50 });
    const opts = rollDrops(ctx, makeRng(7), 3);
    expect(opts).toHaveLength(3);
    expect(new Set(opts.map((o) => o.id)).size).toBe(3);
  });

  it('returns fewer than 3 when the legal pool is smaller', () => {
    // A summoner at full barrier, no recruits: only damage/attackSpeed/range.
    const ctx: DropContext = {
      activeHeroes: [{ id: 'construction_worker', name: 'Builder', attackStyle: 'summoner', stacks: {} }],
      availableRecruits: [],
      hasOpenSlot: false,
      barrierHp: 100,
      barrierMaxHp: 100,
    };
    const opts = rollDrops(ctx, makeRng(3), 5);
    expect(opts).toHaveLength(3); // damage, attackSpeed, range only
  });
});

describe('no dead drops — maxStacks exclusion', () => {
  it('does not offer an upgrade already at maxStacks', () => {
    const maxed = UPGRADE_DEFS.pierce.maxStacks;
    const ctx = baseCtx({
      activeHeroes: [projectileHero({ stacks: { pierce: maxed } })],
      hasOpenSlot: false,
      availableRecruits: [],
    });
    expect(candidateIds(ctx)).not.toContain('upgrade:eden:pierce');
    // Un-maxed universal stats still offered.
    expect(candidateIds(ctx)).toContain('upgrade:eden:damage');
  });

  it('still offers an upgrade that is one below maxStacks', () => {
    const ctx = baseCtx({
      activeHeroes: [projectileHero({ stacks: { pierce: UPGRADE_DEFS.pierce.maxStacks - 1 } })],
    });
    expect(candidateIds(ctx)).toContain('upgrade:eden:pierce');
  });

  it('excludes a hero entirely once every eligible upgrade is maxed', () => {
    const stacks = Object.fromEntries(
      UPGRADE_MATRIX.projectile.map((k) => [k, UPGRADE_DEFS[k].maxStacks]),
    );
    const ctx = baseCtx({
      activeHeroes: [projectileHero({ stacks })],
      hasOpenSlot: false,
      availableRecruits: [],
      barrierHp: 100,
      barrierMaxHp: 100,
    });
    expect(candidateIds(ctx)).toHaveLength(0);
  });
});

describe('style -> upgrade eligibility', () => {
  it('only offers behavior mods a style can consume', () => {
    // chain hero: chain eligible, pierce/radius are not.
    const ctx = baseCtx({
      activeHeroes: [{ id: 'call_center_agent', name: 'Agent', attackStyle: 'chain', stacks: {} }],
      hasOpenSlot: false,
      availableRecruits: [],
    });
    const ids = candidateIds(ctx);
    expect(ids).toContain('upgrade:call_center_agent:chain');
    expect(ids).not.toContain('upgrade:call_center_agent:pierce');
    expect(ids).not.toContain('upgrade:call_center_agent:radius');
  });

  it('never offers a behavior mod to a summoner (stats only)', () => {
    const ctx = baseCtx({
      activeHeroes: [{ id: 'construction_worker', name: 'Builder', attackStyle: 'summoner', stacks: {} }],
      hasOpenSlot: false,
      availableRecruits: [],
    });
    const ids = candidateIds(ctx);
    expect(ids).toEqual(
      expect.arrayContaining([
        'upgrade:construction_worker:damage',
        'upgrade:construction_worker:attackSpeed',
        'upgrade:construction_worker:range',
      ]),
    );
    expect(ids.some((id) => id.endsWith(':pierce') || id.endsWith(':chain') || id.endsWith(':radius'))).toBe(false);
  });

  it('offers pierce to pierce and projectile styles', () => {
    const proj = candidateIds(baseCtx({ activeHeroes: [projectileHero()], hasOpenSlot: false, availableRecruits: [] }));
    expect(proj).toContain('upgrade:eden:pierce');
    const pierce = candidateIds(
      baseCtx({
        activeHeroes: [{ id: 'student', name: 'Student', attackStyle: 'pierce', stacks: {} }],
        hasOpenSlot: false,
        availableRecruits: [],
      }),
    );
    expect(pierce).toContain('upgrade:student:pierce');
  });
});

describe('newHero gating', () => {
  it('offers a recruit when a slot is open and roster remains', () => {
    const ids = candidateIds(baseCtx());
    expect(ids).toContain('hero:teacher');
  });

  it('does not offer a recruit with no open slot', () => {
    const ids = candidateIds(baseCtx({ hasOpenSlot: false }));
    expect(ids.some((id) => id.startsWith('hero:'))).toBe(false);
  });

  it('does not offer a recruit when the roster is empty', () => {
    const ids = candidateIds(baseCtx({ availableRecruits: [] }));
    expect(ids.some((id) => id.startsWith('hero:'))).toBe(false);
  });

  it('carries the recruit purpose as the card description', () => {
    const pool = buildCandidatePool(baseCtx(), makeRng(1));
    const heroCard = pool.find((c) => c.option.id === 'hero:teacher');
    expect(heroCard?.option.kind).toBe('hero');
    expect(heroCard?.option.description).toBe('Teaches');
  });
});

describe('moraleHeal gating', () => {
  it('offers moraleHeal only when the barrier is damaged', () => {
    expect(candidateIds(baseCtx({ barrierHp: 100, barrierMaxHp: 100 }))).not.toContain('global:moraleHeal');
    expect(candidateIds(baseCtx({ barrierHp: 40, barrierMaxHp: 100 }))).toContain('global:moraleHeal');
  });
});
