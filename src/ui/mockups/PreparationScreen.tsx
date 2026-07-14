import { useEffect, useReducer, useState } from 'react';
import { theme } from '../theme';
import {
  CheckIcon,
  InfoIcon,
  LockIcon,
  MegaphoneIcon,
  RallyPermitIcon,
  VoicesIcon,
  damageTypeIcons,
} from '../icons';
import { BackButton } from '../components/BackButton';
import { EnemyCaseCard, HeroPolaroidCard, SkinPortrait } from '../components/ArchiveCards';
import { getSelectedSkin } from '../../game/data/skinSelection';
import { HERO_DEFINITIONS, type HeroDefinition, type HeroId } from '../../game/data/heroes';
import { buildWaveTable, bossForStage } from '../../game/data/waves';
import { ENEMY_DEFINITIONS, type EnemyId } from '../../game/data/enemies';
import { getPermits, getStoreUnlockedHeroes, getHighestClearedStage, subscribeMetaState } from '../../game/data/metaState';
import { heroUnlockStage } from '../../game/data/heroUnlocks';

interface PreparationScreenProps {
  act?: number;
  stageIdx?: number;
  onBack: () => void;
  onDeploy: () => void;
}

const MARKER_FONT = '"Segoe Print", "Bradley Hand", "Comic Sans MS", cursive';
const TYPEWRITER_FONT = '"Courier New", Courier, monospace';

// ---------------------------------------------------------------- mock data

// No MOCK_PERMITS here anymore

/** Telegraphed enemy intel for the stage (reuses enemy-card data shape). */
interface EnemyIntel {
  name: string;
  form: string;
  note: string;
  weakTo: HeroDefinition['damageType'];
  count: string;
}

const MOCK_WEAKNESSES: Record<string, HeroDefinition['damageType']> = {
  grunt: 'Physical',
  runner: 'Frost',
  brute: 'Magic',
  ghost_employee: 'Holy',
  the_overpriced: 'Earth',
  tender_rigger: 'Wind',
  epal: 'Water',
  shell_company: 'Lightning',
  kickback_courier: 'Frost',
  crony_bodyguard: 'Dark',
  bribery: 'Magic',
  land_grabber: 'Earth',
  hoarder: 'Fire',
  red_tape: 'Magic',
};

// No hardcoded UNLOCKED_HERO_IDS here anymore

interface BayanihanAct {
  id: string;
  name: string;
  effect: string;
  unlocked: boolean;
}

const BAYANIHAN_ACTS: BayanihanAct[] = [
  { id: 'people_power', name: 'People Power', effect: 'Crowd surge — mass knockback down the path.', unlocked: true },
  { id: 'batingaw', name: 'Batingaw', effect: 'Church bell tolls — mass stun (bosses resist).', unlocked: true },
  { id: 'baha_ng_tulong', name: 'Baha ng Tulong', effect: 'Flood of aid — large Barrier heal.', unlocked: false },
  { id: 'boses_ng_bayan', name: 'Boses ng Bayan', effect: 'All heroes gain attack speed.', unlocked: false },
  { id: 'salu_salo', name: 'Salu-Salo', effect: 'Community feast — gold windfall.', unlocked: false },
  { id: 'piyesta', name: 'Piyesta', effect: 'Voices surge — next Act charges much faster.', unlocked: false },
];

// ---------------------------------------------------------------- helpers

const EDEN = HERO_DEFINITIONS['eden'];

function DamageTypeChip({ type, emphasized }: { type: HeroDefinition['damageType']; emphasized?: boolean }) {
  const Icon = damageTypeIcons[type];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontSize: 11,
        fontWeight: 900,
        padding: '2px 8px',
        borderRadius: 999,
        border: `1px solid ${emphasized ? theme.colors.accent : theme.colors.borderGlass}`,
        color: emphasized ? theme.colors.accent : theme.colors.textPrimary,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
      }}
    >
      {Icon ? <Icon size={13} /> : null}
      {type}
    </span>
  );
}

/** A section label chalked onto the briefing-room wall. */
function SectionLabel({ children }: { children: string }) {
  return (
    <h2
      style={{
        margin: '0 0 10px 0',
        fontSize: 15,
        letterSpacing: 3,
        textTransform: 'uppercase',
        color: theme.colors.textMuted,
        fontFamily: TYPEWRITER_FONT,
        borderBottom: `1px dashed ${theme.colors.borderGlass}`,
        paddingBottom: 6,
      }}
    >
      {children}
    </h2>
  );
}

// ---------------------------------------------------------------- screen

/** A recruited worker who counters one of the stage's telegraphed anomalies. */
interface CompanionHint {
  hero: HeroDefinition;
  counters: string[];
}

export function PreparationScreen({ act, stageIdx, onBack, onDeploy }: PreparationScreenProps) {
  const [selectedAct, setSelectedAct] = useState<string>('people_power');
  const [actPickerOpen, setActPickerOpen] = useState(false);
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  useEffect(() => subscribeMetaState(forceUpdate), []);

  const permits = getPermits();
  const highestStage = getHighestClearedStage();
  const storeUnlocked = getStoreUnlockedHeroes();

  const stageAct = act ?? 1;
  const stageId = stageIdx ?? 0;
  
  const STAGE = {
    act: `Act ${stageAct}`,
    id: (stageAct - 1) * 10 + stageId + 1,
    name: `Stage ${stageId + 1}`,
    map: '/assets/maps/map-barangay.svg',
    permitCost: 1,
  };

  // Build the wave table for this stage to find expected enemies
  const waveTable = buildWaveTable(bossForStage(stageAct, stageId), stageAct, stageId);
  const enemyCounts: Record<string, number> = {};
  for (const wave of waveTable) {
    for (const evt of wave.events) {
      if (evt.type === 'spawn') {
        enemyCounts[evt.enemyId] = (enemyCounts[evt.enemyId] || 0) + evt.count;
      }
    }
  }

  const ENEMY_INTEL: EnemyIntel[] = Object.entries(enemyCounts).map(([id, count]) => {
    const def = ENEMY_DEFINITIONS[id as EnemyId];
    return {
      name: def?.name || id,
      form: `${def?.sizeClass === 'boss' ? 'Boss' : def?.sizeClass === 'miniboss' ? 'Elite' : 'Swarm'} class`,
      note: `HP: ${def?.maxHp || '?'} | DMG: ${def?.damage || '?'}`,
      weakTo: MOCK_WEAKNESSES[id] || 'Physical',
      count: `x${count}`,
    };
  }).sort((a, b) => parseInt(b.count.slice(1)) - parseInt(a.count.slice(1)));

  const roster = Object.values(HERO_DEFINITIONS).filter((hero) => {
    if (hero.id.startsWith('sandbox_')) return false;
    const unlockStage = heroUnlockStage(hero.id);
    return unlockStage <= highestStage || storeUnlocked.includes(hero.id as HeroId);
  });

  // Companions arrive mid-battle from the Voices meter — you do not pre-pick a
  // squad. The briefing only *hints* which recruited workers counter this
  // stage, so the player knows who to hope for from drops.
  const recommended: CompanionHint[] = roster
    .map((hero) => ({
      hero,
      counters: ENEMY_INTEL.filter((intel) => intel.weakTo === hero.damageType).map((intel) => intel.name),
    }))
    .filter((hint) => hint.counters.length > 0);

  // Telegraphed weaknesses with no recruited counter yet — a soft, non-blocking note.
  const coveredTypes = new Set<HeroDefinition['damageType']>(recommended.map((hint) => hint.hero.damageType));
  const uncovered = ENEMY_INTEL.filter((intel) => !coveredTypes.has(intel.weakTo));

  const canDeploy = permits >= STAGE.permitCost;

  return (
    <div
      className="rally-screen"
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: theme.colors.background,
        background: 'radial-gradient(circle at 50% 38%, rgba(234, 88, 12, 0.06) 0%, #09090b 55%, #050505 100%)',
        overflowY: 'auto',
        color: theme.colors.textPrimary,
        zIndex: 100,
      }}
    >
      {/* Hanging bulb over the command table */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      >
        <div style={{ width: 2, height: 64, backgroundColor: theme.materials.metalDark }} />
        <div
          className="rally-flicker"
          style={{
            width: 16,
            height: 20,
            borderRadius: '50% 50% 45% 45%',
            backgroundColor: '#c2410c',
            boxShadow: '0 0 80px 32px rgba(234, 88, 12, 0.22), 0 0 160px 60px rgba(234, 88, 12, 0.08), 0 40px 120px 40px rgba(0,0,0,0.7)',
          }}
        />
      </div>

      <div
        style={{
          position: 'relative',
          zIndex: 5,
          maxWidth: 760,
          margin: '0 auto',
          padding: 'clamp(12px, 4vw, 36px)',
          paddingBottom: 120,
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}
      >
        {/* Header */}
        <div>
          <div style={{ marginBottom: 14 }}>
            <BackButton onClick={onBack} label="Cancel Briefing" />
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: 'clamp(26px, 6vw, 40px)',
              textTransform: 'uppercase',
              letterSpacing: 3,
              textShadow: '0 0 24px rgba(234, 88, 12, 0.3)',
            }}
          >
            Briefing Room
          </h1>
          <div style={{ color: theme.colors.accent, fontSize: 14, fontWeight: 700, letterSpacing: 2 }}>
            {STAGE.act} — STAGE {STAGE.id}: {STAGE.name.toUpperCase()}
          </div>
        </div>

        {/* Command table: map + enemy intel */}
        <div
          style={{
            backgroundColor: theme.colors.surfaceGlass,
            border: `1px solid ${theme.colors.borderGlass}`,
            borderRadius: 14,
            backdropFilter: 'blur(12px)',
            padding: 'clamp(14px, 3vw, 22px)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.75), 0 8px 24px rgba(0,0,0,0.5), inset 0 0 60px rgba(234, 88, 12, 0.05), inset 0 1px 0 rgba(255,255,255,0.03)',
          }}
        >
          <SectionLabel>On the table — stage intel</SectionLabel>
          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
            {/* Taped-down surveyor's map */}
            <div style={{ position: 'relative', transform: 'rotate(-1.5deg)', flexShrink: 0, alignSelf: 'flex-start' }}>
              <img
                src={STAGE.map}
                alt={`Map of ${STAGE.name}`}
                style={{
                  width: 132,
                  height: 214,
                  objectFit: 'cover',
                  borderRadius: 4,
                  border: `4px solid ${theme.materials.paperAged}`,
                  boxShadow: '0 8px 22px rgba(0,0,0,0.6)',
                  display: 'block',
                  filter: 'sepia(0.3) brightness(0.7)',
                }}
              />
              {/* tape corners */}
              {[
                { top: -8, left: -12, rotate: -45 },
                { top: -8, right: -12, rotate: 45 },
                { bottom: -8, left: -12, rotate: 45 },
                { bottom: -8, right: -12, rotate: -45 },
              ].map(({ rotate, ...pos }, i) => (
                <span
                  key={i}
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    width: 38,
                    height: 14,
                    backgroundColor: theme.materials.tape,
                    transform: `rotate(${rotate}deg)`,
                    boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
                    ...pos,
                  }}
                />
              ))}
              <div
                style={{
                  position: 'absolute',
                  bottom: 6,
                  left: '50%',
                  transform: 'translateX(-50%) rotate(-2deg)',
                  fontFamily: MARKER_FONT,
                  fontSize: 11,
                  color: theme.materials.ink,
                  backgroundColor: theme.materials.paperAged,
                  padding: '1px 8px',
                  whiteSpace: 'nowrap',
                }}
              >
                {STAGE.name}
              </div>
            </div>

            {/* Enemy intel — the same pinned case-file cards as the Archive */}
            <div
              style={{
                flex: 1,
                minWidth: 220,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))',
                gap: '10px 8px',
                alignContent: 'start',
                padding: '6px 2px',
              }}
            >
              {ENEMY_INTEL.map((intel, i) => (
                <EnemyCaseCard
                  key={intel.name}
                  name={intel.name}
                  colorHex={theme.colors.danger}
                  tag={{ label: intel.count, color: theme.materials.tarpRed }}
                  rotation={(i % 2 === 0 ? 1 : -1) * (1 + (i % 2))}
                >
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 3,
                      marginTop: 3,
                      fontWeight: 900,
                      fontSize: 8,
                      color: theme.materials.tarpRed,
                      border: `1px solid ${theme.materials.tarpRed}`,
                      borderRadius: 3,
                      padding: '2px 4px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {(() => {
                      const Icon = damageTypeIcons[intel.weakTo];
                      return Icon ? <Icon size={10} /> : null;
                    })()}
                    WEAK: {intel.weakTo.toUpperCase()}
                  </div>
                  <div style={{ fontFamily: MARKER_FONT, fontSize: 8.5, marginTop: 3, lineHeight: 1.25, color: '#44403c' }}>
                    {intel.note}
                  </div>
                </EnemyCaseCard>
              ))}
            </div>
          </div>
        </div>

        {/* Companion hints — no pre-battle squad; workers arrive from drops */}
        <div>
          <SectionLabel>Who to rally — companion hints</SectionLabel>

          {/* Eden — always deploys at wave 1 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: 12,
              marginBottom: 14,
              borderRadius: 12,
              border: `2px solid ${theme.colors.accent}`,
              backgroundColor: theme.materials.corruptionEmber,
              boxShadow: '0 0 20px rgba(234, 88, 12, 0.2), 0 0 60px rgba(234, 88, 12, 0.06)',
            }}
          >
            <SkinPortrait
              skin={getSelectedSkin(EDEN.id)}
              alt={EDEN.name}
              style={{
                width: 56,
                height: 56,
                flexShrink: 0,
                borderRadius: 8,
                border: `2px solid ${theme.colors.accent}`,
              }}
            />
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 15, fontWeight: 900 }}>{EDEN.name}</span>
                <DamageTypeChip type={EDEN.damageType} />
                <span style={{ fontSize: 9.5, letterSpacing: 1.5, color: theme.colors.accent, fontWeight: 900, textShadow: '0 0 8px rgba(234, 88, 12, 0.5)' }}>
                  LEADER · DEPLOYS AT WAVE 1
                </span>
              </div>
              <div style={{ fontSize: 12, color: theme.colors.textMuted, marginTop: 3 }}>
                The rest of the movement answers mid-rally — kills fill the Voices meter and the crowd sends who it can.
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12,
              color: theme.colors.textSecondary,
              marginBottom: 10,
            }}
          >
            <span style={{ color: theme.colors.accent, display: 'flex', filter: 'drop-shadow(0 0 4px rgba(234, 88, 12, 0.4))' }}>
              <VoicesIcon size={16} />
            </span>
            Hope for these recruited workers from your drops — they counter this stage:
          </div>

          {/* Recommended companion hints — same pinned polaroid as the Archive */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))',
              gap: '10px 8px',
              padding: '6px 2px',
            }}
          >
            {recommended.map(({ hero, counters }, i) => (
              <HeroPolaroidCard
                key={hero.id}
                name={hero.name}
                subtitle={hero.profession}
                rotation={(i % 2 === 0 ? 1 : -1) * (2 + (i % 3))}
                skin={getSelectedSkin(hero.id)}
              >
                <span style={{ fontSize: '7px', padding: '1px 4px', backgroundColor: '#dbeafe', color: '#1e3a8a', border: '1px solid #93c5fd', fontWeight: 'bold' }}>
                  {hero.damageType.toUpperCase()}
                </span>
                <div style={{ fontSize: '7.5px', fontWeight: 800, color: '#166534', backgroundColor: '#bbf7d0', padding: '1px 5px', borderRadius: 10, lineHeight: 1.2 }}>
                  Counters {counters.join(', ')}
                </div>
              </HeroPolaroidCard>
            ))}
          </div>

          {/* Soft note — a telegraphed weakness with no recruited counter yet */}
          {uncovered.length > 0 && (
            <div
              role="status"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                backgroundColor: 'rgba(120, 113, 108, 0.1)',
                border: `1px solid ${theme.colors.border}`,
                borderLeft: `5px solid ${theme.colors.textMuted}`,
                borderRadius: 8,
                padding: '10px 14px',
                marginTop: 14,
                fontSize: 13,
              }}
            >
              <span style={{ color: theme.colors.textMuted, display: 'flex', flexShrink: 0, marginTop: 1 }}>
                <InfoIcon size={18} />
              </span>
              <div>
                <strong style={{ letterSpacing: 1 }}>ORGANIZER'S NOTE</strong>
                <div style={{ color: theme.colors.textSecondary, marginTop: 2 }}>
                  No recruited worker yet counters{' '}
                  {uncovered.map((intel) => `${intel.name} (${intel.weakTo})`).join(', ')}. You can still deploy —
                  Eden and the drops decide.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bayanihan Act — a single button that opens a popup selector, so the
            section stays compact on mobile. */}
        <div>
          <SectionLabel>Bayanihan Act — the barrier's ultimate</SectionLabel>
          {(() => {
            const act = BAYANIHAN_ACTS.find((a) => a.id === selectedAct);
            return (
              <button
                onClick={() => setActPickerOpen(true)}
                aria-haspopup="dialog"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  minHeight: 60,
                  padding: '12px 16px',
                  borderRadius: 12,
                  textAlign: 'left',
                  border: `2px solid ${theme.colors.accent}`,
                  backgroundColor: theme.materials.corruptionEmber,
                  color: 'inherit',
                  cursor: 'pointer',
                  boxShadow: '0 0 18px rgba(234, 88, 12, 0.2)',
                  fontFamily: 'inherit',
                }}
              >
                <span style={{ color: theme.colors.accent, display: 'flex', flexShrink: 0 }}>
                  <MegaphoneIcon size={24} />
                </span>
                <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                  <span style={{ fontWeight: 900, fontSize: 15 }}>{act?.name ?? 'Choose an Act'}</span>
                  <span style={{ fontSize: 11.5, color: theme.colors.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {act?.effect ?? 'Tap to pick the barrier ultimate'}
                  </span>
                </span>
                <span style={{ fontSize: 10, letterSpacing: 1.5, fontWeight: 900, color: theme.colors.accent, flexShrink: 0 }}>
                  CHANGE
                </span>
              </button>
            );
          })()}
        </div>
      </div>

      {/* Bayanihan Act picker — popup dialog */}
      {actPickerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Choose a Bayanihan Act"
          onClick={() => setActPickerOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            backgroundColor: 'rgba(9, 9, 11, 0.82)',
            backdropFilter: 'blur(8px)',
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 560,
              maxHeight: '80vh',
              overflowY: 'auto',
              backgroundColor: theme.colors.surface,
              border: `1px solid ${theme.colors.borderGlass}`,
              borderRadius: 16,
              padding: 'clamp(16px, 4vw, 24px)',
              boxShadow: '0 -12px 50px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.04)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h2 style={{ margin: 0, fontSize: 18, textTransform: 'uppercase', letterSpacing: 2 }}>
                Bayanihan Act
              </h2>
              <button
                onClick={() => setActPickerOpen(false)}
                aria-label="Close"
                style={{
                  width: 36,
                  height: 36,
                  minHeight: 36,
                  borderRadius: 8,
                  border: `1px solid ${theme.colors.borderGlass}`,
                  backgroundColor: 'transparent',
                  color: theme.colors.textPrimary,
                  fontSize: 18,
                  cursor: 'pointer',
                }}
              >
                ×
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
              {BAYANIHAN_ACTS.map((act) => {
                const selected = selectedAct === act.id;
                return (
                  <button
                    key={act.id}
                    onClick={() => {
                      if (!act.unlocked) return;
                      setSelectedAct(act.id);
                      setActPickerOpen(false);
                    }}
                    disabled={!act.unlocked}
                    aria-pressed={selected}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      minHeight: 56,
                      padding: '10px 12px',
                      borderRadius: 10,
                      textAlign: 'left',
                      border: `2px solid ${selected ? theme.colors.accent : theme.colors.borderGlass}`,
                      backgroundColor: selected ? theme.materials.corruptionEmber : theme.colors.surfaceGlass,
                      color: 'inherit',
                      cursor: act.unlocked ? 'pointer' : 'not-allowed',
                      opacity: act.unlocked ? 1 : 0.45,
                      boxShadow: selected ? '0 0 18px rgba(234, 88, 12, 0.25)' : 'none',
                      fontFamily: 'inherit',
                    }}
                  >
                    <span style={{ color: selected ? theme.colors.accent : theme.colors.textMuted, display: 'flex', flexShrink: 0 }}>
                      {act.unlocked ? (selected ? <CheckIcon size={20} /> : <MegaphoneIcon size={20} />) : <LockIcon size={20} />}
                    </span>
                    <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                      <span style={{ fontWeight: 900, fontSize: 14 }}>{act.name}</span>
                      <span style={{ fontSize: 11.5, color: theme.colors.textMuted }}>
                        {act.unlocked ? act.effect : 'Locked — earn it on the march or at the store.'}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Deploy bar — floating, megaphone-styled primary CTA */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 14,
          padding: '14px 16px calc(14px + env(safe-area-inset-bottom, 0px))',
          background: 'linear-gradient(180deg, transparent, rgba(9, 9, 11, 0.92) 40%)',
          zIndex: 20,
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 13,
            fontWeight: 700,
            color: theme.colors.textSecondary,
          }}
        >
          <span style={{ color: theme.colors.accent, display: 'flex' }}>
            <RallyPermitIcon size={18} />
          </span>
          Permits: {permits}
        </div>
        <button
          onClick={onDeploy}
          disabled={!canDeploy}
          aria-label={`Deploy to the streets — costs ${STAGE.permitCost} rally permit`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            minHeight: 60,
            padding: '14px 34px',
            fontSize: 'clamp(16px, 3.5vw, 21px)',
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: 2,
            backgroundColor: canDeploy ? theme.colors.accent : theme.colors.surface,
            color: canDeploy ? theme.colors.background : theme.colors.textMuted,
            border: 'none',
            borderRadius: 999,
            cursor: canDeploy ? 'pointer' : 'not-allowed',
            opacity: canDeploy ? 1 : 0.5,
            boxShadow: canDeploy ? '0 0 30px rgba(234, 88, 12, 0.45), 0 5px 0 #9a3412' : 'none',
            fontFamily: 'inherit',
          }}
        >
          <MegaphoneIcon size={26} />
          Deploy to the Streets
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 13,
              backgroundColor: 'rgba(15, 23, 42, 0.2)',
              borderRadius: 999,
              padding: '4px 10px',
            }}
          >
            <RallyPermitIcon size={15} />−{STAGE.permitCost}
          </span>
        </button>
      </div>
    </div>
  );
}
