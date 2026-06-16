import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import {
  FileSpreadsheet,
  Download,
  Filter,
  MonitorSmartphone,
  HardDrive,
  CheckCircle,
  Clock,
  Loader2,
  FileDown,
  History,
} from 'lucide-react';
import { assetsApi } from '@/lib/api';
import type { Asset, AssetType } from '@/types';
import { ASSET_TYPES } from '@/types';

interface DownloadEntry {
  id: string;
  name: string;
  timestamp: Date;
  assetCount: number;
  type: string;
}

export default function ReportsPage() {
  const [exportAllLoading, setExportAllLoading] = useState(false);
  const [exportAllProgress, setExportAllProgress] = useState(0);

  const [selectedType, setSelectedType] = useState<AssetType>(ASSET_TYPES[0]);
  const [exportTypeLoading, setExportTypeLoading] = useState(false);
  const [exportTypeProgress, setExportTypeProgress] = useState(0);

  const [deskNumber, setDeskNumber] = useState('');
  const [exportDeskLoading, setExportDeskLoading] = useState(false);
  const [exportDeskProgress, setExportDeskProgress] = useState(0);

  const [downloadHistory, setDownloadHistory] = useState<DownloadEntry[]>([]);

  const progressSteps = [0, 25, 50, 75, 100];

  const runProgress = (setter: React.Dispatch<React.SetStateAction<number>>, cb: () => void) => {
    setter(0);
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step >= progressSteps.length) {
        clearInterval(interval);
        setter(100);
        setTimeout(() => {
          cb();
          setTimeout(() => setter(0), 500);
        }, 200);
      } else {
        setter(progressSteps[step]);
      }
    }, 350);
  };

  const generateAndDownload = useCallback(
    (
      assets: Asset[],
      filename: string,
      setLoading: React.Dispatch<React.SetStateAction<boolean>>,
      setProgress: React.Dispatch<React.SetStateAction<number>>,
      historyLabel: string,
      historyType: string
    ) => {
      setLoading(true);
      runProgress(setProgress, () => {
        try {
          const data = assets.map((a) => ({
            'Asset Type': a.asset_type,
            'Serial Number': a.serial_number,
            'Model Number': a.model_number,
            Brand: a.brand,
            'Desk Number': a.desk_number,
          }));

          const ws = XLSX.utils.json_to_sheet(data);
          ws['!cols'] = [
            { wch: 15 },
            { wch: 20 },
            { wch: 15 },
            { wch: 15 },
            { wch: 12 },
            { wch: 12 },
          ];
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'Assets');
          const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

          const blob = new Blob([buf], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${filename}.xlsx`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);

          setDownloadHistory((prev) => [
            {
              id: crypto.randomUUID(),
              name: `${filename}.xlsx`,
              timestamp: new Date(),
              assetCount: assets.length,
              type: historyType,
            },
            ...prev.slice(0, 9),
          ]);
        } catch (err) {
          console.error('Export failed:', err);
        }
        setLoading(false);
      });
    },
    []
  );

  const handleExportAll = useCallback(async () => {
    const response = await assetsApi.getAll();
    const assets = response.assets;
    generateAndDownload(assets, 'All_Assets_Export', setExportAllLoading, setExportAllProgress, 'All Assets', 'All');
  }, [generateAndDownload]);

  const handleExportByType = useCallback(async () => {
    const response = await assetsApi.getAll();
    const allAssets = response.assets;
    const filtered = allAssets.filter((a: Asset) => a.asset_type === selectedType);
    generateAndDownload(filtered, `${selectedType}_Export`, setExportTypeLoading, setExportTypeProgress, selectedType, 'Type');
  }, [generateAndDownload, selectedType]);

  const handleExportByDesk = useCallback(async () => {
    if (!deskNumber.trim()) return;
    try {
      const result = await assetsApi.getByDesk(deskNumber.trim());
      generateAndDownload(
        result.assets,
        `Desk_${deskNumber.trim()}_Export`,
        setExportDeskLoading,
        setExportDeskProgress,
        `Desk ${deskNumber.trim()}`,
        'Desk'
      );
    } catch {
      generateAndDownload([], `Desk_${deskNumber.trim()}_Export`, setExportDeskLoading, setExportDeskProgress, `Desk ${deskNumber.trim()}`, 'Desk');
    }
  }, [generateAndDownload, deskNumber]);

  const ProgressBar = ({
    progress,
    loading,
  }: {
    progress: number;
    loading: boolean;
  }) => {
    if (!loading && progress === 0) return null;
    return (
      <div className="mt-4">
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          />
        </div>
        <p className="text-xs text-slate-400 mt-1.5 text-right">
          {progress < 100 ? 'Preparing export...' : 'Complete!'}
        </p>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* Page Header */}
      <div>
        <h1 className="heading-1">Reports & Export</h1>
        <p className="text-caption mt-1">Export asset data to Excel spreadsheets</p>
      </div>

      {/* Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Export All Assets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-premium p-6 flex flex-col"
        >
          <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mb-4">
            <FileSpreadsheet className="w-6 h-6 text-primary-600" />
          </div>
          <h3 className="heading-3">Export All Assets</h3>
          <p className="text-sm text-slate-500 mt-2 flex-1">
            Download a complete spreadsheet of all assets in the inventory. Includes all fields and metadata.
          </p>
          <ProgressBar progress={exportAllProgress} loading={exportAllLoading} />
          <button
            onClick={handleExportAll}
            disabled={exportAllLoading}
            className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
          >
            {exportAllLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {exportAllLoading ? 'Exporting...' : 'Export All'}
          </button>
        </motion.div>

        {/* Export by Asset Type */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-premium p-6 flex flex-col"
        >
          <div className="w-12 h-12 rounded-xl bg-accent-50 flex items-center justify-center mb-4">
            <Filter className="w-6 h-6 text-accent-600" />
          </div>
          <h3 className="heading-3">Export by Asset Type</h3>
          <p className="text-sm text-slate-500 mt-2 flex-1">
            Filter and export assets of a specific type. Select from the available asset categories.
          </p>
          <div className="mt-3">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Asset Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as AssetType)}
              className="input-premium w-full"
            >
              {ASSET_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <ProgressBar progress={exportTypeProgress} loading={exportTypeLoading} />
          <button
            onClick={handleExportByType}
            disabled={exportTypeLoading}
            className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
          >
            {exportTypeLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {exportTypeLoading ? 'Exporting...' : `Export ${selectedType}`}
          </button>
        </motion.div>

        {/* Export by Desk Number */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-premium p-6 flex flex-col"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-4">
            <MonitorSmartphone className="w-6 h-6 text-emerald-600" />
          </div>
          <h3 className="heading-3">Export by Desk</h3>
          <p className="text-sm text-slate-500 mt-2 flex-1">
            Export all assets assigned to a specific desk. Enter the desk number to get started.
          </p>
          <div className="mt-3">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Desk Number</label>
            <input
              type="text"
              value={deskNumber}
              onChange={(e) => setDeskNumber(e.target.value)}
              placeholder="e.g., D-101"
              className="input-premium w-full"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleExportByDesk();
              }}
            />
          </div>
          <ProgressBar progress={exportDeskProgress} loading={exportDeskLoading} />
          <button
            onClick={handleExportByDesk}
            disabled={exportDeskLoading || !deskNumber.trim()}
            className="btn-primary w-full mt-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exportDeskLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {exportDeskLoading ? 'Exporting...' : 'Export Desk Assets'}
          </button>
        </motion.div>
      </div>

      {/* Download History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card-premium p-6"
      >
        <h2 className="heading-3 flex items-center gap-2 mb-4">
          <History className="w-5 h-5 text-primary-600" />
          Download History
        </h2>
        {downloadHistory.length === 0 ? (
          <div className="text-center py-12">
            <FileDown className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No exports yet. Generate your first report above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {downloadHistory.map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                    <FileSpreadsheet className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{entry.name}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="badge bg-slate-100 text-slate-600 text-xs">{entry.type}</span>
                      <span className="text-xs text-slate-400">
                        {entry.assetCount} asset{entry.assetCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 flex-shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-xs">
                      {entry.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
