import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import XLSX from 'xlsx';
import QRCode from 'qrcode';
import { query } from '../config/db.js';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024,
  },
});

const router = Router();
router.get('/desk/:deskNumber', async (req, res) => {
  try {
    const { deskNumber } = req.params;

    const result = await query(
      `SELECT *
       FROM assets
       WHERE desk_number = $1
       ORDER BY asset_type`,
      [deskNumber]
    );

    res.json({
      success: true,
      deskNumber,
      assets: result.rows
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch desk assets'
    });
  }
});

// All asset routes require authentication
router.use(authenticateToken);

const TEMPLATE_HEADERS = [
  'Asset Type',
  'Brand',
  'Model Number',
  'Serial Number',
  'Desk Number',
  'Status',
];

function normalizeRow(row: Record<string, any>) {
  const getValue = (keys: string[]) => {
    for (const key of keys) {
      if (Object.prototype.hasOwnProperty.call(row, key)) {
        const value = row[key];
        if (value !== null && value !== undefined) {
          return String(value).trim();
        }
      }
    }
    return '';
  };

  return {
    asset_type: getValue(['Asset Type', 'asset_type', 'asset type', 'type', 'Type']),
    brand: getValue(['Brand', 'brand']),
    model_number: getValue(['Model Number', 'model_number', 'model', 'Model']),
    serial_number: getValue(['Serial Number', 'serial_number', 'serial', 'Serial']),
    desk_number: getValue(['Desk Number', 'desk_number', 'desk', 'Desk']),
    status: getValue(['Status', 'status']),
  };
}

function formatFileName(prefix: string) {
  const date = new Date().toISOString().slice(0, 10);
  return `${prefix}_${date}.xlsx`;
}

// GET /api/assets/export
router.get('/export', requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      `SELECT asset_type, brand, model_number, serial_number, desk_number, status, created_at
       FROM assets
       ORDER BY created_at DESC`
    );

    const rows = result.rows.map((asset: any) => ({
      'Asset Type': asset.asset_type,
      Brand: asset.brand,
      'Model Number': asset.model_number,
      'Serial Number': asset.serial_number,
      'Desk Number': asset.desk_number,
      Status: asset.status || 'Active',
      'Created Date': asset.created_at ? new Date(asset.created_at).toISOString().slice(0, 10) : '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows, { header: TEMPLATE_HEADERS.concat(['Created Date']) });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Assets');
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    const filename = formatFileName('Asset_Report');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err: any) {
    console.error('Export assets error:', err);
    res.status(500).json({ error: 'Failed to generate export file.' });
  }
});

// GET /api/assets/template
router.get('/template', requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const worksheet = XLSX.utils.aoa_to_sheet([TEMPLATE_HEADERS]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    res.setHeader('Content-Disposition', 'attachment; filename="Asset_Import_Template.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err: any) {
    console.error('Download template error:', err);
    res.status(500).json({ error: 'Failed to generate template file.' });
  }
});

// POST /api/assets/import (admin only)
router.post('/import', requireAdmin, upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: 'Excel file is required.' });
    }

    const extension = path.extname(req.file.originalname).toLowerCase();
    if (!['.xlsx', '.xls'].includes(extension)) {
      return res.status(415).json({ error: 'Unsupported file type. Upload .xls or .xlsx files only.' });
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer', cellDates: true });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return res.status(400).json({ error: 'The Excel workbook does not contain any sheets.' });
    }

    const worksheet = workbook.Sheets[sheetName];
    const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });
    const totalRows = rawRows.length;
    console.log(`Import file received: ${req.file.originalname}, total rows: ${totalRows}`);

    const rows: Array<{
      asset_type: string;
      brand: string;
      model_number: string;
      serial_number: string;
      desk_number: string;
      status: string;
      rowIndex: number;
    }> = [];

    const errors: string[] = [];
    const duplicates: string[] = [];
    const seenSerials = new Set<string>();

    rawRows.forEach((rawRow, index) => {
      const rowNumber = index + 2;
      const normalized = normalizeRow(rawRow);
      const isEmpty =
        !normalized.asset_type &&
        !normalized.brand &&
        !normalized.model_number &&
        !normalized.serial_number &&
        !normalized.desk_number &&
        !normalized.status;

      if (isEmpty) {
        return;
      }

      const missingFields = [];
      if (!normalized.asset_type) missingFields.push('Asset Type');
      if (!normalized.serial_number) missingFields.push('Serial Number');
      if (!normalized.desk_number) missingFields.push('Desk Number');

      if (missingFields.length > 0) {
        errors.push(`Row ${rowNumber}: Missing ${missingFields.join(', ')}`);
        console.log(`Import error at row ${rowNumber}: missing ${missingFields.join(', ')}`, rawRow);
        return;
      }

      if (seenSerials.has(normalized.serial_number)) {
        duplicates.push(`Row ${rowNumber}: Duplicate serial number ${normalized.serial_number}`);
        return;
      }

      seenSerials.add(normalized.serial_number);
      rows.push({ ...normalized, status: normalized.status || 'Active', rowIndex: rowNumber });
    });

    if (rows.length === 0) {
      console.log('Import completed with no valid rows. Errors:', errors, 'Duplicates:', duplicates);
      return res.status(400).json({
        totalRows,
        imported: 0,
        processed: 0,
        skipped: errors.length + duplicates.length,
        errors,
        duplicates,
        message: 'No valid rows found in the uploaded file.',
      });
    }

    const serialNumbers = rows.map((row) => row.serial_number);
    const existingResult = await query(
      'SELECT serial_number FROM assets WHERE serial_number = ANY($1)',
      [serialNumbers]
    );

    const existingSerials = new Set(existingResult.rows.map((row: any) => row.serial_number));
    const insertRows = rows.filter((row) => {
      if (existingSerials.has(row.serial_number)) {
        duplicates.push(`Row ${row.rowIndex}: Serial number already exists (${row.serial_number})`);
        return false;
      }
      return true;
    });

    let insertedCount = 0;
    if (insertRows.length > 0) {
      const values = insertRows
        .map((_, index) =>
          `($${index * 6 + 1}, $${index * 6 + 2}, $${index * 6 + 3}, $${index * 6 + 4}, $${index * 6 + 5}, $${index * 6 + 6})`
        )
        .join(', ');
      const params = insertRows.flatMap((row) => [row.asset_type, row.brand, row.model_number, row.serial_number, row.desk_number, row.status]);

      const insertResult = await query(
        `INSERT INTO assets (asset_type, brand, model_number, serial_number, desk_number, status)
         VALUES ${values}
         ON CONFLICT (serial_number) DO NOTHING
         RETURNING id`,
        params
      );
      insertedCount = insertResult.rows.length;
      console.log(`Import inserted ${insertedCount} new assets.`);
    }

    console.log(`Import summary: totalRows=${totalRows}, processed=${rows.length}, skipped=${errors.length + duplicates.length}, duplicates=${duplicates.length}, errors=${errors.length}`);
    res.json({
      totalRows,
      imported: insertedCount,
      processed: rows.length,
      skipped: rows.length - insertRows.length + errors.length + duplicates.length,
      errors,
      duplicates,
    });
  } catch (err: any) {
    console.error('Import assets error:', err);
    res.status(500).json({ error: 'Failed to import assets from Excel.' });
  }
});

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
    const { asset_type, brand, model_number, serial_number, desk_number, status } = req.body;

    if (!asset_type || !brand || !model_number || !serial_number || !desk_number) {
      return res.status(400).json({ error: 'Asset Type, Brand, Model Number, Serial Number, and Desk Number are required.' });
    }

    const assetStatus = status && String(status).trim() ? String(status).trim() : 'Active';

    const result = await query(
      `INSERT INTO assets (asset_type, brand, model_number, serial_number, desk_number, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, asset_type, brand, model_number, serial_number, desk_number, status, created_at, updated_at`,
      [asset_type, brand, model_number, serial_number, desk_number, assetStatus]
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
      const { asset_type, brand, model_number, serial_number, desk_number, status } = asset;
      if (!asset_type || !brand || !model_number || !serial_number || !desk_number) continue;
      const assetStatus = status && String(status).trim() ? String(status).trim() : 'Active';

      try {
        const result = await query(
          `INSERT INTO assets (asset_type, brand, model_number, serial_number, desk_number, status)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING id, asset_type, brand, model_number, serial_number, desk_number, status`,
          [asset_type, brand, model_number, serial_number, desk_number, assetStatus]
        );
        created.push(result.rows[0]);
      } catch {
        // Skip duplicates or invalid rows
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
 console.log("PARAM ID:", req.params.id);
console.log("BODY:", req.body);
  console.log("USER:", req.user);

  try {
    console.log("BEFORE UPDATE");

    const { asset_type, brand, model_number, serial_number, desk_number, status } = req.body;

    if (!asset_type || !brand || !model_number || !serial_number || !desk_number) {
      return res.status(400).json({ error: 'Asset Type, Brand, Model Number, Serial Number, and Desk Number are required.' });
    }

    const assetStatus = status && String(status).trim() ? String(status).trim() : 'Active';

    const result = await query(
      `UPDATE assets 
       SET asset_type = $1, brand = $2, model_number = $3, serial_number = $4, desk_number = $5, status = $6, updated_at = NOW()
       WHERE id = $7
       RETURNING id, asset_type, brand, model_number, serial_number, desk_number, status, created_at, updated_at`,
      [asset_type, brand, model_number, serial_number, desk_number, assetStatus, req.params.id]
    );
console.log("RESULT:", result.rows);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Asset not found.' });
    }

    res.json(result.rows[0]);
  } catch (err: any) {
  console.error("UPDATE ERROR:", err);

  res.status(500).json({
    error: err.message,
    stack: err.stack
  });
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

    const baseUrl =
      req.get('origin') ||
      process.env.FRONTEND_URL ||
      'http://localhost:3000';

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
// GET /api/assets/desk/:deskNumber

export default router;
