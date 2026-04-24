<?php

namespace App\Http\Controllers;

use App\Models\DataHistory;
use App\Models\Log;
use App\Models\BatteryHistory;
use App\Models\WindHistory;
use App\Models\Prediction;
use Carbon\Carbon;
use Illuminate\Http\Request;

class AdminDataController extends Controller
{
    public function statistik()
    {
        $total = DataHistory::count();
        $today = DataHistory::whereDate('created_at', Carbon::today())->count();
        $oldest = DataHistory::orderBy('created_at', 'asc')->first();
        $newest = DataHistory::orderBy('created_at', 'desc')->first();

        return response()->json([
            'total' => $total,
            'today' => $today,
            'oldest' => $oldest ? $oldest->created_at->format('Y-m-d H:i:s') : null,
            'newest' => $newest ? $newest->created_at->format('Y-m-d H:i:s') : null,
        ]);
    }

    public function hapus(Request $request)
    {
        $request->validate([
            'dari' => 'required|date',
            'sampai' => 'required|date|after_or_equal:dari',
        ]);

        $deleted = DataHistory::whereDate('created_at', '>=', $request->dari)
            ->whereDate('created_at', '<=', $request->sampai)
            ->delete();

        Log::catat($request->user()->id, "Menghapus {$deleted} data sensor (periode: {$request->dari} s/d {$request->sampai})");

        return response()->json([
            'message' => "Berhasil menghapus {$deleted} data.",
            'deleted' => $deleted,
        ]);
    }

    public function hapusSemua(Request $request)
    {
        $totalData = DataHistory::count();
        $totalBattery = BatteryHistory::count();
        $totalWind = WindHistory::count();
        $totalPrediction = Prediction::count();

        DataHistory::truncate();
        BatteryHistory::truncate();
        WindHistory::truncate();
        Prediction::truncate();

        $total = $totalData + $totalBattery + $totalWind + $totalPrediction;

        Log::catat($request->user()->id, "Menghapus SEMUA data ({$total} record)");

        return response()->json([
            'message' => "Berhasil menghapus semua data ({$total} record).",
            'deleted' => $total,
        ]);
    }
}
