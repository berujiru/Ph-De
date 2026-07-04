import { useState } from 'react';
import { GameCanvas } from './ui/GameCanvas';
import { MainMenu } from './ui/mockups/MainMenu';
import { BattleHUD } from './ui/mockups/BattleHUD';
import { CampaignMap } from './ui/mockups/CampaignMap';
import { SariSariStore } from './ui/mockups/SariSariStore';
import { LoadingScreen } from './ui/mockups/LoadingScreen';
import { InventoryScreen } from './ui/mockups/InventoryScreen';
import { uiToGameEvents } from './game/core/GameEvents';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState<'loading' | 'main' | 'campaign' | 'battle' | 'store' | 'inventory'>('loading');

  const handlePlay = () => {
    setCurrentView('campaign');
  };

  const handleStartBattle = () => {
    setCurrentView('battle');
    // Start game systems
    uiToGameEvents.emit('restart', undefined);
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
          onStartBattle={handleStartBattle} 
        />
      )}
      
      {currentView === 'battle' && (
        <BattleHUD onReturnToMenu={() => setCurrentView('main')} />
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
