<?php

namespace App\Http\Controllers;

use App\Models\BatteryHistory;
use App\Models\DataHistory;
use App\Models\Prediction;
use App\Models\SensorMaster;
use App\Services\DSSService;
use Carbon\Carbon;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        $today = Carbon::today();
        $sensors = SensorMaster::where('is_active', true)->get();

        // Data terkini per sensor
        $latestData = [];
        foreach ($sensors as $sensor) {
            $latest = DataHistory::where('sensor_id', $sensor->id)
                ->orderBy('created_at', 'desc')
                ->first();

            if ($latest) {
                $isNormal = $latest->value >= $sensor->threshold_min && $latest->value <= $sensor->threshold_max;
                $latestData[$sensor->name] = [
                    'sensor_id' => $sensor->id,
                    'name' => $sensor->alias,
                    'unit' => $sensor->unit,
                    'value' => $latest->value,
                    'is_normal' => $isNormal,
                    'threshold_min' => $sensor->threshold_min,
                    'threshold_max' => $sensor->threshold_max,
                    'updated_at' => $latest->created_at,
                ];
            }
        }

        // DSS Analysis
        $dssInput = [];
        foreach ($latestData as $key => $d) {
            $dssInput[strtolower($key)] = $d['value'];
        }
        $dss = DSSService::analisis($dssInput);

        // Stats
        $todayCount = DataHistory::whereDate('created_at', $today)->count();
        $totalData = DataHistory::count();
        $battery = BatteryHistory::orderBy('created_at', 'desc')->first();
        $latestPrediction = Prediction::orderBy('created_at', 'desc')->first();

        return response()->json([
            'stats' => [
                'today_readings' => $todayCount,
                'total_data' => $totalData,
                'battery' => $battery ? $battery->value : null,
                'dss_score' => $dss['score'],
                'dss_label' => $dss['label'],
            ],
            'sensors' => $latestData,
            'dss' => $dss,
        ]);
    }

    public function chart(Request $request)
    {
        $jam = (int) $request->get('jam', 24);
        $since = Carbon::now()->subHours($jam);
        $sensors = SensorMaster::where('is_active', true)->get();

        $chartData = [];
        foreach ($sensors as $sensor) {
            $data = DataHistory::where('sensor_id', $sensor->id)
                ->where('created_at', '>=', $since)
                ->orderBy('created_at', 'asc')
                ->get(['value', 'created_at']);

            $chartData[$sensor->name] = [
                'alias' => $sensor->alias,
                'unit' => $sensor->unit,
                'threshold_min' => $sensor->threshold_min,
                'threshold_max' => $sensor->threshold_max,
                'data' => $data->map(fn($d) => [
                    'x' => $d->created_at->toISOString(),
                    'y' => $d->value,
                ]),
            ];
        }

        return response()->json($chartData);
    }
}
