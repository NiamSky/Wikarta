<?php

namespace App\Policies;

use App\Models\Odc;
use App\Models\User;

class OdcPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->is_active;
    }

    public function view(User $user, Odc $odc): bool
    {
        return $user->is_active;
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, Odc $odc): bool
    {
        return $user->isAdmin();
    }

    public function delete(User $user, Odc $odc): bool
    {
        return $user->isAdmin();
    }

    public function restore(User $user, Odc $odc): bool
    {
        return $user->isSuperAdmin();
    }

    public function forceDelete(User $user, Odc $odc): bool
    {
        return $user->isSuperAdmin();
    }
}
