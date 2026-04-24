<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class ApiKey extends Model
{
    protected $table = 'api_keys';

    protected $fillable = [
        'uuid', 'secret', 'is_active', 'description', 'user_id',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    protected $hidden = [
        'secret',
    ];

    protected static function booted()
    {
        static::creating(function ($key) {
            $key->uuid = $key->uuid ?? Str::uuid()->toString();
            $key->secret = $key->secret ?? Str::random(64);
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
