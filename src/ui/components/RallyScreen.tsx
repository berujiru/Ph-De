import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { theme } from '../theme';
import {
  gameToUiEvents,
  uiToGameEvents,
  type DropKind,
  type DropOption,
  type DropRarity,
  type GameStateSnapshot,
} from '../../game/core/GameEvents';
import {
  BarrierIcon,
  BarricadeIcon,
  ChestIcon,
  HeroCardIcon,
  HopeCoinIcon,
  MegaphoneIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  RaisedFistIcon,
  SkullIcon,
  SpeedIcon,
  StarIcon,
  StarOutlineIcon,
  VictoryIcon,
  VoicesIcon,
  WaveIcon,
  damageTypeIcons,
  BrainIcon,
} from '../icons';
import {
  battleCss,
  cautionTape,
  fab,
  glass,
  glassPanel,
  hudPill,
  stampLabel,
  withAlpha,
} from '../mockups/battleStyles';
import { IntelModal } from './IntelModal';

interface RallyScreenProps {
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
/* Kind framing — what the drop IS (recruit / hero upgrade / global    */
/* boon / high-risk pact). Colors map to token meaning, never new hex: */
/* accent = recruit/primary, success = positive boon, danger = risk.   */
/* ------------------------------------------------------------------ */

const KIND_META: Record<DropKind, { ribbon: string; tint: string }> = {
  hero: { ribbon: 'New Recruit', tint: theme.colors.accent },
  heroUpgrade: { ribbon: 'Hero Upgrade', tint: theme.colors.accent },
  generalUpgrade: { ribbon: 'Rally Boon', tint: theme.colors.success },
  buhisBuhay: { ribbon: 'Buhis-Buhay', tint: theme.colors.danger },
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
  const kind: DropKind = option.kind ?? (option.type === 'spawn' ? 'hero' : 'generalUpgrade');
  const kindMeta = KIND_META[kind];
  const isBuhis = kind === 'buhisBuhay';
  const DamageIcon = option.damageType ? damageTypeIcons[option.damageType] : undefined;

  /* The emblem art differs per kind so the three drop types are unmistakable
     at a glance: a portrait for a recruit, a damage chip for a hero upgrade,
     a solidarity fist for a global boon, a hazard mark for a Buhis-Buhay pact. */
  let visual: ReactNode;
  if (kind === 'hero') {
    // Polaroid / lanyard-ID framing (ART guidelines §2A).
    visual = (
      <div
        style={{
          position: 'relative',
          width: 76,
          height: 82,
          padding: 4,
          paddingBottom: 12,
          backgroundColor: theme.materials.paper,
          borderRadius: 3,
          boxShadow: `0 6px 14px ${withAlpha(theme.colors.background, 0.6)}`,
          transform: 'rotate(-2deg)',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 2,
            backgroundColor: withAlpha(theme.colors.background, 0.9),
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src="/assets/heroes/hero-placeholder.svg"
            alt=""
            style={{ width: '90%', height: '90%', objectFit: 'contain' }}
          />
        </div>
        <span
          style={{
            position: 'absolute',
            right: -8,
            bottom: 2,
            width: 28,
            height: 28,
            borderRadius: '50%',
            backgroundColor: glass.surface,
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            border: `1px solid ${withAlpha(theme.colors.accent, 0.6)}`,
            boxShadow: `0 0 10px ${withAlpha(theme.colors.accent, 0.4)}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: theme.colors.accent,
          }}
        >
          {DamageIcon ? <DamageIcon size={15} /> : <RaisedFistIcon size={15} />}
        </span>
      </div>
    );
  } else {
    const Icon =
      isBuhis
        ? SkullIcon
        : kind === 'generalUpgrade'
          ? (option.type === 'speed' ? SpeedIcon : RaisedFistIcon)
          : (option.type === 'speed'
              ? SpeedIcon
              : (DamageIcon ?? (option.type === 'damage' ? damageTypeIcons.Physical : PlusIcon)));
    const emblemTint = kindMeta.tint;
    visual = (
      <div
        style={{
          position: 'relative',
          width: 70,
          height: 70,
          borderRadius: '50%',
          border: `2px solid ${withAlpha(emblemTint, isBuhis ? 0.6 : 0.5)}`,
          background: `radial-gradient(circle at 50% 40%, ${withAlpha(emblemTint, 0.22)}, ${withAlpha(theme.colors.background, 0.6)})`,
          boxShadow: `inset 0 0 12px ${withAlpha(emblemTint, 0.25)}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: emblemTint,
        }}
      >
        <Icon size={32} />
        {kind === 'heroUpgrade' && (
          // Small "up" chevron badge to read as an *upgrade* to a hero, not a fresh recruit.
          <span
            style={{
              position: 'absolute',
              right: -6,
              top: -6,
              width: 22,
              height: 22,
              borderRadius: '50%',
              backgroundColor: theme.colors.background,
              border: `1px solid ${withAlpha(emblemTint, 0.7)}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: emblemTint,
              fontSize: 13,
              fontWeight: 900,
              lineHeight: 1,
            }}
          >
            ▲
          </span>
        )}
      </div>
    );
  }

  const frame: CSSProperties = isBuhis
    ? { background: cautionTape(theme.colors.danger), padding: 3, borderRadius: 18 }
    : { padding: 3, borderRadius: 18 };

  return (
    <div style={frame}>
      <button
        type="button"
        className="drop-card"
        onClick={() => onSelect(option.id)}
        style={{
          ...glassPanel,
          overflow: 'hidden',
          backgroundColor: 'rgba(15, 23, 42, 0.88)',
          border: `${rarity === 'epic' ? 2 : 1}px solid ${isBuhis ? withAlpha(theme.colors.danger, 0.7) : meta.border}`,
          boxShadow: isBuhis
            ? `0 10px 26px ${withAlpha(theme.colors.background, 0.7)}`
            : `${meta.glow}${meta.glow === 'none' ? '' : ', '}0 10px 26px ${withAlpha(theme.colors.background, 0.7)}`,
          borderRadius: 15,
          width: 'min(210px, 44vw)',
          minHeight: 264,
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          color: theme.colors.textPrimary,
          cursor: 'pointer',
          textAlign: 'center',
          animationDelay: `${index * 80}ms`,
        }}
      >
        {/* Kind ribbon — the loud "what is this?" banner across the top. */}
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '7px 8px',
            backgroundColor: withAlpha(kindMeta.tint, 0.16),
            borderBottom: `1px solid ${withAlpha(kindMeta.tint, 0.4)}`,
            color: kindMeta.tint,
            ...stampLabel,
            fontSize: 10,
          }}
        >
          {kind === 'hero' ? <RaisedFistIcon size={13} /> : isBuhis ? <SkullIcon size={13} /> : <PlusIcon size={13} />}
          {kindMeta.ribbon}
        </span>

        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            marginTop: 12,
            ...stampLabel,
            fontSize: 10,
            color: rarity === 'common' ? theme.colors.textMuted : theme.colors.accent,
          }}
        >
          <RarityStars rarity={rarity} />
          {meta.label}
        </span>

        <div style={{ display: 'flex', justifyContent: 'center', margin: '12px 0 10px' }}>{visual}</div>

        <div style={{ padding: '0 14px 16px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
          <span style={{ fontSize: 17, fontWeight: 900, lineHeight: 1.15, letterSpacing: 0.2 }}>
            {option.title}
          </span>
          {/* The PURPOSE copy — the thing the player is meant to read. */}
          <span style={{ fontSize: 12.5, color: theme.colors.textPrimary, opacity: 0.9, lineHeight: 1.45 }}>
            {option.description}
          </span>

          {isBuhis && (
            <span
              style={{
                marginTop: 'auto',
                paddingTop: 8,
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: 0.4,
                textTransform: 'uppercase',
                color: theme.colors.danger,
                lineHeight: 1.4,
                borderTop: `1px dashed ${withAlpha(theme.colors.danger, 0.4)}`,
              }}
            >
              Buhis-Buhay — high risk: {option.risk ?? 'a heavy toll follows'}
            </span>
          )}
        </div>
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

/**
 * A "vital sign" HUD pill — Morale and Voices are the two readings the player
 * must never miss, so they share a bold framed treatment: an icon chip, a
 * stamped label, a live numeric read-out, and a thick gradient track.
 */
function VitalPill({
  icon,
  color,
  label,
  value,
  ratio,
  ariaLabel,
  alarm = false,
  pulse = false,
  glowTrack = false,
  trackWidth = 64,
}: {
  icon: ReactNode;
  color: string;
  label: string;
  value: ReactNode;
  ratio: number;
  ariaLabel: string;
  alarm?: boolean;
  pulse?: boolean;
  glowTrack?: boolean;
  trackWidth?: number;
}) {
  const pct = Math.max(0, Math.min(1, ratio)) * 100;
  const active = alarm || pulse;
  return (
    <div
      aria-label={ariaLabel}
      style={{
        ...hudPill,
        border: `1px solid ${active ? withAlpha(color, 0.6) : glass.border}`,
        animation: alarm
          ? 'morale-alarm 0.9s ease-in-out infinite'
          : pulse
            ? 'voices-pulse 1s ease-in-out infinite'
            : undefined,
      }}
    >
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 30,
          height: 30,
          borderRadius: 8,
          flexShrink: 0,
          backgroundColor: withAlpha(color, 0.16),
          border: `1px solid ${withAlpha(color, 0.4)}`,
          color,
        }}
      >
        {icon}
      </span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
          <span style={{ ...stampLabel, fontSize: 9, color: theme.colors.textMuted }}>{label}</span>
          <span style={{ fontSize: 12, fontWeight: 800, color, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
            {value}
          </span>
        </div>
        <div
          style={{
            width: trackWidth,
            height: 7,
            borderRadius: 4,
            backgroundColor: withAlpha(theme.colors.background, 0.7),
            border: `1px solid ${withAlpha(theme.colors.background, 0.9)}`,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${pct}%`,
              height: '100%',
              borderRadius: 4,
              background: `linear-gradient(90deg, ${withAlpha(color, 0.75)}, ${color})`,
              boxShadow: glowTrack ? `0 0 8px ${withAlpha(color, 0.8)}` : undefined,
              transition: 'width 0.3s ease, background 0.3s ease',
            }}
          />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* RallyScreen                                                           */
/* ------------------------------------------------------------------ */

export function RallyScreen({ onReturnToMenu }: RallyScreenProps) {
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
    activeHeroes: [],
    activeEnemies: [],
  });
  const [dropOptions, setDropOptions] = useState<DropOption[]>([]);
  const [surrenderConfirmOpen, setSurrenderConfirmOpen] = useState(false);
  const [intelOpen, setIntelOpen] = useState(false);
  const lastSpeedRef = useRef(1);
  /** True only when the Intel modal itself paused the game (vs. the user's pause button). */
  const intelPausedGameRef = useRef(false);

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

  const openIntel = () => {
    playBtnSound();
    if (!paused) {
      // Same remember-then-freeze flow as togglePause, tagged so closing
      // Intel only resumes a pause that Intel itself caused.
      lastSpeedRef.current = state.gameSpeed || 1;
      handleSetSpeed(0);
      intelPausedGameRef.current = true;
    } else {
      intelPausedGameRef.current = false;
    }
    setIntelOpen(true);
  };

  const closeIntel = () => {
    setIntelOpen(false);
    if (intelPausedGameRef.current) {
      intelPausedGameRef.current = false;
      // Don't emit a resume into a finished game.
      if (!gameOver) {
        handleSetSpeed(lastSpeedRef.current || 1);
      }
    }
  };

  const handleSurrender = () => {
    playBtnSound();
    setSurrenderConfirmOpen(false);
    uiToGameEvents.emit('surrender', undefined);
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
    <div className="rally-screen" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <style>{battleCss}</style>

      {/* ---------- Top HUD: vital-sign pills + edge FABs ---------- */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 6,
          padding: '10px 8px 0',
        }}
      >
        {/* Left: Morale (vital sign) + wave placard chip */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, pointerEvents: 'auto' }}>
          <VitalPill
            ariaLabel={`Morale ${state.barrierHp} of ${state.maxBarrierHp}`}
            icon={<BarrierIcon size={18} />}
            color={moraleLow ? theme.colors.danger : theme.colors.success}
            label="Morale"
            value={state.barrierHp}
            ratio={moraleRatio}
            alarm={moraleLow}
          />

          <div
            style={{
              ...hudPill,
              gap: 7,
              padding: '5px 12px 5px 5px',
              alignSelf: 'flex-start',
            }}
          >
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 26,
                height: 26,
                borderRadius: 7,
                backgroundColor: withAlpha(theme.materials.cautionYellow, 0.16),
                border: `1px solid ${withAlpha(theme.materials.cautionYellow, 0.4)}`,
                color: theme.materials.cautionYellow,
              }}
            >
              {state.waveActive ? <WaveIcon size={15} /> : <BarricadeIcon size={15} />}
            </span>
            <span
              style={{
                ...stampLabel,
                fontSize: 11,
                letterSpacing: 0.8,
                color: theme.colors.textPrimary,
              }}
            >
              {state.waveActive ? `Wave ${state.currentWave}/${state.totalWaves}` : 'Standby'}
            </span>
          </div>
        </div>

        {/* Center: Voices (vital sign) — pulses when a drop is close */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', pointerEvents: 'auto' }}>
          <VitalPill
            ariaLabel={`Voices ${state.voicesCount} of ${state.maxVoicesCount}`}
            icon={<VoicesIcon size={18} />}
            color={theme.colors.accent}
            label="Voices"
            value={`${state.voicesCount}/${state.maxVoicesCount}`}
            ratio={voicesRatio}
            pulse={voicesNearFull}
            glowTrack
            trackWidth={64}
          />
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
            style={{ ...fab, color: theme.colors.accent, border: `1px solid ${withAlpha(theme.colors.accent, 0.4)}` }}
            onClick={openIntel}
            disabled={gameOver}
            aria-label="Battle Intel"
            title="Battle Intel"
          >
            <BrainIcon size={20} />
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
            style={{ ...fab, color: theme.colors.danger, border: `1px solid ${withAlpha(theme.colors.danger, 0.4)}` }}
            onClick={() => {
              playBtnSound();
              setSurrenderConfirmOpen(true);
            }}
            disabled={gameOver}
            aria-label="Surrender"
            title="Surrender"
          >
            <SkullIcon size={20} />
          </button>
        </div>
      </div>

      {/* ---------- Bottom-center: Bayanihan Act Button ---------- */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 22,
          transform: 'translateX(-50%)',
          display: 'flex',
          pointerEvents: 'auto',
          zIndex: 10,
        }}
      >
        {/* Caution-tape ring around the megaphone — the rally's focal CTA. */}
        <div
          style={{
            padding: 3,
            borderRadius: '50%',
            background: cautionTape(theme.colors.accent),
            boxShadow: `0 8px 22px ${withAlpha(theme.colors.background, 0.7)}`,
          }}
        >
          <button
            type="button"
            className="hud-btn"
            disabled={gameOver}
            aria-label="Bayanihan Act"
            title="Bayanihan Act — Ready!"
            style={{
              ...fab,
              width: 72,
              height: 72,
              borderRadius: '50%',
              backgroundColor: withAlpha(theme.colors.background, 0.92),
              border: `2px solid ${theme.colors.accent}`,
              color: theme.colors.accent,
              boxShadow: `0 0 20px ${withAlpha(theme.colors.accent, 0.7)}, inset 0 0 10px ${withAlpha(theme.colors.accent, 0.4)}`,
              animation: 'pulse-glow 2s infinite',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
            }}
            onClick={() => {
              playBtnSound();
              // In the future: emit bayanihan act event
            }}
          >
            <MegaphoneIcon size={26} />
            <span style={{ ...stampLabel, fontSize: 9 }}>Act</span>
          </button>
        </div>
      </div>

      {/* ---------- Abandon Rally Confirmation ---------- */}
      {surrenderConfirmOpen && !gameOver && (
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
        >
          <div
            style={{
              ...glassPanel,
              borderRadius: 16,
              overflow: 'hidden',
              width: 'min(360px, 92vw)',
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: `0 18px 40px ${withAlpha(theme.colors.background, 0.8)}`,
              border: `1px solid ${withAlpha(theme.colors.danger, 0.35)}`,
              transform: 'rotate(-0.5deg)',
              animation: 'placard-drop 0.3s ease both',
            }}
          >
            {/* Caution-tape header — same rally motif as the Spoils placard. */}
            <div style={{ width: '100%', height: 8, background: cautionTape(theme.colors.danger), opacity: 0.9 }} />

            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, width: '100%' }}>
            <span
              style={{
                color: theme.colors.danger,
                display: 'flex',
                width: 56,
                height: 56,
                borderRadius: '50%',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: withAlpha(theme.colors.danger, 0.14),
                border: `1px solid ${withAlpha(theme.colors.danger, 0.4)}`,
              }}
            >
              <SkullIcon size={32} />
            </span>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 900, color: theme.colors.danger, textTransform: 'uppercase', letterSpacing: 1 }}>
                Abandon Rally?
              </h2>
              <p style={{ margin: 0, fontSize: 13, color: theme.colors.textMuted, lineHeight: 1.5 }}>
                Leaving now will break the movement's momentum. Are you sure you want to surrender?
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12, width: '100%', marginTop: 8 }}>
              <button
                type="button"
                className="hud-btn"
                onClick={() => setSurrenderConfirmOpen(false)}
                style={{
                  flex: 1,
                  minHeight: 44,
                  borderRadius: 10,
                  border: `1px solid ${glass.border}`,
                  backgroundColor: 'transparent',
                  color: theme.colors.textPrimary,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="hud-btn"
                onClick={handleSurrender}
                style={{
                  flex: 1,
                  minHeight: 44,
                  borderRadius: 10,
                  border: 'none',
                  backgroundColor: theme.colors.danger,
                  color: theme.colors.textPrimary,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: `0 0 16px ${withAlpha(theme.colors.danger, 0.4)}`,
                }}
              >
                Surrender
              </button>
            </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------- Drop selection: "A Voice Rises!" ---------- */}
      {dropOptions.length > 0 && !gameOver && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            // Accent vignette rising from the centre — spotlight on the choice.
            background: `radial-gradient(120% 80% at 50% 42%, ${withAlpha(theme.colors.accent, 0.18)}, ${withAlpha(theme.colors.background, 0.82)} 60%)`,
            backdropFilter: 'blur(7px)',
            WebkitBackdropFilter: 'blur(7px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 20,
            padding: 16,
            pointerEvents: 'auto',
            animation: 'overlay-fade 0.2s ease both',
          }}
        >
          <div style={{ textAlign: 'center', animation: 'drop-title-in 0.35s cubic-bezier(0.2, 0.9, 0.3, 1.2) both' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: theme.colors.accent }}>
              <span
                style={{
                  display: 'flex',
                  transformOrigin: 'center',
                  animation: 'megaphone-shout 0.6s ease-in-out 3',
                }}
              >
                <MegaphoneIcon size={30} />
              </span>
              <h1
                style={{
                  margin: 0,
                  fontSize: 'clamp(22px, 6vw, 32px)',
                  fontWeight: 900,
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                  color: theme.colors.textPrimary,
                  textShadow: `0 0 18px ${withAlpha(theme.colors.accent, 0.55)}`,
                }}
              >
                A Voice Rises!
              </h1>
            </div>
            {/* Caution-tape underline — DIY protest signage. */}
            <div
              style={{
                margin: '10px auto 0',
                width: 'min(240px, 60vw)',
                height: 5,
                borderRadius: 3,
                background: cautionTape(theme.colors.accent),
                opacity: 0.9,
              }}
            />
            <div style={{ marginTop: 10, ...stampLabel, fontSize: 11, letterSpacing: 1.2, color: theme.colors.textMuted }}>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
                  <span style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${glass.border})` }} />
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      ...stampLabel,
                      fontSize: 11,
                      letterSpacing: 2,
                      color: theme.colors.textMuted,
                    }}
                  >
                    <ChestIcon size={15} />
                    Spoils of War
                  </span>
                  <span style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${glass.border}, transparent)` }} />
                </div>
                <SpoilRow
                  icon={<HopeCoinIcon size={20} />}
                  iconColor={theme.colors.gold}
                  label="Hope Points"
                  note={won ? undefined : 'A failed defense still wakes people up'}
                  value={hopeEarned}
                  valueColor={theme.colors.gold}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%', marginTop: 4 }}>
                  <div style={{ ...stampLabel, fontSize: 11, color: theme.colors.textMuted }}>
                    Hero Card Drops
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {heroCardDrops > 0 ? Array.from({ length: heroCardDrops }).map((_, i) => (
                      <div
                        key={i}
                        style={{
                          width: 46,
                          height: 62,
                          borderRadius: 8,
                          border: `1px solid ${withAlpha(theme.colors.accent, 0.7)}`,
                          background: `linear-gradient(160deg, ${withAlpha(theme.colors.accent, 0.22)}, ${withAlpha(theme.colors.background, 0.5)})`,
                          boxShadow: `0 4px 12px ${withAlpha(theme.colors.background, 0.6)}, inset 0 0 8px ${withAlpha(theme.colors.accent, 0.2)}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: theme.colors.accent,
                          animation: `star-pop 0.3s ease ${0.35 + i * 0.12}s both`,
                        }}
                      >
                        <HeroCardIcon size={26} />
                      </div>
                    )) : (
                      <div style={{ fontSize: 13, color: theme.colors.textMuted }}>None</div>
                    )}
                  </div>
                </div>
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

      {/* 4. Intel Modal */}
      {intelOpen && (
        <IntelModal
          heroes={state.activeHeroes || []}
          enemies={state.activeEnemies || []}
          onClose={closeIntel}
        />
      )}
    </div>
  );
}
