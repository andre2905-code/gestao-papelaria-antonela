
import { apiFetch } from './api';
import type { Category, CategoryFormData } from '../types/api';

export async function getCategories(): Promise<Category[]> {
  return apiFetch<Category[]>('/categories');
}

export async function createCategory(
  data: CategoryFormData
): Promise<Category> {
  return apiFetch<Category>('/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCategory(
  id: number,
  data: CategoryFormData
): Promise<Category> {
  return apiFetch<Category>(`/categories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteCategory(id: number): Promise<void> {
  return apiFetch<void>(`/categories/${id}`, {
    method: 'DELETE',
  });
}
