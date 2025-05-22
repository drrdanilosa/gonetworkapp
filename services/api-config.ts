// Arquivo para configurações da API, como base URL, headers, etc.
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.melhorapp.com';

export const getHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

export const handleApiError = (error: unknown) => {
  console.error('API Error:', error);
  
  if (error instanceof Response) {
    return {
      status: error.status,
      message: `Error ${error.status}: ${error.statusText}`,
    };
  }
  
  return {
    status: 500,
    message: error instanceof Error ? error.message : 'Unknown error occurred',
  };
};
