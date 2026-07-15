import { describe, expect, it } from 'vitest';
import { isStageUnlocked, stagePrerequisite } from '../../src/game/data/campaign';

/**
 * Progression rule: boss stages (each act's last stage) are OPTIONAL. Clearing
 * an act's pre-boss stage opens BOTH the boss and the next act's first stage, so
 * a boss never blocks campaign progress and stays replayable.
 */
describe('stagePrerequisite', () => {
  it('stage 1 has no prerequisite', () => {
    expect(stagePrerequisite(1)).toBe(0);
  });

  it('a normal mid-act stage needs the stage right before it', () => {
    expect(stagePrerequisite(2)).toBe(1);
    expect(stagePrerequisite(9)).toBe(8);
  });

  it('a boss stage needs the stage right before it', () => {
    expect(stagePrerequisite(10)).toBe(9); // Act 1 boss
    expect(stagePrerequisite(40)).toBe(39); // Act 4 boss
  });

  it("an act's first stage needs the previous act's PRE-boss stage (skips the boss)", () => {
    expect(stagePrerequisite(11)).toBe(9); // Act 2 opens off Act 1 stage 9, not the boss (10)
    expect(stagePrerequisite(21)).toBe(19);
    expect(stagePrerequisite(41)).toBe(39); // Finale opens off Act 4 stage 39
  });
});

describe('isStageUnlocked', () => {
  it('always allows stage 1', () => {
    expect(isStageUnlocked(1, new Set())).toBe(true);
  });

  it('opens the boss AND the next act once the pre-boss stage is cleared', () => {
    const cleared = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(isStageUnlocked(10, cleared)).toBe(true); // Act 1 boss (optional)
    expect(isStageUnlocked(11, cleared)).toBe(true); // Act 2 opener — no boss kill needed
    expect(isStageUnlocked(12, cleared)).toBe(false); // still gated behind stage 11
    expect(isStageUnlocked(20, cleared)).toBe(false); // Act 2 boss not reachable yet
  });

  it('lets you advance while the skipped boss stays unbeaten and replayable', () => {
    // Cleared the Act 2 opener (11) but never beat the Act 1 boss (10).
    const cleared = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 11]);
    expect(cleared.has(10)).toBe(false); // boss still unbeaten
    expect(isStageUnlocked(10, cleared)).toBe(true); // yet still playable (replay)
    expect(isStageUnlocked(12, cleared)).toBe(true); // progression continues
  });

  it('treats any beaten stage as replayable', () => {
    expect(isStageUnlocked(5, new Set([5]))).toBe(true);
  });
});
