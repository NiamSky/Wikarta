<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Olt extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name', 'code', 'brand', 'model', 'ip_address',
        'city_id', 'district_id', 'village_id',
        'latitude', 'longitude', 'location_description',
        'total_ports', 'used_ports', 'status',
        'notes', 'photo_path', 'created_by', 'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'latitude' => 'decimal:8',
            'longitude' => 'decimal:8',
        ];
    }

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    public function district(): BelongsTo
    {
        return $this->belongsTo(District::class);
    }

    public function village(): BelongsTo
    {
        return $this->belongsTo(Village::class);
    }

    public function odcs(): HasMany
    {
        return $this->hasMany(Odc::class);
    }

    public function odps(): HasMany
    {
        return $this->hasMany(Odp::class);
    }

    public function parentOlt(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_olt_id');
    }

    public function childOlts(): HasMany
    {
        return $this->hasMany(self::class, 'parent_olt_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function maintenanceLogs(): \Illuminate\Database\Eloquent\Relations\MorphMany
    {
        return $this->morphMany(MaintenanceLog::class, 'loggable');
    }

    public function getCapacityPercentageAttribute(): int
    {
        return $this->total_ports > 0
            ? (int) round(($this->used_ports / $this->total_ports) * 100)
            : 0;
    }
}
