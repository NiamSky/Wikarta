<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            // ODP
            ['name' => 'Lihat ODP', 'slug' => 'odp.view', 'module' => 'odp'],
            ['name' => 'Tambah ODP', 'slug' => 'odp.create', 'module' => 'odp'],
            ['name' => 'Edit ODP', 'slug' => 'odp.update', 'module' => 'odp'],
            ['name' => 'Hapus ODP', 'slug' => 'odp.delete', 'module' => 'odp'],
            ['name' => 'Pulihkan ODP', 'slug' => 'odp.restore', 'module' => 'odp'],

            // ONT
            ['name' => 'Lihat ONT', 'slug' => 'ont.view', 'module' => 'ont'],
            ['name' => 'Tambah ONT', 'slug' => 'ont.create', 'module' => 'ont'],
            ['name' => 'Edit ONT', 'slug' => 'ont.update', 'module' => 'ont'],
            ['name' => 'Hapus ONT', 'slug' => 'ont.delete', 'module' => 'ont'],
            ['name' => 'Pulihkan ONT', 'slug' => 'ont.restore', 'module' => 'ont'],

            // ODC
            ['name' => 'Lihat ODC', 'slug' => 'odc.view', 'module' => 'odc'],
            ['name' => 'Tambah ODC', 'slug' => 'odc.create', 'module' => 'odc'],
            ['name' => 'Edit ODC', 'slug' => 'odc.update', 'module' => 'odc'],
            ['name' => 'Hapus ODC', 'slug' => 'odc.delete', 'module' => 'odc'],
            ['name' => 'Pulihkan ODC', 'slug' => 'odc.restore', 'module' => 'odc'],

            // OLT
            ['name' => 'Lihat OLT', 'slug' => 'olt.view', 'module' => 'olt'],
            ['name' => 'Tambah OLT', 'slug' => 'olt.create', 'module' => 'olt'],
            ['name' => 'Edit OLT', 'slug' => 'olt.update', 'module' => 'olt'],
            ['name' => 'Hapus OLT', 'slug' => 'olt.delete', 'module' => 'olt'],
            ['name' => 'Pulihkan OLT', 'slug' => 'olt.restore', 'module' => 'olt'],

            // Users
            ['name' => 'Lihat Pengguna', 'slug' => 'users.view', 'module' => 'users'],
            ['name' => 'Tambah Pengguna', 'slug' => 'users.create', 'module' => 'users'],
            ['name' => 'Edit Pengguna', 'slug' => 'users.update', 'module' => 'users'],
            ['name' => 'Hapus Pengguna', 'slug' => 'users.delete', 'module' => 'users'],

            // Geography
            ['name' => 'Kelola Area Geografis', 'slug' => 'geography.manage', 'module' => 'geography'],

            // Reports
            ['name' => 'Lihat Laporan', 'slug' => 'reports.view', 'module' => 'reports'],

            // Maintenance
            ['name' => 'Catat Maintenance', 'slug' => 'maintenance.create', 'module' => 'maintenance'],
            ['name' => 'Lihat Maintenance', 'slug' => 'maintenance.view', 'module' => 'maintenance'],

            // Activity logs
            ['name' => 'Lihat Log Aktivitas', 'slug' => 'activity-logs.view', 'module' => 'activity-logs'],
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['slug' => $permission['slug']], $permission);
        }

        $roles = [
            [
                'name' => 'Super Admin',
                'slug' => 'super_admin',
                'description' => 'Akses penuh ke seluruh sistem',
                'permissions' => Permission::pluck('slug')->toArray(),
            ],
            [
                'name' => 'Admin',
                'slug' => 'admin',
                'description' => 'Kelola data jaringan dan laporan',
                'permissions' => [
                    'odp.view', 'odp.create', 'odp.update', 'odp.delete',
                    'ont.view', 'ont.create', 'ont.update', 'ont.delete',
                    'odc.view', 'odc.create', 'odc.update', 'odc.delete',
                    'olt.view', 'olt.create', 'olt.update', 'olt.delete',
                    'users.view', 'users.create', 'users.update',
                    'geography.manage',
                    'reports.view',
                    'maintenance.view', 'maintenance.create',
                    'activity-logs.view',
                ],
            ],
            [
                'name' => 'Teknisi',
                'slug' => 'teknisi',
                'description' => 'Input dan update data lapangan',
                'permissions' => [
                    'odp.view', 'odp.update',
                    'ont.view', 'ont.update',
                    'odc.view',
                    'olt.view',
                    'maintenance.view', 'maintenance.create',
                ],
            ],
        ];

        foreach ($roles as $roleData) {
            $permissionSlugs = $roleData['permissions'];
            unset($roleData['permissions']);

            $role = Role::firstOrCreate(['slug' => $roleData['slug']], $roleData);

            $permissionIds = Permission::whereIn('slug', $permissionSlugs)->pluck('id');
            $role->permissions()->sync($permissionIds);
        }
    }
}
