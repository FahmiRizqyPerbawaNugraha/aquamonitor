<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BatteryHistory extends Model
{
    protected $table = 'battery_histories';

    protected $fillable = [
        'value', 'device_id',
    ];

    protected $casts = [
        'value' => 'float',
    ];
}
