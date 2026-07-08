import { useEffect, useReducer, useState } from 'react';
import { theme } from '../theme';
import { HERO_DEFINITIONS, type HeroDefinition } from '../../game/data/heroes';
import { ENEMY_DEFINITIONS, type EnemyDefinition, type EnemyId } from '../../game/data/enemies';
import { metersLabel, metersPerSecondLabel } from '../../game/data/constants';
import { HopeCoinIcon, RallyPermitIcon, LockIcon, SkullIcon, InfoIcon } from '../icons';
import { BackButton } from '../components/BackButton';
import {
  EnemyCaseCard,
  HeroPolaroidCard,
  PORTRAIT_BG,
  SkinPortrait,
  TIER_COLOR,
  TYPEWRITER_FONT,
  enemyMechanic,
  enemyTier,
  hexColor,
} from '../components/ArchiveCards';
import { getSelectedSkin, setSelectedSkin, subscribeSkins } from '../../game/data/skinSelection';
import { heroSkins } from '../../game/data/skins';

interface InventoryScreenProps {
  onBack: () => void;
}

type ArchiveTab = 'heroes' | 'codex';

// Real anomalies only (drop the sandbox punching bag).
const CODEX_ENEMIES = Object.values(ENEMY_DEFINITIONS).filter((def) => def.id !== 'sandbox_target');

// Mock: which anomalies the player has actually faced (unlock-on-encounter).
const FACED_ENEMY_IDS = new Set<EnemyId>([
  'grunt', 'runner', 'brute', 'ghost_employee', 'epal', 'the_overpriced', 'kickback_courier',
]);

export function InventoryScreen({ onBack }: InventoryScreenProps) {
  const [tab, setTab] = useState<ArchiveTab>('heroes');
  const [selectedHero, setSelectedHero] = useState<HeroDefinition | null>(null);
  const [selectedEnemy, setSelectedEnemy] = useState<EnemyDefinition | null>(null);
  // Re-render when a skin is equipped so every portrait reflects the choice.
  const [, forceSkinRefresh] = useReducer((n: number) => n + 1, 0);
  useEffect(() => subscribeSkins(forceSkinRefresh), []);

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
      padding: 'clamp(12px, 3vw, 24px)',
      color: theme.colors.textPrimary,
      overflowY: 'auto',
      boxShadow: 'inset 0 0 100px rgba(0,0,0,0.8)'
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(68px, 1fr))', gap: '8px 6px', padding: '6px 2px' }}>
          {roster.map((hero, idx) => {
            // Mock unlocking and leveling logic
            const isUnlocked = idx < 12;
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
              >
                <span style={{ fontSize: '7px', padding: '1px 4px', backgroundColor: '#e2e8f0', color: '#334155', border: '1px solid #cbd5e1', fontWeight: 'bold' }}>
                  {hero.damageType.toUpperCase()}
                </span>
                <div style={{
                  fontSize: '7.5px',
                  fontWeight: 'bold',
                  color: mockCards >= mockCardsNeeded ? '#166534' : '#b91c1c',
                  backgroundColor: mockCards >= mockCardsNeeded ? '#bbf7d0' : '#fecaca',
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
            display: 'flex', alignItems: 'center', gap: 8, color: '#e2e8f0',
            fontSize: 13, marginBottom: 18, backgroundColor: 'rgba(0,0,0,0.4)',
            padding: '8px 14px', borderRadius: 8, width: 'fit-content'
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
                  colorHex={hexColor(def.color)}
                  tag={{ label: tier, color: TIER_COLOR[tier] }}
                  faced={faced}
                  rotation={rotation}
                  onClick={() => setSelectedEnemy(def)}
                >
                  {faced ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 4, color: '#78350f', fontSize: 7.5, fontWeight: 800, letterSpacing: 0.3, textTransform: 'uppercase' }}>
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
            backgroundColor: 'rgba(0,0,0,0.8)',
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
              backgroundColor: '#e5d5b5', // Manila folder color
              border: '1px solid #c2b291',
              borderRadius: '4px 20px 4px 4px',
              padding: 'clamp(14px, 3vw, 28px)',
              width: '100%',
              maxWidth: '550px',
              position: 'relative',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(0,0,0,0.02) 20px, rgba(0,0,0,0.02) 21px)'
            }}>
            {/* Top Tab — compact so it fits on short/landscape viewports */}
            <div style={{
              position: 'absolute',
              top: '-22px',
              left: '0',
              maxWidth: '100%',
              backgroundColor: '#e5d5b5',
              padding: '3px 10px',
              border: '1px solid #c2b291',
              borderBottom: 'none',
              borderRadius: '8px 8px 0 0',
              color: '#000',
              fontWeight: 'bold',
              fontSize: '9px',
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px', flexWrap: 'wrap' }}>
              {/* Paper-clipped photo */}
              <div style={{
                position: 'relative',
                width: '80px',
                height: '80px',
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
                <SkinPortrait skin={getSelectedSkin(selectedHero.id)} alt={selectedHero.name} />
              </div>

              <div style={{ flex: 1, minWidth: 140, color: '#000' }}>
                <h2 style={{ margin: 0, fontSize: 'clamp(16px, 4.5vw, 24px)', fontFamily: TYPEWRITER_FONT, textTransform: 'uppercase', borderBottom: '2px solid #000', paddingBottom: '4px' }}>
                  {selectedHero.name}
                </h2>
                <div style={{ fontSize: '13px', fontWeight: 'bold', marginTop: '4px', color: '#334155' }}>
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
              marginBottom: '14px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              textAlign: 'center',
              fontFamily: TYPEWRITER_FONT,
              color: '#000'
            }}>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 'bold' }}>DMG OUTPUT</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{selectedHero.damage}</div>
              </div>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 'bold' }}>ATK SPD</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{(selectedHero.attackRateMs / 1000).toFixed(1)}s</div>
              </div>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 'bold' }}>RANGE</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{metersLabel(selectedHero.range)}</div>
              </div>
            </div>

            <div style={{ marginBottom: '20px', color: '#000' }}>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '13px', borderBottom: '1px solid #000', display: 'inline-block' }}>SIGNATURE SKILL: {selectedHero.signatureSkill.name}</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '11px', fontFamily: TYPEWRITER_FONT }}>{selectedHero.signatureSkill.description}</p>
            </div>

            {selectedHero.passive && (
              <div style={{ marginBottom: '18px', color: '#000' }}>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '13px', borderBottom: '1px solid #000', display: 'inline-block' }}>PASSIVE: {selectedHero.passive.name}</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '11px', fontFamily: TYPEWRITER_FONT }}>{selectedHero.passive.description}</p>
              </div>
            )}

            {/* Skins — pick which sheet this worker wears into battle */}
            {heroSkins(selectedHero.id).length > 0 && (
              <div style={{ marginBottom: '18px', color: '#000' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '13px', borderBottom: '1px solid #000', display: 'inline-block' }}>SKINS</h3>
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
                          backgroundColor: active ? '#fef08a' : '#f8fafc',
                          border: active ? '2px solid #000' : '1px solid #c2b291',
                          boxShadow: active ? '2px 2px 0 #000' : '1px 2px 6px rgba(0,0,0,0.25)',
                          cursor: 'pointer',
                          fontFamily: TYPEWRITER_FONT,
                        }}
                      >
                        <div style={{ width: 56, height: 56, background: PORTRAIT_BG, overflow: 'hidden', border: '1px solid #94a3b8' }}>
                          <SkinPortrait skin={skin} alt={skin.name} />
                        </div>
                        <span style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', color: '#000' }}>
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
