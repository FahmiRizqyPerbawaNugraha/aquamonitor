<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LocationHistory extends Model
{
    protected $table = 'location_histories';

    protected $fillable = [
        'latitude', 'longitude', 'label', 'device_id',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
    ];
}
