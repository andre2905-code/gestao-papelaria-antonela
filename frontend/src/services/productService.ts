
import { apiFetch } from './api';
import type { Product } from '../types/api';

// Estrutura dos depósitos enviados para a API.
export type ProductDepositData = {
  id: number;
  quantity: number;
};

// Dados necessários para cadastrar um produto.
export type ProductPayload = {
  title: string;
  price: number;
  promo_price: number | null;
  sku: string;
  category_id: number;
  deposits: ProductDepositData[];
};

// Dados permitidos na atualização.
export type UpdateProductPayload = {
  title: string;
  price: number;
  promo_price: number | null;
  category_id: number;
  is_active: boolean;
  deposits: ProductDepositData[];
};

// Listar produtos.
export async function getProducts(): Promise<Product[]> {
  return apiFetch<Product[]>('/products');
}

// Cadastrar produto.
export async function createProduct(
  product: ProductPayload
): Promise<Product> {
  return apiFetch<Product>('/products', {
    method: 'POST',
    body: JSON.stringify(product),
  });
}

// Atualizar produto.
export async function updateProduct(
  id: number,
  product: UpdateProductPayload
): Promise<Product> {
  return apiFetch<Product>(`/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(product),
  });
}

// Excluir produto.
export async function deleteProduct(id: number): Promise<void> {
  return apiFetch<void>(`/products/${id}`, {
    method: 'DELETE',
  });
}
