import { useEffect, useRef } from 'react';
import type Phaser from 'phaser';
import { createPhaserGame } from '../game/PhaserGame';
import { AudioManager } from '../game/core/AudioManager';

export function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const game = createPhaserGame(containerRef.current);
    // Hand the live WebAudio sound manager to the shared AudioManager so both
    // gameplay and React UI play through one mixer (buses, mute, crossfades).
    AudioManager.registerSoundManager(game.sound);
    // Expose the live game for debugging and e2e (read-only inspection of
    // scene state such as volleyCount).
    (window as unknown as { __PHASER_GAME__?: Phaser.Game }).__PHASER_GAME__ = game;
    return () => {
      delete (window as unknown as { __PHASER_GAME__?: Phaser.Game }).__PHASER_GAME__;
      game.destroy(true);
    };
  }, []);

  return <div ref={containerRef} className="game-canvas" />;
}
