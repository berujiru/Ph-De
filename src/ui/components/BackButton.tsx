import { theme } from '../theme';
import { BackIcon } from '../icons';

interface BackButtonProps {
  onClick: () => void;
  /** Short label, e.g. "Back to the Rally". */
  label?: string;
  /**
   * Tone for backgrounds the button sits on. `dark` (default) is the glassy
   * slate treatment; `wood`/`cork` warm it for the store / archive scenery.
   */
  tone?: 'dark' | 'wood' | 'cork';
}

const TONE: Record<NonNullable<BackButtonProps['tone']>, { bg: string; edge: string }> = {
  dark: { bg: 'rgba(24, 24, 27, 0.85)', edge: theme.materials.metalDark },
  wood: { bg: 'rgba(26, 20, 16, 0.85)', edge: theme.materials.woodLight },
  cork: { bg: 'rgba(30, 24, 20, 0.85)', edge: theme.materials.woodLight },
};

/**
 * Shared rally-themed back control — a small protest placard on a stick.
 * The arrow sits in an accent chip; a caution-tape edge runs down the left so
 * the control reads as "street signage" rather than a generic browser back.
 */
export function BackButton({ onClick, label = 'Back', tone = 'dark' }: BackButtonProps) {
  const t = TONE[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        minHeight: 44,
        padding: '8px 16px 8px 10px',
        position: 'relative',
        backgroundColor: t.bg,
        color: theme.colors.textPrimary,
        border: `1px solid ${theme.colors.borderGlass}`,
        borderLeft: `4px solid ${theme.colors.accent}`,
        borderRadius: '4px 10px 10px 4px',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        boxShadow: `0 6px 14px rgba(0,0,0,0.4)`,
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontWeight: 800,
        fontSize: 13,
        letterSpacing: 1,
        textTransform: 'uppercase',
        transition: 'transform 0.12s ease, border-color 0.12s ease, box-shadow 0.12s ease',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateX(-3px)';
        e.currentTarget.style.boxShadow = '0 0 20px rgba(234, 88, 12, 0.4)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateX(0)';
        e.currentTarget.style.boxShadow = '0 6px 14px rgba(0,0,0,0.4)';
      }}
    >
      {/* nail head, like a sign tacked to a post */}
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 5,
          left: 5,
          width: 5,
          height: 5,
          borderRadius: '50%',
          backgroundColor: t.edge,
          boxShadow: 'inset -1px -1px 1px rgba(0,0,0,0.6)',
        }}
      />
      <span
        aria-hidden="true"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 26,
          height: 26,
          borderRadius: '50%',
          backgroundColor: 'rgba(234, 88, 12, 0.15)',
          border: `1px solid ${theme.colors.accent}`,
          color: theme.colors.accent,
          flexShrink: 0,
        }}
      >
        <BackIcon size={16} />
      </span>
      {label}
    </button>
  );
}
