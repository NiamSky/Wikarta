<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Seed default users for each role.
     *
     * Credentials (for development/testing only):
     *   superadmin@wikarta.id  /  password
     *   admin@wikarta.id       /  password
     *   teknisi@wikarta.id     /  password
     */
    public function run(): void
    {
        $roles = Role::pluck('id', 'slug');

        $users = [
            [
                'name'     => 'Super Admin',
                'email'    => 'superadmin@wikarta.id',
                'password' => Hash::make('password'),
                'role_id'  => $roles['super_admin'] ?? null,
                'is_active' => true,
                'phone'    => null,
            ],
            [
                'name'     => 'Admin',
                'email'    => 'admin@wikarta.id',
                'password' => Hash::make('password'),
                'role_id'  => $roles['admin'] ?? null,
                'is_active' => true,
                'phone'    => null,
            ],
            [
                'name'     => 'Teknisi',
                'email'    => 'teknisi@wikarta.id',
                'password' => Hash::make('password'),
                'role_id'  => $roles['teknisi'] ?? null,
                'is_active' => true,
                'phone'    => null,
            ],
        ];

        foreach ($users as $data) {
            User::updateOrCreate(
                ['email' => $data['email']],
                $data,
            );
        }
    }
}
