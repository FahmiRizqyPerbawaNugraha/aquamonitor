<?php

use App\Http\Controllers\AdminDataController;
use App\Http\Controllers\AdminUserController;
use App\Http\Controllers\ApiKeyController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\ForgotPasswordController;
use App\Http\Controllers\LogController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RegisterController;
use App\Http\Controllers\SensorDataController;
use App\Http\Controllers\SensorMasterController;
use Illuminate\Support\Facades\Route;

// ==============================
// PUBLIC (untuk perangkat IoT)
// ==============================
Route::post('/sensor-data', [SensorDataController::class, 'store']);
Route::post('/simulasi', [SensorDataController::class, 'simulasi']);

// ==============================
// AUTH
// ==============================
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [RegisterController::class, 'register']);

// ==============================
// LUPA PASSWORD (OTP)
// ==============================
Route::post('/forgot-password/send-otp', [ForgotPasswordController::class, 'sendOtp']);
Route::post('/forgot-password/verify-otp', [ForgotPasswordController::class, 'verifyOtp']);
Route::post('/forgot-password/reset', [ForgotPasswordController::class, 'resetPassword']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/profile/password', [ProfileController::class, 'changePassword']);

    // ==============================
    // DASHBOARD & MONITORING (semua role)
    // ==============================
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/dashboard/chart', [DashboardController::class, 'chart']);
    Route::get('/sensor-data', [SensorDataController::class, 'index']);
    Route::get('/sensor-data/terbaru', [SensorDataController::class, 'terbaru']);

    // ==============================
    // EXPORT (admin + pengelola)
    // ==============================
    Route::middleware('role:admin,pengelola')->group(function () {
        Route::get('/export/csv', [ExportController::class, 'csv']);
    });

    // ==============================
    // KALIBRASI SENSOR (admin + pengelola)
    // ==============================
    Route::middleware('role:admin,pengelola')->group(function () {
        Route::get('/sensor/master', [SensorMasterController::class, 'index']);
        Route::put('/sensor/master/{id}', [SensorMasterController::class, 'update']);
    });

    // ==============================
    // ADMIN ONLY
    // ==============================
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        // User management
        Route::get('/users', [AdminUserController::class, 'index']);
        Route::post('/users', [AdminUserController::class, 'store']);
        Route::put('/users/{id}', [AdminUserController::class, 'update']);
        Route::delete('/users/{id}', [AdminUserController::class, 'destroy']);

        // Data management
        Route::get('/data/statistik', [AdminDataController::class, 'statistik']);
        Route::post('/data/hapus', [AdminDataController::class, 'hapus']);
        Route::post('/data/hapus-semua', [AdminDataController::class, 'hapusSemua']);

        // Logs
        Route::get('/logs', [LogController::class, 'index']);

        // API Keys
        Route::get('/api-keys', [ApiKeyController::class, 'index']);
        Route::post('/api-keys', [ApiKeyController::class, 'store']);
        Route::patch('/api-keys/{id}/toggle', [ApiKeyController::class, 'toggle']);
        Route::delete('/api-keys/{id}', [ApiKeyController::class, 'destroy']);
    });
});
