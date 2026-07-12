import type { CSSProperties } from 'react';
import { SkullIcon } from '../icons';
import { ENEMY_DEFINITIONS, type EnemyDefinition, type EnemyId } from '../../game/data/enemies';
import { enemyTier, TIER_COLOR, hexColor } from './ArchiveCards';
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
  if (def.budgetCut) passives.push('Completely disables all Hero active skills while alive.');
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
  /** Whether the card is facing up. For flip animations if needed. */
  isFacedUp?: boolean;
}

export function EnemyTcgCard({ enemyId, style, rotation = 0 }: EnemyTcgCardProps) {
  const def = ENEMY_DEFINITIONS[enemyId];
  if (!def) return null;

  const tier = enemyTier(def);
  const color = hexColor(def.color);
  const tierColor = TIER_COLOR[tier];
  
  const rank = tier === 'Boss' ? 'S' : tier === 'Mini-Boss' ? 'A' : (def.maxHp >= 60 ? 'B' : 'C');

  // In the future, this might point to a generated portrait image like `/assets/enemies/${enemyId}_portrait.png`
  const portraitUrl = `/assets/enemies/${enemyId}_portrait.png`;

  return (
    <div
      style={{
        width: 300,
        borderRadius: 16,
        padding: 12,
        // Metallic dark border with a bit of the unit's color mixed in
        background: `linear-gradient(145deg, #334155, #0f172a)`,
        border: `2px solid #64748b`,
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
        background: 'linear-gradient(115deg, transparent 20%, rgba(255,255,255,0.4) 35%, rgba(255,255,255,0.1) 45%, transparent 60%)',
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
        border: '3px solid #94a3b8',
        borderRadius: 4,
        boxShadow: `0 8px 16px rgba(0,0,0,0.6), inset 0 0 20px ${color}80`,
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
        backgroundColor: 'rgba(241, 245, 249, 0.9)',
        border: '2px solid #cbd5e1',
        borderRadius: 4,
        padding: 10,
        fontSize: 13,
        color: '#1e293b',
        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.2)',
        flexGrow: 1,
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: '#64748b', borderBottom: '1px solid #cbd5e1', paddingBottom: 4, marginBottom: 6 }}>
          [ Rank {rank} Anomaly / {tier} ]
        </div>
        
        {/* Lore / Flavor Text */}
        {def.lore && (
          <div style={{ fontStyle: 'italic', fontSize: 11, color: '#475569', marginBottom: 8, paddingBottom: 6, borderBottom: '1px dashed #cbd5e1' }}>
            "{def.lore}"
          </div>
        )}

        {/* Passives */}
        <div style={{ lineHeight: 1.4, flexGrow: 1, fontWeight: 600 }}>
          {getPassivesText(def).map((text, i) => <div key={i} style={{ marginBottom: 4 }}>• {text}</div>)}
        </div>
        
        {/* Active Skill */}
        {def.activeSkill && (
          <div style={{ marginTop: 8, borderTop: '1px solid #cbd5e1', paddingTop: 6, fontSize: 12 }}>
            <span style={{ fontWeight: 900, color: '#b91c1c' }}>ACTV: </span>
            <span style={{ fontWeight: 800 }}>{def.activeSkill.name}</span>
            <div style={{ marginTop: 2, fontSize: 11, color: '#475569', lineHeight: 1.3 }}>
              {def.activeSkill.description || ACTIVE_SKILL_DESCRIPTIONS[def.activeSkill.effect]}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
