import { useEffect, useReducer, useState } from 'react';
import { theme } from '../theme';
import { HERO_DEFINITIONS, type HeroDefinition, type HeroId } from '../../game/data/heroes';
import { ENEMY_DEFINITIONS, type EnemyDefinition, type EnemyId } from '../../game/data/enemies';
import { HopeCoinIcon, RallyPermitIcon, LockIcon, InfoIcon } from '../icons';
import { BackButton } from '../components/BackButton';
import {
  HeroPolaroidCard,
  PORTRAIT_BG,
  TIER_COLOR,
  TYPEWRITER_FONT,
  enemyTier,
  hexColor,
  SkinPortrait,
  EnemyCaseCard,
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
  subscribeMetaState,
} from '../../game/data/metaState';

interface InventoryScreenProps {
  onBack: () => void;
}

type ArchiveTab = 'heroes' | 'codex';

// Real anomalies only (drop the sandbox punching bag).
const CODEX_ENEMIES = Object.values(ENEMY_DEFINITIONS)
  .filter((def) => def.id !== 'sandbox_target')
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
      backgroundColor: theme.materials.cork, // Ash-stained cork
      backgroundImage: `
        radial-gradient(${theme.materials.corkDark} 10%, transparent 11%),
        radial-gradient(${theme.materials.corkDark} 10%, transparent 11%)
      `,
      backgroundSize: '20px 20px',
      backgroundPosition: '0 0, 10px 10px',
      display: 'flex',
      flexDirection: 'column',
      padding: 'clamp(12px, 3vw, 24px)',
      color: theme.colors.textPrimary,
      overflowY: 'auto',
      boxShadow: 'inset 0 0 120px rgba(0,0,0,0.9)'
    }}>

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
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', zIndex: 10 }}>
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
                color: active ? theme.colors.textPrimary : theme.colors.textSecondary,
                backgroundColor: active ? theme.colors.accent : 'rgba(9, 9, 11, 0.8)',
                border: active ? `2px solid ${theme.colors.accent}` : `2px solid ${theme.colors.border}`,
                borderRadius: 6,
                transform: active ? 'rotate(-1deg)' : 'none',
                boxShadow: active ? `0 0 15px rgba(234, 88, 12, 0.5), inset 0 0 8px rgba(234, 88, 12, 0.3)` : 'none',
                textShadow: active ? '0 1px 3px rgba(0,0,0,0.8)' : 'none',
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(68px, 1fr))', gap: '8px 6px', padding: '6px 2px' }}>
          {roster.map((hero, idx) => {
            // Unlock path comes from the campaign schedule (data/heroUnlocks.ts);
            // cleared-stage progress and leveling are still mock.
            const unlockStage = heroUnlockStage(hero.id);
            const unlockAct = actForStage(unlockStage);
            const isUnlocked = unlockStage <= highestStage || storeUnlocked.includes(hero.id as HeroId);
            const mockLevel = hero.id === 'eden' ? 3 : 1;
            const mockCards = hero.id === 'eden' ? 4 : 8;
            const mockCardsNeeded = mockLevel * 5;
            const rotation = (idx % 2 === 0 ? 1 : -1) * (2 + (idx % 3)); // slight, stable rotation

            return (
              <HeroPolaroidCard
                key={hero.id}
                name={hero.name}
                subtitle={isUnlocked ? hero.profession : `A ${hero.profession.toLowerCase()} waits for the movement to reach them…`}
                unlocked={isUnlocked}
                level={mockLevel}
                rotation={rotation}
                skin={getSelectedSkin(hero.id)}
                onClick={() => setSelectedHero(hero)}
                lockedHint={
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
                }
              >
                <span style={{ fontSize: '7px', padding: '1px 4px', backgroundColor: 'rgba(0,0,0,0.4)', color: theme.colors.textSecondary, border: `1px solid ${theme.colors.border}`, fontWeight: 'bold' }}>
                  {hero.damageType.toUpperCase()}
                </span>
                <div style={{
                  fontSize: '7.5px',
                  fontWeight: 'bold',
                  color: mockCards >= mockCardsNeeded ? theme.colors.accent : theme.colors.textMuted,
                  backgroundColor: mockCards >= mockCardsNeeded ? 'rgba(234, 88, 12, 0.15)' : 'rgba(0,0,0,0.6)',
                  border: mockCards >= mockCardsNeeded ? `1px solid ${theme.colors.accent}` : `1px solid ${theme.colors.border}`,
                  padding: '1px 5px',
                  borderRadius: '10px'
                }}>
                  CARDS: {mockCards} / {mockCardsNeeded}
                </div>
              </HeroPolaroidCard>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))', gap: '8px 6px', padding: '4px' }}>
            {CODEX_ENEMIES.map((def, idx) => {
              const faced = FACED_ENEMY_IDS.has(def.id);
              const tier = enemyTier(def);
              const rotation = (idx % 2 === 0 ? -1 : 1) * (1 + (idx % 2));
              return (
                <EnemyCaseCard
                  key={def.id}
                  name={def.name}
                  enemyId={def.id}
                  colorHex={hexColor(def.color)}
                  tag={{ label: tier, color: TIER_COLOR[tier] }}
                  faced={faced}
                  rotation={rotation}
                  onClick={() => setSelectedEnemy(def)}
                >
                  {faced ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 4, color: theme.colors.accent, fontSize: 7.5, fontWeight: 800, letterSpacing: 0.3, textTransform: 'uppercase' }}>
                      <InfoIcon size={9} /> Tap to open
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, color: '#e2e8f0', fontSize: 8, fontWeight: 700 }}>
                      <LockIcon size={10} /> SEALED
                    </div>
                  )}
                </EnemyCaseCard>
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
              <HeroTcgCard heroId={selectedHero.id} />
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

              {/* Red Approved Stamp if enough cards */}
              {((selectedHero.id === 'eden' ? 4 : 8) >= (selectedHero.id === 'eden' ? 15 : 5)) && (
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
                <span style={{ fontSize: '14px', fontWeight: 'bold', fontFamily: TYPEWRITER_FONT }}>CARDS GATHERED:</span>
                <span style={{ fontSize: '24px', fontWeight: '900' }}>
                  {selectedHero.id === 'eden' ? '4 / 15' : '8 / 5'}
                </span>
              </div>

              <button style={{
                backgroundColor: (selectedHero.id === 'eden') ? '#18181b' : theme.colors.accent,
                color: (selectedHero.id === 'eden') ? theme.colors.textMuted : theme.colors.textPrimary,
                border: (selectedHero.id === 'eden') ? `2px solid ${theme.colors.border}` : `2px solid ${theme.colors.accent}`,
                padding: '12px 24px',
                minHeight: 44,
                fontWeight: '900',
                cursor: (selectedHero.id === 'eden') ? 'not-allowed' : 'pointer',
                textTransform: 'uppercase',
                boxShadow: (selectedHero.id === 'eden') ? 'none' : '0 0 20px rgba(234, 88, 12, 0.6), inset 0 0 10px rgba(234, 88, 12, 0.4)',
                textShadow: (selectedHero.id === 'eden') ? 'none' : '0 2px 4px rgba(0,0,0,0.6)',
                transition: 'transform 0.1s, box-shadow 0.1s'
              }}
                onMouseDown={(e) => {
                  if (selectedHero.id !== 'eden') {
                    e.currentTarget.style.transform = 'translate(2px, 2px)';
                    e.currentTarget.style.boxShadow = '0 0 10px rgba(234, 88, 12, 0.8), inset 0 0 5px rgba(234, 88, 12, 0.6)';
                  }
                }}
                onMouseUp={(e) => {
                  if (selectedHero.id !== 'eden') {
                    e.currentTarget.style.transform = 'translate(0px, 0px)';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(234, 88, 12, 0.6), inset 0 0 10px rgba(234, 88, 12, 0.4)';
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
