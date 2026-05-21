import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { formatPrice } from '../lib/utils.js';

export default function CartDrawer({ open, onClose }) {
  const { items, itemCount, subtotalCents, removeItem, updateQty } = useCart();
  const navigate = useNavigate();

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          zIndex: 400,
        }}
      />
      {/* Drawer */}
      <div
        className="slide-in-right"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100%',
          width: '100%',
          maxWidth: '420px',
          background: 'var(--card-bg)',
          zIndex: 500,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-4px 0 30px rgba(0,0,0,0.15)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h2 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--green)' }}>
            Your Cart {itemCount > 0 && <span style={{ color: 'var(--rust)', fontSize: '1rem' }}>({itemCount})</span>}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: 'var(--green-muted)',
              lineHeight: 1,
              padding: '0.25rem',
            }}
          >
            ×
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧺</div>
              <p style={{ color: 'var(--green-muted)', marginBottom: '1rem', fontFamily: 'DM Sans, sans-serif' }}>
                Your cart is empty
              </p>
              <button
                className="btn-rust"
                onClick={() => { onClose(); navigate('/menu'); }}
              >
                Browse the menu
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {items.map(item => (
                <div key={item.menu_item_id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.875rem',
                  background: 'white',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontFamily: 'DM Sans, sans-serif',
                      fontWeight: 600,
                      color: 'var(--green)',
                      marginBottom: '0.25rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {item.name}
                    </div>
                    <div style={{ color: 'var(--rust)', fontWeight: 600, fontSize: '0.9rem' }}>
                      {formatPrice(item.price_cents * item.quantity)}
                    </div>
                  </div>
                  {/* Qty controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      onClick={() => updateQty(item.menu_item_id, item.quantity - 1)}
                      style={{
                        width: '28px', height: '28px',
                        borderRadius: '50%',
                        border: '1.5px solid var(--border)',
                        background: 'white',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--green)',
                      }}
                    >
                      −
                    </button>
                    <span style={{
                      minWidth: '20px',
                      textAlign: 'center',
                      fontFamily: 'DM Sans, sans-serif',
                      fontWeight: 600,
                      color: 'var(--green)',
                    }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQty(item.menu_item_id, item.quantity + 1)}
                      style={{
                        width: '28px', height: '28px',
                        borderRadius: '50%',
                        border: '1.5px solid var(--border)',
                        background: 'white',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--green)',
                      }}
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeItem(item.menu_item_id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#9CA3AF',
                        fontSize: '1.1rem',
                        padding: '0.25rem',
                        marginLeft: '0.25rem',
                      }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{
            padding: '1.25rem 1.5rem',
            borderTop: '1px solid var(--border)',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
            }}>
              <span style={{
                fontFamily: 'DM Sans, sans-serif',
                fontWeight: 600,
                color: 'var(--green)',
              }}>
                Subtotal
              </span>
              <span style={{
                fontFamily: 'DM Sans, sans-serif',
                fontWeight: 700,
                fontSize: '1.1rem',
                color: 'var(--rust)',
              }}>
                {formatPrice(subtotalCents)}
              </span>
            </div>
            <button
              className="btn-rust"
              style={{ width: '100%', fontSize: '1rem' }}
              onClick={() => { onClose(); navigate('/checkout'); }}
            >
              Checkout →
            </button>
          </div>
        )}
      </div>
    </>
  );
}
