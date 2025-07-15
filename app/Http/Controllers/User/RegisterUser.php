<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Role;

class RegisterUser extends Controller
{
    public function register(Request $request)
    {
        // ✅ Validate inputs
        $validator = Validator::make($request->all(), [
            'name'     => 'required|string|max:255',
            'email'    => 'nullable|email|unique:users,email',
            'phone'    => 'nullable|string|regex:/^01[0-9]{9}$/|unique:users,phone',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors'  => $validator->errors()
            ], 422);
        }

        // ✅ Create the user
        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'phone'    => $request->phone,
            'password' => Hash::make($request->password),
        ]);

        // إذا كان هناك حقل 'is_admin' في الريكوست، عيّن له دور admin
        if ($request->has('is_admin') && $request->is_admin) {
            $adminRole = Role::where('name', 'admin')->first();
            if ($adminRole) {
                $user->attachRole($adminRole);
            }
        }

        return response()->json([
            'message' => 'User registered successfully',
            'user'    => $user,
        ], 201);
    }
}
