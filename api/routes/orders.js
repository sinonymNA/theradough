import { Router } from 'express';
import { pool } from '../db.js';
import { requireAdmin } from './admin.js';

const router = Router();

// POST /api/orders — place an order (public)
router.post('/', async (req, res) => {
  const { customer_name, customer_phone, drop_id, items } = req.body;

  if (!customer_name || !customer_phone || !drop_id || !items?.length) {
    return res.status(400).json({ error: 'customer_name, customer_phone, drop_id, and items are required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Verify drop is still published and accepting orders
    const dropResult = await client.query(
      `SELECT * FROM drops WHERE id = $1 AND status = 'published'`,
      [drop_id]
    );
    if (dropResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'This drop is not available for ordering' });
    }
    const drop = dropResult.rows[0];
    if (new Date() > new Date(drop.order_deadline)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Order deadline has passed for this drop' });
    }

    // Validate each item, check availability, lock rows for update
    let totalCents = 0;
    const validatedItems = [];
    for (const item of items) {
      const itemResult = await client.query(
        `SELECT * FROM menu_items WHERE id = $1 AND drop_id = $2 AND active = true FOR UPDATE`,
        [item.menu_item_id, drop_id]
      );
      if (itemResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: `Menu item ${item.menu_item_id} not found or unavailable` });
      }
      const menuItem = itemResult.rows[0];
      const remaining = menuItem.quantity_available - menuItem.quantity_ordered;
      if (item.quantity > remaining) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          error: `Not enough "${menuItem.name}" available. Only ${remaining} left.`,
        });
      }
      totalCents += menuItem.price_cents * item.quantity;
      validatedItems.push({ ...item, price_cents: menuItem.price_cents, name: menuItem.name });
    }

    // Insert order record
    const orderResult = await client.query(
      `INSERT INTO orders (customer_name, customer_phone, drop_id, total_cents)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [customer_name, customer_phone, drop_id, totalCents]
    );
    const order = orderResult.rows[0];

    // Insert order line items and decrement quantity_ordered on each menu item
    for (const item of validatedItems) {
      await client.query(
        `INSERT INTO order_items (order_id, menu_item_id, menu_item_name, quantity, price_cents)
         VALUES ($1, $2, $3, $4, $5)`,
        [order.id, item.menu_item_id, item.name, item.quantity, item.price_cents]
      );
      await client.query(
        `UPDATE menu_items SET quantity_ordered = quantity_ordered + $1 WHERE id = $2`,
        [item.quantity, item.menu_item_id]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ order });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// GET /api/orders/:id — single order for confirmation page (public)
router.get('/:id', async (req, res) => {
  try {
    const orderResult = await pool.query(`SELECT * FROM orders WHERE id = $1`, [req.params.id]);
    if (orderResult.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    const order = orderResult.rows[0];

    const itemsResult = await pool.query(
      `SELECT * FROM order_items WHERE order_id = $1`,
      [order.id]
    );
    const dropResult = await pool.query(`SELECT * FROM drops WHERE id = $1`, [order.drop_id]);

    res.json({ order, items: itemsResult.rows, drop: dropResult.rows[0] || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders — all orders (admin-only)
router.get('/', requireAdmin, async (req, res) => {
  const { drop_id, status } = req.query;
  try {
    let query = `
      SELECT o.*,
        json_agg(json_build_object(
          'id', oi.id,
          'menu_item_id', oi.menu_item_id,
          'menu_item_name', oi.menu_item_name,
          'quantity', oi.quantity,
          'price_cents', oi.price_cents
        ) ORDER BY oi.id) AS items
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      WHERE 1=1
    `;
    const params = [];
    if (drop_id) {
      params.push(drop_id);
      query += ` AND o.drop_id = $${params.length}`;
    }
    if (status && status !== 'all') {
      params.push(status);
      query += ` AND o.status = $${params.length}`;
    }
    query += ` GROUP BY o.id ORDER BY o.created_at DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/orders/:id — update status / pickup time (admin-only)
router.patch('/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { status, pickup_time, pickup_notes } = req.body;
  try {
    const result = await pool.query(
      `UPDATE orders SET
        status = COALESCE($1, status),
        pickup_time = COALESCE($2, pickup_time),
        pickup_notes = COALESCE($3, pickup_notes)
       WHERE id = $4 RETURNING *`,
      [status, pickup_time, pickup_notes, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
