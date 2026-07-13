import { describe, expect, it, vi } from 'vitest';
import { applyHeroSkill, applyHeroPassive, ISkillHero, ISkillEnemy, SkillContext } from '../../src/game/core/Skills';

function createDummyHero(id = 'dummy', x = 0, y = 0): ISkillHero {
  return {
    id,
    x,
    y,
    damage: 10,
    attackRateMs: 1000,
    currentSkillCooldown: 5000,
    isSkillReady: false,
  };
}

function createDummyEnemy(id = 'enemy', x = 0, y = 0, hp = 100): ISkillEnemy {
  return {
    id,
    x,
    y,
    hp,
    isDead: false,
    activeAilments: {},
    definition: {
      maxHp: hp,
      speed: 50,
      damage: 10,
    },
    takeDamage: function(amount: number) {
      this.hp -= amount;
      if (this.hp <= 0) this.isDead = true;
    }
  };
}

function createDummyContext(heroes: ISkillHero[] = [], enemies: ISkillEnemy[] = []): SkillContext {
  return {
    GAME_WIDTH: 1080,
    GAME_HEIGHT: 1920,
    heroes,
    enemies,
    onVisual: vi.fn(),
  };
}

describe('Hero Passives', () => {
  it('farmer passive roots the enemy 20% of the time', () => {
    // We mock Math.random to guarantee it triggers
    vi.spyOn(Math, 'random').mockReturnValue(0.1);
    const hero = createDummyHero('farmer');
    const enemy = createDummyEnemy();
    const ctx = createDummyContext();

    applyHeroPassive('farmer', hero, enemy, ctx);
    
    expect(enemy.activeAilments['freeze']).toBe(100);
    expect(ctx.onVisual).toHaveBeenCalledWith(expect.objectContaining({ type: 'text', text: 'ROOTED!' }));
    
    vi.restoreAllMocks();
  });

  it('teacher passive applies mark', () => {
    const hero = createDummyHero('teacher');
    const enemy = createDummyEnemy();
    const ctx = createDummyContext();

    applyHeroPassive('teacher', hero, enemy, ctx);
    expect(enemy.activeAilments['marked']).toBe(100);
  });
});

describe('Hero Skills', () => {
  it('eden (Rally) halves attack rate for all heroes', () => {
    const h1 = createDummyHero('eden');
    const h2 = createDummyHero('dummy');
    const ctx = createDummyContext([h1, h2]);

    applyHeroSkill('eden', h1, ctx);

    expect(h1.attackRateMs).toBe(500);
    expect(h2.attackRateMs).toBe(500);
    expect(ctx.onVisual).toHaveBeenCalledWith(expect.objectContaining({ type: 'text', text: 'RALLY!' }));
    expect(ctx.onVisual).toHaveBeenCalledWith(expect.objectContaining({ type: 'delayedRevertAttackRate', amount: 1000 }));
  });

  it('student (Cramming) resets cooldown for 1 adjacent hero', () => {
    // Make sure random always picks the first valid adjacent hero
    vi.spyOn(Math, 'random').mockReturnValue(0);
    
    const h1 = createDummyHero('student', 0, 0); // Source
    const h2 = createDummyHero('h2', 50, 0); // Adjacent
    const h3 = createDummyHero('h3', 500, 0); // Too far
    
    const ctx = createDummyContext([h1, h2, h3]);

    applyHeroSkill('student', h1, ctx);

    // h2 is adjacent and should be reset
    expect(h2.currentSkillCooldown).toBe(0);
    expect(h2.isSkillReady).toBe(true);

    // h3 is too far and should not be reset
    expect(h3.currentSkillCooldown).toBe(5000);
    expect(h3.isSkillReady).toBe(false);

    vi.restoreAllMocks();
  });

  it('jeepney_driver (Barya) damages enemies in a cone', () => {
    const h1 = createDummyHero('jeepney_driver', 0, 0); // At origin
    // Most advanced enemy determines cone angle. Make eTarget have the highest Y (closest to 0).
    const eTarget = createDummyEnemy('eTarget', 0, -50, 50);
    // eInside is inside the 60 degree cone (straight UP, within 400 range)
    const eInside = createDummyEnemy('eInside', 50, -200, 50); 
    // eOutside is within 400 range but outside the 60 degree cone (e.g. to the right)
    const eOutside = createDummyEnemy('eOutside', 200, -100, 50); 
    // eFar is inside the cone angle but too far (>400 range)
    const eFar = createDummyEnemy('eFar', 0, -500, 50);

    const ctx = createDummyContext([h1], [eTarget, eInside, eOutside, eFar]);

    applyHeroSkill('jeepney_driver', h1, ctx);

    // Damage is hero.damage * 3 (10 * 3 = 30)
    expect(eTarget.hp).toBe(20); // Hits target
    expect(eInside.hp).toBe(20); // Hits inside cone
    expect(eOutside.hp).toBe(50); // Misses outside cone angle
    expect(eFar.hp).toBe(50); // Misses too far
    expect(ctx.onVisual).toHaveBeenCalledWith(expect.objectContaining({ type: 'coinShrapnelCone' }));
  });
  
  it('fisherfolk (Lambat) drags enemies to GAME_WIDTH / 2', () => {
    const h1 = createDummyHero('fisherfolk');
    const e1 = createDummyEnemy('e1', 0, 0);
    
    const ctx = createDummyContext([h1], [e1]);
    
    applyHeroSkill('fisherfolk', h1, ctx);
    
    // The pure state is no longer teleported instantly to allow the visual tween to work.
    // Instead we verify that a dragTo event was dispatched for the enemy.
    expect(ctx.visualEvents.some((evt: any) => evt.type === 'dragTo' && evt.target === e1)).toBe(true);
  });

  it('construction_worker (Barrier) spawns a destructible wall scaled by voice-drop mods', () => {
    const h1 = createDummyHero('construction_worker', 540, 0);
    h1.damage = 18;
    const ctx = createDummyContext([h1]);

    applyHeroSkill('construction_worker', h1, ctx);

    // Base: width 480 (5x the 96px attack wall), HP (18 + 0*2) * 25 = 450,
    // centered on the builder.
    expect(ctx.onVisual).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'spawnBarrier', x: 540, widthPx: 480, maxHp: 450 }),
    );
  });

  it('construction_worker (Barrier) grows with radius/damage drops and clamps to the lane', () => {
    const h1 = createDummyHero('construction_worker', 0, 0); // hugging the lane edge
    h1.damage = 18;
    h1.modifiers = { bonusDamage: 6, bonusPierce: 0, bonusRadius: 2, bonusChain: 0 };
    const ctx = createDummyContext([h1]);

    applyHeroSkill('construction_worker', h1, ctx);

    // Width 480 + 2*60 = 600; HP (18 + 6*2) * 25 = 750; x clamped to widthPx/2.
    expect(ctx.onVisual).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'spawnBarrier', x: 300, widthPx: 600, maxHp: 750 }),
    );
  });

  it('sales_lady (Closing Sale) executes low HP enemies', () => {
    const h1 = createDummyHero('sales_lady');
    const e1 = createDummyEnemy('e1', 0, 0, 100);
    e1.hp = 14; // 14% HP (less than 15%)
    const e2 = createDummyEnemy('e2', 0, 0, 100);
    e2.hp = 20; // 20% HP
    
    const ctx = createDummyContext([h1], [e1, e2]);
    applyHeroSkill('sales_lady', h1, ctx);
    
    expect(e1.isDead).toBe(true);
    expect(e2.isDead).toBe(false);
  });
});
