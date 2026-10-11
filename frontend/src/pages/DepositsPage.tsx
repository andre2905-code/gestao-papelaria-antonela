import React, { useState } from 'react';
import { Warehouse, Plus, Search, Trash2, X } from 'lucide-react';
import { Deposit } from '../types/api';

const initialDeposits: Deposit[] = [
  {
    id: 1,
    name: 'Loja Física',
    is_active: true,
    stock: [
      { product_id: 1, product: { id: 1, title: 'Caderno Universitário', sku: 'CAD-001' }, quantity: 50 },
      { product_id: 2, product: { id: 2, title: 'Caneta Esferográfica Azul', sku: 'CAN-002' }, quantity: 200 },
    ],
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 2,
    name: 'Estoque Central',
    is_active: true,
    stock: [
      { product_id: 1, product: { id: 1, title: 'Caderno Universitário', sku: 'CAD-001' }, quantity: 100 },
    ],
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
  },
];

export const DepositsPage: React.FC = () => {
  const [deposits, setDeposits] = useState<Deposit[]>(initialDeposits);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<Deposit | null>(null);
  const [name, setName] = useState('');

  const filteredDeposits = deposits.filter((d) =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const newDeposit: Deposit = {
      id: Date.now(),
      name,
      is_active: true,
      stock: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setDeposits([...deposits, newDeposit]);
    setName('');
    setIsModalOpen(false);
  };

  const handleDeleteDeposit = (id: number) => {
    if (confirm('Tem certeza que deseja desativar este depósito?')) {
      setDeposits(deposits.filter((d) => d.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Depósitos</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Gerencie os locais e canais de estoque da loja.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center px-4 py-2.5 bg-antonela-600 hover:bg-antonela-500 text-white font-medium rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-5 h-5 mr-2" />
          Novo Depósito
        </button>
      </div>

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDeposits.length > 0 ? (
          filteredDeposits.map((d) => (
            <div
              key={d.id}
              className="p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-4 shadow-xs"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-antonela-50 dark:bg-slate-700 text-antonela-600 dark:text-antonela-200 rounded-lg">
                    <Warehouse className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">{d.name}</h3>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Ativo</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteDeposit(d.id)}
                  className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400">
                  Itens em estoque: <strong>{d.stock?.length || 0}</strong>
                </span>

                <button
                  onClick={() => setSelectedStock(d)}
                  className="text-antonela-600 dark:text-antonela-200 font-semibold hover:underline cursor-pointer"
                >
                  Ver Estoque
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="col-span-full py-8 text-center text-slate-400">Nenhum depósito cadastrado.</p>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl w-full max-w-sm space-y-4 shadow-xl border border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Criar Novo Depósito</h2>
            <form onSubmit={handleCreateDeposit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Nome *</label>
                <input
                  required
                  type="text"
                  placeholder="Ex: Loja Física, Depósito Central"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-antonela-600 hover:bg-antonela-500 text-white font-semibold rounded-lg cursor-pointer"
                >
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedStock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl w-full max-w-md space-y-4 shadow-xl border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Estoque: {selectedStock.name}
              </h3>
              <button onClick={() => setSelectedStock(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
              {selectedStock.stock && selectedStock.stock.length > 0 ? (
                selectedStock.stock.map((item) => (
                  <div key={item.product_id} className="py-2.5 flex justify-between items-center text-sm">
                    <div>
                      <p className="font-medium text-slate-800 dark:text-slate-100">{item.product.title}</p>
                      <p className="text-xs text-slate-400">SKU: {item.product.sku || '-'}</p>
                    </div>
                    <span className="font-bold text-antonela-600 dark:text-antonela-200">{item.quantity} un</span>
                  </div>
                ))
              ) : (
                <p className="py-4 text-center text-xs text-slate-400">Nenhum produto cadastrado neste depósito.</p>
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