import { useState } from 'react';
import { theme } from '../theme';
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

// Mock campaign progress: stage id → stars earned (1–3). Cleared = present.
const MOCK_STAGE_STARS: Record<number, number> = {
  1: 3,
  2: 3,
  3: 2,
  4: 3,
  5: 1,
  6: 2,
  7: 2,
};
const HIGHEST_CLEARED_STAGE = 7;
const MOCK_PERMITS = 3;

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
            backgroundImage: `repeating-linear-gradient(45deg, ${theme.materials.cautionYellow}, ${theme.materials.cautionYellow} 10px, ${theme.materials.ink} 10px, ${theme.materials.ink} 20px)`,
            boxShadow: '0 0 8px rgba(234, 179, 8, 0.35)',
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
  const [expandedAct, setExpandedAct] = useState<number | null>(1);
  const canAffordRun = MOCK_PERMITS > 0;

  return (
    <div
      className="rally-screen"
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: theme.colors.background,
        backgroundImage: 'radial-gradient(ellipse at 50% -10%, rgba(56,189,248,0.08), transparent 60%)',
        display: 'flex',
        flexDirection: 'column',
        padding: 'clamp(16px, 4vw, 40px)',
        color: theme.colors.textPrimary,
        overflowY: 'auto',
        zIndex: 100,
      }}
    >
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
        }}
      >
        <div>
          <div style={{ marginBottom: 12 }}>
            <BackButton onClick={onBack} label="Back to the Rally" />
          </div>
          <h1 style={{ margin: 0, fontSize: 'clamp(24px, 5vw, 32px)', textTransform: 'uppercase', letterSpacing: 2 }}>
            The March
          </h1>
          <div style={{ color: theme.colors.textMuted, fontSize: 14 }}>
            Barangay to Bayan to the whole archipelago — one street at a time.
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
            border: `1px solid ${theme.colors.borderGlass}`,
            borderRadius: 999,
            backdropFilter: 'blur(12px)',
          }}
        >
          <span style={{ color: theme.colors.accent, display: 'flex' }}>
            <RallyPermitIcon size={24} />
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
            <span style={{ fontSize: 10, letterSpacing: 1, color: theme.colors.textMuted, fontWeight: 700 }}>
              RALLY PERMITS
            </span>
            <span style={{ fontSize: 17, fontWeight: 900 }}>{MOCK_PERMITS}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 640, margin: '0 auto', width: '100%' }}>
        {/* Sandbox Entry */}
        <div
          style={{
            backgroundColor: 'rgba(56, 189, 248, 0.08)',
            border: `2px dashed ${theme.colors.accent}`,
            borderRadius: 12,
            padding: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: theme.colors.accent, display: 'flex' }}>
              <SettingsIcon size={26} />
            </span>
            <div>
              <h3 style={{ margin: '0 0 2px 0', fontSize: 18, color: theme.colors.accent }}>Attack Sandbox</h3>
              <p style={{ margin: 0, fontSize: 13, color: theme.colors.textMuted }}>
                Isolated environment for testing mechanics. No permit needed.
              </p>
            </div>
          </div>
          <button
            onClick={onStartSandbox}
            style={{
              minHeight: 44,
              padding: '10px 20px',
              backgroundColor: theme.colors.accent,
              color: theme.colors.background,
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 900,
              fontSize: 14,
              boxShadow: '0 4px 0 #0284c7',
              fontFamily: 'inherit',
            }}
          >
            ENTER SANDBOX
          </button>
        </div>

        {/* Acts Accordion */}
        {CAMPAIGN_DATA.map((act) => {
          const firstStageId = act.stages[0].id;
          const isActUnlocked = HIGHEST_CLEARED_STAGE >= firstStageId - 1;
          const isExpanded = expandedAct === act.id;
          const actClearedStages = Math.max(
            0,
            Math.min(act.stages.length, HIGHEST_CLEARED_STAGE - (firstStageId - 1)),
          );

          return (
            <div
              key={act.id}
              style={{
                backgroundColor: isActUnlocked ? theme.colors.surfaceGlass : 'rgba(30, 41, 59, 0.4)',
                border: `1px solid ${isActUnlocked ? theme.colors.borderGlass : 'rgba(51, 65, 85, 0.5)'}`,
                borderRadius: 12,
                display: 'flex',
                flexDirection: 'column',
                opacity: isActUnlocked ? 1 : 0.6,
                overflow: 'hidden',
                backdropFilter: 'blur(12px)',
                transition: 'all 0.3s',
              }}
            >
              {/* Accordion Header */}
              <button
                onClick={() => {
                  if (isActUnlocked) setExpandedAct(isExpanded ? null : act.id);
                }}
                disabled={!isActUnlocked}
                aria-expanded={isExpanded}
                style={{
                  padding: 14,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  cursor: isActUnlocked ? 'pointer' : 'not-allowed',
                  backgroundColor: isExpanded ? 'rgba(56, 189, 248, 0.05)' : 'transparent',
                  border: 'none',
                  borderBottom: isExpanded ? `1px solid ${theme.colors.borderGlass}` : 'none',
                  color: 'inherit',
                  textAlign: 'left',
                  width: '100%',
                  fontFamily: 'inherit',
                }}
              >
                {/* Tier map thumbnail */}
                <img
                  src={act.map}
                  alt=""
                  style={{
                    width: 58,
                    height: 88,
                    objectFit: 'cover',
                    borderRadius: 6,
                    border: `2px solid ${isActUnlocked ? theme.materials.metalDark : 'rgba(51,65,85,0.6)'}`,
                    filter: isActUnlocked ? 'none' : 'grayscale(90%) brightness(0.6)',
                    flexShrink: 0,
                  }}
                />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3
                    style={{
                      margin: '0 0 3px 0',
                      fontSize: 17,
                      color: isActUnlocked ? theme.colors.textPrimary : theme.colors.textSecondary,
                    }}
                  >
                    {act.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: 12.5, color: theme.colors.textMuted }}>
                    {isActUnlocked ? act.description : 'Act locked. Complete previous acts to unlock.'}
                  </p>
                  {isActUnlocked && <CautionTapeMeter cleared={actClearedStages} total={act.stages.length} />}
                </div>

                <span style={{ color: theme.colors.textSecondary, display: 'flex', flexShrink: 0 }}>
                  {isActUnlocked ? (
                    <span
                      style={{
                        display: 'flex',
                        transform: isExpanded ? 'rotate(-90deg)' : 'rotate(90deg)',
                        transition: 'transform 0.2s',
                      }}
                    >
                      <PlayIcon size={18} />
                    </span>
                  ) : (
                    <LockIcon size={22} />
                  )}
                </span>
              </button>

              {/* Accordion Body (Stages List) */}
              {isExpanded && isActUnlocked && (
                <div style={{ padding: 16, backgroundColor: 'rgba(15, 23, 42, 0.5)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {act.stages.map((stageEntry, stageIdx) => {
                      const isCleared = HIGHEST_CLEARED_STAGE >= stageEntry.id;
                      const isNext = HIGHEST_CLEARED_STAGE === stageEntry.id - 1;
                      const isLocked = HIGHEST_CLEARED_STAGE < stageEntry.id - 1;
                      const isLast = stageIdx === act.stages.length - 1;
                      const stars = MOCK_STAGE_STARS[stageEntry.id] ?? 0;
                      // What anchors the stage's final wave (a boss only every
                      // BOSS_STAGE_INTERVAL-th stage), and any anomaly that
                      // debuts here (wave script + enemyUnlocks schedule).
                      const hasBoss = isBossStage(act.id, stageIdx);
                      const minibossDebuts = MINIBOSS_DEBUTS.get(stageEntry.id) ?? [];

                      const nodeColor: string = isCleared
                        ? theme.colors.success
                        : isNext
                          ? theme.colors.accent
                          : theme.colors.textSecondary;
                      const borderColor: string = isCleared
                        ? theme.colors.success
                        : isNext
                          ? theme.colors.accent
                          : 'rgba(51, 65, 85, 0.5)';
                      const nodeBg: string = isCleared
                        ? 'rgba(34, 197, 94, 0.1)'
                        : isNext
                          ? 'rgba(56, 189, 248, 0.2)'
                          : 'rgba(30, 41, 59, 0.5)';

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
                                boxShadow: isNext ? `0 0 10px ${theme.colors.accent}` : 'none',
                                color: theme.colors.success,
                                flexShrink: 0,
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
                              backgroundColor: 'rgba(30, 41, 59, 0.35)',
                              padding: '10px 14px',
                              borderRadius: 8,
                              border: `1px solid ${borderColor}`,
                              marginBottom: isLast ? 0 : 12,
                            }}
                          >
                            <div style={{ minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                <span style={{ fontSize: 11, color: nodeColor, fontWeight: 700, letterSpacing: 1 }}>
                                  STAGE {stageEntry.id}
                                </span>
                                {hasBoss && (
                                  <div style={{ position: 'relative', width: 30, height: 42, flexShrink: 0, marginLeft: 4 }}>
                                    <div style={{ transform: 'scale(0.1)', transformOrigin: 'top left', position: 'absolute', pointerEvents: 'none' }}>
                                      <EnemyTcgCard enemyId={bossForStage(act.id, stageIdx)} />
                                    </div>
                                    <div style={{ position: 'absolute', bottom: -4, left: '50%', transform: 'translateX(-50%)', backgroundColor: '#ef4444', color: '#fff', fontSize: 7, fontWeight: 900, padding: '1px 4px', borderRadius: 2, boxShadow: '0 1px 2px rgba(0,0,0,0.5)', zIndex: 10, letterSpacing: 0.5 }}>
                                      BOSS
                                    </div>
                                  </div>
                                )}
                                {minibossDebuts.map((id) => (
                                  <div key={id} style={{ position: 'relative', width: 30, height: 42, flexShrink: 0, marginLeft: 4 }}>
                                    <div style={{ transform: 'scale(0.1)', transformOrigin: 'top left', position: 'absolute', pointerEvents: 'none' }}>
                                      <EnemyTcgCard enemyId={id} />
                                    </div>
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
                              <button
                                onClick={() => onPrepareBattle(act.id, stageIdx)}
                                disabled={!canAffordRun}
                                aria-label={`${isCleared ? 'Replay' : 'Prepare'} ${stageEntry.name} — costs ${stageEntry.permitCost} rally permit${stageEntry.permitCost > 1 ? 's' : ''}`}
                                style={{
                                  minHeight: 44,
                                  padding: '6px 14px',
                                  backgroundColor: isNext ? theme.colors.success : 'transparent',
                                  color: !canAffordRun
                                    ? theme.colors.textMuted
                                    : isNext
                                      ? theme.colors.background
                                      : theme.colors.textPrimary,
                                  border: isNext ? 'none' : `1px solid ${theme.colors.border}`,
                                  borderRadius: 6,
                                  cursor: canAffordRun ? 'pointer' : 'not-allowed',
                                  opacity: canAffordRun ? 1 : 0.45,
                                  fontWeight: 900,
                                  fontSize: 12,
                                  boxShadow: isNext && canAffordRun ? '0 3px 0 #166534' : 'none',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  gap: 2,
                                  flexShrink: 0,
                                  fontFamily: 'inherit',
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
                                    color: !canAffordRun
                                      ? theme.colors.textMuted
                                      : isNext
                                        ? 'rgba(15,23,42,0.8)'
                                        : theme.colors.accent,
                                  }}
                                >
                                  <RallyPermitIcon size={13} />
                                  {stageEntry.permitCost} permit{stageEntry.permitCost > 1 ? 's' : ''}
                                </span>
                              </button>
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
            color: theme.colors.textMuted,
            fontSize: 13,
            paddingBottom: 24,
          }}
        >
          Buong Pilipinas, protektado.
        </div>
      </div>
    </div>
  );
}
