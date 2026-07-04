import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { theme } from '../theme';
import {
  gameToUiEvents,
  uiToGameEvents,
  type DropOption,
  type DropRarity,
  type GameStateSnapshot,
} from '../../game/core/GameEvents';
import { HERO_DEFINITIONS } from '../../game/data/balance';
import {
  BarrierIcon,
  HeroCardIcon,
  HopeCoinIcon,
  MegaphoneIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  RaisedFistIcon,
  SettingsIcon,
  SkullIcon,
  SpeedIcon,
  StarIcon,
  StarOutlineIcon,
  VictoryIcon,
  VoicesIcon,
  WaveIcon,
  damageTypeIcons,
} from '../icons';
import { battleCss, cautionTape, fab, glass, glassPanel, glassSelect, withAlpha } from './battleStyles';

interface BattleHUDProps {
  onReturnToMenu: () => void;
}

/* ------------------------------------------------------------------ */
/* Rarity framing — accent intensity + star count (gold = currency only) */
/* ------------------------------------------------------------------ */

const RARITY_META: Record<DropRarity, { label: string; stars: number; border: string; glow: string }> = {
  common: { label: 'Common', stars: 1, border: glass.border, glow: 'none' },
  rare: {
    label: 'Rare',
    stars: 2,
    border: withAlpha(theme.colors.accent, 0.55),
    glow: `0 0 18px ${withAlpha(theme.colors.accent, 0.3)}`,
  },
  epic: {
    label: 'Epic',
    stars: 3,
    border: theme.colors.accent,
    glow: `0 0 26px ${withAlpha(theme.colors.accent, 0.55)}`,
  },
};

/* ------------------------------------------------------------------ */
/* Small presentational pieces                                         */
/* ------------------------------------------------------------------ */

/** Eased count-up number for the spoils list. */
function CountUp({ value, durationMs = 900 }: { value: number; durationMs?: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      setDisplay(Math.round(value * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, durationMs]);

  return <span style={{ fontVariantNumeric: 'tabular-nums' }}>{display}</span>;
}

function RarityStars({ rarity }: { rarity: DropRarity }) {
  const meta = RARITY_META[rarity];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, color: theme.colors.accent }}>
      {[0, 1, 2].map((i) =>
        i < meta.stars ? <StarIcon key={i} size={11} /> : <StarOutlineIcon key={i} size={11} />,
      )}
    </span>
  );
}

interface DropCardProps {
  option: DropOption;
  index: number;
  onSelect: (dropId: string) => void;
}

function DropCard({ option, index, onSelect }: DropCardProps) {
  const rarity: DropRarity = option.rarity ?? 'common';
  const meta = RARITY_META[rarity];
  const kind = option.kind ?? (option.type === 'spawn' ? 'hero' : 'generalUpgrade');
  const isBuhis = kind === 'buhisBuhay';
  const DamageIcon = option.damageType ? damageTypeIcons[option.damageType] : undefined;

  let visual: ReactNode;
  if (kind === 'hero') {
    visual = (
      <div style={{ position: 'relative', width: 72, height: 72 }}>
        <img
          src="/assets/heroes/hero-placeholder.svg"
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
        <span
          style={{
            position: 'absolute',
            right: -8,
            bottom: -6,
            width: 26,
            height: 26,
            borderRadius: '50%',
            backgroundColor: glass.surface,
            border: `1px solid ${withAlpha(theme.colors.accent, 0.5)}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: theme.colors.accent,
          }}
        >
          {DamageIcon ? <DamageIcon size={14} /> : <RaisedFistIcon size={14} />}
        </span>
      </div>
    );
  } else {
    const Icon =
      option.type === 'speed'
        ? SpeedIcon
        : (DamageIcon ?? (option.type === 'damage' ? damageTypeIcons.Physical : PlusIcon));
    visual = (
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          border: `1px solid ${isBuhis ? withAlpha(theme.colors.danger, 0.5) : glass.border}`,
          backgroundColor: withAlpha(theme.colors.background, 0.5),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isBuhis ? theme.colors.danger : theme.colors.accent,
        }}
      >
        <Icon size={32} />
      </div>
    );
  }

  const frame: CSSProperties = isBuhis
    ? { background: cautionTape(theme.colors.danger), padding: 4, borderRadius: 18 }
    : { padding: 4, borderRadius: 18 };

  return (
    <div style={frame}>
      <button
        type="button"
        className="drop-card"
        onClick={() => onSelect(option.id)}
        style={{
          ...glassPanel,
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          border: `${rarity === 'epic' ? 2 : 1}px solid ${meta.border}`,
          boxShadow: meta.glow,
          borderRadius: 14,
          width: 'min(200px, 44vw)',
          minHeight: 240,
          padding: '14px 12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
          color: theme.colors.textPrimary,
          cursor: 'pointer',
          textAlign: 'center',
          animationDelay: `${index * 70}ms`,
        }}
      >
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: 1,
            textTransform: 'uppercase',
            color: rarity === 'common' ? theme.colors.textMuted : theme.colors.accent,
          }}
        >
          <RarityStars rarity={rarity} />
          {meta.label}
        </span>

        {visual}

        <span style={{ fontSize: 16, fontWeight: 800, lineHeight: 1.15 }}>{option.title}</span>
        <span style={{ fontSize: 12, color: theme.colors.textMuted, lineHeight: 1.4 }}>
          {option.description}
        </span>

        {isBuhis && (
          <span
            style={{
              marginTop: 'auto',
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: 0.5,
              textTransform: 'uppercase',
              color: theme.colors.danger,
              lineHeight: 1.4,
            }}
          >
            Buhis-Buhay — high risk: {option.risk ?? 'a heavy toll follows'}
          </span>
        )}
      </button>
    </div>
  );
}

interface SpoilRowProps {
  icon: ReactNode;
  iconColor: string;
  label: string;
  value: number;
  valueColor?: string;
  prefix?: string;
  suffix?: string;
  note?: string;
}

function SpoilRow({ icon, iconColor, label, value, valueColor, prefix = '+', suffix, note }: SpoilRowProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 12px',
        borderRadius: 10,
        backgroundColor: withAlpha(theme.colors.background, 0.45),
        border: `1px solid ${glass.border}`,
      }}
    >
      <span style={{ color: iconColor, display: 'flex' }}>{icon}</span>
      <span style={{ flex: 1, textAlign: 'left', fontSize: 12, color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
        {note && (
          <span style={{ display: 'block', fontSize: 10, textTransform: 'none', letterSpacing: 0 }}>{note}</span>
        )}
      </span>
      <span style={{ fontSize: 18, fontWeight: 800, color: valueColor ?? theme.colors.textPrimary }}>
        {prefix}
        <CountUp value={value} />
        {suffix}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* BattleHUD                                                           */
/* ------------------------------------------------------------------ */

export function BattleHUD({ onReturnToMenu }: BattleHUDProps) {
  const [state, setState] = useState<GameStateSnapshot>({
    barrierHp: 100,
    maxBarrierHp: 100,
    voicesCount: 0,
    maxVoicesCount: 3,
    waveActive: false,
    currentWave: 1,
    totalWaves: 3,
    isPaused: false,
    gameSpeed: 1,
    status: 'playing',
  });
  const [dropOptions, setDropOptions] = useState<DropOption[]>([]);
  const [selectedHero, setSelectedHero] = useState<string>('');
  const [menuOpen, setMenuOpen] = useState(false);
  const lastSpeedRef = useRef(1);

  useEffect(() => {
    const unsubState = gameToUiEvents.on('stateChanged', setState);
    const unsubVoices = gameToUiEvents.on('voicesFull', ({ options }) => setDropOptions(options));
    return () => {
      unsubState();
      unsubVoices();
    };
  }, []);

  const playBtnSound = () => uiToGameEvents.emit('playSound', { key: 'sfx-btn-press' });
  const handleSetSpeed = (speed: number) => uiToGameEvents.emit('setSpeed', { speed });

  const gameOver = state.status !== 'playing';
  const won = state.status === 'won';
  const paused = state.isPaused || state.gameSpeed === 0;

  const togglePause = () => {
    playBtnSound();
    if (paused) {
      handleSetSpeed(lastSpeedRef.current || 1);
    } else {
      lastSpeedRef.current = state.gameSpeed || 1;
      handleSetSpeed(0);
    }
  };

  const toggleSpeed = () => {
    playBtnSound();
    const next = state.gameSpeed === 2 ? 1 : 2;
    lastSpeedRef.current = next;
    handleSetSpeed(next);
  };

  const handleSurrender = () => {
    playBtnSound();
    setMenuOpen(false);
    uiToGameEvents.emit('surrender', undefined);
  };

  const handleDebugSpawn = () => {
    playBtnSound();
    uiToGameEvents.emit('debugSpawn', { heroId: selectedHero || undefined });
  };

  const handleSelectDrop = (dropId: string) => {
    playBtnSound();
    uiToGameEvents.emit('selectDrop', { dropId });
    setDropOptions([]);
  };

  const moraleRatio = state.maxBarrierHp > 0 ? state.barrierHp / state.maxBarrierHp : 0;
  const moraleLow = moraleRatio <= 0.35;
  const voicesRatio = state.maxVoicesCount > 0 ? state.voicesCount / state.maxVoicesCount : 0;
  const voicesNearFull = voicesRatio >= 0.75;

  // Mock spoils — real values arrive with the run-summary contract later.
  const wavesCleared = won ? state.totalWaves : Math.max(0, state.currentWave - 1);
  const hopeEarned = won ? 150 + wavesCleared * 25 : 40 + wavesCleared * 10;
  const heroCardDrops = won ? 2 : 1;
  const stars = [
    { label: 'No breach', earned: state.barrierHp >= state.maxBarrierHp },
    { label: 'No Act used', earned: true },
    { label: 'Swift defense', earned: won },
  ];

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <style>{battleCss}</style>

      {/* ---------- Top HUD: slim floating pills + edge FABs ---------- */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 8,
          padding: '12px 12px 0',
        }}
      >
        {/* Left: Morale + wave pills */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, pointerEvents: 'auto' }}>
          <div
            aria-label={`Morale ${state.barrierHp} of ${state.maxBarrierHp}`}
            style={{
              ...glassPanel,
              borderRadius: 999,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 14px',
            }}
          >
            <span style={{ color: moraleLow ? theme.colors.danger : theme.colors.success, display: 'flex' }}>
              <BarrierIcon size={18} />
            </span>
            <div
              style={{
                width: 84,
                height: 6,
                borderRadius: 3,
                backgroundColor: withAlpha(theme.colors.background, 0.6),
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${Math.max(0, Math.min(1, moraleRatio)) * 100}%`,
                  height: '100%',
                  borderRadius: 3,
                  backgroundColor: moraleLow ? theme.colors.danger : theme.colors.success,
                  transition: 'width 0.3s ease, background-color 0.3s ease',
                }}
              />
            </div>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                fontVariantNumeric: 'tabular-nums',
                color: moraleLow ? theme.colors.danger : theme.colors.textPrimary,
              }}
            >
              {state.barrierHp}
            </span>
          </div>

          <div
            style={{
              ...glassPanel,
              borderRadius: 999,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              alignSelf: 'flex-start',
            }}
          >
            <span style={{ color: theme.colors.textMuted, display: 'flex' }}>
              <WaveIcon size={14} />
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 0.5,
                textTransform: 'uppercase',
                color: theme.colors.textPrimary,
              }}
            >
              {state.waveActive ? `Wave ${state.currentWave}/${state.totalWaves}` : 'Standby'}
            </span>
          </div>
        </div>

        {/* Center: Voices meter — pulses when a drop is close */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', pointerEvents: 'auto' }}>
          <div
            aria-label={`Voices ${state.voicesCount} of ${state.maxVoicesCount}`}
            style={{
              ...glassPanel,
              borderRadius: 999,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 14px',
              border: `1px solid ${voicesNearFull ? withAlpha(theme.colors.accent, 0.6) : glass.border}`,
              animation: voicesNearFull ? 'voices-pulse 1s ease-in-out infinite' : undefined,
            }}
          >
            <span style={{ color: theme.colors.accent, display: 'flex' }}>
              <VoicesIcon size={18} />
            </span>
            <div
              style={{
                width: 72,
                height: 6,
                borderRadius: 3,
                backgroundColor: withAlpha(theme.colors.background, 0.6),
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${Math.max(0, Math.min(1, voicesRatio)) * 100}%`,
                  height: '100%',
                  borderRadius: 3,
                  backgroundColor: theme.colors.accent,
                  boxShadow: `0 0 8px ${withAlpha(theme.colors.accent, 0.8)}`,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                fontVariantNumeric: 'tabular-nums',
                color: theme.colors.textPrimary,
              }}
            >
              {state.voicesCount}/{state.maxVoicesCount}
            </span>
          </div>
        </div>

        {/* Right: circular FABs (pause / speed / corner menu) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end', pointerEvents: 'auto' }}>
          <button
            type="button"
            className="hud-btn"
            style={fab}
            onClick={togglePause}
            disabled={gameOver}
            aria-label={paused ? 'Resume' : 'Pause'}
            title={paused ? 'Resume' : 'Pause'}
          >
            {paused ? <PlayIcon size={20} /> : <PauseIcon size={20} />}
          </button>

          <button
            type="button"
            className="hud-btn"
            style={{
              ...fab,
              flexDirection: 'column',
              gap: 0,
              color: state.gameSpeed === 2 ? theme.colors.accent : theme.colors.textPrimary,
              border: `1px solid ${state.gameSpeed === 2 ? withAlpha(theme.colors.accent, 0.6) : glass.border}`,
            }}
            onClick={toggleSpeed}
            disabled={gameOver}
            aria-pressed={state.gameSpeed === 2}
            aria-label="Toggle game speed"
            title="Toggle game speed"
          >
            <SpeedIcon size={16} />
            <span style={{ fontSize: 9, fontWeight: 800, lineHeight: 1 }}>
              {state.gameSpeed === 2 ? '2x' : '1x'}
            </span>
          </button>

          <button
            type="button"
            className="hud-btn"
            style={fab}
            onClick={() => {
              playBtnSound();
              setMenuOpen((open) => !open);
            }}
            aria-expanded={menuOpen}
            aria-label="Battle menu"
            title="Battle menu"
          >
            <SettingsIcon size={20} />
          </button>

          {menuOpen && (
            <div style={{ ...glassPanel, padding: 6, display: 'flex', flexDirection: 'column', minWidth: 160 }}>
              <button
                type="button"
                className="hud-btn"
                onClick={handleSurrender}
                disabled={gameOver}
                style={{
                  minHeight: 44,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '0 12px',
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: theme.colors.danger,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                <SkullIcon size={18} />
                Surrender
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ---------- Bottom-left: DEV spawn rig (mockup affordance) ---------- */}
      <div
        style={{
          position: 'absolute',
          left: 12,
          bottom: 12,
          display: 'flex',
          alignItems: 'stretch',
          gap: 6,
          pointerEvents: 'auto',
        }}
      >
        <span
          style={{
            ...glassPanel,
            borderRadius: 8,
            alignSelf: 'center',
            padding: '4px 6px',
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: 1,
            color: theme.colors.textMuted,
          }}
        >
          DEV
        </span>
        <select
          value={selectedHero}
          onChange={(e) => setSelectedHero(e.target.value)}
          aria-label="Dev: hero to spawn"
          style={{ ...glassSelect, maxWidth: 150 }}
        >
          <option value="">Random Hero</option>
          {Object.entries(HERO_DEFINITIONS).map(([id, def]) => (
            <option key={id} value={id}>
              {def.name} ({def.attackStyle})
            </option>
          ))}
        </select>
        <button
          type="button"
          className="hud-btn"
          onClick={handleDebugSpawn}
          disabled={gameOver}
          aria-label="Dev: spawn hero"
          title="Dev: spawn hero"
          style={{ ...fab, borderRadius: 10, color: theme.colors.accent }}
        >
          <PlusIcon size={18} />
        </button>
      </div>

      {/* ---------- Drop selection: "A Voice Rises!" ---------- */}
      {dropOptions.length > 0 && !gameOver && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            backgroundColor: withAlpha(theme.colors.background, 0.72),
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 22,
            padding: 16,
            pointerEvents: 'auto',
            animation: 'overlay-fade 0.2s ease both',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: theme.colors.accent }}>
              <MegaphoneIcon size={28} />
              <h1
                style={{
                  margin: 0,
                  fontSize: 'clamp(22px, 6vw, 30px)',
                  fontWeight: 900,
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                  color: theme.colors.textPrimary,
                  textShadow: `0 0 18px ${withAlpha(theme.colors.accent, 0.5)}`,
                }}
              >
                A Voice Rises!
              </h1>
            </div>
            <div style={{ marginTop: 6, fontSize: 13, color: theme.colors.textMuted }}>
              The crowd answers — choose your boon
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12, maxWidth: 720 }}>
            {dropOptions.map((option, index) => (
              <DropCard key={option.id} option={option} index={index} onSelect={handleSelectDrop} />
            ))}
          </div>
        </div>
      )}

      {/* ---------- Spoils of War (Victory / Defeat) ---------- */}
      {gameOver && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            pointerEvents: 'auto',
            background: `linear-gradient(${withAlpha(won ? theme.colors.success : theme.colors.danger, 0.16)}, ${withAlpha(theme.colors.background, 0.85)})`,
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            animation: 'overlay-fade 0.25s ease both',
          }}
        >
          <div
            style={{
              ...glassPanel,
              borderRadius: 16,
              width: 'min(400px, 92vw)',
              maxHeight: '92vh',
              overflowY: 'auto',
              padding: 0,
              transform: 'rotate(-1deg)',
              boxShadow: `0 18px 40px ${withAlpha(theme.colors.background, 0.8)}`,
              animation: 'placard-drop 0.35s ease both',
            }}
          >
            {/* Caution-tape header strip (rally motif) */}
            <div
              style={{
                height: 8,
                background: cautionTape(won ? theme.colors.success : theme.colors.danger),
                opacity: 0.85,
              }}
            />

            <div style={{ padding: '20px 20px 22px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
              <span style={{ color: won ? theme.colors.success : theme.colors.danger, display: 'flex' }}>
                {won ? <VictoryIcon size={44} /> : <SkullIcon size={44} />}
              </span>

              <h1
                style={{
                  margin: 0,
                  fontSize: 26,
                  fontWeight: 900,
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                  textAlign: 'center',
                  color: won ? theme.colors.success : theme.colors.danger,
                }}
              >
                {won ? 'The Barrier Holds' : 'The Rally Breaks'}
              </h1>

              <p style={{ margin: 0, fontSize: 13, textAlign: 'center', lineHeight: 1.5, color: theme.colors.textPrimary }}>
                {won
                  ? 'The rally stands — the streets are singing tonight.'
                  : 'But the movement lives on — people woke up today.'}
              </p>

              {won && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                  {stars.map((star, i) => (
                    <div key={star.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: 86 }}>
                      <span
                        style={{
                          display: 'flex',
                          color: star.earned ? theme.colors.accent : theme.colors.textMuted,
                          animation: star.earned ? `star-pop 0.35s ease ${0.3 + i * 0.15}s both` : undefined,
                        }}
                      >
                        {star.earned ? <StarIcon size={26} /> : <StarOutlineIcon size={26} />}
                      </span>
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          letterSpacing: 0.5,
                          textTransform: 'uppercase',
                          textAlign: 'center',
                          color: star.earned ? theme.colors.textPrimary : theme.colors.textMuted,
                        }}
                      >
                        {star.label}
                        {star.earned ? '' : ' — missed'}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: 2,
                    textTransform: 'uppercase',
                    textAlign: 'center',
                    color: theme.colors.textMuted,
                  }}
                >
                  Spoils of War
                </div>
                <SpoilRow
                  icon={<HopeCoinIcon size={20} />}
                  iconColor={theme.colors.gold}
                  label="Hope Points"
                  note={won ? undefined : 'A failed defense still wakes people up'}
                  value={hopeEarned}
                  valueColor={theme.colors.gold}
                />
                <SpoilRow
                  icon={<HeroCardIcon size={20} />}
                  iconColor={theme.colors.accent}
                  label="Hero Card Drops"
                  value={heroCardDrops}
                />
                <SpoilRow
                  icon={<WaveIcon size={20} />}
                  iconColor={theme.colors.textMuted}
                  label="Waves Cleared"
                  value={wavesCleared}
                  prefix=""
                  suffix={`/${state.totalWaves}`}
                />
              </div>

              {/* ONE clear action (docs/DESIGN_GUIDELINES.md game-over rule) */}
              <button
                type="button"
                className="hud-btn"
                onClick={() => {
                  playBtnSound();
                  onReturnToMenu();
                }}
                style={{
                  width: '100%',
                  minHeight: 52,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  borderRadius: 12,
                  border: 'none',
                  backgroundColor: theme.colors.accent,
                  color: theme.colors.background,
                  fontSize: 17,
                  fontWeight: 800,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  boxShadow: `0 0 22px ${withAlpha(theme.colors.accent, 0.55)}`,
                }}
              >
                <MegaphoneIcon size={22} />
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
