import { useEffect, useState } from 'react';
import OrderStatusBadge from '../../components/OrderStatusBadge.jsx';
import ConfirmModal from '../../components/ConfirmModal.jsx';
import { useToast } from '../../components/Toast.jsx';
import { formatPrice, formatOrderNumber, formatPhone, formatDateTime } from '../../lib/utils.js';

const STATUSES = ['all', 'pending', 'confirmed', 'ready', 'completed', 'cancelled'];

export default function OrderManager() {
  const [drops, setDrops] = useState([]);
  const [selectedDropId, setSelectedDropId] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [orders, setOrders] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [pickupInputs, setPickupInputs] = useState({});
  const [saving, setSaving] = useState({});
  const [cancelTarget, setCancelTarget] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const token = localStorage.getItem('admin_token');

  async function loadDrops() {
    const res = await fetch('/api/drops', { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setDrops(Array.isArray(data) ? data : []);
  }

  async function loadOrders() {
    setLoading(true);
    let url = '/api/orders?';
    if (selectedDropId !== 'all') url += `drop_id=${selectedDropId}&`;
    if (statusFilter !== 'all') url += `status=${statusFilter}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setOrders(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { loadDrops(); }, []);
  useEffect(() => { loadOrders(); }, [selectedDropId, statusFilter]);

  async function updateOrder(id, body) {
    setSaving(prev => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        addToast('Order updated.', 'success');
        await loadOrders();
      } else {
        const d = await res.json();
        addToast(d.error || 'Error updating order', 'error');
      }
    } catch {
      addToast('Network error.', 'error');
    }
    setSaving(prev => ({ ...prev, [id]: false }));
  }

  const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total_cents, 0);
  const pendingCount = orders.filter(o => o.status === 'pending').length;

  return (
    <div>
      <h1 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--green)', margin: '0 0 1.5rem', fontSize: '1.75rem' }}>
        Orders
      </h1>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '1.25rem',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        <select
          value={selectedDropId}
          onChange={e => setSelectedDropId(e.target.value)}
          className="input-field"
          style={{ width: 'auto', padding: '0.5rem 0.75rem', fontSize: '0.9rem' }}
        >
          <option value="all">All Drops</option>
          {drops.map(d => (
            <option key={d.id} value={String(d.id)}>
              {d.drop_type === 'sunday' ? 'Sunday' : 'Wednesday'} — {d.drop_date?.split('T')[0]}
            </option>
          ))}
        </select>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                padding: '0.4rem 0.875rem',
                borderRadius: '20px',
                border: '1.5px solid',
                borderColor: statusFilter === s ? 'var(--rust)' : 'var(--border)',
                background: statusFilter === s ? 'var(--rust)' : 'transparent',
                color: statusFilter === s ? 'white' : 'var(--green)',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.2s ease',
              }}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Summary bar */}
      <div style={{
        display: 'flex',
        gap: '2rem',
        padding: '0.875rem 1.25rem',
        background: 'var(--card-bg)',
        borderRadius: '8px',
        marginBottom: '1.5rem',
        border: '1px solid var(--border)',
        flexWrap: 'wrap',
      }}>
        <div>
          <span className="label-caps" style={{ color: 'var(--green)', opacity: 0.5, display: 'block', marginBottom: '0.2rem' }}>Orders</span>
          <span style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, color: 'var(--green)', fontSize: '1.1rem' }}>{orders.length}</span>
        </div>
        <div>
          <span className="label-caps" style={{ color: 'var(--green)', opacity: 0.5, display: 'block', marginBottom: '0.2rem' }}>Revenue</span>
          <span style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, color: 'var(--rust)', fontSize: '1.1rem' }}>{formatPrice(totalRevenue)}</span>
        </div>
        <div>
          <span className="label-caps" style={{ color: 'var(--green)', opacity: 0.5, display: 'block', marginBottom: '0.2rem' }}>Pending</span>
          <span style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, color: pendingCount > 0 ? '#92400E' : 'var(--green)', fontSize: '1.1rem' }}>{pendingCount}</span>
        </div>
      </div>

      {/* Orders list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="spinner-dark" style={{ width: '2rem', height: '2rem' }} />
        </div>
      ) : orders.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <p style={{ fontFamily: 'DM Sans, sans-serif', color: 'var(--green-muted)' }}>
            No orders match these filters.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {orders.map(order => {
            const isExpanded = expandedId === order.id;
            const itemList = (order.items || []).filter(Boolean);

            return (
              <div key={order.id} className="card" style={{ overflow: 'hidden' }}>
                {/* Row */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                  style={{
                    padding: '1.1rem 1.25rem',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem',
                    flexWrap: 'wrap',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(45,74,62,0.03)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', flex: 1, minWidth: 0 }}>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, color: 'var(--green)', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                      {formatOrderNumber(order.id)}
                    </span>
                    <div>
                      <span style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, color: 'var(--green)', fontSize: '0.9rem', display: 'block' }}>
                        {order.customer_name}
                      </span>
                      <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem', color: 'var(--green-muted)' }}>
                        {formatPhone(order.customer_phone)}
                      </span>
                    </div>
                    <span style={{
                      fontFamily: 'DM Sans, sans-serif',
                      fontSize: '0.8rem',
                      color: 'var(--green-muted)',
                      flex: 1,
                      minWidth: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {itemList.map(i => `${i.menu_item_name} ×${i.quantity}`).join(', ')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, color: 'var(--rust)', fontSize: '0.95rem', whiteSpace: 'nowrap' }}>
                      {formatPrice(order.total_cents)}
                    </span>
                    <OrderStatusBadge status={order.status} />
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem', color: 'var(--green-muted)', whiteSpace: 'nowrap' }}>
                      {order.pickup_time || '—'}
                    </span>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem', color: 'var(--green-muted)', whiteSpace: 'nowrap' }}>
                      {formatDateTime(order.created_at)}
                    </span>
                    <span style={{ color: 'var(--green-muted)', fontSize: '0.9rem' }}>
                      {isExpanded ? '▲' : '▼'}
                    </span>
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div style={{
                    borderTop: '1px solid var(--border)',
                    padding: '1.5rem',
                    background: 'rgba(45,74,62,0.02)',
                  }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                      gap: '1.5rem',
                    }}>
                      {/* Items */}
                      <div>
                        <p className="label-caps" style={{ color: 'var(--green)', opacity: 0.5, marginBottom: '0.75rem' }}>Items</p>
                        {itemList.map(item => (
                          <div key={item.id} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '0.5rem',
                            fontFamily: 'DM Sans, sans-serif',
                            fontSize: '0.9rem',
                            color: 'var(--green)',
                          }}>
                            <span>{item.menu_item_name} ×{item.quantity}</span>
                            <span style={{ fontWeight: 600 }}>{formatPrice(item.price_cents * item.quantity)}</span>
                          </div>
                        ))}
                        <div style={{
                          borderTop: '1px solid var(--border)',
                          paddingTop: '0.5rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontFamily: 'DM Sans, sans-serif',
                          fontWeight: 700,
                          color: 'var(--rust)',
                          fontSize: '0.95rem',
                        }}>
                          <span>Total</span>
                          <span>{formatPrice(order.total_cents)}</span>
                        </div>
                      </div>

                      {/* Customer + Actions */}
                      <div>
                        <p className="label-caps" style={{ color: 'var(--green)', opacity: 0.5, marginBottom: '0.75rem' }}>Customer</p>
                        <p style={{ fontFamily: 'DM Sans, sans-serif', color: 'var(--green)', fontSize: '0.9rem', margin: '0 0 0.25rem', fontWeight: 600 }}>
                          {order.customer_name}
                        </p>
                        <p style={{ fontFamily: 'DM Sans, sans-serif', color: 'var(--green-muted)', fontSize: '0.85rem', margin: '0 0 1.5rem' }}>
                          {formatPhone(order.customer_phone)}
                        </p>

                        {/* Pickup time */}
                        <p className="label-caps" style={{ color: 'var(--green)', opacity: 0.5, marginBottom: '0.5rem' }}>Pickup Time</p>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                          <input
                            className="input-field"
                            style={{ flex: 1, padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
                            placeholder="e.g. Sunday 1–2pm"
                            value={pickupInputs[order.id] ?? (order.pickup_time || '')}
                            onChange={e => setPickupInputs(prev => ({ ...prev, [order.id]: e.target.value }))}
                          />
                          <button
                            className="btn-rust"
                            style={{ padding: '0.5rem 0.875rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                            disabled={saving[order.id]}
                            onClick={() => updateOrder(order.id, { pickup_time: pickupInputs[order.id] ?? order.pickup_time })}
                          >
                            Save
                          </button>
                        </div>

                        {/* Status actions */}
                        <p className="label-caps" style={{ color: 'var(--green)', opacity: 0.5, marginBottom: '0.6rem' }}>Actions</p>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {order.status === 'pending' && (
                            <button
                              className="btn-rust"
                              style={{ fontSize: '0.8rem', padding: '0.45rem 0.875rem', background: '#166534' }}
                              disabled={saving[order.id]}
                              onClick={() => updateOrder(order.id, { status: 'confirmed' })}
                            >
                              Confirm
                            </button>
                          )}
                          {['pending', 'confirmed'].includes(order.status) && (
                            <button
                              className="btn-rust"
                              style={{ fontSize: '0.8rem', padding: '0.45rem 0.875rem', background: '#1E40AF' }}
                              disabled={saving[order.id]}
                              onClick={() => updateOrder(order.id, { status: 'ready' })}
                            >
                              Mark Ready
                            </button>
                          )}
                          {['confirmed', 'ready'].includes(order.status) && (
                            <button
                              className="btn-rust"
                              style={{ fontSize: '0.8rem', padding: '0.45rem 0.875rem', background: '#4B5563' }}
                              disabled={saving[order.id]}
                              onClick={() => updateOrder(order.id, { status: 'completed' })}
                            >
                              Complete
                            </button>
                          )}
                          {order.status !== 'cancelled' && order.status !== 'completed' && (
                            <button
                              style={{
                                fontSize: '0.8rem',
                                padding: '0.45rem 0.875rem',
                                background: 'transparent',
                                border: '1.5px solid #FCA5A5',
                                color: '#B91C1C',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontFamily: 'DM Sans, sans-serif',
                                fontWeight: 500,
                              }}
                              disabled={saving[order.id]}
                              onClick={() => setCancelTarget(order)}
                            >
                              Cancel Order
                            </button>
                          )}
                        </div>

                        <p style={{
                          fontFamily: 'DM Sans, sans-serif',
                          fontSize: '0.75rem',
                          color: 'var(--green-muted)',
                          opacity: 0.6,
                          marginTop: '1rem',
                          fontStyle: 'italic',
                        }}>
                          SMS notifications coming soon
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {cancelTarget && (
        <ConfirmModal
          title="Cancel Order"
          message={`Are you sure you want to cancel ${formatOrderNumber(cancelTarget.id)} for ${cancelTarget.customer_name}? This cannot be undone.`}
          confirmLabel="Cancel Order"
          onConfirm={() => {
            updateOrder(cancelTarget.id, { status: 'cancelled' });
            setCancelTarget(null);
          }}
          onCancel={() => setCancelTarget(null)}
        />
      )}
    </div>
  );
}
