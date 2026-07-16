import type Phaser from 'phaser';

/**
 * Central audio engine for First Ripple. A module singleton (same shape as
 * core/GameEvents and data/skinSelection) so both the Phaser game and the React
 * UI drive one audio path. It wraps Phaser's WebAudio sound manager — which is
 * always alive because GameCanvas keeps the Phaser game mounted — and layers on
 * mixer buses, mute, persistence, and music crossfades.
 *
 * Four buses (master, sfx, music, voice) each carry a volume (0–1) and a mute.
 * Effective clip gain = master × bus × per-clip, with any mute forcing silence.
 * Settings persist to localStorage so the mix survives reloads; storage access
 * is guarded so tests / non-browser environments degrade to in-memory only.
 */

export type AudioBus = 'master' | 'sfx' | 'music' | 'voice';

export interface BusState {
  volume: number;
  muted: boolean;
}

export type AudioSettings = Record<AudioBus, BusState>;

export interface PlayOptions {
  /** Per-clip volume (0–1) layered under the bus/master gain. Default 1. */
  volume?: number;
  /** Playback rate multiplier (Phaser detune-free speed). Default 1. */
  rate?: number;
}

export interface MusicOptions {
  loop?: boolean;
  /** Crossfade duration in ms (fades the old bed out, the new one in). */
  fadeMs?: number;
  /** Per-clip volume ceiling under the music bus. Default 1. */
  volume?: number;
}

const STORAGE_KEY = 'firstripple.audio';

const DEFAULT_SETTINGS: AudioSettings = {
  master: { volume: 0.8, muted: false },
  sfx: { volume: 0.9, muted: false },
  music: { volume: 0.6, muted: false },
  voice: { volume: 1.0, muted: false },
};

/**
 * Pure mixer math (exported for unit tests): the volume a clip on `bus` should
 * play at given the current settings. Any mute in the master→bus chain = 0.
 */
export function effectiveGain(settings: AudioSettings, bus: AudioBus, clip = 1): number {
  if (bus === 'master') {
    return settings.master.muted ? 0 : clamp01(settings.master.volume * clip);
  }
  if (settings.master.muted || settings[bus].muted) return 0;
  return clamp01(settings.master.volume * settings[bus].volume * clip);
}

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

function readStorage(): AudioSettings {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (!raw) return cloneDefaults();
    const parsed = JSON.parse(raw) as Partial<AudioSettings>;
    const out = cloneDefaults();
    for (const bus of Object.keys(out) as AudioBus[]) {
      const saved = parsed?.[bus];
      if (saved && typeof saved === 'object') {
        if (typeof saved.volume === 'number') out[bus].volume = clamp01(saved.volume);
        if (typeof saved.muted === 'boolean') out[bus].muted = saved.muted;
      }
    }
    return out;
  } catch {
    return cloneDefaults();
  }
}

function writeStorage(settings: AudioSettings): void {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Storage unavailable (private mode, tests) — settings stay in-memory.
  }
}

function cloneDefaults(): AudioSettings {
  return {
    master: { ...DEFAULT_SETTINGS.master },
    sfx: { ...DEFAULT_SETTINGS.sfx },
    music: { ...DEFAULT_SETTINGS.music },
    voice: { ...DEFAULT_SETTINGS.voice },
  };
}

class AudioManagerImpl {
  private settings: AudioSettings = readStorage();
  private sound: Phaser.Sound.BaseSoundManager | null = null;
  private listeners = new Set<() => void>();

  private currentMusic: Phaser.Sound.BaseSound | null = null;
  private currentMusicKey: string | null = null;
  private currentMusicClipVol = 1;
  /** A music request made before the sound manager was registered. */
  private pendingMusic: { key: string; opts: MusicOptions } | null = null;
  private fadeHandle: number | null = null;

  /** Called once with the live game.sound after the Phaser game boots. */
  registerSoundManager(sound: Phaser.Sound.BaseSoundManager): void {
    this.sound = sound;
    if (this.pendingMusic) {
      const { key, opts } = this.pendingMusic;
      this.pendingMusic = null;
      this.playMusic(key, opts);
    }
  }

  getSettings(): AudioSettings {
    return this.settings;
  }

  subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private notify(): void {
    for (const cb of this.listeners) cb();
  }

  setVolume(bus: AudioBus, volume: number): void {
    this.settings = { ...this.settings, [bus]: { ...this.settings[bus], volume: clamp01(volume) } };
    this.persistAndApply();
  }

  setMuted(bus: AudioBus, muted: boolean): void {
    this.settings = { ...this.settings, [bus]: { ...this.settings[bus], muted } };
    this.persistAndApply();
  }

  toggleMuted(bus: AudioBus): void {
    this.setMuted(bus, !this.settings[bus].muted);
  }

  private persistAndApply(): void {
    writeStorage(this.settings);
    // Live-update the running music bed to the new mix (SFX/voice are one-shots
    // that read the mix at play time, so they need no live update).
    if (this.currentMusic) {
      (this.currentMusic as { setVolume?: (v: number) => void }).setVolume?.(
        effectiveGain(this.settings, 'music', this.currentMusicClipVol),
      );
    }
    this.notify();
  }

  playSfx(key: string, opts?: PlayOptions): void {
    this.playOneShot('sfx', key, opts);
  }

  playVoice(key: string, opts?: PlayOptions): void {
    this.playOneShot('voice', key, opts);
  }

  private playOneShot(bus: AudioBus, key: string, opts?: PlayOptions): void {
    if (!this.sound || !key) return;
    const volume = effectiveGain(this.settings, bus, opts?.volume ?? 1);
    if (volume <= 0) return;
    try {
      this.sound.play(key, { volume, rate: opts?.rate ?? 1 });
    } catch {
      // Missing/undecoded key — never let audio crash gameplay.
    }
  }

  /**
   * Crossfade to a new music bed. No-ops if `key` is already the active track.
   * Queues the request if the sound manager hasn't registered yet.
   */
  playMusic(key: string, opts: MusicOptions = {}): void {
    if (!key) return;
    if (!this.sound) {
      this.pendingMusic = { key, opts };
      return;
    }
    if (this.currentMusicKey === key && this.currentMusic && this.currentMusic.isPlaying) return;

    const fadeMs = opts.fadeMs ?? 800;
    const clipVol = opts.volume ?? 1;
    const target = effectiveGain(this.settings, 'music', clipVol);

    let next: Phaser.Sound.BaseSound;
    try {
      next = this.sound.add(key);
      if ('setLoop' in next) {
        (next as any).setLoop(opts.loop ?? true);
      }
      next.play({ volume: fadeMs > 0 ? 0 : target });
    } catch {
      return; // Track not loaded — keep whatever is playing.
    }

    const previous = this.currentMusic;
    this.currentMusic = next;
    this.currentMusicKey = key;
    this.currentMusicClipVol = clipVol;

    if (fadeMs > 0) {
      this.fade(next, 0, target, fadeMs);
      if (previous) {
        this.fade(previous, this.getSoundVolume(previous), 0, fadeMs, () => {
          previous.stop();
          previous.destroy();
        });
      }
    } else if (previous) {
      previous.stop();
      previous.destroy();
    }
  }

  stopMusic(fadeMs = 600): void {
    const current = this.currentMusic;
    if (!current) return;
    this.currentMusic = null;
    this.currentMusicKey = null;
    if (fadeMs > 0) {
      this.fade(current, this.getSoundVolume(current), 0, fadeMs, () => {
        current.stop();
        current.destroy();
      });
    } else {
      current.stop();
      current.destroy();
    }
  }

  private getSoundVolume(sound: Phaser.Sound.BaseSound): number {
    // A destroyed/removed WebAudioSound nulls its gain node, so reading `.volume`
    // throws ("Cannot read properties of null"). Treat anything mid-teardown as
    // silent rather than let a crossfade crash.
    if ((sound as { pendingRemove?: boolean }).pendingRemove || !(sound as { manager?: unknown }).manager) {
      return 0;
    }
    try {
      return (sound as { volume?: number }).volume ?? 0;
    } catch {
      return 0;
    }
  }

  /** rAF-based volume ramp — decoupled from any Phaser scene's tween manager. */
  private fade(
    sound: Phaser.Sound.BaseSound,
    from: number,
    to: number,
    durationMs: number,
    onDone?: () => void,
  ): void {
    const setVol = (sound as { setVolume?: (v: number) => void }).setVolume?.bind(sound);
    if (!setVol) {
      onDone?.();
      return;
    }
    const raf = globalThis.requestAnimationFrame;
    if (typeof raf !== 'function') {
      setVol(to);
      onDone?.();
      return;
    }
    const start = performance.now();
    const step = (now: number) => {
      // The sound can be destroyed between frames (scene teardown / game
      // restart), which nulls its internals — setVolume would then throw.
      // Bail cleanly instead of crashing the rAF loop.
      if ((sound as { pendingRemove?: boolean }).pendingRemove || !(sound as { manager?: unknown }).manager) {
        onDone?.();
        return;
      }
      const t = Math.min(1, (now - start) / durationMs);
      setVol(from + (to - from) * t);
      if (t < 1) {
        this.fadeHandle = raf(step);
      } else {
        onDone?.();
      }
    };
    this.fadeHandle = raf(step);
  }

  /** Test hook — reset in-memory state (re-reads storage). */
  resetForTests(): void {
    if (this.fadeHandle != null && typeof globalThis.cancelAnimationFrame === 'function') {
      globalThis.cancelAnimationFrame(this.fadeHandle);
    }
    this.settings = readStorage();
    this.sound = null;
    this.currentMusic = null;
    this.currentMusicKey = null;
    this.pendingMusic = null;
    this.listeners.clear();
  }
}

/** The shared audio singleton — import and use directly. */
export const AudioManager = new AudioManagerImpl();
