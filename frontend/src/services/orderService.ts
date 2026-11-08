
import { apiFetch } from './api';
import type { Order, OrderFormData } from '../types/api';


export type OrderItemPayload = {
  product_id: number;
  deposit_id: number;
  quantity: number;
};

export type OrderPayload = {
  customer_id: number;
  status?: OrderFormData['status'];
  payment_method: OrderFormData['payment_method'];
  notes: string | null;
  items: OrderItemPayload[];
};

export type UpdateOrderPayload = {
  customer_id?: number;
  status?: OrderFormData['status'];
  payment_method?: OrderFormData['payment_method'];
  notes?: string | null;
  items?: OrderItemPayload[];
};

// Listar pedidos
export async function getOrders(): Promise<Order[]> {
  return apiFetch<Order[]>('/orders');
}

// Criar pedido
export async function createOrder(
  order: OrderFormData
): Promise<Order> {
  const payload: OrderPayload = {
    customer_id: order.customer_id,
    status: order.status,
    payment_method: order.payment_method,
    notes: order.notes || null,
    items: order.items.map((item) => ({
      product_id: item.product_id,
      deposit_id: item.deposit_id,
      quantity: item.quantity,
    })),
  };

  return apiFetch<Order>('/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// Atualizar pedido
export async function updateOrder(
  id: number,
  data: UpdateOrderPayload
): Promise<Order> {
  return apiFetch<Order>(`/orders/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// Excluir pedido
export async function deleteOrder(id: number): Promise<void> {
  return apiFetch<void>(`/orders/${id}`, {
    method: 'DELETE',
  });
}
