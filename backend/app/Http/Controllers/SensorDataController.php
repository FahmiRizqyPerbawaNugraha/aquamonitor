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

        // Weather (opsional)
        if ($request->has('weather') && $request->weather !== null) {
            WindHistory::create([
                'value' => $request->weather,
                'device_id' => $deviceId,
            ]);
        }

        // Baterai (opsional)
        if ($request->has('baterai') && $request->baterai !== null) {
            BatteryHistory::create([
                'value' => $request->baterai,
                'device_id' => $deviceId,
            ]);
        }

        // Lokasi (opsional)
        if ($request->has('latitude') && $request->has('longitude')) {
            LocationHistory::create([
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
                'device_id' => $deviceId,
            ]);
        }

        // DSS Prediction
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
        $query = DataHistory::with('sensor')
            ->orderBy('created_at', 'desc');

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

        // DSS
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
     * POST /api/simulasi — Generate data dummy
     */
    public function simulasi()
    {
        $sensors = SensorMaster::where('is_active', true)->get()->keyBy(fn($s) => strtolower($s->name));
        $deviceId = 'AQUA-001';
        $dssInput = [];

        $ranges = [
            'ph' => [6.0, 9.0],
            'suhu' => [18, 32],
            'do' => [3, 15],
            'tds' => [50, 600],
        ];

        foreach ($ranges as $name => $range) {
            $sensor = $sensors->get($name);
            if ($sensor) {
                $value = round($range[0] + mt_rand() / mt_getrandmax() * ($range[1] - $range[0]), 2);
                DataHistory::create([
                    'sensor_id' => $sensor->id,
                    'value' => $value,
                    'device_id' => $deviceId,
                ]);
                $dssInput[$name] = $value;
            }
        }

        // Baterai
        BatteryHistory::create([
            'value' => round(50 + mt_rand() / mt_getrandmax() * 50, 1),
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
