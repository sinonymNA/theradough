import { Router } from 'express';
import { pool } from '../db.js';
import { requireAdmin } from './admin.js';

const router = Router();

// GET /api/menu/:dropId — menu items for a drop (public)
router.get('/:dropId', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM menu_items WHERE drop_id = $1 ORDER BY created_at ASC`,
      [req.params.dropId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/menu — create menu item (admin)
router.post('/', requireAdmin, async (req, res) => {
  const { drop_id, name, description, price_cents, quantity_available, image_url, allergens } = req.body;
  if (!drop_id || !name || !price_cents || !quantity_available) {
    return res.status(400).json({ error: 'drop_id, name, price_cents, and quantity_available are required' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO menu_items (drop_id, name, description, price_cents, quantity_available, image_url, allergens)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [drop_id, name, description || null, price_cents, quantity_available, image_url || null, allergens || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/menu/:id — update menu item (admin)
router.patch('/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, description, price_cents, quantity_available, image_url, allergens, active } = req.body;
  try {
    const result = await pool.query(
      `UPDATE menu_items SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        price_cents = COALESCE($3, price_cents),
        quantity_available = COALESCE($4, quantity_available),
        image_url = COALESCE($5, image_url),
        allergens = COALESCE($6, allergens),
        active = COALESCE($7, active)
       WHERE id = $8 RETURNING *`,
      [name, description, price_cents, quantity_available, image_url, allergens, active, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Menu item not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/menu/:id — delete menu item (admin)
router.delete('/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(`DELETE FROM menu_items WHERE id = $1`, [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
