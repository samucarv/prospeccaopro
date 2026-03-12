import React, { useState, useEffect } from 'react';
import { Prospect, ProspectStatus, NextStep, FileMetadata } from '../types';
import { X, Upload, FileText, Check, Calendar } from 'lucide-react';
import { generateUUID } from '../utils';

interface ProspectFormProps {
  initialData?: Prospect;
  onSave: (prospect: Prospect, files?: { proposal?: File, counterProposal?: File }) => void;
  onCancel: () => void;
}

export const ProspectForm: React.FC<ProspectFormProps> = ({ initialData, onSave, onCancel }) => {
  // Inicializa a data com a data atual (YYYY-MM-DD) se não houver initialData
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState<Partial<Prospect>>({
    brandName: '',
    observations: '',
    status: ProspectStatus.WAITING,
    nextStep: NextStep.NONE,
    date: today,
  });

  const [files, setFiles] = useState<{ proposal?: File, counterProposal?: File }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      // Se vier do banco sem data, usa hoje
      setFormData({
        ...initialData,
        date: initialData.date || today
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'proposal' | 'counterProposal') => {
    const file = e.target.files?.[0];
    if (file) {
      setFiles(prev => ({ ...prev, [field]: file }));
      
      const fileMeta: FileMetadata = {
        name: file.name,
        size: file.size,
        date: new Date().toISOString(),
      };
      setFormData(prev => ({ ...prev, [field]: fileMeta }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.brandName) return;
    
    setIsSubmitting(true);

    try {
        const prospect: Prospect = {
          id: initialData?.id || generateUUID(),
          brandName: formData.brandName!,
          observations: formData.observations || '',
          status: formData.status as ProspectStatus,
          nextStep: formData.nextStep as NextStep,
          // Garante que date nunca é undefined/vazio
          date: formData.date || today, 
          proposal: formData.proposal,
          counterProposal: formData.counterProposal,
          createdAt: initialData?.createdAt || Date.now(),
          updatedAt: Date.now(),
        };
        
        await onSave(prospect, files);
    } catch (error) {
        console.error(error);
        alert('Erro ao salvar processo. Verifique o console.');
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in-up">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            {initialData ? 'Editar Processo' : 'Novo Processo'}
          </h2>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome da Marca *</label>
              <input
                type="text"
                name="brandName"
                required
                value={formData.brandName}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white dark:bg-slate-900 dark:text-white"
                placeholder="Ex: Empresa X"
              />
            </div>

             {/* Campo de Data */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Data do Processo</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Calendar size={18} />
                </div>
                <input
                  type="date"
                  name="date"
                  required
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full pl-10 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-900 dark:text-white"
              >
                {Object.values(ProspectStatus).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Próximos Passos</label>
              <select
                name="nextStep"
                value={formData.nextStep}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-900 dark:text-white"
              >
                {Object.values(NextStep).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Observações</label>
              <textarea
                name="observations"
                rows={4}
                value={formData.observations}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none bg-white dark:bg-slate-900 dark:text-white"
                placeholder="Detalhes sobre a negociação..."
              />
            </div>

            {/* File Upload Simulation */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Proposta Enviada</label>
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-4 text-center hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors relative">
                 <input 
                  type="file" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => handleFileChange(e, 'proposal')}
                  accept=".pdf,.doc,.docx"
                />
                <div className="flex flex-col items-center justify-center space-y-2">
                  {formData.proposal ? (
                    <>
                      <FileText className="text-indigo-500" size={24} />
                      <span className="text-sm text-slate-900 dark:text-slate-200 font-medium truncate w-full">{formData.proposal.name}</span>
                      <span className="text-xs text-green-600 dark:text-green-400 flex items-center"><Check size={12} className="mr-1"/> Anexado</span>
                    </>
                  ) : (
                    <>
                      <Upload className="text-slate-400" size={24} />
                      <span className="text-sm text-slate-500 dark:text-slate-400">Clique para anexar</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contraproposta</label>
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-4 text-center hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors relative">
                 <input 
                  type="file" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => handleFileChange(e, 'counterProposal')}
                  accept=".pdf,.doc,.docx"
                />
                <div className="flex flex-col items-center justify-center space-y-2">
                  {formData.counterProposal ? (
                    <>
                      <FileText className="text-orange-500" size={24} />
                      <span className="text-sm text-slate-900 dark:text-slate-200 font-medium truncate w-full">{formData.counterProposal.name}</span>
                      <span className="text-xs text-green-600 dark:text-green-400 flex items-center"><Check size={12} className="mr-1"/> Anexado</span>
                    </>
                  ) : (
                    <>
                      <Upload className="text-slate-400" size={24} />
                      <span className="text-sm text-slate-500 dark:text-slate-400">Clique para anexar</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-slate-100 dark:border-slate-700 space-x-3">
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
              className={`px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md shadow-indigo-200 dark:shadow-none transition-all flex items-center ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Salvando...
                  </>
              ) : 'Salvar Processo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};