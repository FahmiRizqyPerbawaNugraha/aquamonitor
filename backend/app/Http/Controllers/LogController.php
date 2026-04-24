<?php

namespace App\Http\Controllers;

use App\Models\Log;
use Illuminate\Http\Request;

class LogController extends Controller
{
    public function index(Request $request)
    {
        $logs = Log::with('admin:id,name,email')
            ->orderBy('created_at', 'desc')
            ->paginate(30);

        return response()->json($logs);
    }
}
