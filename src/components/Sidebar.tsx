import { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  QrCode,
  Search,
  FileText,
  ChevronLeft,
  ChevronRight,
  HardDrive,
  X,
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/assets', label: 'Asset Master', icon: Package },
  { path: '/qr-management', label: 'QR Management', icon: QrCode },
  { path: '/search', label: 'Search & Filter', icon: Search },
  { path: '/reports', label: 'Reports', icon: FileText },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const location = useLocation();

  // Close mobile sidebar on route change
  useEffect(() => {
    onMobileClose();
  }, [location.pathname]);

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-3 overflow-hidden"
            >
              <img
                src="/smb-logo.png"
                alt="Sustainable Medical Billing"
                className="w-14 h-14 rounded-xl object-contain flex-shrink-0"
              />
              <div className="whitespace-nowrap">
                <h1 className="text-sm font-bold text-slate-900 tracking-tight">SMB</h1>
                <p className="text-xs text-slate-400">Sustainable Medical Billing</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex items-center gap-1">
          {/* Mobile close button */}
          <button
            onClick={onMobileClose}
            className="lg:hidden w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
          {/* Desktop toggle button */}
          <button
            onClick={onToggle}
            className="hidden lg:flex w-8 h-8 rounded-lg hover:bg-slate-100 items-center justify-center transition-colors flex-shrink-0"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-slate-400" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                isActive
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              <item.icon
                className={`w-5 h-5 flex-shrink-0 transition-colors ${
                  isActive ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-500'
                }`}
              />
              <AnimatePresence mode="wait">
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="text-sm whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute left-0 w-1 h-6 bg-primary-600 rounded-r-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-slate-100">
        <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">A</span>
          </div>
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-medium text-slate-700 truncate">Admin User</p>
                <p className="text-xs text-slate-400 truncate">admin@company.com</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 80 : 260 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="hidden lg:flex fixed left-0 top-0 h-full bg-white border-r border-slate-200 z-30 flex-col shadow-sm"
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed left-0 top-0 h-full w-[260px] bg-white border-r border-slate-200 z-50 flex flex-col shadow-elevated lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
