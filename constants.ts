import { ProspectStatus, NextStep } from './types';

export const STATUS_COLORS: Record<ProspectStatus, string> = {
  [ProspectStatus.WAITING]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  [ProspectStatus.COLD]: 'bg-blue-100 text-blue-800 border-blue-200',
  [ProspectStatus.WARM]: 'bg-orange-100 text-orange-800 border-orange-200',
  [ProspectStatus.HOT]: 'bg-green-100 text-green-800 border-green-200',
};

export const NEXT_STEP_COLORS: Record<NextStep, string> = {
  [NextStep.COMMITTEE]: 'bg-purple-100 text-purple-800',
  [NextStep.STANDBY]: 'bg-gray-100 text-gray-800',
  [NextStep.NONE]: 'bg-slate-50 text-slate-500',
};

export const MOCK_INITIAL_DATA = [
  {
    id: '1',
    brandName: 'TechVision Corp',
    observations: 'Interessados em parceria de longo prazo. Precisam de validação técnica.',
    status: ProspectStatus.HOT,
    nextStep: NextStep.COMMITTEE,
    createdAt: Date.now() - 10000000,
    updatedAt: Date.now() - 100000,
  },
  {
    id: '2',
    brandName: 'Moda & Estilo',
    observations: 'Orçamento limitado, enviada proposta inicial com desconto.',
    status: ProspectStatus.WARM,
    nextStep: NextStep.STANDBY,
    createdAt: Date.now() - 20000000,
    updatedAt: Date.now() - 500000,
  },
  {
    id: '3',
    brandName: 'Alimentos Saudáveis Ltda',
    observations: 'Não responderam ao último email de follow-up.',
    status: ProspectStatus.WAITING,
    nextStep: NextStep.NONE,
    createdAt: Date.now() - 5000000,
    updatedAt: Date.now(),
  }
];
