import type { CSSProperties, ReactNode } from 'react';
import { HERO_DEFINITIONS, type HeroId, ATTACK_STYLE_BADGES } from '../../game/data/heroes';
import { metersLabel } from '../../game/data/constants';
import { hexColor, SkinPortrait } from './ArchiveCards';
import { getSelectedSkin } from '../../game/data/skinSelection';

interface HeroTcgCardProps {
  heroId: HeroId;
  style?: CSSProperties;
  rotation?: number;
  /** Level-scaled damage to show instead of the base (metaState hero level). */
  damageOverride?: number;
  /** 'full' (default) = the complete info card; 'compact' = art + name strip for grids. */
  variant?: 'full' | 'compact';
  /** Compact only: makes the card clickable with button semantics. */
  onClick?: () => void;
  /** Compact only: accessible label when clickable. */
  ariaLabel?: string;
  /** Compact only: absolute overlay slot (badges, ribbons) rendered above the foil. */
  children?: ReactNode;
}

export function HeroTcgCard({
  heroId,
  style,
  rotation = 0,
  damageOverride,
  variant = 'full',
  onClick,
  ariaLabel,
  children,
}: HeroTcgCardProps) {
  const def = HERO_DEFINITIONS[heroId];
  if (!def) return null;
  const shownDamage = damageOverride ?? def.damage;

  const color = hexColor(def.color);
  const skin = getSelectedSkin(def.id);
  const attackBadge = ATTACK_STYLE_BADGES[def.attackStyle];

  if (variant === 'compact') {
    const interactive = !!onClick;
    return (
      <div
        onClick={() => interactive && onClick!()}
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        aria-label={interactive ? ariaLabel ?? `View ${def.name}` : undefined}
        onKeyDown={(e) => {
          if (interactive && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onClick!();
          }
        }}
        style={{
          width: '100%',
          aspectRatio: '63 / 88',
          boxSizing: 'border-box',
          borderRadius: 10,
          padding: 4,
          background: 'linear-gradient(145deg, #1c1917, #09090b)',
          border: '2px solid #3f3f46',
          boxShadow: `0 6px 14px rgba(0,0,0,0.7), 0 0 8px ${color}40`,
          display: 'flex',
          position: 'relative',
          overflow: 'hidden',
          transform: `rotate(${rotation}deg)`,
          color: '#fafaf9',
          fontFamily: '"Inter", "Roboto", system-ui, sans-serif',
          cursor: interactive ? 'pointer' : 'default',
          transition: 'transform 0.15s, box-shadow 0.15s',
          ...style,
        }}
        onMouseOver={(e) => {
          if (interactive) {
            e.currentTarget.style.transform = 'scale(1.05) rotate(0deg)';
            e.currentTarget.style.zIndex = '10';
          }
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = `scale(1) rotate(${rotation}deg)`;
          e.currentTarget.style.zIndex = '1';
        }}
      >
        {/* Art fills the frame — center crop so the subject stays in view at grid size. */}
        <div
          style={{
            flex: 1,
            borderRadius: 6,
            overflow: 'hidden',
            position: 'relative',
            background: `radial-gradient(circle at 50% 30%, ${color}40 0%, #09090b 80%)`,
          }}
        >
          <SkinPortrait skin={skin} alt={def.name} style={{ objectFit: 'cover', objectPosition: 'center' }} />
          {/* Name strip */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              padding: '12px 4px 3px',
              background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.88) 45%)',
              fontSize: 9,
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: 0.3,
              textAlign: 'center',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              zIndex: 10,
            }}
          >
            {def.name}
          </div>
        </div>
        {/* Foil Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(115deg, transparent 20%, rgba(234,88,12,0.15) 35%, rgba(234,88,12,0.05) 45%, transparent 60%)',
            pointerEvents: 'none',
            zIndex: 50,
            mixBlendMode: 'screen',
          }}
        />
        {children && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 60, pointerEvents: 'none' }}>{children}</div>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        width: 300,
        borderRadius: 16,
        padding: 12,
        // Charred/rusted post-apocalyptic base
        background: `linear-gradient(145deg, #1c1917, #09090b)`,
        border: `2px solid #3f3f46`,
        boxShadow: `0 20px 40px rgba(0,0,0,0.8), inset 0 0 4px rgba(255,255,255,0.1), 0 0 15px ${color}40`,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transform: `rotate(${rotation}deg)`,
        color: '#fafaf9',
        overflow: 'hidden',
        fontFamily: '"Inter", "Roboto", system-ui, sans-serif',
        ...style
      }}
    >
      {/* Foil Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(115deg, transparent 20%, rgba(234,88,12,0.15) 35%, rgba(234,88,12,0.05) 45%, transparent 60%)',
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
            color: '#fafaf9',
          }}>
            {def.name}
          </h2>
          <div style={{ fontSize: 10, fontWeight: 800, color: '#a8a29e', textTransform: 'uppercase' }}>
            {def.profession}
          </div>
        </div>
        
        {/* Damage Type Badge */}
        <div style={{
          backgroundColor: '#09090b',
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

      {/* Portrait Box — top-anchored so the hero's face is always in frame. */}
      <div style={{
        width: '100%',
        height: 220,
        backgroundColor: '#18181b',
        border: '3px solid #27272a',
        borderRadius: 4,
        boxShadow: `0 8px 16px rgba(0,0,0,0.4), inset 0 0 20px ${color}40`,
        marginBottom: 12,
        position: 'relative',
        overflow: 'hidden',
        background: `radial-gradient(circle at 50% 30%, ${color}40 0%, #09090b 80%)`,
        zIndex: 10
      }}>
        <SkinPortrait skin={skin} alt={def.name} style={{ objectFit: 'cover', objectPosition: 'center top' }} />
      </div>

      {/* Basic Stats row */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        backgroundColor: '#09090b',
        padding: '6px 12px',
        borderRadius: 4,
        border: '1px solid #3f3f46',
        fontSize: 12, 
        fontWeight: 800, 
        color: '#fafaf9', 
        marginBottom: 10,
        zIndex: 10
      }}>
        <span>DMG: <span style={{color: '#facc15'}}>{shownDamage}</span></span>
        <span>SPD: <span style={{color: '#38bdf8'}}>{(def.attackRateMs / 1000).toFixed(1)}s</span></span>
        <span>RNG: <span style={{color: '#ef4444'}}>{metersLabel(def.range)}</span></span>
      </div>

      {/* Mechanic/Description Box (The "Text Box") */}
      <div style={{
        backgroundColor: '#18181b',
        border: '2px solid #3f3f46',
        borderRadius: 4,
        padding: 10,
        fontSize: 12,
        color: '#fafaf9',
        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5)',
        flexGrow: 1,
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #3f3f46', paddingBottom: 4, marginBottom: 6 }}>
          <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: '#a8a29e' }}>
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
            color: '#78716c', 
            marginBottom: 8, 
            paddingBottom: 6, 
            borderBottom: '1px dashed #3f3f46' 
          }}>
            "{def.purpose}"
          </div>
        )}

        {/* Skills */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexGrow: 1 }}>
          <div style={{ fontSize: 11 }}>
            <span style={{ fontWeight: 900, color: '#ea580c' }}>SKILL: </span>
            <span style={{ fontWeight: 800 }}>{def.signatureSkill.name}</span>
            <div style={{ marginTop: 2, fontSize: 10, color: '#a8a29e', lineHeight: 1.2 }}>
              {def.signatureSkill.description}
            </div>
          </div>
          
          {def.passive && (
            <div style={{ fontSize: 11, borderTop: '1px solid #3f3f46', paddingTop: 6 }}>
              <span style={{ fontWeight: 900, color: '#4ade80' }}>PASSIVE: </span>
              <span style={{ fontWeight: 800 }}>{def.passive.name}</span>
              <div style={{ marginTop: 2, fontSize: 10, color: '#a8a29e', lineHeight: 1.2 }}>
                {def.passive.description}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
