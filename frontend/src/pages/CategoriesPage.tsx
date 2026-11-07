
import React, { useEffect, useState } from 'react';
import { Plus, Search, Tags, Trash2, X, Pencil } from 'lucide-react';
import type { Category } from '../types/api';

import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../services/categoryService';

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [name, setName] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState('');

  // Busca as categorias no backend.
  async function loadCategories() {
    try {
      setError('');

      const data = await getCategories();

      setCategories(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar as categorias.'
      );
    } finally {
      setIsLoading(false);
    }
  }

  // Executa quando a página é carregada.
  useEffect(() => {
    loadCategories();
  }, []);

  // Abre o modal para cadastrar uma categoria.
  function openCreateModal() {
    setEditingCategory(null);
    setName('');
    setError('');
    setIsModalOpen(true);
  }

  // Abre o modal para editar uma categoria.
  function openEditModal(category: Category) {
    setEditingCategory(category);
    setName(category.name);
    setError('');
    setIsModalOpen(true);
  }

  // Fecha o modal e limpa os campos.
  function closeModal() {
    setIsModalOpen(false);
    setEditingCategory(null);
    setName('');
  }

  // Filtra as categorias pelo nome.
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Cadastra ou atualiza uma categoria.
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const categoryName = name.trim();

    if (!categoryName) {
      setError('Informe o nome da categoria.');
      return;
    }

    try {
      setIsSaving(true);
      setError('');

      if (editingCategory) {
        // Atualiza uma categoria existente.
        const updatedCategory = await updateCategory(
          editingCategory.id,
          { name: categoryName }
        );

        setCategories((current) =>
          current.map((category) =>
            category.id === editingCategory.id
              ? updatedCategory
              : category
          )
        );
      } else {
        // Cadastra uma nova categoria.
        const newCategory = await createCategory({
          name: categoryName,
        });

        setCategories((current) => [...current, newCategory]);
      }

      closeModal();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível salvar a categoria.'
      );
    } finally {
      setIsSaving(false);
    }
  }

  // Exclui uma categoria.
  async function handleDelete(id: number) {
    const confirmed = window.confirm(
      'Deseja realmente excluir esta categoria?'
    );

    if (!confirmed) {
      return;
    }

    try {
      setError('');

      await deleteCategory(id);

      setCategories((current) =>
        current.filter((category) => category.id !== id)
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível excluir a categoria.'
      );
    }
  }

  return (
    <div className="space-y-6">

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Categorias
          </h1>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            Gerencie os departamentos da loja.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="flex items-center justify-center px-4 py-2.5 bg-antonela-600 hover:bg-antonela-500 text-white font-medium rounded-lg cursor-pointer shadow-xs"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nova Categoria
        </button>
      </div>

      {/* Campo de pesquisa */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

        <input
          type="text"
          placeholder="Pesquisar categoria..."
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

      {/* Tabela de categorias */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
        <table className="w-full text-left text-sm">

          <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-6 py-3 font-semibold">
                Categoria
              </th>

              <th className="px-6 py-3 font-semibold">
                Produtos Vinculados
              </th>

              <th className="px-6 py-3 font-semibold">
                Status
              </th>

              <th className="px-6 py-3 font-semibold text-right">
                Ações
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">

            {isLoading ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-8 text-center text-slate-400"
                >
                  Carregando categorias...
                </td>
              </tr>
            ) : filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <tr
                  key={category.id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30"
                >

                  {/* Nome */}
                  <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-100">
                    <div className="flex items-center space-x-3">
                      <Tags className="w-4 h-4 text-antonela-600 dark:text-antonela-200" />

                      <span>{category.name}</span>
                    </div>
                  </td>

                  {/* Quantidade de produtos */}
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    {category.products_count ?? 0}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 text-xs rounded-full font-semibold ${
                        category.is_active
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {category.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>

                  {/* Botões de ação */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center gap-2">

                      <button
                        type="button"
                        onClick={() => openEditModal(category)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors cursor-pointer"
                        title="Editar categoria"
                        aria-label={`Editar ${category.name}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(category.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors cursor-pointer"
                        title="Excluir categoria"
                        aria-label={`Excluir ${category.name}`}
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
                  colSpan={4}
                  className="px-6 py-8 text-center text-slate-400"
                >
                  Nenhuma categoria encontrada.
                </td>
              </tr>
            )}

          </tbody>
        </table>
      </div>

      {/* Modal de cadastro e edição */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">

          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl w-full max-w-sm space-y-4 shadow-xl border border-slate-200 dark:border-slate-700">

            {/* Cabeçalho do modal */}
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {editingCategory
                  ? 'Editar Categoria'
                  : 'Criar Categoria'}
              </h2>

              <button
                type="button"
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
                aria-label="Fechar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="space-y-4">

              <input
                required
                type="text"
                maxLength={255}
                placeholder="Nome da categoria"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-100"
              />

              <div className="flex space-x-2">

                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2 bg-antonela-600 hover:bg-antonela-500 disabled:opacity-50 text-white font-semibold rounded-lg cursor-pointer"
                >
                  {isSaving
                    ? 'Salvando...'
                    : editingCategory
                      ? 'Atualizar'
                      : 'Salvar'}
                </button>

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSaving}
                  className="flex-1 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>

              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
