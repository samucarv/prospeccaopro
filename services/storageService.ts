import { Prospect, User, UserProfile } from '../types';
import { supabase } from './supabaseClient';

// --- PROSPECTS ---

export const getProspects = async (): Promise<Prospect[]> => {
  try {
    const { data, error } = await supabase
      .from('prospects')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(p => ({
      id: p.id,
      brandName: p.brand_name,
      observations: p.observations,
      status: p.status,
      nextStep: p.next_step,
      date: p.date,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      proposal: p.proposal_path ? {
        name: p.proposal_name,
        path: p.proposal_path,
        size: Number(p.proposal_size),
        date: p.proposal_date
      } : undefined,
      counterProposal: p.counter_proposal_path ? {
        name: p.counter_proposal_name,
        path: p.counter_proposal_path,
        size: Number(p.counter_proposal_size),
        date: p.counter_proposal_date
      } : undefined
    }));
  } catch (error) {
    console.error("Erro ao buscar prospects:", error);
    return [];
  }
};

const uploadFile = async (file: File): Promise<string> => {
  const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
  const { data, error } = await supabase.storage
    .from('prospect-files')
    .upload(fileName, file);

  if (error) throw error;
  return data.path;
};

export const createProspect = async (prospect: Prospect, files?: { proposal?: File, counterProposal?: File }): Promise<void> => {
  let proposalPath = undefined;
  let counterProposalPath = undefined;

  if (files?.proposal) proposalPath = await uploadFile(files.proposal);
  if (files?.counterProposal) counterProposalPath = await uploadFile(files.counterProposal);

  const { error } = await supabase.from('prospects').insert({
    id: prospect.id,
    brand_name: prospect.brandName,
    observations: prospect.observations,
    status: prospect.status,
    next_step: prospect.nextStep,
    date: prospect.date || new Date().toISOString().split('T')[0],
    proposal_name: files?.proposal?.name,
    proposal_path: proposalPath,
    proposal_size: files?.proposal?.size,
    proposal_date: files?.proposal ? new Date().toISOString() : undefined,
    counter_proposal_name: files?.counterProposal?.name,
    counter_proposal_path: counterProposalPath,
    counter_proposal_size: files?.counterProposal?.size,
    counter_proposal_date: files?.counterProposal ? new Date().toISOString() : undefined,
    created_at: prospect.createdAt || Date.now(),
    updated_at: Date.now()
  });

  if (error) throw error;
};

export const updateProspect = async (prospect: Prospect, files?: { proposal?: File, counterProposal?: File }): Promise<void> => {
  let proposalData: any = {};
  let counterProposalData: any = {};

  if (files?.proposal) {
    const path = await uploadFile(files.proposal);
    proposalData = {
      proposal_name: files.proposal.name,
      proposal_path: path,
      proposal_size: files.proposal.size,
      proposal_date: new Date().toISOString()
    };
  }

  if (files?.counterProposal) {
    const path = await uploadFile(files.counterProposal);
    counterProposalData = {
      counter_proposal_name: files.counterProposal.name,
      counter_proposal_path: path,
      counter_proposal_size: files.counterProposal.size,
      counter_proposal_date: new Date().toISOString()
    };
  }

  const { error } = await supabase
    .from('prospects')
    .update({
      brand_name: prospect.brandName,
      observations: prospect.observations,
      status: prospect.status,
      next_step: prospect.nextStep,
      date: prospect.date || new Date().toISOString().split('T')[0],
      ...proposalData,
      ...counterProposalData,
      updated_at: Date.now()
    })
    .eq('id', prospect.id);

  if (error) throw error;
};

export const deleteProspect = async (id: string): Promise<void> => {
  const { error } = await supabase.from('prospects').delete().eq('id', id);
  if (error) throw error;
};

// --- USERS ---

export const getUsers = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');

    if (error) throw error;

    return (data || []).map(u => ({
      id: u.id,
      name: u.name,
      username: u.username,
      profile: u.profile as UserProfile,
      createdAt: u.created_at
    }));
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return [];
  }
};

export const saveUser = async (user: User, isNew: boolean): Promise<void> => {
  const userData = {
    name: user.name,
    username: user.username,
    profile: user.profile,
    updated_at: Date.now()
  };

  let error;
  if (isNew) {
    const { error: insertError } = await supabase.from('profiles').insert({
      id: user.id,
      ...userData,
      created_at: user.createdAt || Date.now()
    });
    error = insertError;
  } else {
    const { error: updateError } = await supabase
      .from('profiles')
      .update(userData)
      .eq('id', user.id);
    error = updateError;
  }

  if (error) throw error;

  // Sync Supabase Auth metadata ONLY if we are updating the current logged-in user
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user && session.user.id === user.id) {
    await supabase.auth.updateUser({
      data: { name: user.name, profile: user.profile }
    });
  }
};

export const deleteUser = async (id: string): Promise<void> => {
  // Check if it's the last admin
  const { data: admins } = await supabase
    .from('profiles')
    .select('id')
    .eq('profile', UserProfile.ADMIN);

  if (admins && admins.length <= 1 && admins.find(a => a.id === id)) {
    throw new Error('Não é possível excluir o último administrador.');
  }

  const { error } = await supabase.from('profiles').delete().eq('id', id);
  if (error) throw error;
};

export const getUserProfile = async (userId: string): Promise<User | null> => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error("Erro ao buscar perfil:", error);
    }

    const { data: { session } } = await supabase.auth.getSession();
    const authUser = session?.user;

    if (!authUser && !profile) return null;

    // Prioritize: 1. DB Profile table, 2. Auth Metadata, 3. Default to Admin
    const resolvedProfile = (profile?.profile as UserProfile) || (authUser?.user_metadata.profile as UserProfile) || UserProfile.ADMIN;

    return {
      id: userId,
      name: profile?.name || authUser?.user_metadata.name || authUser?.email?.split('@')[0] || 'Usuário',
      username: profile?.username || authUser?.email || '',
      profile: resolvedProfile,
      createdAt: profile?.created_at || (authUser ? new Date(authUser.created_at).getTime() : Date.now()),
    };
  } catch (e) {
    console.error("Erro ao processar perfil:", e);
    return null;
  }
};

export const authenticateUser = async (email: string, password: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) return null;

    return await getUserProfile(data.user.id);
  } catch (e) {
    console.error("Erro de autenticação:", e);
    return null;
  }
};

export const registerUser = async (email: string, password: string, name: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, profile: UserProfile.ADMIN } }
    });

    if (error || !data.user) throw new Error(error?.message || "Erro ao registrar usuário");

    // Profile is created by DB trigger, but return the object
    return {
      id: data.user.id,
      name,
      username: email,
      profile: UserProfile.ADMIN,
      createdAt: Date.now(),
    };
  } catch (e: any) {
    console.error("Erro no registro:", e);
    throw e;
  }
};

export const logoutUser = async (): Promise<void> => {
  await supabase.auth.signOut();
};
