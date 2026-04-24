<?php

namespace App\Services;

use App\Models\SensorMaster;

class DSSService
{
    /**
     * Hitung skor per sensor (0-100) berdasarkan deviasi dari nilai tengah batas normal.
     */
    public static function hitungSkorSensor(float $value, float $min, float $max): float
    {
        $midpoint = ($min + $max) / 2;
        $range = ($max - $min) / 2;

        if ($range == 0) return 50;

        $deviation = abs($value - $midpoint);
        $score = max(0, 100 - ($deviation / $range) * 100);

        return round($score, 2);
    }

    /**
     * Klasifikasi berdasarkan skor rata-rata.
     */
    public static function klasifikasi(float $score): string
    {
        if ($score >= 85) return 'sangat_baik';
        if ($score >= 70) return 'baik';
        if ($score >= 55) return 'cukup_baik';
        if ($score >= 40) return 'kurang_baik';
        return 'buruk';
    }

    /**
     * Rekomendasi berdasarkan klasifikasi.
     */
    public static function rekomendasi(string $klasifikasi): string
    {
        return match ($klasifikasi) {
            'sangat_baik' => 'Sangat cocok untuk budidaya ikan air tawar.',
            'baik' => 'Cocok untuk budidaya ikan air tawar.',
            'cukup_baik' => 'Cukup cocok, kualitas air perlu diawasi ketat.',
            'kurang_baik' => 'Tidak cocok untuk budidaya. Direkomendasikan untuk irigasi.',
            'buruk' => 'Tidak layak digunakan. Perlu penanganan segera.',
            default => 'Data tidak mencukupi untuk analisis.',
        };
    }

    /**
     * Label tampilan klasifikasi.
     */
    public static function label(string $klasifikasi): string
    {
        return match ($klasifikasi) {
            'sangat_baik' => 'Sangat Baik',
            'baik' => 'Baik',
            'cukup_baik' => 'Cukup Baik',
            'kurang_baik' => 'Kurang Baik',
            'buruk' => 'Buruk',
            default => '-',
        };
    }

    /**
     * Analisis lengkap dari array data sensor.
     * $data = ['ph' => 7.0, 'suhu' => 25, 'do' => 8, 'tds' => 200]
     */
    public static function analisis(array $data): array
    {
        $sensors = SensorMaster::where('is_active', true)->get();
        $details = [];
        $totalScore = 0;
        $count = 0;

        foreach ($sensors as $sensor) {
            $key = strtolower($sensor->name);
            if (!isset($data[$key])) continue;

            $value = (float) $data[$key];
            $score = self::hitungSkorSensor($value, $sensor->threshold_min, $sensor->threshold_max);
            $isNormal = $value >= $sensor->threshold_min && $value <= $sensor->threshold_max;

            $details[$key] = [
                'sensor_id' => $sensor->id,
                'name' => $sensor->alias,
                'value' => $value,
                'unit' => $sensor->unit,
                'threshold_min' => $sensor->threshold_min,
                'threshold_max' => $sensor->threshold_max,
                'score' => $score,
                'is_normal' => $isNormal,
            ];

            $totalScore += $score;
            $count++;
        }

        $avgScore = $count > 0 ? round($totalScore / $count, 2) : 0;
        $result = self::klasifikasi($avgScore);

        return [
            'score' => $avgScore,
            'result' => $result,
            'label' => self::label($result),
            'rekomendasi' => self::rekomendasi($result),
            'detail_parameter' => $details,
        ];
    }
}
