export default function ConfirmModal({ title, message, onConfirm, onCancel, confirmLabel = 'Confirm', danger = true }) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.5)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
    }}
      onClick={onCancel}
    >
      <div
        className="card"
        style={{ padding: '2rem', maxWidth: '420px', width: '100%' }}
        onClick={e => e.stopPropagation()}
      >
        <h3 style={{
          margin: '0 0 0.75rem',
          fontFamily: 'Playfair Display, serif',
          color: 'var(--green)',
          fontSize: '1.25rem',
        }}>
          {title}
        </h3>
        <p style={{
          color: 'var(--green-muted)',
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '0.95rem',
          margin: '0 0 1.5rem',
          lineHeight: 1.6,
        }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button className="btn-outline" onClick={onCancel}>Cancel</button>
          <button
            className="btn-rust"
            onClick={onConfirm}
            style={danger ? { background: '#B91C1C' } : {}}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
