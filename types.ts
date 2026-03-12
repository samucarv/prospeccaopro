export enum ProspectStatus {
  WAITING = 'Aguardando Retorno',
  COLD = 'Frio',
  WARM = 'Morno',
  HOT = 'Quente',
}

export enum NextStep {
  COMMITTEE = 'Enviar para Comitê',
  STANDBY = 'Standby',
  NONE = 'Nenhum',
}

export enum UserProfile {
  ADMIN = 'Administrador',
  USER = 'Usuário',
}

export interface User {
  id: string;
  name: string;
  username: string;
  password?: string; // Optional for display/editing logic (handled carefully)
  profile: UserProfile;
  createdAt: number;
}

export interface FileMetadata {
  name: string;
  size: number;
  date: string;
  path?: string; // Caminho no servidor (filename)
}

export interface Prospect {
  id: string;
  brandName: string;
  observations: string;
  proposal?: FileMetadata;
  counterProposal?: FileMetadata;
  status: ProspectStatus;
  nextStep: NextStep;
  date: string; // Data manual do processo (YYYY-MM-DD)
  createdAt: number;
  updatedAt: number;
}

export interface DashboardStats {
  total: number;
  hot: number;
  warm: number;
  cold: number;
  waiting: number;
  conversionRate: number; // Mocked for now
}