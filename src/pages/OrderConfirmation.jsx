import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { formatPrice, formatOrderNumber, formatPhone, getDropLabel } from '../lib/utils.js';

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/orders/${orderId}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error);
        else setData(d);
        setLoading(false);
      })
      .catch(() => { setError('Could not load order.'); setLoading(false); });
  }, [orderId]);

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner-dark" style={{ width: '2rem', height: '2rem' }} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
        <p style={{ fontFamily: 'DM Sans, sans-serif', color: 'var(--green-muted)' }}>
          {error || 'Order not found.'}
        </p>
        <Link to="/">
          <button className="btn-rust" style={{ marginTop: '1.5rem' }}>Back to Home</button>
        </Link>
      </div>
    );
  }

  const { order, items, drop } = data;

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto', padding: '4rem 1.5rem', textAlign: 'center' }}>
      {/* Success icon */}
      <div style={{
        width: '72px',
        height: '72px',
        borderRadius: '50%',
        background: 'rgba(160,82,45,0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 1.5rem',
      }}>
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="var(--rust)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>

      <h1 style={{
        fontFamily: 'Playfair Display, serif',
        color: 'var(--green)',
        fontSize: '2rem',
        margin: '0 0 0.5rem',
      }}>
        Order confirmed!
      </h1>
      <p style={{
        fontFamily: 'DM Sans, sans-serif',
        color: 'var(--rust)',
        fontWeight: 600,
        fontSize: '1rem',
        marginBottom: '2rem',
      }}>
        {formatOrderNumber(order.id)}
      </p>

      {/* Order card */}
      <div className="card" style={{ padding: '1.5rem', textAlign: 'left', marginBottom: '1.5rem' }}>
        <p className="label-caps" style={{ color: 'var(--green)', opacity: 0.5, marginBottom: '1rem' }}>Items Ordered</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
          {items.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'DM Sans, sans-serif', color: 'var(--green)', fontSize: '0.95rem' }}>
                {item.menu_item_name} <span style={{ opacity: 0.5 }}>×{item.quantity}</span>
              </span>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, color: 'var(--green)', fontSize: '0.95rem' }}>
                {formatPrice(item.price_cents * item.quantity)}
              </span>
            </div>
          ))}
        </div>
        <div style={{
          borderTop: '1px solid var(--border)',
          paddingTop: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
        }}>
          <span style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, color: 'var(--green)' }}>Total</span>
          <span style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: 'var(--rust)' }}>
            {formatPrice(order.total_cents)}
          </span>
        </div>
      </div>

      {/* Pickup info */}
      <div className="card" style={{ padding: '1.5rem', textAlign: 'left', marginBottom: '2rem' }}>
        {drop && (
          <div style={{ marginBottom: '1rem' }}>
            <p className="label-caps" style={{ color: 'var(--green)', opacity: 0.5, marginBottom: '0.4rem' }}>Pickup</p>
            <p style={{ fontFamily: 'DM Sans, sans-serif', color: 'var(--green)', fontSize: '0.95rem', margin: 0 }}>
              {getDropLabel(drop)}
            </p>
          </div>
        )}
        <p style={{
          fontFamily: 'DM Sans, sans-serif',
          color: 'var(--green-muted)',
          fontSize: '0.9rem',
          margin: 0,
          lineHeight: 1.6,
        }}>
          We'll text <strong>{formatPhone(order.customer_phone)}</strong> when your order is ready with your pickup time window.
        </p>
      </div>

      <Link to="/">
        <button className="btn-outline" style={{ width: '100%' }}>← Back to Home</button>
      </Link>
    </div>
  );
}
