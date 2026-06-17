import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import QRCode from 'qrcode';
import { query } from '../config/db.js';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth.js';

const router = Router();

// All asset routes require authentication
router.use(authenticateToken);

// GET /api/assets
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { serial_number, model_number, brand, desk_number, asset_type, page, limit } = req.query;

    let sql = 'SELECT id, asset_type, brand, model_number, serial_number, desk_number, created_at, updated_at FROM assets WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (serial_number) {
      sql += ` AND LOWER(serial_number) LIKE LOWER($${paramIndex})`;
      params.push(`%${serial_number}%`);
      paramIndex++;
    }
    if (model_number) {
      sql += ` AND LOWER(model_number) LIKE LOWER($${paramIndex})`;
      params.push(`%${model_number}%`);
      paramIndex++;
    }
    if (brand) {
      sql += ` AND LOWER(brand) LIKE LOWER($${paramIndex})`;
      params.push(`%${brand}%`);
      paramIndex++;
    }
    if (desk_number) {
      sql += ` AND LOWER(desk_number) LIKE LOWER($${paramIndex})`;
      params.push(`%${desk_number}%`);
      paramIndex++;
    }
    if (asset_type) {
      sql += ` AND asset_type = $${paramIndex}`;
      params.push(asset_type);
      paramIndex++;
    }

    // Count total before pagination
    const countResult = await query(`SELECT COUNT(*) as total FROM (${sql}) as filtered`, params);

    // Pagination
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 50));
    const offset = (pageNum - 1) * limitNum;
    sql += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limitNum, offset);

    const result = await query(sql, params);

    res.json({
      assets: result.rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: parseInt(countResult.rows[0].total),
        totalPages: Math.ceil(parseInt(countResult.rows[0].total) / limitNum),
      },
    });
  } catch (err: any) {
    console.error('Get assets error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/assets/stats
router.get('/stats', async (_req: AuthRequest, res: Response) => {
  try {
    const result = await query(`
      SELECT 
        COALESCE(SUM(CASE WHEN asset_type = 'Desk' THEN 1 ELSE 0 END), 0) as total_desks,
        COALESCE(SUM(CASE WHEN asset_type = 'Monitor' THEN 1 ELSE 0 END), 0) as total_monitors,
        COALESCE(SUM(CASE WHEN asset_type = 'CPU' THEN 1 ELSE 0 END), 0) as total_cpus,
        COALESCE(SUM(CASE WHEN asset_type = 'Thin Client' THEN 1 ELSE 0 END), 0) as total_thin_clients,
        COALESCE(SUM(CASE WHEN asset_type = 'Speaker' THEN 1 ELSE 0 END), 0) as total_speakers,
        COALESCE(SUM(CASE WHEN asset_type = 'Keyboard' THEN 1 ELSE 0 END), 0) as total_keyboards,
        COALESCE(SUM(CASE WHEN asset_type = 'Mouse' THEN 1 ELSE 0 END), 0) as total_mice,
        COALESCE(SUM(CASE WHEN asset_type = 'IP Phone' THEN 1 ELSE 0 END), 0) as total_ip_phones,
        COALESCE(SUM(CASE WHEN asset_type = 'RJ Headset' THEN 1 ELSE 0 END), 0) as total_rj_headsets
      FROM assets
    `);
    res.json(result.rows[0]);
  } catch (err: any) {
    console.error('Get stats error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/assets/desks
router.get('/desks', async (_req: AuthRequest, res: Response) => {
  try {
    const result = await query('SELECT DISTINCT desk_number FROM assets ORDER BY desk_number');
    res.json(result.rows.map((r: any) => r.desk_number));
  } catch (err: any) {
    console.error('Get desks error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/assets/desk/:deskNumber
router.get('/desk/:deskNumber', async (req: AuthRequest, res: Response) => {
  try {
    const { deskNumber } = req.params;
    const result = await query(
      'SELECT id, asset_type, brand, model_number, serial_number, desk_number, created_at, updated_at FROM assets WHERE LOWER(desk_number) = LOWER($1) ORDER BY asset_type',
      [deskNumber]
    );
    res.json({
      desk_number: deskNumber,
      assets: result.rows,
    });
  } catch (err: any) {
    console.error('Get desk assets error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/assets/recent
router.get('/recent', async (req: AuthRequest, res: Response) => {
  try {
    const limit = Math.min(50, parseInt(req.query.limit as string) || 5);
    const result = await query(
      'SELECT id, asset_type, brand, model_number, serial_number, desk_number, created_at FROM assets ORDER BY created_at DESC LIMIT $1',
      [limit]
    );
    res.json(result.rows);
  } catch (err: any) {
    console.error('Get recent assets error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/assets/:id
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      'SELECT id, asset_type, brand, model_number, serial_number, desk_number, created_at, updated_at FROM assets WHERE id = $1',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Asset not found.' });
    }
    res.json(result.rows[0]);
  } catch (err: any) {
    console.error('Get asset error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/assets (admin only)
router.post('/', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { asset_type, brand, model_number, serial_number, desk_number } = req.body;

    if (!asset_type || !brand || !model_number || !serial_number || !desk_number) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const result = await query(
      `INSERT INTO assets (asset_type, brand, model_number, serial_number, desk_number)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, asset_type, brand, model_number, serial_number, desk_number, created_at, updated_at`,
      [asset_type, brand, model_number, serial_number, desk_number]
    );

    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    console.error('Create asset error:', err);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Serial number already exists.' });
    }
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/assets/bulk (admin only)
router.post('/bulk', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { assets } = req.body;
    if (!Array.isArray(assets) || assets.length === 0) {
      return res.status(400).json({ error: 'Assets array is required.' });
    }

    const created: any[] = [];
    for (const asset of assets) {
      const { asset_type, brand, model_number, serial_number, desk_number } = asset;
      if (!asset_type || !brand || !model_number || !serial_number || !desk_number) continue;

      try {
        const result = await query(
          `INSERT INTO assets (asset_type, brand, model_number, serial_number, desk_number)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id, asset_type, brand, model_number, serial_number, desk_number`,
          [asset_type, brand, model_number, serial_number, desk_number]
        );
        created.push(result.rows[0]);
      } catch {
        // Skip duplicates
      }
    }

    res.status(201).json({ imported: created.length, assets: created });
  } catch (err: any) {
    console.error('Bulk import error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// PUT /api/assets/:id (admin only)
router.put('/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { asset_type, brand, model_number, serial_number, desk_number } = req.body;

    if (!asset_type || !brand || !model_number || !serial_number || !desk_number) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const result = await query(
      `UPDATE assets 
       SET asset_type = $1, brand = $2, model_number = $3, serial_number = $4, desk_number = $5, updated_at = NOW()
       WHERE id = $6
       RETURNING id, asset_type, brand, model_number, serial_number, desk_number, created_at, updated_at`,
      [asset_type, brand, model_number, serial_number, desk_number, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Asset not found.' });
    }

    res.json(result.rows[0]);
  } catch (err: any) {
    console.error('Update asset error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE /api/assets/:id (admin only)
router.delete('/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const result = await query('DELETE FROM assets WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Asset not found.' });
    }
    res.json({ message: 'Asset deleted successfully.' });
  } catch (err: any) {
    console.error('Delete asset error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/assets/qr/:deskNumber - Generate QR code for a desk
router.get('/qr/:deskNumber', async (req: AuthRequest, res: Response) => {
  try {
    const { deskNumber } = req.params;
const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
const qrData = `${baseUrl}/desk/${deskNumber}`;
    
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
  width: 500,
  margin: 8,
  color: {
    dark: '#000000',
    light: '#FFFFFF',
  },
});

    // Get assets for this desk
    const assetsResult = await query(
      'SELECT id, asset_type, brand, model_number, serial_number, desk_number FROM assets WHERE LOWER(desk_number) = LOWER($1) ORDER BY asset_type',
      [deskNumber]
    );

    res.json({
      desk_number: deskNumber,
      qr_data_url: qrCodeDataUrl,
      qr_content: qrData,
      assets: assetsResult.rows,
      asset_count: assetsResult.rows.length,
    });
  } catch (err: any) {
    console.error('Generate QR error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
