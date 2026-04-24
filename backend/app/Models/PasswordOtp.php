<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class PasswordOtp extends Model
{
    protected $table = 'password_otps';

    protected $fillable = [
        'email', 'otp', 'expires_at', 'is_used',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'is_used' => 'boolean',
    ];

    /**
     * Generate OTP baru untuk email tertentu.
     */
    public static function generateFor(string $email): self
    {
        // Hapus OTP lama yang belum dipakai
        static::where('email', $email)->where('is_used', false)->delete();

        return static::create([
            'email' => $email,
            'otp' => str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT),
            'expires_at' => Carbon::now()->addMinutes(10),
        ]);
    }

    /**
     * Verifikasi OTP.
     */
    public static function verify(string $email, string $otp): ?self
    {
        return static::where('email', $email)
            ->where('otp', $otp)
            ->where('is_used', false)
            ->where('expires_at', '>', Carbon::now())
            ->latest()
            ->first();
    }
}
