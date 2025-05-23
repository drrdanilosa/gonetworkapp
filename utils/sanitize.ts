/**
 * Utilitário para sanitizar entradas de usuário
 * Previne ataques de injeção e XSS
 */

/**
 * Sanitiza strings para evitar XSS e injeção
 * @param input String a ser sanitizada
 * @returns String sanitizada
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  // Remove tags HTML
  let sanitized = input.replace(/<[^>]*>/g, '');
  
  // Escapa caracteres especiais
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
  
  return sanitized;
}

/**
 * Sanitiza um objeto, aplicando sanitização a todas as strings
 * @param obj Objeto a ser sanitizado
 * @returns Objeto com strings sanitizadas
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const result = { ...obj } as T;
  
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    
    if (typeof value === 'string') {
      result[key] = sanitizeInput(value) as any;
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = sanitizeObject(value);
    } else if (Array.isArray(value)) {
      result[key] = value.map(item => 
        typeof item === 'string' ? sanitizeInput(item) : 
        (typeof item === 'object' ? sanitizeObject(item) : item)
      ) as any;
    }
  });
  
  return result;
}

/**
 * Valida um email
 * @param email Email a ser validado
 * @returns true se o email for válido
 */
export function validateEmail(email: string): boolean {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email);
}

/**
 * Valida uma data no formato ISO
 * @param date Data a ser validada
 * @returns true se a data for válida
 */
export function validateDate(date: string): boolean {
  if (!date) return false;
  const timestamp = Date.parse(date);
  return !isNaN(timestamp);
}

/**
 * Normaliza ids removendo caracteres inválidos
 * @param id ID a ser normalizado
 * @returns ID normalizado
 */
export function normalizeId(id: string): string {
  if (!id) return '';
  return id.replace(/[^a-zA-Z0-9_-]/g, '_');
}
