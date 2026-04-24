<?php

namespace App\Http\Controllers;

use App\Models\DataHistory;
use App\Models\Log;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportController extends Controller
{
    public function csv(Request $request)
    {
        Log::catat($request->user()->id, 'Download CSV data sensor');

        $query = DataHistory::with('sensor')->orderBy('created_at', 'desc');

        if ($request->filled('dari')) {
            $query->whereDate('created_at', '>=', $request->dari);
        }
        if ($request->filled('sampai')) {
            $query->whereDate('created_at', '<=', $request->sampai);
        }
        if ($request->filled('sensor_id')) {
            $query->where('sensor_id', $request->sensor_id);
        }

        $data = $query->get();

        $response = new StreamedResponse(function () use ($data) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['ID', 'Sensor', 'Nilai', 'Unit', 'Status', 'Device', 'Waktu']);

            foreach ($data as $row) {
                $sensor = $row->sensor;
                $isNormal = $sensor
                    ? ($row->value >= $sensor->threshold_min && $row->value <= $sensor->threshold_max ? 'Normal' : 'Abnormal')
                    : '-';

                fputcsv($handle, [
                    $row->id,
                    $sensor ? $sensor->alias : '-',
                    $row->value,
                    $sensor ? $sensor->unit : '',
                    $isNormal,
                    $row->device_id,
                    $row->created_at->format('Y-m-d H:i:s'),
                ]);
            }

            fclose($handle);
        }, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="aquamonitor_data_' . date('Ymd_His') . '.csv"',
        ]);

        return $response;
    }
}
