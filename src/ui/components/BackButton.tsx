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
  dark: { bg: 'linear-gradient(180deg, #1f1a16 0%, #0c0a09 100%)', edge: theme.materials.rust },
  wood: { bg: 'linear-gradient(180deg, #241812 0%, #0c0a09 100%)', edge: theme.materials.woodLight },
  cork: { bg: 'linear-gradient(180deg, #241c16 0%, #0c0a09 100%)', edge: theme.materials.woodLight },
};

/** Cut-corner clip matching the souls menu-slot silhouette. */
const CUT = 'polygon(8px 0, 100% 0, 100% 100%, 0 100%, 0 8px)';

/**
 * Shared back control — a charred iron sign nailed to a post.  The arrow
 * sits in an ember chip; a rust edge runs down the left so the control reads
 * as souls-style ruined signage rather than a generic browser back.
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
        background: t.bg,
        color: theme.colors.textPrimary,
        border: `1px solid ${theme.materials.rust}`,
        borderLeft: `4px solid ${theme.colors.accent}`,
        clipPath: CUT,
        boxShadow: `0 6px 14px rgba(0,0,0,0.5), inset 0 0 10px rgba(0,0,0,0.5)`,
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
        e.currentTarget.style.borderColor = theme.colors.accent;
        e.currentTarget.style.boxShadow = '0 0 20px rgba(234, 88, 12, 0.45), inset 0 0 10px rgba(234,88,12,0.15)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateX(0)';
        e.currentTarget.style.borderColor = theme.materials.rust;
        e.currentTarget.style.boxShadow = '0 6px 14px rgba(0,0,0,0.5), inset 0 0 10px rgba(0,0,0,0.5)';
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
