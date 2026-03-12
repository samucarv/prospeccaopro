import { GoogleGenAI } from "@google/genai";
import { Prospect } from '../types';

// Acesso seguro ao process.env para evitar crash no browser se não estiver definido
const getApiKey = () => {
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
        return process.env.API_KEY;
    }
    // Retorna vazio se não encontrar, o erro será tratado na chamada
    return '';
};

const apiKey = getApiKey();
const ai = new GoogleGenAI({ apiKey });

export const analyzeProspect = async (prospect: Prospect): Promise<string> => {
  if (!apiKey) {
    console.error("API Key não encontrada. Certifique-se de que process.env.API_KEY está configurado.");
    return "Configuração de API Key ausente. Por favor, verifique o console para mais detalhes.";
  }

  try {
    const prompt = `
      Analise o seguinte prospecto de vendas:
      
      Dados do Prospecto:
      - Marca: ${prospect.brandName}
      - Status Atual: ${prospect.status}
      - Observações: ${prospect.observations || 'Nenhuma observação registrada.'}
      - Próximo Passo Definido: ${prospect.nextStep}
      
      Forneça:
      1. Uma breve análise da situação.
      2. Sugestão de 3 próximos passos práticos.
      3. Um breve rascunho de email para follow-up.
      
      Responda em Markdown conciso.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
          systemInstruction: "Você é um consultor de vendas sênior especialista em negociações B2B.",
      }
    });

    return response.text || "Não foi possível gerar uma análise no momento.";
  } catch (error: any) {
    console.error("Erro detalhado ao chamar Gemini API:", error);
    
    // Tratamento básico de erros comuns
    if (error.message?.includes('400')) {
        return "Erro na requisição à IA (400). Verifique os dados enviados.";
    }
    if (error.message?.includes('403') || error.message?.includes('API key')) {
        return "Erro de permissão (403). Verifique se a API Key é válida.";
    }
    
    return "Ocorreu um erro de conexão ao tentar analisar o prospecto. Verifique sua internet ou tente novamente.";
  }
};