import { useState } from 'react';
import { theme } from '../theme';

interface PreparationScreenProps {
  onBack: () => void;
  onDeploy: () => void;
}

interface ConsumableItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

const INVENTORY_ITEMS: ConsumableItem[] = [
  { id: 'medkit', name: 'First Aid Kit', description: "Restores 30% of the movement's Morale instantly.", icon: '✚', color: '#ef4444' },
  { id: 'battery', name: 'Megaphone Battery', description: 'Instantly grants 50 Voices.', icon: '⚡', color: '#eab308' },
  { id: 'water', name: 'Bottled Water', description: 'Increases attack speed by 20% for 10 seconds.', icon: '💧', color: '#3b82f6' },
  { id: 'placard', name: 'Extra Placard', description: 'Deploys a temporary barricade with 100 HP.', icon: '🛡️', color: '#8b5cf6' },
  { id: 'noodles', name: 'Cup Noodles', description: "Restores 50% Morale but pauses Voices generation for 5 seconds.", icon: '🍜', color: '#f97316' },
  { id: 'energy', name: 'Energy Drink', description: 'Increases attack speed of all heroes by 15% for 15s.', icon: '⚡', color: '#10b981' },
  { id: 'wifi', name: 'Pocket Wi-Fi', description: 'Reveals stealth enemies and extends range by 20% for 10s.', icon: '📶', color: '#06b6d4' }
];

export function PreparationScreen({ onBack, onDeploy }: PreparationScreenProps) {
  const [equippedItems, setEquippedItems] = useState<(ConsumableItem | null)[]>([null, null, null]);

  const handleEquip = (item: ConsumableItem) => {
    // Check if already equipped
    if (equippedItems.some(eq => eq?.id === item.id)) return;
    
    // Find first empty slot
    const emptyIndex = equippedItems.indexOf(null);
    if (emptyIndex !== -1) {
      const newEquipped = [...equippedItems];
      newEquipped[emptyIndex] = item;
      setEquippedItems(newEquipped);
    }
  };

  const handleUnequip = (index: number) => {
    const newEquipped = [...equippedItems];
    newEquipped[index] = null;
    setEquippedItems(newEquipped);
  };

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      backgroundColor: '#0f172a',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Background Hideout Scene */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle at 50% 60%, #1e293b 0%, #020617 80%)',
        zIndex: 0
      }} />

      {/* Table Map glowing from below */}
      <div style={{
        position: 'absolute',
        top: '60%',
        left: '50%',
        transform: 'translate(-50%, -50%) rotateX(60deg)',
        width: '600px',
        height: '400px',
        backgroundColor: '#0ea5e9',
        opacity: 0.15,
        borderRadius: '20px',
        boxShadow: '0 0 100px #0ea5e9',
        zIndex: 1
      }} />

      {/* Silhouettes around the table */}
      <div style={{
        position: 'absolute',
        bottom: '0',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '800px',
        height: '400px',
        zIndex: 2,
        pointerEvents: 'none'
      }}>
        {/* Left Ally */}
        <div style={{ position: 'absolute', bottom: '-20px', left: '100px', width: '150px', height: '300px', backgroundColor: '#020617', borderRadius: '75px 75px 0 0', boxShadow: 'inset -10px 0 30px rgba(14, 165, 233, 0.3)' }} />
        {/* Center/Eden */}
        <div style={{ position: 'absolute', bottom: '-20px', left: '325px', width: '150px', height: '350px', backgroundColor: '#020617', borderRadius: '75px 75px 0 0', boxShadow: 'inset 0 20px 50px rgba(14, 165, 233, 0.4)' }} />
        {/* Right Ally */}
        <div style={{ position: 'absolute', bottom: '-20px', right: '100px', width: '120px', height: '280px', backgroundColor: '#020617', borderRadius: '60px 60px 0 0', boxShadow: 'inset 10px 0 30px rgba(14, 165, 233, 0.3)' }} />
      </div>

      {/* Foreground UI Layer */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flex: 1 }}>
        
        {/* Left Panel: Inventory */}
        <div style={{
          width: '400px',
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(10px)',
          borderRight: '1px solid rgba(255,255,255,0.1)',
          padding: '30px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '10px 0 30px rgba(0,0,0,0.5)'
        }}>
          <button onClick={onBack} style={{
            background: 'none',
            border: 'none',
            color: theme.colors.textSecondary,
            cursor: 'pointer',
            fontSize: '14px',
            textDecoration: 'underline',
            alignSelf: 'flex-start',
            marginBottom: '20px'
          }}>
            ← Cancel Briefing
          </button>
          
          <h2 style={{ margin: '0 0 5px 0', color: theme.colors.textPrimary, textTransform: 'uppercase', letterSpacing: '2px' }}>Supply Cache</h2>
          <p style={{ margin: '0 0 20px 0', color: theme.colors.textMuted, fontSize: '14px' }}>
            Select up to 3 items to bring into the rally. Items are consumed on use.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', overflowY: 'auto' }}>
            {INVENTORY_ITEMS.map((item) => {
              const isEquipped = equippedItems.some(eq => eq?.id === item.id);
              const isFull = !equippedItems.includes(null);
              const isDisabled = isEquipped || (isFull && !isEquipped);

              return (
                <div 
                  key={item.id}
                  onClick={() => !isDisabled && handleEquip(item)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    backgroundColor: isEquipped ? 'rgba(51, 65, 85, 0.3)' : 'rgba(30, 41, 59, 0.8)',
                    border: `1px solid ${isEquipped ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)'}`,
                    borderRadius: '8px',
                    padding: '15px',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    opacity: isDisabled ? 0.5 : 1,
                    transition: 'all 0.2s',
                    transform: isDisabled ? 'none' : 'scale(1)'
                  }}
                  onMouseOver={(e) => { if (!isDisabled) e.currentTarget.style.transform = 'translateX(5px)'; }}
                  onMouseOut={(e) => { if (!isDisabled) e.currentTarget.style.transform = 'translateX(0)'; }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: '20px',
                    border: `1px solid ${item.color}`
                  }}>
                    {item.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#f8fafc', fontWeight: 'bold', fontSize: '14px' }}>{item.name}</div>
                    <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '2px' }}>{item.description}</div>
                  </div>
                  {isEquipped && (
                    <div style={{ fontSize: '12px', color: theme.colors.success, fontWeight: 'bold' }}>EQUIPPED</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Area: Table / Loadout */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '40px'
        }}>
          
          <div style={{ textAlign: 'right' }}>
            <h1 style={{ margin: 0, fontSize: '48px', color: '#fff', textTransform: 'uppercase', textShadow: '0 0 20px rgba(255,255,255,0.5)' }}>
              Briefing Room
            </h1>
            <div style={{ color: '#0ea5e9', fontSize: '18px', fontWeight: 'bold', letterSpacing: '4px' }}>
              PRE-DEPLOYMENT SETUP
            </div>
          </div>

          {/* Loadout Slots overlay on the "table" */}
          <div style={{
            alignSelf: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '40px'
          }}>
            <h3 style={{ color: '#fff', letterSpacing: '2px', marginBottom: '20px' }}>YOUR LOADOUT</h3>
            
            <div style={{ display: 'flex', gap: '30px' }}>
              {equippedItems.map((item, idx) => (
                <div 
                  key={idx}
                  onClick={() => item && handleUnequip(idx)}
                  style={{
                    width: '100px',
                    height: '100px',
                    backgroundColor: item ? 'rgba(30, 41, 59, 0.9)' : 'rgba(0,0,0,0.3)',
                    border: `2px dashed ${item ? item.color : 'rgba(255,255,255,0.2)'}`,
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: item ? 'pointer' : 'default',
                    position: 'relative',
                    transition: 'all 0.2s',
                    boxShadow: item ? `0 0 20px ${item.color}40` : 'none'
                  }}
                  onMouseOver={(e) => { if (item) { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.borderColor = '#ef4444'; } }}
                  onMouseOut={(e) => { if (item) { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.borderColor = item.color; } }}
                >
                  {item ? (
                    <>
                      <div style={{ fontSize: '32px' }}>{item.icon}</div>
                      <div style={{ position: 'absolute', bottom: '5px', fontSize: '10px', color: '#fff', textAlign: 'center', width: '90%' }}>{item.name}</div>
                      {/* Remove icon on hover could be handled by css, but we just change border red */}
                    </>
                  ) : (
                    <span style={{ fontSize: '24px', color: 'rgba(255,255,255,0.2)' }}>+</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Deploy Button */}
          <div style={{ alignSelf: 'flex-end' }}>
            <button
              onClick={onDeploy}
              style={{
                backgroundColor: theme.colors.success,
                color: '#fff',
                border: 'none',
                padding: '20px 60px',
                fontSize: '24px',
                fontWeight: '900',
                borderRadius: '12px',
                cursor: 'pointer',
                textTransform: 'uppercase',
                boxShadow: '0 6px 0 #166534, 0 15px 20px rgba(0,0,0,0.5)',
                transition: 'all 0.1s',
                letterSpacing: '2px'
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'translateY(6px)';
                e.currentTarget.style.boxShadow = '0 0px 0 #166534, 0 5px 10px rgba(0,0,0,0.5)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 6px 0 #166534, 0 15px 20px rgba(0,0,0,0.5)';
              }}
            >
              Deploy to Streets
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
