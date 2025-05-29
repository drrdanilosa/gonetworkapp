'use client'

import React, { ErrorInfo, ReactNode } from 'react'
import { logger } from '@/lib/logger'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: (error: Error, reset: () => void) => ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log do erro
    logger.error('Error caught by boundary', error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: this.constructor.name,
    })

    // Callback personalizado se fornecido
    this.props.onError?.(error, errorInfo)

    // Atualizar estado com informações do erro
    this.setState({
      error,
      errorInfo,
    })
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Usar fallback personalizado se fornecido
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleReset)
      }

      // Fallback padrão
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-red-100">
              <svg
                className="size-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>

            <div className="mt-4 text-center">
              <h3 className="text-lg font-medium text-gray-900">
                Ops! Algo deu errado
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Ocorreu um erro inesperado. Nossa equipe foi notificada.
              </p>

              {process.env.NODE_ENV === 'development' && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700">
                    Detalhes do erro (desenvolvimento)
                  </summary>
                  <pre className="mt-2 max-h-40 overflow-auto rounded bg-gray-100 p-2 text-xs">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={this.handleReset}
                className="flex-1 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Tentar novamente
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 rounded-md bg-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Recarregar página
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
