import { useEffect, useRef } from 'react';
import { createPhaserGame } from '../game/PhaserGame';

export function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const game = createPhaserGame(containerRef.current);
    return () => game.destroy(true);
  }, []);

  return <div ref={containerRef} className="game-canvas" />;
}
