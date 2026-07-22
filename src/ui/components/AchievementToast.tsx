import { useEffect, useRef, useState } from 'react';
import { theme } from '../theme';
import { HopeCoinIcon, RallyPermitIcon } from '../icons';
import { gameToUiEvents } from '../../game/core/GameEvents';

/**
 * Non-blocking achievement-unlock toast. Mounted once, globally, over every
 * screen. Listens for `achievementUnlocked` events, queues them, and shows one
 * compact banner at a time at the top of the stage — it never captures pointer
 * input, so it can pop mid-battle without stealing taps. Multiple unlocks in the
 * same tick (e.g. a reward crossing another threshold) play back-to-back.
 */

interface ToastData {
  key: number;
  icon: string;
  title: string;
  permits?: number;
  hope?: number;
}

const SHOW_MS = 3800;

export function AchievementToast() {
  const [queue, setQueue] = useState<ToastData[]>([]);
  const [current, setCurrent] = useState<ToastData | null>(null);
  const [leaving, setLeaving] = useState(false);
  const keyRef = useRef(0);

  // Enqueue on unlock.
  useEffect(() => {
    const unsub = gameToUiEvents.on('achievementUnlocked', ({ title, description: _d, reward, icon }) => {
      setQueue((q) => [
        ...q,
        { key: keyRef.current++, icon: icon ?? '🏆', title, permits: reward.permits, hope: reward.hope },
      ]);
    });
    return () => unsub();
  }, []);

  // Pump the queue: when idle and something is waiting, show it.
  useEffect(() => {
    if (current || queue.length === 0) return;
    setCurrent(queue[0]);
    setLeaving(false);
    setQueue((q) => q.slice(1));
  }, [queue, current]);

  // Drive the show → leave → clear lifecycle for the current toast.
  useEffect(() => {
    if (!current) return;
    const leaveTimer = setTimeout(() => setLeaving(true), SHOW_MS);
    const clearTimer = setTimeout(() => setCurrent(null), SHOW_MS + 320);
    return () => {
      clearTimeout(leaveTimer);
      clearTimeout(clearTimer);
    };
  }, [current]);

  if (!current) return null;

  return (
    <div
      aria-live="polite"
      style={{
        position: 'absolute',
        top: 'calc(10px + var(--stage-crop, 0px))',
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        zIndex: 600,
        pointerEvents: 'none',
        padding: '0 12px',
      }}
    >
      <style>{toastCss}</style>
      <div
        key={current.key}
        role="status"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          maxWidth: 360,
          width: '100%',
          padding: '10px 14px',
          backgroundColor: '#1c1917',
          border: `1px solid ${theme.materials.rust}`,
          borderLeft: `4px solid ${theme.colors.accent}`,
          borderRadius: 8,
          boxShadow: `0 6px 22px rgba(0,0,0,0.6), 0 0 26px ${theme.materials.corruptionEmber}`,
          animation: leaving
            ? 'achv-toast-out 0.3s ease forwards'
            : 'achv-toast-in 0.34s cubic-bezier(0.16, 1, 0.3, 1) both',
        }}
      >
        {/* Emblem */}
        <div
          aria-hidden="true"
          style={{
            flexShrink: 0,
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            borderRadius: 8,
            backgroundColor: 'rgba(234, 88, 12, 0.12)',
            border: `1px solid ${theme.colors.accent}`,
          }}
        >
          {current.icon}
        </div>

        {/* Text + rewards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, flex: 1 }}>
          <span
            style={{
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              color: theme.colors.accent,
            }}
          >
            Achievement Unlocked
          </span>
          <span
            style={{
              fontSize: 14,
              fontWeight: 800,
              color: theme.colors.textPrimary,
              lineHeight: 1.1,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {current.title}
          </span>
          <div style={{ display: 'flex', gap: 12, marginTop: 2 }}>
            {current.permits != null && current.permits > 0 && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 800, color: theme.colors.textSecondary }}>
                <RallyPermitIcon size={14} /> +{current.permits}
              </span>
            )}
            {current.hope != null && current.hope > 0 && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 800, color: theme.colors.gold }}>
                <HopeCoinIcon size={14} /> +{current.hope}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const toastCss = `
@keyframes achv-toast-in {
  from { opacity: 0; transform: translateY(-18px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes achv-toast-out {
  from { opacity: 1; transform: translateY(0) scale(1); }
  to   { opacity: 0; transform: translateY(-14px) scale(0.98); }
}
`;
