<?php

namespace App\Console\Commands;

use App\Models\BatteryHistory;
use App\Models\DataHistory;
use App\Models\Prediction;
use App\Models\SensorMaster;
use App\Services\DSSService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;

class SimulasiOtomatis extends Command
{
    protected $signature = 'simulasi:run';
    protected $description = 'Generate data simulasi sensor secara otomatis';

    public function handle()
    {
        $this->info('Simulasi otomatis berjalan... (Ctrl+C untuk berhenti)');

        while (true) {
            $sensors = SensorMaster::where('is_active', true)->get()->keyBy(fn($s) => strtolower($s->name));
            $deviceId = 'AQUA-001';
            $dssInput = [];

           $lastValues = Cache::get('simulasi_last_values', [
    'ph' => 7.8,
    'suhu' => 28.0,
    'do' => 7.5,
    'tds' => 250.0,
]);

           $changes = [
    'ph' => ['min' => 7.5, 'max' => 8.3, 'delta' => 0.03],
    'suhu' => ['min' => 26.0, 'max' => 30.0, 'delta' => 0.05],
    'do' => ['min' => 6.0, 'max' => 9.0, 'delta' => 0.05],
    'tds' => ['min' => 100.0, 'max' => 450.0, 'delta' => 2.0],
];

$newValues = [];

foreach ($changes as $name => $config) {
    $last = $lastValues[$name];
    $direction = mt_rand(0, 1) === 0 ? 1 : -1;
    $change = $direction * (mt_rand(1, 100) / 100) * $config['delta'];
    $newVal = round($last + $change, 2);
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

            Cache::put('simulasi_last_values', $newValues, now()->addHours(2));

            $lastBattery = Cache::get('simulasi_battery', 100.0);
            $newBattery = round(max(20, $lastBattery - (mt_rand(0, 10) / 100)), 1);
            Cache::put('simulasi_battery', $newBattery, now()->addHours(2));

            BatteryHistory::create([
                'value' => $newBattery,
                'device_id' => $deviceId,
            ]);

            $dss = DSSService::analisis($dssInput);
            Prediction::create([
                'device_id' => $deviceId,
                'result' => $dss['result'],
                'score' => $dss['score'],
                'model_used' => 'rule_based_dss',
                'detail_parameter' => $dss['detail_parameter'],
                'rekomendasi' => $dss['rekomendasi'],
            ]);

            $this->info('Data generated: ' . now()->toTimeString() . ' | pH: ' . $newValues['ph']);

            sleep(3); // generate setiap 3 detik
        }
    }
}