import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Plus, Target, LogOut, Shield, Moon, Sun, Menu, X } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { ProspectList } from './components/ProspectList';
import { ProspectForm } from './components/ProspectForm';
import { UserList } from './components/UserList';
import { UserForm } from './components/UserForm';
import { Login } from './components/Login';
import { Prospect, User, UserProfile } from './types';
import { getProspects, createProspect, updateProspect, deleteProspect, authenticateUser, getUserProfile, registerUser, logoutUser, getUsers, saveUser, deleteUser } from './services/storageService';
import { supabase } from './services/supabaseClient';

enum Tab {
  DASHBOARD = 'dashboard',
  PROSPECTS = 'prospects',
  USERS = 'users',
}

const App: React.FC = () => {
  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem('prospect_theme');
    if (stored) return stored as 'light' | 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const [activeTab, setActiveTab] = useState<Tab>(Tab.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Data State
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Forms State
  const [isProspectFormOpen, setIsProspectFormOpen] = useState(false);
  const [editingProspect, setEditingProspect] = useState<Prospect | undefined>(undefined);

  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined);

  // Apply Theme
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('prospect_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Supabase Auth Listener
  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const fetchUser = async () => {
          const user = await getUserProfile(session.user.id);
          if (user) setCurrentUser(user);
        };
        fetchUser();
      }
      setIsInitialLoad(false);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const fetchUser = async () => {
          const user = await getUserProfile(session.user.id);
          if (user) setCurrentUser(user);
        };
        fetchUser();
      } else {
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load Data
  const loadData = async () => {
    if (currentUser) {
      try {
        const p = await getProspects();
        setProspects(p);
        if (currentUser.profile === UserProfile.ADMIN) {
          const u = await getUsers();
          setUsers(u);
        }
      } catch (e) {
        console.error("Erro ao carregar dados:", e);
      }
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser, activeTab]);

  // Fecha o sidebar ao mudar de tab no mobile
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [activeTab]);

  // --- Auth Handlers ---
  // --- Auth Handlers ---
  const handleLogin = async (email: string, pass: string): Promise<boolean> => {
    const user = await authenticateUser(email, pass);
    if (user) {
      // CurrentUser will be set by onAuthStateChange listener
      return true;
    }
    return false;
  };

  const handleRegister = async (email: string, pass: string, name: string): Promise<boolean> => {
    try {
      const user = await registerUser(email, pass, name);
      return !!user;
    } catch (e: any) {
      alert(`Erro ao criar conta: ${e.message}`);
      return false;
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setActiveTab(Tab.DASHBOARD);
  };

  // --- Prospect Handlers ---
  const handleSaveProspect = async (prospect: Prospect, files?: { proposal?: File, counterProposal?: File }) => {
    try {
      if (editingProspect) {
        await updateProspect(prospect, files);
      } else {
        await createProspect(prospect, files);
      }
      await loadData();
      setIsProspectFormOpen(false);
      setEditingProspect(undefined);
    } catch (error: any) {
      console.error("Erro ao salvar:", error);
      alert(`Erro ao salvar processo: ${error.message || 'Erro desconhecido'}`);
      throw error;
    }
  };

  const handleToggleUserProfile = async (user: User) => {
    const newProfile = user.profile === UserProfile.ADMIN ? UserProfile.USER : UserProfile.ADMIN;
    try {
      await saveUser({ ...user, profile: newProfile }, false);
      await loadData();
    } catch (error: any) {
      alert(`Erro ao alterar perfil: ${error.message}`);
    }
  };

  const handleEditProspect = (prospect: Prospect) => {
    setEditingProspect(prospect);
    setIsProspectFormOpen(true);
  };

  const handleDeleteProspect = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este processo?')) {
      try {
        await deleteProspect(id);
        await loadData();
      } catch (e: any) {
        alert(`Erro ao excluir: ${e.message}`);
      }
    }
  };

  const openNewProspectForm = () => {
    setEditingProspect(undefined);
    setIsProspectFormOpen(true);
  };

  // --- User Handlers ---
  const handleSaveUser = async (user: User) => {
    try {
      const isNew = !editingUser;
      await saveUser(user, isNew);
      await loadData();
      setIsUserFormOpen(false);
      setEditingUser(undefined);
    } catch (e: any) {
      alert(`Erro ao salvar usuário: ${e.message}`);
      throw e;
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsUserFormOpen(true);
  };

  const handleDeleteUser = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        await deleteUser(id);
        await loadData();
      } catch (e: any) {
        // Error handled in service
      }
    }
  };

  const openNewUserForm = () => {
    setEditingUser(undefined);
    setIsUserFormOpen(true);
  };

  if (isInitialLoad) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Login onLogin={handleLogin} onRegister={handleRegister} />;
  }

  const isAdmin = currentUser.profile === UserProfile.ADMIN;

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 animate-fade-in transition-colors duration-200">

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-slate-900 dark:bg-slate-950 text-white z-40 p-4 flex justify-between items-center shadow-md border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <button onClick={() => setIsSidebarOpen(true)} className="text-slate-300 hover:text-white">
            <Menu size={28} />
          </button>
          <div className="flex items-center space-x-2">
            <Target size={20} className="text-indigo-500" />
            <span className="font-bold">ProspecçãoPro</span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold">
            {currentUser.name.charAt(0)}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation (Desktop & Mobile Off-canvas) */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-900 dark:bg-slate-950 text-white flex flex-col border-r border-slate-800 dark:border-slate-800 transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 border-b border-slate-800 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <Target size={24} className="text-white" />
            </div>
            <div className="leading-tight">
              <span className="text-xl font-bold tracking-tight block">Prospecção<span className="text-indigo-400">Pro</span></span>
              <span className="text-xs text-slate-400 font-normal">Olá, {currentUser.name.split(' ')[0]}</span>
            </div>
          </div>
          {/* Close button for mobile */}
          <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 mt-4 overflow-y-auto">
          <button
            onClick={() => setActiveTab(Tab.DASHBOARD)}
            className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-all ${activeTab === Tab.DASHBOARD
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
          >
            <LayoutDashboard size={20} />
            <span className="font-medium">Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab(Tab.PROSPECTS)}
            className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-all ${activeTab === Tab.PROSPECTS
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
          >
            <Users size={20} />
            <span className="font-medium">Processos</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveTab(Tab.USERS)}
              className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-all ${activeTab === Tab.USERS
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
            >
              <Shield size={20} />
              <span className="font-medium">Usuários</span>
            </button>
          )}
        </nav>

        <div className="p-4 border-t border-slate-800 dark:border-slate-800">
          <button
            onClick={toggleTheme}
            className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all mb-2"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            <span className="font-medium">{theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-slate-400 hover:bg-red-900/20 hover:text-red-400 transition-all mb-4"
          >
            <LogOut size={20} />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full md:w-auto p-4 md:p-6 pt-20 md:pt-6 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between md:items-center mb-6 md:mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
              {activeTab === Tab.DASHBOARD && 'Visão Geral'}
              {activeTab === Tab.PROSPECTS && 'Processos de Prospecção'}
              {activeTab === Tab.USERS && 'Gestão de Usuários'}
            </h1>
            <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 mt-1">
              {activeTab === Tab.DASHBOARD && 'Acompanhe suas métricas e desempenho.'}
              {activeTab === Tab.PROSPECTS && 'Gerencie e atualize seus leads comerciais.'}
              {activeTab === Tab.USERS && 'Cadastre e gerencie acessos ao sistema.'}
            </p>
          </div>

          {/* Conditional Action Button */}
          {activeTab === Tab.PROSPECTS && isAdmin && (
            <button
              onClick={openNewProspectForm}
              className="self-start md:self-auto flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-md shadow-indigo-200 dark:shadow-none transition-all active:scale-95"
            >
              <Plus size={20} />
              <span>Novo Processo</span>
            </button>
          )}

          {activeTab === Tab.USERS && isAdmin && (
            <button
              onClick={openNewUserForm}
              className="self-start md:self-auto flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-md shadow-indigo-200 dark:shadow-none transition-all active:scale-95"
            >
              <Plus size={20} />
              <span>Novo Usuário</span>
            </button>
          )}
        </header>

        {/* Content Area */}
        <div className="animate-fade-in">
          {activeTab === Tab.DASHBOARD && (
            <Dashboard prospects={prospects} />
          )}

          {activeTab === Tab.PROSPECTS && (
            <ProspectList
              prospects={prospects}
              onEdit={handleEditProspect}
              onDelete={handleDeleteProspect}
              userProfile={currentUser.profile}
            />
          )}

          {activeTab === Tab.USERS && isAdmin && (
            <UserList
              users={users}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
              onToggleProfile={handleToggleUserProfile}
            />
          )}
        </div>
      </main>

      {/* Modal Form: Prospects */}
      {isProspectFormOpen && (
        <ProspectForm
          initialData={editingProspect}
          onSave={handleSaveProspect}
          onCancel={() => setIsProspectFormOpen(false)}
        />
      )}

      {/* Modal Form: Users */}
      {isUserFormOpen && (
        <UserForm
          initialData={editingUser}
          onSave={handleSaveUser}
          onCancel={() => setIsUserFormOpen(false)}
        />
      )}
    </div>
  );
};

export default App;