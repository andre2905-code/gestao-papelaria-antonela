
<?php

namespace App\Http\Controllers;


use App\Models\Deposit;
use Illuminate\Http\Request;

class DepositController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $deposits = Deposit::all();

        return response()->json($deposits);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'nullable|string|max:255',
        ]);

        $deposit = Deposit::create($validated);

        return response()->json($deposit, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Deposit $deposit)
    {
        return response()->json($deposit);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Deposit $deposit)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'location' => 'sometimes|nullable|string|max:255',
        ]);

        $deposit->update($validated);

        return response()->json($deposit);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Deposit $deposit)
    {
        $deposit->delete();

        return response()->json([
            'message' => 'Depósito excluído com sucesso.'
        ]);
    }
}
