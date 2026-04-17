<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('maintenance_logs', function (Blueprint $table) {
            $table->id();
            $table->morphs('loggable');
            $table->enum('type', ['routine', 'corrective', 'emergency', 'upgrade'])->default('routine');
            $table->foreignId('performed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('description');
            $table->text('findings')->nullable();
            $table->text('resolution')->nullable();
            $table->timestamp('performed_at');
            $table->date('next_maintenance_at')->nullable();
            $table->json('photo_paths')->nullable();
            $table->timestamps();

            $table->index('performed_by');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('maintenance_logs');
    }
};
