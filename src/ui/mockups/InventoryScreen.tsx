import { useEffect, useReducer, useState } from 'react';
import { theme } from '../theme';
import { HERO_DEFINITIONS, type HeroDefinition, type HeroId } from '../../game/data/heroes';
import { ENEMY_DEFINITIONS, isEnemyPlayable, type EnemyDefinition, type EnemyId } from '../../game/data/enemies';
import { HopeCoinIcon, RallyPermitIcon, LockIcon, InfoIcon } from '../icons';
import { BackButton } from '../components/BackButton';
import { Embers, SoulsButton } from '../components/ApocalypseScenery';
import {
  PORTRAIT_BG,
  TIER_COLOR,
  TYPEWRITER_FONT,
  enemyTier,
  SkinPortrait,
} from '../components/ArchiveCards';
import { EnemyTcgCard } from '../components/EnemyTcgCard';
import { HeroTcgCard } from '../components/HeroTcgCard';
import { getSelectedSkin, setSelectedSkin, subscribeSkins } from '../../game/data/skinSelection';
import { heroSkins } from '../../game/data/skins';
import { heroUnlockStage } from '../../game/data/heroUnlocks';
import { actForStage } from '../../game/data/campaign';
import {
  getHope,
  getPermits,
  getHighestClearedStage,
  getStoreUnlockedHeroes,
  getHeroCardCount,
  getHeroLevel,
  levelUpHero,
  subscribeMetaState,
} from '../../game/data/metaState';
import { cardsForNextLevel, HERO_LEVEL_CAP, leveledDamage } from '../../game/data/heroProgression';

interface InventoryScreenProps {
  onBack: () => void;
}

type ArchiveTab = 'heroes' | 'codex';

// Real anomalies only (drop the sandbox punching bag, and — temporarily —
// any enemy still lacking a sprite sheet; see SPRITELESS_ENEMY_FALLBACK).
const CODEX_ENEMIES = Object.values(ENEMY_DEFINITIONS)
  .filter((def) => def.id !== 'sandbox_target' && isEnemyPlayable(def.id))
  .sort((a, b) => {
    const tierA = enemyTier(a);
    const tierB = enemyTier(b);
    const weightA = tierA === 'Minion' ? 1 : tierA === 'Mini-Boss' ? 2 : 3;
    const weightB = tierB === 'Minion' ? 1 : tierB === 'Mini-Boss' ? 2 : 3;
    if (weightA !== weightB) return weightA - weightB;
    return a.name.localeCompare(b.name);
  });

// (data/heroUnlocks.ts) has been reached count as recruited into the movement.
// Reading HIGHEST_CLEARED_STAGE from metaState now.

// Mock: which anomalies the player has actually faced (unlock-on-encounter).
const FACED_ENEMY_IDS = new Set<EnemyId>([
  'grunt', 'runner', 'brute', 'ghost_employee', 'bribery', 'epal', 'crony_bodyguard', 'hoarder', 'land_grabber', 'red_tape',
  'boss_flood_control', 'boss_pork_barrel', 'boss_troll_farm', 'boss_vote_buying', 'boss_nepotism', 'boss_wang_wang',
  'boss_budget_insertion', 'boss_smuggling', 'boss_dynasty_1', 'boss_dynasty_2', 'boss_dynasty_3', 'boss_ang_sistema'
]);

export function InventoryScreen({ onBack }: InventoryScreenProps) {
  const [tab, setTab] = useState<ArchiveTab>('heroes');
  const [selectedHero, setSelectedHero] = useState<HeroDefinition | null>(null);
  const [selectedEnemy, setSelectedEnemy] = useState<EnemyDefinition | null>(null);
  // Re-render when a skin is equipped or meta progression changes
  const [, forceUpdate] = useReducer((n: number) => n + 1, 0);
  useEffect(() => {
    const unsubSkins = subscribeSkins(forceUpdate);
    const unsubMeta = subscribeMetaState(forceUpdate);
    return () => {
      unsubSkins();
      unsubMeta();
    };
  }, []);

  // Real workers only — the sandbox test dummies never belong in the roster.
  // Sorted along the campaign's unlock ladder (data/heroUnlocks.ts): recruited
  // workers first, then the still-locked ones in the order the movement will
  // reach them. Ties (same stage) break alphabetically for a stable wall.
  const roster = Object.values(HERO_DEFINITIONS)
    .filter((hero) => !hero.id.startsWith('sandbox_'))
    .sort((a, b) => heroUnlockStage(a.id) - heroUnlockStage(b.id) || a.name.localeCompare(b.name));

  const facedCount = CODEX_ENEMIES.filter((def) => FACED_ENEMY_IDS.has(def.id)).length;

  const currentHope = getHope();
  const currentPermits = getPermits();
  const highestStage = getHighestClearedStage();
  const storeUnlocked = getStoreUnlockedHeroes();

  return (
    <div className="rally-screen" style={{
      position: 'absolute',
      inset: 0,
      backgroundColor: theme.materials.corkDark, // Ash-stained, soot-darkened cork
      backgroundImage: `
        radial-gradient(ellipse at 15% 0%, rgba(0,0,0,0.6) 0%, transparent 45%),
        radial-gradient(ellipse at 85% 100%, rgba(0,0,0,0.55) 0%, transparent 50%),
        radial-gradient(${theme.materials.charredWall} 10%, transparent 11%),
        radial-gradient(${theme.materials.charredWall} 10%, transparent 11%)
      `,
      backgroundSize: '100% 100%, 100% 100%, 20px 20px, 20px 20px',
      backgroundPosition: '0 0, 0 0, 0 0, 10px 10px',
      display: 'flex',
      flexDirection: 'column',
      padding: 'clamp(12px, 3vw, 24px)',
      color: theme.colors.textPrimary,
      overflowY: 'auto',
      boxShadow: 'inset 0 0 140px rgba(0,0,0,0.95)'
    }}>
      <Embers count={7} />

      {/* Top Header / Nav Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '16px',
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
            backgroundColor: '#44403c', // Scorched parchment
            color: theme.colors.textPrimary,
            padding: '10px clamp(14px, 5vw, 30px)',
            transform: 'rotate(-2deg)',
            boxShadow: '2px 4px 10px rgba(0,0,0,0.6)',
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
              backgroundColor: theme.materials.tape, // Burnt/aged tape
              boxShadow: '0 1px 3px rgba(0,0,0,0.4)'
            }} /> {/* Masking tape */}
            <h1 style={{ margin: 0, fontSize: 'clamp(20px, 6vw, 32px)', fontFamily: TYPEWRITER_FONT, fontWeight: '900', textTransform: 'uppercase', lineHeight: 1.1 }}>
              The Movement Archive
            </h1>
          </div>
        </div>

        {/* Currency Display (Pinned Card) */}
        <div style={{
          backgroundColor: '#292524', // Weathered dark card
          padding: '15px 25px',
          borderRadius: '4px',
          boxShadow: '2px 4px 15px rgba(0,0,0,0.6)',
          transform: 'rotate(1deg)',
          display: 'flex',
          gap: '30px',
          position: 'relative',
          border: `1px solid ${theme.colors.border}`
        }}>
          {/* Push Pin */}
          <div style={{
            position: 'absolute',
            top: '5px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '12px',
            height: '12px',
            backgroundColor: '#78716c', // Duller, rusted pin
            borderRadius: '50%',
            boxShadow: 'inset -2px -2px 4px rgba(0,0,0,0.5), 2px 2px 5px rgba(0,0,0,0.7)'
          }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: theme.colors.gold, display: 'flex' }}><HopeCoinIcon size={22} /></span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '12px', color: theme.colors.textMuted, fontWeight: 'bold' }}>HOPE POINTS</span>
              <span style={{ fontSize: '20px', color: theme.colors.textPrimary, fontWeight: '900' }}>{currentHope}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: theme.colors.textSecondary, display: 'flex' }}><RallyPermitIcon size={22} /></span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '12px', color: theme.colors.textMuted, fontWeight: 'bold' }}>RALLY PERMITS</span>
              <span style={{ fontSize: '20px', color: theme.colors.textPrimary, fontWeight: '900' }}>{currentPermits}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Roster vs Truth Codex */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 22, flexWrap: 'wrap', zIndex: 10 }}>
        {([
          { id: 'heroes' as const, label: 'The Roster', count: `${roster.length} workers` },
          { id: 'codex' as const, label: 'The Truth Codex', count: `${facedCount}/${CODEX_ENEMIES.length} debunked` },
        ]).map((t) => {
          const active = tab === t.id;
          return (
            <SoulsButton
              key={t.id}
              variant={active ? 'primary' : 'secondary'}
              onClick={() => setTab(t.id)}
              aria-pressed={active}
              style={{
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 1,
                minHeight: 44,
                fontFamily: TYPEWRITER_FONT,
                letterSpacing: 1,
                transform: active ? 'rotate(-1deg)' : 'none',
              }}
            >
              <span style={{ fontSize: 16, color: active ? theme.colors.textPrimary : theme.colors.textSecondary }}>{t.label}</span>
              <span style={{ fontSize: 10, opacity: 0.8, textTransform: 'none', letterSpacing: 0, fontWeight: 400 }}>{t.count}</span>
            </SoulsButton>
          );
        })}
      </div>

      {/* HEROES: Grid of Polaroid Cards */}
      {tab === 'heroes' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(84px, 1fr))', gap: '18px 14px', padding: '10px 4px' }}>
          {roster.map((hero, idx) => {
            // Unlock path comes from the campaign schedule (data/heroUnlocks.ts);
            // level + card counts are real, from metaState.
            const unlockStage = heroUnlockStage(hero.id);
            const unlockAct = actForStage(unlockStage);
            const isUnlocked = unlockStage <= highestStage || storeUnlocked.includes(hero.id as HeroId);
            const level = getHeroLevel(hero.id);
            const cards = getHeroCardCount(hero.id);
            const atCap = level >= HERO_LEVEL_CAP;
            const cardsNeeded = cardsForNextLevel(level);
            const canPromote = !atCap && cards >= cardsNeeded;
            const rotation = (idx % 2 === 0 ? 1 : -1) * (2 + (idx % 3)); // slight, stable rotation

            return (
              <div key={hero.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ width: '100%', filter: isUnlocked ? 'none' : 'grayscale(100%)', opacity: isUnlocked ? 1 : 0.7 }}>
                  <HeroTcgCard
                    variant="compact"
                    heroId={hero.id}
                    rotation={rotation}
                    onClick={isUnlocked ? () => setSelectedHero(hero) : undefined}
                    ariaLabel={`Open dossier: ${hero.name}`}
                  >
                    {isUnlocked ? (
                      <div style={{
                        position: 'absolute',
                        top: 6,
                        right: 6,
                        backgroundColor: theme.materials.cautionYellow,
                        color: '#000',
                        fontWeight: 900,
                        padding: '1px 4px',
                        fontSize: 8,
                        border: '1px solid #000',
                        transform: 'rotate(-5deg)'
                      }}>
                        LVL {level}
                      </div>
                    ) : (
                      <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#94a3b8', display: 'flex' }}>
                        <LockIcon size={22} />
                      </span>
                    )}
                  </HeroTcgCard>
                </div>
                {isUnlocked ? (
                  <>
                    <span style={{ fontSize: '7px', padding: '1px 4px', backgroundColor: 'rgba(0,0,0,0.4)', color: theme.colors.textSecondary, border: `1px solid ${theme.colors.border}`, fontWeight: 'bold' }}>
                      {hero.damageType.toUpperCase()}
                    </span>
                    <div style={{
                      fontSize: '7.5px',
                      fontWeight: 'bold',
                      color: canPromote ? theme.colors.accent : theme.colors.textMuted,
                      backgroundColor: canPromote ? 'rgba(234, 88, 12, 0.15)' : 'rgba(0,0,0,0.6)',
                      border: canPromote ? `1px solid ${theme.colors.accent}` : `1px solid ${theme.colors.border}`,
                      padding: '1px 5px',
                      borderRadius: '10px'
                    }}>
                      {atCap ? `CARDS: ${cards} · MAX` : `CARDS: ${cards} / ${cardsNeeded}`}
                    </div>
                  </>
                ) : (
                  <div style={{
                    fontSize: '7.5px',
                    fontWeight: 'bold',
                    color: theme.colors.textSecondary,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    border: `1px solid ${theme.colors.border}`,
                    padding: '1px 5px',
                    borderRadius: '10px'
                  }}>
                    JOINS: ACT {unlockAct} · STAGE {unlockStage}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* CODEX: Enemy case files (unlock on encounter) */}
      {tab === 'codex' && (
        <div style={{ zIndex: 10 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, color: theme.colors.textPrimary,
            fontSize: 13, marginBottom: 18, backgroundColor: '#09090b',
            padding: '8px 14px', borderRadius: 8, width: 'fit-content', border: `1px solid ${theme.colors.border}`,
            boxShadow: '0 4px 10px rgba(0,0,0,0.8)'
          }}>
            <InfoIcon size={16} />
            Every anomaly you face in the field is filed here — a lie debunked.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))', gap: '18px 14px', padding: '8px 4px' }}>
            {CODEX_ENEMIES.map((def, idx) => {
              const faced = FACED_ENEMY_IDS.has(def.id);
              const tier = enemyTier(def);
              const rotation = (idx % 2 === 0 ? -1 : 1) * (1 + (idx % 2));
              return (
                <div key={def.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <EnemyTcgCard
                    variant="compact"
                    enemyId={def.id}
                    isFacedUp={faced}
                    rotation={rotation}
                    onClick={() => setSelectedEnemy(def)}
                    ariaLabel={`Open case file: ${def.name}`}
                  />
                  <span style={{
                    fontSize: 7,
                    fontWeight: 900,
                    letterSpacing: 0.5,
                    textTransform: 'uppercase',
                    padding: '2px 5px',
                    borderRadius: 4,
                    color: '#fff',
                    backgroundColor: TIER_COLOR[tier]
                  }}>
                    {tier}
                  </span>
                  {faced ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, color: theme.colors.accent, fontSize: 7.5, fontWeight: 800, letterSpacing: 0.3, textTransform: 'uppercase' }}>
                      <InfoIcon size={9} /> Tap to open
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#e2e8f0', fontSize: 8, fontWeight: 700 }}>
                      <LockIcon size={10} /> SEALED
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
            backgroundColor: 'rgba(0,0,0,0.88)',
            display: 'flex',
            zIndex: 1000,
            backdropFilter: 'blur(5px)',
            padding: '32px 14px',
            overflowY: 'auto'
          }}>
          {/* Dossier Folder */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              margin: 'auto',
              backgroundColor: '#292018', // Scorched manila folder
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '4px 20px 4px 4px',
              padding: 'clamp(14px, 3vw, 28px)',
              width: '100%',
              maxWidth: '550px',
              position: 'relative',
              boxShadow: '0 20px 50px rgba(0,0,0,0.7), 0 0 40px rgba(234,88,12,0.06)',
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(255,255,255,0.02) 20px, rgba(255,255,255,0.02) 21px)'
            }}>
            {/* Top Tab — compact so it fits on short/landscape viewports */}
            <div style={{
              position: 'absolute',
              top: '-22px',
              left: '0',
              maxWidth: '100%',
              backgroundColor: '#1a1410', // Dark tab
              padding: '3px 10px',
              border: `1px solid ${theme.colors.border}`,
              borderBottom: 'none',
              borderRadius: '8px 8px 0 0',
              color: theme.colors.textSecondary,
              fontWeight: 'bold',
              fontSize: '9px',
              letterSpacing: 1,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontFamily: TYPEWRITER_FONT,
              boxShadow: '0 -2px 5px rgba(0,0,0,0.3)'
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
                background: '#991b1b', // Darker red close button
                border: `2px solid ${theme.colors.border}`,
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
                boxShadow: '2px 2px 0 rgba(0,0,0,0.5)',
                lineHeight: 1,
                zIndex: 100
              }}
            >
              ×
            </button>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
              <HeroTcgCard
                heroId={selectedHero.id}
                damageOverride={leveledDamage(selectedHero.damage, getHeroLevel(selectedHero.id))}
              />
            </div>

            {/* Skins — pick which sheet this worker wears into battle */}
            {heroSkins(selectedHero.id).length > 0 && (
              <div style={{ marginBottom: '18px', color: theme.colors.textPrimary }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '13px', borderBottom: `1px solid ${theme.colors.textMuted}`, display: 'inline-block' }}>SKINS</h3>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {heroSkins(selectedHero.id).map((skin) => {
                    const active = getSelectedSkin(selectedHero.id)?.id === skin.id;
                    return (
                      <button
                        key={skin.id}
                        onClick={() => setSelectedSkin(selectedHero.id, skin.id)}
                        aria-pressed={active}
                        aria-label={`Equip skin: ${skin.name}`}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 4,
                          padding: 5,
                          backgroundColor: active ? 'rgba(234, 88, 12, 0.18)' : 'rgba(0,0,0,0.3)',
                          border: active ? `2px solid ${theme.colors.accent}` : `1px solid ${theme.colors.border}`,
                          boxShadow: active ? `0 0 10px rgba(234, 88, 12, 0.4), inset 0 0 8px rgba(234, 88, 12, 0.3)` : '1px 2px 6px rgba(0,0,0,0.4)',
                          cursor: 'pointer',
                          fontFamily: TYPEWRITER_FONT,
                        }}
                      >
                        <div style={{ width: 56, height: 56, background: PORTRAIT_BG, overflow: 'hidden', border: `1px solid ${theme.colors.border}` }}>
                          <SkinPortrait skin={skin} alt={skin.name} />
                        </div>
                        <span style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', color: theme.colors.textPrimary }}>
                          {active ? `✓ ${skin.name}` : skin.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
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

              {/* Red Approved Stamp when enough cards to promote */}
              {(() => {
                const level = getHeroLevel(selectedHero.id);
                const atCap = level >= HERO_LEVEL_CAP;
                const cards = getHeroCardCount(selectedHero.id);
                const cost = cardsForNextLevel(level);
                const canPromote = !atCap && cards >= cost;
                return (
                  <>
                    {canPromote && (
                      <div style={{
                        position: 'absolute',
                        top: '10px',
                        left: '40%',
                        transform: 'rotate(-15deg)',
                        color: theme.colors.accent, // Ember-orange stamp
                        border: `4px solid ${theme.colors.accent}`,
                        padding: '5px 15px',
                        fontSize: '24px',
                        fontWeight: '900',
                        fontFamily: TYPEWRITER_FONT,
                        opacity: 0.85,
                        textShadow: '0 0 10px rgba(234,88,12,0.5)',
                        boxShadow: '0 0 15px rgba(234,88,12,0.3), inset 0 0 10px rgba(234,88,12,0.3)',
                        pointerEvents: 'none'
                      }}>
                        READY FOR PROMOTION
                      </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', color: theme.colors.textPrimary }}>
                      <span style={{ fontSize: '14px', fontWeight: 'bold', fontFamily: TYPEWRITER_FONT }}>
                        LV {level}{atCap ? ' · MAX' : ''} — CARDS:
                      </span>
                      <span style={{ fontSize: '24px', fontWeight: '900' }}>
                        {atCap ? `${cards}` : `${cards} / ${cost}`}
                      </span>
                    </div>

                    <SoulsButton
                      variant="primary"
                      disabled={!canPromote}
                      onClick={() => { levelUpHero(selectedHero.id); }}
                    >
                      {atCap ? 'Max Level' : 'Promote Worker'}
                    </SoulsButton>
                  </>
                );
              })()}
            </div>

          </div>
        </div>
      )}

      {/* Enemy Case File Modal (Truth Codex detail) */}
      {selectedEnemy && (() => {
        return (
          <div
            onClick={() => setSelectedEnemy(null)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.9)', // Darker enemy modal backdrop
              display: 'flex',
              zIndex: 1000,
              backdropFilter: 'blur(5px)',
              padding: '48px 20px',
              overflowY: 'auto',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
            
            <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
              <button
                onClick={() => setSelectedEnemy(null)}
                aria-label="Close case file"
                style={{
                  position: 'absolute',
                  top: '-40px',
                  right: '0',
                  background: '#991b1b', // Darker close button
                  border: `2px solid ${theme.colors.border}`,
                  color: theme.colors.textPrimary,
                  fontSize: '20px',
                  fontWeight: 'bold',
                  width: '32px',
                  height: '32px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  boxShadow: '2px 2px 0 rgba(0,0,0,0.5)',
                  lineHeight: 1,
                  zIndex: 10,
                  borderRadius: '50%'
                }}
              >
                ×
              </button>
              
              <EnemyTcgCard enemyId={selectedEnemy.id} rotation={0} />
            </div>
          </div>
        );
      })()}
    </div>
  );
}
