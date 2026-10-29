import React from 'react';
import Navbar from './Navbar';
import { useResponsive } from './useResponsive';
import { LayoutDashboard, Sparkles } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function ResponsiveLayout({ children }) {
  const { isMobile } = useResponsive();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0b0f19] text-gray-900 dark:text-gray-100 antialiased selection:bg-cyan-500 selection:text-white transition-colors duration-200">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 pb-20 md:pb-8">
        {children}
      </main>

      {/* Mobile Bottom Quick-Bar (Android & iOS Phones) */}
      {isMobile && isAuthenticated && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-gray-950/90 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 flex items-center justify-around py-2.5 px-4 transition-colors">
          <Link
            to="/customizer"
            className={`flex flex-col items-center gap-1 text-[11px] ${
              isActive('/customizer') ? 'text-cyan-600 dark:text-cyan-400 font-bold' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Studio</span>
          </Link>

          <Link
            to="/dashboard"
            className={`flex flex-col items-center gap-1 text-[11px] ${
              isActive('/dashboard') ? 'text-cyan-600 dark:text-cyan-400 font-bold' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Resumes</span>
          </Link>
        </nav>
      )}
    </div>
  );
}
