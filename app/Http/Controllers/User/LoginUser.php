<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;

class LoginUser extends Controller
{
    public function login(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'password' => 'required|string',
                'email' => 'nullable|email',
                'phone' => 'nullable|string|regex:/^01[0-9]{9}$/',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $credentials = ['password' => $request->password];

            if ($request->filled('email')) {
                $credentials['email'] = $request->email;
            } elseif ($request->filled('phone')) {
                $credentials['phone'] = $request->phone;
            } else {
                return response()->json([
                    'message' => 'Please provide either email or phone number'
                ], 422);
            }

            if (!$token = JWTAuth::attempt($credentials)) {
                return response()->json(['message' => 'Invalid credentials'], 401);
            }

            $user = auth()->user();

            return response()->json([
                'message' => 'Login successful',
                'token' => $token,
                'user' => [
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Server error',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
