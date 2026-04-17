<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('olts', 'parent_olt_id')) {
            Schema::table('olts', function (Blueprint $table) {
                $table->foreignId('parent_olt_id')
                    ->nullable()
                    ->after('ip_address')
                    ->constrained('olts')
                    ->nullOnDelete();

                $table->index('parent_olt_id');
            });
        }

        if (Schema::hasTable('fiber_routes')) {
            Schema::drop('fiber_routes');
        }
    }

    public function down(): void
    {
        if (! Schema::hasTable('fiber_routes')) {
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

        if (Schema::hasColumn('olts', 'parent_olt_id')) {
            Schema::table('olts', function (Blueprint $table) {
                $table->dropForeign(['parent_olt_id']);
                $table->dropColumn('parent_olt_id');
            });
        }
    }
};
