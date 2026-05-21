import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../components/Toast.jsx';
import { formatPrice, getDropLabel } from '../lib/utils.js';

export default function Checkout() {
  const { items, dropId, subtotalCents, clearCart } = useCart();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [drop, setDrop] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!items.length) {
      navigate('/menu');
      return;
    }
    if (dropId) {
      fetch(`/api/drops/current`)
        .then(r => r.json())
        .then(data => setDrop(data.drop));
    }
  }, []);

  function validate() {
    const errs = {};
    if (!name.trim()) errs.name = 'Name is required';
    const digits = phone.replace(/\D/g, '');
    if (!digits) errs.phone = 'Phone number is required';
    else if (digits.length !== 10) errs.phone = 'Please enter a 10-digit phone number';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        customer_name: name.trim(),
        customer_phone: phone.replace(/\D/g, ''),
        drop_id: parseInt(dropId),
        items: items.map(i => ({
          menu_item_id: i.menu_item_id,
          quantity: i.quantity,
        })),
      };
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        addToast(data.error || 'Something went wrong. Please try again.', 'error');
        setSubmitting(false);
        return;
      }
      clearCart();
      navigate(`/order-confirmation/${data.order.id}`);
    } catch {
      addToast('Network error. Please try again.', 'error');
      setSubmitting(false);
    }
  }

  if (!items.length) return null;

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '3rem 1.5rem' }}>
      <h1 style={{
        fontFamily: 'Playfair Display, serif',
        color: 'var(--green)',
        fontSize: '2rem',
        margin: '0 0 2rem',
      }}>
        Checkout
      </h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '2rem',
        alignItems: 'start',
      }}>
        {/* Order Summary */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <p className="label-caps" style={{ color: 'var(--green)', opacity: 0.6, marginBottom: '1.25rem' }}>
            Order Summary
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '1.25rem' }}>
            {items.map(item => (
              <div key={item.menu_item_id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '1rem',
              }}>
                <span style={{ fontFamily: 'DM Sans, sans-serif', color: 'var(--green)', fontSize: '0.95rem' }}>
                  {item.name} <span style={{ opacity: 0.5 }}>×{item.quantity}</span>
                </span>
                <span style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, color: 'var(--green)', fontSize: '0.95rem', whiteSpace: 'nowrap' }}>
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
            alignItems: 'center',
          }}>
            <span style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, color: 'var(--green)' }}>Total</span>
            <span style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: '1.2rem', color: 'var(--rust)' }}>
              {formatPrice(subtotalCents)}
            </span>
          </div>
          {drop && (
            <div style={{
              marginTop: '1.25rem',
              padding: '0.875rem',
              background: 'rgba(45,74,62,0.06)',
              borderRadius: '8px',
            }}>
              <p className="label-caps" style={{ color: 'var(--green)', opacity: 0.6, marginBottom: '0.4rem' }}>Pickup</p>
              <p style={{
                fontFamily: 'DM Sans, sans-serif',
                color: 'var(--green)',
                fontSize: '0.9rem',
                margin: 0,
                lineHeight: 1.5,
              }}>
                {getDropLabel(drop)}<br />
                <span style={{ opacity: 0.65 }}>We'll text you a time window when your order is ready.</span>
              </p>
            </div>
          )}
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem',
            background: '#FEF3C7',
            borderRadius: '8px',
          }}>
            <p style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '0.85rem',
              color: '#92400E',
              margin: 0,
              fontWeight: 500,
            }}>
              💰 Pay on pickup — no payment needed now
            </p>
          </div>
        </div>

        {/* Customer Info Form */}
        <form onSubmit={handleSubmit}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <p className="label-caps" style={{ color: 'var(--green)', opacity: 0.6, marginBottom: '1.25rem' }}>
              Your Info
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontFamily: 'DM Sans, sans-serif',
                  fontWeight: 600,
                  color: 'var(--green)',
                  fontSize: '0.9rem',
                  marginBottom: '0.4rem',
                }}>
                  Full Name *
                </label>
                <input
                  className="input-field"
                  type="text"
                  value={name}
                  onChange={e => { setName(e.target.value); setErrors(prev => ({ ...prev, name: '' })); }}
                  placeholder="Jane Smith"
                />
                {errors.name && (
                  <p style={{ color: '#B91C1C', fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                    {errors.name}
                  </p>
                )}
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontFamily: 'DM Sans, sans-serif',
                  fontWeight: 600,
                  color: 'var(--green)',
                  fontSize: '0.9rem',
                  marginBottom: '0.4rem',
                }}>
                  Phone Number *
                </label>
                <input
                  className="input-field"
                  type="tel"
                  value={phone}
                  onChange={e => { setPhone(e.target.value); setErrors(prev => ({ ...prev, phone: '' })); }}
                  placeholder="(555) 867-5309"
                />
                {errors.phone && (
                  <p style={{ color: '#B91C1C', fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                    {errors.phone}
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="btn-rust"
              disabled={submitting}
              style={{ width: '100%', marginTop: '1.75rem', fontSize: '1rem' }}
            >
              {submitting ? <><span className="spinner" /> Placing Order...</> : 'Place Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
