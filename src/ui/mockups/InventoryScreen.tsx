import { useState } from 'react';
import { theme } from '../theme';
import {
  HERO_DEFINITIONS,
  ENEMY_DEFINITIONS,
  metersLabel,
  metersPerSecondLabel,
  type HeroDefinition,
  type EnemyDefinition,
  type EnemyId,
} from '../../game/data/balance';
import { HopeCoinIcon, RallyPermitIcon, LockIcon, SkullIcon, InfoIcon } from '../icons';
import { BackButton } from '../components/BackButton';

interface InventoryScreenProps {
  onBack: () => void;
}

const HERO_PLACEHOLDER_SRC = '/assets/heroes/hero-placeholder.svg';
const TYPEWRITER_FONT = '"Courier New", Courier, monospace';

type ArchiveTab = 'heroes' | 'codex';

/** Photo-studio backdrop so the dark hero silhouette reads as a portrait. */
const PORTRAIT_BG = 'radial-gradient(circle at 50% 34%, #e2e8f0 0%, #94a3b8 52%, #475569 100%)';
const PORTRAIT_BG_LOCKED = 'radial-gradient(circle at 50% 34%, #64748b 0%, #334155 55%, #1e293b 100%)';

// ---- Enemy tiering + data-driven "lie debunked" blurbs ---------------------

const MINI_BOSS_IDS = new Set<EnemyId>([
  'ghost_employee', 'illegal_logger', 'epal', 'the_overpriced', 'kickback_courier',
  'shell_company', 'crony_bodyguard', 'hoarder', 'land_grabber', 'tender_rigger',
]);

type EnemyTier = 'Minion' | 'Mini-Boss' | 'Boss';

function enemyTier(def: EnemyDefinition): EnemyTier {
  if (def.id.startsWith('boss_')) return 'Boss';
  if (MINI_BOSS_IDS.has(def.id)) return 'Mini-Boss';
  return 'Minion';
}

const TIER_COLOR: Record<EnemyTier, string> = {
  Minion: theme.colors.textMuted,
  'Mini-Boss': theme.colors.accent,
  Boss: theme.colors.danger,
};

/** Derive the mechanic blurb from the enemy's data flags — no hardcoded table. */
function enemyMechanic(def: EnemyDefinition): string {
  if (def.activeSkill) return `Boss skill — ${def.activeSkill.name}.`;
  if (def.stealth) return 'Untargetable until revealed or splashed.';
  if (def.moraleAura) return 'Buffs nearby anomalies with a morale aura.';
  if (def.fakeHpPadding) return 'Padded with fake HP — popped by an Audit.';
  if (def.splitOnDeathCount) return `Shatters into ${def.splitOnDeathCount} on death.`;
  if (def.tauntAura) return 'Redirects your projectiles onto itself.';
  if (def.dropObstacleOnDeath) return 'Drops a barricade blocking your shots on death.';
  if (def.barrierDamageMultiplier) return `Tears through barricades ${def.barrierDamageMultiplier}× faster.`;
  if (def.knockbackPulseCooldown) return 'Shoves your frontline back down the path.';
  if (def.hitImmunityCount) return `Shrugs off its first ${def.hitImmunityCount} hits.`;
  if (def.stealVoicesPerSecond) return 'Drains your Voices while it lives.';
  if (def.maxHp >= 140 && def.speed <= 45) return 'A slow, bloated tank of a lie.';
  if (def.speed >= 100) return 'Fast — rushes the Barrier before you can react.';
  return 'Swarms in raw numbers to drown out the rally.';
}

// Real anomalies only (drop the sandbox punching bag).
const CODEX_ENEMIES = Object.values(ENEMY_DEFINITIONS).filter((def) => def.id !== 'sandbox_target');

// Mock: which anomalies the player has actually faced (unlock-on-encounter).
const FACED_ENEMY_IDS = new Set<EnemyId>([
  'grunt', 'runner', 'brute', 'ghost_employee', 'epal', 'the_overpriced', 'kickback_courier',
]);

const hexColor = (color: number) => `#${color.toString(16).padStart(6, '0')}`;

export function InventoryScreen({ onBack }: InventoryScreenProps) {
  const [tab, setTab] = useState<ArchiveTab>('heroes');
  const [selectedHero, setSelectedHero] = useState<HeroDefinition | null>(null);
  const [selectedEnemy, setSelectedEnemy] = useState<EnemyDefinition | null>(null);

  // Real workers only — the sandbox test dummies never belong in the roster.
  const roster = Object.values(HERO_DEFINITIONS).filter((hero) => !hero.id.startsWith('sandbox_'));

  const facedCount = CODEX_ENEMIES.filter((def) => FACED_ENEMY_IDS.has(def.id)).length;

  // Mock Currency Data
  const currentHope = 1450;
  const currentPermits = 3;

  return (
    <div className="rally-screen" style={{
      position: 'absolute',
      inset: 0,
      backgroundColor: '#785b46', // Base cork color
      backgroundImage: `
        radial-gradient(#5a4231 15%, transparent 16%),
        radial-gradient(#5a4231 15%, transparent 16%)
      `,
      backgroundSize: '20px 20px',
      backgroundPosition: '0 0, 10px 10px',
      display: 'flex',
      flexDirection: 'column',
      padding: 'clamp(16px, 4vw, 40px)',
      color: theme.colors.textPrimary,
      overflowY: 'auto',
      boxShadow: 'inset 0 0 100px rgba(0,0,0,0.8)'
    }}>

      {/* Top Header / Nav Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '24px',
        position: 'relative',
        zIndex: 10,
        gap: 16,
        flexWrap: 'wrap'
      }}>
        <div>
          <div style={{ marginBottom: 15 }}>
            <BackButton onClick={onBack} label="Back to Menu" tone="cork" />
          </div>

          {/* Taped Sign Title */}
          <div style={{
            backgroundColor: '#fef08a',
            color: '#000',
            padding: '10px clamp(14px, 5vw, 30px)',
            transform: 'rotate(-2deg)',
            boxShadow: '2px 4px 10px rgba(0,0,0,0.3)',
            display: 'inline-block',
            position: 'relative',
            maxWidth: '100%'
          }}>
            <div style={{
              position: 'absolute',
              top: '-10px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '40px',
              height: '15px',
              backgroundColor: 'rgba(255,255,255,0.7)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
            }} /> {/* Masking tape */}
            <h1 style={{ margin: 0, fontSize: 'clamp(20px, 6vw, 32px)', fontFamily: TYPEWRITER_FONT, fontWeight: '900', textTransform: 'uppercase', lineHeight: 1.1 }}>
              The Movement Archive
            </h1>
          </div>
        </div>

        {/* Currency Display (Pinned Card) */}
        <div style={{
          backgroundColor: '#fff',
          padding: '15px 25px',
          borderRadius: '4px',
          boxShadow: '2px 4px 15px rgba(0,0,0,0.4)',
          transform: 'rotate(1deg)',
          display: 'flex',
          gap: '30px',
          position: 'relative'
        }}>
          {/* Push Pin */}
          <div style={{
            position: 'absolute',
            top: '5px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '12px',
            height: '12px',
            backgroundColor: '#ef4444',
            borderRadius: '50%',
            boxShadow: 'inset -2px -2px 4px rgba(0,0,0,0.3), 2px 2px 5px rgba(0,0,0,0.5)'
          }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: theme.colors.gold, display: 'flex' }}><HopeCoinIcon size={22} /></span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>HOPE POINTS</span>
              <span style={{ fontSize: '20px', color: '#000', fontWeight: '900' }}>{currentHope}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: '#334155', display: 'flex' }}><RallyPermitIcon size={22} /></span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>RALLY PERMITS</span>
              <span style={{ fontSize: '20px', color: '#000', fontWeight: '900' }}>{currentPermits}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Roster vs Truth Codex */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap', zIndex: 10 }}>
        {([
          { id: 'heroes' as const, label: 'The Roster', count: `${roster.length} workers` },
          { id: 'codex' as const, label: 'The Truth Codex', count: `${facedCount}/${CODEX_ENEMIES.length} debunked` },
        ]).map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              aria-pressed={active}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                minHeight: 44,
                padding: '8px 20px',
                cursor: 'pointer',
                fontFamily: TYPEWRITER_FONT,
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: 1,
                color: active ? '#000' : '#e2e8f0',
                backgroundColor: active ? '#fef08a' : 'rgba(0,0,0,0.45)',
                border: active ? '2px solid #000' : `2px solid ${theme.colors.borderGlass}`,
                borderRadius: 6,
                transform: active ? 'rotate(-1deg)' : 'none',
                boxShadow: active ? '2px 3px 8px rgba(0,0,0,0.4)' : 'none',
              }}
            >
              <span style={{ fontSize: 16 }}>{t.label}</span>
              <span style={{ fontSize: 10, opacity: 0.8 }}>{t.count}</span>
            </button>
          );
        })}
      </div>

      {/* HEROES: Grid of Polaroid Cards */}
      {tab === 'heroes' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(82px, 1fr))', gap: '12px 8px', padding: '12px 2px' }}>
          {roster.map((hero, idx) => {
            // Mock unlocking and leveling logic
            const isUnlocked = idx < 12;
            const mockLevel = hero.id === 'eden' ? 3 : 1;
            const mockCards = hero.id === 'eden' ? 4 : 8;
            const mockCardsNeeded = mockLevel * 5;
            const rotation = (idx % 2 === 0 ? 1 : -1) * (2 + (idx % 3)); // slight, stable rotation

            return (
              <div
                key={hero.id}
                onClick={() => isUnlocked && setSelectedHero(hero)}
                style={{
                  backgroundColor: '#f8fafc',
                  padding: '6px 6px 16px 6px', // Extra padding at bottom for polaroid look
                  boxShadow: '2px 5px 15px rgba(0,0,0,0.5)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  filter: isUnlocked ? 'none' : 'sepia(80%) grayscale(80%)',
                  cursor: isUnlocked ? 'pointer' : 'default',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  position: 'relative',
                  transform: `rotate(${rotation}deg)`,
                  zIndex: 1
                }}
                onMouseOver={(e) => {
                  if (isUnlocked) {
                    e.currentTarget.style.transform = 'scale(1.1) rotate(0deg)';
                    e.currentTarget.style.zIndex = '10';
                    e.currentTarget.style.boxShadow = '5px 15px 25px rgba(0,0,0,0.6)';
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = `scale(1) rotate(${rotation}deg)`;
                  e.currentTarget.style.zIndex = '1';
                  e.currentTarget.style.boxShadow = '2px 5px 15px rgba(0,0,0,0.5)';
                }}
              >
                {/* Push Pin */}
                <div style={{
                  position: 'absolute',
                  top: '-5px',
                  width: '10px',
                  height: '10px',
                  backgroundColor: idx % 3 === 0 ? '#ef4444' : (idx % 2 === 0 ? '#3b82f6' : '#22c55e'),
                  borderRadius: '50%',
                  boxShadow: 'inset -2px -2px 3px rgba(0,0,0,0.3), 1px 2px 3px rgba(0,0,0,0.5)',
                  zIndex: 2
                }} />

                {/* Photo Area */}
                <div style={{
                  width: '100%',
                  aspectRatio: '1',
                  background: isUnlocked ? PORTRAIT_BG : PORTRAIT_BG_LOCKED,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'flex-end',
                  border: '1px solid #e2e8f0',
                  marginBottom: '8px',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <img
                    src={HERO_PLACEHOLDER_SRC}
                    alt={isUnlocked ? hero.name : 'Locked hero silhouette'}
                    style={{
                      width: '92%',
                      height: '92%',
                      objectFit: 'contain',
                      filter: isUnlocked ? 'none' : 'brightness(0.35)',
                    }}
                  />
                  {!isUnlocked && (
                    <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#e2e8f0', display: 'flex' }}>
                      <LockIcon size={32} />
                    </span>
                  )}

                  {isUnlocked && (
                    <div style={{
                      position: 'absolute',
                      bottom: '5px',
                      right: '5px',
                      backgroundColor: theme.materials.cautionYellow,
                      color: '#000',
                      fontWeight: '900',
                      padding: '2px 5px',
                      fontSize: '10px',
                      border: '1px solid #000',
                      transform: 'rotate(-5deg)'
                    }}>
                      LVL {mockLevel}
                    </div>
                  )}
                </div>

                {/* Text Area */}
                <div style={{ width: '100%', textAlign: 'center' }}>
                  <h3 style={{ margin: '0 0 3px 0', fontSize: '11px', color: '#0f172a', fontFamily: '"Marker Felt", "Comic Sans MS", fantasy', lineHeight: 1.1 }}>
                    {isUnlocked ? hero.name : 'REDACTED'}
                  </h3>
                  <div style={{ fontSize: '8.5px', color: '#475569', fontWeight: 'bold', marginBottom: '6px', fontStyle: isUnlocked ? 'normal' : 'italic', lineHeight: 1.2 }}>
                    {isUnlocked ? hero.profession : `A ${hero.profession.toLowerCase()} waits for the movement to reach them…`}
                  </div>

                  {isUnlocked && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', borderTop: '1px dashed #cbd5e1', paddingTop: '6px' }}>
                      <span style={{ fontSize: '8px', padding: '2px 5px', backgroundColor: '#e2e8f0', color: '#334155', border: '1px solid #cbd5e1', fontWeight: 'bold' }}>
                        {hero.damageType.toUpperCase()}
                      </span>
                      <div style={{
                        fontSize: '8.5px',
                        fontWeight: 'bold',
                        color: mockCards >= mockCardsNeeded ? '#166534' : '#b91c1c',
                        backgroundColor: mockCards >= mockCardsNeeded ? '#bbf7d0' : '#fecaca',
                        padding: '2px 7px',
                        borderRadius: '10px'
                      }}>
                        CARDS: {mockCards} / {mockCardsNeeded}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CODEX: Enemy case files (unlock on encounter) */}
      {tab === 'codex' && (
        <div style={{ zIndex: 10 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, color: '#e2e8f0',
            fontSize: 13, marginBottom: 18, backgroundColor: 'rgba(0,0,0,0.4)',
            padding: '8px 14px', borderRadius: 8, width: 'fit-content'
          }}>
            <InfoIcon size={16} />
            Every anomaly you face in the field is filed here — a lie debunked.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))', gap: '10px 8px', padding: '4px' }}>
            {CODEX_ENEMIES.map((def, idx) => {
              const faced = FACED_ENEMY_IDS.has(def.id);
              const tier = enemyTier(def);
              const rotation = (idx % 2 === 0 ? -1 : 1) * (1 + (idx % 2));
              return (
                <div
                  key={def.id}
                  onClick={() => faced && setSelectedEnemy(def)}
                  role={faced ? 'button' : undefined}
                  tabIndex={faced ? 0 : undefined}
                  aria-label={faced ? `Open case file: ${def.name}` : undefined}
                  onKeyDown={(e) => {
                    if (faced && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      setSelectedEnemy(def);
                    }
                  }}
                  style={{
                    backgroundColor: faced ? '#e5d5b5' : '#4b5563',
                    color: '#1c1917',
                    borderRadius: 4,
                    padding: '8px 7px 10px',
                    position: 'relative',
                    transform: `rotate(${rotation}deg)`,
                    boxShadow: '2px 6px 16px rgba(0,0,0,0.5)',
                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(0,0,0,0.03) 20px, rgba(0,0,0,0.03) 21px)',
                    cursor: faced ? 'pointer' : 'default',
                    transition: 'transform 0.15s, box-shadow 0.15s',
                  }}
                  onMouseOver={(e) => {
                    if (faced) {
                      e.currentTarget.style.transform = 'rotate(0deg) scale(1.04)';
                      e.currentTarget.style.boxShadow = '4px 10px 22px rgba(0,0,0,0.6)';
                    }
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = `rotate(${rotation}deg)`;
                    e.currentTarget.style.boxShadow = '2px 6px 16px rgba(0,0,0,0.5)';
                  }}
                >
                  {/* Pin */}
                  <div style={{
                    position: 'absolute', top: -6, left: '50%', transform: 'translateX(-50%)',
                    width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ef4444',
                    boxShadow: 'inset -2px -2px 4px rgba(0,0,0,0.3), 1px 2px 4px rgba(0,0,0,0.5)'
                  }} />

                  {/* Mugshot */}
                  <div style={{
                    width: '100%', height: 44, borderRadius: 3, marginBottom: 6,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: faced
                      ? `radial-gradient(circle at 50% 40%, ${hexColor(def.color)} 0%, #1e293b 78%)`
                      : 'radial-gradient(circle at 50% 40%, #334155 0%, #1e293b 80%)',
                    border: '2px solid rgba(0,0,0,0.35)'
                  }}>
                    {faced ? (
                      <span style={{ color: '#e2e8f0', display: 'flex' }}><SkullIcon size={22} /></span>
                    ) : (
                      <span style={{ fontFamily: TYPEWRITER_FONT, fontSize: 24, fontWeight: 900, color: '#94a3b8' }}>?</span>
                    )}
                  </div>

                  {/* Tier tag */}
                  <span style={{
                    display: 'inline-block', fontSize: 7, fontWeight: 900, letterSpacing: 0.5,
                    textTransform: 'uppercase', padding: '2px 5px', borderRadius: 4, marginBottom: 4,
                    color: '#fff', backgroundColor: TIER_COLOR[tier]
                  }}>
                    {tier}
                  </span>

                  <h3 style={{ margin: '0 0 4px 0', fontSize: 10.5, fontWeight: 900, textTransform: 'uppercase', fontFamily: TYPEWRITER_FONT, lineHeight: 1.1 }}>
                    {faced ? def.name : '██████'}
                  </h3>
                  <p style={{ margin: 0, fontSize: 8.5, lineHeight: 1.3, color: '#44403c', fontStyle: 'italic' }}>
                    {faced ? enemyMechanic(def) : 'Not yet debunked — face this anomaly in the field to file its case.'}
                  </p>

                  {faced ? (
                    <>
                      <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
                        {[
                          { label: 'HP', value: def.maxHp.toLocaleString() },
                          { label: 'Speed', value: metersPerSecondLabel(def.speed) },
                          { label: 'Barrier Dmg', value: `${def.damage}` },
                        ].map((stat) => (
                          <div key={stat.label} style={{
                            flex: '1 1 auto', minWidth: 24, textAlign: 'center',
                            backgroundColor: 'rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.15)',
                            borderRadius: 3, padding: '3px 4px'
                          }}>
                            <div style={{ fontSize: 7, fontWeight: 900, letterSpacing: 0.3, color: '#57534e', textTransform: 'uppercase' }}>{stat.label}</div>
                            <div style={{ fontSize: 10, fontWeight: 900, fontFamily: TYPEWRITER_FONT }}>{stat.value}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, color: '#78350f', fontSize: 8.5, fontWeight: 800, letterSpacing: 0.3, textTransform: 'uppercase' }}>
                        <InfoIcon size={11} /> Tap to open file
                      </div>
                    </>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 8, color: '#e2e8f0', fontSize: 9, fontWeight: 700 }}>
                      <LockIcon size={12} /> SEALED
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Hero Info Modal (Dossier File Theme) */}
      {selectedHero && (
        <div
          onClick={() => setSelectedHero(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            zIndex: 1000,
            backdropFilter: 'blur(5px)',
            padding: '48px 20px',
            overflowY: 'auto'
          }}>
          {/* Dossier Folder */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              margin: 'auto',
              backgroundColor: '#e5d5b5', // Manila folder color
              border: '1px solid #c2b291',
              borderRadius: '4px 20px 4px 4px',
              padding: 'clamp(20px, 4vw, 40px)',
              width: '100%',
              maxWidth: '550px',
              position: 'relative',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(0,0,0,0.02) 20px, rgba(0,0,0,0.02) 21px)'
            }}>
            {/* Top Tab — compact so it fits on short/landscape viewports */}
            <div style={{
              position: 'absolute',
              top: '-26px',
              left: '0',
              maxWidth: '100%',
              backgroundColor: '#e5d5b5',
              padding: '4px 16px',
              border: '1px solid #c2b291',
              borderBottom: 'none',
              borderRadius: '8px 8px 0 0',
              color: '#000',
              fontWeight: 'bold',
              fontSize: '11px',
              letterSpacing: 1,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontFamily: TYPEWRITER_FONT,
              boxShadow: '0 -2px 5px rgba(0,0,0,0.1)'
            }}>
              CONFIDENTIAL · FILE {selectedHero.id.toUpperCase()}
            </div>

            <button
              onClick={() => setSelectedHero(null)}
              aria-label="Close file"
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: '#ef4444',
                border: '2px solid #000',
                color: '#fff',
                fontSize: '20px',
                fontWeight: 'bold',
                width: '40px',
                height: '40px',
                minHeight: 40,
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                boxShadow: '2px 2px 0 #000',
                lineHeight: 1
              }}
            >
              ×
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
              {/* Paper-clipped photo */}
              <div style={{
                position: 'relative',
                width: '120px',
                height: '120px',
                background: PORTRAIT_BG,
                border: `4px solid ${hexColor(selectedHero.color)}`,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-end',
                overflow: 'hidden',
                boxShadow: '2px 2px 10px rgba(0,0,0,0.2)',
                transform: 'rotate(-2deg)'
              }}>
                {/* Paperclip */}
                <div style={{
                  position: 'absolute',
                  top: '-15px',
                  left: '20px',
                  width: '12px',
                  height: '40px',
                  border: '3px solid #94a3b8',
                  borderRadius: '10px',
                  borderBottom: 'none',
                  zIndex: 2
                }} />
                <img
                  src={HERO_PLACEHOLDER_SRC}
                  alt={selectedHero.name}
                  style={{ width: '92%', height: '92%', objectFit: 'contain' }}
                />
              </div>

              <div style={{ flex: 1, minWidth: 180, color: '#000' }}>
                <h2 style={{ margin: 0, fontSize: 'clamp(22px, 5vw, 32px)', fontFamily: TYPEWRITER_FONT, textTransform: 'uppercase', borderBottom: '2px solid #000', paddingBottom: '5px' }}>
                  {selectedHero.name}
                </h2>
                <div style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '5px', color: '#334155' }}>
                  ROLE: {selectedHero.profession.toUpperCase()}
                </div>
                <div style={{ marginTop: '10px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '12px', padding: '2px 8px', border: '1px solid #000', fontWeight: 'bold' }}>
                    {selectedHero.damageType.toUpperCase()}
                  </span>
                  <span style={{ fontSize: '12px', padding: '2px 8px', border: '1px solid #000', fontWeight: 'bold' }}>
                    {selectedHero.attackKind === 'melee' ? 'MELEE' : 'RANGED'}
                  </span>
                </div>
              </div>
            </div>

            {/* Typewritten Stats */}
            <div style={{
              backgroundColor: 'rgba(255,255,255,0.5)',
              border: '1px dashed #000',
              padding: '15px',
              marginBottom: '20px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              textAlign: 'center',
              fontFamily: TYPEWRITER_FONT,
              color: '#000'
            }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 'bold' }}>DMG OUTPUT</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{selectedHero.damage}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 'bold' }}>ATK SPD</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{(selectedHero.attackRateMs / 1000).toFixed(1)}s</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 'bold' }}>RANGE</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{metersLabel(selectedHero.range)}</div>
              </div>
            </div>

            <div style={{ marginBottom: '20px', color: '#000' }}>
              <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', borderBottom: '1px solid #000', display: 'inline-block' }}>SIGNATURE SKILL: {selectedHero.signatureSkill.name}</h3>
              <p style={{ margin: '5px 0 0 0', fontSize: '14px', fontFamily: TYPEWRITER_FONT }}>{selectedHero.signatureSkill.description}</p>
            </div>

            {selectedHero.passive && (
              <div style={{ marginBottom: '30px', color: '#000' }}>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', borderBottom: '1px solid #000', display: 'inline-block' }}>PASSIVE: {selectedHero.passive.name}</h3>
                <p style={{ margin: '5px 0 0 0', fontSize: '14px', fontFamily: TYPEWRITER_FONT }}>{selectedHero.passive.description}</p>
              </div>
            )}

            {/* Stamped Upgrade Section */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 16,
              paddingTop: '20px',
              position: 'relative',
              flexWrap: 'wrap'
            }}>

              {/* Red Approved Stamp if enough cards */}
              {((selectedHero.id === 'eden' ? 4 : 8) >= (selectedHero.id === 'eden' ? 15 : 5)) && (
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  left: '40%',
                  transform: 'rotate(-15deg)',
                  color: '#ef4444',
                  border: '4px solid #ef4444',
                  padding: '5px 15px',
                  fontSize: '24px',
                  fontWeight: '900',
                  fontFamily: TYPEWRITER_FONT,
                  opacity: 0.7,
                  pointerEvents: 'none'
                }}>
                  READY FOR PROMOTION
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', color: '#000' }}>
                <span style={{ fontSize: '14px', fontWeight: 'bold', fontFamily: TYPEWRITER_FONT }}>CARDS GATHERED:</span>
                <span style={{ fontSize: '24px', fontWeight: '900' }}>
                  {selectedHero.id === 'eden' ? '4 / 15' : '8 / 5'}
                </span>
              </div>

              <button style={{
                backgroundColor: (selectedHero.id === 'eden') ? '#94a3b8' : '#22c55e',
                color: (selectedHero.id === 'eden') ? '#cbd5e1' : '#000',
                border: '2px solid #000',
                padding: '12px 24px',
                minHeight: 44,
                fontWeight: '900',
                cursor: (selectedHero.id === 'eden') ? 'not-allowed' : 'pointer',
                textTransform: 'uppercase',
                boxShadow: (selectedHero.id === 'eden') ? 'none' : '4px 4px 0 #000',
                transition: 'transform 0.1s, box-shadow 0.1s'
              }}
                onMouseDown={(e) => {
                  if (selectedHero.id !== 'eden') {
                    e.currentTarget.style.transform = 'translate(4px, 4px)';
                    e.currentTarget.style.boxShadow = '0px 0px 0 #000';
                  }
                }}
                onMouseUp={(e) => {
                  if (selectedHero.id !== 'eden') {
                    e.currentTarget.style.transform = 'translate(0px, 0px)';
                    e.currentTarget.style.boxShadow = '4px 4px 0 #000';
                  }
                }}
              >
                Promote Worker
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Enemy Case File Modal (Truth Codex detail) */}
      {selectedEnemy && (() => {
        const tier = enemyTier(selectedEnemy);
        const stats = [
          { label: 'Max HP', value: selectedEnemy.maxHp.toLocaleString() },
          { label: 'Speed', value: metersPerSecondLabel(selectedEnemy.speed) },
          { label: 'Barrier Dmg', value: `${selectedEnemy.damage}` },
          { label: 'Attack Rate', value: `${(selectedEnemy.attackRateMs / 1000).toFixed(1)}s` },
          { label: 'Bounty', value: `${selectedEnemy.reward}` },
        ];
        return (
          <div
            onClick={() => setSelectedEnemy(null)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.8)',
              display: 'flex',
              zIndex: 1000,
              backdropFilter: 'blur(5px)',
              padding: '48px 20px',
              overflowY: 'auto'
            }}>
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                margin: 'auto',
                backgroundColor: '#e5d5b5',
                border: '1px solid #c2b291',
                borderRadius: '4px 20px 4px 4px',
                padding: 'clamp(20px, 4vw, 36px)',
                width: '100%',
                maxWidth: '480px',
                position: 'relative',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(0,0,0,0.02) 20px, rgba(0,0,0,0.02) 21px)'
              }}>
              {/* Top Tab */}
              <div style={{
                position: 'absolute',
                top: '-26px',
                left: 0,
                maxWidth: '100%',
                backgroundColor: '#e5d5b5',
                padding: '4px 16px',
                border: '1px solid #c2b291',
                borderBottom: 'none',
                borderRadius: '8px 8px 0 0',
                color: '#000',
                fontWeight: 'bold',
                fontSize: '11px',
                letterSpacing: 1,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontFamily: TYPEWRITER_FONT,
                boxShadow: '0 -2px 5px rgba(0,0,0,0.1)'
              }}>
                CASE FILE · LIE DEBUNKED
              </div>

              <button
                onClick={() => setSelectedEnemy(null)}
                aria-label="Close case file"
                style={{
                  position: 'absolute',
                  top: '15px',
                  right: '15px',
                  background: '#ef4444',
                  border: '2px solid #000',
                  color: '#fff',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  width: '40px',
                  height: '40px',
                  minHeight: 40,
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  boxShadow: '2px 2px 0 #000',
                  lineHeight: 1
                }}
              >
                ×
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 22, flexWrap: 'wrap' }}>
                {/* Mugshot */}
                <div style={{
                  width: 110,
                  height: 110,
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '4px solid #1c1917',
                  background: `radial-gradient(circle at 50% 40%, ${hexColor(selectedEnemy.color)} 0%, #1e293b 80%)`,
                  transform: 'rotate(-2deg)',
                  boxShadow: '2px 2px 10px rgba(0,0,0,0.3)',
                  color: '#e2e8f0'
                }}>
                  <SkullIcon size={44} />
                </div>

                <div style={{ flex: 1, minWidth: 160, color: '#000' }}>
                  <span style={{
                    display: 'inline-block', fontSize: 10, fontWeight: 900, letterSpacing: 1,
                    textTransform: 'uppercase', padding: '2px 8px', borderRadius: 4, marginBottom: 6,
                    color: '#fff', backgroundColor: TIER_COLOR[tier]
                  }}>
                    {tier}
                  </span>
                  <h2 style={{ margin: 0, fontSize: 'clamp(20px, 5vw, 28px)', fontFamily: TYPEWRITER_FONT, textTransform: 'uppercase', borderBottom: '2px solid #000', paddingBottom: 5 }}>
                    {selectedEnemy.name}
                  </h2>
                </div>
              </div>

              {/* Debrief */}
              <div style={{
                backgroundColor: 'rgba(255,255,255,0.5)',
                border: '1px dashed #000',
                padding: '12px 14px',
                marginBottom: 18,
                color: '#000',
                fontFamily: TYPEWRITER_FONT,
                fontSize: 14,
                fontStyle: 'italic',
                lineHeight: 1.5
              }}>
                "{enemyMechanic(selectedEnemy)}"
              </div>

              {/* Stat sheet */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: 8 }}>
                {stats.map((stat) => (
                  <div key={stat.label} style={{
                    backgroundColor: 'rgba(255,255,255,0.55)',
                    border: '1px solid #c2b291',
                    borderRadius: 3,
                    padding: '8px 6px',
                    textAlign: 'center',
                    color: '#000'
                  }}>
                    <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: 0.5, textTransform: 'uppercase', color: '#57534e' }}>{stat.label}</div>
                    <div style={{ fontSize: 18, fontWeight: 900, fontFamily: TYPEWRITER_FONT }}>{stat.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
