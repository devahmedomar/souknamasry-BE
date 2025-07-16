<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Laratrust\Models\Role;
use Laratrust\Models\Permission;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run()
    {
        // إنشاء الصلاحيات
        $permissions = [
            'create-user',
            'read-user',
            'update-user',
            'delete-user',
            'create-product',
            'read-product',
            'update-product',
            'delete-product',
            'create-category',
            'read-category',
            'update-category',
            'delete-category',
            'create-orders',
            'read-orders',
            'update-orders',
            'delete-orders',
            //stores
            'create-stores',
            'read-stores',
            'update-stores',
            'delete-stores',
            
        ];
        
        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'display_name' => ucwords(str_replace('-', ' ', $permission)),
                'description' => ucwords(str_replace('-', ' ', $permission)),
            ]);
        }
        
        // إنشاء أدوار مع صلاحياتها
        $admin = Role::firstOrCreate([
            'name' => 'admin',
            'display_name' => 'Administrator',
            'description' => 'System Administrator with all permissions',
        ]);
        $admin->syncPermissions(Permission::all());
        
        $vendor = Role::firstOrCreate([
            'name' => 'vendor',
            'display_name' => 'Vendor',
            'description' => 'Vendor with product management permissions',
        ]);
        $vendor->syncPermissions([
            'create-product',
            'read-product',
            'update-product',
        
        
            'delete-product',
        ]);
        
        $sales = Role::firstOrCreate([
            'name' => 'sales',
            'display_name' => 'Sales',
            'description' => 'Sales team with order management permissions',
        ]);
        $sales->syncPermissions([
            'manage-orders',
            'view-reports',
        ]);
    }
}