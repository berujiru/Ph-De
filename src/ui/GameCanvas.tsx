import { useEffect, useRef } from 'react';
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
    return () => game.destroy(true);
  }, []);

  return <div ref={containerRef} className="game-canvas" />;
}
