import { useState, useEffect } from 'react';
import api from '../utils/api';
import { formatNumber, sensorIcon } from '../utils/helpers';
import { PageLoader } from '../components/ui/Spinner';
import { Sliders, Save, CheckCircle } from 'lucide-react';

export default function KalibrasiPage() {
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [success, setSuccess] = useState(null);
  const [edits, setEdits] = useState({});

  const fetchSensors = async () => {
    try {
      const res = await api.get('/sensor/master');
      setSensors(res.data);
      const initial = {};
      res.data.forEach((s) => {
        initial[s.id] = { threshold_min: s.threshold_min, threshold_max: s.threshold_max };
      });
      setEdits(initial);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSensors(); }, []);

  const handleSave = async (sensor) => {
    const edit = edits[sensor.id];
    if (!edit) return;
    setSaving(sensor.id);
    setSuccess(null);
    try {
      await api.put(`/sensor/master/${sensor.id}`, {
        threshold_min: parseFloat(edit.threshold_min),
        threshold_max: parseFloat(edit.threshold_max),
      });
      setSuccess(sensor.id);
      setTimeout(() => setSuccess(null), 3000);
      fetchSensors();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan.');
    } finally {
      setSaving(null);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Sliders className="w-5 h-5 text-primary-500" />
        <h2 className="text-lg font-bold">Kalibrasi Sensor</h2>
      </div>
      <p className="text-sm text-slate-400">
        Atur batas minimum dan maksimum (threshold) untuk setiap sensor. Nilai di luar batas akan dianggap abnormal.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sensors.map((sensor) => {
          const edit = edits[sensor.id] || {};
          return (
            <div key={sensor.id} className="card p-5 animate-slide-up">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{sensorIcon(sensor.name)}</span>
                  <div>
                    <h3 className="font-bold">{sensor.alias}</h3>
                    <p className="text-xs text-slate-400 font-mono">{sensor.name} {sensor.unit ? `(${sensor.unit})` : ''}</p>
                  </div>
                </div>
                {success === sensor.id && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-emerald-500">
                    <CheckCircle className="w-4 h-4" /> Tersimpan
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Threshold Min</label>
                  <input
                    type="number"
                    step="any"
                    value={edit.threshold_min ?? ''}
                    onChange={(e) => setEdits({ ...edits, [sensor.id]: { ...edit, threshold_min: e.target.value } })}
                    className="input-field font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Threshold Max</label>
                  <input
                    type="number"
                    step="any"
                    value={edit.threshold_max ?? ''}
                    onChange={(e) => setEdits({ ...edits, [sensor.id]: { ...edit, threshold_max: e.target.value } })}
                    className="input-field font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-[11px] text-slate-400">
                  Saat ini: {formatNumber(sensor.threshold_min)} – {formatNumber(sensor.threshold_max)} {sensor.unit}
                </p>
                <button
                  onClick={() => handleSave(sensor)}
                  disabled={saving === sensor.id}
                  className="btn-primary flex items-center gap-2 text-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  {saving === sensor.id ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
