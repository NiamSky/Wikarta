<?php

namespace App\Policies;

use App\Models\Odp;
use App\Models\User;

class OdpPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->is_active;
    }

    public function view(User $user, Odp $odp): bool
    {
        return $user->is_active;
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, Odp $odp): bool
    {
        return $user->isAdmin() || $user->isTechnician();
    }

    public function delete(User $user, Odp $odp): bool
    {
        return $user->isAdmin();
    }

    public function restore(User $user, Odp $odp): bool
    {
        return $user->isSuperAdmin();
    }

    public function forceDelete(User $user, Odp $odp): bool
    {
        return $user->isSuperAdmin();
    }
}
