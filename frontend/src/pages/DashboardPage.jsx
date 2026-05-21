import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../utils/api';
import { formatNumber, dssColor, sensorIcon } from '../utils/helpers';
import TimeSeriesChart from '../components/charts/TimeSeriesChart';
import { PageLoader } from '../components/ui/Spinner';
import {
  BarChart3, Database, BatteryMedium, TrendingUp, AlertTriangle, CheckCircle2, Info,
} from 'lucide-react';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [chartRange, setChartRange] = useState(24);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    console.log('fetching dashboard...', new Date().toLocaleTimeString());
    try {
      const [dashRes, chartRes] = await Promise.all([
        api.get('/dashboard'),
        api.get(`/dashboard/chart?jam=${chartRange}`),
      ]);
      console.log('pH value:', dashRes.data.sensors.ph.value); // ← tambah ini
      setData({...dashRes.data, _ts: Date.now()});
      setChartData({...chartRes.data, _ts: Date.now()});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
}, [chartRange]);

  const intervalRef = useRef(null);

useEffect(() => {
    fetchDashboard();
    
    intervalRef.current = setInterval(() => {
        fetchDashboard();
        console.log('fetching dashboard...', new Date().toLocaleTimeString());
    }, 3000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchDashboard();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
}, [fetchDashboard]);

  if (loading) return <PageLoader />;
  if (!data) return <p className="text-center text-slate-400">Gagal memuat data.</p>;

  const { stats, sensors, dss } = data;
  const dColors = dssColor(dss?.result);

  const statCards = [
    { label: 'Pembacaan Hari Ini', value: stats.today_readings, icon: BarChart3, color: 'text-primary-500' },
    { label: 'Skor DSS', value: formatNumber(stats.dss_score, 1), icon: TrendingUp, color: dColors.text },
    { label: 'Total Data', value: stats.total_data?.toLocaleString(), icon: Database, color: 'text-violet-500' },
    { label: 'Baterai Perangkat', value: stats.battery ? `${formatNumber(stats.battery, 0)}%` : '-', icon: BatteryMedium, color: stats.battery > 30 ? 'text-emerald-500' : 'text-red-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <div key={i} className="card p-4 animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-medium">{s.label}</span>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <p className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* DSS Banner */}
      <div className={`card p-5 ${dColors.light} border-l-4 ${dColors.bg.replace('bg-', 'border-')}`}>
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl ${dColors.bg} flex items-center justify-center flex-shrink-0`}>
            {dss?.result === 'buruk' || dss?.result === 'kurang_baik' ? (
              <AlertTriangle className="w-6 h-6 text-white" />
            ) : (
              <CheckCircle2 className="w-6 h-6 text-white" />
            )}
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium">Status Kualitas Air</p>
            <h3 className={`text-xl font-bold ${dColors.text}`}>{dss?.label}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{dss?.rekomendasi}</p>
            <p className="text-xs text-slate-400 mt-2 font-mono">Skor: {formatNumber(dss?.score, 1)} / 100</p>
          </div>
        </div>
      </div>

      {/* Current Sensor Readings */}
      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Info className="w-4 h-4 text-primary-500" /> Pembacaan Sensor Terkini
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(sensors).map(([key, s], i) => (
            <div key={key} className="card p-4 animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg">{sensorIcon(key)}</span>
                <span className={s.is_normal ? 'badge-normal' : 'badge-abnormal'}>
                  {s.is_normal ? 'Normal' : 'Abnormal'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">{s.name}</p>
              <p className="text-2xl font-bold font-mono mt-1">
                {formatNumber(s.value)} <span className="text-sm font-normal text-slate-400">{s.unit}</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-2 font-mono">
                Batas: {s.threshold_min} – {s.threshold_max} {s.unit}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Chart Range Selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-slate-500">Grafik:</span>
        {[6, 12, 24].map((h) => (
          <button
            key={h}
            onClick={() => setChartRange(h)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              chartRange === h
                ? 'bg-primary-500 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            {h} Jam
          </button>
        ))}
      </div>

      {/* Charts */}
      {chartData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Object.entries(chartData).map(([key, sensor]) => (
            <TimeSeriesChart
              key={key}
              title={`${sensor.alias} (${sensor.unit || key})`}
              unit={sensor.unit}
              thresholdMin={sensor.threshold_min}
              thresholdMax={sensor.threshold_max}
              series={[{ name: sensor.alias, data: sensor.data }]}
              height={260}
            />
          ))}
        </div>
      )}
    </div>
  );
}