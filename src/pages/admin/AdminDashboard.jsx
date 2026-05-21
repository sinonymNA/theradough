import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OrderStatusBadge from '../../components/OrderStatusBadge.jsx';
import { formatPrice, formatOrderNumber, formatDateTime, getDropLabel } from '../../lib/utils.js';

function StatCard({ label, value, sub }) {
  return (
    <div className="card" style={{ padding: '1.5rem' }}>
      <p className="label-caps" style={{ color: 'var(--green)', opacity: 0.5, marginBottom: '0.75rem' }}>
        {label}
      </p>
      <p style={{
        fontFamily: 'Playfair Display, serif',
        fontSize: '2rem',
        color: 'var(--green)',
        margin: '0 0 0.25rem',
        fontWeight: 700,
      }}>
        {value}
      </p>
      {sub && (
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', color: 'var(--green-muted)', margin: 0, opacity: 0.7 }}>
          {sub}
        </p>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const [drop, setDrop] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('admin_token');

  useEffect(() => {
    async function load() {
      try {
        const [dropRes, allDropsRes] = await Promise.all([
          fetch('/api/drops/current'),
          fetch('/api/drops', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const dropData = await dropRes.json();
        const allDrops = await allDropsRes.json();

        const currentDrop = dropData.drop;
        setDrop(currentDrop);

        if (currentDrop) {
          const ordersRes = await fetch(`/api/orders?drop_id=${currentDrop.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const ordersData = await ordersRes.json();
          setOrders(Array.isArray(ordersData) ? ordersData : []);
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    load();
  }, []);

  const totalRevenue = orders.reduce((s, o) => s + o.total_cents, 0);
  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const recentOrders = orders.slice(0, 10);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
        <div className="spinner-dark" style={{ width: '2rem', height: '2rem' }} />
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--green)', margin: '0 0 2rem', fontSize: '1.75rem' }}>
        Overview
      </h1>

      {/* Stats grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2.5rem',
      }}>
        <StatCard
          label="Active Drop"
          value={drop ? (drop.drop_type === 'sunday' ? 'Sun' : 'Wed') : '—'}
          sub={drop ? getDropLabel(drop) : 'No published drop'}
        />
        <StatCard
          label="Total Orders"
          value={orders.length}
          sub="This drop"
        />
        <StatCard
          label="Revenue"
          value={orders.length ? formatPrice(totalRevenue) : '$0.00'}
          sub="This drop, pre-tax"
        />
        <StatCard
          label="Pending"
          value={pendingCount}
          sub="Awaiting confirmation"
        />
      </div>

      {/* Recent orders */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--green)', margin: 0, fontSize: '1.15rem' }}>
            Recent Orders
          </h2>
          {orders.length > 0 && (
            <button
              className="btn-outline"
              style={{ fontSize: '0.85rem', padding: '0.4rem 0.875rem' }}
              onClick={() => navigate('/admin/orders')}
            >
              View All
            </button>
          )}
        </div>

        {recentOrders.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ fontFamily: 'DM Sans, sans-serif', color: 'var(--green-muted)', opacity: 0.6 }}>
              {drop ? 'No orders yet for this drop.' : 'No active drop — create one in Drop Manager.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'DM Sans, sans-serif' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Order', 'Customer', 'Items', 'Total', 'Status', 'Time'].map(h => (
                    <th key={h} style={{
                      padding: '0.875rem 1.25rem',
                      textAlign: 'left',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--green)',
                      opacity: 0.5,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      whiteSpace: 'nowrap',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, idx) => (
                  <tr
                    key={order.id}
                    onClick={() => navigate('/admin/orders')}
                    style={{
                      borderBottom: idx < recentOrders.length - 1 ? '1px solid var(--border)' : 'none',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(45,74,62,0.04)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 600, color: 'var(--green)', fontSize: '0.9rem' }}>
                      {formatOrderNumber(order.id)}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--green)', fontSize: '0.9rem' }}>
                      {order.customer_name}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--green-muted)', fontSize: '0.85rem' }}>
                      {(order.items || []).filter(Boolean).map(i => `${i.menu_item_name} ×${i.quantity}`).join(', ')}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 600, color: 'var(--rust)', fontSize: '0.9rem' }}>
                      {formatPrice(order.total_cents)}
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--green-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                      {formatDateTime(order.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
