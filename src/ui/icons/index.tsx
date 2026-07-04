/**
 * Rally-motif icon library — hand-authored SVG icon components.
 *
 * Style rules (see src/ui/icons/README.md and docs/DESIGN_GUIDELINES.md):
 * - 24×24 viewBox, stroke="currentColor", strokeWidth 2, fill "none".
 * - Flat fills (`currentColor`) only where line art can't read at size
 *   (coin star, eye sockets, star variant).
 * - Icons inherit color from CSS `color` — pick the theme token at the
 *   usage site by *meaning* (gold = currency, danger = loss, etc.).
 */
import type { ComponentType, ReactNode } from 'react';

export interface IconProps {
  /** Rendered width/height in px. Defaults to 24. */
  size?: number;
  className?: string;
}

interface SvgIconProps extends IconProps {
  children: ReactNode;
}

function SvgIcon({ size = 24, className, children }: SvgIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Rally / protest motif                                               */
/* ------------------------------------------------------------------ */

/** Megaphone — primary CTA, announcements, "Start Wave". */
export function MegaphoneIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M3 10v4l12 4V6L3 10z" />
      <path d="M18 9a4 4 0 0 1 0 6" />
      <path d="M6 14.8V19a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-3.5" />
    </SvgIcon>
  );
}

/** Protest placard on a stick. */
export function PlacardIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <rect x="5" y="3" width="14" height="10" rx="1" />
      <path d="M12 13v8" />
      <path d="M9 7h6" />
      <path d="M9 10h4" />
    </SvgIcon>
  );
}

/** Street barricade with hazard stripes. */
export function BarricadeIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <rect x="3" y="6" width="18" height="6" rx="1" />
      <path d="M9 6l-3 6M15 6l-3 6M21 6.5 18.5 12" />
      <path d="M6 12l-1.5 8M18 12l1.5 8" />
    </SvgIcon>
  );
}

/** Raised fist — solidarity, rally strength. */
export function RaisedFistIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M8 11V6.5a1.5 1.5 0 0 1 3 0V11" />
      <path d="M11 10.5v-5a1.5 1.5 0 0 1 3 0v5" />
      <path d="M14 11V6.5a1.5 1.5 0 0 1 3 0V12" />
      <path d="M17 12v3a5 5 0 0 1-10 0v-4" />
      <path d="M9.5 21v-1.5M14.5 21v-1.5" />
    </SvgIcon>
  );
}

/** Hope Points coin — currency. Render with the `gold` token. */
export function HopeCoinIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path
        d="M12 7l1.3 3.2 3.2 1.3-3.2 1.3L12 16l-1.3-3.2L7.5 11.5l3.2-1.3z"
        fill="currentColor"
        stroke="none"
      />
    </SvgIcon>
  );
}

/** Rally Permit — ticket stub (energy system). */
export function RallyPermitIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M3 6a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v3a3 3 0 0 0 0 6v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3a3 3 0 0 0 0-6z" />
      <path d="M15 5v2.5M15 10.5v3M15 16.5V19" />
    </SvgIcon>
  );
}

/** Hero Card — leveling currency for heroes. */
export function HeroCardIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <rect x="6" y="3" width="12" height="18" rx="2" />
      <path
        d="M12 8l.9 2 2.1.3-1.5 1.4.4 2.1-1.9-1-1.9 1 .4-2.1L9 10.3l2.1-.3z"
        fill="currentColor"
        stroke="none"
      />
      <path d="M9 17h6" />
    </SvgIcon>
  );
}

/** Voices meter — sound waves rising from the crowd. */
export function VoicesIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <circle cx="4.5" cy="12" r="1" fill="currentColor" stroke="none" />
      <path d="M8.5 9.5a4 4 0 0 1 0 5" />
      <path d="M11.5 7.5a7.5 7.5 0 0 1 0 9" />
      <path d="M14.5 5.5a11 11 0 0 1 0 13" />
    </SvgIcon>
  );
}

/** Barrier of the Philippines — shield (barrier HP / integrity). */
export function BarrierIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M12 3l7 3v5c0 4.6-3 8.6-7 10-4-1.4-7-5.4-7-10V6z" />
    </SvgIcon>
  );
}

/** Incoming enemy wave — anomalies descend from the top. */
export function WaveIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M6 5v9" />
      <path d="m3.5 11.5 2.5 3 2.5-3" />
      <path d="M12 8v9" />
      <path d="m9.5 14.5 2.5 3 2.5-3" />
      <path d="M18 5v9" />
      <path d="m15.5 11.5 2.5 3 2.5-3" />
    </SvgIcon>
  );
}

/* ------------------------------------------------------------------ */
/* Progress & meta                                                     */
/* ------------------------------------------------------------------ */

/** Stage star — earned (filled) variant. */
export function StarIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path
        d="M12 3l2.7 5.5 6 .9-4.3 4.2 1 6-5.4-2.8L6.6 19.6l1-6L3.3 9.4l6-.9z"
        fill="currentColor"
      />
    </SvgIcon>
  );
}

/** Stage star — unearned (outline) variant. */
export function StarOutlineIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M12 3l2.7 5.5 6 .9-4.3 4.2 1 6-5.4-2.8L6.6 19.6l1-6L3.3 9.4l6-.9z" />
    </SvgIcon>
  );
}

/** Locked content (stages, heroes, Acts). */
export function LockIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      <path d="M12 15h.01" />
    </SvgIcon>
  );
}

/** Victory — the raised flag over the rally. */
export function VictoryIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M6 21V3" />
      <path d="M6 4h11l-2.5 3.5L17 11H6" />
    </SvgIcon>
  );
}

/** Defeat / lethal threat. */
export function SkullIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M19.5 11a7.5 7.5 0 1 0-12.8 5.3c.8.8 1.3 1.7 1.3 2.7v1h8v-1c0-1 .5-1.9 1.3-2.7A7.5 7.5 0 0 0 19.5 11z" />
      <circle cx="9.2" cy="11" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="14.8" cy="11" r="1.3" fill="currentColor" stroke="none" />
      <path d="M10.5 20v-1.5M13.5 20v-1.5" />
    </SvgIcon>
  );
}

/** Campaign map location marker. */
export function MapPinIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M12 21s-7-5.4-7-11a7 7 0 0 1 14 0c0 5.6-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </SvgIcon>
  );
}

/** Spoils of war / drops chest. */
export function ChestIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M4 20V10a5 5 0 0 1 5-5h6a5 5 0 0 1 5 5v10z" />
      <path d="M4 13h16" />
      <rect x="10.75" y="11.25" width="2.5" height="3.5" rx="1" />
    </SvgIcon>
  );
}

/* ------------------------------------------------------------------ */
/* Chrome / controls                                                   */
/* ------------------------------------------------------------------ */

/** Back navigation arrow. */
export function BackIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M19 12H5" />
      <path d="M11 6l-6 6 6 6" />
    </SvgIcon>
  );
}

/** Play / resume. */
export function PlayIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M7 4.5v15l12-7.5z" />
    </SvgIcon>
  );
}

/** Pause. */
export function PauseIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </SvgIcon>
  );
}

/** Game speed / fast-forward toggle. */
export function SpeedIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M4 6v12l8-6z" />
      <path d="M12 6v12l8-6z" />
    </SvgIcon>
  );
}

/** Settings gear. */
export function SettingsIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 2.5V5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3 7 7M17 17l1.7 1.7M18.7 5.3 17 7M7 17l-1.7 1.7" />
    </SvgIcon>
  );
}

/** Info / details. */
export function InfoIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <path d="M12 8h.01" />
    </SvgIcon>
  );
}

/** Close / dismiss. */
export function CloseIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </SvgIcon>
  );
}

/** Confirm / valid / complete. */
export function CheckIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M5 13l4.5 4.5L19 7" />
    </SvgIcon>
  );
}

/** Add / summon / increase. */
export function PlusIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </SvgIcon>
  );
}

/* ------------------------------------------------------------------ */
/* Damage types (docs/DAMAGE_AND_AILMENTS.md)                          */
/* ------------------------------------------------------------------ */

/** Physical — a striking fist. */
export function PhysicalIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M5 11a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3a5 5 0 0 1-5 5h-4a5 5 0 0 1-5-5z" />
      <path d="M9.5 9v3M12 9v3M14.5 9v3" />
    </SvgIcon>
  );
}

/** Magic — arcane sparkles. */
export function MagicIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M10.5 4l1.6 4.4L16.5 10l-4.4 1.6L10.5 16l-1.6-4.4L4.5 10l4.4-1.6z" />
      <path d="M18 15l.8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8z" />
    </SvgIcon>
  );
}

/** Fire — flame (Burn DoT). */
export function FireIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M12 3c2.5 3 5 5.8 5 9.5a5 5 0 0 1-10 0c0-1.6.6-3.1 1.5-4.5.5 1 1.2 1.8 2.2 2.2C10.4 8 11 5.5 12 3z" />
    </SvgIcon>
  );
}

/** Frost — snowflake (Slow / Freeze control). */
export function FrostIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M12 3v18" />
      <path d="M4.2 7.5l15.6 9" />
      <path d="M4.2 16.5l15.6-9" />
      <path d="M9.8 4.2 12 6.4l2.2-2.2M9.8 19.8 12 17.6l2.2 2.2" />
    </SvgIcon>
  );
}

/** Lightning — bolt (burst + interrupt). */
export function LightningIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M13 2 5 13h5l-1 9 8-11h-5z" />
    </SvgIcon>
  );
}

/** Water — droplet (Wet enabler). */
export function WaterIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M12 3s6 6.2 6 11a6 6 0 0 1-12 0c0-4.8 6-11 6-11z" />
    </SvgIcon>
  );
}

/** Wind — gust lines (knockback / time-buyer). */
export function WindIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M3 8h8.5A2.25 2.25 0 1 0 9.3 5.2" />
      <path d="M3 12h14.5a2.25 2.25 0 1 1-2.2 2.8" />
      <path d="M3 16h9.5a2 2 0 1 1-1.9 2.6" />
    </SvgIcon>
  );
}

/** Earth — mountain (armor shred, grounded). */
export function EarthIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M3 20 8 8l3.6 6.4L14 11l7 9z" />
    </SvgIcon>
  );
}

/** Holy — radiant sun (anti-undead). */
export function HolyIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 2.5V5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3 7 7M17 17l1.7 1.7M18.7 5.3 17 7M7 17l-1.7 1.7" />
    </SvgIcon>
  );
}

/** Dark — crescent moon (Curse force multiplier). */
export function DarkIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M20 13.5A8.5 8.5 0 1 1 10.5 4a7 7 0 0 0 9.5 9.5z" />
    </SvgIcon>
  );
}

/**
 * Damage-type icon lookup, keyed by the ids used in
 * `src/game/data/balance.ts` (`HeroDefinition['damageType']`).
 * `Magic` is included ahead of its balance.ts carrier because
 * docs/DAMAGE_AND_AILMENTS.md ships 10 types.
 */
// oxlint-disable-next-line react/only-export-components -- the lookup table belongs with the icons; fast refresh is irrelevant for a leaf icon module
export const damageTypeIcons: Record<string, ComponentType<IconProps>> = {
  Physical: PhysicalIcon,
  Magic: MagicIcon,
  Fire: FireIcon,
  Frost: FrostIcon,
  Lightning: LightningIcon,
  Water: WaterIcon,
  Wind: WindIcon,
  Earth: EarthIcon,
  Holy: HolyIcon,
  Dark: DarkIcon,
};
