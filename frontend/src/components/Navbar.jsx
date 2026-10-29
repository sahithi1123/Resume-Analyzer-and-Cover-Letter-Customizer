import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, FileText, LayoutDashboard, LogOut, Menu, X, User, Sun, Moon } from 'lucide-react';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-gray-200 dark:border-gray-800/80 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/customizer" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 p-0.5 shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-white dark:bg-gray-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-gray-900 dark:text-white text-base tracking-tight leading-tight">
              AI Resume <span className="gradient-text-neon">Customizer</span>
            </span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono tracking-wider">
              ATS MATCHING & ENHANCEMENT
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        {isAuthenticated && (
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/customizer"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                isActive('/customizer')
                  ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 font-semibold'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/60'
              }`}
            >
              <FileText className="w-4 h-4" />
              Customizer Studio
            </Link>

            <Link
              to="/dashboard"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                isActive('/dashboard')
                  ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 font-semibold'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              My Resumes
            </Link>
          </nav>
        )}

        {/* Right Controls: Theme Toggle + User / Auth */}
        <div className="hidden md:flex items-center gap-3">
          {/* Light / Dark Mode Toggle Switch */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all flex items-center gap-1.5 text-xs font-mono"
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle Theme"
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden lg:inline text-[11px]">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-cyan-600" />
                <span className="hidden lg:inline text-[11px]">Dark</span>
              </>
            )}
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-700 dark:text-gray-300 font-medium">
                <User className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                <span className="max-w-[120px] truncate">{user?.fullName || user?.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl bg-gray-100 dark:bg-gray-900 hover:bg-rose-500/10 border border-gray-200 dark:border-gray-800 hover:border-rose-500/30 text-gray-600 dark:text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 transition-all"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="px-4 py-2 rounded-xl text-sm font-semibold text-black bg-cyan-400 hover:bg-cyan-300 shadow-md shadow-cyan-500/20 transition-all"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Controls */}
        <div className="flex md:hidden items-center gap-2">
          {/* Mobile Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300"
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-600" />}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-gray-200 dark:border-gray-800 px-4 pt-3 pb-5 space-y-3">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-900 text-xs text-gray-700 dark:text-gray-300">
                <User className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span className="font-semibold">{user?.fullName || user?.email}</span>
              </div>
              <Link
                to="/customizer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <FileText className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                Customizer Studio
              </Link>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <LayoutDashboard className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                My Resumes
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-rose-500 hover:bg-rose-500/10 text-left"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center py-2.5 rounded-xl font-semibold text-black bg-cyan-400"
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
