<?php

namespace App\Concerns;

use App\Models\Role;

trait HasRole
{
    public function role(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public function hasRole(string|array $roles): bool
    {
        if (! $this->role) {
            return false;
        }

        $roles = is_array($roles) ? $roles : [$roles];

        return in_array($this->role->slug, $roles, true);
    }

    public function isSuperAdmin(): bool
    {
        return $this->hasRole('super_admin');
    }

    public function isAdmin(): bool
    {
        return $this->hasRole(['super_admin', 'admin']);
    }

    public function isTechnician(): bool
    {
        return $this->hasRole('teknisi');
    }
}
