import { theme } from '../theme';

export function EnemyInfoCard() {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'flex-end',
      padding: '20px'
    }}>
      <div style={{
        width: '280px',
        backgroundColor: 'rgba(30, 41, 59, 0.95)',
        border: `2px solid ${theme.colors.danger}`,
        borderRadius: '8px',
        padding: '15px',
        pointerEvents: 'auto',
        color: theme.colors.textPrimary,
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.colors.border}`, paddingBottom: '10px', marginBottom: '10px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', textTransform: 'uppercase', color: theme.colors.danger }}>Troll Bot</h3>
          <button style={{ background: 'none', border: 'none', color: theme.colors.textMuted, cursor: 'pointer', fontSize: '20px', lineHeight: 1 }}>&times;</button>
        </div>
        
        <div style={{ width: '100%', height: '120px', display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
          <img src="/assets/troll_bot.png" alt="Troll Bot" style={{ height: '100%', objectFit: 'contain' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: theme.colors.textMuted }}>HP</span>
            <span style={{ fontWeight: 'bold' }}>150 / 150</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: theme.colors.textMuted }}>Speed</span>
            <span style={{ fontWeight: 'bold', color: theme.colors.accent }}>Fast</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: theme.colors.textMuted }}>Armor</span>
            <span style={{ fontWeight: 'bold' }}>Light</span>
          </div>
        </div>

        <div style={{ marginTop: '15px', paddingTop: '10px', borderTop: `1px solid ${theme.colors.border}` }}>
          <div style={{ fontSize: '12px', color: theme.colors.textMuted, textTransform: 'uppercase', marginBottom: '8px' }}>Weaknesses</div>
          <div style={{ display: 'flex', gap: '5px' }}>
            <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: theme.colors.danger, padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>Slow</span>
            <span style={{ backgroundColor: 'rgba(56, 189, 248, 0.2)', color: theme.colors.accent, padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>Stun</span>
          </div>
        </div>
      </div>
    </div>
  );
}
