/**
 * Pure target selection for rally heroes. Mirrors the real battle rules:
 * enemies march DOWN (larger y = more advanced), a hero only shoots enemies
 * ahead of it (smaller y), and range is measured along the march axis only
 * (heroY - enemyY <= rangePx).
 *
 * Priority: a taunting (un-silenced) enemy in range beats everything, most-
 * advanced first (designed counterplay — silence it); otherwise the most-
 * advanced eligible enemy. A hero with no eligible enemy returns null.
 *
 * Player Rally Volley commands are handled separately in Hero.commandVolley —
 * they override this selection entirely for a single shot.
 */
export interface TargetCandidate {
  x: number;
  y: number;
  hp: number;
  isDead: boolean;
  isStealthed: boolean;
  silenceTimer: number;
  hasTauntAura: boolean;
}

export function selectRallyTarget<T extends TargetCandidate>(
  heroY: number,
  rangePx: number,
  canSeeStealth: boolean,
  candidates: readonly T[],
): T | null {
  let taunter: T | null = null;
  let taunterY = -Infinity;
  let frontmost: T | null = null;
  let frontmostY = -Infinity;

  for (const enemy of candidates) {
    // Skip anything already dead OR at/below 0 HP (a corpse mid death-anim, or
    // a lethal hit not yet flagged this frame) so heroes never swing at it.
    if (enemy.isDead || enemy.hp <= 0 || enemy.y >= heroY) continue;
    // Ignore stealthed enemies unless this hero can see stealth.
    if (enemy.isStealthed && !canSeeStealth) continue;
    // Range along the march axis only.
    if (heroY - enemy.y > rangePx) continue;

    if (enemy.hasTauntAura && enemy.silenceTimer <= 0) {
      if (enemy.y > taunterY) {
        taunterY = enemy.y;
        taunter = enemy;
      }
      continue;
    }

    if (enemy.y > frontmostY) {
      frontmostY = enemy.y;
      frontmost = enemy;
    }
  }

  return taunter ?? frontmost;
}
