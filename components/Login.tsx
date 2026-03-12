import React, { useState } from 'react';
import { Target, Lock, Mail, ArrowRight, User, UserPlus } from 'lucide-react';

interface LoginProps {
  onLogin: (email: string, pass: string) => Promise<boolean>;
  onRegister: (email: string, pass: string, name: string) => Promise<boolean>;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isRegisterMode && !name)) return;

    setIsLoading(true);
    setError('');

    try {
      if (isRegisterMode) {
        const success = await onRegister(email, password, name);
        if (!success) {
          setError('Ocorreu um erro ao criar sua conta.');
          setIsLoading(false);
        }
      } else {
        const success = await onLogin(email, password);
        if (!success) {
          setError('Email ou senha inválidos.');
          setIsLoading(false);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Erro inesperado.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up transition-colors">
        <div className="p-8 pb-6 text-center border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-indigo-600 text-white mb-4 shadow-lg shadow-indigo-200 dark:shadow-none">
            {isRegisterMode ? <UserPlus size={32} /> : <Target size={32} />}
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            Prospecção<span className="text-indigo-600 dark:text-indigo-400">Pro</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
            {isRegisterMode
              ? 'Crie sua conta para começar a gerenciar sua prospecção.'
              : 'Entre com suas credenciais para acessar o painel de gestão.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg border border-red-100 dark:border-red-800 text-center animate-pulse">
              {error}
            </div>
          )}

          {isRegisterMode && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Nome Completo</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 outline-none transition-all text-slate-700 dark:text-white bg-white dark:bg-slate-900"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 outline-none transition-all text-slate-700 dark:text-white bg-white dark:bg-slate-900"
                placeholder="exemplo@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Senha</label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock size={18} />
              </div>
              <input
                type="password"
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 outline-none transition-all text-slate-700 dark:text-white bg-white dark:bg-slate-900"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-[0.98] flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{isRegisterMode ? 'Criar Conta' : 'Acessar Sistema'}</span>
                <ArrowRight size={20} />
              </>
            )}
          </button>

          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setError('');
              }}
              className="text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:underline"
            >
              {isRegisterMode ? 'Já tem uma conta? Entre aqui' : 'Não tem uma conta? Cadastre-se'}
            </button>
          </div>
        </form>

        <div className="p-4 text-center bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            &copy; 2025 ProspecçãoPro. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};