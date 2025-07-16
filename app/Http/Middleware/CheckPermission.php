<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    public function handle(Request $request, Closure $next, $permission)
    {
        if (!$request->user()) {
            return response()->json([
                'message' => 'Authentication required. Please log in.',
                'hint' => 'Include valid Authorization token in headers'
            ], 401);
        }

        if (!$request->user()->can($permission)) {
            return response()->json([
                'message' => 'Insufficient permissions',
                'required_permission' => $permission,
                'user_permissions' => $request->user()->allPermissions()->pluck('name')
            ], 403);
        }

        return $next($request);
    }
}
