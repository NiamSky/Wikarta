<?php

namespace App\Policies;

use App\Models\Ont;
use App\Models\User;

class OntPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->is_active;
    }

    public function view(User $user, Ont $ont): bool
    {
        return $user->is_active;
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, Ont $ont): bool
    {
        return $user->isAdmin() || $user->isTechnician();
    }

    public function delete(User $user, Ont $ont): bool
    {
        return $user->isAdmin();
    }

    public function restore(User $user, Ont $ont): bool
    {
        return $user->isSuperAdmin();
    }

    public function forceDelete(User $user, Ont $ont): bool
    {
        return $user->isSuperAdmin();
    }
}
