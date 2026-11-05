<?php

namespace App\Http\Controllers;

use App\Models\Deposit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DepositController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        return response()->json(Deposit::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:deposits,name'],
        ]);

        $deposit = Deposit::create([
            'name' => $data['name'],
            'is_active' => true,
        ]);

        return response()->json($deposit, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Deposit $deposit)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Deposit $deposit): JsonResponse
    {
        $data = $request->validate([
            'name' => [
                'sometimes',
                'string',
                'max:255',
                Rule::unique('deposits', 'name')->ignore($deposit->id),
            ],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $deposit->update($data);

        return response()->json($deposit->fresh());
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Deposit $deposit): JsonResponse
    {
        $deposit->delete();

        return response()->json([
            'success' => true,
            'data' => [],
            'message' => 'Depósito excluído com sucesso.',
            'errors' => [],
        ]);
    }
}
