import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { formatDate } from '../../utils/helpers';
import Modal from '../../components/ui/Modal';
import { PageLoader } from '../../components/ui/Spinner';
import { KeyRound, Plus, ToggleLeft, ToggleRight, Trash2, Copy, CheckCircle, Eye } from 'lucide-react';

export default function AdminApiKeysPage() {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [newSecret, setNewSecret] = useState(null);
  const [copied, setCopied] = useState(false);

  const fetchKeys = async () => {
    try {
      const res = await api.get('/admin/api-keys');
      setKeys(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchKeys(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await api.post('/admin/api-keys', { description });
      setNewSecret(res.data.secret);
      setDescription('');
      fetchKeys();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal membuat API Key.');
    } finally { setCreating(false); }
  };

  const handleToggle = async (key) => {
    try {
      await api.patch(`/admin/api-keys/${key.id}/toggle`);
      fetchKeys();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (key) => {
    if (!confirm(`Hapus API Key "${key.uuid.slice(0, 8)}..."?`)) return;
    try {
      await api.delete(`/admin/api-keys/${key.id}`);
      fetchKeys();
    } catch (err) { console.error(err); }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(newSecret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <KeyRound className="w-5 h-5 text-primary-500" />
          <h2 className="text-lg font-bold">API Keys</h2>
        </div>
        <button onClick={() => { setModalOpen(true); setNewSecret(null); }} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Buat API Key
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">UUID</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Deskripsi</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Secret</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Pembuat</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Dibuat</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {keys.map((key) => (
                <tr key={key.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                  <td className="px-4 py-3 font-mono text-xs">{key.uuid.slice(0, 12)}...</td>
                  <td className="px-4 py-3 text-sm">{key.description}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{key.secret_preview}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                      key.is_active
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {key.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{key.user?.name || '-'}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">{formatDate(key.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleToggle(key)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition" title={key.is_active ? 'Nonaktifkan' : 'Aktifkan'}>
                        {key.is_active
                          ? <ToggleRight className="w-5 h-5 text-emerald-500" />
                          : <ToggleLeft className="w-5 h-5 text-slate-400" />}
                      </button>
                      <button onClick={() => handleDelete(key)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition" title="Hapus">
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {keys.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">Belum ada API Key.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Create */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={newSecret ? 'API Key Berhasil Dibuat' : 'Buat API Key Baru'}>
        {newSecret ? (
          <div className="space-y-4">
            <div className="px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-sm text-amber-700 dark:text-amber-300">
              Simpan secret ini sekarang. Secret tidak akan ditampilkan lagi!
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs font-mono break-all">{newSecret}</code>
              <button onClick={copySecret} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                {copied ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5 text-slate-400" />}
              </button>
            </div>
            <button onClick={() => setModalOpen(false)} className="btn-primary w-full">Selesai</button>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Deskripsi</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-field"
                placeholder="Contoh: Perangkat IoT Tambak 1"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Batal</button>
              <button type="submit" disabled={creating} className="btn-primary">{creating ? 'Membuat...' : 'Buat'}</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
