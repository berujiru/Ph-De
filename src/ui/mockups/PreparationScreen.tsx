import { useEffect, useReducer, useState } from 'react';
import { theme } from '../theme';
import {
  InfoIcon,
  MegaphoneIcon,
  RallyPermitIcon,
  VoicesIcon,
  damageTypeIcons,
} from '../icons';
import { BackButton } from '../components/BackButton';
import { Embers, SoulsButton } from '../components/ApocalypseScenery';
import { SkinPortrait } from '../components/ArchiveCards';
import { EnemyTcgCard } from '../components/EnemyTcgCard';
import { HeroTcgCard } from '../components/HeroTcgCard';
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
  /** Navigate to the Sari-Sari Store (shown as a CTA when out of permits). */
  onGoToStore: () => void;
}

const TYPEWRITER_FONT = '"Courier New", Courier, monospace';

// ---------------------------------------------------------------- mock data

// No MOCK_PERMITS here anymore

/** Telegraphed enemy intel for the stage (reuses enemy-card data shape). */
interface EnemyIntel {
  id: string;
  color: number;
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

export function PreparationScreen({ act, stageIdx, onBack, onDeploy, onGoToStore }: PreparationScreenProps) {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const [selectedEnemy, setSelectedEnemy] = useState<EnemyId | null>(null);

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
      id,
      color: def?.color ?? 0xef4444,
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
        // Calm briefing-room slate — deliberately not the battle rally's orange
        // ember wash, so prep reads as planning, not combat.
        background: 'radial-gradient(circle at 50% 30%, #1b2436 0%, #0e131c 55%, #070a10 100%)',
        overflowY: 'auto',
        color: theme.colors.textPrimary,
        zIndex: 100,
      }}
    >
      {/* Subtle drifting embers only — the heavier battle scenery (war-room
          wall, brazier glow, flickering bulb) is intentionally left out here. */}
      <Embers count={5} />

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
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
            <SectionLabel>On the table — stage intel</SectionLabel>
            {ENEMY_INTEL.length > 1 && (
              <span style={{ fontSize: 11, color: theme.colors.textMuted, whiteSpace: 'nowrap', flexShrink: 0 }}>
                {ENEMY_INTEL.length} types · tap for intel
              </span>
            )}
          </div>
          {/* Enemy intel — compact TCG cards in a grid so a stage with many
              anomalies stays short. Tap a card to open its full card for a
              closer read. */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))',
              gap: '14px 10px',
              padding: '8px 2px 4px',
            }}
          >
            {ENEMY_INTEL.map((intel) => {
              const enemyId = intel.id as EnemyId;
              return (
                <EnemyTcgCard
                  key={intel.name}
                  variant="compact"
                  enemyId={enemyId}
                  onClick={() => setSelectedEnemy(enemyId)}
                  ariaLabel={`Open anomaly intel: ${intel.name}`}
                >
                  {/* Stage headcount — the one bit of intel the card itself
                      doesn't carry, pinned to the card corner. */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 3,
                      left: 3,
                      fontSize: 9,
                      fontWeight: 900,
                      letterSpacing: 0.5,
                      color: '#fff',
                      backgroundColor: theme.materials.tarpRed,
                      border: '1px solid rgba(0,0,0,0.4)',
                      borderRadius: 999,
                      padding: '1px 6px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.6)',
                    }}
                  >
                    {intel.count}
                  </div>
                </EnemyTcgCard>
              );
            })}
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

          {/* Recommended companion hints — same compact TCG cards as the Archive */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))',
              gap: '10px 8px',
              padding: '6px 2px',
            }}
          >
            {recommended.map(({ hero, counters }, i) => (
              <div key={hero.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <HeroTcgCard
                  variant="compact"
                  heroId={hero.id}
                  rotation={(i % 2 === 0 ? 1 : -1) * (2 + (i % 3))}
                />
                <span style={{ fontSize: '7px', padding: '1px 4px', backgroundColor: '#dbeafe', color: '#1e3a8a', border: '1px solid #93c5fd', fontWeight: 'bold' }}>
                  {hero.damageType.toUpperCase()}
                </span>
                <div style={{ fontSize: '7.5px', fontWeight: 800, color: '#166534', backgroundColor: '#bbf7d0', padding: '1px 5px', borderRadius: 10, lineHeight: 1.2, textAlign: 'center' }}>
                  Counters {counters.join(', ')}
                </div>
              </div>
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
      </div>

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
        <SoulsButton
          variant="primary"
          size="lg"
          onClick={onDeploy}
          disabled={!canDeploy}
          aria-label={`Deploy to the streets — costs ${STAGE.permitCost} rally permit`}
        >
          <MegaphoneIcon size={26} />
          Deploy to the Streets
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 13,
              backgroundColor: 'rgba(0, 0, 0, 0.35)',
              border: `1px solid ${theme.materials.rust}`,
              borderRadius: 999,
              padding: '4px 10px',
            }}
          >
            <RallyPermitIcon size={15} />−{STAGE.permitCost}
          </span>
        </SoulsButton>
        {!canDeploy && (
          <SoulsButton
            variant="secondary"
            size="md"
            onClick={onGoToStore}
            aria-label="Out of permits — get more at the Sari-Sari store"
          >
            <RallyPermitIcon size={18} />
            Get Permits at the Store
          </SoulsButton>
        )}
      </div>

      {/* Anomaly intel — tapping a case file opens its full TCG card. */}
      {selectedEnemy && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Anomaly intel"
          onClick={() => setSelectedEnemy(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 300,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            background: 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.95) 100%)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            animation: 'reward-overlay-in 0.25s ease both',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 20,
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <EnemyTcgCard
              enemyId={selectedEnemy}
              style={{ animation: 'reward-pop 0.45s cubic-bezier(0.2, 0.9, 0.3, 1.1) both' }}
            />
            <SoulsButton
              variant="primary"
              onClick={() => setSelectedEnemy(null)}
              aria-label="Close anomaly intel"
            >
              Close
            </SoulsButton>
          </div>
        </div>
      )}
    </div>
  );
}
