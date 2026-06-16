import { query } from './db.js';
async function migrate() {
    console.log('Running database migrations...');
    // Ensure pgcrypto extension is available for gen_random_uuid()
    await query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);
    // Create users table
    await query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL DEFAULT '',
      role VARCHAR(20) NOT NULL DEFAULT 'viewer',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
    // Create assets table
    await query(`
    CREATE TABLE IF NOT EXISTS assets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      asset_type VARCHAR(100) NOT NULL,
      brand VARCHAR(255) NOT NULL,
      model_number VARCHAR(255) NOT NULL,
      serial_number VARCHAR(255) NOT NULL,
      desk_number VARCHAR(50) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
    // Create indexes
    await query(`CREATE INDEX IF NOT EXISTS idx_assets_serial_number ON assets(serial_number);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_assets_desk_number ON assets(desk_number);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_assets_asset_type ON assets(asset_type);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_assets_brand ON assets(brand);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`);
    console.log('Migrations completed successfully.');
    process.exit(0);
}
migrate().catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
});
//# sourceMappingURL=migrate.js.map