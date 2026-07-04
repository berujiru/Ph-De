import { useState } from 'react';
import { theme } from '../theme';
import { uiToGameEvents } from '../../game/core/GameEvents';
import { HERO_DEFINITIONS } from '../../game/data/balance';

interface SandboxHUDProps {
  onReturnToMenu: () => void;
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

  const handleSetSpeed = (speed: number) => {
    setGameSpeed(speed);
    uiToGameEvents.emit('setSpeed', { speed });
  };

  const handleSpawnDummy = () => {
    uiToGameEvents.emit('debugSpawn', { 
      heroId: selectedHero || undefined,
      passive: selectedHeroPassive === 'none' ? undefined : selectedHeroPassive,
      skill: selectedHeroSkill === 'none' ? undefined : selectedHeroSkill
    });
    playBtnSound();
  };

  const handleTriggerHeroSkill = () => {
    uiToGameEvents.emit('triggerHeroSkill', {
      skill: selectedHeroSkill === 'none' ? undefined : selectedHeroSkill
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

  const playBtnSound = () => {
    uiToGameEvents.emit('playSound', { key: 'sfx-btn-press' });
  };

  const realHeroes = Object.entries(HERO_DEFINITIONS).filter(([id]) => !id.startsWith('sandbox_'));
  const sandboxHeroes = Object.entries(HERO_DEFINITIONS).filter(([id]) => id.startsWith('sandbox_'));

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '20px'
    }}>
      {/* Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        {/* Left: Info */}
        <div style={{ pointerEvents: 'auto' }}>
          <div style={{
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            padding: '10px 20px',
            borderRadius: '8px',
            border: `2px solid ${theme.colors.accent}`,
            color: '#fff',
            marginBottom: '10px'
          }}>
            <h2 style={{ margin: 0, color: theme.colors.accent }}>ATTACK SANDBOX</h2>
            <div style={{ color: theme.colors.textMuted, fontSize: '12px' }}>Wave mechanics disabled.</div>
          </div>
        </div>

        {/* Right: Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', pointerEvents: 'auto', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', backgroundColor: 'rgba(59, 130, 246, 0.2)', padding: '8px', borderRadius: '8px', border: `1px solid ${theme.colors.accent}` }}>
            <select 
              value={selectedHero} 
              onChange={(e) => setSelectedHero(e.target.value)}
              style={{ padding: '8px', backgroundColor: theme.colors.surface, color: '#fff', border: `1px solid ${theme.colors.border}`, borderRadius: '6px' }}
            >
              <optgroup label="Real Heroes">
                {realHeroes.map(([id, def]) => (
                  <option key={id} value={id}>{def.name} ({def.attackStyle})</option>
                ))}
              </optgroup>
              <optgroup label="Test Mocks">
                {sandboxHeroes.map(([id, def]) => (
                  <option key={id} value={id}>{def.attackStyle.toUpperCase()}</option>
                ))}
              </optgroup>
            </select>
            
            <select 
              value={selectedHeroPassive} 
              onChange={(e) => setSelectedHeroPassive(e.target.value)}
              style={{ padding: '4px 8px', backgroundColor: theme.colors.surface, color: '#fff', border: 'none', borderRadius: '4px' }}
            >
              <option value="none">No Passive Override</option>
              {realHeroes.map(([id, def]) => (
                <option key={id} value={id}>{def.passive?.name} ({def.name})</option>
              ))}
            </select>

            <select 
              value={selectedHeroSkill} 
              onChange={(e) => setSelectedHeroSkill(e.target.value)}
              style={{ padding: '4px 8px', backgroundColor: theme.colors.surface, color: '#fff', border: 'none', borderRadius: '4px' }}
            >
              <option value="none">No Skill Override</option>
              {realHeroes.map(([id, def]) => (
                <option key={id} value={id}>{def.signatureSkill.name} ({def.name})</option>
              ))}
            </select>

            <div style={{ display: 'flex', gap: '5px' }}>
              <button onClick={handleSpawnDummy} style={{ flex: 1, padding: '8px 16px', backgroundColor: theme.colors.accent, color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                Spawn Hero
              </button>
              <button onClick={handleTriggerHeroSkill} style={{ flex: 1, padding: '8px 16px', backgroundColor: '#eab308', color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                Trigger Skill
              </button>
            </div>
          </div>

          <button onClick={handleSpawnTarget} style={{
            padding: '8px 16px',
            backgroundColor: theme.colors.danger,
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}>
            Drop Punching Bag
          </button>

          {/* Enemy Tester */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', backgroundColor: 'rgba(56, 189, 248, 0.2)', padding: '8px', borderRadius: '8px', border: `1px solid ${theme.colors.accent}` }}>
            <select 
              value={selectedEnemy} 
              onChange={(e) => setSelectedEnemy(e.target.value)}
              style={{ padding: '4px 8px', backgroundColor: theme.colors.surface, color: '#fff', border: 'none', borderRadius: '4px' }}
            >
              <option value="grunt">Grunt</option>
              <option value="runner">Runner</option>
              <option value="brute">Brute</option>
              <option value="ghost_employee">Ghost Employee (Stealth)</option>
              <option value="epal">Epal (Morale Aura)</option>
              <option value="the_overpriced">The Overpriced (Fake HP)</option>
              <option value="kickback_courier">Kickback Courier (Thief)</option>
              <option value="shell_company">Shell Company (Splitter)</option>
              <option value="crony_bodyguard">Crony (Taunt)</option>
              <option value="hoarder">Hoarder (Obstacle Drop)</option>
              <option value="illegal_logger">Illegal Logger (Destructor)</option>
              <option value="land_grabber">Land Grabber (Knockback)</option>
              <option value="tender_rigger">Tender Rigger (Immunity)</option>
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
              style={{ padding: '4px 8px', backgroundColor: theme.colors.surface, color: '#fff', border: 'none', borderRadius: '4px' }}
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
              style={{ padding: '4px 8px', backgroundColor: theme.colors.surface, color: '#fff', border: 'none', borderRadius: '4px' }}
            >
              <option value="none">No Skill</option>
              <option value="flood">Flood</option>
              <option value="devour">Devour</option>
              <option value="summonSwarm">Deploy Trolls</option>
              <option value="summonShieldbearer">Appoint Shieldbearer</option>
              <option value="scatterFakeGold">Bribe (Fake Gold)</option>
              <option value="smuggleHp">Smuggle Funds (HP)</option>
              <option value="economyHeist">Economy Heist</option>
              <option value="sirenBurst">VIP Convoy (Siren)</option>
              <option value="resurrectAll">Horde Convergence</option>
            </select>

            <div style={{ display: 'flex', gap: '5px' }}>
              <button onClick={handleSpawnSpecificEnemy} style={{ flex: 1, padding: '6px 12px', backgroundColor: theme.colors.accent, color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                Spawn
              </button>
              <button onClick={handleTriggerEnemySkill} style={{ flex: 1, padding: '6px 12px', backgroundColor: '#eab308', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                Trigger Skill
              </button>
            </div>
          </div>

          {/* Ailment Tester */}
          <div style={{ display: 'flex', gap: '5px', backgroundColor: 'rgba(30, 41, 59, 0.5)', padding: '4px', borderRadius: '8px', border: `1px solid ${theme.colors.border}` }}>
            <select 
              value={selectedAilment} 
              onChange={(e) => setSelectedAilment(e.target.value)}
              style={{
                padding: '4px 8px',
                backgroundColor: theme.colors.surface,
                color: '#fff',
                border: 'none',
                borderRadius: '4px'
              }}
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
            <button onClick={handleApplyAilment} style={{
              padding: '6px 12px',
              backgroundColor: '#8b5cf6',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}>
              +35% Stack
            </button>
          </div>

          <div style={{ display: 'flex', gap: '5px', backgroundColor: theme.colors.surface, padding: '4px', borderRadius: '8px', border: `1px solid ${theme.colors.border}` }}>
            <button onClick={() => { handleSetSpeed(0); playBtnSound(); }} style={{
              padding: '6px 12px',
              backgroundColor: gameSpeed === 0 ? theme.colors.primary : 'transparent',
              color: gameSpeed === 0 ? '#fff' : theme.colors.textSecondary,
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}>II</button>
            <button onClick={() => { handleSetSpeed(1); playBtnSound(); }} style={{
              padding: '6px 12px',
              backgroundColor: gameSpeed === 1 ? theme.colors.primary : 'transparent',
              color: gameSpeed === 1 ? '#fff' : theme.colors.textSecondary,
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}>▶</button>
            <button onClick={() => { handleSetSpeed(2); playBtnSound(); }} style={{
              padding: '6px 12px',
              backgroundColor: gameSpeed === 2 ? theme.colors.primary : 'transparent',
              color: gameSpeed === 2 ? '#fff' : theme.colors.textSecondary,
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}>▶▶</button>
          </div>
          
          <button 
            onClick={() => { onReturnToMenu(); playBtnSound(); }}
            style={{
              padding: '8px 16px',
              backgroundColor: '#1e293b',
              color: '#fff',
              border: '1px solid #475569',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Leave Sandbox
          </button>
        </div>
      </div>
    </div>
  );
}
