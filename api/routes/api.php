<?php

use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->group(function () {
    Route::name('users.')->group(function () {
        Route::get('/users', [UserController::class, 'index'])->name('list');

        Route::post('/users', [UserController::class, 'store'])->name('store');

        Route::delete('/users/{user}', [UserController::class, 'destroy'])->middleware('can:delete,user')->name('destroy');

        Route::put('/users/{user}', [UserController::class, 'update'])->middleware('can:update,user')->name('update');
    });
});
