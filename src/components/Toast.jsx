import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        maxWidth: '360px',
        width: 'calc(100% - 3rem)',
      }}>
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="fade-up"
            style={{
              padding: '0.875rem 1.25rem',
              borderRadius: '10px',
              color: 'white',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '0.9rem',
              fontWeight: 500,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              background: toast.type === 'error'
                ? '#B91C1C'
                : toast.type === 'warning'
                ? '#92400E'
                : 'var(--rust)',
            }}
            onClick={() => removeToast(toast.id)}
          >
            <span>{toast.message}</span>
            <span style={{ opacity: 0.7, fontSize: '1.1rem', lineHeight: 1, flexShrink: 0 }}>×</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
