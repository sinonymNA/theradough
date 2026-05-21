import { Router } from 'express';
import { pool } from '../db.js';
import { requireAdmin } from './admin.js';

const router = Router();

// GET /api/drops/current — published drop with menu items (public)
router.get('/current', async (req, res) => {
  try {
    const dropResult = await pool.query(
      `SELECT * FROM drops WHERE status = 'published' ORDER BY drop_date DESC LIMIT 1`
    );
    if (dropResult.rows.length === 0) {
      return res.json({ drop: null, menuItems: [] });
    }
    const drop = dropResult.rows[0];
    const itemsResult = await pool.query(
      `SELECT * FROM menu_items WHERE drop_id = $1 AND active = true ORDER BY created_at ASC`,
      [drop.id]
    );
    res.json({ drop, menuItems: itemsResult.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/drops — all drops (admin)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT d.*, COUNT(o.id)::int AS order_count
      FROM drops d
      LEFT JOIN orders o ON o.drop_id = d.id
      GROUP BY d.id
      ORDER BY d.drop_date DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/drops — create drop (admin)
router.post('/', requireAdmin, async (req, res) => {
  const { drop_date, drop_type, order_deadline, notes } = req.body;
  if (!drop_date || !drop_type || !order_deadline) {
    return res.status(400).json({ error: 'drop_date, drop_type, and order_deadline are required' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO drops (drop_date, drop_type, order_deadline, notes) VALUES ($1, $2, $3, $4) RETURNING *`,
      [drop_date, drop_type, order_deadline, notes || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/drops/:id — update drop (admin)
router.patch('/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { drop_date, drop_type, order_deadline, status, notes } = req.body;
  try {
    if (status === 'published') {
      await pool.query(
        `UPDATE drops SET status = 'closed' WHERE status = 'published' AND id != $1`,
        [id]
      );
    }
    const result = await pool.query(
      `UPDATE drops SET
        drop_date = COALESCE($1, drop_date),
        drop_type = COALESCE($2, drop_type),
        order_deadline = COALESCE($3, order_deadline),
        status = COALESCE($4, status),
        notes = COALESCE($5, notes)
       WHERE id = $6 RETURNING *`,
      [drop_date, drop_type, order_deadline, status, notes, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Drop not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/drops/:id — delete drop (admin)
router.delete('/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const orderCheck = await pool.query(
      `SELECT COUNT(*) FROM orders WHERE drop_id = $1`,
      [id]
    );
    if (parseInt(orderCheck.rows[0].count) > 0) {
      return res.status(400).json({ error: 'Cannot delete a drop that has orders' });
    }
    await pool.query(`DELETE FROM drops WHERE id = $1`, [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
