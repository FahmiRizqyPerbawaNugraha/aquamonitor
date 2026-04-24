<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WindHistory extends Model
{
    protected $table = 'wind_histories';

    protected $fillable = [
        'value', 'device_id',
    ];

    protected $casts = [
        'value' => 'float',
    ];
}
