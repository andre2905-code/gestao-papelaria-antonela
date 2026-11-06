<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DepositController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductController;
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

    Route::name('products')->group(function () {
        Route::get('/products', [ProductController::class, 'index'])
            ->name('list');

        Route::post('/products', [ProductController::class, 'store'])
            ->name('store');

        Route::delete('/products/{product}', [ProductController::class, 'destroy'])
            ->name('destroy');

        Route::patch('/products/{product}', [ProductController::class, 'update'])
            ->name('update');
    });

    Route::name('deposits.')->group(function () {
        Route::get('/deposits', [DepositController::class, 'index'])
            ->name('list');

        Route::post('/deposits', [DepositController::class, 'store'])
            ->name('store');

        Route::delete('/deposits/{deposit}', [DepositController::class, 'destroy'])
            ->name('destroy');

        Route::patch('/deposits/{deposit}', [DepositController::class, 'update'])
            ->name('update');
    });

    Route::name('categories.')->group(function () {
        Route::get('/categories', [CategoryController::class, 'index'])
            ->name('list');

        Route::post('/categories', [CategoryController::class, 'store'])
            ->name('store');

        Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])
            ->name('destroy');

        Route::patch('/categories/{category}', [CategoryController::class, 'update'])
            ->name('update');
    });

    Route::name('customers.')->group(function () {
        Route::get('/customers', [CustomerController::class, 'index'])
            ->name('list');

        Route::post('/customers', [CustomerController::class, 'store'])
            ->name('store');

        Route::delete('/customers/{customer}', [CustomerController::class, 'destroy'])
            ->name('destroy');

        Route::patch('/customers/{customer}', [CustomerController::class, 'update'])
            ->name('update');
    });

    Route::name('orders.')->group(function () {
        Route::get('/orders', [OrderController::class, 'index'])
            ->name('list');

        Route::post('/orders', [OrderController::class, 'store'])
            ->name('store');

        Route::delete('/orders/{order}', [OrderController::class, 'destroy'])
            ->name('destroy');

        Route::patch('/orders/{order}', [OrderController::class, 'update'])
            ->name('update');
    });
});
