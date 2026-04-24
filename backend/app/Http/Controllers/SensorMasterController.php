<?php

namespace App\Http\Controllers;

use App\Models\Log;
use App\Models\SensorMaster;
use Illuminate\Http\Request;

class SensorMasterController extends Controller
{
    public function index()
    {
        $sensors = SensorMaster::orderBy('id')->get();
        return response()->json($sensors);
    }

    public function update(Request $request, $id)
    {
        $sensor = SensorMaster::findOrFail($id);

        $request->validate([
            'threshold_min' => 'required|numeric',
            'threshold_max' => 'required|numeric|gt:threshold_min',
        ]);

        $sensor->threshold_min = $request->threshold_min;
        $sensor->threshold_max = $request->threshold_max;
        $sensor->save();

        Log::catat($request->user()->id, "Kalibrasi sensor {$sensor->alias}: min={$sensor->threshold_min}, max={$sensor->threshold_max}");

        return response()->json([
            'message' => "Threshold sensor {$sensor->alias} berhasil diperbarui.",
            'sensor' => $sensor,
        ]);
    }
}
