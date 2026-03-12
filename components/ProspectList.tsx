import React, { useState } from 'react';
import { Prospect, ProspectStatus, UserProfile, FileMetadata } from '../types';
import { supabase } from '../services/supabaseClient';
import { STATUS_COLORS, NEXT_STEP_COLORS } from '../constants';
import { Edit2, Trash2, FileText, X, Download, File as FileIcon, Search } from 'lucide-react';

interface ProspectListProps {
  prospects: Prospect[];
  onEdit: (prospect: Prospect) => void;
  onDelete: (id: string) => void;
  userProfile: UserProfile;
}

export const ProspectList: React.FC<ProspectListProps> = ({ prospects, onEdit, onDelete, userProfile }) => {
  const [previewFile, setPreviewFile] = useState<FileMetadata | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filtragem de prospects baseada na busca
  const filteredProspects = prospects.filter(prospect =>
    prospect.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prospect.observations.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prospect.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFileUrl = (path: string) => {
    const { data } = supabase.storage.from('prospect-files').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleDownload = (file: FileMetadata) => {
    if (file.path) {
      window.open(getFileUrl(file.path), '_blank');
    } else {
      alert('Este arquivo não está disponível no servidor.');
    }
  };

  const renderFilePreview = () => {
    if (!previewFile || !previewFile.path) return null;

    const url = getFileUrl(previewFile.path);
    const ext = previewFile.name.split('.').pop()?.toLowerCase();
    const isPdf = ext === 'pdf';
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '');

    if (isPdf) {
      return (
        <iframe
          src={url}
          className="w-full h-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white"
          title="Pré-visualização PDF"
        />
      );
    }

    if (isImage) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden">
          <img
            src={url}
            alt="Preview"
            className="max-w-full max-h-full object-contain shadow-lg"
          />
        </div>
      );
    }

    // Fallback para arquivos não visualizáveis nativamente
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-slate-50 dark:bg-slate-900/50 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700">
        <div className="w-32 h-32 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-sm text-slate-300 dark:text-slate-600">
          <FileIcon size={64} />
        </div>
        <h4 className="text-xl text-slate-800 dark:text-slate-200 font-medium mb-2">Visualização Indisponível</h4>
        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md">
          O formato do arquivo <span className="font-semibold text-slate-700 dark:text-slate-300">{previewFile.name}</span> não suporta pré-visualização direta.
        </p>
        <button
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium flex items-center shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:scale-105"
          onClick={() => handleDownload(previewFile)}
        >
          <Download size={20} className="mr-2" />
          Baixar Arquivo para Visualizar
        </button>
      </div>
    );
  };

  const isAdmin = userProfile === UserProfile.ADMIN;

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
            placeholder="Buscar por marca, status ou observações..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
          {filteredProspects.length} {filteredProspects.length === 1 ? 'registro encontrado' : 'registros encontrados'}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Marca</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Próximo Passo</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Documentos</th>
                {isAdmin ? (
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300 text-right">Ações</th>
                ) : (
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Observações</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredProspects.map((prospect) => (
                <React.Fragment key={prospect.id}>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{prospect.brandName}</div>
                      {isAdmin && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate max-w-[200px]">{prospect.observations}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[prospect.status]}`}>
                        {prospect.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${NEXT_STEP_COLORS[prospect.nextStep]}`}>
                        {prospect.nextStep}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        {prospect.proposal ? (
                          <button
                            className="group/file relative flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                            title={`Proposta: ${prospect.proposal.name}`}
                            onClick={() => setPreviewFile(prospect.proposal!)}
                          >
                            <FileText size={16} />
                          </button>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-300 dark:text-slate-500 cursor-default" title="Sem proposta">
                            <FileText size={16} />
                          </div>
                        )}
                        {prospect.counterProposal ? (
                          <button
                            className="group/file relative flex items-center justify-center w-8 h-8 rounded-full bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors"
                            title={`Contraproposta: ${prospect.counterProposal.name}`}
                            onClick={() => setPreviewFile(prospect.counterProposal!)}
                          >
                            <FileText size={16} />
                          </button>
                        ) : null}
                      </div>
                    </td>

                    {isAdmin ? (
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onEdit(prospect)}
                            className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 transition-colors"
                            title="Editar"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => onDelete(prospect.id)}
                            className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors"
                            title="Excluir"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    ) : (
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 max-w-xs break-words">
                        {prospect.observations}
                      </td>
                    )}
                  </tr>
                </React.Fragment>
              ))}
              {filteredProspects.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 5 : 5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    {searchTerm ? 'Nenhum processo encontrado para essa busca.' : 'Nenhum processo cadastrado.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-700">
          {filteredProspects.map((prospect) => (
            <div key={prospect.id} className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200">{prospect.brandName}</h3>
                  <span className={`inline-flex mt-1 items-center px-2 py-0.5 rounded text-xs font-medium border ${STATUS_COLORS[prospect.status]}`}>
                    {prospect.status}
                  </span>
                </div>
                {isAdmin && (
                  <div className="flex space-x-1">
                    <button onClick={() => onEdit(prospect)} className="p-2 text-blue-600 dark:text-blue-400"><Edit2 size={18} /></button>
                    <button onClick={() => onDelete(prospect.id)} className="p-2 text-red-600 dark:text-red-400"><Trash2 size={18} /></button>
                  </div>
                )}
              </div>

              <div className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
                <span className="font-medium text-xs uppercase text-slate-400 dark:text-slate-500 block mb-1">Próximo Passo</span>
                {prospect.nextStep}
              </div>

              <div className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
                <span className="font-medium text-xs uppercase text-slate-400 dark:text-slate-500 block mb-1">Observações</span>
                {prospect.observations}
              </div>

              {(prospect.proposal || prospect.counterProposal) && (
                <div className="flex gap-2">
                  {prospect.proposal && (
                    <button
                      onClick={() => setPreviewFile(prospect.proposal!)}
                      className="text-xs flex items-center bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
                    >
                      <FileText size={12} className="mr-1" /> Proposta
                    </button>
                  )}
                  {prospect.counterProposal && (
                    <button
                      onClick={() => setPreviewFile(prospect.counterProposal!)}
                      className="text-xs flex items-center bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-1 rounded hover:bg-orange-100 dark:hover:bg-orange-900/50"
                    >
                      <FileText size={12} className="mr-1" /> Contraproposta
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
          {filteredProspects.length === 0 && (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
              {searchTerm ? 'Nenhum processo encontrado.' : 'Nenhum processo cadastrado.'}
            </div>
          )}
        </div>
      </div>

      {/* File Preview Modal - LARGURA E ALTURA AUMENTADAS */}
      {previewFile && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          {/* Container Principal do Modal - 90% da viewport */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-[90vw] h-[90vh] overflow-hidden animate-fade-in-up flex flex-col">

            {/* Header do Modal */}
            <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg flex-shrink-0">
                  <FileText size={24} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-lg leading-tight truncate">{previewFile.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{(previewFile.size / 1024).toFixed(2)} KB • {new Date(previewFile.date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                <button
                  className="hidden md:flex px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium items-center shadow-md shadow-indigo-200 dark:shadow-none transition-colors"
                  onClick={() => handleDownload(previewFile)}
                >
                  <Download size={18} className="mr-2" />
                  Baixar
                </button>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Corpo do Preview */}
            <div className="flex-1 bg-slate-200 dark:bg-slate-950 p-4 flex items-center justify-center overflow-hidden">
              {renderFilePreview()}
            </div>
          </div>
        </div>
      )}
    </>
  );
};