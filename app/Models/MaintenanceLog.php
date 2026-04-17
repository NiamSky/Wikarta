<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class MaintenanceLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'loggable_type', 'loggable_id',
        'type', 'performed_by',
        'description', 'findings', 'resolution',
        'performed_at', 'next_maintenance_at',
        'photo_paths',
    ];

    protected function casts(): array
    {
        return [
            'performed_at' => 'datetime',
            'next_maintenance_at' => 'date',
            'photo_paths' => 'array',
        ];
    }

    public function loggable(): MorphTo
    {
        return $this->morphTo();
    }

    public function technician(): BelongsTo
    {
        return $this->belongsTo(User::class, 'performed_by');
    }
}
