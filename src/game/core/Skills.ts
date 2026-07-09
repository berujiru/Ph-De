import type { DamageType } from './Damage';

export interface ISkillHero {
  id: string;
  x: number;
  y: number;
  damage: number;
  attackRateMs: number;
  currentSkillCooldown: number;
  isSkillReady: boolean;
  hasRallyBuff?: boolean;
  applyBuff?: (type: string, durationMs?: number, color?: number, iconText?: string) => void;
  modifiers?: { bonusDamage: number, bonusPierce: number, bonusRadius: number, bonusChain: number };
}

export interface ISkillEnemy {
  id: string;
  x: number;
  y: number;
  hp: number;
  isDead: boolean;
  activeAilments: Record<string, number>;
  definition: {
    maxHp: number;
    speed: number;
    damage: number;
    moraleAura?: boolean;
    tauntAura?: boolean;
  };
  silenceTimer: number;
  takeDamage: (amount: number) => void;
  /** Inflicts a status effect with accumulation value and active duration in ms. */
  applyAilment(type: string, amount: number, durationMs: number): void;
  /** Forcefully removes stealth from the enemy, making them visible and targetable. */
  revealStealth(): void;
}

export interface SkillVisualEvent {
  type: string;
  [key: string]: any;
}

export interface SkillContext {
  GAME_WIDTH: number;
  GAME_HEIGHT: number;
  heroes: ISkillHero[];
  enemies: ISkillEnemy[];
  onVisual: (event: SkillVisualEvent) => void;
}

export function applyHeroPassive(passiveId: string, _source: ISkillHero, target: ISkillEnemy, ctx: SkillContext) {
  if (passiveId === 'farmer' && Math.random() < 0.2) {
    target.activeAilments['freeze'] = 100; // instant root
    ctx.onVisual({ type: 'text', x: target.x, y: target.y - 30, text: 'ROOTED!', color: '#22c55e' });
  } else if (passiveId === 'teacher') {
    target.activeAilments['marked'] = 100;
  } else if (passiveId === 'fisherfolk') {
    target.activeAilments['wet'] = 100;
  } else if (passiveId === 'sorbetes_vendor') {
    target.activeAilments['freeze'] = Math.min(100, (target.activeAilments['freeze'] || 0) + 34);
  }
}

// Distance helper
function dist(x1: number, y1: number, x2: number, y2: number) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

export function applyHeroSkill(skillId: string, hero: ISkillHero, ctx: SkillContext) {
  const { heroes, enemies, onVisual, GAME_WIDTH, GAME_HEIGHT } = ctx;

  if (skillId === 'eden') {
    // Rally: Attack speed buff to all heroes (10s duration)
    for (const h of heroes) {
      if (!h.hasRallyBuff) {
        h.applyBuff?.('rally', 10000, 0xef4444, '⚔️');
      }
      onVisual({ type: 'text', x: h.x, y: h.y - 20, text: 'RALLY!', color: '#ef4444' });
    }
  } else if (skillId === 'traffic_enforcer') {
    // STOP!: Global hard stun and traffic lights visual
    const stunDuration = 2000;
    
    // Traffic light visual
    onVisual({ type: 'trafficLights', duration: stunDuration });
    
    for (const e of enemies) {
      if (!e.isDead) {
        e.applyAilment('stun', 1, stunDuration);
      }
    }
  } else if (skillId === 'security_guard') {
    // Flash: Cone of light that heavily slows all enemies
    const coneLength = 1200; // configurable for voice drops
    const slowDuration = 7000; // 7s
    
    // Find target to aim at (closest or most advanced enemy)
    const validEnemies = enemies.filter(e => !e.isDead);
    validEnemies.sort((a, b) => b.y - a.y);
    const target = validEnemies[0];
    
    // Calculate angle towards target, default to straight UP (-Math.PI / 2)
    const targetAngle = target ? Math.atan2(target.y - hero.y, target.x - hero.x) : -Math.PI / 2;
    
    // Dispatch visual event
    onVisual({ type: 'flashlightCone', hero, length: coneLength, duration: slowDuration, angle: targetAngle });
    
    // Apply slow to enemies in the cone
    for (const e of validEnemies) {
      const dx = e.x - hero.x;
      const dy = e.y - hero.y;
      const distSq = dx * dx + dy * dy;
      
      if (distSq <= coneLength * coneLength) {
        let eAngle = Math.atan2(dy, dx);
        let diff = eAngle - targetAngle;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        
        // 60-degree cone (30 degrees or ~0.52 radians on either side)
        if (Math.abs(diff) <= Math.PI / 6) {
          e.applyAilment('slow', 1, slowDuration);
          e.revealStealth(); // Reveal invisible enemies
        }
      }
    }
  } else if (skillId === 'call_center_agent') {
    // Put-on-hold: AoE Root that deals minor damage and continuously roots enemies inside.
    const rootRadius = 250; // Larger AoE
    const rootDuration = 5000; // 5s persistent field
    const burstDamage = 2; // tiny damage just to tag them, focused on CC not burst
    
    // Find target in range
    const range = 1400; // call center agent range
    let target = enemies.find(e => !e.isDead && (hero.y - e.y <= range));
    let targetX = hero.x;
    let targetY = hero.y - range;
    
    if (target) {
      targetX = target.x;
      targetY = target.y;
    }
    
    // Dispatch visual event at target coordinates. The GameScene will spawn an AoeRootFieldAttack 
    // which handles both the persistent field logic and visuals.
    onVisual({ type: 'aoeRoot', x: targetX, y: targetY, radius: rootRadius, duration: rootDuration, damage: burstDamage });
  } else if (skillId === 'teacher') {
    // Silence: Silence all enemy auras globally (visualized as an expanding circle)
    onVisual({ type: 'expandingCircle', x: hero.x, y: hero.y, color: '#8b5cf6', maxRadius: GAME_HEIGHT, duration: 1000 });

    for (const e of enemies) {
      if (!e.isDead) {
        e.silenceTimer = 10000; // 10 seconds of silence
        onVisual({ type: 'text', x: e.x, y: e.y, text: 'SILENCED', color: '#a855f7' });
      }
    }
  } else if (skillId === 'student') {
    // Cramming: Self-buff attack speed (10s) and instantly hurl a multi-element blast
    hero.applyBuff?.('cramming', 10000, 0xfacc15, '⚔️');
    
    // Find up to 5 random targets and fire a mixed-element volley
    const validTargets = enemies.filter(e => !e.isDead);
    if (validTargets.length > 0) {
      const volleySize = 5;
      const elements: DamageType[] = [
        'Physical', 'Magic', 'Fire', 'Frost', 'Lightning', 'Water', 'Wind', 'Earth', 'Holy', 'Dark'
      ];
      
      for (let i = 0; i < volleySize; i++) {
        const target = validTargets[Math.floor(Math.random() * validTargets.length)];
        const damageType = elements[i % elements.length];
        onVisual({ type: 'projectileVolley', hero, target, damageType });
      }
    }
    
    onVisual({ type: 'text', x: hero.x, y: hero.y - 20, text: 'CRAMMING!', color: '#f59e0b' });
  } else if (skillId === 'jeepney_driver') {
    // Barya Lang Po: Cone Shotgun of coins
    const coneLength = 550;
    
    // Find target to aim at (closest or most advanced enemy)
    const validEnemies = enemies.filter(e => !e.isDead);
    validEnemies.sort((a, b) => b.y - a.y);
    const target = validEnemies[0];
    
    // Calculate angle towards target, default to straight UP (-Math.PI / 2)
    const targetAngle = target ? Math.atan2(target.y - hero.y, target.x - hero.x) : -Math.PI / 2;
    
    // Dispatch visual event
    onVisual({ type: 'coinShrapnelCone', hero, length: coneLength, angle: targetAngle });
    
    // Apply damage to enemies in the cone
    for (const e of validEnemies) {
      const dx = e.x - hero.x;
      const dy = e.y - hero.y;
      const distSq = dx * dx + dy * dy;
      
      if (distSq <= coneLength * coneLength) {
        let eAngle = Math.atan2(dy, dx);
        let diff = eAngle - targetAngle;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        
        // 60-degree cone (30 degrees or ~0.52 radians on either side)
        if (Math.abs(diff) <= Math.PI / 6) {
          e.takeDamage(hero.damage * 3);
        }
      }
    }
  } else if (skillId === 'fisherfolk') {
    // Lambat: Drag enemies to the lane's horizontal center.
    // The visual vortex lasts 1500ms, and drag starts at 1000ms.
    const centerX = GAME_WIDTH / 2;
    const aliveEnemies = enemies.filter(e => !e.isDead);
    let targetY = GAME_HEIGHT / 2;
    
    if (aliveEnemies.length > 0) {
      // Target the Y of the first alive enemy
      targetY = aliveEnemies[0].y;
    } else {
      // Fallback to a point in front of the hero if no enemies
      targetY = hero.y > GAME_HEIGHT / 2 ? hero.y - 150 : hero.y + 150;
    }

    const bonusRadius = hero.modifiers?.bonusRadius || 0;
    const bonusDamage = hero.modifiers?.bonusDamage || 0;
    
    // Base radius is 400. Increases by 3px per point of bonusRadius.
    const pullRadius = 400 + bonusRadius * 3;
    const visualScale = pullRadius / 100;
    // Delay before pulling scales with bonusDamage (50ms per point of damage)
    const baseDelay = 400;
    const pullDelay = baseDelay + bonusDamage * 50;
    const pullDuration = 600;
    const totalAnimTime = pullDelay + pullDuration;
    
    onVisual({ type: 'spawnLambatVortex', x: centerX, y: targetY, pullDelay, pullDuration, scale: visualScale });
    
    // Fixed drag distance
    const dragDistance = 300;

    for (const e of aliveEnemies) {
      const dx = centerX - e.x;
      const dy = targetY - e.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist > 0 && dist <= pullRadius) {
        // Move them towards the center by up to `dragDistance`
        const moveDist = Math.min(dist, dragDistance);
        const ratio = moveDist / dist;
        const newX = e.x + dx * ratio;
        const newY = e.y + dy * ratio;

        onVisual({ type: 'dragTo', target: e, x: newX, y: newY, duration: pullDuration, delay: pullDelay, ease: 'Sine.easeIn' });
        
        // Immobilize them silently during the entire spell animation
        e.applyAilment('dragged', 1, totalAnimTime);
        
        // Stun for 1s (+ bonus). Apply it exactly when the drag finishes.
        const stunDur = 1000 + bonusDamage * 20;
        onVisual({ type: 'applyAilment', target: e, ailment: 'stun', amount: 1, duration: stunDur, delay: totalAnimTime });
      }
    }
  } else if (skillId === 'street_sweeper') {
    // Dust Storm: Spawns a tornado that chases enemies, pulls them in, and deals DoT.
    const bonusRadius = hero.modifiers?.bonusRadius || 0;
    onVisual({
      type: 'spawnTornado',
      x: hero.x,
      y: hero.y,
      damage: hero.damage,
      pullRadius: 250 + bonusRadius,
      duration: 8000,
      speed: 300 + bonusRadius
    });
  } else if (skillId === 'taho_vendor') {
    // Hot Syrup: Throws a Molotov creating a 20s AoE fire patch that deals DoT
    let targetX = GAME_WIDTH / 2;
    let targetY = GAME_HEIGHT / 2;
    const target = enemies.find(e => !e.isDead);
    if (target) {
      targetX = target.x;
      targetY = target.y;
    }
    const bonusRadius = hero.modifiers?.bonusRadius || 0;
    const bonusDamage = hero.modifiers?.bonusDamage || 0;
    onVisual({
      type: 'spawnMolotovPatch',
      startX: hero.x,
      startY: hero.y,
      targetX,
      targetY,
      radius: 120 + (bonusRadius * 30),
      damage: (hero.damage + bonusDamage * 2) * 0.5,
      duration: 20000
    });
  } else if (skillId === 'nurse') {
    // Heal: Restores barrier HP and shows a green aura
    onVisual({ type: 'healShield', amount: 150 });
    onVisual({ type: 'text', x: hero.x, y: hero.y - 20, text: 'HEAL!', color: '#10b981' });
  } else if (skillId === 'construction_worker') {
    // Yero Barricade: Fake Obstacle — a horizontal wall across the lane, just
    // above the visible bottom front line.
    onVisual({ type: 'spawnObstacle', x: GAME_WIDTH / 2, y: GAME_HEIGHT - 150, width: 200, height: 20, color: '#d97706', duration: 5000 });

  } else if (skillId === 'security_guard') {
    // Flashlight: Wide cone slow — enemies ahead of (above) the hero.
    for (const e of enemies) {
      if (!e.isDead && e.y < hero.y && hero.y - e.y < 400) {
        e.activeAilments['slow'] = 100;
      }
    }
  } else if (skillId === 'farmer') {
    // Tree of Life: Summon an AoE golden tree that periodically roots and damages
    let target = null;
    let highestScore = -Infinity;

    for (const e of enemies) {
      if (!e.isDead) {
        const distToHero = dist(hero.x, hero.y, e.x, e.y);
        const score = (e.definition.maxHp * 10000) + e.hp - distToHero;
        if (score > highestScore) {
          highestScore = score;
          target = e;
        }
      }
    }

    const tx = target ? target.x : GAME_WIDTH / 2;
    const ty = target ? target.y : GAME_HEIGHT / 2;

    onVisual({
      type: 'spawnTreeOfLife',
      x: tx,
      y: ty,
      radius: 150,
      duration: 30000,
      damage: hero.damage * 0.2
    });
  } else if (skillId === 'fishball_vendor') {
    // Spicy Sauce: Ignite in front — a narrow column directly ahead (above) the hero.
    for (const e of enemies) {
      if (!e.isDead && Math.abs(e.x - hero.x) < 50 && e.y < hero.y) {
        e.activeAilments['burn'] = 100;
      }
    }
  } else if (skillId === 'sales_lady') {
    // Closing Sale: Execute < 15% HP
    for (const e of enemies) {
      if (!e.isDead && e.hp < e.definition.maxHp * 0.15) {
        e.takeDamage(99999);
      }
    }
  } else if (skillId === 'sorbetes_vendor') {
    // Dirty Ice Cream: drop traps spread across the lane, just above the bottom front line.
    for(let i=0; i<3; i++) {
      onVisual({ type: 'spawnTrap', x: GAME_WIDTH / 2 + (i-1)*120 + (Math.random()-0.5)*40, y: GAME_HEIGHT - 200, radius: 10, color: '#f472b6', duration: 3000 });
    }
  } else if (skillId === 'electrician') {
    // Rolling Blackout: AoE electric surge wave moving from bottom to top
    // High damage, no debuff. Starting from barrier all the way to top.
    onVisual({ type: 'rollingBlackoutWave', damage: hero.damage * 2 });
  } else if (skillId === 'baker') {
    // Dough Knead: Flatten damage
    for (const e of enemies) {
      if (!e.isDead) e.definition.damage *= 0.5;
    }
  } else if (skillId === 'traffic_enforcer') {
    // STOP!: Hard stun
    for (const e of enemies) {
      if (!e.isDead && dist(hero.x, hero.y, e.x, e.y) < 250) {
        e.activeAilments['freeze'] = 100;
      }
    }
  } else if (skillId === 'plumber') {
    const bonusProjectiles = hero.modifiers?.bonusProjectiles || 0;
    const bonusDamage = hero.modifiers?.bonusDamage || 0;
    const bonusPierce = hero.modifiers?.bonusPierce || 0;

    const numWaves = 3 + bonusProjectiles;
    const damage = (hero.damage * 0.8) + (bonusDamage * 2);
    const knockback = 100 + bonusPierce * 30;

    onVisual({
      type: 'flushWave',
      numWaves,
      damage,
      knockback,
      color: 0x2563eb
    });
  } else if (skillId === 'delivery_rider') {
    // Dine & Dash — sweep UP the lane toward the enemies, spread across X.
    const bonusRadius = hero.modifiers?.bonusRadius || 0;
    const bonusDamage = hero.modifiers?.bonusDamage || 0;
    const bonusPierce = hero.modifiers?.bonusPierce || 0;

    const hitRadius = 80 + bonusRadius * 10;
    const knockback = 200 + bonusPierce * 50;
    const damage = (hero.damage + bonusDamage) * 4;

    for(let i=0; i<3; i++) {
      onVisual({ type: 'spawnRider', x: hero.x + (i-1)*40, y: hero.y, targetY: hero.y - 1500, duration: 1000, damage, delay: 500, knockback, hitRadius });
    }
  }
}
