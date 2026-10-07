<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json([
            'success' => null,
            'data' => User::all(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string']
        ]);

        $user = new User();

        $user->name = $request->input('name');
        $user->email = $request->input('email');
        $user->password = $request->input('password');

        $success = $user->save();

        if (!$success) {
            return response()->json([
                'success' => $success,
                'data' => [],
                'message' => "Ocorreu um erro ao criar o usuário. Verifique as informações enviadas e tente novamente.",
                'errors' => []
            ]);
        }

        return response()->json([
            'success' => $success,
            'data' => [],
            'message' => "Usuário cadastrado com sucesso.",
            'errors' => []
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => ['string', 'max:255'],
            'email' => ['string', 'email'],
            'password' => ['string']
        ]);

        // TODO: Testar com cláusula `if` no lugar de `??`, para verificar se é erro de validação.
        if ($request->input('name'))
            $user->name = $request->input('name');

        if ($request->input('email'))
            $user->email = $request->input('email');

        if ($request->input('password'))
            $user->password = $request->input('password');

        // $request->input('name') ??
        // $request->input('email') ?? $user->email = $request->input('email');
        // $request->input('password') ?? $user->password = $request->input('password');

        $success = $user->save();

        if (!$success) {
            return response()->json([
                'success' => $success,
                'data' => [],
                'message' => "Ocorreu um erro ao editar o usuário. Verifique as informações enviadas e tente novamente.",
                'errors' => []
            ]);
        }

        return response()->json([
            'success' => $success,
            'data' => [],
            'message' => "Usuário editado com sucesso.",
            'errors' => []
        ]);

    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        //
    }
}
