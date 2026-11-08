
import { apiFetch } from './api';
import type { Deposit } from '../types/api';

export type DepositPayload = {
  name: string;
};

export type UpdateDepositPayload = {
  name?: string;
  is_active?: boolean;
};

// Listar depósitos
export async function getDeposits(): Promise<Deposit[]> {
  return apiFetch<Deposit[]>('/deposits');
}

// Buscar um depósito
export async function getDeposit(id: number): Promise<Deposit> {
  return apiFetch<Deposit>(`/deposits/${id}`);
}

// Criar depósito
export async function createDeposit(
  data: DepositPayload
): Promise<Deposit> {
  return apiFetch<Deposit>('/deposits', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Atualizar depósito
export async function updateDeposit(
  id: number,
  data: UpdateDepositPayload
): Promise<Deposit> {
  return apiFetch<Deposit>(`/deposits/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// Excluir depósito
export async function deleteDeposit(id: number): Promise<void> {
  await apiFetch(`/deposits/${id}`, {
    method: 'DELETE',
  });
}
