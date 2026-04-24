import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../utils/api';
import { formatNumber, dssColor, sensorIcon } from '../utils/helpers';
import TimeSeriesChart from '../components/charts/TimeSeriesChart';
import { PageLoader } from '../components/ui/Spinner';
import {
  Play, Pause, RefreshCw, Zap, AlertTriangle, CheckCircle2,
} from 'lucide-react';

export default function MonitoringPage() {
  const [sensors, setSensors] = useState([]);
  const [dss, setDss] = useState(null);
  const [chartHistory, setChartHistory] = useState({});
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [interval, setIntervalVal] = useState(5);
  const [simulating, setSimulating] = useState(false);
  const timerRef = useRef(null);

  const fetchLatest = useCallback(async () => {
    try {
      const res = await api.get('/sensor-data/terbaru');
      setSensors(res.data.sensors);
      setDss(res.data.dss);

      // Append to chart history (keep max 50 points)
      setChartHistory((prev) => {
        const updated = { ...prev };
        res.data.sensors.forEach((s) => {
          if (s.value !== null) {
            const key = s.name;
            if (!updated[key]) {
              updated[key] = { alias: s.alias, unit: s.unit, threshold_min: s.threshold_min, threshold_max: s.threshold_max, data: [] };
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

  useEffect(() => {
    fetchLatest();
  }, [fetchLatest]);

  useEffect(() => {
    if (playing) {
      timerRef.current = window.setInterval(fetchLatest, interval * 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [playing, interval, fetchLatest]);

  const handleSimulasi = async () => {
    setSimulating(true);
    try {
      await api.post('/simulasi');
      await fetchLatest();
    } catch (err) {
      console.error(err);
    } finally {
      setSimulating(false);
    }
  };

  if (loading) return <PageLoader />;

  const dColors = dss ? dssColor(dss.result) : dssColor('baik');

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div className="live-dot" />
          <span className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Live</span>
        </div>

        <button
          onClick={() => setPlaying(!playing)}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition ${
            playing ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-600' : 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600'
          }`}
        >
          {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {playing ? 'Pause' : 'Play'}
        </button>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-xl p-1">
          {[3, 5, 10].map((s) => (
            <button
              key={s}
              onClick={() => setIntervalVal(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                interval === s ? 'bg-primary-500 text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {s}s
            </button>
          ))}
        </div>

        <button onClick={handleSimulasi} disabled={simulating} className="btn-primary flex items-center gap-2 ml-auto">
          <Zap className="w-4 h-4" />
          {simulating ? 'Generating...' : 'Simulasi Data'}
        </button>
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
          <div key={s.sensor_id} className="card p-4 animate-slide-up relative overflow-hidden" style={{ animationDelay: `${i * 60}ms` }}>
            {/* Pulse indicator */}
            {playing && (
              <div className="absolute top-3 right-3">
                <div className="live-dot" />
              </div>
            )}
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
