
/**
 * Gera um UUID v4 compatível.
 * Tenta usar crypto.randomUUID (apenas contextos seguros/HTTPS).
 * Faz fallback para Math.random se não estiver disponível (HTTP via IP).
 */
export const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback para ambientes não seguros (http://ip-da-rede)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};
