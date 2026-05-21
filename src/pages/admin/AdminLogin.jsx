import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) navigate('/admin');
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError('Invalid username or password.');
        setLoading(false);
        return;
      }
      localStorage.setItem('admin_token', data.token);
      navigate('/admin');
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--cream)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
    }}>
      <div style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        {/* Logo */}
        <img
          src="/logo.png"
          alt="TheraDough"
          style={{ height: '48px', marginBottom: '2rem', opacity: 0.85 }}
          onError={e => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'block';
          }}
        />
        <h1 style={{
          display: 'none',
          fontFamily: 'Playfair Display, serif',
          color: 'var(--green)',
          fontSize: '1.75rem',
          marginBottom: '2rem',
        }}>
          TheraDough
        </h1>

        <div className="card" style={{ padding: '2rem', textAlign: 'left' }}>
          <h2 style={{
            fontFamily: 'Playfair Display, serif',
            color: 'var(--green)',
            fontSize: '1.5rem',
            margin: '0 0 0.5rem',
          }}>
            Baker Sign In
          </h2>
          <p style={{
            fontFamily: 'DM Sans, sans-serif',
            color: 'var(--green-muted)',
            fontSize: '0.9rem',
            margin: '0 0 1.75rem',
          }}>
            Admin access only
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontFamily: 'DM Sans, sans-serif',
                  fontWeight: 600,
                  color: 'var(--green)',
                  fontSize: '0.875rem',
                  marginBottom: '0.4rem',
                }}>
                  Username
                </label>
                <input
                  className="input-field"
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="admin"
                  autoComplete="username"
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontFamily: 'DM Sans, sans-serif',
                  fontWeight: 600,
                  color: 'var(--green)',
                  fontSize: '0.875rem',
                  marginBottom: '0.4rem',
                }}>
                  Password
                </label>
                <input
                  className="input-field"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <p style={{
                  color: '#B91C1C',
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '0.875rem',
                  margin: 0,
                  padding: '0.75rem',
                  background: '#FEE2E2',
                  borderRadius: '6px',
                }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="btn-rust"
                disabled={loading}
                style={{ width: '100%', marginTop: '0.25rem' }}
              >
                {loading ? <><span className="spinner" /> Signing in...</> : 'Sign In'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
