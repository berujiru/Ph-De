import type { HeroId } from './heroes';
import { globalStageNumber } from './campaign';

// ============================================================================
// HERO UNLOCK SCHEDULE  (design: docs/PROGRESSION.md "Recruitment lives
// inside the ladder")
// ----------------------------------------------------------------------------
// Heroes join the recruitable pool at story milestones along the campaign —
// NOT all at once on stage 1. The Voices RNG (core/Drops.ts) may only offer
// heroes whose unlock stage has been reached, so early battles draw from a
// small starter pool and each act keeps introducing new workers.
// Eden is never in this table: she is auto-deployed in every battle.
// ============================================================================

/** Every hero the Voices RNG may recruit (roster minus Eden and sandbox testers). */
export type RecruitableHeroId = Exclude<HeroId, 'eden' | `sandbox_${string}`>;

/**
 * First global stage (CampaignMap.tsx stage ids) where each worker becomes
 * recruitable, placed at the stage that matches their story:
 *
 *   Act 1 (Grassroots): stage-1 starters are the street-corner folk — exactly
 *   enough to fill Eden's 4 open slots. The rest of the barangay joins as its
 *   landmarks are saved (Sari-Sari → Fishball Vendor, Wet Market → Fisherfolk,
 *   Local Clinic → Nurse, ...).
 *   Act 2 (Town Core): the Jeepney Driver signs on at the Act 2 terminal
 *   (docs/PROGRESSION.md), plaza/market workers follow.
 *   Act 3 (Regional Hub): highway/industry specialists.
 *   Act 4 (National): the last specialist joins at the Dept of Public Works.
 */
export const HERO_UNLOCK_STAGE: Record<RecruitableHeroId, number> = {
  // --- Act 1: The Grassroots ------------------------------------------------
  student: 1,             // The Street Corner (starter)
  taho_vendor: 1,         // The Street Corner (starter)
  street_sweeper: 1,      // The Street Corner (starter)
  security_guard: 1,      // The Street Corner (starter)
  fishball_vendor: 3,     // Sari-Sari Standoff
  teacher: 4,             // Basketball Court — the school beside it
  construction_worker: 6, // Barangay Outpost
  fisherfolk: 7,          // The Wet Market
  nurse: 8,               // Local Clinic
  // --- Act 2: The Town Core ---------------------------------------------------
  baker: 11,              // Public Market Gates
  jeepney_driver: 12,     // Jeepney Terminal
  sorbetes_vendor: 13,    // Town Plaza
  traffic_enforcer: 16,   // Town Overpass
  sales_lady: 18,         // Town Hall Steps — the department store strip
  // --- Act 3: The Regional Hub ------------------------------------------------
  delivery_rider: 21,     // Provincial Highway
  call_center_agent: 24,  // Industrial Park
  electrician: 26,        // Power Plant
  farmer: 27,             // Agri-Business Center
  // --- Act 4: The National Gauntlet --------------------------------------------
  plumber: 34,            // Dept of Public Works
};

export const RECRUITABLE_HERO_IDS = Object.keys(HERO_UNLOCK_STAGE) as RecruitableHeroId[];

/**
 * Heroes the Voices RNG may offer in the given campaign battle. Non-campaign
 * battles (sandbox quick-start passes null coordinates) get the full roster.
 */
export function recruitableHeroIdsForStage(
  act: number | null,
  stageIdx: number | null,
): RecruitableHeroId[] {
  if (act == null || stageIdx == null) return RECRUITABLE_HERO_IDS;
  const stage = globalStageNumber(act, stageIdx);
  return RECRUITABLE_HERO_IDS.filter((id) => HERO_UNLOCK_STAGE[id] <= stage);
}
