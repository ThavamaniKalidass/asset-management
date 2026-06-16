import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Bell,
  Sun,
  Moon,
  Menu,
  ChevronDown,
  Settings,
  User,
  HelpCircle,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface NavbarProps {
  onToggleSidebar: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  collapsed: boolean;
}

export default function Navbar({ onToggleSidebar, darkMode, onToggleDarkMode, collapsed }: NavbarProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { user, logout } = useAuth();

  return (
    <header className={`h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-20 flex items-center justify-between px-4 lg:px-6 transition-all duration-300 ${collapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
      {/* Left section */}
      <div className="flex items-center gap-3 lg:gap-6">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors"
        >
          <Menu className="w-5 h-5 text-slate-500" />
        </button>

        {/* SMB Logo */}
        <div className="hidden lg:flex items-center gap-3 mr-2">
          <img
            src="/smb-logo.png"
            alt="Sustainable Medical Billing"
            className="w-14 h-14 rounded-xl object-contain flex-shrink-0"
          />
          <div className="whitespace-nowrap">
            <h1 className="text-sm font-bold text-slate-900 tracking-tight leading-tight">SMB</h1>
            <p className="text-[10px] text-slate-400 leading-tight">Sustainable Medical Billing</p>
          </div>
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 min-w-0 sm:min-w-[260px] lg:min-w-[320px] w-full sm:w-auto transition-all duration-200 focus-within:border-primary-300 focus-within:bg-white focus-within:shadow-glass">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search assets, desks, serial numbers..."
            className="bg-transparent border-none outline-none text-sm text-slate-700 placeholder-slate-400 w-full"
          />
          <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-xs text-slate-400 bg-slate-200 rounded font-mono">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        {/* Dark mode toggle */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onToggleDarkMode}
          className="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? (
            <Sun className="w-4 h-4 text-amber-500" />
          ) : (
            <Moon className="w-4 h-4 text-slate-500" />
          )}
        </motion.button>

        {/* Notifications */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors relative"
        >
          <Bell className="w-4 h-4 text-slate-500" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
        </motion.button>

        {/* Help */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="w-9 h-9 rounded-lg hover:bg-slate-100 hidden sm:flex items-center justify-center transition-colors"
        >
          <HelpCircle className="w-4 h-4 text-slate-500" />
        </motion.button>

        {/* Profile dropdown */}
        <div className="relative">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </span>
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-slate-700">{user?.name || 'Admin User'}</p>
              <p className="text-xs text-slate-400 capitalize">{user?.role || 'Administrator'}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
          </motion.button>

          {showProfileMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowProfileMenu(false)} />
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-elevated border border-slate-200 py-1 z-20"
              >
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-medium text-slate-700">{user?.name || 'Admin User'}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{user?.email || 'admin@company.com'}</p>
                </div>
                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                  <User className="w-4 h-4" />
                  Profile Settings
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                  <Settings className="w-4 h-4" />
                  System Settings
                </button>
                <div className="border-t border-slate-100 mt-1 pt-1">
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
