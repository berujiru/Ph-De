export interface ISkillHero {
  id: string;
  x: number;
  y: number;
  damage: number;
  attackRateMs: number;
  currentSkillCooldown: number;
  isSkillReady: boolean;
  hasRallyBuff?: boolean;
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
  takeDamage: (amount: number) => void;
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
    // Rally: Attack speed buff to all heroes
    for (const h of heroes) {
      if (!h.hasRallyBuff) {
        h.attackRateMs /= 2;
        h.hasRallyBuff = true;
      }
      onVisual({ type: 'text', x: h.x, y: h.y - 20, text: 'RALLY!', color: '#ef4444' });
    }
  } else if (skillId === 'teacher') {
    // Recess: Silence enemy auras
    for (const e of enemies) {
      if (!e.isDead && (e.definition.moraleAura || e.definition.tauntAura)) {
        e.definition.moraleAura = false;
        e.definition.tauntAura = false;
        onVisual({ type: 'text', x: e.x, y: e.y, text: 'SILENCED', color: '#a855f7' });
      }
    }
  } else if (skillId === 'student') {
    // Cramming: Reset 1 random adjacent hero's skill
    const adjacent = heroes.filter(h => h !== hero && dist(h.x, h.y, hero.x, hero.y) < 150);
    if (adjacent.length > 0) {
      const target = adjacent[Math.floor(Math.random() * adjacent.length)];
      target.currentSkillCooldown = 0;
      target.isSkillReady = true;
      onVisual({ type: 'text', x: target.x, y: target.y - 20, text: 'CRAM!', color: '#f59e0b' });
    }
  } else if (skillId === 'jeepney_driver') {
    // Barya Lang Po: AoE Shotgun
    for (const e of enemies) {
      if (!e.isDead && dist(hero.x, hero.y, e.x, e.y) < 300) {
        e.takeDamage(hero.damage * 3);
      }
    }
  } else if (skillId === 'fisherfolk') {
    // Lambat: Drag enemies to the lane's horizontal center (collapses their
    // spread across X into a line so follow-up AoE lands cleanly).
    for (const e of enemies) {
      if (!e.isDead) {
        onVisual({ type: 'dragTo', target: e, x: GAME_WIDTH / 2, duration: 500 });
        // Update pure state (tests will read this)
        e.x = GAME_WIDTH / 2;
      }
    }
  } else if (skillId === 'street_sweeper') {
    // Dust Storm: Blind/Slow all
    for (const e of enemies) {
      if (!e.isDead) {
        e.definition.speed *= 0.5;
        e.definition.damage *= 0.5;
      }
    }
  } else if (skillId === 'taho_vendor') {
    // Hot Syrup: Strip speed buffs
    for (const e of enemies) {
      if (!e.isDead && e.definition.speed > 25) { 
        e.definition.speed = 10;
      }
    }
  } else if (skillId === 'nurse') {
    // Vaccine Drive: Immune to debuffs
    for (const h of heroes) {
      onVisual({ type: 'text', x: h.x, y: h.y - 20, text: 'IMMUNE!', color: '#10b981' });
    }
  } else if (skillId === 'construction_worker') {
    // Yero Barricade: Fake Obstacle — a horizontal wall across the lane, just
    // above the visible bottom front line.
    onVisual({ type: 'spawnObstacle', x: GAME_WIDTH / 2, y: GAME_HEIGHT - 150, width: 200, height: 20, color: '#d97706', duration: 5000 });
  } else if (skillId === 'call_center_agent') {
    // Escalate: 15% Max HP to lowest HP enemy
    const lowestHp = enemies.filter(e => !e.isDead).sort((a, b) => a.hp - b.hp)[0];
    if (lowestHp) {
      lowestHp.takeDamage(lowestHp.definition.maxHp * 0.15);
    }
  } else if (skillId === 'security_guard') {
    // Flashlight: Wide cone slow — enemies ahead of (above) the hero.
    for (const e of enemies) {
      if (!e.isDead && e.y < hero.y && hero.y - e.y < 400) {
        e.activeAilments['slow'] = 100;
      }
    }
  } else if (skillId === 'farmer') {
    // Harvest: Damage per ailment
    for (const e of enemies) {
      if (!e.isDead) {
        const ailmentCount = Object.values(e.activeAilments).filter(v => v > 0).length;
        if (ailmentCount > 0) {
          e.takeDamage(hero.damage * 5 * ailmentCount);
        }
      }
    }
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
    // Rolling Blackout: Stun all
    onVisual({ type: 'screenFlash', color: '#000000', alpha: 0.5, duration: 3000 });
    for (const e of enemies) {
      if (!e.isDead) e.activeAilments['freeze'] = 100;
    }
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
    // Flush: Wash away summons
    for (const e of enemies) {
      if (!e.isDead && (e.id === 'grunt' || e.id === 'the_overpriced')) {
        e.takeDamage(9999);
      }
    }
  } else if (skillId === 'delivery_rider') {
    // Kamote Riders — sweep UP the lane toward the enemies, spread across X.
    for(let i=0; i<3; i++) {
      onVisual({ type: 'spawnRider', x: hero.x + (i-1)*30, y: hero.y, targetY: hero.y - 1500, duration: 1000, damage: hero.damage * 2 });
    }
  }
}
