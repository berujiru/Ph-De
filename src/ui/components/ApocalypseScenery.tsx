import type { CSSProperties, ReactNode } from 'react';
import { theme } from '../theme';

/**
 * Souls-inspired post-apocalypse scenery kit.
 *
 * The anomalies of corruption have scorched the world: buildings have
 * collapsed, fires burn on the horizon, and embers drift up from the ruins.
 * These are purely decorative (aria-hidden) pieces shared across the meta
 * screens so every surface reads as the same ruined world.  All motion is
 * deterministic (index math, no `Math.random` in render) and respects
 * `prefers-reduced-motion` via the `.ember-particle` rules in App.css.
 */

/** Drifting sparks rising off the ruins. Deterministic layout per index. */
export function Embers({ count = 12, style }: { count?: number; style?: CSSProperties }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 2,
        ...style,
      }}
    >
      {Array.from({ length: count }, (_, i) => {
        // Spread embers across the width with staggered timing — all derived
        // from the index so renders are stable (no random reflow).
        const left = ((i * 37) % 100);
        const dur = 5 + (i % 5); // 5–9s
        const delay = (i % 7) * 0.9;
        const drift = (i % 2 === 0 ? 1 : -1) * (6 + (i % 4) * 4);
        const size = 2 + (i % 3);
        return (
          <span
            key={i}
            className="ember-particle"
            style={{
              left: `${left}%`,
              width: size,
              height: size,
              // CSS custom props consumed by the ember-rise keyframes.
              ['--ember-dur' as string]: `${dur}s`,
              ['--ember-delay' as string]: `${delay}s`,
              ['--ember-drift' as string]: `${drift}px`,
            }}
          />
        );
      })}
    </div>
  );
}

/**
 * A skyline of collapsed buildings — tilted towers, jagged broken tops,
 * exposed rebar, ember-lit windows, and distant fire glow with smoke.
 */
export function RuinedSkyline({
  height = '50%',
  opacity = 0.85,
  style,
}: {
  height?: string;
  opacity?: number;
  style?: CSSProperties;
}) {
  return (
    <div
      aria-hidden="true"
      style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height, pointerEvents: 'none', ...style }}
    >
      {/* Distant fire glow behind the ruins. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at 22% 100%, rgba(234,88,12,0.28) 0%, transparent 42%),' +
            'radial-gradient(ellipse at 78% 100%, rgba(220,38,38,0.18) 0%, transparent 40%)',
        }}
      />
      <svg
        viewBox="0 0 800 220"
        preserveAspectRatio="xMidYMax slice"
        style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '100%', opacity }}
      >
        {/* Collapsed / jagged silhouettes — broken tops, leaning towers. */}
        <g fill={theme.materials.charredWall}>
          {/* left cluster */}
          <path d="M0 220V96l24-8 6 14 14-6v-18l22 6v-14l30 10v130z" />
          {/* leaning tower with sheared top */}
          <path d="M128 220V54l52 12 8 26 10-6v134z" transform="rotate(-3 160 140)" />
          {/* wide ruin with a blown-out hole */}
          <path d="M212 220V112l90-14v-20l16 6v136zM250 150h34v40h-34z" fillRule="evenodd" />
          {/* tall gutted spire */}
          <path d="M334 220V40l40 8 4 20 12-4v156z" />
          {/* rubble mound */}
          <path d="M398 220v-56q34-26 64-8t70-2v66z" />
          {/* right cluster of shattered blocks */}
          <path d="M540 220V84l30 8v-16l24 10 6-12 20 12v134z" transform="rotate(2 580 150)" />
          <path d="M632 220V108l58-12v-22l14 8v138z" />
          <path d="M720 220V72l40 10 6 22 34-8v124z" />
        </g>
        {/* Exposed rebar / snapped beams poking from the broken tops. */}
        <g stroke={theme.materials.metalDark} strokeWidth="2" opacity="0.7" strokeLinecap="round">
          <path d="M150 54l-4-14M166 60l2-16M178 66l6-12" />
          <path d="M342 40l-3-16M356 44l4-14M372 48l7-12" />
          <path d="M636 96l-3-14M650 98l3-12" />
          <path d="M726 72l-4-14M742 76l5-12" />
        </g>
        {/* Ember-lit windows — a few survivors' fires still burning inside. */}
        <g fill="#ea580c">
          {[
            [40, 120], [60, 150], [250, 130], [268, 168], [348, 90], [360, 130],
            [572, 120], [648, 130], [664, 160], [736, 110], [752, 150],
          ].map(([x, y], i) => (
            <rect key={i} x={x} y={y} width="7" height="9" opacity={i % 3 === 0 ? 0.85 : 0.5} />
          ))}
        </g>
      </svg>
      {/* Smoke plume drifting off the tallest ruins. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(to top, ${theme.materials.corruptionFog}, transparent 60%)`,
        }}
      />
    </div>
  );
}

/** Full-screen vignette: dark ash edges with a low warm ember glow. */
export function FireVignette({ style }: { style?: CSSProperties }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1,
        background:
          'radial-gradient(ellipse at 50% 118%, rgba(234,88,12,0.12) 0%, transparent 45%),' +
          'radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(9,9,11,0.55) 100%)',
        ...style,
      }}
    >{null}</div>
  );
}

/**
 * A bonfire — the souls "safe point" motif: layered warm glow with a
 * flickering flame silhouette.  Survivors gather around it.
 */
export function Bonfire({ size = 120, style }: { size?: number; style?: CSSProperties }) {
  return (
    <div
      aria-hidden="true"
      className="rally-flicker"
      style={{ position: 'relative', width: size, height: size, ...style }}
    >
      {/* pooled glow on the ground */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 0,
          transform: 'translateX(-50%)',
          width: size,
          height: size * 0.5,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(234,88,12,0.4) 0%, rgba(234,88,12,0.08) 55%, transparent 75%)',
        }}
      />
      {/* flame */}
      <svg
        viewBox="0 0 40 60"
        style={{ position: 'absolute', left: '50%', bottom: size * 0.14, transform: 'translateX(-50%)', width: size * 0.42, height: size * 0.62 }}
      >
        <path d="M20 4C13 18 8 22 8 34a12 12 0 0 0 24 0c0-8-4-11-6-18-3 6-5 7-8 6 2-8 4-14 2-24z" fill="#ea580c" />
        <path d="M20 20c-4 8-6 9-6 16a6 6 0 0 0 12 0c0-5-3-7-4-11-1 3-2 4-4 3 2-4 3-5 2-11z" fill="#facc15" />
      </svg>
      {/* charred logs */}
      <svg viewBox="0 0 60 20" style={{ position: 'absolute', left: '50%', bottom: 0, transform: 'translateX(-50%)', width: size * 0.7, height: size * 0.24 }}>
        <g stroke={theme.materials.woodDark} strokeWidth="5" strokeLinecap="round">
          <path d="M8 14L52 8" />
          <path d="M8 8L52 14" />
        </g>
      </svg>
    </div>
  );
}

// ------------------------------------------------------------------ souls button

interface SoulsButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  children: ReactNode;
  /** `primary` = ember-lit CTA, `secondary` = charred slot. */
  variant?: 'primary' | 'secondary';
  size?: 'lg' | 'md';
  style?: CSSProperties;
  'aria-label'?: string;
  'aria-pressed'?: boolean;
  className?: string;
  title?: string;
}

/** Cut-corner clip that gives the DS3/Elden Ring menu-slot silhouette. */
const CUT_CORNER =
  'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)';

/**
 * Souls-style menu button: a charred iron slot with cut corners, a rust
 * frame, ornamental corner marks, and an ember glow that flares on hover
 * (see `.souls-btn` in App.css).  Primary reads as ember-lit; secondary as
 * cold charred metal.  Disabled falls to lifeless ash.
 */
export function SoulsButton({
  onClick,
  disabled = false,
  children,
  variant = 'secondary',
  size = 'md',
  style,
  className,
  ...rest
}: SoulsButtonProps) {
  const primary = variant === 'primary';
  const lg = size === 'lg';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`souls-btn${className ? ` ${className}` : ''}`}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: lg ? 14 : 10,
        minHeight: lg ? 60 : 48,
        padding: lg ? '14px 32px' : '10px 20px',
        background: disabled
          ? 'linear-gradient(180deg, #201d1b 0%, #131110 100%)'
          : primary
            ? `linear-gradient(180deg, #3a1e0c 0%, #1a1410 100%)`
            : `linear-gradient(180deg, #1f1a16 0%, #0c0a09 100%)`,
        color: disabled
          ? theme.colors.textMuted
          : primary
            ? theme.colors.textPrimary
            : theme.colors.textSecondary,
        border: `1px solid ${disabled ? theme.materials.metalDark : primary ? theme.colors.accent : theme.materials.rust}`,
        clipPath: CUT_CORNER,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit',
        fontWeight: 900,
        fontSize: lg ? 'clamp(16px, 3.6vw, 22px)' : 14,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        textShadow: disabled ? 'none' : '0 1px 3px rgba(0,0,0,0.8)',
        boxShadow: disabled
          ? 'none'
          : primary
            ? '0 0 18px rgba(234,88,12,0.35), inset 0 0 14px rgba(234,88,12,0.14), inset 0 1px 0 rgba(255,255,255,0.06)'
            : 'inset 0 0 12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)',
        ...style,
      }}
      {...rest}
    >
      {/* Ornamental rust corner marks (top-left, bottom-right of the cut). */}
      {!disabled && (
        <>
          <span
            aria-hidden="true"
            style={{
              position: 'absolute', top: 3, left: 6, width: 8, height: 8,
              borderTop: `2px solid ${primary ? theme.colors.accent : theme.materials.rust}`,
              borderLeft: `2px solid ${primary ? theme.colors.accent : theme.materials.rust}`,
              opacity: 0.8,
            }}
          />
          <span
            aria-hidden="true"
            style={{
              position: 'absolute', bottom: 3, right: 6, width: 8, height: 8,
              borderBottom: `2px solid ${primary ? theme.colors.accent : theme.materials.rust}`,
              borderRight: `2px solid ${primary ? theme.colors.accent : theme.materials.rust}`,
              opacity: 0.8,
            }}
          />
        </>
      )}
      {children}
    </button>
  );
}
