
import { apiFetch } from './api';
import type { Deposit } from '../types/api';

/**
 * Busca os depósitos cadastrados no backend.
 */
export async function getDeposits(): Promise<Deposit[]> {
  return apiFetch<Deposit[]>('/deposits');
}
