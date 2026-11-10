
import React, { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Trash2,
  Package,
  X,
  Pencil,
} from 'lucide-react';

import type { Product, Category, Deposit } from '../types/api';

import { getCategories } from '../services/categoryService';
import { getDeposits } from '../services/depositService';

import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  type ProductPayload,
} from '../services/productService';

type ProductFormState = {
  title: string;
  price: number | '';
  promo_price: number | null;
  sku: string;
  category_id: number;
  is_active: boolean;
  deposits: Array<{
    deposit_id: number;
    quantity: number;
  }>;
};

const initialForm: ProductFormState = {
  title: '',
  price: 0,
  promo_price: null,
  sku: '',
  category_id: 0,
  is_active: true,
  deposits: [{ deposit_id: 0, quantity: 1 }],
};

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] =
    useState<ProductFormState>({ ...initialForm });

  // Carrega produtos, categorias e depósitos do backend.
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        setError('');

        const [productsData, categoriesData, depositsData] =
          await Promise.all([
            getProducts(),
            getCategories(),
            getDeposits(),
          ]);

        setProducts(productsData);

        setCategories(
          categoriesData.filter((category) => category.is_active)
        );

        setDeposits(
          depositsData.filter((deposit) => deposit.is_active)
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Erro ao carregar produtos, categorias e depósitos.'
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  // Pesquisa por nome ou SKU.
  const filteredProducts = products.filter((product) => {
    const term = searchTerm.toLowerCase();

    return (
      product.title.toLowerCase().includes(term) ||
      (product.sku ?? '').toLowerCase().includes(term)
    );
  });

  // Abre o modal para cadastrar.
  function openCreateModal() {
    setEditingProduct(null);
    setFormData({ ...initialForm });
    setError('');
    setIsModalOpen(true);
  }

  // Abre o modal para editar.
  function openEditModal(product: Product) {
    setEditingProduct(product);
    setError('');

    const productWithDeposits = product as Product & {
      deposits?: Array<{
        id: number;
        pivot?: {
          quantity?: number;
        };
        quantity?: number;
      }>;
    };

    const productDeposits = productWithDeposits.deposits ?? [];

    setFormData({
      title: product.title,
      price: Number(product.price),
      promo_price:
        product.promo_price === null ||
        product.promo_price === undefined
          ? null
          : Number(product.promo_price),
      sku: product.sku ?? '',
      category_id: Number(product.category_id),
      is_active: product.is_active,
      deposits:
        productDeposits.length > 0
          ? productDeposits.map((deposit) => ({
              deposit_id: deposit.id,
              quantity: Number(
                deposit.pivot?.quantity ?? deposit.quantity ?? 1
              ),
            }))
          : [{ deposit_id: 0, quantity: 1 }],
    });

    setIsModalOpen(true);
  }

  // Fecha o modal.
  function closeModal() {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData({ ...initialForm });
    setError('');
  }

  // Atualiza um campo do formulário.
  function handleChange(
    field: keyof ProductFormState,
    value: string | number | boolean | null
  ) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function addDeposit() {
    setFormData((current) => ({
      ...current,
      deposits: [
        ...current.deposits,
        { deposit_id: 0, quantity: 1 },
      ],
    }));
  }

  function removeDeposit(index: number) {
    setFormData((current) => ({
      ...current,
      deposits: current.deposits.filter(
        (_, depositIndex) => depositIndex !== index
      ),
    }));
  }

  function updateDeposit(
    index: number,
    field: 'deposit_id' | 'quantity',
    value: number
  ) {
    setFormData((current) => ({
      ...current,
      deposits: current.deposits.map((deposit, depositIndex) =>
        depositIndex === index
          ? { ...deposit, [field]: value }
          : deposit
      ),
    }));
  }

  // Cadastra ou atualiza um produto.
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const title = formData.title.trim();
    const sku = formData.sku.trim();

    if (!title || (!editingProduct && !sku)) {
      setError('Preencha o título e o SKU do produto.');
      return;
    }

    if (formData.price === '' || formData.price <= 0) {
      setError('O preço não pode ser negativo.');
      return;
    }

    if (
      formData.promo_price !== null &&
      formData.promo_price >= formData.price
    ) {
      setError(
        'O preço promocional deve ser menor que o preço normal.'
      );
      return;
    }

    if (formData.category_id <= 0) {
      setError('Selecione uma categoria.');
      return;
    }

    if (formData.deposits.some((deposit) => deposit.deposit_id <= 0)) {
      setError('Selecione um depósito.');
      return;
    }

    if (formData.deposits.some((deposit) => deposit.quantity <= 0)) {
      setError('A quantidade deve ser maior que zero.');
      return;
    }

    if (
      new Set(formData.deposits.map((deposit) => deposit.deposit_id)).size
      !== formData.deposits.length
    ) {
      setError('Selecione depósitos diferentes para o produto.');
      return;
    }

    try {
      setIsSaving(true);
      setError('');

      if (editingProduct) {
        console.log('Produto que será atualizado:', editingProduct);
        const updatedProduct = await updateProduct(
          editingProduct.id,
          {
            title,
            price: Number(formData.price),
            promo_price: formData.promo_price,
            category_id: Number(formData.category_id),
            is_active: formData.is_active,
            deposits: formData.deposits.map((deposit) => ({
              id: Number(deposit.deposit_id),
              quantity: Number(deposit.quantity),
            })),
          }
        );

        setProducts((current) =>
          current.map((product) =>
            product.id === editingProduct.id
              ? updatedProduct
              : product
          )
        );
      } else {
        const payload: ProductPayload = {
          title,
          price: Number(formData.price),
          promo_price: formData.promo_price,
          sku,
          category_id: Number(formData.category_id),
          deposits: formData.deposits.map((deposit) => ({
            id: Number(deposit.deposit_id),
            quantity: Number(deposit.quantity),
          })),
        };

        const newProduct = await createProduct(payload);

        setProducts((current) => [newProduct, ...current]);
      }

      closeModal();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erro ao salvar produto.'
      );
    } finally {
      setIsSaving(false);
    }
  }

  // Exclui um produto.
  async function handleDelete(id: number) {
    const confirmed = window.confirm(
      'Tem certeza que deseja remover este produto?'
    );

    if (!confirmed) {
      return;
    }

    try {
      setError('');

      await deleteProduct(id);

      setProducts((current) =>
        current.filter((product) => product.id !== id)
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erro ao excluir produto.'
      );
    }
  }

  return (
    <div className="space-y-6">

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Produtos
          </h1>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            Gerencie o catálogo de produtos e consulte estoques.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="flex items-center justify-center px-4 py-2.5 bg-antonela-600 hover:bg-antonela-500 text-white font-medium rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-5 h-5 mr-2" />
          Novo Produto
        </button>
      </div>

      {/* Pesquisa */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

        <input
          type="text"
          placeholder="Pesquisar produto por nome ou SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-antonela-500"
        />
      </div>

      {/* Erros */}
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
                <th className="px-6 py-3 font-semibold">Produto</th>
                <th className="px-6 py-3 font-semibold">SKU</th>
                <th className="px-6 py-3 font-semibold">Categoria</th>
                <th className="px-6 py-3 font-semibold">Preço</th>
                <th className="px-6 py-3 font-semibold">Estoque Total</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold text-right">Ações</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-slate-400"
                  >
                    Carregando produtos...
                  </td>
                </tr>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-100">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-antonela-50 dark:bg-slate-700 text-antonela-600 dark:text-antonela-200 rounded-lg">
                          <Package className="w-4 h-4" />
                        </div>

                        <span>{product.title}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                      {product.sku || '-'}
                    </td>

                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {product.category?.name || '-'}
                    </td>

                    <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-100">
                      R$ {Number(product.price).toFixed(2)}

                      {product.promo_price !== null &&
                        product.promo_price !== undefined && (
                          <span className="block text-xs text-emerald-600 dark:text-emerald-400">
                            Promo: R$ {Number(product.promo_price).toFixed(2)}
                          </span>
                        )}
                    </td>

                    <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">
                      {product.stock_total ?? 0} un
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                          product.is_active
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                        }`}
                      >
                        {product.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(product)}
                          title="Editar produto"
                          aria-label={`Editar ${product.title}`}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(product.id)}
                          title="Excluir produto"
                          aria-label={`Excluir ${product.title}`}
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
                    colSpan={7}
                    className="px-6 py-8 text-center text-slate-400"
                  >
                    Nenhum produto cadastrado ou encontrado na busca.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-800 h-full p-6 shadow-xl flex flex-col overflow-y-auto">

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
              </h2>

              <button
                type="button"
                onClick={closeModal}
                disabled={isSaving}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
                aria-label="Fechar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 flex-1">

              {/* Título */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Título *
                </label>

                <input
                  required
                  type="text"
                  maxLength={255}
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Preços */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                    Preço (R$) *
                  </label>

                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      handleChange(
                        'price',
                        e.target.value === '' ? '' : Number(e.target.value)
                    )
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                    Preço promocional
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.promo_price ?? ''}
                    onChange={(e) =>
                      handleChange(
                        'promo_price',
                        e.target.value === ''
                          ? null
                          : Number(e.target.value)
                      )
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* SKU */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  SKU *
                </label>

                <input
                  required={!editingProduct}
                  type="text"
                  maxLength={100}
                  value={formData.sku}
                  disabled={!!editingProduct}
                  onChange={(e) => handleChange('sku', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-100 disabled:opacity-60"
                />

                {editingProduct && (
                  <p className="text-xs text-slate-400 mt-1">
                    A API atual não permite atualizar o SKU.
                  </p>
                )}
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Categoria *
                </label>

                <select
                  required
                  value={formData.category_id || ''}
                  onChange={(e) =>
                    handleChange('category_id', Number(e.target.value))
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-100"
                >
                  <option value="" disabled>
                    Selecione uma categoria
                  </option>

                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>

                {categories.length === 0 && (
                  <p className="text-xs text-rose-500 mt-1">
                    Nenhuma categoria ativa encontrada.
                  </p>
                )}
              </div>

              {/* Depósitos */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase text-slate-500">
                    Depósitos *
                  </label>

                  <button
                    type="button"
                    onClick={addDeposit}
                    disabled={
                      isSaving ||
                      formData.deposits.length >= deposits.length
                    }
                    className="flex items-center gap-1 text-xs font-semibold text-antonela-600 hover:text-antonela-500 disabled:opacity-50 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar depósito
                  </button>
                </div>

                {formData.deposits.map((productDeposit, index) => (
                  <div
                    key={`${index}-${productDeposit.deposit_id}`}
                    className="flex items-end gap-2"
                  >
                    <div className="flex-1">
                      <label className="block text-xs text-slate-500 mb-1">
                        Depósito
                      </label>

                      <select
                        required
                        value={productDeposit.deposit_id || ''}
                        onChange={(e) =>
                          updateDeposit(
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
                          <option
                            key={deposit.id}
                            value={deposit.id}
                            disabled={formData.deposits.some(
                              (selectedDeposit, selectedIndex) =>
                                selectedIndex !== index &&
                                selectedDeposit.deposit_id === deposit.id
                            )}
                          >
                            {deposit.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-28">
                      <label className="block text-xs text-slate-500 mb-1">
                        Quantidade
                      </label>

                      <input
                        required
                        type="number"
                        min="1"
                        step="1"
                        value={productDeposit.quantity}
                        onChange={(e) =>
                          updateDeposit(
                            index,
                            'quantity',
                            Number(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-100"
                      />
                    </div>

                    {formData.deposits.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDeposit(index)}
                        disabled={isSaving}
                        className="p-2 mb-0.5 text-slate-400 hover:text-rose-500 cursor-pointer"
                        aria-label="Remover depósito"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}

                {deposits.length === 0 && (
                  <p className="text-xs text-rose-500">
                    Nenhum depósito ativo encontrado.
                  </p>
                )}
              </div>

              {/* Status: somente edição */}
              {editingProduct && (
                <div className="flex items-center gap-2">
                  <input
                    id="product-active"
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) =>
                      handleChange('is_active', e.target.checked)
                    }
                  />

                  <label
                    htmlFor="product-active"
                    className="text-sm text-slate-600 dark:text-slate-300"
                  >
                    Produto ativo
                  </label>
                </div>
              )}

              {/* Botões */}
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  disabled={
                    isSaving ||
                    categories.length === 0 ||
                    deposits.length === 0
                  }
                  className="flex-1 py-2.5 bg-antonela-600 hover:bg-antonela-500 disabled:opacity-50 text-white font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  {isSaving
                    ? 'Salvando...'
                    : editingProduct
                      ? 'Atualizar Produto'
                      : 'Salvar Produto'}
                </button>

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSaving}
                  className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg cursor-pointer"
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
