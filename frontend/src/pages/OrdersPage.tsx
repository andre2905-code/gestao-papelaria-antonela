
import React, { useEffect, useState } from 'react';
import { Search, Plus, Eye, Trash2, X } from 'lucide-react';

import type {
  Order,
  OrderFormData,
  PaymentMethod,
} from '../types/api';

import {
  getOrders,
  createOrder,
  updateOrder,
  deleteOrder,
} from '../services/orderService';

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<OrderFormData>({
    customer_id: 1,
    status: 'pending',
    payment_method: 'pix',
    notes: '',
    items: [
      {
        product_id: 1,
        quantity: 1,
        unit_price: 29.90,
        deposit_id: 1,
      },
    ],
  });

  // Carregar pedidos da API
  useEffect(() => {
    async function loadOrders() {
      try {
        setIsLoading(true);
        setError('');

        const data = await getOrders();
        setOrders(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Erro ao carregar os pedidos.'
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadOrders();
  }, []);

  // Filtrar pedidos
  const filteredOrders = orders.filter(
    (order) =>
      (order.customer?.name ?? '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      order.id.toString().includes(searchTerm)
  );

  // Limpar formulário
  function resetForm() {
    setFormData({
      customer_id: 1,
      status: 'pending',
      payment_method: 'pix',
      notes: '',
      items: [
        {
          product_id: 1,
          quantity: 1,
          unit_price: 29.90,
          deposit_id: 1,
        },
      ],
    });
  }

  // Criar pedido
  async function handleCreateOrder(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    try {
      setIsSaving(true);
      setError('');

      const newOrder = await createOrder(formData);

      setOrders((current) => [newOrder, ...current]);

      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erro ao cadastrar pedido.'
      );
    } finally {
      setIsSaving(false);
    }
  }

  // Cancelar pedido
  async function handleCancelOrder(id: number) {
    const confirmed = window.confirm(
      'Deseja cancelar este pedido?'
    );

    if (!confirmed) return;

    try {
      setError('');

      const updatedOrder = await updateOrder(id, {
        status: 'cancelled',
      });

      setOrders((current) =>
        current.map((order) =>
          order.id === id ? updatedOrder : order
        )
      );

      if (selectedOrder?.id === id) {
        setSelectedOrder(updatedOrder);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erro ao cancelar pedido.'
      );
    }
  }

  // Excluir pedido
  async function handleDeleteOrder(id: number) {
    const confirmed = window.confirm(
      'Deseja excluir definitivamente este pedido?'
    );

    if (!confirmed) return;

    try {
      setError('');

      await deleteOrder(id);

      setOrders((current) =>
        current.filter((order) => order.id !== id)
      );

      if (selectedOrder?.id === id) {
        setSelectedOrder(null);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erro ao excluir pedido.'
      );
    }
  }

  return (
    <div className="space-y-6">

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Pedidos
          </h1>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            Acompanhe as vendas e ordens de pedido.
          </p>
        </div>

        <button
          onClick={() => {
            setError('');
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center px-4 py-2.5 bg-antonela-600 hover:bg-antonela-500 text-white font-medium rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-5 h-5 mr-2" />
          Novo Pedido
        </button>
      </div>

      {/* Pesquisa */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

        <input
          type="text"
          placeholder="Pesquisar por ID do pedido ou cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-antonela-500"
        />
      </div>

      {/* Mensagem de erro */}
      {error && (
        <div className="p-3 rounded-lg bg-rose-100 text-rose-700 text-sm">
          {error}
        </div>
      )}

      {/* Tabela */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">

            <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-3 font-semibold"># Pedido</th>
                <th className="px-6 py-3 font-semibold">Cliente</th>
                <th className="px-6 py-3 font-semibold">Pagamento</th>
                <th className="px-6 py-3 font-semibold">Total</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold text-right">Ações</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">

              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-slate-400"
                  >
                    Carregando pedidos...
                  </td>
                </tr>
              ) : filteredOrders.length > 0 ? (

                filteredOrders.map((o) => (
                  <tr
                    key={o.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-100">
                      #{o.id}
                    </td>

                    <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-200">
                      {o.customer?.name ?? `Cliente #${o.customer_id}`}
                    </td>

                    <td className="px-6 py-4 uppercase text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {o.payment_method?.replace('_', ' ') ?? 'Não informado'}
                    </td>

                    <td className="px-6 py-4 font-bold text-antonela-600 dark:text-antonela-200">
                      R$ {Number(o.total).toFixed(2)}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                          o.status === 'confirmed'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                            : o.status === 'pending'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
                        }`}
                      >
                        {o.status === 'confirmed'
                          ? 'Confirmado'
                          : o.status === 'pending'
                          ? 'Pendente'
                          : 'Cancelado'}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right space-x-2">

                      {/* Visualizar */}
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                        title="Visualizar Pedido"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Cancelar */}
                      {o.status !== 'cancelled' && (
                        <button
                          onClick={() => handleCancelOrder(o.id)}
                          className="p-1.5 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition-colors cursor-pointer"
                          title="Cancelar Pedido"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}

                      {/* Excluir */}
                      <button
                        onClick={() => handleDeleteOrder(o.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors cursor-pointer"
                        title="Excluir Pedido"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                    </td>
                  </tr>
                ))

              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-slate-400"
                  >
                    Nenhum pedido encontrado.
                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de criação */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">

          <div className="w-full max-w-lg bg-white dark:bg-slate-800 h-full p-6 shadow-xl flex flex-col justify-between overflow-y-auto">

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                  Novo Pedido
                </h2>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={handleCreateOrder}
                className="space-y-4"
              >

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                    ID do Cliente *
                  </label>

                  <input
                    required
                    min="1"
                    type="number"
                    value={formData.customer_id}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customer_id: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                    Forma de Pagamento *
                  </label>

                  <select
                    value={formData.payment_method}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        payment_method: e.target.value as PaymentMethod,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-100"
                  >
                    <option value="pix">PIX</option>
                    <option value="credit_card">Cartão de Crédito</option>
                    <option value="debit_card">Cartão de Débito</option>
                    <option value="cash">Dinheiro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                    Observações
                  </label>

                  <textarea
                    rows={2}
                    value={formData.notes || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        notes: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-100"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-2.5 bg-antonela-600 hover:bg-antonela-500 disabled:opacity-50 text-white font-semibold rounded-lg shadow-xs transition-colors cursor-pointer mt-4"
                >
                  {isSaving ? 'Salvando...' : 'Criar Pedido'}
                </button>

              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de visualização */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl w-full max-w-lg space-y-4 shadow-xl border border-slate-200 dark:border-slate-700">

            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Pedido #{selectedOrder.id}
              </h3>

              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">

              <p>
                <strong>Cliente:</strong>{' '}
                {selectedOrder.customer?.name ?? `Cliente #${selectedOrder.customer_id}`}
              </p>

              <p>
                <strong>Forma de Pagamento:</strong>{' '}
                <span className="uppercase font-semibold">
                  {selectedOrder.payment_method?.replace('_', ' ') ?? 'Não informado'}
                </span>
              </p>

              <p>
                <strong>Status:</strong>{' '}
                {selectedOrder.status}
              </p>

              <p>
                <strong>Observações:</strong>{' '}
                {selectedOrder.notes || 'Nenhuma'}
              </p>

              <p>
                <strong>Total:</strong>{' '}
                <span className="text-antonela-600 dark:text-antonela-200 font-bold">
                  R$ {Number(selectedOrder.total).toFixed(2)}
                </span>
              </p>

            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              className="w-full py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-lg cursor-pointer"
            >
              Fechar
            </button>

          </div>
        </div>
      )}

    </div>
  );
};
