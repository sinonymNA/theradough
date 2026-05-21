import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--green)',
      color: 'var(--cream)',
      padding: '3rem 1.5rem 2rem',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2rem',
          marginBottom: '2.5rem',
        }}>
          {/* Brand */}
          <div>
            <img
              src="/logo.png"
              alt="TheraDough"
              style={{ height: '36px', width: 'auto', marginBottom: '0.75rem', opacity: 0.9 }}
              onError={e => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <span style={{
              display: 'none',
              fontFamily: 'Playfair Display, serif',
              fontSize: '1.2rem',
              fontWeight: 700,
              color: 'var(--cream)',
              marginBottom: '0.75rem',
              display: 'block',
            }}>
              TheraDough
            </span>
            <p style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '0.9rem',
              opacity: 0.7,
              margin: 0,
              fontStyle: 'italic',
            }}>
              Small-batch. Big love.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="label-caps" style={{ color: 'var(--cream)', opacity: 0.5, marginBottom: '1rem' }}>
              Navigate
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <Link to="/" style={{ color: 'var(--cream)', opacity: 0.8, fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem' }}>Home</Link>
              <Link to="/menu" style={{ color: 'var(--cream)', opacity: 0.8, fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem' }}>This Week's Menu</Link>
            </div>
          </div>

          {/* Social */}
          <div>
            <p className="label-caps" style={{ color: 'var(--cream)', opacity: 0.5, marginBottom: '1rem' }}>
              Follow Along
            </p>
            <a
              href="https://instagram.com/theradoughbreadco"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'var(--cream)',
                opacity: 0.8,
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '0.9rem',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
              </svg>
              @theradoughbreadco
            </a>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid rgba(245,239,230,0.15)',
          paddingTop: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}>
          <p style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '0.8rem',
            opacity: 0.5,
            margin: 0,
          }}>
            © {new Date().getFullYear()} TheraDough Bread Co. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
