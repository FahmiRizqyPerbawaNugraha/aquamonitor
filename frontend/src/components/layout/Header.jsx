import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Menu, Sun, Moon, LogOut } from 'lucide-react';

export default function Header({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-surface-800/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700/50 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:block">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Selamat datang, {user?.name}
          </h2>
          <p className="text-xs text-slate-400">Sistem Monitoring Kualitas Air IoT</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200"
          title={dark ? 'Mode Terang' : 'Mode Gelap'}
        >
          {dark ? <Sun className="w-[18px] h-[18px] text-amber-400" /> : <Moon className="w-[18px] h-[18px] text-slate-500" />}
        </button>

        {/* Logout */}
        <button
          onClick={logout}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </header>
  );
}
