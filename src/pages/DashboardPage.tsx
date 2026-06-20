import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Monitor,
  Cpu,
  HardDrive,
  Speaker,
  Keyboard,
  Mouse,
  Phone,
  Headphones,
  Plus,
  QrCode,
  FileText,
  Download,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { assetsApi } from '@/lib/api';
import type { DashboardStats, Asset } from '@/types';

// ---------- Mini StatCard (inline, self-contained) ----------
interface MiniStatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  colorClasses: {
    bg: string;
    iconBg: string;
    iconText: string;
  };
  index: number;
}

function MiniStatCard({ icon, label, value, colorClasses, index }: MiniStatCardProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 1500;
    const step = Math.ceil(end / (duration / 16));
    if (start === end) {
      setDisplayValue(end);
      return;
    }
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="card-premium p-5 group cursor-default"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-caption text-xs uppercase tracking-wide font-medium">{label}</p>
          <p className="heading-1 mt-1 text-2xl">{displayValue.toLocaleString()}</p>
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colorClasses.iconBg} transition-transform duration-300 group-hover:scale-110`}>
          <div className={colorClasses.iconText}>{icon}</div>
        </div>
      </div>
      <div className={`mt-3 h-1 rounded-full ${colorClasses.bg} bg-opacity-30`}>
        <motion.div
          className={`h-full rounded-full ${colorClasses.bg}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, (value / 20) * 100)}%` }}
          transition={{ delay: 0.5, duration: 1, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>
    </motion.div>
  );
}

// ---------- Mini Skeleton (inline, self-contained) ----------
function SkeletonCard() {
  return (
    <div className="card-premium p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <div className="skeleton h-3 w-20" />
          <div className="skeleton h-7 w-16" />
        </div>
        <div className="skeleton w-11 h-11 rounded-xl" />
      </div>
      <div className="mt-3 skeleton h-1 rounded-full" />
    </div>
  );
}

function SkeletonTableRow() {
  return (
    <div className="flex gap-4 px-4 py-3">
      <div className="skeleton h-4 w-24" />
      <div className="skeleton h-4 w-32" />
      <div className="skeleton h-4 w-40" />
      <div className="skeleton h-4 w-20" />
    </div>
  );
}

function SkeletonChart() {
  return <div className="skeleton h-72 w-full rounded-2xl" />;
}

// ---------- Color configs for each stat category ----------
const statColorConfig: Record<string, { bg: string; iconBg: string; iconText: string }> = {
  'Total Desks': {
    bg: 'bg-primary-600',
    iconBg: 'bg-primary-50',
    iconText: 'text-primary-600',
  },
  'Total Monitors': {
    bg: 'bg-blue-500',
    iconBg: 'bg-blue-50',
    iconText: 'text-blue-500',
  },
  'Total CPUs': {
    bg: 'bg-emerald-600',
    iconBg: 'bg-emerald-50',
    iconText: 'text-emerald-600',
  },
  'Total Thin Clients': {
    bg: 'bg-indigo-600',
    iconBg: 'bg-indigo-50',
    iconText: 'text-indigo-600',
  },
  'Total Speakers': {
    bg: 'bg-amber-500',
    iconBg: 'bg-amber-50',
    iconText: 'text-amber-500',
  },
  'Total Keyboards': {
    bg: 'bg-cyan-600',
    iconBg: 'bg-cyan-50',
    iconText: 'text-cyan-600',
  },
  'Total Mice': {
    bg: 'bg-violet-500',
    iconBg: 'bg-violet-50',
    iconText: 'text-violet-500',
  },
  'Total IP Phones': {
    bg: 'bg-rose-500',
    iconBg: 'bg-rose-50',
    iconText: 'text-rose-500',
  },
  'Total RJ Headsets': {
    bg: 'bg-slate-600',
    iconBg: 'bg-slate-100',
    iconText: 'text-slate-600',
  },
};

// Chart color map
const chartColors: Record<string, string> = {
  Desks: '#6366F1',
  Monitors: '#3B82F6',
  CPUs: '#10B981',
  'Thin Clients': '#6366F1',
  Speakers: '#F59E0B',
  Keyboards: '#06B6D4',
  Mice: '#8B5CF6',
  'IP Phones': '#F43F5E',
  'RJ Headsets': '#64748B',
};

// ---------- Main Dashboard Component ----------
export default function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentAssets, setRecentAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [dashboardStats, recent] = await Promise.all([
          assetsApi.getStats(),
          assetsApi.getRecent(5),
        ]);
        setStats(dashboardStats);
        setRecentAssets(recent);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Transform stats into chart data
  const chartData = stats
    ? [
        { name: 'Desks', value: stats.total_desks },
        { name: 'Monitors', value: stats.total_monitors },
        { name: 'CPUs', value: stats.total_cpus },
        { name: 'Thin Clients', value: stats.total_thin_clients },
        { name: 'Speakers', value: stats.total_speakers },
        { name: 'Keyboards', value: stats.total_keyboards },
        { name: 'Mice', value: stats.total_mice },
        { name: 'IP Phones', value: stats.total_ip_phones },
        { name: 'RJ Headsets', value: stats.total_rj_headsets },
      ]
    : [];

  const statCards = stats
    ? [
        { label: 'Total Desks', value: stats.total_desks, icon: <Monitor className="w-5 h-5" /> },
        { label: 'Total Monitors', value: stats.total_monitors, icon: <Monitor className="w-5 h-5" /> },
        { label: 'Total CPUs', value: stats.total_cpus, icon: <Cpu className="w-5 h-5" /> },
        { label: 'Total Thin Clients', value: stats.total_thin_clients, icon: <HardDrive className="w-5 h-5" /> },
        { label: 'Total Speakers', value: stats.total_speakers, icon: <Speaker className="w-5 h-5" /> },
        { label: 'Total Keyboards', value: stats.total_keyboards, icon: <Keyboard className="w-5 h-5" /> },
        { label: 'Total Mice', value: stats.total_mice, icon: <Mouse className="w-5 h-5" /> },
        { label: 'Total IP Phones', value: stats.total_ip_phones, icon: <Phone className="w-5 h-5" /> },
        { label: 'Total RJ Headsets', value: stats.total_rj_headsets, icon: <Headphones className="w-5 h-5" /> },
      ]
    : [];

  const totalAssets = stats
    ? Object.values(stats).reduce((sum, val) => sum + val, 0)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="space-y-8"
    >
      {/* Page heading */}
      <div>
        <h1 className="heading-1">Dashboard</h1>
        <p className="text-caption mt-1">Overview of your IT asset inventory</p>
      </div>

      {/* Quick action buttons */}
      <button
  onClick={() => navigate('/asset-master')}
  className="btn-primary flex items-center gap-2 text-sm"
>
  <Plus className="w-4 h-4" />
  Add Asset
</button>

<button
  onClick={() => navigate('/qr-management')}
  className="btn-secondary flex items-center gap-2 text-sm"
>
  <QrCode className="w-4 h-4" />
  Scan QR
</button>

<button
  onClick={() => navigate('/reports')}
  className="btn-secondary flex items-center gap-2 text-sm"
>
  <FileText className="w-4 h-4" />
  Generate Report
</button>

<button
  onClick={() => navigate('/reports')}
  className="btn-secondary flex items-center gap-2 text-sm"
>
  <Download className="w-4 h-4" />
  Export Data
</button>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)
          : statCards.map((card, i) => (
              <MiniStatCard
                key={card.label}
                icon={card.icon}
                label={card.label}
                value={card.value}
                colorClasses={statColorConfig[card.label]}
                index={i}
              />
            ))}
      </div>

      {/* Chart + Recent Assets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <div className="card-premium p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="heading-3">Asset Distribution</h3>
              <p className="text-caption text-xs mt-0.5">Count by asset type</p>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="text-2xl font-bold text-slate-900">{totalAssets}</span>
              <span className="text-caption text-xs">total</span>
            </div>
          </div>
          {loading ? (
            <SkeletonChart />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#94A3B8' }}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tickLine={false}
                  interval={0}
                  angle={-30}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94A3B8' }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                    fontSize: '13px',
                  }}
                  labelStyle={{ fontWeight: 600, marginBottom: 4 }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={32}>
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={chartColors[entry.name] || '#6366F1'}
                      className="hover:opacity-80 transition-opacity"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Recent Assets Table */}
        <div className="card-premium p-6">
          <div>
            <h3 className="heading-3">Recent Assets</h3>
            <p className="text-caption text-xs mt-0.5">Latest 5 additions</p>
          </div>
          <div className="mt-4 divide-y divide-slate-100">
            {loading ? (
              <>
                <SkeletonTableRow />
                <SkeletonTableRow />
                <SkeletonTableRow />
                <SkeletonTableRow />
                <SkeletonTableRow />
              </>
            ) : recentAssets.length === 0 ? (
              <p className="text-caption text-center py-8">No assets found.</p>
            ) : (
              recentAssets.map((asset, idx) => (
                <motion.div
                  key={asset.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center gap-3 py-3 px-2 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <Monitor className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">
                      {asset.desk_number}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {asset.asset_type} · {asset.brand} · {asset.model_number}
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}