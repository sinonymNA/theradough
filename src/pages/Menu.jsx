import { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext.jsx';
import MenuItemCard from '../components/MenuItemCard.jsx';
import Footer from '../components/Footer.jsx';
import { getDropLabel, getDeadlineCountdown } from '../lib/utils.js';

export default function Menu() {
  const [drop, setDrop] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState('');
  const { setCurrentDrop } = useCart();

  useEffect(() => {
    fetch('/api/drops/current')
      .then(r => r.json())
      .then(data => {
        setDrop(data.drop);
        setMenuItems(data.menuItems || []);
        if (data.drop) setCurrentDrop(data.drop.id);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!drop?.order_deadline) return;
    const update = () => setCountdown(getDeadlineCountdown(drop.order_deadline) || '');
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [drop]);

  const orderingClosed = drop ? new Date() > new Date(drop.order_deadline) : false;

  if (loading) {
    return (
      <div style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div className="spinner-dark" style={{ width: '2rem', height: '2rem' }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Header */}
      <div style={{
        background: 'var(--green)',
        padding: '3rem 1.5rem 2.5rem',
        textAlign: 'center',
      }}>
        <p className="label-caps" style={{ color: 'var(--cream)', opacity: 0.6, marginBottom: '0.75rem' }}>
          {drop ? 'This Week' : 'Menu'}
        </p>
        <h1 style={{
          fontFamily: 'Playfair Display, serif',
          color: 'var(--cream)',
          fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
          margin: '0 0 0.75rem',
        }}>
          {drop ? getDropLabel(drop) : "The Menu"}
        </h1>
        {drop && !orderingClosed && countdown && (
          <p style={{
            fontFamily: 'DM Sans, sans-serif',
            color: 'var(--cream)',
            opacity: 0.75,
            fontSize: '0.9rem',
            margin: 0,
          }}>
            Order by deadline — {countdown}
          </p>
        )}
        {drop && orderingClosed && (
          <p style={{
            fontFamily: 'DM Sans, sans-serif',
            color: '#FCA5A5',
            fontSize: '0.9rem',
            margin: 0,
            fontWeight: 600,
          }}>
            Ordering is closed for this drop.
          </p>
        )}
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        {!drop ? (
          /* No drop scheduled */
          <div style={{
            textAlign: 'center',
            padding: '4rem 1rem',
          }}>
            <div style={{ fontSize: '5rem', marginBottom: '1.5rem' }}>🍞</div>
            <h2 style={{
              fontFamily: 'Playfair Display, serif',
              color: 'var(--green)',
              fontSize: '1.75rem',
              margin: '0 0 1rem',
            }}>
              No drop scheduled yet.
            </h2>
            <p style={{
              fontFamily: 'DM Sans, sans-serif',
              color: 'var(--green-muted)',
              fontSize: '1rem',
            }}>
              Check back Monday — new drops go live at the start of each week.
            </p>
          </div>
        ) : menuItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ fontFamily: 'DM Sans, sans-serif', color: 'var(--green-muted)' }}>
              Menu items coming soon — check back later!
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}>
            {menuItems.map(item => (
              <MenuItemCard
                key={item.id}
                item={item}
                dropId={drop.id}
                orderingClosed={orderingClosed}
              />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
