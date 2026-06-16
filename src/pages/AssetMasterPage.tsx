import { useState, useEffect, useRef, type FormEvent, type ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Upload,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { assetsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type { Asset, AssetFormData } from '@/types';
import { ASSET_TYPES, BRANDS } from '@/types';

// ---------- Types ----------
interface ToastMessage {
  id: number;
  type: 'success' | 'error';
  text: string;
}

// ---------- Initial form data ----------
const emptyFormData: AssetFormData = {
  asset_type: 'Desk',
  brand: '',
  model_number: '',
  serial_number: '',
  desk_number: '',
};

// ---------- Modal backdrop + animation variants ----------
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } },
  exit: { opacity: 0, scale: 0.92, y: 20, transition: { duration: 0.2 } },
};

// ---------- Main Component ----------
export default function AssetMasterPage() {
  // Data state
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState<AssetFormData>({ ...emptyFormData });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete confirmation
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Search & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Toast
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const toastCounter = useRef(0);

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isAdmin } = useAuth();

  // --- Load assets ---
  useEffect(() => {
    fetchAssets();
  }, []);

  async function fetchAssets() {
    setLoading(true);
    try {
      const response = await assetsApi.getAll();
      setAssets(response.assets);
    } catch (err) {
      addToast('error', 'Failed to load assets.');
    } finally {
      setLoading(false);
    }
  }

  // --- Toast helper ---
  function addToast(type: 'success' | 'error', text: string) {
    const id = ++toastCounter.current;
    setToasts((prev) => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }

  // --- Filtered & Paginated data ---
  const filteredAssets = assets.filter((a) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      a.asset_type.toLowerCase().includes(q) ||
      a.brand.toLowerCase().includes(q) ||
      a.model_number.toLowerCase().includes(q) ||
      a.serial_number.toLowerCase().includes(q) ||
      a.desk_number.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredAssets.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedAssets = filteredAssets.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // --- Form handlers ---
  function openAddForm() {
    if (!isAdmin) {
      addToast('error', 'Admin access required.');
      return;
    }

    setFormData({ ...emptyFormData });
    setEditingId(null);
    setFormError('');
    setShowForm(true);
  }

  function openEditForm(asset: Asset) {
    if (!isAdmin) {
      addToast('error', 'Admin access required.');
      return;
    }

    setFormData({
      asset_type: asset.asset_type,
      brand: asset.brand,
      model_number: asset.model_number,
      serial_number: asset.serial_number,
      desk_number: asset.desk_number,
    });
    setEditingId(asset.id);
    setFormError('');
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setFormError('');
  }

  function handleFormChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleFormSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError('');

    // Basic validation
    if (!formData.brand.trim() || !formData.model_number.trim() || !formData.serial_number.trim() || !formData.desk_number.trim()) {
      setFormError('All fields are required.');
      return;
    }

    setFormLoading(true);
    try {
      if (editingId) {
        await assetsApi.update(editingId, formData);
        addToast('success', 'Asset updated successfully.');
      } else {
        await assetsApi.create(formData);
        addToast('success', 'Asset added successfully.');
      }
      closeForm();
      await fetchAssets();
    } catch (err: any) {
      setFormError(err?.message || 'Something went wrong.');
    } finally {
      setFormLoading(false);
    }
  }

  // --- Delete handlers ---
  function openDeleteConfirm(id: string) {
    setDeleteTargetId(id);
  }

  function closeDeleteConfirm() {
    setDeleteTargetId(null);
  }

  async function confirmDelete() {
    if (!deleteTargetId) return;
    setDeleteLoading(true);
    try {
      await assetsApi.delete(deleteTargetId);
      addToast('success', 'Asset deleted successfully.');
      closeDeleteConfirm();
      await fetchAssets();
    } catch (err: any) {
      addToast('error', err?.message || 'Failed to delete asset.');
    } finally {
      setDeleteLoading(false);
    }
  }

  // --- Bulk Import ---
  async function handleBulkImport(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const extension = file.name.split('.').pop()?.toLowerCase();
      let parsedData: AssetFormData[] = [];

      if (extension === 'csv') {
        parsedData = await parseCSV(file);
      } else if (extension === 'xlsx') {
        parsedData = await parseXLSX(file);
      } else {
        addToast('error', 'Unsupported file format. Please upload .csv or .xlsx files.');
        return;
      }

      if (parsedData.length === 0) {
        addToast('error', 'No valid asset records found in the file.');
        return;
      }

      // Validate rows
      const validRows: AssetFormData[] = [];
      for (const row of parsedData) {
        if (row.asset_type && row.brand && row.model_number && row.serial_number && row.desk_number) {
          // Ensure asset_type is valid
          if (ASSET_TYPES.includes(row.asset_type as any)) {
            validRows.push(row);
          }
        }
      }

      if (validRows.length === 0) {
        addToast('error', 'No valid rows found. Check your file format.');
        return;
      }

      setLoading(true);
      await assetsApi.bulkImport(validRows);
      addToast('success', `Successfully imported ${validRows.length} asset(s).`);
      await fetchAssets();
    } catch (err: any) {
      addToast('error', err?.message || 'Bulk import failed.');
    } finally {
      setLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  function parseCSV(file: File): Promise<AssetFormData[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        const lines = text.split(/\r?\n/).filter((line) => line.trim());
        if (lines.length < 2) {
          resolve([]);
          return;
        }

        // Detect header: first row might be header
        const firstLine = lines[0].toLowerCase();
        const hasHeader =
          firstLine.includes('asset_type') ||
          firstLine.includes('asset type') ||
          firstLine.includes('brand');

        const dataLines = hasHeader ? lines.slice(1) : lines;
        const rows: AssetFormData[] = [];

        for (const line of dataLines) {
          // Handle quoted fields
          const fields = parseCSVLine(line);
          if (fields.length >= 5) {
            rows.push({
              asset_type: fields[0]?.trim() || '',
              brand: fields[1]?.trim() || '',
              model_number: fields[2]?.trim() || '',
              serial_number: fields[3]?.trim() || '',
              desk_number: fields[4]?.trim() || '',
            });
          }
        }

        resolve(rows);
      };
      reader.onerror = () => reject(new Error('Failed to read file.'));
      reader.readAsText(file);
    });
  }

  // Simple CSV line parser that respects quoted fields
  function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  }

  async function parseXLSX(file: File): Promise<AssetFormData[]> {
    // Dynamically import xlsx (sheets) library
    // The library is already available in the project
    const XLSX = await import('xlsx');
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) return [];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

    const rows: AssetFormData[] = [];
    for (const row of jsonData) {
      // Try to find columns by common header names (case-insensitive)
      const assetType =
        row['asset_type'] || row['Asset Type'] || row['AssetType'] || row['type'] || row['Type'] || '';
      const brand = row['brand'] || row['Brand'] || '';
      const modelNumber =
        row['model_number'] || row['Model Number'] || row['ModelNumber'] || row['model'] || row['Model'] || '';
      const serialNumber =
        row['serial_number'] || row['Serial Number'] || row['SerialNumber'] || row['serial'] || row['Serial'] || '';
      const deskNumber =
        row['desk_number'] || row['Desk Number'] || row['DeskNumber'] || row['desk'] || row['Desk'] || '';

      if (assetType || brand || modelNumber || serialNumber || deskNumber) {
        rows.push({
          asset_type: String(assetType).trim(),
          brand: String(brand).trim(),
          model_number: String(modelNumber).trim(),
          serial_number: String(serialNumber).trim(),
          desk_number: String(deskNumber).trim(),
        });
      }
    }

    return rows;
  }

  // --- Render ---
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="space-y-6"
    >
      {/* Page heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="heading-1">Asset Master</h1>
          <p className="text-caption mt-1">Manage all IT assets across desks</p>
        </div>
        <div className="flex gap-3">
          {/* Bulk Import */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx"
            onChange={handleBulkImport}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => isAdmin && fileInputRef.current?.click()}
            disabled={!isAdmin}
            className={`btn-secondary flex items-center gap-2 text-sm ${!isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={!isAdmin ? 'Admin only' : 'Bulk import assets'}
          >
            <Upload className="w-4 h-4" />
            Bulk Import
          </button>
          <button
            type="button"
            onClick={isAdmin ? openAddForm : undefined}
            disabled={!isAdmin}
            className={`btn-primary flex items-center gap-2 text-sm ${!isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={!isAdmin ? 'Admin only' : 'Add asset'}
          >
            <Plus className="w-4 h-4" />
            Add Asset
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search assets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-premium pl-10"
        />
      </div>

      {/* Asset Table */}
      <div className="card-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Asset Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Brand
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Model Number
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Serial Number
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Desk Number
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3"><div className="skeleton h-4 w-20" /></td>
                    <td className="px-4 py-3"><div className="skeleton h-4 w-24" /></td>
                    <td className="px-4 py-3"><div className="skeleton h-4 w-32" /></td>
                    <td className="px-4 py-3"><div className="skeleton h-4 w-28" /></td>
                    <td className="px-4 py-3"><div className="skeleton h-4 w-16" /></td>
                    <td className="px-4 py-3"><div className="skeleton h-4 w-16 ml-auto" /></td>
                  </tr>
                ))
              ) : paginatedAssets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-caption">
                    {searchTerm ? 'No assets match your search.' : 'No assets found. Add your first asset!'}
                  </td>
                </tr>
              ) : (
                paginatedAssets.map((asset) => (
                  <motion.tr
                    key={asset.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="badge bg-primary-50 text-primary-700">{asset.asset_type}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-medium">{asset.brand}</td>
                    <td className="px-4 py-3 text-slate-600">{asset.model_number}</td>
                    <td className="px-4 py-3 text-slate-600 font-mono text-xs">{asset.serial_number}</td>
                    <td className="px-4 py-3 text-slate-600">{asset.desk_number}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {isAdmin ? (
                          <>
                            <button
                              onClick={() => openEditForm(asset)}
                              className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-primary-600 transition-colors"
                              title="Edit Asset"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openDeleteConfirm(asset.id)}
                              className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
                              title="Delete Asset"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-slate-500">Admin only</span>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <p className="text-xs text-slate-400">
              Showing {Math.min((safePage - 1) * itemsPerPage + 1, filteredAssets.length)}–{Math.min(safePage * itemsPerPage, filteredAssets.length)} of {filteredAssets.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-slate-500" />
              </button>
              {Array.from({ length: totalPages }).map((_, i) => {
                const page = i + 1;
                // Show limited page buttons with ellipsis logic
                if (totalPages <= 7 || page === 1 || page === totalPages || Math.abs(page - safePage) <= 1) {
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                        page === safePage
                          ? 'bg-primary-600 text-white shadow-button'
                          : 'text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {page}
                    </button>
                  );
                }
                if (page === 2 && safePage > 4) {
                  return <span key="ellipsis1" className="w-8 h-8 flex items-center justify-center text-slate-400">…</span>;
                }
                if (page === totalPages - 1 && safePage < totalPages - 3) {
                  return <span key="ellipsis2" className="w-8 h-8 flex items-center justify-center text-slate-400">…</span>;
                }
                return null;
              })}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ---------- Add / Edit Modal ---------- */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <motion.div
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={closeForm}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-elevated overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <h3 className="heading-3">{editingId ? 'Edit Asset' : 'Add New Asset'}</h3>
                <button
                  onClick={closeForm}
                  className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleFormSubmit} className="p-6 space-y-5">
                {formError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    {formError}
                  </div>
                )}

                {/* Asset Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Asset Type</label>
                  <select
                    name="asset_type"
                    value={formData.asset_type}
                    onChange={handleFormChange}
                    className="input-premium"
                  >
                    {ASSET_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Brand */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Brand</label>
                  <select
                    name="brand"
                    value={formData.brand}
                    onChange={handleFormChange}
                    className="input-premium"
                  >
                    <option value="">Select a brand</option>
                    {BRANDS.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Model Number */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Model Number</label>
                  <input
                    type="text"
                    name="model_number"
                    value={formData.model_number}
                    onChange={handleFormChange}
                    placeholder="e.g., U2723QE"
                    className="input-premium"
                  />
                </div>

                {/* Serial Number */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Serial Number</label>
                  <input
                    type="text"
                    name="serial_number"
                    value={formData.serial_number}
                    onChange={handleFormChange}
                    placeholder="e.g., SN-2024-001"
                    className="input-premium"
                  />
                </div>

                {/* Desk Number */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Desk Number</label>
                  <input
                    type="text"
                    name="desk_number"
                    value={formData.desk_number}
                    onChange={handleFormChange}
                    placeholder="e.g., D-101"
                    className="input-premium"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="btn-secondary text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="btn-primary flex items-center gap-2 text-sm disabled:opacity-70"
                  >
                    {formLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {editingId ? 'Updating...' : 'Adding...'}
                      </>
                    ) : editingId ? (
                      'Update Asset'
                    ) : (
                      'Add Asset'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ---------- Delete Confirmation Dialog ---------- */}
      <AnimatePresence>
        {deleteTargetId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <motion.div
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={closeDeleteConfirm}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            {/* Dialog */}
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative z-10 w-full max-w-sm bg-white rounded-2xl shadow-elevated overflow-hidden"
            >
              <div className="p-6 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-4">
                  <Trash2 className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="heading-3 mb-2">Delete Asset</h3>
                <p className="text-caption">
                  Are you sure you want to delete this asset? This action cannot be undone.
                </p>
              </div>
              <div className="flex border-t border-slate-100">
                <button
                  onClick={closeDeleteConfirm}
                  className="flex-1 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleteLoading}
                  className="flex-1 px-4 py-3 text-sm font-medium text-red-600 border-l border-slate-100 hover:bg-red-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {deleteLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ---------- Toast Container ---------- */}
      <div className="fixed top-4 right-4 z-[60] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 60, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.95 }}
              className={`pointer-events-auto px-4 py-3 rounded-xl shadow-elevated flex items-center gap-2.5 text-sm font-medium ${
                toast.type === 'success'
                  ? 'bg-white border border-emerald-200 text-emerald-700'
                  : 'bg-white border border-red-200 text-red-700'
              }`}
            >
              {toast.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-500" />
              )}
              {toast.text}
              <button
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                className="ml-2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}