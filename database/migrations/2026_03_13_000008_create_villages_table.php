<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('villages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('district_id')->constrained()->cascadeOnDelete();
            $table->string('name', 100);
            $table->enum('type', ['kelurahan', 'desa'])->default('kelurahan');
            $table->string('postal_code', 10)->nullable();
            $table->string('code', 20)->unique()->comment('BPS code');
            $table->timestamps();

            $table->index('district_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('villages');
    }
};
