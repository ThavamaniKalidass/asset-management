import type { Asset, AssetFormData, DashboardStats, DeskAssets } from '@/types';

// Simple ID generator for mock IDs
function generateId(): string {
  return 'id_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
}

// Initial mock assets
const initialAssets: Asset[] = [
  { id: generateId(), asset_type: 'Desk', brand: 'Herman Miller', model_number: 'Aeron-XL', serial_number: 'SN-2024-001', desk_number: 'D-101' },
  { id: generateId(), asset_type: 'Monitor', brand: 'Dell', model_number: 'U2723QE', serial_number: 'SN-2024-002', desk_number: 'D-101' },
  { id: generateId(), asset_type: 'CPU', brand: 'HP', model_number: 'EliteBook 860', serial_number: 'SN-2024-003', desk_number: 'D-101' },
  { id: generateId(), asset_type: 'Keyboard', brand: 'Logitech', model_number: 'MX Keys', serial_number: 'SN-2024-004', desk_number: 'D-101' },
  { id: generateId(), asset_type: 'Mouse', brand: 'Logitech', model_number: 'MX Master 3S', serial_number: 'SN-2024-005', desk_number: 'D-101' },

  { id: generateId(), asset_type: 'Desk', brand: 'Steelcase', model_number: 'Gesture Series', serial_number: 'SN-2024-006', desk_number: 'D-102' },
  { id: generateId(), asset_type: 'Monitor', brand: 'LG', model_number: '32UN880-B', serial_number: 'SN-2024-007', desk_number: 'D-102' },
  { id: generateId(), asset_type: 'CPU', brand: 'Dell', model_number: 'OptiPlex 7090', serial_number: 'SN-2024-008', desk_number: 'D-102' },
  { id: generateId(), asset_type: 'Speaker', brand: 'Bose', model_number: 'Companion 2', serial_number: 'SN-2024-009', desk_number: 'D-102' },
  { id: generateId(), asset_type: 'IP Phone', brand: 'Cisco', model_number: '8841', serial_number: 'SN-2024-010', desk_number: 'D-102' },

  { id: generateId(), asset_type: 'Desk', brand: 'IKEA', model_number: 'Bekant', serial_number: 'SN-2024-011', desk_number: 'D-103' },
  { id: generateId(), asset_type: 'Monitor', brand: 'Samsung', model_number: 'ViewFinity S9', serial_number: 'SN-2024-012', desk_number: 'D-103' },
  { id: generateId(), asset_type: 'Thin Client', brand: 'HP', model_number: 't640', serial_number: 'SN-2024-013', desk_number: 'D-103' },
  { id: generateId(), asset_type: 'Keyboard', brand: 'Microsoft', model_number: 'Sculpt Ergonomic', serial_number: 'SN-2024-014', desk_number: 'D-103' },
  { id: generateId(), asset_type: 'Mouse', brand: 'Microsoft', model_number: 'Sculpt Ergonomic', serial_number: 'SN-2024-015', desk_number: 'D-103' },

  { id: generateId(), asset_type: 'Desk', brand: 'Steelcase', model_number: 'Series 2', serial_number: 'SN-2024-016', desk_number: 'D-104' },
  { id: generateId(), asset_type: 'Monitor', brand: 'Dell', model_number: 'P2723QE', serial_number: 'SN-2024-017', desk_number: 'D-104' },
  { id: generateId(), asset_type: 'CPU', brand: 'Lenovo', model_number: 'ThinkCentre M90q', serial_number: 'SN-2024-018', desk_number: 'D-104' },
  { id: generateId(), asset_type: 'RJ Headset', brand: 'Jabra', model_number: 'Evolve2 85', serial_number: 'SN-2024-019', desk_number: 'D-104' },
  { id: generateId(), asset_type: 'Speaker', brand: 'JBL', model_number: 'Quantum Duo', serial_number: 'SN-2024-020', desk_number: 'D-104' },

  { id: generateId(), asset_type: 'Desk', brand: 'Herman Miller', model_number: 'Aeron Remastered', serial_number: 'SN-2024-021', desk_number: 'D-105' },
  { id: generateId(), asset_type: 'Monitor', brand: 'Apple', model_number: 'Studio Display', serial_number: 'SN-2024-022', desk_number: 'D-105' },
  { id: generateId(), asset_type: 'CPU', brand: 'Apple', model_number: 'Mac Studio M2', serial_number: 'SN-2024-023', desk_number: 'D-105' },
  { id: generateId(), asset_type: 'Keyboard', brand: 'Apple', model_number: 'Magic Keyboard', serial_number: 'SN-2024-024', desk_number: 'D-105' },
  { id: generateId(), asset_type: 'Mouse', brand: 'Apple', model_number: 'Magic Mouse', serial_number: 'SN-2024-025', desk_number: 'D-105' },

  { id: generateId(), asset_type: 'Desk', brand: 'IKEA', model_number: 'Trotten', serial_number: 'SN-2024-026', desk_number: 'D-106' },
  { id: generateId(), asset_type: 'Monitor', brand: 'ASUS', model_number: 'ProArt PA32UCG', serial_number: 'SN-2024-027', desk_number: 'D-106' },
  { id: generateId(), asset_type: 'Thin Client', brand: 'Dell', model_number: 'Wyse 5070', serial_number: 'SN-2024-028', desk_number: 'D-106' },
  { id: generateId(), asset_type: 'IP Phone', brand: 'Poly', model_number: 'VVX 450', serial_number: 'SN-2024-029', desk_number: 'D-106' },
  { id: generateId(), asset_type: 'RJ Headset', brand: 'Plantronics', model_number: 'Blackwire 5220', serial_number: 'SN-2024-030', desk_number: 'D-106' },

  { id: generateId(), asset_type: 'Desk', brand: 'Steelcase', model_number: 'Leap V2', serial_number: 'SN-2024-031', desk_number: 'D-107' },
  { id: generateId(), asset_type: 'Monitor', brand: 'Dell', model_number: 'U3423WE', serial_number: 'SN-2024-032', desk_number: 'D-107' },
  { id: generateId(), asset_type: 'CPU', brand: 'HP', model_number: 'Z2 Mini G9', serial_number: 'SN-2024-033', desk_number: 'D-107' },
  { id: generateId(), asset_type: 'Speaker', brand: 'Audioengine', model_number: 'A2+', serial_number: 'SN-2024-034', desk_number: 'D-107' },
  { id: generateId(), asset_type: 'IP Phone', brand: 'Yealink', model_number: 'T55A', serial_number: 'SN-2024-035', desk_number: 'D-107' },

  { id: generateId(), asset_type: 'Desk', brand: 'IKEA', model_number: 'Mittzon', serial_number: 'SN-2024-036', desk_number: 'D-108' },
  { id: generateId(), asset_type: 'Monitor', brand: 'BenQ', model_number: 'PD3205U', serial_number: 'SN-2024-037', desk_number: 'D-108' },
  { id: generateId(), asset_type: 'Thin Client', brand: 'Lenovo', model_number: 'ThinkCentre M75q', serial_number: 'SN-2024-038', desk_number: 'D-108' },
  { id: generateId(), asset_type: 'Keyboard', brand: 'Keychron', model_number: 'Q6 Pro', serial_number: 'SN-2024-039', desk_number: 'D-108' },
  { id: generateId(), asset_type: 'RJ Headset', brand: 'Sennheiser', model_number: 'SC 660', serial_number: 'SN-2024-040', desk_number: 'D-108' },

  { id: generateId(), asset_type: 'Desk', brand: 'Herman Miller', model_number: 'Mirra 2', serial_number: 'SN-2024-041', desk_number: 'D-109' },
  { id: generateId(), asset_type: 'Monitor', brand: 'Dell', model_number: 'S2722QC', serial_number: 'SN-2024-042', desk_number: 'D-109' },
  { id: generateId(), asset_type: 'CPU', brand: 'Intel', model_number: 'NUC 13 Pro', serial_number: 'SN-2024-043', desk_number: 'D-109' },
  { id: generateId(), asset_type: 'Mouse', brand: 'Razer', model_number: 'Pro Click', serial_number: 'SN-2024-044', desk_number: 'D-109' },
  { id: generateId(), asset_type: 'IP Phone', brand: 'Cisco', model_number: '8845', serial_number: 'SN-2024-045', desk_number: 'D-109' },

  { id: generateId(), asset_type: 'Desk', brand: 'Steelcase', model_number: 'Think', serial_number: 'SN-2024-046', desk_number: 'D-110' },
  { id: generateId(), asset_type: 'Monitor', brand: 'LG', model_number: '27UK850-W', serial_number: 'SN-2024-047', desk_number: 'D-110' },
  { id: generateId(), asset_type: 'Thin Client', brand: 'HP', model_number: 't740', serial_number: 'SN-2024-048', desk_number: 'D-110' },
  { id: generateId(), asset_type: 'Speaker', brand: 'Creative', model_number: 'Pebble V3', serial_number: 'SN-2024-049', desk_number: 'D-110' },
  { id: generateId(), asset_type: 'RJ Headset', brand: 'Jabra', model_number: 'Evolve 40', serial_number: 'SN-2024-050', desk_number: 'D-110' },
];

// Simulate localStorage persistence
const STORAGE_KEY = 'ams_assets';

function loadAssets(): Asset[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    // ignore
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialAssets));
  return [...initialAssets];
}

function saveAssets(assets: Asset[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(assets));
}

// Mock API functions that mimic Supabase queries
export const mockApi = {
  // Get all assets
  getAllAssets: async (): Promise<Asset[]> => {
    await delay(300);
    return loadAssets();
  },

  // Get asset by ID
  getAssetById: async (id: string): Promise<Asset | null> => {
    await delay(200);
    const assets = loadAssets();
    return assets.find(a => a.id === id) || null;
  },

  // Add new asset
  addAsset: async (data: AssetFormData): Promise<Asset> => {
    await delay(400);
    const assets = loadAssets();
    const newAsset: Asset = {
      id: generateId(),
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    assets.unshift(newAsset);
    saveAssets(assets);
    return newAsset;
  },

  // Update asset
  updateAsset: async (id: string, data: AssetFormData): Promise<Asset> => {
    await delay(400);
    const assets = loadAssets();
    const index = assets.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Asset not found');
    assets[index] = {
      ...assets[index],
      ...data,
      updated_at: new Date().toISOString(),
    };
    saveAssets(assets);
    return assets[index];
  },

  // Delete asset
  deleteAsset: async (id: string): Promise<void> => {
    await delay(300);
    const assets = loadAssets();
    const filtered = assets.filter(a => a.id !== id);
    saveAssets(filtered);
  },

  // Bulk import
  bulkImport: async (assets: AssetFormData[]): Promise<Asset[]> => {
    await delay(800);
    const existing = loadAssets();
    const newAssets: Asset[] = assets.map(data => ({
      id: generateId(),
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
    const allAssets = [...newAssets, ...existing];
    saveAssets(allAssets);
    return newAssets;
  },

  // Get dashboard stats
  getDashboardStats: async (): Promise<DashboardStats> => {
    await delay(500);
    const assets = loadAssets();
    const countByType = (type: string) => assets.filter(a => a.asset_type === type).length;
    
    return {
      total_desks: countByType('Desk'),
      total_monitors: countByType('Monitor'),
      total_cpus: countByType('CPU'),
      total_thin_clients: countByType('Thin Client'),
      total_speakers: countByType('Speaker'),
      total_keyboards: countByType('Keyboard'),
      total_mice: countByType('Mouse'),
      total_ip_phones: countByType('IP Phone'),
      total_rj_headsets: countByType('RJ Headset'),
    };
  },

  // Get assets by desk number
  getAssetsByDesk: async (deskNumber: string): Promise<DeskAssets> => {
    await delay(300);
    const assets = loadAssets();
    const deskAssets = assets.filter(a => 
      a.desk_number.toLowerCase() === deskNumber.toLowerCase()
    );
    return {
      desk_number: deskNumber,
      assets: deskAssets,
    };
  },

  // Search assets
  searchAssets: async (filters: {
    serial_number?: string;
    model_number?: string;
    brand?: string;
    desk_number?: string;
  }): Promise<Asset[]> => {
    await delay(400);
    const assets = loadAssets();
    return assets.filter(asset => {
      if (filters.serial_number && !asset.serial_number.toLowerCase().includes(filters.serial_number.toLowerCase())) return false;
      if (filters.model_number && !asset.model_number.toLowerCase().includes(filters.model_number.toLowerCase())) return false;
      if (filters.brand && !asset.brand.toLowerCase().includes(filters.brand.toLowerCase())) return false;
      if (filters.desk_number && !asset.desk_number.toLowerCase().includes(filters.desk_number.toLowerCase())) return false;
      return true;
    });
  },

  // Get recent assets (for dashboard)
  getRecentAssets: async (limit: number = 5): Promise<Asset[]> => {
    await delay(300);
    const assets = loadAssets();
    return assets.slice(0, limit);
  },
};

// Simulate network delay
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
