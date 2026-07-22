import type { MetaStateData } from './metaState';
import { subscribeMetaState, getMetaState, applyAchievementUnlocks } from './metaState';
import { HERO_LEVEL_CAP } from './heroProgression';
import { STAGES_PER_ACT } from './campaign';
import { gameToUiEvents } from '../core/GameEvents';

/**
 * Achievements — once-in-a-lifetime milestones that pay out Rally Permits and
 * Hope. Each is a pure predicate over MetaStateData, so evaluation is just a
 * scan of the current state; the store's persistence/notify machinery does the
 * rest. The catalog is deliberately plenty and spread across the whole
 * progression curve (first steps → campaign depth → long-haul grinds).
 *
 * Reward scale (moderate): early "firsts" 3–6 permits + 100–300 hope; mid
 * milestones 8–12 permits + 500–1500 hope; long grinds 20–30 permits + 3000+.
 */

export type AchievementCategory = 'firsts' | 'campaign' | 'combat' | 'collection' | 'economy';

/** Display order + labels for the categories on the Achievements screen. */
export const ACHIEVEMENT_CATEGORIES: { id: AchievementCategory; label: string }[] = [
  { id: 'firsts', label: 'First Steps' },
  { id: 'campaign', label: 'Campaign' },
  { id: 'combat', label: 'Combat' },
  { id: 'collection', label: 'Collection' },
  { id: 'economy', label: 'Economy' },
];

export interface AchievementReward {
  permits?: number;
  hope?: number;
}

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  /** Emoji shown in the toast + list. */
  icon: string;
  reward: AchievementReward;
  /** True once the milestone has been reached. Pure — no side effects. */
  isUnlocked: (s: MetaStateData) => boolean;
}

/** Distinct heroes the player has ever collected cards for. */
function distinctHeroesOwned(s: MetaStateData): number {
  return Object.keys(s.heroCards).length;
}

/** Highest permanent level reached by any single hero. */
function highestHeroLevel(s: MetaStateData): number {
  let max = 1;
  for (const lv of Object.values(s.heroLevels)) if (typeof lv === 'number' && lv > max) max = lv;
  return max;
}

/** All of Act I (stages 1..STAGES_PER_ACT, boss included) cleared. */
function actOneComplete(s: MetaStateData): boolean {
  for (let stage = 1; stage <= STAGES_PER_ACT; stage++) {
    if (!s.clearedStages.includes(stage)) return false;
  }
  return true;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  // ---- First Steps ---------------------------------------------------------
  { id: 'first_win', title: 'First Rally', description: 'Win your first defense.', category: 'firsts', icon: '🎉', reward: { permits: 5, hope: 200 }, isUnlocked: (s) => s.battlesWon >= 1 },
  { id: 'first_loss', title: 'Baptism by Fire', description: 'Live through your first defeat — a failed defense still wakes people up.', category: 'firsts', icon: '🔥', reward: { permits: 3, hope: 150 }, isUnlocked: (s) => s.battlesPlayed - s.battlesWon >= 1 },
  { id: 'first_hero_drop', title: 'First Recruit', description: 'Answer your first mid-battle call and recruit a hero.', category: 'firsts', icon: '🤝', reward: { permits: 4, hope: 150 }, isUnlocked: (s) => s.heroDrops >= 1 },
  { id: 'first_enemy', title: 'Know Your Enemy', description: 'Face your first anomaly and log it in the Truth Codex.', category: 'firsts', icon: '👁️', reward: { permits: 3, hope: 100 }, isUnlocked: (s) => s.encounteredEnemies.length >= 1 },
  { id: 'first_boss', title: 'Giant Slayer', description: 'Bring down your first boss.', category: 'firsts', icon: '💀', reward: { permits: 6, hope: 300 }, isUnlocked: (s) => s.bossesDefeated >= 1 },
  { id: 'first_flawless', title: 'Not a Scratch', description: 'Win a defense without a single barrier breach.', category: 'firsts', icon: '🛡️', reward: { permits: 6, hope: 300 }, isUnlocked: (s) => s.flawlessWins >= 1 },

  // ---- Campaign ------------------------------------------------------------
  { id: 'stage_3', title: 'Finding Footing', description: 'Clear stage 3.', category: 'campaign', icon: '🚩', reward: { permits: 4, hope: 150 }, isUnlocked: (s) => s.highestClearedStage >= 3 },
  { id: 'stage_5', title: 'Momentum', description: 'Clear stage 5.', category: 'campaign', icon: '🚩', reward: { permits: 5, hope: 250 }, isUnlocked: (s) => s.highestClearedStage >= 5 },
  { id: 'stage_10', title: 'End of the Beginning', description: 'Clear stage 10.', category: 'campaign', icon: '🏁', reward: { permits: 8, hope: 500 }, isUnlocked: (s) => s.highestClearedStage >= 10 },
  { id: 'stage_15', title: 'Deeper In', description: 'Clear stage 15.', category: 'campaign', icon: '🏁', reward: { permits: 10, hope: 700 }, isUnlocked: (s) => s.highestClearedStage >= 15 },
  { id: 'stage_20', title: 'No Turning Back', description: 'Clear stage 20.', category: 'campaign', icon: '🏁', reward: { permits: 12, hope: 1000 }, isUnlocked: (s) => s.highestClearedStage >= 20 },
  { id: 'stage_30', title: 'Veteran of the Line', description: 'Clear stage 30.', category: 'campaign', icon: '🏅', reward: { permits: 15, hope: 1500 }, isUnlocked: (s) => s.highestClearedStage >= 30 },
  { id: 'act1_complete', title: 'Clean Sweep: Act I', description: 'Clear every stage of Act I, boss and all.', category: 'campaign', icon: '🧹', reward: { permits: 12, hope: 800 }, isUnlocked: actOneComplete },

  // ---- Combat --------------------------------------------------------------
  { id: 'win_5', title: 'Rallying Cry', description: 'Win 5 defenses.', category: 'combat', icon: '⚔️', reward: { permits: 5, hope: 250 }, isUnlocked: (s) => s.battlesWon >= 5 },
  { id: 'win_15', title: 'Seasoned Defender', description: 'Win 15 defenses.', category: 'combat', icon: '⚔️', reward: { permits: 8, hope: 600 }, isUnlocked: (s) => s.battlesWon >= 15 },
  { id: 'win_30', title: 'War-Hardened', description: 'Win 30 defenses.', category: 'combat', icon: '⚔️', reward: { permits: 12, hope: 1200 }, isUnlocked: (s) => s.battlesWon >= 30 },
  { id: 'win_50', title: 'Unbreakable Will', description: 'Win 50 defenses.', category: 'combat', icon: '🏆', reward: { permits: 20, hope: 2500 }, isUnlocked: (s) => s.battlesWon >= 50 },
  { id: 'boss_5', title: 'Bane of Giants', description: 'Defeat 5 bosses.', category: 'combat', icon: '💀', reward: { permits: 8, hope: 600 }, isUnlocked: (s) => s.bossesDefeated >= 5 },
  { id: 'boss_25', title: 'Colossus Hunter', description: 'Defeat 25 bosses.', category: 'combat', icon: '💀', reward: { permits: 15, hope: 2000 }, isUnlocked: (s) => s.bossesDefeated >= 25 },
  { id: 'boss_50', title: 'Titanfall', description: 'Defeat 50 bosses.', category: 'combat', icon: '☠️', reward: { permits: 25, hope: 4000 }, isUnlocked: (s) => s.bossesDefeated >= 50 },
  { id: 'flawless_10', title: 'Immaculate Defense', description: 'Win 10 defenses without a breach.', category: 'combat', icon: '🛡️', reward: { permits: 15, hope: 1500 }, isUnlocked: (s) => s.flawlessWins >= 10 },

  // ---- Collection ----------------------------------------------------------
  { id: 'enemies_5', title: 'Field Notes', description: 'Log 5 different anomalies.', category: 'collection', icon: '📓', reward: { permits: 4, hope: 200 }, isUnlocked: (s) => s.encounteredEnemies.length >= 5 },
  { id: 'enemies_10', title: 'Truth Seeker', description: 'Log 10 different anomalies.', category: 'collection', icon: '📓', reward: { permits: 8, hope: 500 }, isUnlocked: (s) => s.encounteredEnemies.length >= 10 },
  { id: 'enemies_20', title: 'Codex Keeper', description: 'Log 20 different anomalies.', category: 'collection', icon: '📖', reward: { permits: 12, hope: 1200 }, isUnlocked: (s) => s.encounteredEnemies.length >= 20 },
  { id: 'heroes_3', title: 'Growing Ranks', description: 'Collect cards for 3 different heroes.', category: 'collection', icon: '👥', reward: { permits: 5, hope: 250 }, isUnlocked: (s) => distinctHeroesOwned(s) >= 3 },
  { id: 'heroes_6', title: 'Full Squad', description: 'Collect cards for 6 different heroes.', category: 'collection', icon: '👥', reward: { permits: 8, hope: 600 }, isUnlocked: (s) => distinctHeroesOwned(s) >= 6 },
  { id: 'heroes_10', title: "People's Army", description: 'Collect cards for 10 different heroes.', category: 'collection', icon: '🧑‍🤝‍🧑', reward: { permits: 12, hope: 1200 }, isUnlocked: (s) => distinctHeroesOwned(s) >= 10 },
  { id: 'hero_lvl5', title: 'Proven Leader', description: 'Raise any hero to level 5.', category: 'collection', icon: '⭐', reward: { permits: 8, hope: 500 }, isUnlocked: (s) => highestHeroLevel(s) >= 5 },
  { id: 'hero_max', title: 'Living Legend', description: `Raise any hero to the level cap (${HERO_LEVEL_CAP}).`, category: 'collection', icon: '🌟', reward: { permits: 20, hope: 2500 }, isUnlocked: (s) => highestHeroLevel(s) >= HERO_LEVEL_CAP },
  { id: 'cards_25', title: 'Card Collector', description: 'Earn 25 Hero Cards.', category: 'collection', icon: '🃏', reward: { permits: 5, hope: 250 }, isUnlocked: (s) => s.lifetimeCards >= 25 },
  { id: 'cards_100', title: 'Card Hoarder', description: 'Earn 100 Hero Cards.', category: 'collection', icon: '🃏', reward: { permits: 10, hope: 1000 }, isUnlocked: (s) => s.lifetimeCards >= 100 },
  { id: 'cards_250', title: 'Card Archivist', description: 'Earn 250 Hero Cards.', category: 'collection', icon: '🗂️', reward: { permits: 18, hope: 2200 }, isUnlocked: (s) => s.lifetimeCards >= 250 },

  // ---- Economy -------------------------------------------------------------
  { id: 'hope_1k', title: 'Spark of Hope', description: 'Earn 1,000 Hope in total.', category: 'economy', icon: '✨', reward: { permits: 5, hope: 300 }, isUnlocked: (s) => s.lifetimeHope >= 1000 },
  { id: 'hope_10k', title: 'Beacon of Hope', description: 'Earn 10,000 Hope in total.', category: 'economy', icon: '🔆', reward: { permits: 12, hope: 1500 }, isUnlocked: (s) => s.lifetimeHope >= 10000 },
  { id: 'hope_50k', title: 'Wellspring of Hope', description: 'Earn 50,000 Hope in total.', category: 'economy', icon: '🌅', reward: { permits: 25, hope: 5000 }, isUnlocked: (s) => s.lifetimeHope >= 50000 },
];

const ACHIEVEMENTS_BY_ID: Record<string, AchievementDef> = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a]));

export function getAchievement(id: string): AchievementDef | undefined {
  return ACHIEVEMENTS_BY_ID[id];
}

/**
 * Scan the current meta-state, unlock every newly satisfied achievement, grant
 * the combined reward in a single atomic write, and emit one `achievementUnlocked`
 * event per unlock (drives the toast). Loops until no further unlocks so a reward
 * that itself crosses another threshold resolves in the same pass. Idempotent:
 * already-unlocked ids never re-grant (the metaState ledger dedups).
 */
export function evaluateAchievements(): void {
  for (;;) {
    const s = getMetaState();
    const newly = ACHIEVEMENTS.filter((a) => !s.unlockedAchievements.includes(a.id) && a.isUnlocked(s));
    if (newly.length === 0) return;
    const permits = newly.reduce((sum, a) => sum + (a.reward.permits ?? 0), 0);
    const hope = newly.reduce((sum, a) => sum + (a.reward.hope ?? 0), 0);
    applyAchievementUnlocks(newly.map((a) => a.id), permits, hope);
    for (const a of newly) {
      gameToUiEvents.emit('achievementUnlocked', {
        id: a.id,
        title: a.title,
        description: a.description,
        icon: a.icon,
        reward: a.reward,
      });
    }
  }
}

// Re-evaluate on every meta-state change. The guard stops the reward grant's own
// notify() (and any other write triggered mid-evaluation) from recursing.
let evaluating = false;
subscribeMetaState(() => {
  if (evaluating) return;
  evaluating = true;
  try {
    evaluateAchievements();
  } finally {
    evaluating = false;
  }
});
