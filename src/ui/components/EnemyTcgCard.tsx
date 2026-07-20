import type { CSSProperties, ReactNode } from 'react';
import { SkullIcon } from '../icons';
import { ENEMY_DEFINITIONS, type EnemyDefinition, type EnemyId } from '../../game/data/enemies';
import { enemyTier, TIER_COLOR, hexColor, TYPEWRITER_FONT } from './ArchiveCards';
import { metersPerSecondLabel } from '../../game/data/constants';

function getPassivesText(def: EnemyDefinition): string[] {
  const passives: string[] = [];
  if (def.stealth) passives.push('Untargetable until revealed or splashed.');
  if (def.moraleAura) passives.push('Buffs nearby anomalies with a morale aura.');
  if (def.fakeHpPadding) passives.push('Padded with fake HP — popped by an Audit.');
  if (def.splitOnDeathCount) passives.push(`Shatters into ${def.splitOnDeathCount} on death.`);
  if (def.tauntAura) passives.push('Redirects your projectiles onto itself.');
  if (def.dropObstacleOnDeath) passives.push('Drops a barricade blocking your shots on death.');
  if (def.barrierDamageMultiplier) passives.push(`Tears through barricades ${def.barrierDamageMultiplier}× faster.`);
  if (def.knockbackPulseCooldown) passives.push('Shoves your frontline back down the path.');
  if (def.hitImmunityCount) passives.push(`Shrugs off its first ${def.hitImmunityCount} hits.`);
  if (def.stealVoicesPerSecond) passives.push('Drains your Voices while it lives.');
  if (def.budgetCut) passives.push('Disables the active skill of a random Hero while alive.');
  if (def.privatePropertyStun) passives.push('Evicts a random hero and replaces them with a Private Property sign.');
  if (def.evasionChance) passives.push(`Has a ${(def.evasionChance * 100).toFixed(0)}% chance to evade attacks.`);
  if (def.selfDestructOnBarrier) passives.push('Self-destructs on the barrier for massive damage.');
  
  if (passives.length === 0) {
    if (def.maxHp >= 140 && def.speed <= 45) passives.push('A slow, bloated tank of a lie.');
    else if (def.speed >= 100) passives.push('Fast — rushes the Barrier before you can react.');
    else passives.push('Swarms in raw numbers to drown out the rally.');
  }
  return passives;
}

const ACTIVE_SKILL_DESCRIPTIONS: Record<string, string> = {
  flood: 'Floods the path, causing all anomalies to surge forward with massive speed boosts.',
  devour: 'Devours uncollected gold on the field to permanently increase its own max HP.',
  summonSwarm: 'Continuously summons swarms of Troll Bots to overwhelm your defenses.',
  summonShieldbearer: 'Continuously summons Unqualified Relatives into the lane as meat shields.',
  sirenBurst: 'Emits siren bursts granting massive speed surges, ignoring slow effects.',
  smuggleHp: 'Smuggles massive amounts of stolen HP down the path while diverting attention.',
  economyHeist: 'Actively drains your ongoing Hope generation and economy.',
  scatterFakeGold: 'Scatters fake gold pickups that subtract from your actual economy if tapped.',
  resurrectAll: 'Resurrects lesser versions of defeated anomalies to fight alongside it.',
  fakeNewsBroadcast: 'Instantly blinds all heroes, causing their next attacks to miss 50% of the time.'
};

interface EnemyTcgCardProps {
  enemyId: EnemyId;
  style?: CSSProperties;
  rotation?: number;
  /** Sealed codex entries (`false`) render the redacted card back — no art, no name. */
  isFacedUp?: boolean;
  /** 'full' (default) = the complete info card; 'compact' = art + name strip for grids. */
  variant?: 'full' | 'compact';
  /** Compact only: makes the card clickable with button semantics (ignored while sealed). */
  onClick?: () => void;
  /** Compact only: accessible label when clickable. */
  ariaLabel?: string;
  /** Compact only: absolute overlay slot rendered above the foil. */
  children?: ReactNode;
}

export function EnemyTcgCard({
  enemyId,
  style,
  rotation = 0,
  isFacedUp = true,
  variant = 'full',
  onClick,
  ariaLabel,
  children,
}: EnemyTcgCardProps) {
  const def = ENEMY_DEFINITIONS[enemyId];
  if (!def) return null;

  const tier = enemyTier(def);
  const color = hexColor(def.color);
  const tierColor = TIER_COLOR[tier];

  const rank = tier === 'Boss' ? 'S' : tier === 'Mini-Boss' ? 'A' : (def.maxHp >= 60 ? 'B' : 'C');

  // In the future, this might point to a generated portrait image like `/assets/enemies/${enemyId}_portrait.png`
  const portraitUrl = `/assets/enemies/${enemyId}_portrait.png`;

  if (variant === 'compact') {
    const interactive = isFacedUp && !!onClick;
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
          background: 'linear-gradient(145deg, #1e1b4b, #0c0a09)',
          border: '2px solid #312e81',
          boxShadow: isFacedUp
            ? `0 6px 14px rgba(0,0,0,0.7), 0 0 8px ${color}40`
            : '0 6px 14px rgba(0,0,0,0.7)',
          display: 'flex',
          position: 'relative',
          overflow: 'hidden',
          transform: `rotate(${rotation}deg)`,
          color: '#f8fafc',
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
        {/* Art fills the frame — center crop; sealed entries show the redacted back. */}
        <div
          style={{
            flex: 1,
            borderRadius: 6,
            overflow: 'hidden',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: isFacedUp
              ? `radial-gradient(circle at 50% 40%, ${color} 0%, #020617 80%)`
              : 'radial-gradient(circle at 50% 40%, #334155 0%, #0c0a09 80%)',
          }}
        >
          {isFacedUp ? (
            <>
              <img
                src={portraitUrl}
                alt={def.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  if (e.currentTarget.nextSibling) {
                    (e.currentTarget.nextSibling as HTMLElement).style.display = 'flex';
                  }
                }}
              />
              {/* Fallback Icon */}
              <div style={{ display: 'none', color: '#e2e8f0', filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.5))' }}>
                <SkullIcon size={32} />
              </div>
              {/* Rank chip */}
              <div
                style={{
                  position: 'absolute',
                  top: 3,
                  right: 3,
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  backgroundColor: tierColor,
                  border: '1px solid #cbd5e1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 8,
                  fontWeight: 900,
                  color: '#fff',
                  textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.6)',
                  zIndex: 10,
                }}
              >
                {rank}
              </div>
            </>
          ) : (
            <span style={{ fontFamily: TYPEWRITER_FONT, fontSize: 24, fontWeight: 900, color: '#94a3b8' }}>?</span>
          )}
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
            {isFacedUp ? def.name : '██████'}
          </div>
        </div>
        {/* Glossy Foil Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(115deg, transparent 20%, rgba(139,92,246,0.15) 35%, rgba(139,92,246,0.05) 45%, transparent 60%)',
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
        // Metallic dark border with a bit of the unit's color mixed in
        background: `linear-gradient(145deg, #1e1b4b, #0c0a09)`,
        border: `2px solid #312e81`,
        boxShadow: `0 20px 40px rgba(0,0,0,0.8), inset 0 0 4px rgba(255,255,255,0.3), 0 0 15px ${color}40`,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transform: `rotate(${rotation}deg)`,
        color: '#f8fafc',
        overflow: 'hidden',
        fontFamily: '"Inter", "Roboto", system-ui, sans-serif',
        ...style
      }}
    >
      {/* Glossy Foil Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(115deg, transparent 20%, rgba(139,92,246,0.15) 35%, rgba(139,92,246,0.05) 45%, transparent 60%)',
        pointerEvents: 'none',
        zIndex: 50,
        mixBlendMode: 'screen',
      }} />

      {/* Holographic sparkle texture (subtle) */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        opacity: 0.3,
        pointerEvents: 'none',
        zIndex: 1,
      }} />

      {/* Card Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, zIndex: 10 }}>
        <h2 style={{ 
          margin: 0, 
          fontSize: 20, 
          fontWeight: 900, 
          textTransform: 'uppercase', 
          letterSpacing: 0.5,
          color: '#ffffff',
          textShadow: '1px 2px 4px rgba(0,0,0,0.8)'
        }}>
          {def.name}
        </h2>
        
        {/* Tier Badge / Element */}
        <div style={{
          backgroundColor: tierColor,
          width: 32,
          height: 32,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid #cbd5e1',
          boxShadow: '0 2px 8px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.5)',
          fontSize: 16,
          fontWeight: 900,
          color: '#fff',
          textShadow: '0 1px 2px rgba(0,0,0,0.8)'
        }}>
          {rank}
        </div>
      </div>

      {/* Portrait Box */}
      <div style={{
        width: '100%',
        height: 220,
        backgroundColor: '#000',
        border: '3px solid #312e81',
        borderRadius: 4,
        boxShadow: `0 8px 16px rgba(0,0,0,0.6), inset 0 0 30px rgba(55,20,60,0.9)`,
        marginBottom: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: `radial-gradient(circle at 50% 100%, ${color} 0%, #020617 80%)`,
        zIndex: 10
      }}>
        <img
          src={portraitUrl}
          alt={def.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            if (e.currentTarget.nextSibling) {
              (e.currentTarget.nextSibling as HTMLElement).style.display = 'flex';
            }
          }}
        />
        {/* Fallback Icon */}
        <div style={{ display: 'none', color: '#e2e8f0', zIndex: 1, filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.5))' }}>
          <SkullIcon size={80} />
        </div>
        
        {/* Inner portrait gloss */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 40%)',
          pointerEvents: 'none'
        }} />
      </div>

      {/* Basic Stats row */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: '6px 12px',
        borderRadius: 4,
        border: '1px solid rgba(255,255,255,0.1)',
        fontSize: 12, 
        fontWeight: 800, 
        color: '#e2e8f0', 
        marginBottom: 10,
        zIndex: 10
      }}>
        <span>HP: <span style={{color: '#facc15'}}>{def.maxHp.toLocaleString()}</span></span>
        <span>SPD: <span style={{color: '#38bdf8'}}>{metersPerSecondLabel(def.speed)}</span></span>
        <span>ATK: <span style={{color: '#ef4444'}}>{def.damage}</span></span>
      </div>

      {/* Mechanic/Description Box (The "Text Box") */}
      <div style={{
        backgroundColor: '#0c0a09',
        border: '2px solid #312e81',
        borderRadius: 4,
        padding: 10,
        fontSize: 13,
        color: '#e2e8f0',
        boxShadow: 'inset 0 0 30px rgba(55,20,60,0.5)',
        flexGrow: 1,
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: '#a8a29e', borderBottom: '1px solid #312e81', paddingBottom: 4, marginBottom: 6 }}>
          [ Rank {rank} Anomaly / {tier} ]
        </div>
        
        {/* Lore / Flavor Text */}
        {def.lore && (
          <div style={{ 
            fontStyle: 'italic', 
            fontSize: def.lore.length > 150 ? 9 : 11,
            lineHeight: 1.2,
            color: '#a8a29e', 
            marginBottom: 8, 
            paddingBottom: 6, 
            borderBottom: '1px dashed #312e81' 
          }}>
            "{def.lore}"
          </div>
        )}

        {/* Passives */}
        <div style={{ lineHeight: 1.4, flexGrow: 1, fontWeight: 600 }}>
          {getPassivesText(def).map((text, i) => <div key={i} style={{ marginBottom: 4 }}>• {text}</div>)}
        </div>
        
        {/* Active Skill */}
        {def.activeSkill && (
          <div style={{ marginTop: 8, borderTop: '1px solid #312e81', paddingTop: 6, fontSize: 12 }}>
            <span style={{ fontWeight: 900, color: '#ea580c' }}>ACTV: </span>
            <span style={{ fontWeight: 800 }}>{def.activeSkill.name}</span>
            <div style={{ marginTop: 2, fontSize: 11, color: '#a8a29e', lineHeight: 1.3 }}>
              {def.activeSkill.description || ACTIVE_SKILL_DESCRIPTIONS[def.activeSkill.effect]}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
