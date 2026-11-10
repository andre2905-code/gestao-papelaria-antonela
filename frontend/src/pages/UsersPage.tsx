
import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Eye,
  EyeOff,
  UserCog,
} from 'lucide-react';

import type { User, UserFormData, UserRole, UserRoleOption } from '../types/api';
import { useAuth } from '../hooks/useAuth';

import {
  getUsers,
  getUserRoles,
  createUser,
  updateUser,
  changeUserRole,
  deleteUser as deleteUserService,
} from '../services/userService';

const emptyForm: UserFormData = {
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  role: 'user',
};

const roleLabels: Record<UserRole, string> = {
  user: 'Usuário',
  admin: 'Administrador',
  super_admin: 'Super administrador',
};

export const UsersPage = () => {
  const { user: authenticatedUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [roleOptions, setRoleOptions] = useState<UserRoleOption[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [formData, setFormData] = useState<UserFormData>(emptyForm);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Carrega os usuários da API.
  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [data, roles] = await Promise.all([getUsers(), getUserRoles()]);
      setUsers(data);
      setRoleOptions(roles);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
      const status = err instanceof Error && 'status' in err
        ? (err as Error & { status?: number }).status
        : undefined;
      setError(
        status === 403
          ? 'Seu nível de acesso não permite visualizar os usuários cadastrados.'
          : err instanceof Error
            ? err.message
            : 'Não foi possível carregar os usuários.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Filtra os usuários pelo nome ou e-mail.
  const filteredUsers = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search)
    );
  }, [users, searchTerm]);

  // Abre o formulário para cadastro ou edição.
  const openModal = (user?: User) => {
    setError(null);
    setShowPassword(false);
    setShowConfirmPassword(false);

    if (user) {
      setEditingUser(user);

      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        password_confirmation: '',
        role: user.role,
      });
    } else {
      setEditingUser(null);
      setFormData({ ...emptyForm });
    }

    setIsModalOpen(true);
  };

  // Fecha e limpa o formulário.
  const closeModal = () => {
    if (isSaving) return;

    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({ ...emptyForm });
    setError(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  // Valida e salva o usuário.
  const validateAndSubmit = async () => {
    setError(null);

    if (!formData.name.trim()) {
      setError('O nome é obrigatório.');
      return;
    }

    if (
      !formData.email.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
    ) {
      setError('Informe um e-mail válido.');
      return;
    }

    const isCreating = !editingUser;

    if (isCreating && !formData.password) {
      setError('A senha é obrigatória ao cadastrar.');
      return;
    }

    if (formData.password) {
      if (formData.password.length < 8) {
        setError('A senha deve ter pelo menos 8 caracteres.');
        return;
      }

      if (formData.password !== formData.password_confirmation) {
        setError('As senhas não coincidem.');
        return;
      }
    }

    try {
      setIsSaving(true);

      if (editingUser) {
        await updateUser(editingUser.id, formData);
        if (formData.role !== editingUser.role) {
          await changeUserRole(editingUser.id, formData.role);
        }
      } else {
        await createUser(formData);
      }

      // A API não retorna o usuário criado ou atualizado.
      // Por isso, buscamos novamente a lista.
      await loadUsers();

      setIsModalOpen(false);
      setEditingUser(null);
      setFormData({ ...emptyForm });
    } catch (err) {
      console.error('Erro ao salvar usuário:', err);

      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível salvar o usuário.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Abre a confirmação de exclusão.
  const confirmDelete = (id: number) => {
    setUserToDelete(id);
  };

  // Exclui o usuário pela API.
  const handleDeleteUser = async () => {
    if (userToDelete === null) return;

    try {
      setIsDeleting(true);

      await deleteUserService(userToDelete);

      setUsers((prev) =>
        prev.filter((user) => user.id !== userToDelete)
      );

      setUserToDelete(null);
    } catch (err) {
      console.error('Erro ao excluir usuário:', err);

      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível excluir o usuário.'
      );

      setUserToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const isAdmin =
    authenticatedUser?.role === 'admin' ||
    authenticatedUser?.role === 'super_admin';
  const isSuperAdmin = authenticatedUser?.role === 'super_admin';
  const canEditUser = (user: User) =>
    isSuperAdmin ||
    authenticatedUser?.id === user.id ||
    (authenticatedUser?.role === 'admin' && user.role === 'user');
  const canDeleteUser = (user: User) =>
    authenticatedUser?.id !== user.id &&
    (isSuperAdmin ||
      (authenticatedUser?.role === 'admin' && user.role === 'user'));
  const accessTooltip = 'Seu nível de acesso não permite esta ação.';
  const availableRoles = roleOptions.length > 0
    ? roleOptions
    : (Object.entries(roleLabels) as [UserRole, string][]).map(
        ([value, label]) => ({ value, label }),
      );

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Usuários
          </h1>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            Gerencie o acesso e os usuários do sistema.
          </p>
        </div>

        <button
          onClick={() => openModal()}
          disabled={!isAdmin}
          title={!isAdmin ? accessTooltip : 'Novo usuário'}
          className="flex items-center justify-center px-4 py-2.5 bg-antonela-600 hover:bg-antonela-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-5 h-5 mr-2" />
          Novo Usuário
        </button>
      </div>

      {/* Mensagem de erro */}
      {error && !isModalOpen && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Busca */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

        <input
          type="text"
          placeholder="Pesquisar por nome ou e-mail..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-antonela-500"
        />
      </div>

      {/* Tabela */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-3 font-semibold">Usuário</th>
                <th className="px-6 py-3 font-semibold">E-mail</th>
                <th className="px-6 py-3 font-semibold">Nível de acesso</th>
                <th className="px-6 py-3 font-semibold">Verificado</th>
                <th className="px-6 py-3 font-semibold">Criado em</th>
                <th className="px-6 py-3 font-semibold text-right">
                  Ações
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-slate-400"
                  >
                    Carregando usuários...
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-100">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-antonela-50 dark:bg-slate-700 text-antonela-600 dark:text-antonela-200 rounded-lg">
                          <UserCog className="w-4 h-4" />
                        </div>

                        <span>{user.name}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {user.email}
                    </td>

                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {roleLabels[user.role]}
                    </td>

                    <td className="px-6 py-4">
                      {user.email_verified_at ? (
                        <span className="inline-flex px-2.5 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 text-xs font-semibold rounded-full">
                          Sim
                        </span>
                      ) : (
                        <span className="inline-flex px-2.5 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 text-xs font-semibold rounded-full">
                          Não
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm">
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex gap-1">
                        <button
                          onClick={() => openModal(user)}
                          disabled={!canEditUser(user)}
                          className="p-1.5 text-slate-500 hover:text-antonela-600 disabled:opacity-40 disabled:cursor-not-allowed dark:text-slate-400 dark:hover:text-antonela-200 rounded-lg transition-colors cursor-pointer"
                          title={canEditUser(user) ? 'Editar' : accessTooltip}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => confirmDelete(user.id)}
                          disabled={!canDeleteUser(user)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer"
                          title={canDeleteUser(user) ? 'Excluir' : accessTooltip}
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
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Cadastro/Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-800 h-full p-6 shadow-xl flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
              </h2>

              <button
                onClick={closeModal}
                disabled={isSaving}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Nome */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Nome Completo *
                </label>

                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
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
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Nível de acesso */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Nível de acesso
                </label>

                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role: e.target.value as UserRole,
                    })
                  }
                  disabled={!isSuperAdmin}
                  title={!isSuperAdmin ? accessTooltip : 'Nível de acesso'}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-100 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {availableRoles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Senha */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Senha
                  {editingUser && (
                    <span className="font-normal text-xs text-slate-400 ml-1">
                      (deixe em branco para manter a atual)
                    </span>
                  )}
                  {!editingUser && ' *'}
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        password: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 pr-10 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-100"
                    placeholder="Mínimo 8 caracteres"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirmar senha */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Confirmar Senha
                </label>

                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={formData.password_confirmation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        password_confirmation: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 pr-10 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-100"
                    placeholder="Repita a senha"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={validateAndSubmit}
                disabled={isSaving}
                className="w-full py-2.5 bg-antonela-600 hover:bg-antonela-500 disabled:opacity-60 text-white font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                {isSaving
                  ? 'Salvando...'
                  : editingUser
                    ? 'Salvar Alterações'
                    : 'Cadastrar Usuário'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {userToDelete !== null && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
              Confirmar exclusão?
            </h3>

            <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
              Esta ação não pode ser desfeita.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setUserToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                onClick={handleDeleteUser}
                disabled={isDeleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-60 text-white rounded-lg transition-colors cursor-pointer"
              >
                {isDeleting ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
