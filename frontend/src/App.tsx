import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ProductsPage } from './pages/ProductsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { OrdersPage } from './pages/OrdersPage';
import { DepositsPage } from './pages/DepositsPage';
import { CustomersPage } from './pages/CustomersPage';
import LoginForm from './components/LoginForm';
import { useAuth } from './hooks/useAuth';
import { UsersPage } from './pages/UsersPage';
import './App.css';

const App: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, error, isLoading, isInitializing, login } = useAuth();

  // Tela de carregamento inicial enquanto valida o estado da sessão
  if (isInitializing) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100">
        <p className="text-sm font-medium animate-pulse">Carregando sistema...</p>
      </main>
    );
  }

  // Se não houver usuário autenticado, renderiza a tela de Login recebida da main
  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
        <LoginForm onSubmit={login} isLoading={isLoading} error={error} />
      </main>
    );
  }

  // Usuário autenticado: Renderiza o layout completo do Painel com as Rotas
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex transition-colors duration-200">
      {/* Menu Lateral */}
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Conteúdo Principal */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <Header isCollapsed={isCollapsed} />

        <main className="flex-1 p-6 overflow-y-auto bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
          <Routes>
            <Route path="/" element={<Navigate to="/products" replace />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/deposits" element={<DepositsPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="*" element={<Navigate to="/products" replace />} />
			<Route path="/users" element={<UsersPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default App;