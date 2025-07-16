<?php

namespace App\Http\Controllers\Dashboard;

use App\Models\Role;
use App\Models\User;
use App\Traits\ApiTrait;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use App\Http\Requests\Dashboard\Role\UserStoreRequest;
use App\Http\Requests\Dashboard\Role\UserUpdateRequest;

class RegisterController extends Controller
{
    // public function register(Request $request)
    // {
    //     // ✅ Validate inputs
    //     $validator = Validator::make($request->all(), [
    //         'name'     => 'required|string|max:255',
    //         'email'    => 'nullable|email|unique:users,email',
    //         'phone'    => 'nullable|string|regex:/^01[0-9]{9}$/|unique:users,phone',
    //         'password' => 'required|string|min:6',
    //     ]);

    //     if ($validator->fails()) {
    //         return response()->json([
    //             'message' => 'Validation failed',
    //             'errors'  => $validator->errors()
    //         ], 422);
    //     }

    //     // ✅ Create the user
    //     $user = User::create([
    //         'name'     => $request->name,
    //         'email'    => $request->email,
    //         'phone'    => $request->phone,
    //         'password' => Hash::make($request->password),
    //     ]);

    //     // إذا كان هناك حقل 'is_admin' في الريكوست، عيّن له دور admin
    //     if ($request->has('is_admin') && $request->is_admin) {
    //         $adminRole = Role::where('name', 'admin')->first();
    //         if ($adminRole) {
    //             $user->attachRole($adminRole);
    //         }
    //     }

    //     return response()->json([
    //         'message' => 'User registered successfully',
    //         'user'    => $user,
    //     ], 201);
    // }


     use ApiTrait;

     public function index()
    {

        $users = User::with(['roles' => function($query) {
            $query->select('name');
        }])->get();
        return $this->SuccessMessage(
            message: 'تم ارجاع المستخدم بنجاح',
            data: ['user' => $users],
            code: 200
        );

    }

    public function store(UserStoreRequest $request)
    {

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => bcrypt($request->password),
        ]);

        $user->addRole($request->role);

        $userData = $user->only(['id', 'name', 'email', 'phone']);
        $userData['roles'] = $user->roles->pluck('name')->toArray();

        return $this->SuccessMessage(
            message: 'تم إنشاء المستخدم بنجاح',
            data: ['user' => $userData],
            code: 201
        );
    }

    public function show(User $user)
    {
        return $this->Data(
            data: $user->load('roles'),
            message: 'تم جلب بيانات المستخدم بنجاح'
        );
    }

    public function update(UserUpdateRequest $request, User $user)
    {
        $data = $request->only(['name', 'email', 'phone']);

        if ($request->has('password')) {
            $data['password'] = bcrypt($request->password);
        }

        $user->update($data);

        if ($request->has('role')) {
            $user->syncRoles([$request->role]);
        }

        return $this->SuccessMessage(
            message: 'تم تحديث المستخدم بنجاح',
            data: ['user' => $user->load('roles')]
        );
    }

    public function destroy(User $user)
    {
        $user->delete();
        return $this->SuccessMessage(
            message: 'تم حذف المستخدم بنجاح'
        );
    }
}
