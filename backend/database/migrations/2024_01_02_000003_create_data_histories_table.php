<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('data_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sensor_id')->constrained('sensor_master')->onDelete('cascade');
            $table->float('value');
            $table->string('device_id')->default('AQUA-001');
            $table->timestamps();
            $table->index(['sensor_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('data_histories');
    }
};
