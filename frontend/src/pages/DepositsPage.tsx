import React, { useEffect, useState } from 'react';
import {
  Warehouse,
  Plus,
  Search,
  Trash2,
  X,
  Pencil,
  Eye,
  Power,
} from 'lucide-react';

import type { Deposit } from '../types/api';

import {
  getDeposits,
  createDeposit,
  updateDeposit,
  deleteDeposit,
} from '../services/depositService';

export const DepositsPage: React.FC = () => {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepositId, setEditingDepositId] = useState<number | null>(null);
  const [selectedStock, setSelectedStock] = useState<Deposit | null>(null);

  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // Carregar depósitos e seus produtos
  useEffect(() => {
    async function loadDeposits() {
      try {
        setIsLoading(true);
        setError('');

        const data = await getDeposits();

        console.log('Depósitos recebidos da API:', data);

        setDeposits(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Erro ao carregar depósitos.'
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadDeposits();
  }, []);

  // Filtrar depósitos
  const filteredDeposits = deposits.filter((deposit) =>
    deposit.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Limpar formulário
  function resetForm() {
    setName('');
    setEditingDepositId(null);
    setError('');
  }

  // Abrir modal para criar
  function handleOpenCreateModal() {
    resetForm();
    setIsModalOpen(true);
  }

  // Abrir modal para editar
  function handleEditDeposit(deposit: Deposit) {
    setEditingDepositId(deposit.id);
    setName(deposit.name);
    setError('');
    setIsModalOpen(true);
  }

  // Criar ou atualizar depósito
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setIsSaving(true);
      setError('');

      const payload = {
        name: name.trim(),
      };

      if (!payload.name) {
        setError('Informe o nome do depósito.');
        return;
      }

      if (editingDepositId !== null) {
        const updatedDeposit = await updateDeposit(
          editingDepositId,
          payload
        );

        setDeposits((current) =>
          current.map((deposit) =>
            deposit.id === editingDepositId
              ? { ...deposit, ...updatedDeposit, items: deposit.items }
              : deposit
          )
        );

        setSelectedStock((current) =>
          current?.id === editingDepositId
            ? { ...current, ...updatedDeposit, items: current.items }
            : current
        );
      } else {
        const newDeposit = await createDeposit(payload);

        setDeposits((current) => [
          ...current,
          { ...newDeposit, items: newDeposit.items ?? [] },
        ]);
      }

      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erro ao salvar depósito.'
      );
    } finally {
      setIsSaving(false);
    }
  }

  // Ativar ou desativar depósito
  async function handleToggleStatus(deposit: Deposit) {
    const newStatus = !deposit.is_active;

    const confirmed = window.confirm(
      `Deseja ${newStatus ? 'ativar' : 'desativar'} o depósito "${deposit.name}"?`
    );

    if (!confirmed) return;

    try {
      setError('');

      const updatedDeposit = await updateDeposit(deposit.id, {
        is_active: newStatus,
      });

      setDeposits((current) =>
        current.map((item) =>
          item.id === deposit.id
            ? { ...item, ...updatedDeposit, items: item.items }
            : item
        )
      );

      setSelectedStock((current) =>
        current?.id === deposit.id
          ? { ...current, ...updatedDeposit, items: current.items }
          : current
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erro ao alterar situação do depósito.'
      );
    }
  }

  // Excluir depósito
  async function handleDeleteDeposit(id: number) {
    const confirmed = window.confirm(
      'Deseja excluir definitivamente este depósito? Essa operação não poderá ser desfeita.'
    );

    if (!confirmed) return;

    try {
      setError('');

      await deleteDeposit(id);

      setDeposits((current) =>
        current.filter((deposit) => deposit.id !== id)
      );

      if (selectedStock?.id === id) {
        setSelectedStock(null);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erro ao excluir depósito.'
      );
    }
  }

  return (
    <div className="space-y-6">

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Depósitos
          </h1>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            Gerencie os locais e canais de estoque da loja.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center justify-center px-4 py-2.5 bg-antonela-600 hover:bg-antonela-500 text-white font-medium rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-5 h-5 mr-2" />
          Novo Depósito
        </button>
      </div>

      {/* Pesquisa */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

        <input
          type="text"
          placeholder="Pesquisar depósito..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-antonela-500"
        />
      </div>

      {/* Erro */}
      {error && !isModalOpen && (
        <div className="p-3 rounded-lg bg-rose-100 text-rose-700 text-sm">
          {error}
        </div>
      )}

      {/* Lista de depósitos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        {isLoading ? (
          <p className="col-span-full py-8 text-center text-slate-400">
            Carregando depósitos...
          </p>
        ) : filteredDeposits.length > 0 ? (
          filteredDeposits.map((deposit) => (
            <div
              key={deposit.id}
              className="p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-4 shadow-xs"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-antonela-50 dark:bg-slate-700 text-antonela-600 dark:text-antonela-200 rounded-lg">
                    <Warehouse className="w-6 h-6" />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">
                      {deposit.name}
                    </h3>

                    <span
                      className={`text-xs font-semibold ${
                        deposit.is_active
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {deposit.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {/* Editar */}
                  <button
                    onClick={() => handleEditDeposit(deposit)}
                    title="Editar depósito"
                    className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg cursor-pointer"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>

                  {/* Ativar ou desativar */}
                  <button
                    onClick={() => handleToggleStatus(deposit)}
                    title={deposit.is_active ? 'Desativar depósito' : 'Ativar depósito'}
                    className="p-1.5 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg cursor-pointer"
                  >
                    <Power className="w-4 h-4" />
                  </button>

                  {/* Excluir */}
                  <button
                    onClick={() => handleDeleteDeposit(deposit.id)}
                    title="Excluir depósito"
                    className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400">
                  Produtos cadastrados:{' '}
                  <strong>
                    {deposit.items?.length ?? 0}
                  </strong>
                </span>

                <button
                  onClick={() => setSelectedStock(deposit)}
                  className="flex items-center gap-1 text-antonela-600 dark:text-antonela-200 font-semibold hover:underline cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  Ver estoque
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="col-span-full py-8 text-center text-slate-400">
            Nenhum depósito encontrado.
          </p>
        )}
      </div>

      {/* Modal de criação e edição */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl w-full max-w-sm space-y-4 shadow-xl border border-slate-200 dark:border-slate-700">

            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {editingDepositId !== null
                  ? 'Editar Depósito'
                  : 'Criar Novo Depósito'}
              </h2>

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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Nome *
                </label>

                <input
                  required
                  type="text"
                  maxLength={255}
                  placeholder="Ex: Loja Física, Estoque Central"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-100"
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-rose-100 text-rose-700 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2 bg-antonela-600 hover:bg-antonela-500 disabled:opacity-50 text-white font-semibold rounded-lg cursor-pointer"
                >
                  {isSaving
                    ? 'Salvando...'
                    : editingDepositId !== null
                    ? 'Salvar alterações'
                    : 'Cadastrar'}
                </button>

                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="flex-1 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de estoque */}
      {selectedStock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl w-full max-w-md space-y-4 shadow-xl border border-slate-200 dark:border-slate-700">

            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  Estoque: {selectedStock.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Produtos armazenados neste depósito
                </p>
              </div>

              <button
                onClick={() => setSelectedStock(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
              {selectedStock.items && selectedStock.items.length > 0 ? (
                selectedStock.items.map((item) => (
                  <div
                    key={item.id}
                    className="py-2.5 flex justify-between items-center text-sm"
                  >
                    <div>
                      <p className="font-medium text-slate-800 dark:text-slate-100">
                        {item.product?.title ?? `Produto #${item.product_id}`}
                      </p>

                      <p className="text-xs text-slate-400">
                        SKU: {item.product?.sku || '-'}
                      </p>
                    </div>

                    <span className="font-bold text-antonela-600 dark:text-antonela-200">
                      {item.quantity} un.
                    </span>
                  </div>
                ))
              ) : (
                <p className="py-4 text-center text-xs text-slate-400">
                  Nenhum produto cadastrado neste depósito.
                </p>
              )}
            </div>

            <button
              onClick={() => setSelectedStock(null)}
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