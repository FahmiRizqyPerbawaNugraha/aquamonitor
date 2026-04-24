<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('location_histories', function (Blueprint $table) {
            $table->id();
            $table->double('latitude');
            $table->double('longitude');
            $table->string('label')->nullable();
            $table->string('device_id')->default('AQUA-001');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('location_histories');
    }
};
