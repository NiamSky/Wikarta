<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('onts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('odp_id')->constrained()->restrictOnDelete();
            $table->string('name', 100);
            $table->string('code', 50)->unique();
            $table->string('serial_number', 100)->nullable()->unique();
            $table->string('customer_name', 150)->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->enum('status', ['active', 'inactive', 'maintenance', 'decommissioned'])->default('active');
            $table->date('installed_at')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['odp_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('onts');
    }
};
