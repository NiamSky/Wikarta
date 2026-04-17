<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('odps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('odc_id')->nullable()->constrained()->restrictOnDelete();
            $table->foreignId('olt_id')->nullable()->constrained()->restrictOnDelete();
            $table->string('name', 100);
            $table->string('code', 50)->unique();
            $table->string('brand', 50)->nullable();
            $table->string('model', 100)->nullable();
            $table->foreignId('city_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('district_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('village_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('latitude', 10, 8);
            $table->decimal('longitude', 11, 8);
            $table->string('location_description', 255)->nullable();
            $table->text('address')->nullable();
            $table->tinyInteger('total_ports')->unsigned()->default(8);
            $table->tinyInteger('used_ports')->unsigned()->default(0);
            $table->enum('status', ['active', 'inactive', 'full', 'maintenance', 'damaged', 'decommissioned'])->default('active');
            $table->date('installation_date')->nullable();
            $table->date('last_maintenance_date')->nullable();
            $table->string('pole_number', 50)->nullable();
            $table->text('notes')->nullable();
            $table->string('photo_path', 500)->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['odc_id', 'olt_id', 'status', 'city_id', 'district_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('odps');
    }
};
