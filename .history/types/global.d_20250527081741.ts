declare global {
  interface Window {
    fs?: any;
    electronAPI?: any;
    webkitRequestFileSystem?: any;
    mozRequestFileSystem?: any;
    msRequestFileSystem?: any;
  }

  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      NEXT_PUBLIC_VERCEL_URL?: string;
      DATABASE_URL?: string;
      NEXTAUTH_SECRET?: string;
      NEXTAUTH_URL?: string;
    }
  }
}

// React types augmentation
declare module 'react' {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    css?: any;
  }
}

// Common types used across the application
export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface BaseResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: PaginationMeta;
}

export {};
