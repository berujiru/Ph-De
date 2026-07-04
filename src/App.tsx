import { useState } from 'react';
import { GameCanvas } from './ui/GameCanvas';
import { MainMenu } from './ui/mockups/MainMenu';
import { RallyScreen } from './ui/components/RallyScreen';
import { CampaignMap } from './ui/mockups/CampaignMap';
import { SariSariStore } from './ui/mockups/SariSariStore';
import { LoadingScreen } from './ui/mockups/LoadingScreen';
import { InventoryScreen } from './ui/mockups/InventoryScreen';
import { PreparationScreen } from './ui/mockups/PreparationScreen';
import { SandboxHUD } from './ui/mockups/SandboxHUD';
import { uiToGameEvents } from './game/core/GameEvents';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState<'loading' | 'main' | 'campaign' | 'prep' | 'battle' | 'sandbox' | 'store' | 'inventory'>('loading');

  const handlePlay = () => {
    setCurrentView('campaign');
  };

  const handleStartBattle = () => {
    setCurrentView('battle');
    // Start game systems
    uiToGameEvents.emit('restart', undefined);
  };

  const handleStartSandbox = () => {
    setCurrentView('sandbox');
    uiToGameEvents.emit('restart', { mode: 'sandbox' });
  };

  return (
    <div className="app" style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Background Game Canvas is always rendered, to simulate it running underneath */}
      <GameCanvas />

      {/* Conditionally render UI screens */}
      {currentView === 'loading' && (
        <LoadingScreen onComplete={() => setCurrentView('main')} />
      )}

      {currentView === 'main' && (
        <MainMenu 
          onPlay={handlePlay} 
          onStore={() => setCurrentView('store')} 
          onInventory={() => setCurrentView('inventory')}
        />
      )}
      
      {currentView === 'campaign' && (
        <CampaignMap 
          onBack={() => setCurrentView('main')} 
          onPrepareBattle={() => setCurrentView('prep')}
          onStartSandbox={handleStartSandbox}
        />
      )}
      
      {currentView === 'prep' && (
        <PreparationScreen 
          onBack={() => setCurrentView('campaign')}
          onDeploy={handleStartBattle}
        />
      )}

      {currentView === 'battle' && (
        <RallyScreen onReturnToMenu={() => setCurrentView('main')} />
      )}
      
      {currentView === 'sandbox' && (
        <SandboxHUD onReturnToMenu={() => setCurrentView('campaign')} />
      )}
      
      {currentView === 'store' && (
        <SariSariStore onBack={() => setCurrentView('main')} />
      )}

      {currentView === 'inventory' && (
        <InventoryScreen onBack={() => setCurrentView('main')} />
      )}
    </div>
  );
}

export default App;
