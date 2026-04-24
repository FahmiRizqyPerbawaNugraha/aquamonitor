import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { formatDate } from '../../utils/helpers';
import { PageLoader } from '../../components/ui/Spinner';
import { Database, Trash2, AlertTriangle, Calendar, Hash } from 'lucide-react';

export default function AdminDataPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dari, setDari] = useState('');
  const [sampai, setSampai] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);
  const [message, setMessage] = useState('');

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/data/statistik');
      setStats(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStats(); }, []);

  const handleHapus = async (e) => {
    e.preventDefault();
    if (!confirm(`Hapus data dari ${dari} sampai ${sampai}?`)) return;
    setDeleting(true);
    setMessage('');
    try {
      const res = await api.post('/admin/data/hapus', { dari, sampai });
      setMessage(res.data.message);
      fetchStats();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Gagal menghapus.');
    } finally { setDeleting(false); }
  };

  const handleHapusSemua = async () => {
    if (!confirm('PERINGATAN: Ini akan menghapus SEMUA data sensor, baterai, weather, dan prediksi. Lanjutkan?')) return;
    if (!confirm('Apakah Anda benar-benar yakin? Tindakan ini tidak dapat dibatalkan!')) return;
    setDeletingAll(true);
    setMessage('');
    try {
      const res = await api.post('/admin/data/hapus-semua');
      setMessage(res.data.message);
      fetchStats();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Gagal menghapus.');
    } finally { setDeletingAll(false); }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Database className="w-5 h-5 text-primary-500" />
        <h2 className="text-lg font-bold">Manajemen Data</h2>
      </div>

      {message && (
        <div className="px-4 py-3 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 text-sm text-primary-700 dark:text-primary-300">
          {message}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Data', value: stats?.total?.toLocaleString() || '0', icon: Hash },
          { label: 'Data Hari Ini', value: stats?.today?.toLocaleString() || '0', icon: Calendar },
          { label: 'Data Terlama', value: stats?.oldest ? formatDate(stats.oldest) : '-', icon: Calendar },
          { label: 'Data Terbaru', value: stats?.newest ? formatDate(stats.newest) : '-', icon: Calendar },
        ].map((s, i) => (
          <div key={i} className="card p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-400 font-medium">{s.label}</span>
              <s.icon className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-lg font-bold font-mono">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Hapus per rentang */}
      <div className="card p-5">
        <h3 className="font-bold mb-3 flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-slate-400" /> Hapus Data per Rentang Tanggal
        </h3>
        <form onSubmit={handleHapus} className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Dari</label>
            <input type="date" value={dari} onChange={(e) => setDari(e.target.value)} className="input-field w-auto" required />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Sampai</label>
            <input type="date" value={sampai} onChange={(e) => setSampai(e.target.value)} className="input-field w-auto" required />
          </div>
          <button type="submit" disabled={deleting} className="btn-danger flex items-center gap-2">
            <Trash2 className="w-4 h-4" /> {deleting ? 'Menghapus...' : 'Hapus Data'}
          </button>
        </form>
      </div>

      {/* Zona Bahaya */}
      <div className="card p-5 border-2 border-red-200 dark:border-red-900/50">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-red-600 dark:text-red-400">Zona Bahaya</h3>
            <p className="text-sm text-slate-400 mt-1 mb-4">
              Menghapus semua data sensor, baterai, weather, dan prediksi secara permanen. Tindakan ini tidak dapat dibatalkan.
            </p>
            <button onClick={handleHapusSemua} disabled={deletingAll} className="btn-danger flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> {deletingAll ? 'Menghapus...' : 'Hapus Semua Data'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
