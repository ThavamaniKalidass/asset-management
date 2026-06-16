import bcrypt from 'bcryptjs';
import { query } from './db.js';
async function seed() {
    console.log('Seeding database...');
    // Seed admin user
    const passwordHash = await bcrypt.hash('admin123', 10);
    await query(`INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO NOTHING`, ['admin@company.com', passwordHash, 'Admin User', 'admin']);
    // Seed demo assets
    const sampleAssets = [
        { asset_type: 'Desk', brand: 'Herman Miller', model_number: 'Aeron-XL', serial_number: 'SN-2024-001', desk_number: 'D-101' },
        { asset_type: 'Monitor', brand: 'Dell', model_number: 'U2723QE', serial_number: 'SN-2024-002', desk_number: 'D-101' },
        { asset_type: 'CPU', brand: 'HP', model_number: 'EliteBook 860', serial_number: 'SN-2024-003', desk_number: 'D-101' },
        { asset_type: 'Keyboard', brand: 'Logitech', model_number: 'MX Keys', serial_number: 'SN-2024-004', desk_number: 'D-101' },
        { asset_type: 'Mouse', brand: 'Logitech', model_number: 'MX Master 3S', serial_number: 'SN-2024-005', desk_number: 'D-101' },
        { asset_type: 'Desk', brand: 'Steelcase', model_number: 'Gesture Series', serial_number: 'SN-2024-006', desk_number: 'D-102' },
        { asset_type: 'Monitor', brand: 'LG', model_number: '32UN880-B', serial_number: 'SN-2024-007', desk_number: 'D-102' },
        { asset_type: 'CPU', brand: 'Dell', model_number: 'OptiPlex 7090', serial_number: 'SN-2024-008', desk_number: 'D-102' },
        { asset_type: 'Speaker', brand: 'Bose', model_number: 'Companion 2', serial_number: 'SN-2024-009', desk_number: 'D-102' },
        { asset_type: 'IP Phone', brand: 'Cisco', model_number: '8841', serial_number: 'SN-2024-010', desk_number: 'D-102' },
        { asset_type: 'Desk', brand: 'IKEA', model_number: 'Bekant', serial_number: 'SN-2024-011', desk_number: 'D-103' },
        { asset_type: 'Monitor', brand: 'Samsung', model_number: 'ViewFinity S9', serial_number: 'SN-2024-012', desk_number: 'D-103' },
        { asset_type: 'Thin Client', brand: 'HP', model_number: 't640', serial_number: 'SN-2024-013', desk_number: 'D-103' },
        { asset_type: 'Desk', brand: 'Herman Miller', model_number: 'Aeron Remastered', serial_number: 'SN-2024-014', desk_number: 'D-104' },
        { asset_type: 'Monitor', brand: 'Apple', model_number: 'Studio Display', serial_number: 'SN-2024-015', desk_number: 'D-104' },
        { asset_type: 'CPU', brand: 'Apple', model_number: 'Mac Studio M2', serial_number: 'SN-2024-016', desk_number: 'D-104' },
        { asset_type: 'Desk', brand: 'IKEA', model_number: 'Trotten', serial_number: 'SN-2024-017', desk_number: 'D-105' },
        { asset_type: 'Monitor', brand: 'ASUS', model_number: 'ProArt PA32UCG', serial_number: 'SN-2024-018', desk_number: 'D-105' },
        { asset_type: 'Thin Client', brand: 'Dell', model_number: 'Wyse 5070', serial_number: 'SN-2024-019', desk_number: 'D-105' },
        { asset_type: 'Desk', brand: 'Steelcase', model_number: 'Leap V2', serial_number: 'SN-2024-020', desk_number: 'D-106' },
        { asset_type: 'Monitor', brand: 'Dell', model_number: 'U3423WE', serial_number: 'SN-2024-021', desk_number: 'D-106' },
        { asset_type: 'CPU', brand: 'HP', model_number: 'Z2 Mini G9', serial_number: 'SN-2024-022', desk_number: 'D-106' },
        { asset_type: 'Speaker', brand: 'Audioengine', model_number: 'A2+', serial_number: 'SN-2024-023', desk_number: 'D-106' },
        { asset_type: 'Desk', brand: 'IKEA', model_number: 'Mittzon', serial_number: 'SN-2024-024', desk_number: 'D-107' },
        { asset_type: 'Monitor', brand: 'BenQ', model_number: 'PD3205U', serial_number: 'SN-2024-025', desk_number: 'D-107' },
        { asset_type: 'Thin Client', brand: 'Lenovo', model_number: 'ThinkCentre M75q', serial_number: 'SN-2024-026', desk_number: 'D-107' },
        { asset_type: 'RJ Headset', brand: 'Jabra', model_number: 'Evolve2 85', serial_number: 'SN-2024-027', desk_number: 'D-107' },
    ];
    for (const asset of sampleAssets) {
        await query(`INSERT INTO assets (asset_type, brand, model_number, serial_number, desk_number) 
       VALUES ($1, $2, $3, $4, $5) 
       ON CONFLICT DO NOTHING`, [asset.asset_type, asset.brand, asset.model_number, asset.serial_number, asset.desk_number]);
    }
    console.log('Seeding completed successfully.');
    process.exit(0);
}
seed().catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map