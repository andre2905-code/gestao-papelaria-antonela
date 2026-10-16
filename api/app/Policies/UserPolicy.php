<?php

namespace App\Policies;

use App\Enums\Role;
use App\Models\User;

class UserPolicy
{
    public function before(User $authUser, string $ability): ?bool
    {
        if (!$authUser->isSuperAdmin()) {
            return null;
        }

        return in_array($ability, ['delete', 'changeRole', 'restore', 'forceDelete'], true)
            ? null
            : true;
    }

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, User $model): bool
    {
        return $user->isAdmin() || $user->id === $model->id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, User $model): bool
    {
        return $user->id === $model->id
            || ($user->isAdmin() && $model->role === Role::User);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, User $model): bool
    {
        if ($user->id === $model->id || $model->isSuperAdmin()) {
            return false;
        }

        return ($user->isAdmin() && $model->role === Role::User) || ($user->isSuperAdmin() && $model->role === Role::Admin);
    }

    public function changeRole(User $user, User $model, ?Role $role = null): bool
    {
        if (!$user->isSuperAdmin()) {
            return false;
        }

        if ($model->isSuperAdmin() && $role !== Role::SuperAdmin) {
            return User::query()
                ->where('role', Role::SuperAdmin->value)
                ->count() > 1;
        }

        return true;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, User $model): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, User $model): bool
    {
        return false;
    }
}
