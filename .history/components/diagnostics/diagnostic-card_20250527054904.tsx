'use client'

'use client'

import React from 'react'

interface DiagnosticCardProps {
  title: string
  status: 'success' | 'warning' | 'error' | 'loading'
  message: string
  details?: string[]
  onRetry?: () => void
}

const DiagnosticCard: React.FC<DiagnosticCardProps> = ({
  title,
  status,
  message,
  details,
  onRetry,
}) => {
  // Cores baseadas no status
  const statusColors = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
      icon: '✅',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-700',
      icon: '⚠️',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      icon: '❌',
    },
    loading: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      icon: '🔄',
    },
  }

  const colors = statusColors[status]

  return (
    <div className={`${colors.bg} ${colors.border} mb-4 rounded-md border p-4`}>
      <div className="flex items-start">
        <div className="mr-3 text-xl">{colors.icon}</div>
        <div className="flex-1">
          <h3 className={`${colors.text} text-sm font-medium`}>{title}</h3>
          <p className="mt-1 text-sm">{message}</p>

          {details && details.length > 0 && (
            <div className="mt-2 text-xs">
              <details>
                <summary className="cursor-pointer hover:underline">
                  Detalhes
                </summary>
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  {details.map((detail, index) => (
                    <li key={index}>{detail}</li>
                  ))}
                </ul>
              </details>
            </div>
          )}
        </div>

        {onRetry && (
          <button
            onClick={onRetry}
            className="rounded border border-gray-300 bg-white px-2 py-1 text-xs hover:bg-gray-50"
          >
            Tentar novamente
          </button>
        )}
      </div>
    </div>
  )
}

export default DiagnosticCard
