import { useEffect, useReducer } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { theme } from '../theme';
import { defaultSkin, type HeroSkin } from '../../game/data/skins';
import type { HeroId } from '../../game/data/heroes';
import {
  ChestIcon,
  HeroCardIcon,
  HopeCoinIcon,
  MegaphoneIcon,
  RallyPermitIcon,
} from '../icons';
import { Embers, FireVignette, RuinedSkyline, Bonfire, SoulsButton } from '../components/ApocalypseScenery';

interface MainMenuProps {
  onPlay: () => void;
  onStore: () => void;
  onInventory: () => void;
}

import { getHope, getPermits, subscribeMetaState } from '../../game/data/metaState';

const MARKER_FONT = '"Segoe Print", "Bradley Hand", "Comic Sans MS", cursive';

/**
 * Crops a single frame out of one of the game's 256px, 8-column sprite sheets
 * with pure CSS (no canvas) so the menu can reuse the existing battle art. Cells
 * are square, so the rendered box is `size × size`.
 */
function SpriteCell({
  sheet,
  columns,
  rows,
  frame,
  size,
  style,
}: {
  sheet: string;
  columns: number;
  rows: number;
  frame: number;
  size: number;
  style?: CSSProperties;
}) {
  const col = frame % columns;
  const row = Math.floor(frame / columns);
  return (
    <div
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        backgroundImage: `url("${sheet}")`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: `${columns * 100}% ${rows * 100}%`,
        backgroundPosition: `${columns > 1 ? (col / (columns - 1)) * 100 : 0}% ${
          rows > 1 ? (row / (rows - 1)) * 100 : 0
        }%`,
        ...style,
      }}
    />
  );
}

/** A resting cell for a hero skin — its idle start, else the portrait cell. */
function restingFrame(skin: HeroSkin): number {
  return skin.states.idle?.from ?? skin.portraitFrame ?? 0;
}

interface HeroFigureProps {
  id: HeroId;
  /** On-screen height in px (cells are square). */
  size: number;
  /** Mirror horizontally for variety across the line. */
  flip?: boolean;
  /** Cooler, dimmer figure standing a step back from the flames. */
  dim?: boolean;
}

/**
 * A head-and-torso closeup of a sprite cell: renders the full cell at `width`,
 * then clips to the top portion and fades the cut edge into shadow so the figure
 * reads as a bust emerging from the dark rather than a hard-cropped rectangle.
 */
function SpriteBust({
  sheet,
  columns,
  rows,
  frame,
  width,
  flip,
  filter,
  opacity = 1,
  /** Fraction of the (square) cell height kept — the bust window. */
  showFrac = 0.52,
  /** Fraction of empty headroom trimmed off the top of the cell. */
  topTrim = 0.1,
}: {
  sheet: string;
  columns: number;
  rows: number;
  frame: number;
  width: number;
  flip?: boolean;
  filter?: string;
  opacity?: number;
  showFrac?: number;
  topTrim?: number;
}) {
  return (
    <div style={{ filter }}>
      <div
        style={{
          width,
          height: width * showFrac,
          overflow: 'hidden',
          position: 'relative',
          WebkitMaskImage: 'linear-gradient(to bottom, #000 72%, transparent 100%)',
          maskImage: 'linear-gradient(to bottom, #000 72%, transparent 100%)',
        }}
      >
        <SpriteCell
          sheet={sheet}
          columns={columns}
          rows={rows}
          frame={frame}
          size={width}
          style={{
            position: 'absolute',
            top: -width * topTrim,
            left: 0,
            opacity,
            transform: flip ? 'scaleX(-1)' : undefined,
          }}
        />
      </div>
    </div>
  );
}

/**
 * A companion at the bonfire, drawn as a torso-up closeup of a resting frame of
 * their battle skin. Heroes are authored facing AWAY from the camera, so here
 * they read as the squad gathered close at the fire, backs to us, facing the dark.
 */
function HeroFigure({ id, size, flip, dim }: HeroFigureProps) {
  const skin = defaultSkin(id);
  if (!skin) return null;
  const rows = Math.ceil(skin.totalFrames / skin.columns);
  return (
    <SpriteBust
      sheet={skin.sheet}
      columns={skin.columns}
      rows={rows}
      frame={restingFrame(skin)}
      width={size}
      flip={flip}
      opacity={dim ? 0.9 : 1}
      filter={
        dim
          ? 'brightness(0.55) saturate(0.75)'
          : 'drop-shadow(0 0 18px rgba(234, 88, 12, 0.35))'
      }
    />
  );
}

/**
 * Who stands at the bonfire. The outer pair are lit by the fire (warm glow);
 * the inner pair stand back in cooler shadow. Eden anchors the left flank, the
 * jeepney-driver bruiser the right.
 */
const HERO_LINE: { left: HeroFigureProps[]; right: HeroFigureProps[] } = {
  left: [
    { id: 'eden', size: 206 },
    { id: 'teacher', size: 158, flip: true, dim: true },
  ],
  right: [
    { id: 'nurse', size: 158, dim: true },
    { id: 'jeepney_driver', size: 206, flip: true },
  ],
};

/**
 * The distant horde massing on the horizon — reused enemy sheets (front-facing,
 * so they bear down toward us). Rendered small, dark, and desaturated on a
 * slow-drifting parallax layer far behind the rally. All are 8-col/256px sheets.
 */
const ENEMY_HORDE: { sheet: string; rows: number; size: number; flip?: boolean }[] = [
  { sheet: '/assets/enemies/minion_grunt_sprite.png', rows: 9, size: 78 },
  { sheet: '/assets/enemies/epal_sprite.png', rows: 10, size: 86, flip: true },
  { sheet: '/assets/enemies/crony_sprite.png', rows: 9, size: 80 },
  { sheet: '/assets/enemies/brute_sheet.png', rows: 8, size: 96 },
  { sheet: '/assets/enemies/ghost_employee_sprite.png', rows: 10, size: 74, flip: true },
  { sheet: '/assets/enemies/minion_runner_sprite.png', rows: 9, size: 76 },
];

/**
 * Ang Sistema — the finale boss (`boss_ang_sistema`, "The System"). Looms as a
 * large front-facing bust behind the horde, the final threat the rally marches
 * toward. Its 8-col/256px sheet is `sistema_sprite.png` (10 rows).
 */
const ANG_SISTEMA_BOSS = {
  sheet: '/assets/enemies/sistema_sprite.png',
  columns: 8,
  rows: 10,
  frame: 0,
};

/** The crowd at the bottom edge: survivors, charred placards, and the squad. */
function RallyCrowd() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '38%',
        minHeight: 220,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {/* placard + fist silhouettes behind the heroes */}
      <svg
        viewBox="0 0 800 260"
        preserveAspectRatio="xMidYMax slice"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.9 }}
      >
        <g fill="#0c0a09">
          {/* rolling heads of the crowd */}
          <path d="M0 260V190q30-24 60-10t60-6 62 10 58-14 62 8 60-10 62 12 58-12 62 10 60-8 62 12 58-10 62 8 54-6v66z" />
          {/* placards on sticks */}
          <g>
            <rect x="70" y="60" width="90" height="58" rx="4" />
            <rect x="112" y="118" width="6" height="70" />
            <rect x="250" y="30" width="104" height="64" rx="4" transform="rotate(-6 302 62)" />
            <rect x="298" y="92" width="6" height="86" transform="rotate(-6 301 135)" />
            <rect x="470" y="52" width="96" height="60" rx="4" transform="rotate(5 518 82)" />
            <rect x="514" y="110" width="6" height="76" transform="rotate(5 517 148)" />
            <rect x="650" y="42" width="88" height="56" rx="4" transform="rotate(-4 694 70)" />
            <rect x="690" y="96" width="6" height="80" transform="rotate(-4 693 136)" />
          </g>
          {/* raised fists */}
          <g>
            <rect x="185" y="120" width="14" height="60" rx="7" />
            <rect x="176" y="98" width="32" height="30" rx="10" />
            <rect x="400" y="104" width="14" height="72" rx="7" />
            <rect x="391" y="82" width="32" height="30" rx="10" />
            <rect x="596" y="126" width="14" height="56" rx="7" />
            <rect x="587" y="104" width="32" height="30" rx="10" />
          </g>
        </g>
        {/* placard slogans, barely readable strokes */}
        <g stroke="#3f3f46" strokeWidth="5" strokeLinecap="round" opacity="0.6">
          <path d="M86 80h58M86 96h38" />
          <path d="M268 52h64M268 68h44" transform="rotate(-6 302 62)" />
          <path d="M486 72h58M486 88h36" transform="rotate(5 518 82)" />
        </g>
      </svg>

      {/* Far parallax layer: the enemy horde massing on the horizon, small and
          dark, drifting uneasily behind the rally (front-facing = bearing down). */}
      <div
        className="menu-horde"
        style={{
          position: 'absolute',
          top: '4%',
          left: '-3%',
          width: '106%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          padding: '0 3%',
          zIndex: 0,
        }}
      >
        {ENEMY_HORDE.map((e, i) => (
          <SpriteCell
            key={i}
            sheet={e.sheet}
            columns={8}
            rows={e.rows}
            frame={0}
            size={e.size}
            style={{
              transform: e.flip ? 'scaleX(-1)' : undefined,
              opacity: 0.6,
              filter: 'brightness(0.32) saturate(0.55) contrast(1.05)',
            }}
          />
        ))}
      </div>

      {/* Bonfire — the movement's safe-point, survivors gather around it */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1,
        }}
      >
        <Bonfire size={150} />
      </div>

      {/* Near layer: the squad standing watch at the fire, drawn from resting
          frames of their battle skins (backs to us, facing the dark). */}
      <div
        style={{
          position: 'absolute',
          bottom: -10,
          left: '2%',
          display: 'flex',
          alignItems: 'flex-end',
          gap: 4,
          zIndex: 2,
        }}
      >
        {HERO_LINE.left.map((h) => (
          <HeroFigure key={h.id} {...h} />
        ))}
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: -10,
          right: '2%',
          display: 'flex',
          alignItems: 'flex-end',
          gap: 4,
          zIndex: 2,
        }}
      >
        {HERO_LINE.right.map((h) => (
          <HeroFigure key={h.id} {...h} />
        ))}
      </div>
    </div>
  );
}

/** Currency pill in the top status strip. */
function BalancePill({ icon, label, value, valueColor }: {
  icon: ReactNode;
  label: string;
  value: string;
  valueColor: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        minHeight: 44,
        padding: '6px 14px',
        backgroundColor: theme.colors.surfaceGlass,
        border: `1px solid ${theme.colors.borderGlass}`,
        borderRadius: 999,
        backdropFilter: 'blur(12px)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
      }}
    >
      {icon}
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
        <span style={{ fontSize: 10, letterSpacing: 1, color: theme.colors.textMuted, textTransform: 'uppercase', fontWeight: 700 }}>
          {label}
        </span>
        <span style={{ fontSize: 16, fontWeight: 900, color: valueColor }}>{value}</span>
      </div>
    </div>
  );
}

/** Secondary nav styled as a charred iron menu slot, tacked up at a tilt. */
function PlacardButton({ icon, label, sublabel, tilt, onClick }: {
  icon: ReactNode;
  label: string;
  sublabel: string;
  tilt: number;
  onClick: () => void;
}) {
  return (
    <SoulsButton
      onClick={onClick}
      style={{ minWidth: 200, transform: `rotate(${tilt}deg)`, textAlign: 'left', justifyContent: 'flex-start' }}
    >
      <span style={{ color: theme.colors.accent, display: 'flex' }}>{icon}</span>
      <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
        <span style={{ fontWeight: 900, fontSize: 16, textTransform: 'uppercase', letterSpacing: 1, color: theme.colors.textPrimary }}>{label}</span>
        <span style={{ fontSize: 11, color: theme.colors.textMuted, letterSpacing: 0.5, textTransform: 'none' }}>{sublabel}</span>
      </span>
    </SoulsButton>
  );
}

export function MainMenu({ onPlay, onStore, onInventory }: MainMenuProps) {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  useEffect(() => subscribeMetaState(forceUpdate), []);
  
  const hope = getHope();
  const permits = getPermits();

  return (
    <div
      className="rally-screen"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'auto',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        background: `radial-gradient(ellipse at 50% 8%, rgba(88, 28, 8, 0.4) 0%, transparent 45%), linear-gradient(180deg, ${theme.colors.background} 0%, #14100e 55%, #0c0a09 100%)`,
      }}
    >
      <RuinedSkyline height="52%" />
      <FireVignette />
      <Embers count={14} />

      {/* strung-up street wire with bulbs — half of them dead/dark */}
      <svg
        viewBox="0 0 800 90"
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{ position: 'absolute', top: 64, left: 0, width: '100%', height: 90, pointerEvents: 'none' }}
      >
        <path d="M-10 12 Q 200 66 400 34 T 810 22" fill="none" stroke={theme.materials.metalDark} strokeWidth="2" />
        {[90, 230, 390, 545, 700].map((x, i) => {
          const dead = i % 2 === 1; // every other bulb is smashed/dark
          const cy = (i % 2 === 0 ? 34 : 40) + 20;
          return (
            <g key={x}>
              <line x1={x} y1={i % 2 === 0 ? 34 : 40} x2={x} y2={(i % 2 === 0 ? 34 : 40) + 14} stroke={theme.materials.metalDark} strokeWidth="2" />
              <circle cx={x} cy={cy} r="5" fill={dead ? '#3f3f46' : '#ea580c'} opacity={dead ? 0.6 : 0.85} />
              {!dead && <circle cx={x} cy={cy} r="16" fill="#ea580c" opacity="0.18" />}
            </g>
          );
        })}
      </svg>

      {/* Ang Sistema — the finale boss, rendered GIGANTIC and deliberately
          overflowing the frame: anchored at the bottom and scaled up so it towers
          behind the rally, head/shoulders cut off by the screen edges. Sits behind
          the crowd (earlier in the DOM) so the heroes read in front of it. */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: '22%',
          left: '50%',
          transform: 'translateX(-50%) scale(2.7)',
          transformOrigin: 'bottom center',
          pointerEvents: 'none',
        }}
      >
        <SpriteBust
          sheet={ANG_SISTEMA_BOSS.sheet}
          columns={ANG_SISTEMA_BOSS.columns}
          rows={ANG_SISTEMA_BOSS.rows}
          frame={ANG_SISTEMA_BOSS.frame}
          width={260}
          showFrac={0.62}
          opacity={0.8}
          filter="brightness(0.4) saturate(0.85) contrast(1.05) drop-shadow(0 0 30px rgba(220, 38, 38, 0.4))"
        />
      </div>

      <RallyCrowd />

      {/* Top status strip: Hope + Permits */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 10,
          padding: '14px 16px',
          flexWrap: 'wrap',
        }}
      >
        <BalancePill
          icon={<span style={{ color: theme.colors.gold, display: 'flex' }}><HopeCoinIcon size={22} /></span>}
          label="Hope Points"
          value={hope.toLocaleString()}
          valueColor={theme.colors.gold}
        />
        <BalancePill
          icon={<span style={{ color: theme.colors.accent, display: 'flex' }}><RallyPermitIcon size={22} /></span>}
          label="Rally Permits"
          value={`${permits}`}
          valueColor={theme.colors.textPrimary}
        />
      </div>

      {/* Title tarp */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'center', padding: '4vh 16px 0' }}>
        <div
          style={{
            position: 'relative',
            padding: '18px 34px 22px',
            background: 'linear-gradient(160deg, #4a1414 0%, #2a0e0e 60%, #140808 100%)',
            border: `2px solid ${theme.materials.rustDark}`,
            // singed, torn banner edge
            clipPath: 'polygon(0 8%, 4% 0, 96% 3%, 100% 10%, 98% 90%, 100% 100%, 3% 97%, 0 88%)',
            boxShadow: '0 14px 34px rgba(0,0,0,0.6), inset 0 0 40px rgba(0,0,0,0.55), 0 0 40px rgba(234,88,12,0.18)',
            transform: 'rotate(-1.2deg)',
            textAlign: 'center',
            maxWidth: '92%',
          }}
        >
          {/* rope ties at the tarp corners */}
          {[
            { top: -7, left: 14 },
            { top: -7, right: 14 },
            { bottom: -7, left: 14 },
            { bottom: -7, right: 14 },
          ].map((pos, i) => (
            <span
              key={i}
              aria-hidden="true"
              style={{
                position: 'absolute',
                width: 14,
                height: 14,
                borderRadius: '50%',
                border: `3px solid ${theme.materials.metal}`,
                backgroundColor: theme.materials.woodDark,
                ...pos,
              }}
            />
          ))}
          <h1
            style={{
              margin: 0,
              fontSize: 'clamp(34px, 8vw, 68px)',
              color: theme.materials.paperAged,
              fontWeight: 900,
              letterSpacing: 4,
              textTransform: 'uppercase',
              textShadow: `0 0 16px ${theme.colors.accent}, 0 4px 12px rgba(0,0,0,0.8)`,
              lineHeight: 1,
            }}
          >
            First Ripple
          </h1>
          <div
            style={{
              marginTop: 6,
              fontFamily: MARKER_FONT,
              fontSize: 'clamp(12px, 2.4vw, 17px)',
              color: '#fecaca',
              letterSpacing: 2,
            }}
          >
            mula sa isang boses, isang alon
          </div>
        </div>
      </div>

      {/* Actions */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          marginTop: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 14,
          padding: '0 16px calc(24px + 6vh)',
        }}
      >
        <SoulsButton variant="primary" size="lg" onClick={onPlay} className="rally-pulse">
          <MegaphoneIcon size={30} />
          Start the Rally
        </SoulsButton>

        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
          <PlacardButton
            icon={<ChestIcon size={26} />}
            label="Sari-Sari Store"
            sublabel="Spend Hope on supplies"
            tilt={-1.5}
            onClick={onStore}
          />
          <PlacardButton
            icon={<HeroCardIcon size={26} />}
            label="The Archive"
            sublabel="Roster & Truth Codex"
            tilt={1.5}
            onClick={onInventory}
          />
        </div>
      </div>
    </div>
  );
}
