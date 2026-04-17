<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Odc extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'olt_id', 'name', 'code', 'brand', 'model',
        'city_id', 'district_id', 'village_id',
        'latitude', 'longitude', 'location_description', 'address',
        'total_ports', 'used_ports', 'status', 'installation_date',
        'notes', 'photo_path', 'created_by', 'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'latitude' => 'decimal:8',
            'longitude' => 'decimal:8',
            'installation_date' => 'date',
        ];
    }

    public function olt(): BelongsTo
    {
        return $this->belongsTo(Olt::class);
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

    public function odps(): HasMany
    {
        return $this->hasMany(Odp::class);
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

    public function getAvailablePortsAttribute(): int
    {
        return $this->total_ports - $this->used_ports;
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }
}
