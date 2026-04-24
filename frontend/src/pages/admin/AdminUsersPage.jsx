import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate } from '../../utils/helpers';
import Modal from '../../components/ui/Modal';
import { PageLoader } from '../../components/ui/Spinner';
import { Users, Plus, Pencil, Trash2 } from 'lucide-react';

const emptyForm = { name: '', email: '', password: '', role: 'operator' };

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (user) => {
    setEditing(user);
    setForm({ name: user.name, email: user.email, password: '', role: user.role });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editing) {
        const payload = { name: form.name, email: form.email, role: form.role };
        if (form.password) payload.password = form.password;
        await api.put(`/admin/users/${editing.id}`, payload);
      } else {
        await api.post('/admin/users', form);
      }
      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || JSON.stringify(err.response?.data?.errors) || 'Gagal menyimpan.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user) => {
    if (!confirm(`Hapus user "${user.name}"?`)) return;
    try {
      await api.delete(`/admin/users/${user.id}`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus.');
    }
  };

  if (loading) return <PageLoader />;

  const roleColors = {
    admin: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
    pengelola: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400',
    operator: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-primary-500" />
          <h2 className="text-lg font-bold">Manajemen Pengguna</h2>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Tambah User
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Nama</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Email</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Role</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Dibuat</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                  <td className="px-4 py-3 font-medium">{u.name}</td>
                  <td className="px-4 py-3 text-slate-400 font-mono text-xs">{u.email}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${roleColors[u.role]}`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">{formatDate(u.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(u)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition" title="Edit">
                        <Pencil className="w-4 h-4 text-slate-400" />
                      </button>
                      {u.id !== currentUser.id && (
                        <button onClick={() => handleDelete(u)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition" title="Hapus">
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit User' : 'Tambah User'}>
        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nama</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password {editing && <span className="text-xs text-slate-400">(kosongkan jika tidak diubah)</span>}</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field" {...(!editing && { required: true })} minLength={6} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="input-field">
              <option value="admin">Admin</option>
              <option value="pengelola">Pengelola</option>
              <option value="operator">Operator</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Batal</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Menyimpan...' : 'Simpan'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
