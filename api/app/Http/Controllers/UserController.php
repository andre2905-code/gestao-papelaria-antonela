<?php

namespace App\Http\Controllers;

use App\Enums\Role;
use App\Models\User;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        return response()->json([
            'success' => null,
            'data' => User::query()->latest()->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
        ]);

        User::create($validated);

        return response()->json([
            'success' => true,
            'data' => [],
            'message' => 'Usuário cadastrado com sucesso.',
            'errors' => [],
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
    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => [
                'sometimes',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'password' => ['sometimes', 'string', 'min:8'],
        ]);

        $user->update($validated);

        return response()->json([
            'success' => true,
            'data' => [],
            'message' => 'Usuário editado com sucesso.',
            'errors' => [],
        ]);
    }

    public function changeRole(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'role' => ['required', Rule::enum(Role::class)],
        ]);
        $role = Role::from($validated['role']);

        Gate::authorize('changeRole', [$user, $role]);

        $user->role = $role;
        $user->save();

        return response()->json([
            'success' => true,
            'data' => $user->fresh(),
            'message' => 'Papel do usuário alterado com sucesso.',
            'errors' => [],
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user): JsonResponse
    {
        $user->delete();

        return response()->json([
            'success' => true,
            'data' => [],
            'message' => 'Usuário excluído com sucesso.',
            'errors' => [],
        ]);
    }
}
