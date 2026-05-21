import { useEffect, useState } from 'react';
import OrderStatusBadge from '../../components/OrderStatusBadge.jsx';
import ConfirmModal from '../../components/ConfirmModal.jsx';
import { useToast } from '../../components/Toast.jsx';
import { formatDate } from '../../lib/utils.js';

const EMPTY_FORM = { drop_date: '', drop_type: 'sunday', order_deadline: '', notes: '' };

export default function DropManager() {
  const [drops, setDrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { addToast } = useToast();
  const token = localStorage.getItem('admin_token');

  async function load() {
    const res = await fetch('/api/drops', { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setDrops(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSave() {
    if (!form.drop_date || !form.drop_type || !form.order_deadline) {
      addToast('Please fill all required fields.', 'error');
      return;
    }
    setSaving(true);
    try {
      const method = editId ? 'PATCH' : 'POST';
      const url = editId ? `/api/drops/${editId}` : '/api/drops';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json();
        addToast(d.error || 'Error saving drop', 'error');
        setSaving(false);
        return;
      }
      addToast(editId ? 'Drop updated.' : 'Drop created.', 'success');
      setForm(EMPTY_FORM);
      setShowForm(false);
      setEditId(null);
      await load();
    } catch {
      addToast('Network error.', 'error');
    }
    setSaving(false);
  }

  async function handleStatusChange(drop, newStatus) {
    const res = await fetch(`/api/drops/${drop.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      addToast(`Drop ${newStatus}.`, 'success');
      await load();
    } else {
      const d = await res.json();
      addToast(d.error || 'Error updating drop', 'error');
    }
  }

  async function handleDelete(drop) {
    const res = await fetch(`/api/drops/${drop.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      addToast('Drop deleted.', 'success');
      setDeleteTarget(null);
      await load();
    } else {
      const d = await res.json();
      addToast(d.error || 'Error deleting drop', 'error');
      setDeleteTarget(null);
    }
  }

  function startEdit(drop) {
    setEditId(drop.id);
    setForm({
      drop_date: drop.drop_date?.split('T')[0] || '',
      drop_type: drop.drop_type,
      order_deadline: drop.order_deadline?.slice(0, 16) || '',
      notes: drop.notes || '',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--green)', margin: 0, fontSize: '1.75rem' }}>
          Drop Manager
        </h1>
        <button
          className="btn-rust"
          onClick={() => {
            setShowForm(!showForm);
            setEditId(null);
            setForm(EMPTY_FORM);
          }}
        >
          {showForm ? 'Cancel' : '+ New Drop'}
        </button>
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--green)', margin: '0 0 1.5rem', fontSize: '1.2rem' }}>
            {editId ? 'Edit Drop' : 'Create New Drop'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '0.875rem', color: 'var(--green)', marginBottom: '0.4rem' }}>
                Drop Date *
              </label>
              <input
                type="date"
                className="input-field"
                value={form.drop_date}
                onChange={e => setForm(f => ({ ...f, drop_date: e.target.value }))}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '0.875rem', color: 'var(--green)', marginBottom: '0.4rem' }}>
                Drop Type *
              </label>
              <div style={{ display: 'flex', gap: '1rem', paddingTop: '0.5rem' }}>
                {['sunday', 'wednesday'].map(type => (
                  <label key={type} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    fontFamily: 'DM Sans, sans-serif',
                    color: 'var(--green)',
                    fontSize: '0.9rem',
                    textTransform: 'capitalize',
                  }}>
                    <input
                      type="radio"
                      name="drop_type"
                      value={type}
                      checked={form.drop_type === type}
                      onChange={() => setForm(f => ({ ...f, drop_type: type }))}
                      style={{ accentColor: 'var(--rust)' }}
                    />
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '0.875rem', color: 'var(--green)', marginBottom: '0.4rem' }}>
                Order Deadline *
              </label>
              <input
                type="datetime-local"
                className="input-field"
                value={form.order_deadline}
                onChange={e => setForm(f => ({ ...f, order_deadline: e.target.value }))}
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '0.875rem', color: 'var(--green)', marginBottom: '0.4rem' }}>
                Notes (optional)
              </label>
              <textarea
                className="input-field"
                rows={2}
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Internal notes about this drop..."
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
            <button className="btn-outline" onClick={() => { setShowForm(false); setEditId(null); setForm(EMPTY_FORM); }}>
              Cancel
            </button>
            <button className="btn-rust" onClick={handleSave} disabled={saving}>
              {saving ? <><span className="spinner" /> Saving...</> : editId ? 'Update Drop' : 'Create Drop'}
            </button>
          </div>
        </div>
      )}

      {/* Drops list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="spinner-dark" style={{ width: '2rem', height: '2rem' }} />
        </div>
      ) : drops.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <p style={{ fontFamily: 'DM Sans, sans-serif', color: 'var(--green-muted)' }}>
            No drops yet. Create your first drop to get started.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {drops.map(drop => (
            <div key={drop.id} className="card" style={{ padding: '1.25rem 1.5rem' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '1rem',
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                    <span style={{
                      fontFamily: 'Playfair Display, serif',
                      fontWeight: 600,
                      color: 'var(--green)',
                      fontSize: '1.05rem',
                    }}>
                      {drop.drop_type === 'sunday' ? 'Sunday' : 'Wednesday'} — {formatDate(drop.drop_date)}
                    </span>
                    <OrderStatusBadge status={drop.status} />
                  </div>
                  <div style={{
                    display: 'flex',
                    gap: '1.5rem',
                    flexWrap: 'wrap',
                  }}>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', color: 'var(--green-muted)' }}>
                      {drop.order_count} order{drop.order_count !== 1 ? 's' : ''}
                    </span>
                    {drop.notes && (
                      <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', color: 'var(--green-muted)', fontStyle: 'italic' }}>
                        {drop.notes}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  {drop.status === 'draft' && (
                    <button
                      className="btn-rust"
                      style={{ fontSize: '0.8rem', padding: '0.45rem 0.875rem' }}
                      onClick={() => handleStatusChange(drop, 'published')}
                    >
                      Publish
                    </button>
                  )}
                  {drop.status === 'published' && (
                    <button
                      style={{
                        fontSize: '0.8rem',
                        padding: '0.45rem 0.875rem',
                        background: '#92400E',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontFamily: 'DM Sans, sans-serif',
                        fontWeight: 600,
                        transition: 'background 0.2s ease',
                      }}
                      onClick={() => handleStatusChange(drop, 'closed')}
                    >
                      Close
                    </button>
                  )}
                  <button
                    className="btn-outline"
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
                    onClick={() => startEdit(drop)}
                  >
                    Edit
                  </button>
                  {drop.order_count === 0 && (
                    <button
                      style={{
                        fontSize: '0.8rem',
                        padding: '0.4rem 0.75rem',
                        background: 'transparent',
                        border: '1.5px solid #FCA5A5',
                        color: '#B91C1C',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontFamily: 'DM Sans, sans-serif',
                        fontWeight: 500,
                        transition: 'all 0.2s ease',
                      }}
                      onClick={() => setDeleteTarget(drop)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Delete Drop"
          message={`Are you sure you want to delete the ${deleteTarget.drop_type} drop on ${formatDate(deleteTarget.drop_date)}? This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
