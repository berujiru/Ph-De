import { useState } from 'react';
import { theme } from '../theme';

interface CampaignMapProps {
  onBack: () => void;
  onPrepareBattle: () => void;
  onStartSandbox: () => void;
}

// Nested Data Structure for 4 Acts x 10 Stages
const CAMPAIGN_DATA = [
  {
    id: 1,
    title: 'Act 1: The Grassroots',
    description: 'Protecting local communities from immediate threats like Troll Bots and Fixers.',
    stages: [
      { id: 1, name: 'The Street Corner' },
      { id: 2, name: 'Alleyway Ambush' },
      { id: 3, name: 'Sari-Sari Standoff' },
      { id: 4, name: 'Basketball Court' },
      { id: 5, name: 'Tricycle Terminal' },
      { id: 6, name: 'Barangay Outpost' },
      { id: 7, name: 'The Wet Market' },
      { id: 8, name: 'Local Clinic' },
      { id: 9, name: 'Barangay Plaza' },
      { id: 10, name: 'Barangay Hall (Boss)' }
    ]
  },
  {
    id: 2,
    title: 'Act 2: The Town Core',
    description: 'Taking back public utilities and spaces from entrenched local corruption.',
    stages: [
      { id: 11, name: 'Public Market Gates' },
      { id: 12, name: 'Jeepney Terminal' },
      { id: 13, name: 'Town Plaza' },
      { id: 14, name: 'Public Library' },
      { id: 15, name: 'Municipal Hospital' },
      { id: 16, name: 'Town Overpass' },
      { id: 17, name: 'Police Station' },
      { id: 18, name: 'Town Hall Steps' },
      { id: 19, name: "Mayor's Driveway" },
      { id: 20, name: 'City Hall (Boss)' }
    ]
  },
  {
    id: 3,
    title: 'Act 3: The Regional Hub',
    description: 'Dismantling provincial syndicates and ghost projects across the region.',
    stages: [
      { id: 21, name: 'Provincial Highway' },
      { id: 22, name: 'Ghost Bridge' },
      { id: 23, name: 'Regional Port' },
      { id: 24, name: 'Industrial Park' },
      { id: 25, name: 'Provincial Hospital' },
      { id: 26, name: 'Power Plant' },
      { id: 27, name: 'Agri-Business Center' },
      { id: 28, name: 'Regional Court' },
      { id: 29, name: 'Capitol Grounds' },
      { id: 30, name: 'Provincial Capitol (Boss)' }
    ]
  },
  {
    id: 4,
    title: 'Act 4: The National Gauntlet',
    description: 'Facing the systemic root of the anomalies across national government agencies.',
    stages: [
      { id: 31, name: 'National Highway' },
      { id: 32, name: 'Transport Agency' },
      { id: 33, name: 'Social Welfare HQ' },
      { id: 34, name: 'Dept of Public Works' },
      { id: 35, name: 'Bureau of Customs' },
      { id: 36, name: 'National Treasury' },
      { id: 37, name: 'The Senate Gates' },
      { id: 38, name: 'Congress Steps' },
      { id: 39, name: 'Palace Gates' },
      { id: 40, name: "The System's Heart (Final Boss)" }
    ]
  }
];

export function CampaignMap({ onBack, onPrepareBattle, onStartSandbox }: CampaignMapProps) {
  // Mock data for campaign progress (0 means no stages cleared yet)
  const highestClearedStage = 0; 
  
  // Accordion State
  const [expandedAct, setExpandedAct] = useState<number | null>(1); // Default to Act 1 expanded

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
        <div style={{ color: theme.colors.textMuted }}>Select a stage to defend the movement's Morale</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
        
        {/* Sandbox Entry */}
        <div style={{
          backgroundColor: 'rgba(56, 189, 248, 0.1)',
          border: `2px dashed ${theme.colors.accent}`,
          borderRadius: '12px',
          padding: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h3 style={{ margin: '0 0 5px 0', fontSize: '20px', color: theme.colors.accent }}>🧪 Attack Sandbox</h3>
            <p style={{ margin: 0, fontSize: '14px', color: theme.colors.textMuted }}>Isolated environment for testing mechanics.</p>
          </div>
          <button onClick={onStartSandbox} style={{
            padding: '12px 24px',
            backgroundColor: theme.colors.accent,
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '16px',
            boxShadow: '0 4px 0 #0284c7',
          }}>
            ENTER SANDBOX
          </button>
        </div>

        {/* Acts Accordion */}
        {CAMPAIGN_DATA.map((act) => {
          // An Act is accessible if the highest cleared stage is >= the first stage of the act - 1.
          // Stage IDs start at 1. Act 1 starts at Stage 1. Act 2 starts at Stage 11.
          const firstStageId = act.stages[0].id;
          const isActUnlocked = highestClearedStage >= firstStageId - 1;
          const isExpanded = expandedAct === act.id;

          // Calculate progress within this act
          const actClearedStages = Math.max(0, Math.min(10, highestClearedStage - (firstStageId - 1)));

          return (
            <div key={act.id} style={{
              backgroundColor: isActUnlocked ? theme.colors.surface : 'rgba(30, 41, 59, 0.5)',
              border: `2px solid ${isActUnlocked ? theme.colors.border : 'rgba(51, 65, 85, 0.5)'}`,
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              opacity: isActUnlocked ? 1 : 0.6,
              overflow: 'hidden',
              transition: 'all 0.3s'
            }}>
              {/* Accordion Header (Banner) */}
              <div 
                onClick={() => {
                  if (isActUnlocked) {
                    setExpandedAct(isExpanded ? null : act.id);
                  }
                }}
                style={{
                  padding: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: isActUnlocked ? 'pointer' : 'default',
                  backgroundColor: isExpanded ? 'rgba(56, 189, 248, 0.05)' : 'transparent',
                  borderBottom: isExpanded ? `1px solid ${theme.colors.border}` : 'none'
                }}
              >
                <div>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '20px', color: isActUnlocked ? theme.colors.textPrimary : theme.colors.textSecondary }}>
                    {act.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: '14px', color: theme.colors.textMuted }}>
                    {isActUnlocked ? act.description : 'Act locked. Complete previous acts to unlock.'}
                  </p>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  {isActUnlocked && (
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: actClearedStages === 10 ? theme.colors.success : theme.colors.accent }}>
                      {actClearedStages} / 10
                    </div>
                  )}
                  {isActUnlocked ? (
                    <div style={{ fontSize: '24px', transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                      ▼
                    </div>
                  ) : (
                    <div style={{ fontSize: '24px', color: theme.colors.textSecondary }}>
                      🔒
                    </div>
                  )}
                </div>
              </div>

              {/* Accordion Body (Stages List) */}
              {isExpanded && isActUnlocked && (
                <div style={{ padding: '20px', backgroundColor: 'rgba(15, 23, 42, 0.5)' }}>
                  
                  {/* Vertical Path of Stages */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {act.stages.map((stage) => {
                      const isCleared = highestClearedStage >= stage.id;
                      const isNext = highestClearedStage === stage.id - 1;
                      const isLocked = highestClearedStage < stage.id - 1;

                      let nodeColor = theme.colors.textSecondary;
                      let borderColor = 'rgba(51, 65, 85, 0.5)';
                      let bg = 'rgba(30, 41, 59, 0.5)';

                      if (isCleared) {
                        nodeColor = theme.colors.success;
                        borderColor = theme.colors.success;
                        bg = 'rgba(34, 197, 94, 0.1)';
                      } else if (isNext) {
                        nodeColor = theme.colors.accent;
                        borderColor = theme.colors.accent;
                        bg = 'rgba(56, 189, 248, 0.2)';
                      }

                      return (
                        <div key={stage.id} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '15px',
                          opacity: isLocked ? 0.5 : 1
                        }}>
                          
                          {/* Node visual */}
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              border: `2px solid ${borderColor}`,
                              backgroundColor: bg,
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              boxShadow: isNext ? `0 0 10px ${theme.colors.accent}` : 'none'
                            }}>
                              {isCleared && <span style={{ fontSize: '12px', color: theme.colors.success }}>✓</span>}
                            </div>
                            {/* Connecting Line (don't draw after stage 10) */}
                            {stage.id % 10 !== 0 && (
                              <div style={{ width: '2px', height: '30px', backgroundColor: borderColor, margin: '2px 0' }} />
                            )}
                          </div>

                          {/* Stage Info & Button */}
                          <div style={{ 
                            flex: 1, 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            backgroundColor: 'rgba(30, 41, 59, 0.3)',
                            padding: '12px 15px',
                            borderRadius: '8px',
                            border: `1px solid ${borderColor}`,
                            marginBottom: stage.id % 10 !== 0 ? '30px' : '0' // Align with the connecting line gap
                          }}>
                            <div>
                              <div style={{ fontSize: '12px', color: nodeColor, fontWeight: 'bold' }}>
                                STAGE {stage.id}
                              </div>
                              <div style={{ fontSize: '16px', color: theme.colors.textPrimary, fontWeight: isNext ? 'bold' : 'normal' }}>
                                {stage.name}
                              </div>
                            </div>

                            {!isLocked ? (
                              <button 
                                onClick={onPrepareBattle}
                                style={{
                                  padding: '8px 16px',
                                  backgroundColor: isNext ? theme.colors.success : 'transparent',
                                  color: isNext ? '#fff' : theme.colors.textPrimary,
                                  border: isNext ? 'none' : `1px solid ${theme.colors.border}`,
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontWeight: 'bold',
                                  fontSize: '12px',
                                  boxShadow: isNext ? '0 3px 0 #166534' : 'none',
                                }}
                              >
                                {isCleared ? 'REPLAY' : 'PREPARE'}
                              </button>
                            ) : (
                              <div style={{ color: theme.colors.textSecondary, fontSize: '12px' }}>
                                LOCKED
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
