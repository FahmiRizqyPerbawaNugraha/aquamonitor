import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard, Activity, Database, Users, Trash2, ScrollText, KeyRound, Sliders, X, Droplets, Fish,
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'operator', 'pengelola'] },
  { to: '/monitoring', label: 'Monitoring Realtime', icon: Activity, roles: ['admin', 'operator', 'pengelola'] },
  { to: '/historis', label: 'Data Historis', icon: Database, roles: ['admin', 'operator', 'pengelola'] },
  { to: '/rekomendasi-ikan', label: 'Rekomendasi Ikan', icon: Fish, roles: ['admin', 'operator', 'pengelola'] },
  { to: '/kalibrasi', label: 'Kalibrasi Sensor', icon: Sliders, roles: ['admin', 'pengelola'] },  { type: 'divider', label: 'Admin', roles: ['admin'] },
  { to: '/admin/users', label: 'Manajemen User', icon: Users, roles: ['admin'] },
  { to: '/admin/data', label: 'Manajemen Data', icon: Trash2, roles: ['admin'] },
  { to: '/admin/logs', label: 'Log Aktivitas', icon: ScrollText, roles: ['admin'] },
  { to: '/admin/api-keys', label: 'API Keys', icon: KeyRound, roles: ['admin'] },
];

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();

  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-72 z-50 bg-white dark:bg-surface-800 border-r border-slate-200 dark:border-slate-700/50 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-slate-200 dark:border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
              <Droplets className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-800 dark:text-white leading-tight">AquaMonitor</h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">IoT Water Quality</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems
            .filter((item) => item.roles.includes(user?.role))
            .map((item, i) => {
              if (item.type === 'divider') {
                return (
                  <div key={i} className="pt-4 pb-2 px-3">
                    <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      {item.label}
                    </p>
                  </div>
                );
              }

              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-800 dark:hover:text-slate-200'
                    }`
                  }
                >
                  <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                  {item.label}
                </NavLink>
              );
            })}
        </nav>

        {/* User info — clickable to profile */}
        <NavLink
          to="/profile"
          onClick={onClose}
          className={({ isActive }) =>
            `block px-4 py-3 border-t border-slate-200 dark:border-slate-700/50 transition-colors ${
              isActive
                ? 'bg-primary-50 dark:bg-primary-900/20'
                : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'
            }`
          }
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-sm font-bold text-primary-600 dark:text-primary-400">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
            </div>
          </div>
        </NavLink>
      </aside>
    </>
  );
}
