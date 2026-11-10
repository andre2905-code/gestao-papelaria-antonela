
import { apiFetch } from './api';
import type { User, UserFormData, UserRoleOption } from '../types/api';

type ApiResponse<T> = {
  success: boolean | null;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
};

export type UserPayload = Omit<UserFormData, 'password_confirmation'>;

export async function getUserRoles(): Promise<UserRoleOption[]> {
  const response = await apiFetch<ApiResponse<UserRoleOption[]>>('/users/roles');

  return response.data;
}

export async function getUsers(): Promise<User[]> {
  const response = await apiFetch<ApiResponse<User[]>>('/users');

  return response.data;
}

export async function createUser(data: UserFormData): Promise<void> {
  const payload: UserPayload = {
    name: data.name.trim(),
    email: data.email.trim(),
    password: data.password,
    role: data.role,
  };

  await apiFetch<ApiResponse<unknown>>('/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateUser(
  id: number,
  data: UserFormData
): Promise<void> {
  const payload: Partial<UserPayload> = {
    name: data.name.trim(),
    email: data.email.trim(),
  };

  // Só envia a senha quando o usuário deseja alterá-la.
  if (data.password.trim()) {
    payload.password = data.password;
  }

  await apiFetch<ApiResponse<unknown>>(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function changeUserRole(
  id: number,
  role: UserFormData['role'],
): Promise<void> {
  await apiFetch<ApiResponse<unknown>>(`/users/${id}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  });
}

export async function deleteUser(id: number): Promise<void> {
  await apiFetch<ApiResponse<unknown>>(`/users/${id}`, {
    method: 'DELETE',
  });
}
