import { useEffect, useState } from 'react';
import ConfirmModal from '../../components/ConfirmModal.jsx';
import { useToast } from '../../components/Toast.jsx';
import { formatPrice } from '../../lib/utils.js';

const EMPTY_FORM = {
  name: '', description: '', price: '', quantity_available: '', allergens: '', image_url: '',
};

export default function MenuBuilder() {
  const [drops, setDrops] = useState([]);
  const [selectedDropId, setSelectedDropId] = useState('');
  const [menuItems, setMenuItems] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const { addToast } = useToast();
  const token = localStorage.getItem('admin_token');

  async function loadDrops() {
    const res = await fetch('/api/drops', { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (Array.isArray(data)) {
      setDrops(data);
      if (!selectedDropId && data.length > 0) {
        const pub = data.find(d => d.status === 'published') || data[0];
        setSelectedDropId(String(pub.id));
      }
    }
  }

  async function loadMenu(dropId) {
    if (!dropId) return;
    const res = await fetch(`/api/menu/${dropId}`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setMenuItems(Array.isArray(data) ? data : []);
  }

  useEffect(() => { loadDrops(); }, []);
  useEffect(() => { if (selectedDropId) loadMenu(selectedDropId); }, [selectedDropId]);

  async function handleSave() {
    if (!form.name || !form.price || !form.quantity_available) {
      addToast('Name, price, and quantity are required.', 'error');
      return;
    }
    const priceCents = Math.round(parseFloat(form.price) * 100);
    if (isNaN(priceCents) || priceCents <= 0) {
      addToast('Please enter a valid price.', 'error');
      return;
    }
    setSaving(true);
    try {
      const body = {
        drop_id: parseInt(selectedDropId),
        name: form.name,
        description: form.description || null,
        price_cents: priceCents,
        quantity_available: parseInt(form.quantity_available),
        allergens: form.allergens || null,
        image_url: form.image_url || null,
      };
      const method = editId ? 'PATCH' : 'POST';
      const url = editId ? `/api/menu/${editId}` : '/api/menu';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json();
        addToast(d.error || 'Error saving item', 'error');
        setSaving(false);
        return;
      }
      addToast(editId ? 'Item updated.' : 'Item added.', 'success');
      setForm(EMPTY_FORM);
      setEditId(null);
      await loadMenu(selectedDropId);
    } catch {
      addToast('Network error.', 'error');
    }
    setSaving(false);
  }

  async function toggleActive(item) {
    const res = await fetch(`/api/menu/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ active: !item.active }),
    });
    if (res.ok) {
      await loadMenu(selectedDropId);
    } else {
      addToast('Error updating item', 'error');
    }
  }

  async function handleDelete(item) {
    const res = await fetch(`/api/menu/${item.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      addToast('Item deleted.', 'success');
      setDeleteTarget(null);
      await loadMenu(selectedDropId);
    } else {
      const d = await res.json();
      addToast(d.error || 'Error deleting item', 'error');
      setDeleteTarget(null);
    }
  }

  async function handlePublish() {
    setPublishing(true);
    const res = await fetch(`/api/drops/${selectedDropId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: 'published' }),
    });
    if (res.ok) {
      addToast('Drop published!', 'success');
      await loadDrops();
    } else {
      const d = await res.json();
      addToast(d.error || 'Error publishing drop', 'error');
    }
    setPublishing(false);
  }

  function startEdit(item) {
    setEditId(item.id);
    setForm({
      name: item.name,
      description: item.description || '',
      price: (item.price_cents / 100).toFixed(2),
      quantity_available: String(item.quantity_available),
      allergens: item.allergens || '',
      image_url: item.image_url || '',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const selectedDrop = drops.find(d => String(d.id) === selectedDropId);
  const totalRevenue = menuItems.reduce((s, i) => s + i.price_cents * i.quantity_available, 0);

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
          Menu Builder
        </h1>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Drop selector */}
          <select
            value={selectedDropId}
            onChange={e => setSelectedDropId(e.target.value)}
            className="input-field"
            style={{ width: 'auto', padding: '0.5rem 0.75rem' }}
          >
            {drops.map(d => (
              <option key={d.id} value={String(d.id)}>
                {d.drop_type === 'sunday' ? 'Sunday' : 'Wednesday'} — {d.drop_date?.split('T')[0]} ({d.status})
              </option>
            ))}
          </select>

          {selectedDrop && selectedDrop.status === 'draft' && (
            <button className="btn-rust" onClick={handlePublish} disabled={publishing}>
              {publishing ? <><span className="spinner" /> Publishing...</> : 'Publish Drop'}
            </button>
          )}
        </div>
      </div>

      {/* Summary bar */}
      {menuItems.length > 0 && (
        <div style={{
          display: 'flex',
          gap: '2rem',
          padding: '0.875rem 1.25rem',
          background: 'var(--card-bg)',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          border: '1px solid var(--border)',
          flexWrap: 'wrap',
        }}>
          <div>
            <span className="label-caps" style={{ color: 'var(--green)', opacity: 0.5, display: 'block', marginBottom: '0.2rem' }}>Items</span>
            <span style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, color: 'var(--green)' }}>{menuItems.length}</span>
          </div>
          <div>
            <span className="label-caps" style={{ color: 'var(--green)', opacity: 0.5, display: 'block', marginBottom: '0.2rem' }}>Est. Revenue</span>
            <span style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, color: 'var(--rust)' }}>{formatPrice(totalRevenue)}</span>
          </div>
        </div>
      )}

      {/* Add/Edit form */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: showForm ? '1.5rem' : 0,
        }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--green)', margin: 0, fontSize: '1.15rem' }}>
            {editId ? 'Edit Item' : 'Add Item'}
          </h2>
          <button
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--green-muted)', fontSize: '0.85rem', fontFamily: 'DM Sans, sans-serif' }}
            onClick={() => { setShowForm(!showForm); if (editId) { setEditId(null); setForm(EMPTY_FORM); } }}
          >
            {showForm ? '▲ Hide' : '▼ Show'}
          </button>
        </div>

        {showForm && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.25rem' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '0.875rem', color: 'var(--green)', marginBottom: '0.4rem' }}>Name *</label>
                <input className="input-field" type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Country Loaf" />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '0.875rem', color: 'var(--green)', marginBottom: '0.4rem' }}>Description</label>
                <textarea className="input-field" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Notes on flavor, fermentation, inclusions..." style={{ resize: 'vertical' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '0.875rem', color: 'var(--green)', marginBottom: '0.4rem' }}>Price *</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--green-muted)', fontFamily: 'DM Sans, sans-serif' }}>$</span>
                  <input className="input-field" type="number" step="0.01" min="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="12.00" style={{ paddingLeft: '1.75rem' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '0.875rem', color: 'var(--green)', marginBottom: '0.4rem' }}>Qty Available *</label>
                <input className="input-field" type="number" min="1" value={form.quantity_available} onChange={e => setForm(f => ({ ...f, quantity_available: e.target.value }))} placeholder="20" />
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '0.875rem', color: 'var(--green)', marginBottom: '0.4rem' }}>Allergens</label>
                <input className="input-field" type="text" value={form.allergens} onChange={e => setForm(f => ({ ...f, allergens: e.target.value }))} placeholder="Gluten, dairy" />
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '0.875rem', color: 'var(--green)', marginBottom: '0.4rem' }}>Image URL</label>
                <input className="input-field" type="url" value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="https://..." />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              {editId && (
                <button className="btn-outline" onClick={() => { setEditId(null); setForm(EMPTY_FORM); }}>Cancel</button>
              )}
              <button className="btn-rust" onClick={handleSave} disabled={saving}>
                {saving ? <><span className="spinner" /> Saving...</> : editId ? 'Update Item' : 'Add Item'}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Items list */}
      {menuItems.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <p style={{ fontFamily: 'DM Sans, sans-serif', color: 'var(--green-muted)' }}>
            No items yet. Add your first item above.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {menuItems.map(item => (
            <div key={item.id} className="card" style={{
              padding: '1.25rem',
              opacity: item.active ? 1 : 0.6,
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '1rem',
                flexWrap: 'wrap',
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, color: 'var(--green)', fontSize: '1rem' }}>
                      {item.name}
                    </span>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, color: 'var(--rust)', fontSize: '0.95rem' }}>
                      {formatPrice(item.price_cents)}
                    </span>
                    {!item.active && (
                      <span style={{
                        fontFamily: 'DM Sans, sans-serif',
                        fontSize: '0.7rem',
                        background: '#F3F4F6',
                        color: '#6B7280',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        fontWeight: 600,
                      }}>
                        INACTIVE
                      </span>
                    )}
                  </div>
                  <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', color: 'var(--green-muted)' }}>
                    {item.quantity_ordered}/{item.quantity_available} ordered
                    {item.allergens && ` · Contains: ${item.allergens}`}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <button
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.35rem 0.7rem',
                      background: item.active ? '#F3F4F6' : '#DCFCE7',
                      color: item.active ? '#6B7280' : '#166534',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontFamily: 'DM Sans, sans-serif',
                      fontWeight: 600,
                      transition: 'all 0.2s ease',
                    }}
                    onClick={() => toggleActive(item)}
                  >
                    {item.active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    className="btn-outline"
                    style={{ fontSize: '0.75rem', padding: '0.35rem 0.7rem' }}
                    onClick={() => startEdit(item)}
                  >
                    Edit
                  </button>
                  <button
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.35rem 0.7rem',
                      background: 'transparent',
                      border: '1.5px solid #FCA5A5',
                      color: '#B91C1C',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontFamily: 'DM Sans, sans-serif',
                      fontWeight: 500,
                      transition: 'all 0.2s ease',
                    }}
                    onClick={() => setDeleteTarget(item)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Delete Menu Item"
          message={`Are you sure you want to delete "${deleteTarget.name}"? This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
