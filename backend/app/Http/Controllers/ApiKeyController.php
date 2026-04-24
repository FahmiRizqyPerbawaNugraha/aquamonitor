<?php

namespace App\Http\Controllers;

use App\Models\ApiKey;
use App\Models\Log;
use Illuminate\Http\Request;

class ApiKeyController extends Controller
{
    public function index()
    {
        $keys = ApiKey::with('user:id,name')->orderBy('created_at', 'desc')->get();

        // Show secret only partially
        $keys->transform(function ($key) {
            $key->secret_preview = substr($key->getRawOriginal('secret') ?? '', 0, 12) . '...';
            return $key;
        });

        return response()->json($keys);
    }

    public function store(Request $request)
    {
        $request->validate([
            'description' => 'nullable|string|max:255',
        ]);

        $apiKey = ApiKey::create([
            'description' => $request->description ?? 'API Key',
            'user_id' => $request->user()->id,
        ]);

        // Return full secret only on creation
        $fullSecret = $apiKey->getRawOriginal('secret');

        Log::catat($request->user()->id, "Membuat API Key baru: {$apiKey->uuid}");

        return response()->json([
            'api_key' => $apiKey,
            'secret' => $fullSecret,
            'message' => 'Simpan secret ini, tidak akan ditampilkan lagi.',
        ], 201);
    }

    public function toggle(Request $request, $id)
    {
        $key = ApiKey::findOrFail($id);
        $key->is_active = !$key->is_active;
        $key->save();

        $status = $key->is_active ? 'mengaktifkan' : 'menonaktifkan';
        Log::catat($request->user()->id, "Berhasil {$status} API Key: {$key->uuid}");

        return response()->json($key);
    }

    public function destroy(Request $request, $id)
    {
        $key = ApiKey::findOrFail($id);
        $uuid = $key->uuid;
        $key->delete();

        Log::catat($request->user()->id, "Menghapus API Key: {$uuid}");

        return response()->json(['message' => 'API Key berhasil dihapus.']);
    }
}
