import { theme } from '../theme';
import { useAudio } from '../hooks/useAudio';
import type { AudioBus } from '../../game/core/AudioManager';
import { SFX } from '../../game/data/soundRegistry';

/**
 * Audio mixer overlay: master / music / SFX / voice sliders + per-bus mute.
 * Purely presentational over the useAudio hook (which persists to localStorage
 * via AudioManager). Opened from the global gear button in App.
 */

const BUSES: { bus: AudioBus; label: string; hint: string }[] = [
  { bus: 'master', label: 'Master', hint: 'Overall volume' },
  { bus: 'music', label: 'Music', hint: 'Battle & boss themes' },
  { bus: 'sfx', label: 'Sound FX', hint: 'Attacks, hits, UI' },
  { bus: 'voice', label: 'Voice', hint: 'Hero skill lines' },
];

export function AudioSettings({ onClose }: { onClose: () => void }) {
  const { settings, setVolume, setMuted, playUi } = useAudio();

  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(4px)',
        pointerEvents: 'auto',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(420px, 92vw)',
          padding: '22px 24px 24px',
          background: theme.colors.surfaceGlass,
          border: `1px solid ${theme.colors.borderGlass}`,
          borderRadius: 14,
          backdropFilter: 'blur(12px)',
          boxShadow: '0 18px 44px rgba(0,0,0,0.6)',
          color: theme.colors.textPrimary,
          fontFamily: 'inherit',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2 }}>
            Audio
          </h2>
          <button
            onClick={onClose}
            aria-label="Close audio settings"
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              border: `1px solid ${theme.colors.border}`,
              background: 'transparent',
              color: theme.colors.textSecondary,
              cursor: 'pointer',
              fontSize: 18,
              lineHeight: 1,
              fontFamily: 'inherit',
            }}
          >
            ✕
          </button>
        </div>

        {BUSES.map(({ bus, label, hint }) => {
          const state = settings[bus];
          return (
            <div key={bus} style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
                  <span style={{ fontWeight: 800, fontSize: 14 }}>{label}</span>
                  <span style={{ fontSize: 11, color: theme.colors.textMuted }}>{hint}</span>
                </span>
                <button
                  onClick={() => setMuted(bus, !state.muted)}
                  aria-pressed={state.muted}
                  style={{
                    minWidth: 58,
                    padding: '4px 10px',
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    border: `1px solid ${state.muted ? theme.colors.danger : theme.colors.border}`,
                    background: state.muted ? 'rgba(239, 68, 68, 0.18)' : 'transparent',
                    color: state.muted ? theme.colors.danger : theme.colors.textSecondary,
                  }}
                >
                  {state.muted ? 'Muted' : 'On'}
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(state.volume * 100)}
                  onChange={(e) => setVolume(bus, Number(e.target.value) / 100)}
                  // Preview the change: click a UI blip so the slider is audible.
                  onMouseUp={() => playUi(SFX.btnPress)}
                  disabled={state.muted}
                  aria-label={`${label} volume`}
                  style={{ flex: 1, accentColor: theme.colors.accent, opacity: state.muted ? 0.4 : 1 }}
                />
                <span style={{ width: 34, textAlign: 'right', fontSize: 13, fontWeight: 700, color: theme.colors.textSecondary }}>
                  {Math.round(state.volume * 100)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
