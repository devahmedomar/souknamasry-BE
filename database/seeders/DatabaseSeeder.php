<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\Permission;
use App\Models\User;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Roles
        $adminRole = Role::firstOrCreate([
            'name' => 'admin',
        ], [
            'display_name' => 'Admin',
            'description' => 'Administrator',
        ]);

        // Permissions
        $viewDashboard = Permission::firstOrCreate([
            'name' => 'view-dashboard',
        ], [
            'display_name' => 'View Dashboard',
            'description' => 'Can view dashboard',
        ]);
        $addUser = Permission::firstOrCreate([
            'name' => 'add-user',
        ], [
            'display_name' => 'Add User',
            'description' => 'Can add users',
        ]);

        // Attach permissions to admin role
        $adminRole->permissions()->syncWithoutDetaching([
            $viewDashboard->id,
            $addUser->id,
        ]);
    }
}
