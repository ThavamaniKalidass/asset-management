import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Apply/remove 'dark' class on document.documentElement
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Sidebar — desktop: toggle collapsed, mobile: overlay drawer */}
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Navbar at top */}
      <Navbar
        collapsed={collapsed}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onToggleSidebar={() => setMobileOpen(true)}
      />

      {/* Main content area — margin-left adjusts to sidebar width */}
      <main
        className={`
          pt-16 pb-8 px-4 sm:px-6 lg:px-8 transition-all duration-300
          ${collapsed ? 'lg:ml-20' : 'lg:ml-64'}
          ml-0
        `}
      >
        <Outlet />
      </main>
    </div>
  );
}
