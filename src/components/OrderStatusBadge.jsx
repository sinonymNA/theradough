const STATUS_STYLES = {
  pending:   { background: '#FEF3C7', color: '#92400E', label: 'Pending' },
  confirmed: { background: '#DCFCE7', color: '#166534', label: 'Confirmed' },
  ready:     { background: '#DBEAFE', color: '#1E40AF', label: 'Ready' },
  completed: { background: '#F3F4F6', color: '#4B5563', label: 'Completed' },
  cancelled: { background: '#FEE2E2', color: '#991B1B', label: 'Cancelled' },
  draft:     { background: '#F3F4F6', color: '#6B7280', label: 'Draft' },
  published: { background: '#DCFCE7', color: '#166534', label: 'Published' },
  closed:    { background: '#FEE2E2', color: '#991B1B', label: 'Closed' },
};

export default function OrderStatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.pending;
  return (
    <span style={{
      display: 'inline-block',
      padding: '0.2rem 0.65rem',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: 600,
      fontFamily: 'DM Sans, sans-serif',
      letterSpacing: '0.05em',
      background: style.background,
      color: style.color,
      whiteSpace: 'nowrap',
    }}>
      {style.label}
    </span>
  );
}
