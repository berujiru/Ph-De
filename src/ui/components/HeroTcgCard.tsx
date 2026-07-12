import type { CSSProperties } from 'react';
import { HERO_DEFINITIONS, type HeroId, ATTACK_STYLE_BADGES } from '../../game/data/heroes';
import { metersLabel } from '../../game/data/constants';
import { hexColor, SkinPortrait } from './ArchiveCards';
import { getSelectedSkin } from '../../game/data/skinSelection';

interface HeroTcgCardProps {
  heroId: HeroId;
  style?: CSSProperties;
  rotation?: number;
}

export function HeroTcgCard({ heroId, style, rotation = 0 }: HeroTcgCardProps) {
  const def = HERO_DEFINITIONS[heroId];
  if (!def) return null;

  const color = hexColor(def.color);
  const skin = getSelectedSkin(def.id);
  const attackBadge = ATTACK_STYLE_BADGES[def.attackStyle];

  return (
    <div
      style={{
        width: 300,
        borderRadius: 16,
        padding: 12,
        // Metallic light border for heroes
        background: `linear-gradient(145deg, #f8fafc, #e2e8f0)`,
        border: `2px solid #cbd5e1`,
        boxShadow: `0 20px 40px rgba(0,0,0,0.5), inset 0 0 4px rgba(255,255,255,0.8), 0 0 15px ${color}40`,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transform: `rotate(${rotation}deg)`,
        color: '#0f172a',
        overflow: 'hidden',
        fontFamily: '"Inter", "Roboto", system-ui, sans-serif',
        ...style
      }}
    >
      {/* Foil Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(115deg, transparent 20%, rgba(255,255,255,0.6) 35%, rgba(255,255,255,0.2) 45%, transparent 60%)',
        pointerEvents: 'none',
        zIndex: 50,
        mixBlendMode: 'screen',
      }} />

      {/* Card Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, zIndex: 10 }}>
        <div>
          <h2 style={{ 
            margin: 0, 
            fontSize: 20, 
            fontWeight: 900, 
            textTransform: 'uppercase', 
            letterSpacing: 0.5,
            color: '#0f172a',
          }}>
            {def.name}
          </h2>
          <div style={{ fontSize: 10, fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
            {def.profession}
          </div>
        </div>
        
        {/* Damage Type Badge */}
        <div style={{
          backgroundColor: '#0f172a',
          padding: '4px 8px',
          borderRadius: 4,
          fontSize: 10,
          fontWeight: 900,
          color: '#fff',
          textTransform: 'uppercase',
          border: `1px solid ${color}`,
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          {def.damageType}
        </div>
      </div>

      {/* Portrait Box */}
      <div style={{
        width: '100%',
        height: 220,
        backgroundColor: '#f1f5f9',
        border: '3px solid #94a3b8',
        borderRadius: 4,
        boxShadow: `0 8px 16px rgba(0,0,0,0.2), inset 0 0 20px ${color}40`,
        marginBottom: 12,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: `radial-gradient(circle at 50% 100%, ${color} 0%, #cbd5e1 80%)`,
        zIndex: 10
      }}>
        <div style={{ 
          transform: 'scale(1.5) translateY(10px)', 
          transformOrigin: 'bottom center', 
          height: '100%',
          display: 'flex',
          alignItems: 'flex-end'
        }}>
           <SkinPortrait skin={skin} alt={def.name} />
        </div>
      </div>

      {/* Basic Stats row */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        backgroundColor: '#0f172a',
        padding: '6px 12px',
        borderRadius: 4,
        border: '1px solid rgba(0,0,0,0.1)',
        fontSize: 12, 
        fontWeight: 800, 
        color: '#f8fafc', 
        marginBottom: 10,
        zIndex: 10
      }}>
        <span>DMG: <span style={{color: '#facc15'}}>{def.damage}</span></span>
        <span>SPD: <span style={{color: '#38bdf8'}}>{(def.attackRateMs / 1000).toFixed(1)}s</span></span>
        <span>RNG: <span style={{color: '#ef4444'}}>{metersLabel(def.range)}</span></span>
      </div>

      {/* Mechanic/Description Box (The "Text Box") */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '2px solid #cbd5e1',
        borderRadius: 4,
        padding: 10,
        fontSize: 12,
        color: '#1e293b',
        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.05)',
        flexGrow: 1,
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #cbd5e1', paddingBottom: 4, marginBottom: 6 }}>
          <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: '#64748b' }}>
            [ {def.attackKind} • WPN: {def.attackArt ? def.attackArt.replace(/-/g, ' ') : 'Standard'} ]
          </div>
          <div style={{ 
            fontSize: 9, 
            fontWeight: 800, 
            backgroundColor: attackBadge.background, 
            color: '#fff', 
            padding: '2px 6px', 
            borderRadius: 4,
            textShadow: '0 1px 2px rgba(0,0,0,0.5)'
          }}>
            {attackBadge.label}
          </div>
        </div>
        
        {/* Lore / Flavor Text */}
        {def.purpose && (
          <div style={{ 
            fontStyle: 'italic', 
            fontSize: def.purpose.length > 150 ? 9 : 10,
            lineHeight: 1.2,
            color: '#475569', 
            marginBottom: 8, 
            paddingBottom: 6, 
            borderBottom: '1px dashed #cbd5e1' 
          }}>
            "{def.purpose}"
          </div>
        )}

        {/* Skills */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexGrow: 1 }}>
          <div style={{ fontSize: 11 }}>
            <span style={{ fontWeight: 900, color: '#0369a1' }}>SKILL: </span>
            <span style={{ fontWeight: 800 }}>{def.signatureSkill.name}</span>
            <div style={{ marginTop: 2, fontSize: 10, color: '#475569', lineHeight: 1.2 }}>
              {def.signatureSkill.description}
            </div>
          </div>
          
          {def.passive && (
            <div style={{ fontSize: 11, borderTop: '1px solid #e2e8f0', paddingTop: 6 }}>
              <span style={{ fontWeight: 900, color: '#15803d' }}>PASSIVE: </span>
              <span style={{ fontWeight: 800 }}>{def.passive.name}</span>
              <div style={{ marginTop: 2, fontSize: 10, color: '#475569', lineHeight: 1.2 }}>
                {def.passive.description}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
