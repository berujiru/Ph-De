import { useState } from 'react';
import { theme } from '../theme';
import {
  CheckIcon,
  CloseIcon,
  InfoIcon,
  LockIcon,
  MegaphoneIcon,
  PlusIcon,
  RallyPermitIcon,
  damageTypeIcons,
} from '../icons';
import { HERO_DEFINITIONS, type HeroDefinition, type HeroId } from '../../game/data/balance';

interface PreparationScreenProps {
  onBack: () => void;
  onDeploy: () => void;
}

const MARKER_FONT = '"Segoe Print", "Bradley Hand", "Comic Sans MS", cursive';
const TYPEWRITER_FONT = '"Courier New", Courier, monospace';

// ---------------------------------------------------------------- mock data

const STAGE = {
  act: 'Act 1: The Grassroots',
  id: 8,
  name: 'Local Clinic',
  map: '/assets/maps/map-barangay.svg',
  permitCost: 1,
};

const MOCK_PERMITS = 3;
const MOCK_PERMITS_MAX = 5;

/** Telegraphed enemy intel for the stage (reuses enemy-card data shape). */
interface EnemyIntel {
  name: string;
  form: string;
  note: string;
  weakTo: HeroDefinition['damageType'];
  count: string;
}

const ENEMY_INTEL: EnemyIntel[] = [
  {
    name: 'Troll Bot',
    form: 'Gremlin, cracked phone for a head',
    note: 'Fragile swarm — comes in floods.',
    weakTo: 'Fire',
    count: 'x24',
  },
  {
    name: 'Fixer',
    form: 'Many-armed scuttler in folders',
    note: 'Extremely fast. Rushes the Barrier.',
    weakTo: 'Frost',
    count: 'x9',
  },
  {
    name: 'Red Tape',
    form: 'Mummy wrapped in red ribbon',
    note: 'High armor, slow. Shred it.',
    weakTo: 'Earth',
    count: 'x4',
  },
];

/** Heroes the movement has recruited so far (mock). */
const UNLOCKED_HERO_IDS: readonly HeroId[] = [
  'teacher',
  'student',
  'jeepney_driver',
  'fisherfolk',
  'street_sweeper',
  'taho_vendor',
  'nurse',
  'baker',
  'electrician',
];

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

export function PreparationScreen({ onBack, onDeploy }: PreparationScreenProps) {
  const [squad, setSquad] = useState<(HeroId | null)[]>([null, null, null, null]);
  const [selectedAct, setSelectedAct] = useState<string>('people_power');

  const roster = UNLOCKED_HERO_IDS.map((id) => HERO_DEFINITIONS[id]);
  const squadHeroes = squad.filter((id): id is HeroId => id !== null).map((id) => HERO_DEFINITIONS[id]);
  const squadIsFull = !squad.includes(null);

  const coveredTypes = new Set<HeroDefinition['damageType']>([
    EDEN.damageType,
    ...squadHeroes.map((hero) => hero.damageType),
  ]);
  const uncovered = ENEMY_INTEL.filter((intel) => !coveredTypes.has(intel.weakTo));
  const openSlots = squad.filter((id) => id === null).length;

  const canDeploy = MOCK_PERMITS >= STAGE.permitCost;

  const handlePick = (heroId: HeroId) => {
    if (squad.includes(heroId)) return;
    const emptyIndex = squad.indexOf(null);
    if (emptyIndex === -1) return;
    const next = [...squad];
    next[emptyIndex] = heroId;
    setSquad(next);
  };

  const handleRemove = (index: number) => {
    const next = [...squad];
    next[index] = null;
    setSquad(next);
  };

  return (
    <div
      className="rally-screen"
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: '#0a0f1e',
        background: 'radial-gradient(circle at 50% 42%, #16223b 0%, #060a15 78%)',
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
            backgroundColor: theme.materials.cautionYellow,
            boxShadow: '0 0 60px 24px rgba(234, 179, 8, 0.18)',
          }}
        />
      </div>

      <div
        style={{
          position: 'relative',
          zIndex: 5,
          maxWidth: 760,
          margin: '0 auto',
          padding: 'clamp(16px, 4vw, 36px)',
          paddingBottom: 130,
          display: 'flex',
          flexDirection: 'column',
          gap: 26,
        }}
      >
        {/* Header */}
        <div>
          <button
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              minHeight: 44,
              padding: '8px 14px',
              background: theme.colors.surfaceGlass,
              border: `1px solid ${theme.colors.borderGlass}`,
              borderRadius: 8,
              color: theme.colors.textPrimary,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 700,
              backdropFilter: 'blur(12px)',
              marginBottom: 14,
              fontFamily: 'inherit',
            }}
          >
            <CloseIcon size={16} />
            Cancel Briefing
          </button>
          <h1
            style={{
              margin: 0,
              fontSize: 'clamp(26px, 6vw, 40px)',
              textTransform: 'uppercase',
              letterSpacing: 3,
              textShadow: '0 0 24px rgba(234, 179, 8, 0.25)',
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
            boxShadow: '0 24px 60px rgba(0,0,0,0.55), inset 0 0 60px rgba(234, 179, 8, 0.04)',
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

            {/* Enemy intel cards — manifesto sheets */}
            <div style={{ flex: 1, minWidth: 220, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {ENEMY_INTEL.map((intel, i) => (
                <div
                  key={intel.name}
                  style={{
                    backgroundColor: theme.materials.paper,
                    color: theme.materials.ink,
                    borderRadius: 3,
                    padding: '10px 14px',
                    transform: `rotate(${i % 2 === 0 ? 0.6 : -0.8}deg)`,
                    boxShadow: '0 6px 14px rgba(0,0,0,0.45)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 10,
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 900, fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 }}>
                      {intel.name}{' '}
                      <span style={{ fontFamily: MARKER_FONT, fontWeight: 400, fontSize: 12, color: '#57534e' }}>
                        {intel.count}
                      </span>
                    </div>
                    <div style={{ fontSize: 11.5, color: '#44403c' }}>{intel.form}</div>
                    <div style={{ fontFamily: MARKER_FONT, fontSize: 12, marginTop: 2 }}>{intel.note}</div>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontWeight: 900,
                      fontSize: 12,
                      color: theme.materials.tarpRed,
                      border: `2px solid ${theme.materials.tarpRed}`,
                      borderRadius: 4,
                      padding: '4px 8px',
                      transform: 'rotate(-3deg)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {(() => {
                      const Icon = damageTypeIcons[intel.weakTo];
                      return Icon ? <Icon size={16} /> : null;
                    })()}
                    WEAK: {intel.weakTo.toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Squad picker */}
        <div>
          <SectionLabel>The squad — Eden + 4</SectionLabel>

          {/* Slots */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
            {/* Eden — always deployed */}
            <div
              style={{
                width: 104,
                borderRadius: 10,
                border: `2px solid ${theme.colors.accent}`,
                backgroundColor: 'rgba(56, 189, 248, 0.08)',
                padding: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                boxShadow: '0 0 16px rgba(56, 189, 248, 0.25)',
              }}
            >
              <img src="/assets/heroes/hero-placeholder.svg" alt="" style={{ width: 52, height: 52 }} />
              <div style={{ fontSize: 12, fontWeight: 900 }}>{EDEN.name}</div>
              <DamageTypeChip type={EDEN.damageType} />
              <div style={{ fontSize: 9.5, letterSpacing: 1.5, color: theme.colors.accent, fontWeight: 900 }}>
                LEADER
              </div>
            </div>

            {squad.map((heroId, index) => {
              const hero = heroId ? HERO_DEFINITIONS[heroId] : null;
              return hero ? (
                <button
                  key={index}
                  onClick={() => handleRemove(index)}
                  aria-label={`Remove ${hero.name} from squad slot ${index + 1}`}
                  style={{
                    width: 104,
                    borderRadius: 10,
                    border: `2px solid ${theme.colors.border}`,
                    backgroundColor: theme.colors.surfaceGlass,
                    padding: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                    cursor: 'pointer',
                    color: 'inherit',
                    position: 'relative',
                    fontFamily: 'inherit',
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      color: theme.colors.danger,
                      display: 'flex',
                    }}
                  >
                    <CloseIcon size={14} />
                  </span>
                  <img src="/assets/heroes/hero-placeholder.svg" alt="" style={{ width: 52, height: 52 }} />
                  <span style={{ fontSize: 12, fontWeight: 900 }}>{hero.name}</span>
                  <DamageTypeChip type={hero.damageType} />
                </button>
              ) : (
                <div
                  key={index}
                  aria-label={`Empty squad slot ${index + 1}`}
                  style={{
                    width: 104,
                    minHeight: 128,
                    borderRadius: 10,
                    border: `2px dashed ${theme.colors.borderGlass}`,
                    backgroundColor: 'rgba(0,0,0,0.25)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 6,
                    color: theme.colors.textMuted,
                  }}
                >
                  <PlusIcon size={22} />
                  <span style={{ fontSize: 10, letterSpacing: 1 }}>OPEN SLOT</span>
                </div>
              );
            })}
          </div>

          {/* Soft squad-power warning — never blocks deployment */}
          {(uncovered.length > 0 || openSlots > 0) && (
            <div
              role="status"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                backgroundColor: 'rgba(234, 179, 8, 0.1)',
                border: `1px solid ${theme.materials.cautionYellow}`,
                borderLeft: `5px solid ${theme.materials.cautionYellow}`,
                borderRadius: 8,
                padding: '10px 14px',
                marginBottom: 14,
                fontSize: 13,
              }}
            >
              <span style={{ color: theme.materials.cautionYellow, display: 'flex', flexShrink: 0, marginTop: 1 }}>
                <InfoIcon size={18} />
              </span>
              <div>
                <strong style={{ letterSpacing: 1 }}>ORGANIZER'S NOTE</strong>
                <div style={{ color: theme.colors.textSecondary, marginTop: 2 }}>
                  {uncovered.length > 0 && (
                    <span>
                      No {uncovered.map((intel) => intel.weakTo).join(', ')} coverage for{' '}
                      {uncovered.map((intel) => intel.name).join(', ')}.{' '}
                    </span>
                  )}
                  {openSlots > 0 && <span>{openSlots} squad slot{openSlots > 1 ? 's' : ''} still open. </span>}
                  You can still deploy — the streets decide.
                </div>
              </div>
            </div>
          )}

          {/* Roster to pick from */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(104px, 1fr))',
              gap: 8,
            }}
          >
            {roster.map((hero) => {
              const inSquad = squad.includes(hero.id);
              const disabled = inSquad || (squadIsFull && !inSquad);
              return (
                <button
                  key={hero.id}
                  onClick={() => handlePick(hero.id)}
                  disabled={disabled}
                  aria-label={
                    inSquad
                      ? `${hero.name} — already in squad`
                      : `Add ${hero.name} (${hero.damageType}) to squad`
                  }
                  style={{
                    borderRadius: 10,
                    border: `1px solid ${inSquad ? theme.colors.success : theme.colors.borderGlass}`,
                    backgroundColor: inSquad ? 'rgba(34, 197, 94, 0.08)' : theme.colors.surfaceGlass,
                    padding: 8,
                    minHeight: 118,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled && !inSquad ? 0.4 : 1,
                    color: 'inherit',
                    fontFamily: 'inherit',
                    position: 'relative',
                  }}
                >
                  {inSquad && (
                    <span
                      style={{ position: 'absolute', top: 4, right: 4, color: theme.colors.success, display: 'flex' }}
                    >
                      <CheckIcon size={14} />
                    </span>
                  )}
                  <img
                    src="/assets/heroes/hero-placeholder.svg"
                    alt=""
                    style={{ width: 46, height: 46, opacity: disabled && !inSquad ? 0.5 : 1 }}
                  />
                  <span style={{ fontSize: 11.5, fontWeight: 700, textAlign: 'center', lineHeight: 1.15 }}>
                    {hero.name}
                  </span>
                  <DamageTypeChip type={hero.damageType} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Bayanihan Act selector */}
        <div>
          <SectionLabel>Bayanihan Act — the barrier's ultimate</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
            {BAYANIHAN_ACTS.map((act) => {
              const selected = selectedAct === act.id;
              return (
                <button
                  key={act.id}
                  onClick={() => act.unlocked && setSelectedAct(act.id)}
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
                    backgroundColor: selected ? 'rgba(56, 189, 248, 0.1)' : theme.colors.surfaceGlass,
                    color: 'inherit',
                    cursor: act.unlocked ? 'pointer' : 'not-allowed',
                    opacity: act.unlocked ? 1 : 0.45,
                    boxShadow: selected ? '0 0 14px rgba(56, 189, 248, 0.25)' : 'none',
                    fontFamily: 'inherit',
                  }}
                >
                  <span
                    style={{
                      color: selected ? theme.colors.accent : theme.colors.textMuted,
                      display: 'flex',
                      flexShrink: 0,
                    }}
                  >
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
          background: 'linear-gradient(180deg, transparent, rgba(6, 10, 21, 0.9) 40%)',
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
          Permits: {MOCK_PERMITS}/{MOCK_PERMITS_MAX}
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
            boxShadow: canDeploy ? '0 0 30px rgba(56, 189, 248, 0.45), 0 5px 0 #0284c7' : 'none',
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
