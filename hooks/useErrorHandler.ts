'use client'

import { useState, useCallback } from 'react'

interface UseErrorHandlerReturn {
  error: Error | null
  resetError: () => void
  captureError: (error: Error) => void
}

/**
 * Hook para capturar e gerenciar erros em componentes funcionais
 * Útil para erros que não são capturados pelo Error Boundary
 */
export function useErrorHandler(): UseErrorHandlerReturn {
  const [error, setError] = useState<Error | null>(null)

  const resetError = useCallback(() => {
    setError(null)
  }, [])

  const captureError = useCallback((error: Error) => {
    setError(error)
  }, [])

  return {
    error,
    resetError,
    captureError,
  }
}

/**
 * Hook para envolver funções assíncronas com tratamento de erro
 */
export function useAsyncError() {
  const { captureError } = useErrorHandler()

  const executeAsync = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T | undefined> => {
      try {
        return await fn()
      } catch (error) {
        captureError(error instanceof Error ? error : new Error(String(error)))
        return undefined
      }
    },
    [captureError]
  )

  return executeAsync
}
