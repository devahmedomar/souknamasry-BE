<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;

class LogoutUser extends Controller
{
    //
public function logout(Request $request)
{
    try {
        JWTAuth::invalidate(JWTAuth::getToken());

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Logout failed',
            'error' => $e->getMessage()
        ], 500);
    }
}
}
