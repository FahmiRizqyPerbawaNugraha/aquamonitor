import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../utils/api';
import { formatNumber, dssColor, sensorIcon } from '../utils/helpers';
import TimeSeriesChart from '../components/charts/TimeSeriesChart';
import { PageLoader } from '../components/ui/Spinner';
import { Play, Pause, Zap, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function MonitoringPage() {
  const [sensors, setSensors] = useState([]);
  const [dss, setDss] = useState(null);
  const [chartHistory, setChartHistory] = useState({});
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [intervalVal, setIntervalVal] = useState(5);
  const pollingRef = useRef(null);
  const simRef = useRef(null);

  const fetchLatest = useCallback(async () => {
    try {
      const res = await api.get('/sensor-data/terbaru');
      setSensors(res.data.sensors);
      setDss(res.data.dss);

      setChartHistory((prev) => {
        const updated = { ...prev };
        res.data.sensors.forEach((s) => {
          if (s.value !== null) {
            const key = s.name;
            if (!updated[key]) {
              updated[key] = {
                alias: s.alias,
                unit: s.unit,
                threshold_min: s.threshold_min,
                threshold_max: s.threshold_max,
                data: [],
              };
            }
            const ts = s.updated_at || new Date().toISOString();
            const lastPoint = updated[key].data[updated[key].data.length - 1];
            if (!lastPoint || lastPoint.x !== ts) {
              updated[key].data = [...updated[key].data.slice(-49), { x: ts, y: s.value }];
            }
          }
        });
        return updated;
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSimulasi = useCallback(async () => {
    try {
      await api.post('/simulasi');
      await fetchLatest();
    } catch (err) {
      console.error(err);
    }
  }, [fetchLatest]);

  // Polling fetch data terbaru
  useEffect(() => {
    fetchLatest();
  }, [fetchLatest]);

  useEffect(() => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    if (playing) {
      pollingRef.current = setInterval(fetchLatest, intervalVal * 1000);
    }
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [playing, intervalVal, fetchLatest]);

  // Auto simulasi berjalan otomatis setiap 3 detik
  useEffect(() => {
    simRef.current = setInterval(async () => {
      await handleSimulasi();
    }, 1000);
    return () => { if (simRef.current) clearInterval(simRef.current); };
  }, [handleSimulasi]);

  if (loading) return <PageLoader />;

  const dColors = dss ? dssColor(dss.result) : dssColor('baik');

  return (
    <div className="space-y-6">
      {/* Live indicator */}
      <div className="flex items-center gap-2">
        <div className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping"></span>
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
        </div>
        <span className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Live</span>
      </div>

      {/* DSS Banner */}
      {dss && (
        <div className={`card p-4 ${dColors.light} border-l-4 ${dColors.bg.replace('bg-', 'border-')}`}>
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl ${dColors.bg} flex items-center justify-center flex-shrink-0`}>
              {dss.result === 'buruk' || dss.result === 'kurang_baik' ? (
                <AlertTriangle className="w-5 h-5 text-white" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-white" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <span className={`text-lg font-bold ${dColors.text}`}>{dss.label}</span>
                <span className="text-xs font-mono text-slate-400">Skor: {formatNumber(dss.score, 1)}</span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">{dss.rekomendasi}</p>
            </div>
          </div>
        </div>
      )}

      {/* Sensor Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {sensors.map((s, i) => (
          <div
            key={s.sensor_id}
            className="card p-4 animate-slide-up relative overflow-hidden"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="absolute top-3 right-3">
              <div className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping"></span>
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{sensorIcon(s.name)}</span>
              <span className="text-xs font-medium text-slate-400">{s.alias}</span>
            </div>
            <p className="text-3xl font-bold font-mono">
              {s.value !== null ? formatNumber(s.value) : '-'}
            </p>
            <p className="text-xs text-slate-400 font-mono">{s.unit}</p>
            <div className="mt-3">
              <span className={s.is_normal ? 'badge-normal' : 'badge-abnormal'}>
                {s.is_normal ? 'Normal' : 'Abnormal'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">
              Batas: {s.threshold_min} – {s.threshold_max}
            </p>
          </div>
        ))}
      </div>

      {/* Live Charts */}
      {Object.keys(chartHistory).length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Object.entries(chartHistory).map(([key, sensor]) => (
            <TimeSeriesChart
              key={key}
              title={`${sensor.alias} (Live)`}
              unit={sensor.unit}
              thresholdMin={sensor.threshold_min}
              thresholdMax={sensor.threshold_max}
              series={[{ name: sensor.alias, data: sensor.data }]}
              height={240}
            />
          ))}
        </div>
      )}
    </div>
  );
}