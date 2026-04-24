<?php

namespace App\Http\Controllers;

use App\Mail\OtpMail;
use App\Models\Log;
use App\Models\PasswordOtp;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class ForgotPasswordController extends Controller
{
    /**
     * Step 1: Kirim OTP ke email
     */
    public function sendOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ], [
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'message' => 'Jika email terdaftar, kode OTP akan dikirim.',
            ]);
            // Tidak kasih tahu kalau email tidak ada (keamanan)
        }

        // Generate OTP
        $otpRecord = PasswordOtp::generateFor($request->email);

        // Kirim email
        try {
            Mail::to($request->email)->send(new OtpMail($otpRecord->otp, $user->name));
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal mengirim email. Pastikan konfigurasi SMTP sudah benar.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }

        return response()->json([
            'message' => 'Kode OTP telah dikirim ke email Anda. Berlaku 10 menit.',
        ]);
    }

    /**
     * Step 2: Verifikasi OTP
     */
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string|size:6',
        ], [
            'otp.required' => 'Kode OTP wajib diisi.',
            'otp.size' => 'Kode OTP harus 6 digit.',
        ]);

        $otpRecord = PasswordOtp::verify($request->email, $request->otp);

        if (!$otpRecord) {
            return response()->json([
                'message' => 'Kode OTP tidak valid atau sudah kedaluwarsa.',
            ], 422);
        }

        return response()->json([
            'message' => 'Kode OTP valid. Silakan buat password baru.',
            'verified' => true,
        ]);
    }

    /**
     * Step 3: Reset password
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string|size:6',
            'password' => 'required|string|min:6|confirmed',
        ], [
            'password.required' => 'Password baru wajib diisi.',
            'password.min' => 'Password minimal 6 karakter.',
            'password.confirmed' => 'Konfirmasi password tidak cocok.',
        ]);

        // Verifikasi OTP sekali lagi
        $otpRecord = PasswordOtp::verify($request->email, $request->otp);

        if (!$otpRecord) {
            return response()->json([
                'message' => 'Kode OTP tidak valid atau sudah kedaluwarsa. Silakan minta ulang.',
            ], 422);
        }

        // Cari user
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'message' => 'User tidak ditemukan.',
            ], 404);
        }

        // Update password
        $user->password = Hash::make($request->password);
        $user->save();

        // Tandai OTP sudah dipakai
        $otpRecord->is_used = true;
        $otpRecord->save();

        // Revoke semua token lama
        $user->tokens()->delete();

        Log::catat($user->id, 'Reset password via OTP');

        return response()->json([
            'message' => 'Password berhasil direset. Silakan login dengan password baru.',
        ]);
    }
}
