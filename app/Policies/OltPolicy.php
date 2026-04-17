<?php

namespace App\Policies;

use App\Models\Olt;
use App\Models\User;

class OltPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->is_active;
    }

    public function view(User $user, Olt $olt): bool
    {
        return $user->is_active;
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, Olt $olt): bool
    {
        return $user->isAdmin();
    }

    public function delete(User $user, Olt $olt): bool
    {
        return $user->isAdmin();
    }

    public function restore(User $user, Olt $olt): bool
    {
        return $user->isSuperAdmin();
    }

    public function forceDelete(User $user, Olt $olt): bool
    {
        return $user->isSuperAdmin();
    }
}
