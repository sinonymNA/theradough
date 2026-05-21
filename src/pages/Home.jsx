import { Link } from 'react-router-dom';
import Footer from '../components/Footer.jsx';

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="grain-overlay" style={{
        background: 'var(--cream)',
        padding: '6rem 1.5rem 5rem',
        textAlign: 'center',
        position: 'relative',
      }}>
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '720px', margin: '0 auto' }}>
          <p className="label-caps" style={{ color: 'var(--rust)', marginBottom: '1.25rem', opacity: 0.9 }}>
            TheraDough Bread Co.
          </p>
          <h1 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            color: 'var(--green)',
            lineHeight: 1.15,
            margin: '0 0 1.5rem',
            fontWeight: 700,
          }}>
            Handcrafted with patience.
          </h1>
          <p style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
            color: 'var(--green-muted)',
            lineHeight: 1.7,
            margin: '0 0 2.5rem',
            maxWidth: '520px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            Small-batch sourdough, baked fresh each week. Order online, pick up Sunday.
          </p>
          <Link to="/menu">
            <button className="btn-rust" style={{ fontSize: '1.05rem', padding: '0.9rem 2rem' }}>
              Shop This Week's Drop →
            </button>
          </Link>

          {/* Scroll indicator */}
          <div className="bounce" style={{
            marginTop: '4rem',
            display: 'flex',
            justifyContent: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeOpacity="0.4" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{
        background: 'var(--green)',
        padding: '5rem 1.5rem',
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <p className="label-caps" style={{
            color: 'var(--cream)',
            opacity: 0.5,
            textAlign: 'center',
            marginBottom: '1rem',
          }}>
            How It Works
          </p>
          <h2 style={{
            fontFamily: 'Playfair Display, serif',
            color: 'var(--cream)',
            textAlign: 'center',
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            margin: '0 0 3.5rem',
          }}>
            Fresh bread, delivered to your pickup spot.
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2.5rem',
          }}>
            {[
              { icon: '🛒', step: '01', title: 'Browse the menu', desc: 'New drops go live each Monday. Browse sourdoughs, focaccias, pastries, and more.' },
              { icon: '✍️', step: '02', title: 'Place your order', desc: 'Order online before the deadline. No payment needed — just pay on pickup.' },
              { icon: '📦', step: '03', title: 'Pick up your bread', desc: 'Swing by Sunday or Wednesday. We\'ll text you your pickup window when it\'s ready.' },
            ].map(({ icon, step, title, desc }) => (
              <div key={step} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{icon}</div>
                <p className="label-caps" style={{ color: 'var(--cream)', opacity: 0.5, marginBottom: '0.5rem' }}>
                  Step {step}
                </p>
                <h3 style={{
                  fontFamily: 'Playfair Display, serif',
                  color: 'var(--cream)',
                  fontSize: '1.15rem',
                  margin: '0 0 0.75rem',
                  fontWeight: 600,
                }}>
                  {title}
                </h3>
                <p style={{
                  fontFamily: 'DM Sans, sans-serif',
                  color: 'var(--cream)',
                  opacity: 0.65,
                  fontSize: '0.9rem',
                  lineHeight: 1.7,
                  margin: 0,
                }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section style={{
        background: 'var(--cream)',
        padding: '5rem 1.5rem',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <p className="label-caps" style={{ color: 'var(--rust)', opacity: 0.8, marginBottom: '1.5rem' }}>
            Our Story
          </p>
          <blockquote style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 'clamp(1.3rem, 3vw, 1.7rem)',
            fontStyle: 'italic',
            color: 'var(--green)',
            lineHeight: 1.5,
            margin: '0 0 1.75rem',
          }}>
            "Every loaf is fermented slowly, shaped by hand, and baked with intention."
          </blockquote>
          <p style={{
            fontFamily: 'DM Sans, sans-serif',
            color: 'var(--green-muted)',
            lineHeight: 1.8,
            fontSize: '1rem',
            margin: 0,
          }}>
            TheraDough started as a creative outlet during a rough season of life — and turned into something that feeds more than just hunger. Each week we bake a limited run of naturally leavened breads using long fermentation, local flour, and a whole lot of love. No shortcuts. No preservatives. Just bread the way it's meant to be.
          </p>
        </div>
      </section>

      {/* Follow Along */}
      <section style={{
        background: 'var(--card-bg)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        padding: '3.5rem 1.5rem',
        textAlign: 'center',
      }}>
        <p className="label-caps" style={{ color: 'var(--green)', opacity: 0.5, marginBottom: '1rem' }}>
          Follow Along
        </p>
        <a
          href="https://instagram.com/theradoughbreadco"
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontFamily: 'Playfair Display, serif',
            fontSize: '1.3rem',
            color: 'var(--rust)',
            fontStyle: 'italic',
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
            <circle cx="12" cy="12" r="4"/>
            <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
          </svg>
          @theradoughbreadco
        </a>
        <p style={{
          fontFamily: 'DM Sans, sans-serif',
          color: 'var(--green-muted)',
          marginTop: '0.75rem',
          fontSize: '0.9rem',
          opacity: 0.7,
        }}>
          Behind-the-scenes bakes, crumb shots, and drop announcements.
        </p>
      </section>

      <Footer />
    </div>
  );
}
