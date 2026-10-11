import React, { useEffect, useState, useRef } from 'react';
import { User, Sun, Moon, ChevronDown, UserCog, Settings, SwitchCamera } from 'lucide-react';

interface HeaderProps {
  isCollapsed?: boolean;
}

export const Header: React.FC<HeaderProps> = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Fecha o minimenu ao clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white dark:bg-slate-800 border-b border-antonela-100 dark:border-slate-700 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 transition-colors duration-200">
      {/* Título com recuo em ecrãs móveis (pl-14) para não ficar atrás do botão hambúrguer */}
      <div className="flex items-center space-x-4 pl-14 lg:pl-0">
        <h2 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-100 whitespace-nowrap">
          Painel de Controle
        </h2>
      </div>

      <div className="flex items-center space-x-3">
        {/* Toggle Dark Mode */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          type="button"
          className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          title={isDarkMode ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
        >
          {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Menu do Operador de Sistema (Minimenu) */}
        <div className="relative border-l border-slate-200 dark:border-slate-700 pl-3" ref={menuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center space-x-3 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer focus:outline-none"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-tight">
                Atendimento Antonela
              </p>
              <p className="text-xs text-antonela-600 dark:text-antonela-200 font-medium">
                Operador de Sistema
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-antonela-50 dark:bg-slate-700 border border-antonela-200 dark:border-slate-600 flex items-center justify-center text-antonela-600 dark:text-antonela-200 shrink-0">
              <User className="w-5 h-5" />
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Minimenu Dropdown */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700 sm:hidden">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Atendimento Antonela</p>
                <p className="text-xs text-antonela-600 dark:text-antonela-200">Operador de Sistema</p>
              </div>

              <button
                onClick={() => setIsUserMenuOpen(false)}
                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-antonela-50 dark:hover:bg-slate-700 hover:text-antonela-600 dark:hover:text-antonela-200 flex items-center space-x-2.5 transition-colors cursor-pointer"
              >
                <UserCog className="w-4 h-4 text-slate-400" />
                <span>Perfil do Operador</span>
              </button>

              <button
                onClick={() => setIsUserMenuOpen(false)}
                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-antonela-50 dark:hover:bg-slate-700 hover:text-antonela-600 dark:hover:text-antonela-200 flex items-center space-x-2.5 transition-colors cursor-pointer"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Configurações do Painel</span>
              </button>

              <div className="my-1 border-t border-slate-100 dark:border-slate-700" />

              <button
                onClick={() => setIsUserMenuOpen(false)}
                className="w-full text-left px-4 py-2.5 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center space-x-2.5 transition-colors cursor-pointer"
              >
                <SwitchCamera className="w-4 h-4" />
                <span>Alternar Operador</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};