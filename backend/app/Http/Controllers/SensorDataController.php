<?php

namespace App\Http\Controllers;

use App\Models\BatteryHistory;
use App\Models\DataHistory;
use App\Models\LocationHistory;
use App\Models\Prediction;
use App\Models\SensorMaster;
use App\Models\WindHistory;
use App\Services\DSSService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class SensorDataController extends Controller
{
    /**
     * POST /api/sensor-data — Terima data dari perangkat IoT
     */
    public function store(Request $request)
    {
        $request->validate([
            'ph' => 'nullable|numeric',
            'suhu' => 'nullable|numeric',
            'do' => 'nullable|numeric',
            'tds' => 'nullable|numeric',
            'weather' => 'nullable|numeric',
            'baterai' => 'nullable|numeric',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'device_id' => 'nullable|string',
        ]);

        $deviceId = $request->get('device_id', 'AQUA-001');
        $sensors = SensorMaster::where('is_active', true)->get()->keyBy(fn($s) => strtolower($s->name));
        $sensorData = [];
        $dssInput = [];

        $mappings = ['ph' => 'ph', 'suhu' => 'suhu', 'do' => 'do', 'tds' => 'tds'];

        foreach ($mappings as $inputKey => $sensorName) {
            if ($request->has($inputKey) && $request->$inputKey !== null) {
                $sensor = $sensors->get($sensorName);
                if ($sensor) {
                    $record = DataHistory::create([
                        'sensor_id' => $sensor->id,
                        'value' => $request->$inputKey,
                        'device_id' => $deviceId,
                    ]);
                    $sensorData[] = $record;
                    $dssInput[$sensorName] = $request->$inputKey;
                }
            }
        }

        if ($request->has('weather') && $request->weather !== null) {
            WindHistory::create(['value' => $request->weather, 'device_id' => $deviceId]);
        }

        if ($request->has('baterai') && $request->baterai !== null) {
            BatteryHistory::create(['value' => $request->baterai, 'device_id' => $deviceId]);
        }

        if ($request->has('latitude') && $request->has('longitude')) {
            LocationHistory::create([
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
                'device_id' => $deviceId,
            ]);
        }

        $dss = null;
        if (count($dssInput) > 0) {
            $dss = DSSService::analisis($dssInput);
            Prediction::create([
                'device_id' => $deviceId,
                'result' => $dss['result'],
                'score' => $dss['score'],
                'model_used' => 'rule_based_dss',
                'detail_parameter' => $dss['detail_parameter'],
                'rekomendasi' => $dss['rekomendasi'],
            ]);
        }

        return response()->json([
            'message' => 'Data sensor berhasil diterima.',
            'stored' => count($sensorData),
            'dss' => $dss,
        ], 201);
    }

    /**
     * GET /api/sensor-data — Riwayat data (paginated, filterable)
     */
    public function index(Request $request)
    {
        $query = DataHistory::with('sensor')->orderBy('created_at', 'desc');

        if ($request->filled('sensor_id')) {
            $query->where('sensor_id', $request->sensor_id);
        }
        if ($request->filled('dari')) {
            $query->whereDate('created_at', '>=', $request->dari);
        }
        if ($request->filled('sampai')) {
            $query->whereDate('created_at', '<=', $request->sampai);
        }

        $perPage = (int) $request->get('per_page', 20);
        $data = $query->paginate($perPage);

        $data->getCollection()->transform(function ($item) {
            $sensor = $item->sensor;
            $item->sensor_name = $sensor ? $sensor->alias : '-';
            $item->sensor_unit = $sensor ? $sensor->unit : '';
            $item->is_normal = $sensor
                ? ($item->value >= $sensor->threshold_min && $item->value <= $sensor->threshold_max)
                : null;
            return $item;
        });

        return response()->json($data);
    }

    /**
     * GET /api/sensor-data/terbaru — Data terkini semua sensor
     */
    public function terbaru()
    {
        $sensors = SensorMaster::where('is_active', true)->get();
        $result = [];

        foreach ($sensors as $sensor) {
            $latest = DataHistory::where('sensor_id', $sensor->id)
                ->orderBy('created_at', 'desc')
                ->first();

            $result[] = [
                'sensor_id' => $sensor->id,
                'name' => $sensor->name,
                'alias' => $sensor->alias,
                'unit' => $sensor->unit,
                'value' => $latest ? $latest->value : null,
                'is_normal' => $latest
                    ? ($latest->value >= $sensor->threshold_min && $latest->value <= $sensor->threshold_max)
                    : null,
                'threshold_min' => $sensor->threshold_min,
                'threshold_max' => $sensor->threshold_max,
                'updated_at' => $latest ? $latest->created_at : null,
            ];
        }

        $dssInput = [];
        foreach ($result as $s) {
            if ($s['value'] !== null) {
                $dssInput[strtolower($s['name'])] = $s['value'];
            }
        }
        $dss = DSSService::analisis($dssInput);

        return response()->json([
            'sensors' => $result,
            'dss' => $dss,
        ]);
    }

    /**
     * POST /api/simulasi — Generate data dummy yang berubah secara natural
     */
    public function simulasi()
    {
        $sensors = SensorMaster::where('is_active', true)->get()->keyBy(fn($s) => strtolower($s->name));
        $deviceId = 'AQUA-001';
        $dssInput = [];

        // Ambil nilai terakhir dari cache untuk perubahan natural
        $lastValues = Cache::get('simulasi_last_values', [
            'ph' => 7.0,
            'suhu' => 25.0,
            'do' => 8.0,
            'tds' => 200.0,
        ]);

        // Perubahan gradual yang logis per sensor
        $changes = [
            'ph' => ['min' => 6.3, 'max' => 7.5, 'delta' => 0.5],
            'suhu' => ['min' => 18.0, 'max' => 26.0, 'delta' => 0.3],
            'do' => ['min' => 3.0, 'max' => 13.0, 'delta' => 0.2],
            'tds' => ['min' => 50.0, 'max' => 250.0, 'delta' => 5.0],
        ];

        $newValues = [];

        foreach ($changes as $name => $config) {
            $last = $lastValues[$name];
            // Perubahan naik atau turun secara natural
            $change = (mt_rand(0, 1) === 0 ? 5 : -1) * (mt_rand(0, 100) / 100) * $config['delta'];
            $newVal = round($last + $change, 2);
            // Pastikan dalam range
            $newVal = max($config['min'], min($config['max'], $newVal));
            $newValues[$name] = $newVal;

            $sensor = $sensors->get($name);
            if ($sensor) {
                DataHistory::create([
                    'sensor_id' => $sensor->id,
                    'value' => $newVal,
                    'device_id' => $deviceId,
                ]);
                $dssInput[$name] = $newVal;
            }
        }

        // Simpan nilai baru ke cache untuk simulasi berikutnya
        Cache::put('simulasi_last_values', $newValues, now()->addHours(2));

        // Baterai turun perlahan
        $lastBattery = Cache::get('simulasi_battery', 100.0);
        $newBattery = round(max(20, $lastBattery - (mt_rand(0, 10) / 100)), 1);
        Cache::put('simulasi_battery', $newBattery, now()->addHours(2));

        BatteryHistory::create([
            'value' => $newBattery,
            'device_id' => $deviceId,
        ]);

        // DSS
        $dss = DSSService::analisis($dssInput);
        Prediction::create([
            'device_id' => $deviceId,
            'result' => $dss['result'],
            'score' => $dss['score'],
            'model_used' => 'rule_based_dss',
            'detail_parameter' => $dss['detail_parameter'],
            'rekomendasi' => $dss['rekomendasi'],
        ]);

        return response()->json([
            'message' => 'Data simulasi berhasil di-generate.',
            'dss' => $dss,
            'data' => $dssInput,
        ], 201);
    }
}