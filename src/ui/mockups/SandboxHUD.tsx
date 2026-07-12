import { useState, useEffect } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { theme } from '../theme';
import { uiToGameEvents, gameToUiEvents } from '../../game/core/GameEvents';
import type { GameStateSnapshot } from '../../game/core/GameEvents';
import { HERO_DEFINITIONS, type HeroId } from '../../game/data/heroes';
import { ENEMY_DEFINITIONS, type EnemyId } from '../../game/data/enemies';
import {
  BackIcon,
  LightningIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  SkullIcon,
  SpeedIcon,
  BrainIcon,
} from '../icons';
import { battleCss, fab, glass, glassPanel, glassSelect, withAlpha } from './battleStyles';
import { IntelModal } from '../components/IntelModal';

interface SandboxHUDProps {
  onReturnToMenu: () => void;
}

const sectionLabel: CSSProperties = {
  fontSize: 9,
  fontWeight: 800,
  letterSpacing: 1.5,
  textTransform: 'uppercase',
  color: theme.colors.textMuted,
};

const actionBtn: CSSProperties = {
  flex: 1,
  minHeight: 44,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  padding: '0 12px',
  borderRadius: 10,
  border: 'none',
  fontSize: 12,
  fontWeight: 700,
  cursor: 'pointer',
};

/** Solid accent action — primary "do it" buttons in the rig. */
const primaryBtn: CSSProperties = {
  ...fab,
  borderRadius: 8,
  width: 'auto',
  height: 32,
  padding: '0 12px',
  backgroundColor: theme.colors.accent,
  color: theme.colors.background,
  boxShadow: `0 0 12px ${withAlpha(theme.colors.accent, 0.4)}`,
};

/** Outlined accent action — secondary triggers. */
const secondaryBtn: CSSProperties = {
  ...actionBtn,
  backgroundColor: 'transparent',
  border: `1px solid ${withAlpha(theme.colors.accent, 0.6)}`,
  color: theme.colors.accent,
};

/** Outlined danger action — harmful/test-damage controls. */
const dangerBtn: CSSProperties = {
  ...actionBtn,
  backgroundColor: 'transparent',
  border: `1px solid ${withAlpha(theme.colors.danger, 0.6)}`,
  color: theme.colors.danger,
};

function RigSection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ ...glassPanel, padding: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={sectionLabel}>{label}</span>
      {children}
    </div>
  );
}

export function SandboxHUD({ onReturnToMenu }: SandboxHUDProps) {
  const [selectedHero, setSelectedHero] = useState<string>('eden');
  const [selectedHeroPassive, setSelectedHeroPassive] = useState<string>('none');
  const [selectedHeroSkill, setSelectedHeroSkill] = useState<string>('none');
  const [selectedEnemy, setSelectedEnemy] = useState<string>('grunt');
  const [selectedPassive, setSelectedPassive] = useState<string>('none');
  const [selectedSkill, setSelectedSkill] = useState<string>('none');
  const [selectedAilment, setSelectedAilment] = useState<string>('poison');
  const [gameSpeed, setGameSpeed] = useState<number>(1);
  const [intelOpen, setIntelOpen] = useState(false);
  const [rigOpen, setRigOpen] = useState(false);
  const [gameState, setGameState] = useState<GameStateSnapshot | null>(null);

  useEffect(() => {
    const unsub = gameToUiEvents.on('stateChanged', (snapshot) => {
      setGameState(snapshot);
    });
    return () => unsub();
  }, []);

  const playBtnSound = () => uiToGameEvents.emit('playSound', { key: 'sfx-btn-press' });

  const handleSetSpeed = (speed: number) => {
    setGameSpeed(speed);
    uiToGameEvents.emit('setSpeed', { speed });
    playBtnSound();
  };

  const handleSpawnDummy = () => {
    uiToGameEvents.emit('debugSpawn', {
      heroId: selectedHero || undefined,
      passive: selectedHeroPassive === 'none' ? undefined : selectedHeroPassive,
      skill: selectedHeroSkill === 'none' ? undefined : selectedHeroSkill,
    });
    playBtnSound();
  };

  const handleTriggerHeroSkill = () => {
    uiToGameEvents.emit('triggerHeroSkill', {
      skill: selectedHeroSkill === 'none' ? undefined : selectedHeroSkill,
    });
    playBtnSound();
  };

  const handleSpawnTarget = () => {
    uiToGameEvents.emit('spawnSandboxTarget', undefined);
    playBtnSound();
  };

  const handleApplyAilment = () => {
    uiToGameEvents.emit('applySandboxAilment', { ailment: selectedAilment, amount: 35 });
    playBtnSound();
  };

  const handleSpawnSpecificEnemy = () => {
    uiToGameEvents.emit('spawnSpecificEnemy', {
      enemyId: selectedEnemy,
      passive: selectedPassive === 'none' ? undefined : selectedPassive,
      skill: selectedSkill === 'none' ? undefined : selectedSkill,
    });
    playBtnSound();
  };

  const handleTriggerEnemySkill = () => {
    uiToGameEvents.emit('triggerEnemySkill', undefined);
    playBtnSound();
  };

  const realHeroes = Object.entries(HERO_DEFINITIONS).filter(([id]) => !id.startsWith('sandbox_'));
  const sandboxHeroes = Object.entries(HERO_DEFINITIONS).filter(([id]) => id.startsWith('sandbox_'));

  const speedFab = (speed: number, label: string, icon: ReactNode): ReactNode => (
    <button
      type="button"
      className="hud-btn"
      onClick={() => handleSetSpeed(speed)}
      aria-pressed={gameSpeed === speed}
      aria-label={label}
      title={label}
      style={{
        ...fab,
        color: gameSpeed === speed ? theme.colors.background : theme.colors.textPrimary,
        backgroundColor: gameSpeed === speed ? theme.colors.accent : glass.surface,
        border: `1px solid ${gameSpeed === speed ? theme.colors.accent : glass.border}`,
        boxShadow: gameSpeed === speed ? `0 0 12px ${withAlpha(theme.colors.accent, 0.5)}` : undefined,
      }}
    >
      {icon}
    </button>
  );

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <style>{battleCss}</style>

      {/* Top-left: sandbox placard */}
      <div style={{ position: 'absolute', top: 12, left: 12, pointerEvents: 'auto' }}>
        <div style={{ ...glassPanel, padding: '10px 14px', transform: 'rotate(-1deg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h2
              style={{
                margin: 0,
                fontSize: 15,
                fontWeight: 900,
                letterSpacing: 1.5,
                textTransform: 'uppercase',
                color: theme.colors.accent,
              }}
            >
              Attack Sandbox
            </h2>
            <span
              style={{
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: 1,
                padding: '2px 6px',
                borderRadius: 6,
                border: `1px solid ${glass.border}`,
                color: theme.colors.textMuted,
              }}
            >
              DEV
            </span>
          </div>
          <div style={{ fontSize: 11, color: theme.colors.textMuted, marginTop: 2 }}>
            Wave mechanics disabled.
          </div>
          
          <div style={{ display: 'flex', gap: 6, marginTop: 8, pointerEvents: 'auto' }}>
            {speedFab(0, 'Pause', <PauseIcon size={16} />)}
            {speedFab(1, 'Normal speed', <PlayIcon size={16} />)}
            {speedFab(2, 'Fast forward', <SpeedIcon size={16} />)}
          </div>
        </div>
      </div>

      {/* Toggle button — always visible */}
      <button
        type="button"
        className="hud-btn"
        onClick={() => { setRigOpen((v) => !v); playBtnSound(); }}
        aria-label={rigOpen ? 'Close sandbox rig' : 'Open sandbox rig'}
        title={rigOpen ? 'Close rig' : 'Open rig'}
        style={{
          ...fab,
          position: 'absolute',
          top: 12,
          right: 12,
          pointerEvents: 'auto',
          zIndex: 20,
          width: 36,
          height: 36,
          backgroundColor: rigOpen ? theme.colors.accent : glass.surface,
          color: rigOpen ? theme.colors.background : theme.colors.accent,
          border: `1px solid ${rigOpen ? theme.colors.accent : glass.border}`,
          boxShadow: rigOpen ? `0 0 14px ${withAlpha(theme.colors.accent, 0.5)}` : `0 4px 16px rgba(0,0,0,0.4)`,
          fontSize: 18,
          transition: 'background-color 0.15s, color 0.15s',
        }}
      >
        {rigOpen ? '✕' : '⚙'}
      </button>

      {/* Right rail: floating rig sections — toggleable */}
      {rigOpen && (
        <div
          style={{
            position: 'absolute',
            top: 56,
            right: 12,
            bottom: 52,
            width: 'min(240px, 62vw)',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            overflowY: 'auto',
            pointerEvents: 'auto',
          }}
        >
          <RigSection label="Hero Rig">
            <select
              value={selectedHero}
              onChange={(e) => {
                const id = e.target.value;
                setSelectedHero(id);
                if (HERO_DEFINITIONS[id as HeroId]?.passive) setSelectedHeroPassive(id);
                if (HERO_DEFINITIONS[id as HeroId]?.signatureSkill) setSelectedHeroSkill(id);
              }}
              aria-label="Hero to spawn"
              style={glassSelect}
            >
              <optgroup label="Real Heroes">
                {realHeroes.map(([id, def]) => (
                  <option key={id} value={id}>
                    {def.name} ({def.attackStyle})
                  </option>
                ))}
              </optgroup>
              <optgroup label="Test Mocks">
                {sandboxHeroes.map(([id, def]) => (
                  <option key={id} value={id}>
                    {def.attackStyle.toUpperCase()}
                  </option>
                ))}
              </optgroup>
            </select>

            <select
              value={selectedHeroPassive}
              onChange={(e) => setSelectedHeroPassive(e.target.value)}
              aria-label="Hero passive override"
              style={glassSelect}
            >
              <option value="none">No Passive Override</option>
              {realHeroes.map(([id, def]) => (
                <option key={id} value={id}>
                  {def.passive?.name} ({def.name})
                </option>
              ))}
            </select>

            <select
              value={selectedHeroSkill}
              onChange={(e) => setSelectedHeroSkill(e.target.value)}
              aria-label="Hero skill override"
              style={glassSelect}
            >
              <option value="none">No Skill Override</option>
              {realHeroes.map(([id, def]) => (
                <option key={id} value={id}>
                  {def.signatureSkill.name} ({def.name})
                </option>
              ))}
            </select>

            <div style={{ display: 'flex', gap: 6 }}>
              <button type="button" className="hud-btn" onClick={handleSpawnDummy} style={primaryBtn}>
                <PlusIcon size={14} />
                Spawn
              </button>
              <button type="button" className="hud-btn" onClick={handleTriggerHeroSkill} style={secondaryBtn}>
                <LightningIcon size={14} />
                Skill
              </button>
            </div>
          </RigSection>

          <RigSection label="Anomaly Rig">
            <select
              value={selectedEnemy}
              onChange={(e) => {
                const newId = e.target.value;
                setSelectedEnemy(newId);
                const def = ENEMY_DEFINITIONS[newId as EnemyId];
                if (def) {
                   if (def.stealth) setSelectedPassive('stealth');
                   else if (def.barrierDamageMultiplier) setSelectedPassive('barrierShred');
                   else if (def.moraleAura) setSelectedPassive('moraleAura');
                   else if (def.fakeHpPadding) setSelectedPassive('fakeHp');
                   else if (def.stealVoicesPerSecond) setSelectedPassive('stealVoices');
                   else if (def.splitOnDeathCount) setSelectedPassive('splitOnDeath');
                   else if (def.tauntAura) setSelectedPassive('taunt');
                   else if (def.dropObstacleOnDeath) setSelectedPassive('dropObstacle');
                   else if (def.knockbackPulseCooldown) setSelectedPassive('knockback');
                   else if (def.hitImmunityCount) setSelectedPassive('hitImmunity');
                   else setSelectedPassive('none');

                   if (def.activeSkill) setSelectedSkill(def.activeSkill.effect);
                   else setSelectedSkill('none');
                }
              }}
              aria-label="Anomaly to spawn"
              style={glassSelect}
            >
              <option value="grunt">Grunt</option>
              <option value="runner">Runner</option>
              <option value="brute">Brute</option>
              <option value="ghost_employee">Ghost Employee (Stealth)</option>
              <option value="epal">Epal (Morale Aura)</option>
              <option value="crony_bodyguard">Crony (Taunt)</option>
              <option value="hoarder">Hoarder (Obstacle Drop)</option>
              <option value="bribery">Bribery (Budget Cut)</option>
              <option value="land_grabber">Land Grabber (Knockback)</option>
              <option value="red_tape">Red Tape (Taunt)</option>
              <option value="boss_flood_control">Ghost Flood Control</option>
              <option value="boss_pork_barrel">Pork Barrel</option>
              <option value="boss_troll_farm">Troll Farm</option>
              <option value="boss_vote_buying">Vote Buying</option>
              <option value="boss_nepotism">Nepotism</option>
              <option value="boss_wang_wang">Wang-Wang</option>
              <option value="boss_budget_insertion">Budget Insertion</option>
              <option value="boss_smuggling">Smuggling</option>
              <option value="boss_dynasty_1">The Dynasty (Bruiser)</option>
              <option value="boss_ang_sistema">Ang Sistema</option>
            </select>

            <select
              value={selectedPassive}
              onChange={(e) => setSelectedPassive(e.target.value)}
              aria-label="Anomaly passive override"
              style={glassSelect}
            >
              <option value="none">No Passive</option>
              <option value="stealth">Stealth</option>
              <option value="barrierShred">Barrier Shred (x10)</option>
              <option value="moraleAura">Morale Aura</option>
              <option value="fakeHp">Fake HP (150)</option>
              <option value="stealVoices">Steal Voices</option>
              <option value="splitOnDeath">Split On Death (x3)</option>
              <option value="taunt">Taunt Aura</option>
              <option value="dropObstacle">Drop Obstacle</option>
              <option value="knockback">Knockback Pulse</option>
              <option value="hitImmunity">Hit Immunity (5)</option>
            </select>

            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              aria-label="Anomaly skill override"
              style={glassSelect}
            >
              <option value="none">No Skill</option>
              <option value="flood">Flood</option>
              <option value="devour">Devour</option>
              <option value="fakeNewsBroadcast">Fake News Broadcast</option>
              <option value="summonSwarm">Deploy Trolls (Legacy)</option>
              <option value="summonShieldbearer">Appoint Shieldbearer</option>
              <option value="scatterFakeGold">Bribe (Fake Gold)</option>
              <option value="smuggleHp">Smuggle Funds (HP)</option>
              <option value="economyHeist">Economy Heist</option>
              <option value="sirenBurst">VIP Convoy (Siren)</option>
              <option value="resurrectAll">Horde Convergence</option>
            </select>

            <div style={{ display: 'flex', gap: 6 }}>
              <button type="button" className="hud-btn" onClick={handleSpawnSpecificEnemy} style={primaryBtn}>
                <PlusIcon size={14} />
                Spawn
              </button>
              <button type="button" className="hud-btn" onClick={handleTriggerEnemySkill} style={secondaryBtn}>
                <LightningIcon size={14} />
                Skill
              </button>
            </div>

            <button type="button" className="hud-btn" onClick={handleSpawnTarget} style={dangerBtn}>
              <SkullIcon size={14} />
              Drop Punching Bag
            </button>
          </RigSection>

          <RigSection label="Ailment Rig">
            <div style={{ display: 'flex', gap: 6 }}>
              <select
                value={selectedAilment}
                onChange={(e) => setSelectedAilment(e.target.value)}
                aria-label="Ailment to apply"
                style={{ ...glassSelect, flex: 1, minWidth: 0 }}
              >
                <option value="poison">Poison</option>
                <option value="burn">Burn</option>
                <option value="freeze">Freeze</option>
                <option value="stun">Stun</option>
                <option value="slow">Slow</option>
                <option value="wet">Wet</option>
                <option value="bleed">Bleed</option>
                <option value="rot">Rot</option>
                <option value="sleep">Sleep</option>
                <option value="curse">Curse</option>
                <option value="knockback">Knockback</option>
                <option value="armorShred">Armor Shred</option>
              </select>
              <button type="button" className="hud-btn" onClick={handleApplyAilment} style={{ ...dangerBtn, flex: 'none' }}>
                +35%
              </button>
            </div>
          </RigSection>
        </div>
      )}

      {/* ---------- Right Side: Skill Queue ---------- */}
      <div
        style={{
          position: 'absolute',
          right: 12,
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          pointerEvents: 'auto',
          zIndex: 50,
        }}
      >
        {gameState?.activeHeroes.filter(h => h.isSkillReady).map(hero => {
           const def = HERO_DEFINITIONS[hero.id as HeroId];
           if (!def) return null;
           const shortName = def.signatureSkill.shortName || def.signatureSkill.name.split(' ')[0];
           return (
             <button
               key={hero.id}
               type="button"
               className="hud-btn"
               onClick={() => {
                 if (gameState?.skillsLocked) return;
                 playBtnSound();
                 uiToGameEvents.emit('queueHeroSkill', { heroId: hero.id });
               }}
               style={{
                 width: 64,
                 height: 64,
                 borderRadius: '50%',
                 backgroundColor: 'rgba(15, 23, 42, 0.9)',
                 boxShadow: gameState?.skillsLocked ? 'none' : '0 4px 6px rgba(0,0,0,0.3)',
                 border: gameState?.skillsLocked ? '2px solid rgba(255,255,255,0.8)' : `3px solid #ef4444`,
                 color: '#facc15',
                 display: 'flex',
                 flexDirection: 'column',
                 alignItems: 'center',
                 justifyContent: 'center',
                 animation: gameState?.skillsLocked ? 'none' : 'pulse-glow 1.5s infinite',
                 cursor: gameState?.skillsLocked ? 'default' : 'pointer',
                 overflow: 'hidden',
                 padding: 4,
                 opacity: gameState?.skillsLocked ? 0.4 : 1,
                 filter: gameState?.skillsLocked ? 'grayscale(100%)' : 'none'
               }}
             >
                <span style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', textAlign: 'center', lineHeight: 1.1, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                  {shortName}
                </span>
             </button>
           );
        })}
      </div>

      {/* Bottom-right: speed controls + intel + leave — always visible */}
      <div style={{
        position: 'absolute',
        bottom: 12,
        right: 12,
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap',
        justifyContent: 'flex-end',
        pointerEvents: 'auto',
      }}>
        {/* Speed controls moved to top-left */}

        <button
          type="button"
          className="hud-btn"
          onClick={() => setIntelOpen(true)}
          style={{
            ...actionBtn,
            ...glassPanel,
            flex: 'none',
            color: '#38bdf8',
          }}
        >
          <BrainIcon size={14} />
          Intel
        </button>

        <button
          type="button"
          className="hud-btn"
          onClick={() => {
            onReturnToMenu();
            playBtnSound();
          }}
          style={{
            ...actionBtn,
            ...glassPanel,
            flex: 'none',
            color: theme.colors.textPrimary,
          }}
        >
          <BackIcon size={14} />
          Leave
        </button>
      </div>
      
      {intelOpen && gameState && (
        <IntelModal
          heroes={gameState.activeHeroes || []}
          enemies={gameState.activeEnemies || []}
          onClose={() => setIntelOpen(false)}
        />
      )}
    </div>
  );
}
