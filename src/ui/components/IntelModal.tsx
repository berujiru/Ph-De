import { useState } from 'react';
import { theme } from '../theme';
import { BrainIcon, SkullIcon } from '../icons';
import { glassPanel, glass, withAlpha } from '../mockups/battleStyles';
import { HERO_DEFINITIONS, ENEMY_DEFINITIONS } from '../../game/data/balance';
import type { ActiveHeroInfo, ActiveEnemyInfo } from '../../game/core/GameEvents';

export interface IntelModalProps {
  heroes: ActiveHeroInfo[];
  enemies: ActiveEnemyInfo[];
  onClose: () => void;
}

export function IntelModal({ heroes, enemies, onClose }: IntelModalProps) {
  const [tab, setTab] = useState<'heroes' | 'enemies'>('heroes');

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 150,
        backgroundColor: withAlpha(theme.colors.background, 0.72),
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        pointerEvents: 'auto',
        animation: 'overlay-fade 0.2s ease both',
      }}
      onClick={onClose}
    >
      <div
        style={{
          ...glassPanel,
          borderRadius: 16,
          width: 'min(500px, 92vw)',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: `0 18px 40px ${withAlpha(theme.colors.background, 0.8)}`,
          border: `1px solid ${withAlpha(theme.colors.accent, 0.3)}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: `1px solid ${glass.border}` }}>
          <span style={{ color: theme.colors.accent, display: 'flex' }}>
            <BrainIcon size={24} />
          </span>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5, color: theme.colors.textPrimary }}>
            Battle Intel
          </h2>
          <button
            type="button"
            className="hud-btn"
            onClick={onClose}
            aria-label="Close intel"
            title="Close intel"
            style={{
              marginLeft: 'auto',
              background: 'transparent',
              border: 'none',
              color: theme.colors.textMuted,
              cursor: 'pointer',
              padding: 4,
            }}
          >
            <SkullIcon size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', padding: '12px 20px 0', gap: 16 }}>
          <button
            type="button"
            className="hud-btn"
            onClick={() => setTab('heroes')}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: `2px solid ${tab === 'heroes' ? theme.colors.accent : 'transparent'}`,
              color: tab === 'heroes' ? theme.colors.accent : theme.colors.textMuted,
              padding: '0 4px 8px',
              fontSize: 13,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: 1,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            Allies ({heroes.length})
          </button>
          <button
            type="button"
            className="hud-btn"
            onClick={() => setTab('enemies')}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: `2px solid ${tab === 'enemies' ? theme.colors.danger : 'transparent'}`,
              color: tab === 'enemies' ? theme.colors.danger : theme.colors.textMuted,
              padding: '0 4px 8px',
              fontSize: 13,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: 1,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            Horde ({enemies.reduce((acc, e) => acc + e.count, 0)})
          </button>
        </div>

        {/* Content Scroll Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {tab === 'heroes' && (
            heroes.length === 0 ? (
              <div style={{ textAlign: 'center', color: theme.colors.textMuted, padding: '32px 0', fontSize: 13 }}>
                No allies deployed yet.
              </div>
            ) : (
              heroes.map((h, i) => {
                const def = HERO_DEFINITIONS[h.id as keyof typeof HERO_DEFINITIONS];
                if (!def) return null;
                const activePassive = h.passiveOverride ? HERO_DEFINITIONS[h.passiveOverride as keyof typeof HERO_DEFINITIONS]?.passive : def.passive;
                return (
                  <div key={`${h.id}-${i}`} style={{ ...glassPanel, padding: 16, borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: theme.colors.textPrimary }}>{def.name}</div>
                        <div style={{ fontSize: 11, color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>{def.profession}</div>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 800, color: theme.colors.accent, padding: '2px 6px', borderRadius: 6, border: `1px solid ${glass.border}` }}>
                        {def.damageType}
                      </span>
                    </div>
                    {activePassive && (
                      <div style={{ fontSize: 12, color: theme.colors.textPrimary, marginTop: 4 }}>
                        <span style={{ color: theme.colors.accent, fontWeight: 700 }}>Passive: </span>
                        {activePassive.name} — <span style={{ color: theme.colors.textMuted }}>{activePassive.description}</span>
                      </div>
                    )}
                    <div style={{ fontSize: 12, color: theme.colors.textPrimary }}>
                      <span style={{ color: '#facc15', fontWeight: 700 }}>Skill: </span>
                      {def.signatureSkill.name} — <span style={{ color: theme.colors.textMuted }}>{def.signatureSkill.description}</span>
                    </div>
                  </div>
                );
              })
            )
          )}

          {tab === 'enemies' && (
            enemies.length === 0 ? (
              <div style={{ textAlign: 'center', color: theme.colors.textMuted, padding: '32px 0', fontSize: 13 }}>
                The streets are clear.
              </div>
            ) : (
              enemies.map(e => {
                const def = ENEMY_DEFINITIONS[e.id as keyof typeof ENEMY_DEFINITIONS];
                if (!def) return null;
                return (
                  <div key={e.id} style={{ ...glassPanel, padding: 16, borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 8, border: `1px solid ${withAlpha(theme.colors.danger, 0.2)}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: theme.colors.danger }}>{def.name}</div>
                      <span style={{ fontSize: 12, fontWeight: 800, color: theme.colors.textPrimary, padding: '2px 8px', borderRadius: 999, backgroundColor: withAlpha(theme.colors.danger, 0.2) }}>
                        x{e.count}
                      </span>
                    </div>
                    
                    {def.stealth && <div style={{ fontSize: 12, color: theme.colors.textPrimary }}><span style={{ fontWeight: 700, color: '#a78bfa' }}>Stealth:</span> <span style={{ color: theme.colors.textMuted }}>Invisible to most heroes.</span></div>}
                    {def.barrierDamageMultiplier && <div style={{ fontSize: 12, color: theme.colors.textPrimary }}><span style={{ fontWeight: 700, color: theme.colors.danger }}>Breacher:</span> <span style={{ color: theme.colors.textMuted }}>Deals massive damage to the barricade.</span></div>}
                    {def.moraleAura && <div style={{ fontSize: 12, color: theme.colors.textPrimary }}><span style={{ fontWeight: 700, color: '#f97316' }}>Morale Aura:</span> <span style={{ color: theme.colors.textMuted }}>Boosts speed of nearby enemies.</span></div>}
                    {def.fakeHpPadding && <div style={{ fontSize: 12, color: theme.colors.textPrimary }}><span style={{ fontWeight: 700, color: '#818cf8' }}>Fake HP:</span> <span style={{ color: theme.colors.textMuted }}>Protected by a huge shield of red tape.</span></div>}
                    {def.tauntAura && <div style={{ fontSize: 12, color: theme.colors.textPrimary }}><span style={{ fontWeight: 700, color: '#0f172a' }}>Taunt:</span> <span style={{ color: theme.colors.textMuted }}>Forces nearby heroes to attack them.</span></div>}
                    {def.activeSkill && <div style={{ fontSize: 12, color: theme.colors.textPrimary }}><span style={{ fontWeight: 700, color: '#facc15' }}>Skill ({def.activeSkill.name}):</span> <span style={{ color: theme.colors.textMuted }}>Dangerous active ability.</span></div>}
                    
                    {!def.stealth && !def.barrierDamageMultiplier && !def.moraleAura && !def.fakeHpPadding && !def.tauntAura && !def.activeSkill && (
                      <div style={{ fontSize: 12, color: theme.colors.textMuted }}>Standard anomaly.</div>
                    )}
                  </div>
                );
              })
            )
          )}
        </div>
      </div>
    </div>
  );
}
