<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Dashboard\LoginController;
use App\Http\Controllers\Dashboard\LogoutController;
use App\Http\Controllers\Dashboard\RegisterController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
//     return $request->user();
// });
// Authentication Routes
Route::prefix('auth')->group(function () {
    Route::post('login', [LoginController::class, 'login'])->name('login');
    Route::post('logout', [LogoutController::class, 'logout'])->middleware('api')->name('logout');

});

Route::middleware('api')->group(function () {
    // User Management Routes
    Route::apiResource('users', RegisterController::class)->except(['show']);


});
