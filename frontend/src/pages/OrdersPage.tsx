
import React, { useEffect, useState } from 'react';
import {
  Search,
  Plus,
  Eye,
  Trash2,
  X,
  Pencil,
} from 'lucide-react';

import type {
  Order,
  OrderFormData,
  PaymentMethod,
  Product,
  Deposit,
} from '../types/api';

import { getProducts } from '../services/productService';
import { getDeposits } from '../services/depositService';

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

  const [products, setProducts] = useState<Product[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const initialFormData: OrderFormData = {
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
  };

  const [formData, setFormData] = useState<OrderFormData>(initialFormData);

  // Carregar pedidos
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        setError('');

        const [ordersData, productsData, depositsData] = await Promise.all([
          getOrders(),
          getProducts(),
          getDeposits(),
        ]);

        setOrders(ordersData);

        setProducts(
          productsData.filter((product) => product.is_active)
        );

        setDeposits(
          depositsData.filter((deposit) => deposit.is_active)
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Erro ao carregar os dados.'
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
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
      ...initialFormData,
      items: [...initialFormData.items],
    });

    setEditingOrderId(null);
    setError('');
  }

  // Abrir formulário para criar pedido
  function handleOpenCreateModal() {
    resetForm();
    setIsModalOpen(true);
  }

  // Abrir formulário para editar pedido
  function handleEditOrder(order: Order) {
    setError('');

    setEditingOrderId(order.id);

    setFormData({
      customer_id: order.customer_id,
      status: order.status,
      payment_method: order.payment_method,
      notes: order.notes ?? '',
      items: order.items.map((item) => ({
        product_id: item.product_id,
        deposit_id: item.deposit_id,
        quantity: item.quantity,
        unit_price: Number(item.unit_price),
      })),
    });

    setSelectedOrder(null);
    setIsModalOpen(true);
  }

  // Atualizar campo do formulário
  function handleFormChange<K extends keyof OrderFormData>(
    field: K,
    value: OrderFormData[K]
  ) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  // Atualizar item do pedido
  function handleItemChange(
    index: number,
    field: 'product_id' | 'deposit_id' | 'quantity',
    value: number
  ) {
    setFormData((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, [field]: value }
          : item
      ),
    }));
  }

  // Adicionar produto
  function handleAddItem() {
    setFormData((current) => ({
      ...current,
      items: [
        ...current.items,
        {
          product_id: 1,
          deposit_id: 1,
          quantity: 1,
          unit_price: 0,
        },
      ],
    }));
  }

  // Remover produto
  function handleRemoveItem(index: number) {
    if (formData.items.length <= 1) {
      setError('O pedido precisa ter pelo menos um produto.');
      return;
    }

    setError('');

    setFormData((current) => ({
      ...current,
      items: current.items.filter(
        (_, itemIndex) => itemIndex !== index
      ),
    }));
  }

  // Criar ou atualizar pedido
  async function handleSubmitOrder(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    try {
      setIsSaving(true);
      setError('');

      const payload = {
        customer_id: Number(formData.customer_id),
        status: formData.status,
        payment_method: formData.payment_method,
        notes: formData.notes || null,
        items: formData.items.map((item) => ({
          product_id: Number(item.product_id),
          deposit_id: Number(item.deposit_id),
          quantity: Number(item.quantity),
        })),
      };

      if (editingOrderId !== null) {
        // Atualizar pedido existente
        const updatedOrder = await updateOrder(
          editingOrderId,
          payload
        );

        setOrders((current) =>
          current.map((order) =>
            order.id === editingOrderId
              ? updatedOrder
              : order
          )
        );

        if (selectedOrder?.id === editingOrderId) {
          setSelectedOrder(updatedOrder);
        }
      } else {
        // Criar novo pedido
        const newOrder = await createOrder(formData);

        setOrders((current) => [
          newOrder,
          ...current,
        ]);
      }

      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erro ao salvar pedido.'
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
          onClick={handleOpenCreateModal}
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
      {error && !isModalOpen && (
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
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    Carregando pedidos...
                  </td>
                </tr>
              ) : filteredOrders.length > 0 ? (

                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-100">
                      #{order.id}
                    </td>

                    <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-200">
                      {order.customer?.name ?? `Cliente #${order.customer_id}`}
                    </td>

                    <td className="px-6 py-4 uppercase text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {order.payment_method?.replace('_', ' ') ?? 'Não informado'}
                    </td>

                    <td className="px-6 py-4 font-bold text-antonela-600 dark:text-antonela-200">
                      R$ {Number(order.total).toFixed(2)}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                          order.status === 'confirmed'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                            : order.status === 'pending'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
                        }`}
                      >
                        {order.status === 'confirmed'
                          ? 'Confirmado'
                          : order.status === 'pending'
                          ? 'Pendente'
                          : 'Cancelado'}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right whitespace-nowrap">

                      {/* Visualizar */}
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                        title="Visualizar pedido"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Editar */}
                      <button
                        onClick={() => handleEditOrder(order)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors cursor-pointer"
                        title="Editar pedido"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      {/* Cancelar */}
                      {order.status !== 'cancelled' && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="p-1.5 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition-colors cursor-pointer"
                          title="Cancelar pedido"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}

                      {/* Excluir */}
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors cursor-pointer"
                        title="Excluir pedido"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                    </td>
                  </tr>
                ))

              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    Nenhum pedido encontrado.
                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de criação e edição */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">

          <div className="w-full max-w-lg bg-white dark:bg-slate-800 h-full p-6 shadow-xl flex flex-col overflow-y-auto">

            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                  {editingOrderId !== null
                    ? `Editar Pedido #${editingOrderId}`
                    : 'Novo Pedido'}
                </h2>

                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Preencha os dados do pedido.
                </p>
              </div>

              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmitOrder}
              className="space-y-5"
            >

              {/* Cliente */}
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
                    handleFormChange('customer_id', Number(e.target.value))
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Status *
                </label>

                <select
                  value={formData.status}
                  onChange={(e) =>
                    handleFormChange(
                      'status',
                      e.target.value as OrderFormData['status']
                    )
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-100"
                >
                  <option value="pending">Pendente</option>
                  <option value="confirmed">Confirmado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>

              {/* Pagamento */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Forma de Pagamento *
                </label>

                <select
                  value={formData.payment_method}
                  onChange={(e) =>
                    handleFormChange(
                      'payment_method',
                      e.target.value as PaymentMethod
                    )
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-100"
                >
                  <option value="pix">PIX</option>
                  <option value="credit_card">Cartão de Crédito</option>
                  <option value="debit_card">Cartão de Débito</option>
                  <option value="cash">Dinheiro</option>
                </select>
              </div>

              {/* Produtos */}
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4">

                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                    Produtos do pedido
                  </h3>

                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center gap-1 text-sm text-antonela-600 hover:text-antonela-500 font-medium cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar produto
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.items.map((item, index) => (
                    <div
                      key={index}
                      className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg space-y-3"
                    >

                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                          Produto {index + 1}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          disabled={formData.items.length <= 1}
                          className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          title="Remover produto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                  <div>
                    <label className="block text-xs text-slate-500 mb-1">
                      Produto *
                    </label>

                    <select
                      required
                      value={item.product_id || ''}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          'product_id',
                          Number(e.target.value)
                        )
                      }
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-100"
                    >
                      <option value="" disabled>
                        Selecione um produto
                      </option>

                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.title}
                          {product.sku ? ` - ${product.sku}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                   <div>
                    <label className="block text-xs text-slate-500 mb-1">
                      Depósito *
                    </label>

                    <select
                      required
                      value={item.deposit_id || ''}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          'deposit_id',
                          Number(e.target.value)
                        )
                      }
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-100"
                    >
                      <option value="" disabled>
                        Selecione um depósito
                      </option>

                      {deposits.map((deposit) => (
                        <option key={deposit.id} value={deposit.id}>
                          {deposit.name}
                        </option>
                      ))}
                    </select>
                  </div>

                      <div>
                        <label className="block text-xs text-slate-500 mb-1">
                          Quantidade *
                        </label>

                        <input
                          required
                          min="1"
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              'quantity',
                              Number(e.target.value)
                            )
                          }
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-100"
                        />
                      </div>

                    </div>
                  ))}
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Observações
                </label>

                <textarea
                  rows={3}
                  value={formData.notes || ''}
                  onChange={(e) =>
                    handleFormChange('notes', e.target.value)
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Erro no formulário */}
              {error && (
                <div className="p-3 rounded-lg bg-rose-100 text-rose-700 text-sm">
                  {error}
                </div>
              )}

              {/* Botões */}
              <div className="flex gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">

                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  disabled={isSaving}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-lg cursor-pointer disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2.5 bg-antonela-600 hover:bg-antonela-500 disabled:opacity-50 text-white font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  {isSaving
                    ? 'Salvando...'
                    : editingOrderId !== null
                    ? 'Salvar alterações'
                    : 'Criar Pedido'}
                </button>

              </div>

            </form>
          </div>
        </div>
      )}

      {/* Modal de visualização */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto space-y-4 shadow-xl border border-slate-200 dark:border-slate-700">

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
                {selectedOrder.status === 'pending'
                  ? 'Pendente'
                  : selectedOrder.status === 'confirmed'
                  ? 'Confirmado'
                  : 'Cancelado'}
              </p>

              <p>
                <strong>Observações:</strong>{' '}
                {selectedOrder.notes || 'Nenhuma'}
              </p>

            </div>

            {/* Itens do pedido */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
              <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-3">
                Produtos
              </h4>

              <div className="space-y-3">
                {selectedOrder.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between gap-3 text-sm border-b border-slate-100 dark:border-slate-700 pb-3"
                  >
                    <div>
                      <p className="font-medium text-slate-800 dark:text-slate-100">
                        {item.product?.title ?? `Produto #${item.product_id}`}
                      </p>

                      <p className="text-slate-500 dark:text-slate-400">
                        Depósito: {item.deposit?.name ?? `#${item.deposit_id}`}
                      </p>

                      <p className="text-slate-500 dark:text-slate-400">
                        Quantidade: {item.quantity}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-medium text-slate-700 dark:text-slate-200">
                        R$ {Number(item.subtotal).toFixed(2)}
                      </p>

                      <p className="text-xs text-slate-500">
                        R$ {Number(item.unit_price).toFixed(2)} / un.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-slate-200 dark:border-slate-700 pt-4">
              <strong className="text-slate-700 dark:text-slate-200">
                Total
              </strong>

              <span className="text-lg text-antonela-600 dark:text-antonela-200 font-bold">
                R$ {Number(selectedOrder.total).toFixed(2)}
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleEditOrder(selectedOrder)}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-antonela-600 hover:bg-antonela-500 text-white font-medium rounded-lg cursor-pointer"
              >
                <Pencil className="w-4 h-4" />
                Editar
              </button>

              <button
                onClick={() => setSelectedOrder(null)}
                className="flex-1 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-lg cursor-pointer"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
