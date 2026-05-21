import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost/theradough',
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

export async function initDB() {
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not set — skipping DB init (set it for full functionality)');
    return;
  }

  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS drops (
        id SERIAL PRIMARY KEY,
        drop_date DATE NOT NULL,
        drop_type TEXT CHECK (drop_type IN ('sunday', 'wednesday')) NOT NULL,
        order_deadline TIMESTAMPTZ NOT NULL,
        status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed', 'completed')),
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id SERIAL PRIMARY KEY,
        drop_id INTEGER REFERENCES drops(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        description TEXT,
        price_cents INTEGER NOT NULL,
        quantity_available INTEGER NOT NULL,
        quantity_ordered INTEGER DEFAULT 0,
        image_url TEXT,
        allergens TEXT,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        customer_name TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        drop_id INTEGER REFERENCES drops(id),
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'ready', 'completed', 'cancelled')),
        total_cents INTEGER NOT NULL,
        pickup_time TEXT,
        pickup_notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        menu_item_id INTEGER REFERENCES menu_items(id),
        menu_item_name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        price_cents INTEGER NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    console.log('Database initialized');
  } finally {
    client.release();
  }
}
