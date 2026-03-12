import React, { useState } from 'react';
import { User, UserProfile } from '../types';
import { Edit2, Trash2, Shield, User as UserIcon, Search } from 'lucide-react';

interface UserListProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
  onToggleProfile: (user: User) => void;
}

export const UserList: React.FC<UserListProps> = ({ users, onEdit, onDelete, onToggleProfile }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filtragem de usuários
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Barra de Pesquisa */}
        <div className="relative w-full sm:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Buscar por nome ou usuário..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
          {filteredUsers.length} {filteredUsers.length === 1 ? 'usuário encontrado' : 'usuários encontrados'}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Nome Completo</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Usuário</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Perfil</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{user.name}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                    {user.username}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${user.profile === UserProfile.ADMIN
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600'
                      }`}>
                      {user.profile === UserProfile.ADMIN ? <Shield size={12} className="mr-1" /> : <UserIcon size={12} className="mr-1" />}
                      {user.profile}
                    </span>
                    <button
                      onClick={() => onToggleProfile(user)}
                      className="ml-2 p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                      title="Alternar Perfil"
                    >
                      <Shield size={14} />
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => onEdit(user)}
                        className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => onDelete(user.id)}
                        className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    {searchTerm ? 'Nenhum usuário encontrado.' : 'Nenhum usuário cadastrado.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-700">
          {filteredUsers.map((user) => (
            <div key={user.id} className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200">{user.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">@{user.username}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${user.profile === UserProfile.ADMIN
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600'
                    }`}>
                    {user.profile}
                  </span>
                  <button
                    onClick={() => onToggleProfile(user)}
                    className="p-1 px-2 text-xs font-medium text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 rounded-md border border-indigo-100 dark:border-indigo-800"
                  >
                    Alternar
                  </button>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button onClick={() => onEdit(user)} className="p-2 text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg"><Edit2 size={18} /></button>
                <button onClick={() => onDelete(user.id)} className="p-2 text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400 rounded-lg"><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
          {filteredUsers.length === 0 && (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
              {searchTerm ? 'Nenhum usuário encontrado.' : 'Nenhum usuário cadastrado.'}
            </div>
          )}
        </div>
      </div>
    </>
  );
};