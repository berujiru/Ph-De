import { useEffect, useReducer, useState } from 'react';
import { theme } from '../theme';
import { SHOW_SANDBOX } from '../../featureFlags';
import { getStageStars, getHighestClearedStage, getClearedStages, getPermits, subscribeMetaState } from '../../game/data/metaState';
import { isStageUnlocked } from '../../game/data/campaign';
import { type MapSkinId, skinsForAct } from '../../game/data/mapSkins';
import {
  CheckIcon,
  LockIcon,
  PlayIcon,
  RallyPermitIcon,
  SettingsIcon,
  StarIcon,
  StarOutlineIcon,
} from '../icons';
import { BackButton } from '../components/BackButton';
import { Embers, RuinedSkyline, SoulsButton } from '../components/ApocalypseScenery';
import { bossForStage, buildWaveTable, isBossStage } from '../../game/data/waves';
import { ENEMY_DEFINITIONS, enemySizeClass } from '../../game/data/enemies';
import { ENEMY_INTRO_STAGE, type GatedEnemyId } from '../../game/data/enemyUnlocks';
import { EnemyTcgCard } from '../components/EnemyTcgCard';

interface CampaignMapProps {
  onBack: () => void;
  onPrepareBattle: (act: number, stageIdx: number) => void;
  onStartSandbox: () => void;
}

const MARKER_FONT = '"Segoe Print", "Bradley Hand", "Comic Sans MS", cursive';

interface StageEntry {
  id: number;
  name: string;
  /** Rally Permits required per run (PROGRESSION.md energy system). */
  permitCost: number;
}

interface ActEntry {
  id: number;
  title: string;
  description: string;
  /** Portrait map thumbnail for the act's tier — uses the first battle-map skin's street layer. */
  map: string;
  /** Map skin IDs available in this act (stages cycle through them). */
  mapSkins: MapSkinId[];
  stages: StageEntry[];
}

const stage = (id: number, name: string, permitCost = 1): StageEntry => ({ id, name, permitCost });

/**
 * Mini-boss debuts by global stage id (data/enemyUnlocks.ts), derived from the
 * authored wave script so the map only telegraphs anomalies that actually
 * march (e.g. Red Tape is scheduled for Act 3 but not authored in yet).
 */
const AUTHORED_ENEMY_IDS = new Set(
  buildWaveTable('boss_flood_control').flatMap((wave) =>
    wave.events.flatMap((evt) => (evt.type === 'spawn' ? [evt.enemyId] : [])),
  ),
);
const MINIBOSS_DEBUTS = new Map<number, GatedEnemyId[]>();
for (const [id, debutStage] of Object.entries(ENEMY_INTRO_STAGE) as [GatedEnemyId, number][]) {
  if (!AUTHORED_ENEMY_IDS.has(id)) continue;
  if (enemySizeClass(ENEMY_DEFINITIONS[id]) !== 'miniboss') continue;
  MINIBOSS_DEBUTS.set(debutStage, [...(MINIBOSS_DEBUTS.get(debutStage) ?? []), id]);
}

// Nested Data Structure for 4 Acts x 10 Stages + Finale
const CAMPAIGN_DATA: ActEntry[] = [
  {
    id: 1,
    title: 'Act 1: The Grassroots',
    description: 'Protecting local communities from immediate threats like Troll Bots and Fixers. Bosses: Ghost Flood Control, Wang-Wang, Vote Buying.',
    map: skinsForAct(1)[0]?.layers.street ?? '/assets/maps/map-barangay.svg',
    mapSkins: skinsForAct(1).map((s) => s.id),
    stages: [
      stage(1, 'The Street Corner'),
      stage(2, 'Alleyway Ambush'),
      stage(3, 'Sari-Sari Standoff'),
      stage(4, 'Basketball Court'),
      stage(5, 'Tricycle Terminal'),
      stage(6, 'Barangay Outpost'),
      stage(7, 'The Wet Market'),
      stage(8, 'Local Clinic'),
      stage(9, 'Barangay Plaza'),
      stage(10, 'Barangay Hall (Boss)', 2),
    ],
  },
  {
    id: 2,
    title: 'Act 2: The Town Core',
    description: 'Taking back public utilities and spaces from entrenched local corruption. Bosses: Troll Farm, Nepotism, Smuggling.',
    map: skinsForAct(2)[0]?.layers.street ?? '/assets/maps/map-bayan.svg',
    mapSkins: skinsForAct(2).map((s) => s.id),
    stages: [
      stage(11, 'Public Market Gates'),
      stage(12, 'Jeepney Terminal'),
      stage(13, 'Town Plaza'),
      stage(14, 'Public Library'),
      stage(15, 'Municipal Hospital'),
      stage(16, 'Town Overpass'),
      stage(17, 'Police Station'),
      stage(18, 'Town Hall Steps'),
      stage(19, "Mayor's Driveway"),
      stage(20, 'City Hall (Boss)', 2),
    ],
  },
  {
    id: 3,
    title: 'Act 3: The Regional Hub',
    description: 'Dismantling provincial syndicates and ghost projects across the region. Bosses: Pork Barrel, Budget Insertion, Ghost Flood Control.',
    map: skinsForAct(3)[0]?.layers.street ?? '/assets/maps/map-province.svg',
    mapSkins: skinsForAct(3).map((s) => s.id),
    stages: [
      stage(21, 'Provincial Highway'),
      stage(22, 'Ghost Bridge'),
      stage(23, 'Regional Port'),
      stage(24, 'Industrial Park'),
      stage(25, 'Provincial Hospital'),
      stage(26, 'Power Plant'),
      stage(27, 'Agri-Business Center'),
      stage(28, 'Regional Court'),
      stage(29, 'Capitol Grounds'),
      stage(30, 'Provincial Capitol (Boss)', 2),
    ],
  },
  {
    id: 4,
    title: 'Act 4: The National Gauntlet',
    description: 'Facing the systemic root of the anomalies across national government agencies. Bosses: Political Dynasty, Budget Insertion, Pork Barrel.',
    map: skinsForAct(4)[0]?.layers.street ?? '/assets/maps/map-national.svg',
    mapSkins: skinsForAct(4).map((s) => s.id),
    stages: [
      stage(31, 'National Highway'),
      stage(32, 'Transport Agency'),
      stage(33, 'Social Welfare HQ'),
      stage(34, 'Dept of Public Works'),
      stage(35, 'Bureau of Customs'),
      stage(36, 'National Treasury'),
      stage(37, 'The Senate Gates'),
      stage(38, 'Congress Steps'),
      stage(39, 'Palace Gates'),
      stage(40, "The System's Heart (Boss)", 2),
    ],
  },
  {
    id: 5,
    title: 'Finale: Ang Sistema',
    description: 'Every defeated anomaly returns at once. The full alliance holds the line. Boss: Ang Sistema.',
    map: skinsForAct(4)[2]?.layers.street ?? '/assets/maps/map-finale.svg',
    mapSkins: ['natl-palace'],
    stages: [stage(41, 'Ang Sistema (Finale)', 3)],
  },
];

// No mocked stage stars here anymore.
// We read from metaState inside the component.

/** 0–3 star rating strip for a stage. */
function StageStars({ stars }: { stars: number }) {
  return (
    <span
      role="img"
      aria-label={`${stars} of 3 stars`}
      style={{ display: 'inline-flex', gap: 2, verticalAlign: 'middle' }}
    >
      {[1, 2, 3].map((slot) =>
        slot <= stars ? (
          <span key={slot} style={{ color: theme.materials.cautionYellow, display: 'flex' }}>
            <StarIcon size={14} />
          </span>
        ) : (
          <span key={slot} style={{ color: theme.colors.textMuted, opacity: 0.6, display: 'flex' }}>
            <StarOutlineIcon size={14} />
          </span>
        ),
      )}
    </span>
  );
}

/** Act progress meter dressed as caution tape stretched across a barricade. */
function CautionTapeMeter({ cleared, total }: { cleared: number; total: number }) {
  const pct = Math.round((cleared / total) * 100);
  return (
    <div
      role="img"
      aria-label={`${cleared} of ${total} stages protected`}
      style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}
    >
      <div
        style={{
          flex: 1,
          height: 14,
          backgroundColor: 'rgba(0,0,0,0.55)',
          border: `1px solid ${theme.colors.borderGlass}`,
          borderRadius: 3,
          overflow: 'hidden',
          // barricade posts behind the tape
          backgroundImage:
            'repeating-linear-gradient(90deg, transparent, transparent 34px, rgba(148,163,184,0.35) 34px, rgba(148,163,184,0.35) 37px)',
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            backgroundImage: `repeating-linear-gradient(45deg, ${theme.colors.accent}, ${theme.colors.accent} 10px, #1c1917 10px, #1c1917 20px)`,
            boxShadow: '0 0 8px rgba(234,88,12,0.35), inset 0 0 4px rgba(0,0,0,0.4)',
            transition: 'width 0.3s',
          }}
        />
      </div>
      <span
        style={{
          fontSize: 13,
          fontWeight: 900,
          color: cleared === total ? theme.colors.success : theme.colors.textPrimary,
          whiteSpace: 'nowrap',
        }}
      >
        {cleared}/{total}
      </span>
    </div>
  );
}

export function CampaignMap({ onBack, onPrepareBattle, onStartSandbox }: CampaignMapProps) {
  const [selectedActId, setSelectedActId] = useState(1);
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  useEffect(() => subscribeMetaState(forceUpdate), []);

  const stageStars = getStageStars();
  const highestClearedStage = getHighestClearedStage();
  const cleared = new Set(getClearedStages());
  const permits = getPermits();

  // Campaign scope: total acts (incl. the finale) and how many are fully cleared.
  const totalActs = CAMPAIGN_DATA.length;
  const actsCleared = CAMPAIGN_DATA.filter((a) => a.stages.every((s) => cleared.has(s.id))).length;

  // Switch acts when player scrolls or clicks tabs
  // Find which act contains the highest cleared stage to default open it
  useState(() => {
    const act = CAMPAIGN_DATA.find((a) => a.stages.some((s) => s.id === highestClearedStage + 1));
    if (act) setSelectedActId(act.id);
  });
  
  const canAffordRun = permits > 0;

  return (
    <div
      className="rally-screen"
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: theme.colors.background,
        backgroundImage: `
          radial-gradient(ellipse at 50% -10%, ${theme.materials.corruptionEmber}, transparent 50%),
          radial-gradient(ellipse at 0% 100%, ${theme.materials.corruptionFog}, transparent 55%),
          radial-gradient(ellipse at 100% 80%, ${theme.materials.corruptionFog}, transparent 55%)
        `,
        display: 'flex',
        flexDirection: 'column',
        padding: 'clamp(16px, 4vw, 40px)',
        color: theme.colors.textPrimary,
        overflowY: 'auto',
        zIndex: 100,
        animation: 'miasma-drift 30s ease-in-out infinite',
      }}
    >
      <RuinedSkyline height="34%" opacity={0.5} style={{ zIndex: 0 }} />
      <Embers count={12} />
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 12,
          flexWrap: 'wrap',
          marginBottom: 24,
          maxWidth: 640,
          margin: '0 auto 24px',
          width: '100%',
          position: 'relative',
          zIndex: 3,
        }}
      >
        <div>
          <div style={{ marginBottom: 12 }}>
            <BackButton onClick={onBack} label="Back to the Rally" />
          </div>
          <h1 style={{
            margin: 0,
            fontSize: 'clamp(24px, 5vw, 32px)',
            textTransform: 'uppercase',
            letterSpacing: 2,
            color: theme.colors.accent,
            textShadow: `0 0 10px rgba(234,88,12,0.5), 0 0 28px rgba(234,88,12,0.2)`,
            animation: 'ember-pulse 4s ease-in-out infinite',
          }}>
            The March
          </h1>
          <div style={{ color: theme.colors.textMuted, fontSize: 14, opacity: 0.7, textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>
            Barangay to Bayan to the whole archipelago — one street at a time.
          </div>
          {/* Campaign scope — total acts and how many are fully secured. */}
          <div
            aria-label={`${actsCleared} of ${totalActs} acts secured`}
            style={{
              marginTop: 10,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: 1,
              textTransform: 'uppercase',
              color: theme.colors.textSecondary,
              border: `1px solid rgba(234,88,12,0.25)`,
              borderRadius: 999,
              padding: '4px 12px',
              backgroundColor: theme.colors.surfaceGlass,
            }}
          >
            <span style={{ color: theme.colors.accent, fontWeight: 900 }}>{actsCleared}</span>
            <span style={{ opacity: 0.75 }}>/ {totalActs} Acts</span>
          </div>
        </div>

        {/* Permit balance — the energy that pays for every run */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            minHeight: 44,
            padding: '8px 16px',
            backgroundColor: theme.colors.surfaceGlass,
            border: `1px solid rgba(234,88,12,0.25)`,
            borderRadius: 999,
            backdropFilter: 'blur(12px)',
            boxShadow: '0 0 12px rgba(234,88,12,0.12), inset 0 0 8px rgba(234,88,12,0.06)',
          }}
        >
          <span style={{ color: theme.colors.accent, display: 'flex', filter: 'drop-shadow(0 0 4px rgba(234,88,12,0.5))' }}>
            <RallyPermitIcon size={24} />
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <span style={{ fontSize: 10, letterSpacing: 1, color: theme.colors.textMuted, textTransform: 'uppercase', fontWeight: 700 }}>Rally Permits</span>
            <span style={{ fontSize: 16, fontWeight: 900 }}>{permits} / 10</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 640, margin: '0 auto', width: '100%', position: 'relative', zIndex: 3 }}>
        {/* Sandbox Entry — gated behind the VITE_SHOW_SANDBOX feature flag. */}
        {SHOW_SANDBOX && (
        <div
          style={{
            backgroundColor: theme.materials.corruptionEmber,
            border: `2px dashed ${theme.colors.accent}`,
            borderRadius: 12,
            padding: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
            boxShadow: 'inset 0 0 20px rgba(234,88,12,0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: theme.colors.accent, display: 'flex', filter: 'drop-shadow(0 0 3px rgba(234,88,12,0.4))' }}>
              <SettingsIcon size={26} />
            </span>
            <div>
              <h3 style={{ margin: '0 0 2px 0', fontSize: 18, color: theme.colors.accent, textShadow: '0 0 8px rgba(234,88,12,0.3)' }}>Attack Sandbox</h3>
              <p style={{ margin: 0, fontSize: 13, color: theme.colors.textMuted }}>
                Isolated environment for testing mechanics. No permit needed.
              </p>
            </div>
          </div>
          <SoulsButton variant="primary" onClick={onStartSandbox}>
            ENTER SANDBOX
          </SoulsButton>
        </div>
        )}

        {/* Acts Accordion */}
        {CAMPAIGN_DATA.map((act) => {
          const firstStageId = act.stages[0].id;
          // An act opens once its first stage is playable — which happens after
          // the previous act's pre-boss stage, so the prior boss can be skipped.
          const isActUnlocked = isStageUnlocked(firstStageId, cleared);
          // The boss anchoring this act's final stage — shown as the act's emblem.
          const actBossId = bossForStage(act.id, act.stages.length - 1);
          const isExpanded = selectedActId === act.id;
          const actClearedStages = act.stages.filter((s) => cleared.has(s.id)).length;

          return (
            <div
              key={act.id}
              style={{
                backgroundColor: isActUnlocked ? theme.colors.surfaceGlass : `rgba(12, 10, 9, 0.7)`,
                border: `1px solid ${isActUnlocked ? 'rgba(234,88,12,0.15)' : 'rgba(63,63,70,0.3)'}`,
                borderRadius: 12,
                display: 'flex',
                flexDirection: 'column',
                opacity: isActUnlocked ? 1 : isExpanded ? 0.82 : 0.55,
                overflow: 'hidden',
                backdropFilter: 'blur(12px)',
                transition: 'all 0.3s',
                boxShadow: isActUnlocked
                  ? '0 0 16px rgba(234,88,12,0.06)'
                  : `inset 0 0 30px ${theme.materials.corruptionFog}`,
              }}
            >
              {/* Accordion Header — every act expands so the full march is visible,
                  even before it's been reached (locked stages just can't deploy). */}
              <button
                onClick={() => setSelectedActId(isExpanded ? 0 : act.id)}
                aria-expanded={isExpanded}
                style={{
                  padding: 14,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  cursor: 'pointer',
                  backgroundColor: isExpanded ? theme.materials.corruptionEmber : 'transparent',
                  border: 'none',
                  borderBottom: isExpanded ? `1px solid rgba(234,88,12,0.15)` : 'none',
                  color: 'inherit',
                  textAlign: 'left',
                  width: '100%',
                  fontFamily: 'inherit',
                  boxShadow: isExpanded ? 'inset 0 -1px 12px rgba(234,88,12,0.08)' : 'none',
                }}
              >
                {/* Act boss TCG card — the act's emblem (replaces the map thumbnail) */}
                <div
                  aria-label={`Act boss: ${ENEMY_DEFINITIONS[actBossId]?.name ?? actBossId}`}
                  style={{
                    width: 62,
                    flexShrink: 0,
                    filter: isActUnlocked ? 'none' : 'grayscale(100%) brightness(0.4)',
                  }}
                >
                  <EnemyTcgCard variant="compact" enemyId={actBossId} style={{ pointerEvents: 'none' }} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: 17,
                        color: isActUnlocked ? theme.colors.textPrimary : theme.colors.textSecondary,
                      }}
                    >
                      {act.title}
                    </h3>
                    {!isActUnlocked && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 9,
                          fontWeight: 900,
                          letterSpacing: 1,
                          textTransform: 'uppercase',
                          color: theme.colors.textSecondary,
                          border: `1px solid ${theme.materials.rust}`,
                          borderRadius: 3,
                          padding: '2px 6px',
                          backgroundColor: 'rgba(12,10,9,0.6)',
                        }}
                      >
                        <LockIcon size={10} /> Not yet reached
                      </span>
                    )}
                  </div>
                  <p style={{ margin: 0, fontSize: 12.5, color: theme.colors.textMuted }}>
                    {act.description}
                  </p>
                  {isActUnlocked && <CautionTapeMeter cleared={actClearedStages} total={act.stages.length} />}
                </div>

                <span style={{ color: theme.colors.textSecondary, display: 'flex', flexShrink: 0 }}>
                  <span
                    style={{
                      display: 'flex',
                      transform: isExpanded ? 'rotate(-90deg)' : 'rotate(90deg)',
                      transition: 'transform 0.2s',
                    }}
                  >
                    <PlayIcon size={18} />
                  </span>
                </span>
              </button>

              {/* Accordion Body (Stages List) — shown for locked acts too, so
                  the whole journey is visible; unreached stages stay LOCKED. */}
              {isExpanded && (
                <div style={{ padding: 16, backgroundColor: 'rgba(9, 9, 11, 0.6)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {act.stages.map((stageEntry, stageIdx) => {
                      // State: is this stage cleared, playable-but-unbeaten, or
                      // locked? Multiple stages can be available at once now — a
                      // skippable boss and the next act's opener both unlock off
                      // the same pre-boss clear.
                      const isCleared = cleared.has(stageEntry.id);
                      const isLocked = !isCleared && !isStageUnlocked(stageEntry.id, cleared);
                      const isNext = !isCleared && !isLocked;
                      const isLast = stageIdx === act.stages.length - 1;
                      const stars = stageStars[stageEntry.id] || 0;
                      // What anchors the stage's final wave (a boss only every
                      // BOSS_STAGE_INTERVAL-th stage), and any anomaly that
                      // debuts here (wave script + enemyUnlocks schedule).
                      const hasBoss = isBossStage(act.id, stageIdx);
                      const minibossDebuts = MINIBOSS_DEBUTS.get(stageEntry.id) ?? [];

                      const nodeColor: string = isCleared
                        ? theme.colors.accent
                        : isNext
                          ? theme.colors.accent
                          : theme.colors.textMuted;
                      const borderColor: string = isCleared
                        ? 'rgba(234,88,12,0.6)'
                        : isNext
                          ? theme.colors.accent
                          : 'rgba(63,63,70,0.35)';
                      const nodeBg: string = isCleared
                        ? 'rgba(234,88,12,0.12)'
                        : isNext
                          ? 'rgba(234,88,12,0.25)'
                          : `rgba(12,10,9,0.6)`;

                      return (
                        <div
                          key={stageEntry.id}
                          style={{ display: 'flex', alignItems: 'stretch', gap: 12, opacity: isLocked ? 0.5 : 1 }}
                        >
                          {/* Route node + connecting line */}
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div
                              style={{
                                width: 26,
                                height: 26,
                                borderRadius: '50%',
                                border: `2px solid ${borderColor}`,
                                backgroundColor: nodeBg,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                boxShadow: isCleared
                                  ? '0 0 8px rgba(234,88,12,0.4), 0 0 16px rgba(234,88,12,0.15)'
                                  : isNext
                                    ? `0 0 12px rgba(234,88,12,0.6), 0 0 24px rgba(234,88,12,0.25)`
                                    : `inset 0 0 6px ${theme.materials.corruptionFog}`,
                                color: theme.colors.accent,
                                flexShrink: 0,
                                animation: isNext ? 'bonfire-flicker 2s ease-in-out infinite' : undefined,
                              }}
                            >
                              {isCleared && <CheckIcon size={14} />}
                            </div>
                            {!isLast && (
                              <div style={{ width: 2, flex: 1, backgroundColor: borderColor, margin: '2px 0' }} />
                            )}
                          </div>

                          {/* Stage card */}
                          <div
                            style={{
                              flex: 1,
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              gap: 10,
                              backgroundColor: isLocked ? 'rgba(12,10,9,0.5)' : theme.colors.surfaceGlass,
                              padding: '10px 14px',
                              borderRadius: 8,
                              border: `1px solid ${borderColor}`,
                              marginBottom: isLast ? 0 : 12,
                              boxShadow: isLocked ? `inset 0 0 12px ${theme.materials.corruptionFog}` : 'none',
                            }}
                          >
                            <div style={{ minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                <span style={{ fontSize: 11, color: nodeColor, fontWeight: 700, letterSpacing: 1 }}>
                                  STAGE {stageEntry.id}
                                </span>
                                {hasBoss && (
                                  <div style={{ position: 'relative', width: 30, flexShrink: 0, marginLeft: 4 }}>
                                    <EnemyTcgCard
                                      variant="compact"
                                      enemyId={bossForStage(act.id, stageIdx)}
                                      style={{ pointerEvents: 'none', padding: 2, border: '1px solid #312e81', borderRadius: 5 }}
                                    />
                                    <div style={{ position: 'absolute', bottom: -4, left: '50%', transform: 'translateX(-50%)', backgroundColor: '#ef4444', color: '#fff', fontSize: 7, fontWeight: 900, padding: '1px 4px', borderRadius: 2, boxShadow: '0 1px 2px rgba(0,0,0,0.5)', zIndex: 10, letterSpacing: 0.5 }}>
                                      BOSS
                                    </div>
                                  </div>
                                )}
                                {minibossDebuts.map((id) => (
                                  <div key={id} style={{ position: 'relative', width: 30, flexShrink: 0, marginLeft: 4 }}>
                                    <EnemyTcgCard
                                      variant="compact"
                                      enemyId={id}
                                      style={{ pointerEvents: 'none', padding: 2, border: '1px solid #312e81', borderRadius: 5 }}
                                    />
                                    <div style={{ position: 'absolute', bottom: -4, left: '50%', transform: 'translateX(-50%)', backgroundColor: '#f59e0b', color: '#fff', fontSize: 7, fontWeight: 900, padding: '1px 4px', borderRadius: 2, boxShadow: '0 1px 2px rgba(0,0,0,0.5)', zIndex: 10, letterSpacing: 0.5 }}>
                                      NEW
                                    </div>
                                  </div>
                                ))}
                                <StageStars stars={stars} />
                              </div>
                              <div
                                style={{
                                  fontSize: 15,
                                  color: theme.colors.textPrimary,
                                  fontWeight: isNext ? 700 : 400,
                                }}
                              >
                                {stageEntry.name}
                              </div>
                            </div>

                            {!isLocked ? (
                              <SoulsButton
                                variant={isNext ? 'primary' : 'secondary'}
                                onClick={() => onPrepareBattle(act.id, stageIdx)}
                                disabled={!canAffordRun}
                                aria-label={`${isCleared ? 'Replay' : 'Prepare'} ${stageEntry.name} — costs ${stageEntry.permitCost} rally permit${stageEntry.permitCost > 1 ? 's' : ''}`}
                                style={{
                                  minHeight: 44,
                                  padding: '6px 14px',
                                  fontSize: 12,
                                  flexDirection: 'column',
                                  gap: 2,
                                  flexShrink: 0,
                                  opacity: canAffordRun ? 1 : 0.5,
                                }}
                              >
                                <span>{isCleared ? 'REPLAY' : 'PREPARE'}</span>
                                <span
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 4,
                                    fontSize: 11,
                                    fontWeight: 700,
                                    letterSpacing: 0,
                                    textTransform: 'none',
                                    color: !canAffordRun ? theme.colors.textMuted : theme.colors.accent,
                                  }}
                                >
                                  <RallyPermitIcon size={13} />
                                  {stageEntry.permitCost} permit{stageEntry.permitCost > 1 ? 's' : ''}
                                </span>
                              </SoulsButton>
                            ) : (
                              <div
                                style={{
                                  color: theme.colors.textSecondary,
                                  fontSize: 12,
                                  fontWeight: 700,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 6,
                                }}
                              >
                                <LockIcon size={16} />
                                LOCKED
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        <div
          style={{
            textAlign: 'center',
            fontFamily: MARKER_FONT,
            color: theme.colors.accent,
            fontSize: 13,
            paddingBottom: 24,
            opacity: 0.55,
            textShadow: '0 0 10px rgba(234,88,12,0.35), 0 0 24px rgba(234,88,12,0.12)',
            letterSpacing: 1,
          }}
        >
          Buong Pilipinas, protektado.
        </div>
      </div>
    </div>
  );
}
