import { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import { PageLoader } from '../components/ui/Spinner';

export default function RekomendasiIkanPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const simRef = useRef(null);
  const fetchRef = useRef(null);

  // Parameter ikan untuk simulasi mandiri
  const ikanParams = [
    {
      nama: 'Kerapu',
      nama_latin: 'Epinephelus sp.',
      deskripsi: 'Ikan laut ekonomis tinggi, cocok untuk keramba jaring apung di perairan pesisir.',
      gambar: '🐟',
      parameter: {
        ph: { min: 7.5, max: 8.5, bobot: 0.30 },
        suhu: { min: 24.0, max: 30.0, bobot: 0.30 },
        do: { min: 5.0, max: 8.0, bobot: 0.25 },
        tds: { min: 100.0, max: 400.0, bobot: 0.15 },
      },
    },
    {
      nama: 'Kakap Putih',
      nama_latin: 'Lates calcarifer',
      deskripsi: 'Ikan yang adaptif terhadap berbagai salinitas, ideal untuk tambak dan keramba pesisir.',
      gambar: '🐠',
      parameter: {
        ph: { min: 7.5, max: 8.5, bobot: 0.30 },
        suhu: { min: 25.0, max: 32.0, bobot: 0.30 },
        do: { min: 5.0, max: 9.0, bobot: 0.25 },
        tds: { min: 100.0, max: 500.0, bobot: 0.15 },
      },
    },
    {
      nama: 'Bandeng',
      nama_latin: 'Chanos chanos',
      deskripsi: 'Ikan euryhaline yang tahan terhadap perubahan kondisi air, sangat cocok untuk tambak pesisir Jepara.',
      gambar: '🐡',
      parameter: {
        ph: { min: 7.0, max: 8.5, bobot: 0.30 },
        suhu: { min: 26.0, max: 32.0, bobot: 0.30 },
        do: { min: 4.0, max: 8.0, bobot: 0.25 },
        tds: { min: 100.0, max: 500.0, bobot: 0.15 },
      },
    },
  ];

  // Nilai sensor awal yang natural untuk perairan pesisir Jepara
  const sensorRef = useRef({
    ph: 7.8,
    suhu: 28.0,
    do: 6.5,
    tds: 250.0,
  });

  const hitungSkor = (value, min, max, bobot) => {
    let skor;
    if (value >= min && value <= max) {
      const mid = (min + max) / 2;
      const range = (max - min) / 2;
      skor = 100 - (Math.abs(value - mid) / range) * 20;
    } else {
      const deviasi = value < min ? min - value : value - max;
      const range = max - min;
      skor = Math.max(0, 100 - (deviasi / range) * 100);
    }
    return skor * bobot;
  };

  const hitungRekomendasi = (sensorValues) => {
    const hasil = ikanParams.map((ikan) => {
      let totalSkor = 0;
      const detail = {};

      Object.entries(ikan.parameter).forEach(([param, config]) => {
        const value = sensorValues[param];
        if (value === undefined) return;
        const skor = hitungSkor(value, config.min, config.max, config.bobot);
        totalSkor += skor;
        detail[param] = {
          value,
          min: config.min,
          max: config.max,
          skor: Math.round((skor / config.bobot) * 10) / 10,
          dalam_range: value >= config.min && value <= config.max,
        };
      });

      const persentase = Math.round(totalSkor * 10) / 10;
      let status, color;
      if (persentase >= 80) { status = 'Sangat Direkomendasikan'; color = 'emerald'; }
      else if (persentase >= 60) { status = 'Direkomendasikan'; color = 'blue'; }
      else { status = 'Kurang Cocok'; color = 'red'; }

      return { ...ikan, persentase, status, color, detail };
    });

    hasil.sort((a, b) => b.persentase - a.persentase);
    return hasil;
  };

  // Update nilai sensor secara natural setiap 1 detik
  const updateSensor = () => {
    const deltas = {
      ph: 0.03,
      suhu: 0.15,
      do: 0.1,
      tds: 3.0,
    };
    const ranges = {
      ph: { min: 7.0, max: 8.5 },
      suhu: { min: 26.0, max: 32.0 },
      do: { min: 4.0, max: 9.0 },
      tds: { min: 100.0, max: 500.0 },
    };

    const current = sensorRef.current;
    const newValues = {};

    Object.keys(current).forEach((key) => {
      const change = (Math.random() > 0.5 ? 1 : -1) * Math.random() * deltas[key];
      let newVal = Math.round((current[key] + change) * 100) / 100;
      newVal = Math.max(ranges[key].min, Math.min(ranges[key].max, newVal));
      newValues[key] = newVal;
    });

    sensorRef.current = newValues;

    const rekomendasi = hitungRekomendasi(newValues);
    setData({ sensor_values: newValues, rekomendasi });
    setLoading(false);
  };

  useEffect(() => {
    updateSensor();
    simRef.current = setInterval(updateSensor, 1000);
    return () => { if (simRef.current) clearInterval(simRef.current); };
  }, []);

  const colorMap = {
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      border: 'border-emerald-200 dark:border-emerald-800',
      badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
      bar: 'bg-emerald-500',
      text: 'text-emerald-600 dark:text-emerald-400',
    },
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
      bar: 'bg-blue-500',
      text: 'text-blue-600 dark:text-blue-400',
    },
    red: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
      bar: 'bg-red-400',
      text: 'text-red-600 dark:text-red-400',
    },
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Rekomendasi Ikan</h2>
          <p className="text-sm text-slate-400">
            Berdasarkan kondisi air 
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping"></span>
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
          </div>
          <span className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Live</span>
        </div>
      </div>

      {/* Nilai Sensor Terkini */}
      {data?.sensor_values && (
        <div className="card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Parameter Air Saat Ini
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { key: 'ph', label: 'pH', unit: '' },
              { key: 'suhu', label: 'Suhu Air', unit: '°C' },
              { key: 'do', label: 'Dissolved Oxygen', unit: 'mg/L' },
              { key: 'tds', label: 'Total Dissolved Solids', unit: 'ppm' },
            ].map((s) => (
              <div key={s.key} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3">
                <p className="text-xs text-slate-400 mb-1">{s.label}</p>
                <p className="text-xl font-bold font-mono">
                  {data.sensor_values[s.key] !== undefined
                    ? Number(data.sensor_values[s.key]).toFixed(2)
                    : '-'}
                  <span className="text-xs font-normal text-slate-400 ml-1">{s.unit}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Kartu Rekomendasi Ikan — hanya tampilkan yang terbaik */}
      <div className="space-y-4">
        {data?.rekomendasi?.slice(0, 1).map((ikan, i) => {
          const c = colorMap[ikan.color] || colorMap.blue;
          return (
            <div key={ikan.nama} className={`card p-5 border ${c.border} ${i === 0 ? c.bg : ''}`}>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-500 flex-shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2 mb-1">
                    <span className="text-2xl">{ikan.gambar}</span>
                    <div>
                      <h3 className="font-bold text-base">{ikan.nama}</h3>
                      <p className="text-xs text-slate-400 italic">{ikan.nama_latin}</p>
                    </div>
                    <span className={`ml-auto px-3 py-1 text-xs font-semibold rounded-full ${c.badge}`}>
                      {ikan.status}
                    </span>
                  </div>

                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{ikan.deskripsi}</p>

                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-slate-400">Tingkat Kesesuaian</span>
                      <span className={`text-sm font-bold font-mono ${c.text}`}>{ikan.persentase}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${c.bar} rounded-full transition-all duration-500`}
                        style={{ width: `${ikan.persentase}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                    {Object.entries(ikan.detail).map(([param, d]) => (
                      <div key={param} className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2">
                        <p className="text-[10px] font-semibold uppercase text-slate-400">{param}</p>
                        <p className="text-sm font-mono font-bold">{Number(d.value).toFixed(2)}</p>
                        <p className="text-[10px] text-slate-400">Ideal: {d.min}–{d.max}</p>
                        <span className={`text-[10px] font-semibold ${d.dalam_range ? 'text-emerald-500' : 'text-red-400'}`}>
                          {d.dalam_range ? '✓ Sesuai' : '✗ Di luar range'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-slate-400 text-center">
        * Rekomendasi berdasarkan parameter kualitas air menggunakan metode Decision support system (DSS)
      </p>
    </div>
  );
}