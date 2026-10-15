import React, { useState } from 'react';
import { 
  Package, 
  Tags, 
  ShoppingCart, 
  Warehouse, 
  Users, 
  UserCog,
  Store,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { NavItem } from '../types/navigation';

const menuItems: NavItem[] = [
  { title: 'Produtos', path: '/products', icon: Package },
  { title: 'Categorias', path: '/categories', icon: Tags },
  { title: 'Pedidos', path: '/orders', icon: ShoppingCart },
  { title: 'Depósitos', path: '/deposits', icon: Warehouse },
  { title: 'Clientes', path: '/customers', icon: Users },
  { title: 'Usuários', path: '/users', icon: UserCog },
];

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-md bg-white dark:bg-slate-800 text-antonela-600 dark:text-antonela-200 shadow-md border border-antonela-100 dark:border-slate-700 focus:outline-none"
        >
          {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-slate-900/50 z-40 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-screen bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-r border-antonela-100 dark:border-slate-700 transition-all duration-300 ease-in-out flex flex-col justify-between shadow-sm
          ${isCollapsed ? 'w-20' : 'w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div>
          <div className="flex items-center justify-between h-16 px-4 border-b border-antonela-100 dark:border-slate-700">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="p-2 bg-antonela-600 text-white rounded-lg shrink-0 shadow-sm">
                <Store className="w-6 h-6" />
              </div>
              {!isCollapsed && (
                <div className="whitespace-nowrap">
                  <h1 className="font-bold text-slate-800 dark:text-slate-100 leading-tight">Papelaria Antonela</h1>
                  <p className="text-xs text-antonela-600 dark:text-antonela-200 font-medium">Painel de Gestão</p>
                </div>
              )}
            </div>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-antonela-600 dark:hover:text-antonela-200 hover:bg-antonela-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
          </div>

          <nav className="p-3 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all group relative ${
                      isActive
                        ? 'bg-antonela-600 text-white font-semibold shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-antonela-50 dark:hover:bg-slate-700 hover:text-antonela-600 dark:hover:text-antonela-200'
                    }`
                  }
                >
                  <Icon className={`w-5 h-5 shrink-0 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
                  {!isCollapsed && <span>{item.title}</span>}
                  {isCollapsed && (
                    <div className="hidden lg:block absolute left-full rounded-md px-2.5 py-1.5 ml-3 bg-slate-800 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 shadow-md">
                      {item.title}
                    </div>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-antonela-100 dark:border-slate-700 text-xs text-slate-400">
          {!isCollapsed && (
            <div className="flex flex-col space-y-0.5">
              <span className="font-medium text-slate-500 dark:text-slate-400">Projeto Integrador II</span>
              <span>v1.0.0</span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};