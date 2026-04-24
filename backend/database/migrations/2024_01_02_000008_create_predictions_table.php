<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('predictions', function (Blueprint $table) {
            $table->id();
            $table->string('device_id')->default('AQUA-001');
            $table->enum('result', ['sangat_baik', 'baik', 'cukup_baik', 'kurang_baik', 'buruk']);
            $table->float('score');
            $table->string('model_used')->default('rule_based_dss');
            $table->json('detail_parameter')->nullable();
            $table->text('rekomendasi')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('predictions');
    }
};
