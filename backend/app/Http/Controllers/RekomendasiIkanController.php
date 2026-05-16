<?php

namespace App\Http\Controllers;

use App\Models\DataHistory;
use App\Models\SensorMaster;

class RekomendasiIkanController extends Controller
{
    private array $ikan = [
        [
            'nama' => 'Kerapu',
            'nama_latin' => 'Epinephelus sp.',
            'deskripsi' => 'Ikan laut ekonomis tinggi, cocok untuk keramba jaring apung di perairan pesisir.',
            'gambar' => '🐟',
            'parameter' => [
                'ph' => ['min' => 7.5, 'max' => 8.5, 'bobot' => 0.30],
                'suhu' => ['min' => 24.0, 'max' => 30.0, 'bobot' => 0.30],
                'do' => ['min' => 5.0, 'max' => 8.0, 'bobot' => 0.25],
                'tds' => ['min' => 100.0, 'max' => 400.0, 'bobot' => 0.15],
            ],
        ],
        [
            'nama' => 'Kakap Putih',
            'nama_latin' => 'Lates calcarifer',
            'deskripsi' => 'Ikan yang adaptif terhadap berbagai salinitas, ideal untuk tambak dan keramba pesisir.',
            'gambar' => '🐠',
            'parameter' => [
                'ph' => ['min' => 7.5, 'max' => 8.5, 'bobot' => 0.30],
                'suhu' => ['min' => 25.0, 'max' => 32.0, 'bobot' => 0.30],
                'do' => ['min' => 5.0, 'max' => 9.0, 'bobot' => 0.25],
                'tds' => ['min' => 100.0, 'max' => 500.0, 'bobot' => 0.15],
            ],
        ],
        [
            'nama' => 'Bandeng',
            'nama_latin' => 'Chanos chanos',
            'deskripsi' => 'Ikan euryhaline yang tahan terhadap perubahan kondisi air, sangat cocok untuk tambak pesisir Jepara.',
            'gambar' => '🐡',
            'parameter' => [
                'ph' => ['min' => 7.0, 'max' => 8.5, 'bobot' => 0.30],
                'suhu' => ['min' => 26.0, 'max' => 32.0, 'bobot' => 0.30],
                'do' => ['min' => 4.0, 'max' => 8.0, 'bobot' => 0.25],
                'tds' => ['min' => 100.0, 'max' => 500.0, 'bobot' => 0.15],
            ],
        ],
    ];

    private function hitungSkor(float $value, float $min, float $max, float $bobot): float
    {
        if ($value >= $min && $value <= $max) {
            // Nilai dalam range — hitung kedekatan ke titik tengah
            $mid = ($min + $max) / 2;
            $range = ($max - $min) / 2;
            $skor = 100 - (abs($value - $mid) / $range) * 20;
        } else {
            // Nilai di luar range — hitung deviasi
            $deviasi = $value < $min ? $min - $value : $value - $max;
            $range = $max - $min;
            $skor = max(0, 100 - ($deviasi / $range) * 100);
        }

        return round($skor * $bobot, 4);
    }

    public function rekomendasi()
    {
        // Ambil data sensor terkini
        $sensors = SensorMaster::where('is_active', true)->get();
        $sensorValues = [];

        foreach ($sensors as $sensor) {
            $latest = DataHistory::where('sensor_id', $sensor->id)
                ->orderBy('created_at', 'desc')
                ->first();
            if ($latest) {
                $sensorValues[strtolower($sensor->name)] = $latest->value;
            }
        }

        if (empty($sensorValues)) {
            return response()->json([
                'message' => 'Belum ada data sensor.',
                'rekomendasi' => [],
            ]);
        }

        $hasil = [];

        foreach ($this->ikan as $ikan) {
            $totalSkor = 0;
            $detail = [];

            foreach ($ikan['parameter'] as $param => $config) {
                $value = $sensorValues[$param] ?? null;
                if ($value === null) continue;

                $skor = $this->hitungSkor($value, $config['min'], $config['max'], $config['bobot']);
                $totalSkor += $skor;

                $detail[$param] = [
                    'value' => $value,
                    'min' => $config['min'],
                    'max' => $config['max'],
                    'skor' => round($skor / $config['bobot'], 1),
                    'dalam_range' => $value >= $config['min'] && $value <= $config['max'],
                ];
            }

            $persentase = round($totalSkor, 1);

            if ($persentase >= 80) {
                $status = 'Sangat Direkomendasikan';
                $color = 'emerald';
            } elseif ($persentase >= 60) {
                $status = 'Direkomendasikan';
                $color = 'blue';
            } else {
                $status = 'Kurang Cocok';
                $color = 'red';
            }

            $hasil[] = [
                'nama' => $ikan['nama'],
                'nama_latin' => $ikan['nama_latin'],
                'deskripsi' => $ikan['deskripsi'],
                'gambar' => $ikan['gambar'],
                'persentase' => $persentase,
                'status' => $status,
                'color' => $color,
                'detail' => $detail,
            ];
        }

        // Urutkan berdasarkan persentase tertinggi
        usort($hasil, fn($a, $b) => $b['persentase'] <=> $a['persentase']);

        return response()->json([
            'sensor_values' => $sensorValues,
            'rekomendasi' => $hasil,
        ]);
    }
}