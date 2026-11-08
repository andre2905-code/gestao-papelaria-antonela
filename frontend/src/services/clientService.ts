import { apiFetch } from './api';
import type { Customer, CustomerFormData } from '../types/api';

export type CustomerPayload = CustomerFormData;

function formatCustomerPayload(data: CustomerPayload) {
  return {
    ...data,
    name: data.name.trim(),
    email: data.email.trim(),
    phone: data.phone.trim() || null,
    cpf: data.cpf ? data.cpf.replace(/\D/g, '') : null,
    birth_date: data.birth_date || null,
  };
}

export async function getCustomers(): Promise<Customer[]> {
  return apiFetch<Customer[]>('/customers');
}

export async function createCustomer(
  data: CustomerPayload
): Promise<Customer> {
  return apiFetch<Customer>('/customers', {
    method: 'POST',
    body: JSON.stringify(formatCustomerPayload(data)),
  });
}

export async function updateCustomer(
  id: number,
  data: CustomerPayload
): Promise<Customer> {
  return apiFetch<Customer>(`/customers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(formatCustomerPayload(data)),
  });
}

export async function deleteCustomer(id: number): Promise<void> {
  await apiFetch(`/customers/${id}`, {
    method: 'DELETE',
  });
}