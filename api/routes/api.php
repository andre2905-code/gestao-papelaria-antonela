<?php

use App\Http\Controllers\UserController;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->group(function () {
    Route::name('users.')->group(function () {
        Route::get('/users', [UserController::class, 'index'])
            ->middleware('can:viewAny,'.User::class)
            ->name('list');

        Route::post('/users', [UserController::class, 'store'])
            ->middleware('can:create,'.User::class)
            ->name('store');

        Route::delete('/users/{user}', [UserController::class, 'destroy'])->middleware('can:delete,user')->name('destroy');

        Route::put('/users/{user}', [UserController::class, 'update'])->middleware('can:update,user')->name('update');

        Route::patch('/users/{user}/role', [UserController::class, 'changeRole'])
            ->middleware('can:changeRole,user')
            ->name('change-role');
    });
});
