import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import CartDrawer from './CartDrawer.jsx';

export default function Navbar() {
  const { itemCount } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 300,
        background: 'var(--cream)',
        borderBottom: '1px solid var(--border)',
        padding: '0 1.5rem',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '64px',
        }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
            <img
              src="/Image 1-27-26 at 4.01 PM.jpeg"
              alt="TheraDough Bread Co."
              style={{ height: '40px', width: 'auto', maxWidth: '140px', objectFit: 'contain' }}
              onError={e => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <span style={{
              display: 'none',
              fontFamily: 'Playfair Display, serif',
              fontSize: '1.25rem',
              color: 'var(--green)',
              fontWeight: 700,
            }}>
              TheraDough
            </span>
          </Link>

          {/* Desktop Nav */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2rem',
          }} className="desktop-nav">
            <NavLink
              to="/"
              end
              style={({ isActive }) => ({
                fontFamily: 'DM Sans, sans-serif',
                fontWeight: 500,
                color: isActive ? 'var(--rust)' : 'var(--green)',
                textDecoration: 'none',
              })}
            >
              Home
            </NavLink>
            <NavLink
              to="/menu"
              style={({ isActive }) => ({
                fontFamily: 'DM Sans, sans-serif',
                fontWeight: 500,
                color: isActive ? 'var(--rust)' : 'var(--green)',
                textDecoration: 'none',
              })}
            >
              Menu
            </NavLink>
            {/* Cart */}
            <button
              onClick={() => setCartOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.25rem',
                position: 'relative',
              }}
              aria-label="Open cart"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              {itemCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: 'var(--rust)',
                  color: 'white',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'DM Sans, sans-serif',
                }}>
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile: cart + hamburger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }} className="mobile-nav">
            <button
              onClick={() => setCartOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                padding: '0.25rem',
              }}
              aria-label="Open cart"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              {itemCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: 'var(--rust)',
                  color: 'white',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'DM Sans, sans-serif',
                }}>
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '5px',
              }}
              aria-label="Toggle menu"
            >
              <span style={{ display: 'block', width: '22px', height: '2px', background: 'var(--green)', transition: 'all 0.2s ease' }} />
              <span style={{ display: 'block', width: '22px', height: '2px', background: 'var(--green)', transition: 'all 0.2s ease' }} />
              <span style={{ display: 'block', width: '22px', height: '2px', background: 'var(--green)', transition: 'all 0.2s ease' }} />
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {menuOpen && (
          <div className="slide-down" style={{
            padding: '1rem 1.5rem 1.5rem',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}>
            <NavLink
              to="/"
              end
              onClick={() => setMenuOpen(false)}
              style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 500, color: 'var(--green)', fontSize: '1.05rem' }}
            >
              Home
            </NavLink>
            <NavLink
              to="/menu"
              onClick={() => setMenuOpen(false)}
              style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 500, color: 'var(--green)', fontSize: '1.05rem' }}
            >
              Menu
            </NavLink>
          </div>
        )}
      </nav>

      <style>{`
        @media (min-width: 640px) {
          .desktop-nav { display: flex !important; }
          .mobile-nav { display: none !important; }
        }
        @media (max-width: 639px) {
          .desktop-nav { display: none !important; }
          .mobile-nav { display: flex !important; }
        }
      `}</style>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
