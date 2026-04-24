<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Log extends Model
{
    protected $table = 'logs';

    public $timestamps = false;

    protected $fillable = [
        'admin_id', 'activity', 'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    public static function catat($userId, $activity)
    {
        return static::create([
            'admin_id' => $userId,
            'activity' => $activity,
            'created_at' => now(),
        ]);
    }
}
