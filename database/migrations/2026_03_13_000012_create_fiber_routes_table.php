<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fiber_routes', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('code', 50)->unique();
            $table->enum('from_node_type', ['olt', 'odc', 'odp']);
            $table->unsignedBigInteger('from_node_id');
            $table->enum('to_node_type', ['olt', 'odc', 'odp']);
            $table->unsignedBigInteger('to_node_id');
            $table->enum('type', ['feeder', 'distribution', 'drop'])->default('distribution');
            $table->json('coordinates')->comment('GeoJSON LineString');
            $table->decimal('length_meters', 10, 2)->nullable();
            $table->string('cable_type', 50)->nullable();
            $table->smallInteger('cable_capacity')->unsigned()->nullable();
            $table->string('color_code', 7)->nullable();
            $table->enum('status', ['active', 'inactive', 'damaged', 'maintenance'])->default('active');
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['from_node_type', 'from_node_id']);
            $table->index(['to_node_type', 'to_node_id']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fiber_routes');
    }
};
