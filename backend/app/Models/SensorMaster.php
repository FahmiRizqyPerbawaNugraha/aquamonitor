<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class SensorMaster extends Model
{
    protected $table = 'sensor_master';

    protected $fillable = [
        'uuid', 'name', 'alias', 'unit', 'is_active', 'threshold_min', 'threshold_max',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'threshold_min' => 'float',
        'threshold_max' => 'float',
    ];

    protected static function booted()
    {
        static::creating(function ($sensor) {
            $sensor->uuid = $sensor->uuid ?? Str::uuid()->toString();
        });
    }

    public function dataHistories()
    {
        return $this->hasMany(DataHistory::class, 'sensor_id');
    }
}
