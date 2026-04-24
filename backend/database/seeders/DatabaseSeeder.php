<?php

namespace Database\Seeders;

use App\Models\ApiKey;
use App\Models\BatteryHistory;
use App\Models\DataHistory;
use App\Models\LocationHistory;
use App\Models\Log;
use App\Models\Prediction;
use App\Models\SensorMaster;
use App\Models\User;
use App\Models\WindHistory;
use App\Services\DSSService;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ============ USERS ============
        $admin = User::create([
            'name' => 'Administrator',
            'email' => 'admin@aquamonitor.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        User::create([
            'name' => 'Operator',
            'email' => 'operator@aquamonitor.com',
            'password' => Hash::make('password'),
            'role' => 'operator',
        ]);

        User::create([
            'name' => 'Pengelola',
            'email' => 'pengelola@aquamonitor.com',
            'password' => Hash::make('password'),
            'role' => 'pengelola',
        ]);

        // ============ API KEY ============
        ApiKey::create([
            'description' => 'Demo API Key untuk perangkat IoT',
            'user_id' => $admin->id,
            'is_active' => true,
        ]);

        // ============ SENSOR MASTER ============
        $sensorPh = SensorMaster::create([
            'name' => 'ph',
            'alias' => 'pH',
            'unit' => '',
            'threshold_min' => 6.5,
            'threshold_max' => 8.5,
        ]);

        $sensorSuhu = SensorMaster::create([
            'name' => 'suhu',
            'alias' => 'Suhu Air',
            'unit' => '°C',
            'threshold_min' => 20,
            'threshold_max' => 30,
        ]);

        $sensorDo = SensorMaster::create([
            'name' => 'do',
            'alias' => 'Dissolved Oxygen',
            'unit' => 'mg/L',
            'threshold_min' => 4,
            'threshold_max' => 14,
        ]);

        $sensorTds = SensorMaster::create([
            'name' => 'tds',
            'alias' => 'Total Dissolved Solids',
            'unit' => 'ppm',
            'threshold_min' => 0,
            'threshold_max' => 500,
        ]);

        $sensors = collect([
            'ph' => $sensorPh,
            'suhu' => $sensorSuhu,
            'do' => $sensorDo,
            'tds' => $sensorTds,
        ]);

        // ============ LOKASI DUMMY ============
        LocationHistory::create([
            'latitude' => -6.9932,
            'longitude' => 110.4203,
            'label' => 'Tambak Ikan UNDIP',
            'device_id' => 'AQUA-001',
        ]);

        // ============ DATA HISTORIS (7 hari, setiap 20 menit) ============
        $deviceId = 'AQUA-001';
        $startTime = Carbon::now()->subDays(7);
        $endTime = Carbon::now();
        $interval = 20; // menit

        $currentTime = $startTime->copy();

        while ($currentTime <= $endTime) {
            $dssInput = [];

            // pH: normalnya 6.5-8.5, variance kecil
            $phVal = round(7.0 + (mt_rand(-150, 150) / 100), 2);
            DataHistory::create([
                'sensor_id' => $sensorPh->id,
                'value' => $phVal,
                'device_id' => $deviceId,
                'created_at' => $currentTime,
                'updated_at' => $currentTime,
            ]);
            $dssInput['ph'] = $phVal;

            // Suhu: 20-30, sedikit variasi berdasarkan waktu
            $hour = $currentTime->hour;
            $baseTemp = 24 + sin($hour / 24 * 2 * M_PI) * 3;
            $suhuVal = round($baseTemp + (mt_rand(-200, 200) / 100), 2);
            DataHistory::create([
                'sensor_id' => $sensorSuhu->id,
                'value' => $suhuVal,
                'device_id' => $deviceId,
                'created_at' => $currentTime,
                'updated_at' => $currentTime,
            ]);
            $dssInput['suhu'] = $suhuVal;

            // DO: 4-14
            $doVal = round(8.0 + (mt_rand(-300, 300) / 100), 2);
            DataHistory::create([
                'sensor_id' => $sensorDo->id,
                'value' => $doVal,
                'device_id' => $deviceId,
                'created_at' => $currentTime,
                'updated_at' => $currentTime,
            ]);
            $dssInput['do'] = $doVal;

            // TDS: 0-500
            $tdsVal = round(200 + mt_rand(-100, 150), 0);
            DataHistory::create([
                'sensor_id' => $sensorTds->id,
                'value' => $tdsVal,
                'device_id' => $deviceId,
                'created_at' => $currentTime,
                'updated_at' => $currentTime,
            ]);
            $dssInput['tds'] = $tdsVal;

            // Baterai (menyusut perlahan)
            $daysPassed = $startTime->diffInDays($currentTime);
            $batteryVal = round(100 - ($daysPassed * 5) + (mt_rand(-200, 200) / 100), 1);
            $batteryVal = max(20, min(100, $batteryVal));
            BatteryHistory::create([
                'value' => $batteryVal,
                'device_id' => $deviceId,
                'created_at' => $currentTime,
                'updated_at' => $currentTime,
            ]);

            // Weather (wind speed opsional)
            WindHistory::create([
                'value' => round(mt_rand(0, 3000) / 100, 2),
                'device_id' => $deviceId,
                'created_at' => $currentTime,
                'updated_at' => $currentTime,
            ]);

            // DSS Prediction
            $dss = DSSService::analisis($dssInput);
            Prediction::create([
                'device_id' => $deviceId,
                'result' => $dss['result'],
                'score' => $dss['score'],
                'model_used' => 'rule_based_dss',
                'detail_parameter' => $dss['detail_parameter'],
                'rekomendasi' => $dss['rekomendasi'],
                'created_at' => $currentTime,
                'updated_at' => $currentTime,
            ]);

            $currentTime->addMinutes($interval);
        }

        // ============ LOG DUMMY ============
        Log::catat($admin->id, 'Sistem pertama kali dijalankan (seeder)');

        echo "Seeder selesai! Data 7 hari berhasil di-generate.\n";
    }
}
