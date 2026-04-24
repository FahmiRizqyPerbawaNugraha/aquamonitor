import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import Modal from '../components/ui/Modal';
import { User, Mail, Shield, KeyRound, ChevronRight, Eye, EyeOff, CheckCircle } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ current_password: '', new_password: '', new_password_confirmation: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await api.put('/profile/password', form);
      setSuccess(res.data.message);
      setForm({ current_password: '', new_password: '', new_password_confirmation: '' });
      setTimeout(() => {
        setModalOpen(false);
        setSuccess('');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengubah password.');
    } finally {
      setLoading(false);
    }
  };

  const roleLabel = {
    admin: 'Administrator',
    pengelola: 'Pengelola',
    operator: 'Operator',
  };

  const roleColor = {
    admin: 'text-violet-500',
    pengelola: 'text-primary-500',
    operator: 'text-slate-500',
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-lg font-bold">Profile</h2>
        <p className="text-sm text-slate-400">Database / Profile</p>
      </div>

      <div className="card p-8">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-primary-500/20 mb-3">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <h3 className="font-bold text-lg">{user?.name}</h3>
          <p className={`text-sm font-medium ${roleColor[user?.role]}`}>{roleLabel[user?.role]}</p>
        </div>

        <button
          onClick={() => { setModalOpen(true); setError(''); setSuccess(''); }}
          className="w-full flex items-center justify-between px-4 py-3.5 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <KeyRound className="w-4 h-4 text-primary-500" />
            </div>
            <span className="font-medium text-sm">Change Password</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      <div className="card p-6">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Profile</h4>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
              <Mail className="w-4 h-4 text-slate-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Email</p>
              <p className="text-sm font-medium truncate">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-slate-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Nama</p>
              <p className="text-sm font-medium">{user?.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
              <Shield className="w-4 h-4 text-slate-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Role</p>
              <p className="text-sm font-medium">{roleLabel[user?.role]}</p>
            </div>
          </div>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Ganti Password">
        {success ? (
          <div className="py-4 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-3">
              <CheckCircle className="w-7 h-7 text-emerald-500" />
            </div>
            <p className="font-semibold text-emerald-600 dark:text-emerald-400">{success}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1.5">Password Lama</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.current_password}
                  onChange={(e) => setForm({ ...form, current_password: e.target.value })}
                  className="input-field pr-10"
                  placeholder="Masukkan password saat ini"
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Password Baru</label>
              <input
                type={showPass ? 'text' : 'password'}
                value={form.new_password}
                onChange={(e) => setForm({ ...form, new_password: e.target.value })}
                className="input-field"
                placeholder="Minimal 6 karakter"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Konfirmasi Password Baru</label>
              <input
                type={showPass ? 'text' : 'password'}
                value={form.new_password_confirmation}
                onChange={(e) => setForm({ ...form, new_password_confirmation: e.target.value })}
                className="input-field"
                placeholder="Ulangi password baru"
                required
                minLength={6}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Batal</button>
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Menyimpan...' : 'Ganti Password'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}