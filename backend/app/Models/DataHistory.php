<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DataHistory extends Model
{
    protected $table = 'data_histories';

    protected $fillable = [
        'sensor_id', 'value', 'device_id',
    ];

    protected $casts = [
        'value' => 'float',
    ];

    public function sensor()
    {
        return $this->belongsTo(SensorMaster::class, 'sensor_id');
    }
}
