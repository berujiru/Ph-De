import { GameCanvas } from './ui/GameCanvas';
import { HUD } from './ui/HUD';
import './App.css';

function App() {
  return (
    <div className="app">
      <GameCanvas />
      <HUD />
    </div>
  );
}

export default App;
