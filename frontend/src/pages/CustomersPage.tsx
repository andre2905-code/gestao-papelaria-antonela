
import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Trash2,
  X,
  Pencil,
} from 'lucide-react';

import type { Customer, CustomerFormData } from '../types/api';

import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from '../services/clientService';

export const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [editingCustomer, setEditingCustomer] =
    useState<Customer | null>(null);

  const [error, setError] = useState('');

  const initialFormData: CustomerFormData = {
    name: '',
    email: '',
    phone: '',
    cpf: '',
    birth_date: '',
    is_active: true,
  };

  const [formData, setFormData] =
    useState<CustomerFormData>(initialFormData);

  // Carregar clientes
  useEffect(() => {
    async function loadCustomers() {
      try {
        setIsLoading(true);
        setError('');

        const data = await getCustomers();

        setCustomers(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Erro ao carregar clientes.'
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadCustomers();
  }, []);

  // Filtrar clientes
  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.cpf && customer.cpf.includes(searchTerm)) ||
    (customer.phone && customer.phone.includes(searchTerm))
  );

  // Limpar formulário
  function resetForm() {
    setFormData({ ...initialFormData });
    setEditingCustomer(null);
    setError('');
  }

  // Abrir formulário para editar cliente
  function handleEditCustomer(customer: Customer) {
    setEditingCustomer(customer);

    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone ?? '',
      cpf: customer.cpf ?? '',
      birth_date: customer.birth_date
        ? customer.birth_date.substring(0, 10)
        : '',
      is_active: customer.is_active,
    });

    setError('');
    setIsModalOpen(true);
  }

  // Criar ou atualizar cliente
  async function handleSaveCustomer(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    try {
      setIsSaving(true);
      setError('');

      const payload: CustomerFormData = {
        ...formData,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        cpf: formData.cpf.trim(),
        birth_date: formData.birth_date,
        is_active: formData.is_active ?? true,
      };

      if (editingCustomer) {
        // Atualizar cliente
        const updatedCustomer = await updateCustomer(
          editingCustomer.id,
          payload
        );

        setCustomers((current) =>
          current.map((customer) =>
            customer.id === updatedCustomer.id
              ? {
                  ...customer,
                  ...updatedCustomer,
                }
              : customer
          )
        );
      } else {
        // Criar cliente
        const newCustomer = await createCustomer(payload);

        setCustomers((current) => [
          newCustomer,
          ...current,
        ]);
      }

      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : editingCustomer
            ? 'Erro ao atualizar cliente.'
            : 'Erro ao cadastrar cliente.'
      );
    } finally {
      setIsSaving(false);
    }
  }

  // Excluir cliente
  async function handleDeleteCustomer(id: number) {
    const confirmed = window.confirm(
      'Tem certeza que deseja excluir este cliente?'
    );

    if (!confirmed) return;

    try {
      setError('');

      await deleteCustomer(id);

      setCustomers((current) =>
        current.filter((customer) => customer.id !== id)
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erro ao excluir cliente.'
      );
    }
  }

  return (
    <div className="space-y-6">

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Clientes
          </h1>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            Gerencie o cadastro de clientes e registros.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center px-4 py-2.5 bg-antonela-600 hover:bg-antonela-500 text-white font-medium rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-5 h-5 mr-2" />
          Novo Cliente
        </button>
      </div>

      {/* Pesquisa */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

        <input
          type="text"
          placeholder="Pesquisar por nome, CPF ou telefone..."
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

      {/* Tabela de clientes */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">

            <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-3 font-semibold">Cliente</th>
                <th className="px-6 py-3 font-semibold">Telefone</th>
                <th className="px-6 py-3 font-semibold">CPF</th>
                <th className="px-6 py-3 font-semibold">Pedidos</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold text-right">Ações</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">

              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    Carregando clientes...
                  </td>
                </tr>
              ) : filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-100">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-antonela-50 dark:bg-slate-700 text-antonela-600 dark:text-antonela-200 rounded-lg">
                          <Users className="w-4 h-4" />
                        </div>

                        <div>
                          <span>{customer.name}</span>
                          <p className="text-xs text-slate-400 font-normal">
                            {customer.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {customer.phone || '-'}
                    </td>

                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {customer.cpf || '-'}
                    </td>

                    <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200">
                      {customer.orders_count ?? 0} pedidos
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${
                          customer.is_active
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
                        }`}
                      >
                        {customer.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>

                    {/* Ações */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">

                        <button
                          onClick={() => handleEditCustomer(customer)}
                          title="Editar cliente"
                          className="p-1.5 text-antonela-600 hover:bg-antonela-50 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteCustomer(customer.id)}
                          title="Excluir cliente"
                          className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-slate-400"
                  >
                    Nenhum cliente encontrado.
                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de cadastro e edição */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">

          <div className="w-full max-w-md bg-white dark:bg-slate-800 h-full p-6 shadow-xl flex flex-col justify-between overflow-y-auto">

            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                  {editingCustomer ? 'Editar Cliente' : 'Novo Cliente'}
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

              <form
                onSubmit={handleSaveCustomer}
                className="space-y-4"
              >

                {/* Nome */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                    Nome Completo *
                  </label>

                  <input
                    required
                    type="text"
                    maxLength={255}
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-100"
                  />
                </div>

                {/* E-mail */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                    E-mail *
                  </label>

                  <input
                    required
                    type="email"
                    maxLength={255}
                    placeholder="cliente@email.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        email: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-100"
                  />
                </div>

                {/* Telefone */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                    Telefone
                  </label>

                  <input
                    type="text"
                    maxLength={20}
                    placeholder="(00) 00000-0000"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        phone: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-100"
                  />
                </div>

                {/* CPF */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                    CPF
                  </label>

                  <input
                    type="text"
                    maxLength={14}
                    placeholder="000.000.000-00"
                    value={formData.cpf}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cpf: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-100"
                  />
                </div>

                {/* Data de nascimento */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                    Data de Nascimento
                  </label>

                  <input
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        birth_date: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-100"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                    Status
                  </label>

                  <select
                    value={formData.is_active ? 'true' : 'false'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        is_active: e.target.value === 'true',
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-100"
                  >
                    <option value="true">Ativo</option>
                    <option value="false">Inativo</option>
                  </select>
                </div>

                {/* Erro do formulário */}
                {error && (
                  <div className="p-3 rounded-lg bg-rose-100 text-rose-700 text-sm">
                    {error}
                  </div>
                )}

                {/* Botões */}
                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 py-2.5 bg-antonela-600 hover:bg-antonela-500 disabled:opacity-50 text-white font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    {isSaving
                      ? 'Salvando...'
                      : editingCustomer
                        ? 'Salvar alterações'
                        : 'Salvar Cliente'}
                  </button>

                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => {
                      setIsModalOpen(false);
                      resetForm();
                    }}
                    className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
