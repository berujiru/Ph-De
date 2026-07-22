import { describe, expect, it, vi } from 'vitest';
import { applyHeroSkill, applyHeroPassive, ISkillHero, ISkillEnemy, SkillContext } from '../../src/game/core/Skills';
import { HERO_DEFINITIONS } from '../../src/game/data/heroes';

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

describe('Manual skill targeting', () => {
  it('farmer (area) drops the tree on the player-placed point, ignoring the auto-picked enemy', () => {
    const h1 = createDummyHero('farmer', 540, 1800);
    const auto = createDummyEnemy('auto', 300, 900, 500); // would win auto-targeting
    const ctx = { ...createDummyContext([h1], [auto]), targetX: 700, targetY: 400 };

    applyHeroSkill('farmer', h1, ctx);

    expect(ctx.onVisual).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'spawnTreeOfLife', x: 700, y: 400 }),
    );
  });

  it('construction_worker (summon) places the wall at the player-chosen spot', () => {
    const h1 = createDummyHero('construction_worker', 540, 0);
    const front = createDummyEnemy('front', 200, 900); // would set the auto landing spot
    const ctx = { ...createDummyContext([h1], [front]), targetX: 815, targetY: 1200 };

    applyHeroSkill('construction_worker', h1, ctx);

    expect(ctx.onVisual).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'spawnBarrier', x: 815, y: 1200 }),
    );
  });

  it('call_center_agent (unit) centers the root on the player-chosen enemy', () => {
    const h1 = createDummyHero('call_center_agent', 540, 2000);
    const nearest = createDummyEnemy('nearest', 100, 1900); // first-in-range auto pick
    const chosen = createDummyEnemy('chosen', 880, 1400);
    const ctx = { ...createDummyContext([h1], [nearest, chosen]), targetEnemy: chosen };

    applyHeroSkill('call_center_agent', h1, ctx);

    expect(ctx.onVisual).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'aoeRoot', x: 880, y: 1400 }),
    );
  });

  it('falls back to internal targeting when no manual target is supplied', () => {
    const h1 = createDummyHero('farmer', 540, 1800);
    const auto = createDummyEnemy('auto', 300, 900, 500);
    const ctx = createDummyContext([h1], [auto]); // no targetX/targetY

    applyHeroSkill('farmer', h1, ctx);

    expect(ctx.onVisual).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'spawnTreeOfLife', x: 300, y: 900 }),
    );
  });
});

const emitted = (ctx: SkillContext, type: string) =>
  (ctx.onVisual as any).mock.calls.map((c: any[]) => c[0]).filter((e: any) => e.type === type);

describe('Manual skill targeting — area/aim/line skills', () => {
  it('taho_vendor (area) lobs the molotov at the tapped point', () => {
    const h1 = createDummyHero('taho_vendor', 540, 1800);
    const ctx = { ...createDummyContext([h1], [createDummyEnemy('e', 100, 100)]), targetX: 700, targetY: 400 };
    applyHeroSkill('taho_vendor', h1, ctx);
    expect(ctx.onVisual).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'spawnMolotovPatch', targetX: 700, targetY: 400 }),
    );
  });

  it('fisherfolk (area) centers the net vortex on the tapped point', () => {
    const h1 = createDummyHero('fisherfolk', 540, 1800);
    const ctx = { ...createDummyContext([h1], [createDummyEnemy('e', 100, 100)]), targetX: 700, targetY: 400 };
    applyHeroSkill('fisherfolk', h1, ctx);
    expect(ctx.onVisual).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'spawnLambatVortex', x: 700, y: 400 }),
    );
  });

  it('sorbetes_vendor (area) fans the 3 bombs around the tapped point', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5); // deterministic scatter (zero x-jitter)
    const h1 = createDummyHero('sorbetes_vendor', 540, 1800);
    const ctx = { ...createDummyContext([h1]), targetX: 600, targetY: 500 };
    applyHeroSkill('sorbetes_vendor', h1, ctx);
    const traps = emitted(ctx, 'spawnTrap');
    expect(traps).toHaveLength(3);
    // Center bomb (i=1): x = fanX (600), y = fanY - 0.5*80 = 460 with random()=0.5.
    expect(traps).toContainEqual(expect.objectContaining({ x: 600, y: 460 }));
    vi.restoreAllMocks();
  });

  it('jeepney_driver (aim) points the cone at the tapped direction', () => {
    const h1 = createDummyHero('jeepney_driver', 540, 1800);
    const up = createDummyEnemy('up', 540, 1700); // auto angle would be -PI/2
    const ctx = { ...createDummyContext([h1], [up]), targetX: 1040, targetY: 1800 }; // straight right
    applyHeroSkill('jeepney_driver', h1, ctx);
    const cone = emitted(ctx, 'coinShrapnelCone')[0];
    expect(cone.angle).toBeCloseTo(0, 5); // aimed right, not up at the enemy
  });

  it('security_guard (aim) points the flash cone at the tapped direction', () => {
    const h1 = createDummyHero('security_guard', 540, 1800);
    const up = createDummyEnemy('up', 540, 1700);
    const ctx = { ...createDummyContext([h1], [up]), targetX: 1040, targetY: 1800 };
    applyHeroSkill('security_guard', h1, ctx);
    const cone = emitted(ctx, 'flashlightCone')[0];
    expect(cone.angle).toBeCloseTo(0, 5);
  });

  it('fishball_vendor (line) lays the column toward the tapped direction', () => {
    const h1 = createDummyHero('fishball_vendor', 540, 1800);
    const ctx = { ...createDummyContext([h1]), targetX: 1040, targetY: 1800 }; // straight right
    applyHeroSkill('fishball_vendor', h1, ctx);
    const patches = emitted(ctx, 'spawnFirePatch');
    // First patch is one spacing (360) to the RIGHT of the hero, same Y.
    expect(patches[0].x).toBeCloseTo(900, 3);
    expect(patches[0].y).toBeCloseTo(1800, 3);
  });

  it('delivery_rider (line) charges the riders toward the tapped direction', () => {
    const h1 = createDummyHero('delivery_rider', 540, 1800);
    const ctx = { ...createDummyContext([h1]), targetX: 1040, targetY: 1800 }; // straight right
    applyHeroSkill('delivery_rider', h1, ctx);
    const riders = emitted(ctx, 'spawnRider');
    expect(riders).toHaveLength(3);
    // Every rider's destination is 1500px to the right of its spawn (dirX=1).
    for (const r of riders) {
      expect(r.destX - r.x).toBeCloseTo(1500, 3);
      expect(r.destY - r.y).toBeCloseTo(0, 3);
    }
  });
});

describe('Skill targetType data model', () => {
  it('defaults to auto (undefined) for skills that self-target', () => {
    expect(HERO_DEFINITIONS.eden.signatureSkill.targetType).toBeUndefined();
  });

  it('flags the retrofit starter set with the right modes', () => {
    expect(HERO_DEFINITIONS.farmer.signatureSkill.targetType).toBe('area');
    expect(HERO_DEFINITIONS.construction_worker.signatureSkill.targetType).toBe('summon');
    expect(HERO_DEFINITIONS.call_center_agent.signatureSkill.targetType).toBe('unit');
  });

  it('flags the full interactive set (area/aim/line)', () => {
    expect(HERO_DEFINITIONS.taho_vendor.signatureSkill.targetType).toBe('area');
    expect(HERO_DEFINITIONS.fisherfolk.signatureSkill.targetType).toBe('area');
    expect(HERO_DEFINITIONS.sorbetes_vendor.signatureSkill.targetType).toBe('area');
    expect(HERO_DEFINITIONS.jeepney_driver.signatureSkill.targetType).toBe('aim');
    expect(HERO_DEFINITIONS.security_guard.signatureSkill.targetType).toBe('aim');
    expect(HERO_DEFINITIONS.fishball_vendor.signatureSkill.targetType).toBe('line');
    expect(HERO_DEFINITIONS.delivery_rider.signatureSkill.targetType).toBe('line');
  });

  it('leaves self-buffs, heals, dust storm, globals, and non-spatial skills auto', () => {
    for (const id of ['eden', 'student', 'nurse', 'street_sweeper', 'teacher',
      'sales_lady', 'traffic_enforcer', 'electrician', 'baker', 'plumber'] as const) {
      expect(HERO_DEFINITIONS[id].signatureSkill.targetType).toBeUndefined();
    }
  });
});
