<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Prediction extends Model
{
    protected $table = 'predictions';

    protected $fillable = [
        'device_id', 'result', 'score', 'model_used', 'detail_parameter', 'rekomendasi',
    ];

    protected $casts = [
        'score' => 'float',
        'detail_parameter' => 'array',
    ];
}
