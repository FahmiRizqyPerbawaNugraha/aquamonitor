<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('battery_histories', function (Blueprint $table) {
            $table->id();
            $table->float('value');
            $table->string('device_id')->default('AQUA-001');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('battery_histories');
    }
};
