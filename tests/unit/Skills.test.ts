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
    },
    silenceTimer: 0,
    applyAilment: function(type: string, amount: number, _durationMs: number) {
      this.activeAilments[type] = amount;
    },
    revealStealth: function() {},
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
    // eFar is inside the cone angle but beyond the 550px cone length
    const eFar = createDummyEnemy('eFar', 0, -600, 50);

    const ctx = createDummyContext([h1], [eTarget, eInside, eOutside, eFar]);

    applyHeroSkill('jeepney_driver', h1, ctx);

    // Damage is hero.damage * 3 (10 * 3 = 30)
    expect(eTarget.hp).toBe(20); // Hits target
    expect(eInside.hp).toBe(20); // Hits inside cone
    expect(eOutside.hp).toBe(50); // Misses outside cone angle
    expect(eFar.hp).toBe(50); // Misses too far
    expect(ctx.onVisual).toHaveBeenCalledWith(expect.objectContaining({ type: 'coinShrapnelCone' }));
  });

  it('jeepney_driver (Barya) knocks in-cone enemies back and freezes their AI', () => {
    // Realistic geometry: hero near the bottom of the lane, enemies marching down
    // from above (smaller y). The gust shoves them back up-lane, away from the hero.
    const h1 = createDummyHero('jeepney_driver', 540, 1800);
    // Most-advanced enemy (highest y) sets the aim; eTarget pins it straight up.
    const eTarget = createDummyEnemy('eTarget', 540, 1750, 50);
    const eInside = createDummyEnemy('eInside', 560, 1600, 50); // inside the cone
    const eOutside = createDummyEnemy('eOutside', 900, 1700, 50); // outside the cone angle

    const ctx = createDummyContext([h1], [eTarget, eInside, eOutside]);

    const distFromHero = (x: number, y: number) => Math.hypot(x - h1.x, y - h1.y);
    const beforeDist = distFromHero(eInside.x, eInside.y);

    applyHeroSkill('jeepney_driver', h1, ctx);

    // In-cone enemy: a dragTo pushing it FARTHER from the hero, plus the 'dragged' freeze.
    const drags = (ctx.onVisual as any).mock.calls
      .map((c: any[]) => c[0])
      .filter((e: any) => e.type === 'dragTo');
    const inDrag = drags.find((d: any) => d.target === eInside);
    expect(inDrag).toBeDefined();
    expect(distFromHero(inDrag.x, inDrag.y)).toBeGreaterThan(beforeDist);
    expect(eInside.activeAilments['dragged']).toBe(1);

    // Out-of-cone enemy: no knockback at all.
    expect(drags.some((d: any) => d.target === eOutside)).toBe(false);
    expect(eOutside.activeAilments['dragged']).toBeUndefined();
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

  it('construction_worker (Barrier) walls off the enemy front line', () => {
    const h1 = createDummyHero('construction_worker', 540, 0);
    h1.damage = 18;
    // Frontmost enemy = largest y; the wall should land on it and span the lane.
    const near = createDummyEnemy('near', 200, 900);
    const far = createDummyEnemy('far', 800, 400);
    const ctx = createDummyContext([h1], [near, far]);

    applyHeroSkill('construction_worker', h1, ctx);

    expect(ctx.onVisual).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'spawnBarrier',
        startX: 540, // thrown from the hero
        startY: 0,
        x: 540, // lands centered on the lane (GAME_WIDTH / 2)
        y: 900, // at the frontmost (largest-y) enemy's depth
        widthPx: 420, // base length (no bonusRadius)
        maxHp: 18 * 12, // base damage-scaled wall HP
      }),
    );
  });

  it('construction_worker (Barrier) falls back to mid-field with no enemies', () => {
    const h1 = createDummyHero('construction_worker', 540, 0);
    const ctx = createDummyContext([h1]);

    applyHeroSkill('construction_worker', h1, ctx);

    expect(ctx.onVisual).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'spawnBarrier', y: 960 }), // GAME_HEIGHT / 2
    );
  });

  it('fishball_vendor (Spicy Sauce) lays a lane of spicy fire patches', () => {
    // y high enough that all 8 patches clear the off-screen guard (patchY < -100).
    const h1 = createDummyHero('fishball_vendor', 300, 3000);
    const ctx = createDummyContext([h1]);

    applyHeroSkill('fishball_vendor', h1, ctx);

    const patches = (ctx.onVisual as any).mock.calls
      .map((c: any[]) => c[0])
      .filter((e: any) => e.type === 'spawnFirePatch');
    expect(patches).toHaveLength(8);
    for (const p of patches) {
      expect(p).toEqual(expect.objectContaining({ flavor: 'spicy', radius: 180, duration: 15000 }));
    }
    // Patches march up the lane (ascending distance from the hero => decreasing y).
    const ys = patches.map((p: any) => p.y);
    expect(ys).toEqual([...ys].sort((a, b) => b - a));
  });

  it('sorbetes_vendor (Dirty Ice Cream) fan-throws 3 bombs from the hero with a stagger', () => {
    const h1 = createDummyHero('sorbetes_vendor', 540, 1800);
    const ctx = createDummyContext([h1]);

    applyHeroSkill('sorbetes_vendor', h1, ctx);

    const throws = (ctx.onVisual as any).mock.calls
      .map((c: any[]) => c[0])
      .filter((e: any) => e.type === 'spawnTrap');
    expect(throws).toHaveLength(3);
    // Every bomb is lobbed from the hero's position...
    for (const t of throws) {
      expect(t.startX).toBe(540);
      expect(t.startY).toBe(1800);
    }
    // ...and the throws fan out on ascending delays (0, 120, 240).
    expect(throws.map((t: any) => t.delay)).toEqual([0, 120, 240]);
  });

  it('taho_vendor (Hot Syrup) throws a syrup-flavored molotov patch', () => {
    const h1 = createDummyHero('taho_vendor', 300, 1500);
    const ctx = createDummyContext([h1]);

    applyHeroSkill('taho_vendor', h1, ctx);

    expect(ctx.onVisual).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'spawnMolotovPatch', flavor: 'syrup', radius: 200, duration: 20000 }),
    );
  });

  it('farmer (Tree of Life) throws the seed from the hero to the target', () => {
    const h1 = createDummyHero('farmer', 540, 1800);
    // Highest-score target: biggest maxHp wins (all else equal).
    const big = createDummyEnemy('big', 300, 900, 500);
    const small = createDummyEnemy('small', 700, 1000, 50);
    const ctx = createDummyContext([h1], [big, small]);

    applyHeroSkill('farmer', h1, ctx);

    expect(ctx.onVisual).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'spawnTreeOfLife',
        startX: 540, // seed lobbed from the hero
        startY: 1800,
        x: 300, // lands on the toughest enemy
        y: 900,
        radius: 150,
        duration: 30000,
      }),
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
