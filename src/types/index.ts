export interface Asset {
  id: string;
  asset_type: string;
  brand: string;
  model_number: string;
  serial_number: string;
  desk_number: string;
  created_at?: string;
  updated_at?: string;
}

export interface AssetFormData {
  asset_type: string;
  brand: string;
  model_number: string;
  serial_number: string;
  desk_number: string;
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'viewer';
}

export interface DashboardStats {
  total_desks: number;
  total_monitors: number;
  total_cpus: number;
  total_thin_clients: number;
  total_speakers: number;
  total_keyboards: number;
  total_mice: number;
  total_ip_phones: number;
  total_rj_headsets: number;
}

export interface DeskAssets {
  desk_number: string;
  assets: Asset[];
}

export type AssetType = 
  | 'Desk'
  | 'Monitor'
  | 'CPU'
  | 'Thin Client'
  | 'Speaker'
  | 'Keyboard'
  | 'Mouse'
  | 'IP Phone'
  | 'RJ Headset';

export const ASSET_TYPES: AssetType[] = [
  'Desk',
  'Monitor',
  'CPU',
  'Thin Client',
  'Speaker',
  'Keyboard',
  'Mouse',
  'IP Phone',
  'RJ Headset',
];

export const BRANDS = [
  'HP',
  'DELL',
  'LOGITECH',
  'ACER',
  'SAMSUNG',
  'CLIENTRONIX',
  'BENQ',
];

export interface FilterState {
  serial_number: string;
  model_number: string;
  brand: string;
  desk_number: string;
}

export interface ExportOptions {
  asset_type?: AssetType;
  desk_number?: string;
  date_from?: string;
  date_to?: string;
}
