import { useState, useEffect } from 'react';
import { GameCanvas } from './ui/GameCanvas';
import { MainMenu } from './ui/mockups/MainMenu';
import { RallyScreen } from './ui/components/RallyScreen';
import { CampaignMap } from './ui/mockups/CampaignMap';
import { SariSariStore } from './ui/mockups/SariSariStore';
import { LoadingScreen } from './ui/mockups/LoadingScreen';
import { InventoryScreen } from './ui/mockups/InventoryScreen';
import { PreparationScreen } from './ui/mockups/PreparationScreen';
import { SandboxHUD } from './ui/mockups/SandboxHUD';
import { AudioSettings } from './ui/components/AudioSettings';
import { RallyLoadingOverlay } from './ui/components/RallyLoadingOverlay';
import { theme } from './ui/theme';
import { uiToGameEvents } from './game/core/GameEvents';
import { spendPermit } from './game/data/metaState';
import { AudioManager } from './game/core/AudioManager';
import { MUSIC } from './game/data/soundRegistry';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState<'loading' | 'main' | 'campaign' | 'prep' | 'battle' | 'sandbox' | 'store' | 'inventory'>('loading');
  const [selectedStage, setSelectedStage] = useState<{ act: number; stageIdx: number } | null>(null);
  const [audioOpen, setAudioOpen] = useState(false);
  const [rallyReady, setRallyReady] = useState(false);
  // Where the store's Back button returns to — 'prep' when reached via the
  // out-of-permits CTA (so the player lands back on the same stage), else 'main'.
  const [storeReturnView, setStoreReturnView] = useState<'main' | 'prep'>('main');

  useEffect(() => {
    const inRally = currentView === 'battle' || currentView === 'sandbox';
    if (!inRally) {
      // Not in a rally → wipe any battlefield so a finished/surrendered rally
      // can't linger behind the menus or be resumed (a new fight always goes
      // through a fresh deploy), and bring back the ambience bed off the splash.
      uiToGameEvents.emit('exitRally', undefined);
      if (currentView !== 'loading') {
        AudioManager.playMusic(MUSIC.ambience, { loop: true, fadeMs: 1000 });
      }
    }
  }, [currentView]);

  const handlePlay = () => {
    setCurrentView('campaign');
  };

  const handleStartBattle = () => {
    // Each rally costs 1 Rally Permit. The prep screen already disables Deploy at
    // 0 permits; this is the actual enforcement + deduction.
    if (!spendPermit()) return;
    setRallyReady(false);
    setCurrentView('battle');
    // Start game systems
    uiToGameEvents.emit('restart', selectedStage ? { act: selectedStage.act, stageIdx: selectedStage.stageIdx } : undefined);
  };

  const handleStartSandbox = () => {
    setRallyReady(false);
    setCurrentView('sandbox');
    uiToGameEvents.emit('restart', { mode: 'sandbox' });
  };

  return (
    <div className="app">
      {/*
        Portrait play area (9:16). The Phaser canvas and every React overlay
        live inside this centered box so the UI sits ON the game, matching the
        canvas's Scale.FIT letterboxing. On a wide screen the sides letterbox
        to black — expected and correct for a phone-first portrait game.
      */}
      <div className="portrait-stage">
        {/* Background Game Canvas is always rendered, to simulate it running underneath */}
        <GameCanvas />

        {/* Conditionally render UI screens */}
        {currentView === 'loading' && (
          <LoadingScreen onComplete={() => setCurrentView('main')} />
        )}

      {currentView === 'main' && (
        <MainMenu
          onPlay={handlePlay}
          onStore={() => { setStoreReturnView('main'); setCurrentView('store'); }}
          onInventory={() => setCurrentView('inventory')}
        />
      )}
      
      {currentView === 'campaign' && (
        <CampaignMap 
          onBack={() => setCurrentView('main')} 
          onPrepareBattle={(act, stageIdx) => {
            setSelectedStage({ act, stageIdx });
            setCurrentView('prep');
          }}
          onStartSandbox={handleStartSandbox}
        />
      )}
      
      {currentView === 'prep' && (
        <PreparationScreen
          act={selectedStage?.act}
          stageIdx={selectedStage?.stageIdx}
          onBack={() => setCurrentView('campaign')}
          onDeploy={handleStartBattle}
          onGoToStore={() => { setStoreReturnView('prep'); setCurrentView('store'); }}
        />
      )}

      {currentView === 'battle' && (
        <>
          <RallyScreen stage={selectedStage} onReturnToMenu={() => setCurrentView('main')} />
          {!rallyReady && <RallyLoadingOverlay onReady={() => setRallyReady(true)} />}
        </>
      )}
      
      {currentView === 'sandbox' && (
        <>
          <SandboxHUD onReturnToMenu={() => setCurrentView('campaign')} />
          {!rallyReady && <RallyLoadingOverlay onReady={() => setRallyReady(true)} />}
        </>
      )}
      
      {currentView === 'store' && (
        <SariSariStore onBack={() => setCurrentView(storeReturnView)} />
      )}

      {currentView === 'inventory' && (
        <InventoryScreen onBack={() => setCurrentView('main')} />
      )}

      {/* Global audio settings — reachable from any screen (loading excepted). */}
      {currentView !== 'loading' && (
        <button
          onClick={() => setAudioOpen(true)}
          aria-label="Audio settings"
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            zIndex: 150,
            width: 40,
            height: 40,
            borderRadius: 999,
            border: `1px solid ${theme.colors.borderGlass}`,
            background: theme.colors.surfaceGlass,
            backdropFilter: 'blur(12px)',
            color: theme.colors.textPrimary,
            cursor: 'pointer',
            fontSize: 18,
            lineHeight: 1,
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          }}
        >
          🔊
        </button>
      )}

      {audioOpen && <AudioSettings onClose={() => setAudioOpen(false)} />}
      </div>
    </div>
  );
}

export default App;
