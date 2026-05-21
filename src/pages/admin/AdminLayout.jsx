import { useEffect, useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';

export default function AdminLayout() {
  const navigate = useNavigate();
  const [verified, setVerified] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) { navigate('/admin/login'); return; }
    fetch('/api/admin/verify', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (!data.valid) {
          localStorage.removeItem('admin_token');
          navigate('/admin/login');
        } else {
          setVerified(true);
        }
      })
      .catch(() => navigate('/admin/login'));
  }, []);

  function signOut() {
    const token = localStorage.getItem('admin_token');
    if (token) {
      fetch('/api/admin/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    }
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  }

  if (!verified) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner-dark" style={{ width: '2rem', height: '2rem' }} />
      </div>
    );
  }

  const navLinks = [
    { to: '/admin', label: 'Overview', icon: '📊', end: true },
    { to: '/admin/drops', label: 'Drop Manager', icon: '📅' },
    { to: '/admin/menu-builder', label: 'Menu Builder', icon: '🍞' },
    { to: '/admin/orders', label: 'Orders', icon: '📋' },
  ];

  const sidebarContent = (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    }}>
      {/* Logo area */}
      <div style={{
        padding: '1.5rem',
        borderBottom: '1px solid rgba(245,239,230,0.1)',
      }}>
        <img
          src="/logo.png"
          alt="TheraDough"
          style={{ height: '32px', opacity: 0.85, marginBottom: '0.25rem' }}
          onError={e => e.target.style.display = 'none'}
        />
        <p className="label-caps" style={{ color: 'var(--cream)', opacity: 0.4, marginTop: '0.5rem', marginBottom: 0 }}>
          Admin Panel
        </p>
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, padding: '1rem 0' }}>
        {navLinks.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            onClick={() => setSidebarOpen(false)}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1.5rem',
              fontFamily: 'DM Sans, sans-serif',
              fontWeight: isActive ? 600 : 400,
              color: 'var(--cream)',
              background: isActive ? 'rgba(245,239,230,0.1)' : 'transparent',
              borderLeft: isActive ? '3px solid var(--rust)' : '3px solid transparent',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              fontSize: '0.95rem',
            })}
          >
            <span>{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div style={{
        padding: '1.5rem',
        borderTop: '1px solid rgba(245,239,230,0.1)',
      }}>
        <p style={{
          fontFamily: 'DM Sans, sans-serif',
          color: 'var(--cream)',
          opacity: 0.5,
          fontSize: '0.8rem',
          margin: '0 0 1rem',
        }}>
          TheraDough Bread Co.
        </p>
        <button
          onClick={signOut}
          style={{
            background: 'rgba(245,239,230,0.08)',
            border: '1px solid rgba(245,239,230,0.2)',
            color: 'var(--cream)',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '0.85rem',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            cursor: 'pointer',
            width: '100%',
            textAlign: 'center',
            transition: 'background 0.2s ease',
          }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Desktop Sidebar */}
      <aside style={{
        width: '240px',
        background: 'var(--green)',
        flexShrink: 0,
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        overflowY: 'auto',
        zIndex: 200,
      }} className="admin-sidebar">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 300,
            }}
          />
          <aside style={{
            position: 'fixed',
            top: 0,
            left: 0,
            bottom: 0,
            width: '260px',
            background: 'var(--green)',
            zIndex: 400,
            overflowY: 'auto',
          }} className="slide-in-right">
            {sidebarContent}
          </aside>
        </>
      )}

      {/* Main content */}
      <main style={{
        flex: 1,
        background: '#F0EBE1',
        minHeight: '100vh',
        overflowX: 'hidden',
      }} className="admin-main">
        {/* Mobile top bar */}
        <div className="admin-mobile-bar" style={{
          display: 'none',
          background: 'var(--green)',
          padding: '0.875rem 1.25rem',
          alignItems: 'center',
          gap: '1rem',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}>
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              padding: '4px',
            }}
          >
            {[1,2,3].map(i => (
              <span key={i} style={{ display: 'block', width: '20px', height: '2px', background: 'var(--cream)' }} />
            ))}
          </button>
          <span style={{
            fontFamily: 'Playfair Display, serif',
            color: 'var(--cream)',
            fontSize: '1rem',
            fontWeight: 600,
          }}>
            Admin
          </span>
        </div>

        <div style={{ padding: '2rem' }}>
          <Outlet />
        </div>
      </main>

      <style>{`
        @media (min-width: 768px) {
          .admin-sidebar { display: block !important; }
          .admin-main { margin-left: 240px; }
          .admin-mobile-bar { display: none !important; }
        }
        @media (max-width: 767px) {
          .admin-sidebar { display: none !important; }
          .admin-main { margin-left: 0; }
          .admin-mobile-bar { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
