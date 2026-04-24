import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Droplets, Eye, EyeOff, Sun, Moon } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login gagal. Periksa email dan password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-900 px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      {/* Theme toggle */}
      <button onClick={toggle} className="absolute top-4 right-4 p-2.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition z-10">
        {dark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-500" />}
      </button>

      <div className="w-full max-w-md relative animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/25 mb-4">
            <Droplets className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">AquaMonitor</h1>
          <p className="text-sm text-slate-400 mt-1">Sistem Monitoring Kualitas Air IoT</p>
        </div>

        {/* Form */}
        <div className="card p-8">
          <h2 className="text-lg font-bold mb-6">Masuk ke Dashboard</h2>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="admin@aquamonitor.com"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium">Password</label>
                <Link to="/forgot-password" className="text-xs text-primary-500 hover:text-primary-600 font-medium">
                  Lupa password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-400 mb-3 text-center">Akun Demo (password: <span className="font-mono">password</span>)</p>
            <div className="flex gap-2">
              {[
                { email: 'admin@aquamonitor.com', label: 'Admin' },
                { email: 'operator@aquamonitor.com', label: 'Operator' },
                { email: 'pengelola@aquamonitor.com', label: 'Pengelola' },
              ].map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => { setEmail(acc.email); setPassword('password'); }}
                  className="flex-1 py-2 px-2 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition text-center"
                >
                  {acc.label}
                </button>
              ))}
            </div>
          </div>

          {/* Register link */}
          <div className="mt-4 text-center">
            <p className="text-sm text-slate-400">
              Belum punya akun?{' '}
              <Link to="/register" className="text-primary-500 hover:text-primary-600 font-semibold">
                Daftar sekarang
              </Link>
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-400 text-center mt-6">Capstone Project — Universitas Diponegoro</p>
      </div>
    </div>
  );
}
