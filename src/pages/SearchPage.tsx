import { useState, useCallback, useEffect, useRef, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  Filter,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Package,
  HardDrive,
  Monitor,
  Cpu,
  Keyboard,
  Mouse,
  Speaker,
  Phone,
  Headphones,
} from 'lucide-react';
import { assetsApi } from '@/lib/api';
import type { Asset, FilterState } from '@/types';

const assetTypeIcons: Record<string, React.FC<{ className?: string }>> = {
  Desk: HardDrive,
  Monitor,
  CPU: Cpu,
  'Thin Client': Monitor,
  Speaker: Speaker,
  Keyboard: Keyboard,
  Mouse: Mouse,
  'IP Phone': Phone,
  'RJ Headset': Headphones,
};

export default function SearchPage() {
  const [filters, setFilters] = useState<FilterState>({
    serial_number: '',
    model_number: '',
    brand: '',
    desk_number: '',
  });
  const [results, setResults] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const performSearch = useCallback((filterValues: FilterState) => {
    setLoading(true);
    setTimeout(async () => {
      try {
        const params: Record<string, string> = {};
        if (filterValues.serial_number) params.serial_number = filterValues.serial_number;
        if (filterValues.model_number) params.model_number = filterValues.model_number;
        if (filterValues.brand) params.brand = filterValues.brand;
        if (filterValues.desk_number) params.desk_number = filterValues.desk_number;
        const response = await assetsApi.getAll(params);
        setResults(response.assets);
      } catch {
        setResults([]);
      }
      setLoading(false);
    }, 300);
  }, []);

  const handleFilterChange = useCallback(
    (key: keyof FilterState, value: string) => {
      const newFilters = { ...filters, [key]: value };
      setFilters(newFilters);

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        performSearch(newFilters);
      }, 250);
    },
    [filters, performSearch]
  );

  const clearFilters = useCallback(() => {
    const empty: FilterState = {
      serial_number: '',
      model_number: '',
      brand: '',
      desk_number: '',
    };
    setFilters(empty);
    performSearch(empty);
  }, [performSearch]);

  useEffect(() => {
    performSearch(filters);
  }, []);

  const hasActiveFilters = (Object.values(filters) as string[]).some((v) => v.trim() !== '');

  const AssetIconComp = (type: string) => assetTypeIcons[type] || HardDrive;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="heading-1">Search Assets</h1>
          <p className="text-caption mt-1">Search and filter your entire asset inventory</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn-secondary flex items-center gap-2 self-start"
        >
          <SlidersHorizontal className="w-4 h-4" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, x: -30, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0, x: -30, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:col-span-1 overflow-hidden"
            >
              <div className="card-premium p-5 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="heading-3 flex items-center gap-2">
                    <Filter className="w-4 h-4 text-primary-600" />
                    Filters
                  </h3>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-xs text-primary-600 hover:text-primary-800 font-medium"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {/* Serial Number */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Serial Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={filters.serial_number}
                      onChange={(e) => handleFilterChange('serial_number', e.target.value)}
                      placeholder="Search serial..."
                      className="input-premium w-full pl-10"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    {filters.serial_number && (
                      <button
                        onClick={() => handleFilterChange('serial_number', '')}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Model Number */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Model Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={filters.model_number}
                      onChange={(e) => handleFilterChange('model_number', e.target.value)}
                      placeholder="Search model..."
                      className="input-premium w-full pl-10"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    {filters.model_number && (
                      <button
                        onClick={() => handleFilterChange('model_number', '')}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Brand */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Brand</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={filters.brand}
                      onChange={(e) => handleFilterChange('brand', e.target.value)}
                      placeholder="Search brand..."
                      className="input-premium w-full pl-10"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    {filters.brand && (
                      <button
                        onClick={() => handleFilterChange('brand', '')}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Desk Number */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Desk Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={filters.desk_number}
                      onChange={(e) => handleFilterChange('desk_number', e.target.value)}
                      placeholder="Search desk..."
                      className="input-premium w-full pl-10"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    {filters.desk_number && (
                      <button
                        onClick={() => handleFilterChange('desk_number', '')}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
                      </button>
                    )}
                  </div>
                </div>

                {hasActiveFilters && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={clearFilters}
                    className="btn-secondary w-full"
                  >
                    Clear All Filters
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Panel */}
        <div className={`${showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
          <div className="card-premium overflow-hidden">
            {/* Results Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                {loading ? (
                  <span className="inline-block w-20 h-4 skeleton rounded" />
                ) : (
                  <>
                    <span className="font-semibold text-slate-800">{results.length}</span>{' '}
                    result{results.length !== 1 ? 's' : ''} found
                  </>
                )}
              </p>
              {hasActiveFilters && (
                <span className="badge bg-primary-50 text-primary-700 text-xs">Filtered</span>
              )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">
                      Asset
                    </th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3 hidden md:table-cell">
                      Serial
                    </th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3 hidden lg:table-cell">
                      Model
                    </th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3 hidden sm:table-cell">
                      Brand
                    </th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">
                      Desk
                    </th>
                    <th className="w-10 px-6 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [...Array(6)].map((_, i) => (
                      <tr key={i} className="border-b border-slate-50">
                        <td className="px-6 py-4"><div className="skeleton h-5 w-32 rounded" /></td>
                        <td className="px-6 py-4 hidden md:table-cell"><div className="skeleton h-5 w-24 rounded" /></td>
                        <td className="px-6 py-4 hidden lg:table-cell"><div className="skeleton h-5 w-20 rounded" /></td>
                        <td className="px-6 py-4 hidden sm:table-cell"><div className="skeleton h-5 w-16 rounded" /></td>
                        <td className="px-6 py-4"><div className="skeleton h-5 w-14 rounded" /></td>
                        <td className="px-6 py-4" />
                      </tr>
                    ))
                  ) : results.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-16">
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex flex-col items-center justify-center text-center"
                        >
                          <Package className="w-16 h-16 text-slate-300 mb-4" />
                          <h3 className="text-lg font-semibold text-slate-700 mb-1">No assets found</h3>
                          <p className="text-sm text-slate-400 max-w-md">
                            {hasActiveFilters
                              ? "Try adjusting your filters to find what you're looking for."
                              : 'No assets in the system yet. Start by adding some assets.'}
                          </p>
                        </motion.div>
                      </td>
                    </tr>
                  ) : (
                    results.map((asset, i) => {
                      const IconComp = AssetIconComp(asset.asset_type);
                      const isExpanded = expandedRow === asset.id;
                      return (
                        <Fragment key={asset.id}>
                          <motion.tr
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer ${
                              isExpanded ? 'bg-slate-50/80' : ''
                            }`}
                            onClick={() => setExpandedRow(isExpanded ? null : asset.id)}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                                  <IconComp className="w-4.5 h-4.5 text-primary-600" />
                                </div>
                                <span className="text-sm font-medium text-slate-800">{asset.asset_type}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 hidden md:table-cell">
                              <span className="text-sm text-slate-600 font-mono">{asset.serial_number}</span>
                            </td>
                            <td className="px-6 py-4 hidden lg:table-cell">
                              <span className="text-sm text-slate-600">{asset.model_number}</span>
                            </td>
                            <td className="px-6 py-4 hidden sm:table-cell">
                              <span className="text-sm text-slate-600">{asset.brand}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="badge bg-slate-100 text-slate-700 text-xs font-medium">
                                {asset.desk_number}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-slate-400" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-slate-400" />
                              )}
                            </td>
                          </motion.tr>
                          {/* Expanded Detail Row */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.tr
                                key={`${asset.id}-detail`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="bg-slate-50/50"
                              >
                                <td colSpan={6} className="px-6 py-4">
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 overflow-hidden"
                                  >
                                    <div>
                                      <p className="text-xs text-slate-400">Serial Number</p>
                                      <p className="text-sm font-medium text-slate-800 font-mono">{asset.serial_number}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-slate-400">Model Number</p>
                                      <p className="text-sm font-medium text-slate-800">{asset.model_number}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-slate-400">Brand</p>
                                      <p className="text-sm font-medium text-slate-800">{asset.brand}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-slate-400">Desk Number</p>
                                      <p className="text-sm font-medium text-slate-800">{asset.desk_number}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-slate-400">Asset Type</p>
                                      <p className="text-sm font-medium text-slate-800">{asset.asset_type}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-slate-400">ID</p>
                                      <p className="text-sm font-medium text-slate-800 font-mono text-xs truncate">{asset.id}</p>
                                    </div>
                                  </motion.div>
                                </td>
                              </motion.tr>
                            )}
                          </AnimatePresence>
                        </Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
