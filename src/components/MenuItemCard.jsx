import { useCart } from '../context/CartContext.jsx';
import { formatPrice } from '../lib/utils.js';

export default function MenuItemCard({ item, dropId, orderingClosed }) {
  const { items, addItem, updateQty } = useCart();
  const cartItem = items.find(i => i.menu_item_id === item.id);
  const remaining = item.quantity_available - item.quantity_ordered;
  const soldOut = remaining <= 0;

  return (
    <div className="card" style={{
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative',
      transition: 'box-shadow 0.2s ease',
      opacity: (soldOut || orderingClosed) ? 0.75 : 1,
    }}>
      {/* Image */}
      <div style={{
        height: '200px',
        background: '#E8DDD0',
        overflow: 'hidden',
        position: 'relative',
        flexShrink: 0,
      }}>
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={e => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div style={{
          display: item.image_url ? 'none' : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          fontSize: '4rem',
        }}>
          🍞
        </div>

        {/* Sold Out overlay */}
        {soldOut && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{
              background: 'white',
              color: 'var(--green)',
              fontFamily: 'DM Sans, sans-serif',
              fontWeight: 700,
              fontSize: '0.85rem',
              padding: '0.4rem 1rem',
              borderRadius: '20px',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}>
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{
          fontFamily: 'Playfair Display, serif',
          color: 'var(--green)',
          margin: '0 0 0.5rem',
          fontSize: '1.1rem',
          fontWeight: 600,
        }}>
          {item.name}
        </h3>

        {item.description && (
          <p className="line-clamp-2" style={{
            fontFamily: 'DM Sans, sans-serif',
            color: 'var(--green-muted)',
            fontSize: '0.875rem',
            margin: '0 0 0.75rem',
            lineHeight: 1.6,
            flex: 1,
          }}>
            {item.description}
          </p>
        )}

        <div style={{ marginTop: 'auto' }}>
          {item.allergens && (
            <p className="label-caps" style={{
              color: 'var(--green-muted)',
              marginBottom: '0.5rem',
              opacity: 0.7,
            }}>
              Contains: {item.allergens}
            </p>
          )}

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.875rem',
          }}>
            <span style={{
              fontFamily: 'DM Sans, sans-serif',
              fontWeight: 700,
              fontSize: '1.1rem',
              color: 'var(--rust)',
            }}>
              {formatPrice(item.price_cents)}
            </span>
            {!soldOut && remaining <= 5 && (
              <span style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '0.75rem',
                color: '#B45309',
                fontWeight: 600,
              }}>
                {remaining} left
              </span>
            )}
          </div>

          {/* Cart controls */}
          {!soldOut && !orderingClosed && (
            cartItem ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0',
                border: '1.5px solid var(--border)',
                borderRadius: '8px',
                overflow: 'hidden',
              }}>
                <button
                  onClick={() => updateQty(item.id, cartItem.quantity - 1)}
                  style={{
                    flex: 1,
                    background: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.6rem',
                    fontSize: '1.1rem',
                    color: 'var(--green)',
                    fontWeight: 600,
                    transition: 'background 0.2s ease',
                  }}
                >
                  −
                </button>
                <span style={{
                  minWidth: '40px',
                  textAlign: 'center',
                  fontFamily: 'DM Sans, sans-serif',
                  fontWeight: 700,
                  color: 'var(--green)',
                  fontSize: '1rem',
                  padding: '0.6rem 0',
                  borderLeft: '1px solid var(--border)',
                  borderRight: '1px solid var(--border)',
                }}>
                  {cartItem.quantity}
                </span>
                <button
                  onClick={() => updateQty(item.id, cartItem.quantity + 1)}
                  disabled={cartItem.quantity >= remaining}
                  style={{
                    flex: 1,
                    background: 'white',
                    border: 'none',
                    cursor: cartItem.quantity >= remaining ? 'not-allowed' : 'pointer',
                    padding: '0.6rem',
                    fontSize: '1.1rem',
                    color: cartItem.quantity >= remaining ? '#9CA3AF' : 'var(--green)',
                    fontWeight: 600,
                    transition: 'background 0.2s ease',
                  }}
                >
                  +
                </button>
              </div>
            ) : (
              <button
                className="btn-rust"
                style={{ width: '100%' }}
                onClick={() => addItem(item, String(dropId))}
              >
                Add to Cart
              </button>
            )
          )}

          {(soldOut || orderingClosed) && (
            <button
              className="btn-rust"
              disabled
              style={{ width: '100%' }}
            >
              {soldOut ? 'Sold Out' : 'Ordering Closed'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
