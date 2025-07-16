<?php

namespace App\Http\Controllers\Dashboard;

use App\Traits\ApiTrait;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Exceptions\JWTException;
use App\Http\Requests\Dashboard\Auth\LoginRequest;

class LoginController extends Controller
{
        use ApiTrait;

  public function login(LoginRequest $request)
{
    $credentials = $request->only('password');
    $credentials[$request->filled('email') ? 'email' : 'phone'] =
        $request->filled('email') ? $request->email : $request->phone;

    try {
        if (!$token = JWTAuth::attempt($credentials)) {
            return $this->ErrorMessage(
                message: 'بيانات الاعتماد غير صحيحة',
                code: 401
            );
        }

        $user = auth()->user();

        if (!$user->is_active) {
            return $this->ErrorMessage(
                message: 'الحساب غير مفعل',
                code: 403
            );
        }

        return $this->Data(
            data: [
                'token' => $token,
                'token_type' => 'bearer',
                'expires_in' => auth()->factory()->getTTL() * 60,
                'user' => $user->only(['name', 'email', 'phone', 'id'])
            ],
            message: 'تم تسجيل الدخول بنجاح'
        );

    } catch (JWTException $e) {
        return $this->ErrorMessage(
            message: 'لا يمكن إنشاء token',
            code: 500,
            data: ['error' => $e->getMessage()]
        );
    }
}
}
