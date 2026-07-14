// Attack-side collision sizes (px). No Phaser imports — unit-testable.
//
// Every value below is the ATTACK's own radius/half-width. The effective hit
// distance at each call site is `attack value (+ bonusRadius where noted) +
// target.hitRadius` — the enemy's body size lives in UNIT_HIT_RADIUS
// (data/enemies.ts), never here.
//
// The minion tier (UNIT_HIT_RADIUS.minion = 32) is calibrated so that
// `attack radius + 32` reproduces the old flat hit numbers, keeping the
// minion-lane feel unchanged while fixing the bugs and big-enemy behaviour.
export const ATTACK_COLLISION = {
  projectile: { radius: 18 }, // 18 + minion 32 = 50 -> minion feel unchanged
  boomerang: { radius: 18 }, // 18 + 32 = 50 (was flat 50)
  pierce: { halfWidth: 12 }, // 12 + 32 = 44 lateral vs minions (was flat 40 vs infinite line)
  lobbed: { splashRadius: 90 }, // was 50 — the actual AOE fix
  beam: { halfWidth: 8 }, // 8 + 32 = 40 vs minions (was flat 20)
  vortex: { radius: 100 }, // unchanged base; now + hitRadius
  linearWave: { pad: 0 }, // enemy hitRadius replaces the old flat +15 fudge
  trap: { triggerRadius: 10, explosionRadius: 80 }, // trigger was flat 20; explode was 80
  chain: { bounceRangePx: 420 }, // moved from CHAIN_BOUNCE_RANGE_PX in Attacks.ts
  rollingBlackout: { halfHeight: 40 }, // was flat 60
  flushWave: { padY: 10 }, // was flat +30 on height/2
} as const;

/** Lobbed splash radius including voice-drop bonusRadius stacks. Flat damage
 * within — no falloff (base damages are small ints, so falloff rounds to noise
 * and the hard-edged shockwave-ring visual matches a flat disc). */
export function lobbedSplashRadius(bonusRadius: number): number {
  return ATTACK_COLLISION.lobbed.splashRadius + bonusRadius;
}
