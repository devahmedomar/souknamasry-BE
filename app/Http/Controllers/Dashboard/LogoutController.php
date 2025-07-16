<?php

namespace App\Http\Controllers\Dashboard;

use App\Traits\ApiTrait;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;
use App\Http\Controllers\Controller;
use Tymon\JWTAuth\Exceptions\JWTException;

class LogoutController extends Controller
{
     use ApiTrait;
    public function logout(Request $request)
    {
        try {
            JWTAuth::invalidate(JWTAuth::getToken());

            return $this->SuccessMessage(
                message: 'تم تسجيل الخروج بنجاح',
                code: 200
            );

        } catch (JWTException $e) {
            return $this->ErrorMessage(
                message: 'فشل تسجيل الخروج',
                code: 500,
                data: ['error' => $e->getMessage()]
            );
        } catch (\Exception $e) {
            return $this->ErrorMessage(
                message: 'حدث خطأ غير متوقع',
                code: 500,
                data: ['error' => $e->getMessage()]
            );
        }
    }
}

