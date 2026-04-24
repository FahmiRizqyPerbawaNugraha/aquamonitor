import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Droplets, Eye, EyeOff, Sun, Moon, UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrors({});
    setLoading(true);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          setErrors(data.errors);
          const firstErr = Object.values(data.errors)[0];
          setError(Array.isArray(firstErr) ? firstErr[0] : firstErr);
        } else {
          setError(data.message || 'Registrasi gagal.');
        }
        return;
      }

      // Auto login setelah register
      localStorage.setItem('aqua_token', data.token);
      localStorage.setItem('aqua_user', JSON.stringify(data.user));
      window.location.href = '/';
    } catch (err) {
      setError('Terjadi kesalahan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-900 px-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl translate-y-1/2 translate-x-1/2" />

      <button onClick={toggle} className="absolute top-4 right-4 p-2.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition z-10">
        {dark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-500" />}
      </button>

      <div className="w-full max-w-md relative animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/25 mb-4">
            <Droplets className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">AquaMonitor</h1>
          <p className="text-sm text-slate-400 mt-1">Buat Akun Baru</p>
        </div>

        <div className="card p-8">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary-500" /> Daftar
          </h2>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Nama Lengkap</label>
              <input
                type="text" name="name" value={form.name} onChange={handleChange}
                className={`input-field ${errors.name ? 'ring-2 ring-red-400' : ''}`}
                placeholder="Masukkan nama lengkap" required
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name[0]}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input
                type="email" name="email" value={form.email} onChange={handleChange}
                className={`input-field ${errors.email ? 'ring-2 ring-red-400' : ''}`}
                placeholder="contoh@email.com" required
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email[0]}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange}
                  className={`input-field pr-10 ${errors.password ? 'ring-2 ring-red-400' : ''}`}
                  placeholder="Minimal 6 karakter" required minLength={6}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password[0]}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Konfirmasi Password</label>
              <input
                type={showPass ? 'text' : 'password'} name="password_confirmation" value={form.password_confirmation} onChange={handleChange}
                className="input-field" placeholder="Ulangi password" required minLength={6}
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Mendaftarkan...' : 'Daftar'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 text-center">
            <p className="text-sm text-slate-400">
              Sudah punya akun?{' '}
              <Link to="/login" className="text-primary-500 hover:text-primary-600 font-semibold">
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-400 text-center mt-6">Capstone Project — Universitas Diponegoro</p>
      </div>
    </div>
  );
}
