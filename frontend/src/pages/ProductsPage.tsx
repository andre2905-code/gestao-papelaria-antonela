import React, { useState } from 'react';
import { Plus, Search, Trash2, Package, X } from 'lucide-react';
import { Product, ProductFormData } from '../types/api';

const initialProducts: Product[] = [
  {
    id: 1,
    title: 'Caderno Universitário 10 Matérias',
    price: 29.90,
    promo_price: 24.90,
    sku: 'CAD-001',
    is_active: true,
    category_id: 1,
    category: { id: 1, name: 'Cadernos' },
    deposits: [{ id: 1, stock: 50 }],
    stock_total: 150,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 2,
    title: 'Caneta Esferográfica Azul 0.7mm',
    price: 3.50,
    promo_price: null,
    sku: 'CAN-002',
    is_active: true,
    category_id: 2,
    category: { id: 2, name: 'Escrita' },
    deposits: [{ id: 1, stock: 200 }],
    stock_total: 200,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
  },
];

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    title: '',
    price: 0,
    promo_price: null,
    sku: '',
    category_id: 1,
    is_active: true,
  });

  const filteredProducts = products.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProduct: Product = {
      id: Date.now(),
      title: formData.title,
      price: Number(formData.price),
      promo_price: formData.promo_price ? Number(formData.promo_price) : null,
      sku: formData.sku || null,
      is_active: formData.is_active,
      category_id: Number(formData.category_id),
      category: { id: formData.category_id, name: 'Geral' },
      deposits: [],
      stock_total: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setProducts([newProduct, ...products]);
    setIsModalOpen(false);
    setFormData({ title: '', price: 0, promo_price: null, sku: '', category_id: 1, is_active: true });
  };

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja remover este produto?')) {
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Produtos</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Gerencie o catálogo de produtos e consulte estoques.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center px-4 py-2.5 bg-antonela-600 hover:bg-antonela-500 text-white font-medium rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-5 h-5 mr-2" />
          Novo Produto
        </button>
      </div>

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
              {filteredProducts.length > 0 ? (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-100 flex items-center space-x-3">
                      <div className="p-2 bg-antonela-50 dark:bg-slate-700 text-antonela-600 dark:text-antonela-200 rounded-lg">
                        <Package className="w-4 h-4" />
                      </div>
                      <span>{p.title}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{p.sku || '-'}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{p.category?.name || '-'}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-100">
                      R$ {p.price.toFixed(2)}
                      {p.promo_price && (
                        <span className="block text-xs text-emerald-600 dark:text-emerald-400">
                          Promo: R$ {p.promo_price.toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">{p.stock_total} un</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                          p.is_active
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                        }`}
                      >
                        {p.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                    Nenhum produto cadastrado ou encontrado na busca.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-800 h-full p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Novo Produto</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Título *</label>
                  <input
                    required
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Preço (R$) *</label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Preço Promo</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.promo_price || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, promo_price: e.target.value ? Number(e.target.value) : null })
                      }
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">SKU</label>
                  <input
                    type="text"
                    value={formData.sku || ''}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-100"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-antonela-600 hover:bg-antonela-500 text-white font-semibold rounded-lg shadow-xs transition-colors cursor-pointer mt-4"
                >
                  Salvar Produto
                </button>
              </form>
            </div>
            <button
              onClick={() => setIsModalOpen(false)}
              className="w-full py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};