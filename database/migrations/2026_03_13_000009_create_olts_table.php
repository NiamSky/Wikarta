<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('olts', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('code', 50)->unique();
            $table->string('brand', 50)->nullable();
            $table->string('model', 100)->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->foreignId('city_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('district_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('village_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->string('location_description', 255)->nullable();
            $table->smallInteger('total_ports')->unsigned()->default(16);
            $table->smallInteger('used_ports')->unsigned()->default(0);
            $table->enum('status', ['active', 'inactive', 'maintenance', 'decommissioned'])->default('active');
            $table->text('notes')->nullable();
            $table->string('photo_path', 500)->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['status', 'city_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('olts');
    }
};
