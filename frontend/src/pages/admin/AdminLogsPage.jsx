import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { formatDate } from '../../utils/helpers';
import { PageLoader } from '../../components/ui/Spinner';
import { ScrollText, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AdminLogsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchLogs = async (p = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/admin/logs', { params: { page: p } });
      setData(res.data);
      setPage(p);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLogs(); }, []);

  if (loading && !data) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ScrollText className="w-5 h-5 text-primary-500" />
        <h2 className="text-lg font-bold">Log Aktivitas Sistem</h2>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">User</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Aktivitas</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {data?.data?.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-sm">{log.admin?.name || '-'}</p>
                      <p className="text-xs text-slate-400 font-mono">{log.admin?.email || ''}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">{log.activity}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">{formatDate(log.created_at)}</td>
                </tr>
              ))}
              {(!data?.data || data.data.length === 0) && (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-400">Belum ada log aktivitas.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {data && data.last_page > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-400">Halaman {data.current_page} dari {data.last_page}</p>
            <div className="flex items-center gap-1">
              <button onClick={() => fetchLogs(page - 1)} disabled={page <= 1} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 transition">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => fetchLogs(page + 1)} disabled={page >= data.last_page} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 transition">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
