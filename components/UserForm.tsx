import React, { useState, useEffect } from 'react';
import { User, UserProfile } from '../types';
import { X, User as UserIcon, Lock, Shield, CreditCard } from 'lucide-react';
import { generateUUID } from '../utils';

interface UserFormProps {
  initialData?: User;
  onSave: (user: User) => void;
  onCancel: () => void;
}

export const UserForm: React.FC<UserFormProps> = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    username: '',
    password: '',
    profile: UserProfile.USER,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData, password: '' });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.username) return;
    
    if (!initialData && !formData.password) {
        alert("Senha é obrigatória para novos usuários.");
        return;
    }
    
    setIsSubmitting(true);
    
    try {
        const user: User = {
          id: initialData?.id || generateUUID(),
          name: formData.name!,
          username: formData.username!,
          password: formData.password,
          profile: formData.profile as UserProfile,
          createdAt: initialData?.createdAt || Date.now(),
        };
        await onSave(user);
    } catch (e) {
        console.error(e);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            {initialData ? 'Editar Usuário' : 'Novo Usuário'}
          </h2>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome Completo *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <CreditCard size={18} />
              </div>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-900 dark:text-white"
                placeholder="Ex: João Silva"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Usuário de Acesso *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <UserIcon size={18} />
              </div>
              <input
                type="text"
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-900 dark:text-white"
                placeholder="Ex: joao.silva"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {initialData ? 'Nova Senha (deixe em branco para manter)' : 'Senha *'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock size={18} />
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-900 dark:text-white"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Perfil de Acesso</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Shield size={18} />
              </div>
              <select
                name="profile"
                value={formData.profile}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-900 dark:text-white"
              >
                {Object.values(UserProfile).map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-4 space-x-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-6 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md shadow-indigo-200 dark:shadow-none transition-all ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Salvando...' : 'Salvar Usuário'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};