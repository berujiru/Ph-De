import type { ReactNode } from 'react';
import { theme } from '../theme';
import {
  ChestIcon,
  HeroCardIcon,
  HopeCoinIcon,
  MegaphoneIcon,
  RallyPermitIcon,
} from '../icons';

interface MainMenuProps {
  onPlay: () => void;
  onStore: () => void;
  onInventory: () => void;
}

const MARKER_FONT = '"Segoe Print", "Bradley Hand", "Comic Sans MS", cursive';

// Mock meta balances (PROGRESSION.md: Hope Points + Rally Permits).
const MOCK_HOPE = 1450;
const MOCK_PERMITS = 3;

/** Distant city skyline behind the rally. */
function Skyline() {
  return (
    <svg
      viewBox="0 0 800 200"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '45%', opacity: 0.55 }}
    >
      <g fill="#0b1120">
        <rect x="0" y="90" width="70" height="110" />
        <rect x="80" y="50" width="55" height="150" />
        <rect x="145" y="110" width="80" height="90" />
        <rect x="240" y="30" width="60" height="170" />
        <rect x="315" y="80" width="90" height="120" />
        <rect x="420" y="55" width="50" height="145" />
        <rect x="485" y="100" width="85" height="100" />
        <rect x="585" y="40" width="65" height="160" />
        <rect x="665" y="85" width="70" height="115" />
        <rect x="745" y="120" width="55" height="80" />
      </g>
      {/* lit windows */}
      <g fill="#facc15" opacity="0.28">
        <rect x="92" y="66" width="8" height="10" />
        <rect x="112" y="90" width="8" height="10" />
        <rect x="252" y="46" width="8" height="10" />
        <rect x="272" y="70" width="8" height="10" />
        <rect x="597" y="58" width="8" height="10" />
        <rect x="617" y="100" width="8" height="10" />
        <rect x="435" y="72" width="8" height="10" />
        <rect x="500" y="118" width="8" height="10" />
      </g>
    </svg>
  );
}

/** The crowd at the bottom edge: placards, raised fists, and the squad. */
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
        <g fill="#111c33">
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
        <g stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" opacity="0.5">
          <path d="M86 80h58M86 96h38" />
          <path d="M268 52h64M268 68h44" transform="rotate(-6 302 62)" />
          <path d="M486 72h58M486 88h36" transform="rotate(5 518 82)" />
        </g>
      </svg>

      {/* Eden and two allies front and center */}
      <div
        style={{
          position: 'absolute',
          bottom: -14,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'flex-end',
          gap: 4,
        }}
      >
        <img
          src="/assets/heroes/hero-placeholder.svg"
          alt=""
          style={{ width: 110, height: 110, opacity: 0.85, transform: 'scaleX(-1)' }}
        />
        <img
          src="/assets/heroes/hero-placeholder.svg"
          alt=""
          style={{
            width: 170,
            height: 170,
            filter: 'drop-shadow(0 0 24px rgba(56, 189, 248, 0.45))',
          }}
        />
        <img
          src="/assets/heroes/hero-placeholder.svg"
          alt=""
          style={{ width: 120, height: 120, opacity: 0.85 }}
        />
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

/** Secondary nav styled as a hand-held protest placard. */
function PlacardButton({ icon, label, sublabel, tilt, onClick }: {
  icon: ReactNode;
  label: string;
  sublabel: string;
  tilt: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        minHeight: 64,
        minWidth: 200,
        padding: '10px 18px',
        backgroundColor: theme.colors.surfaceGlass,
        color: theme.colors.textPrimary,
        border: `1px solid ${theme.colors.borderGlass}`,
        borderTop: `4px solid ${theme.materials.woodLight}`,
        borderRadius: 8,
        cursor: 'pointer',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 6px 16px rgba(0,0,0,0.45)',
        transform: `rotate(${tilt}deg)`,
        transition: 'transform 0.12s, border-color 0.12s',
        textAlign: 'left',
        fontFamily: 'inherit',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'rotate(0deg) translateY(-3px)';
        e.currentTarget.style.borderColor = theme.colors.accent;
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = `rotate(${tilt}deg)`;
        e.currentTarget.style.borderColor = theme.colors.borderGlass;
        e.currentTarget.style.borderTopColor = theme.materials.woodLight;
      }}
    >
      <span style={{ color: theme.colors.accent, display: 'flex' }}>{icon}</span>
      <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
        <span style={{ fontWeight: 900, fontSize: 16, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</span>
        <span style={{ fontSize: 12, color: theme.colors.textMuted }}>{sublabel}</span>
      </span>
    </button>
  );
}

export function MainMenu({ onPlay, onStore, onInventory }: MainMenuProps) {
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
        background: 'linear-gradient(180deg, #0f172a 0%, #131f38 55%, #1e293b 100%)',
      }}
    >
      <Skyline />

      {/* strung-up street wire with bulbs */}
      <svg
        viewBox="0 0 800 90"
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{ position: 'absolute', top: 64, left: 0, width: '100%', height: 90, pointerEvents: 'none' }}
      >
        <path d="M-10 12 Q 200 66 400 34 T 810 22" fill="none" stroke={theme.materials.metalDark} strokeWidth="2" />
        {[90, 230, 390, 545, 700].map((x, i) => (
          <g key={x}>
            <line x1={x} y1={i % 2 === 0 ? 34 : 40} x2={x} y2={(i % 2 === 0 ? 34 : 40) + 14} stroke={theme.materials.metalDark} strokeWidth="2" />
            <circle cx={x} cy={(i % 2 === 0 ? 34 : 40) + 20} r="5" fill={theme.materials.cautionYellow} opacity="0.75" />
            <circle cx={x} cy={(i % 2 === 0 ? 34 : 40) + 20} r="11" fill={theme.materials.cautionYellow} opacity="0.12" />
          </g>
        ))}
      </svg>

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
          value={MOCK_HOPE.toLocaleString()}
          valueColor={theme.colors.gold}
        />
        <BalancePill
          icon={<span style={{ color: theme.colors.accent, display: 'flex' }}><RallyPermitIcon size={22} /></span>}
          label="Rally Permits"
          value={`${MOCK_PERMITS}`}
          valueColor={theme.colors.textPrimary}
        />
      </div>

      {/* Title tarp */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'center', padding: '4vh 16px 0' }}>
        <div
          style={{
            position: 'relative',
            padding: '18px 34px 22px',
            backgroundColor: 'rgba(185, 28, 28, 0.92)',
            border: '2px solid rgba(0,0,0,0.35)',
            borderRadius: 4,
            boxShadow: '0 14px 34px rgba(0,0,0,0.55), inset 0 0 40px rgba(0,0,0,0.35)',
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
              color: theme.materials.paper,
              fontWeight: 900,
              letterSpacing: 4,
              textTransform: 'uppercase',
              textShadow: '3px 3px 0 rgba(0,0,0,0.45)',
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
        <button
          onClick={onPlay}
          className="rally-pulse"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            minHeight: 64,
            padding: '16px 36px',
            fontSize: 'clamp(18px, 4vw, 26px)',
            backgroundColor: theme.colors.accent,
            color: theme.colors.background,
            border: 'none',
            borderRadius: 999,
            cursor: 'pointer',
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: 2,
            boxShadow: '0 0 34px rgba(56, 189, 248, 0.45), 0 6px 0 #0284c7',
            fontFamily: 'inherit',
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.boxShadow = '0 0 16px rgba(56, 189, 248, 0.3), 0 1px 0 #0284c7';
            e.currentTarget.style.transform = 'translateY(4px)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.boxShadow = '0 0 34px rgba(56, 189, 248, 0.45), 0 6px 0 #0284c7';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <MegaphoneIcon size={30} />
          Start the Rally
        </button>

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
