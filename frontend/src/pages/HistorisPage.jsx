import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { formatDate, formatNumber } from '../utils/helpers';
import { PageLoader } from '../components/ui/Spinner';
import { Download, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

export default function HistorisPage() {
  const { canExport } = useAuth();
  const [data, setData] = useState(null);
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ dari: '', sampai: '', sensor_id: '' });
  const [page, setPage] = useState(1);

  const fetchSensors = async () => {
    try {
      const res = await api.get('/sensor-data/terbaru');
      setSensors(res.data.sensors || []);
    } catch (_) {}
  };

  const fetchData = async (p = 1) => {
    setLoading(true);
    try {
      const params = { page: p, per_page: 20 };
      if (filters.dari) params.dari = filters.dari;
      if (filters.sampai) params.sampai = filters.sampai;
      if (filters.sensor_id) params.sensor_id = filters.sensor_id;
      const res = await api.get('/sensor-data', { params });
      setData(res.data);
      setPage(p);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSensors(); fetchData(); }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    fetchData(1);
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.dari) params.append('dari', filters.dari);
      if (filters.sampai) params.append('sampai', filters.sampai);
      if (filters.sensor_id) params.append('sensor_id', filters.sensor_id);

      const res = await api.get(`/export/csv?${params.toString()}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `aquamonitor_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-bold">Data Historis Sensor</h2>
        {canExport && (
          <button onClick={handleExport} className="btn-primary flex items-center gap-2">
            <Download className="w-4 h-4" /> Download CSV
          </button>
        )}
      </div>

      {/* Filters */}
      <form onSubmit={handleFilter} className="card p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Tanggal Mulai</label>
            <input type="date" value={filters.dari} onChange={(e) => setFilters({ ...filters, dari: e.target.value })} className="input-field w-auto" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Tanggal Akhir</label>
            <input type="date" value={filters.sampai} onChange={(e) => setFilters({ ...filters, sampai: e.target.value })} className="input-field w-auto" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Sensor</label>
            <select value={filters.sensor_id} onChange={(e) => setFilters({ ...filters, sensor_id: e.target.value })} className="input-field w-auto">
              <option value="">Semua Sensor</option>
              {sensors.map((s) => (
                <option key={s.sensor_id} value={s.sensor_id}>{s.alias}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn-secondary flex items-center gap-2">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>
      </form>

      {/* Table */}
      {loading ? (
        <PageLoader />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">ID</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Sensor</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Nilai</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Device</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {data?.data?.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">{row.id}</td>
                    <td className="px-4 py-3 font-medium">{row.sensor_name}</td>
                    <td className="px-4 py-3 text-right font-mono font-semibold">{formatNumber(row.value)} <span className="text-xs text-slate-400">{row.sensor_unit}</span></td>
                    <td className="px-4 py-3 text-center">
                      <span className={row.is_normal ? 'badge-normal' : 'badge-abnormal'}>
                        {row.is_normal ? 'Normal' : 'Abnormal'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{row.device_id}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">{formatDate(row.created_at)}</td>
                  </tr>
                ))}
                {(!data?.data || data.data.length === 0) && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Tidak ada data.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data && data.last_page > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-400">
                Halaman {data.current_page} dari {data.last_page} ({data.total} data)
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => fetchData(page - 1)} disabled={page <= 1} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 transition">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => fetchData(page + 1)} disabled={page >= data.last_page} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 transition">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
