import { theme } from '../theme';

interface CampaignMapProps {
  onBack: () => void;
  onStartBattle: () => void;
}

export function CampaignMap({ onBack, onStartBattle }: CampaignMapProps) {
  // Mock data for campaign progress
  const highestClearedAct = 0; // The user has cleared 0 stages so far
  
  const acts = [
    { id: 1, title: 'Act 1: Barangay', description: 'Defend your street from the Troll Bots.', requirement: 0 },
    { id: 2, title: 'Act 2: Transport Terminal', description: 'Stop the Fixers and Red Tape.', requirement: 1 },
    { id: 3, title: 'Act 3: Provincial Capitol', description: 'Cleanse the local government.', requirement: 2 },
    { id: 4, title: 'Act 4: Social Welfare Agency', description: 'Expose the Ghost Beneficiaries.', requirement: 3 },
  ];

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      backgroundColor: theme.colors.background,
      display: 'flex',
      flexDirection: 'column',
      padding: '40px',
      color: theme.colors.textPrimary,
      overflowY: 'auto'
    }}>
      <div style={{ marginBottom: '40px' }}>
        <button onClick={onBack} style={{
          background: 'none',
          border: 'none',
          color: theme.colors.textSecondary,
          cursor: 'pointer',
          fontSize: '16px',
          marginBottom: '10px',
          padding: 0,
          textDecoration: 'underline'
        }}>
          ← Back to Menu
        </button>
        <h1 style={{ margin: 0, fontSize: '32px', textTransform: 'uppercase', color: theme.colors.accent }}>Campaign Map</h1>
        <div style={{ color: theme.colors.textMuted }}>Select a stage to defend the barrier</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
        {acts.map((act) => {
          const isUnlocked = highestClearedAct >= act.requirement;
          const isNext = highestClearedAct === act.requirement;

          return (
            <div key={act.id} style={{
              backgroundColor: isUnlocked ? theme.colors.surface : 'rgba(30, 41, 59, 0.5)',
              border: `2px solid ${isNext ? theme.colors.primary : (isUnlocked ? theme.colors.border : 'rgba(51, 65, 85, 0.5)')}`,
              borderRadius: '12px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              opacity: isUnlocked ? 1 : 0.6,
              transform: isNext ? 'scale(1.02)' : 'none',
              transition: 'transform 0.2s',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {isNext && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  backgroundColor: theme.colors.primary,
                  color: '#fff',
                  padding: '4px 12px',
                  borderBottomLeftRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase'
                }}>
                  Next Target
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '20px', color: isUnlocked ? theme.colors.textPrimary : theme.colors.textSecondary }}>
                    {act.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: '14px', color: theme.colors.textMuted }}>
                    {isUnlocked ? act.description : 'Stage locked. Complete previous acts to unlock.'}
                  </p>
                </div>

                {isUnlocked ? (
                  <button 
                    onClick={onStartBattle}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: isNext ? theme.colors.success : theme.colors.surface,
                      color: '#fff',
                      border: isNext ? 'none' : `1px solid ${theme.colors.border}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '16px',
                      boxShadow: isNext ? '0 4px 0 #166534' : 'none',
                    }}
                  >
                    DEBOUCH (START)
                  </button>
                ) : (
                  <div style={{ fontSize: '24px', color: theme.colors.textSecondary, padding: '12px 24px' }}>
                    🔒
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
