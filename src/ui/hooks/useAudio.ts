import { useCallback, useSyncExternalStore } from 'react';
import { AudioManager, type AudioBus, type AudioSettings } from '../../game/core/AudioManager';

/**
 * The reusable audio hook — the React-facing half of the audio system. Any
 * component can read the live mixer settings and drive playback through the one
 * shared AudioManager singleton (which wraps Phaser's sound manager).
 *
 * `settings` is backed by useSyncExternalStore, so sliders/mute toggles re-render
 * the instant the mix changes anywhere (React 19). `playUi` replaces the ad-hoc
 * `uiToGameEvents.emit('playSound', …)` menu-click pattern with a single path.
 */
export function useAudio(): {
  settings: AudioSettings;
  setVolume: (bus: AudioBus, volume: number) => void;
  setMuted: (bus: AudioBus, muted: boolean) => void;
  toggleMuted: (bus: AudioBus) => void;
  playUi: (key: string) => void;
} {
  const settings = useSyncExternalStore(
    (cb) => AudioManager.subscribe(cb),
    () => AudioManager.getSettings(),
    () => AudioManager.getSettings(),
  );

  const setVolume = useCallback((bus: AudioBus, volume: number) => AudioManager.setVolume(bus, volume), []);
  const setMuted = useCallback((bus: AudioBus, muted: boolean) => AudioManager.setMuted(bus, muted), []);
  const toggleMuted = useCallback((bus: AudioBus) => AudioManager.toggleMuted(bus), []);
  const playUi = useCallback((key: string) => AudioManager.playSfx(key), []);

  return { settings, setVolume, setMuted, toggleMuted, playUi };
}
