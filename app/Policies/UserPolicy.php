<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, User $model): bool
    {
        // Super admin can update anyone, admin can update non-super-admin users
        if ($user->isSuperAdmin()) return true;
        if ($user->isAdmin()) return !$model->isSuperAdmin();
        return false;
    }

    public function delete(User $user, User $model): bool
    {
        if ($user->isSuperAdmin()) return $model->id !== $user->id;
        if ($user->isAdmin()) return !$model->isSuperAdmin() && $model->id !== $user->id;
        return false;
    }

    public function restore(User $user): bool
    {
        return $user->isSuperAdmin();
    }
}
