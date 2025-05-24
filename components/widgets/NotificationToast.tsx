'use client'

import React from 'react'
import { useUIStore } from '@/store/useUIStore'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function NotificationToast() {
  const notifications = useUIStore(state => state.notifications) || []
  const removeNotification = useUIStore(state => state.removeNotification)

  // Verificação de segurança
  if (!notifications || notifications.length === 0) return null

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 max-w-md space-y-2">
      {notifications.map(note => (
        <div
          key={note.id}
          className={cn(
            'flex items-center justify-between rounded-lg p-4 shadow-lg',
            'border animate-in fade-in slide-in-from-bottom-5',
            'pointer-events-auto',
            note.type === 'success' &&
              'border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-50',
            note.type === 'warning' &&
              'border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-50',
            note.type === 'error' &&
              'border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-50',
            (!note.type || note.type === 'info') &&
              'border-border bg-card text-card-foreground'
          )}
        >
          <div className="flex-1">
            {note.title && (
              <div className="text-sm font-semibold">{note.title}</div>
            )}
            <span className="text-sm">{note.message}</span>
          </div>
          <button
            onClick={() => removeNotification(note.id)}
            className="ml-4 shrink-0 rounded-full p-1 hover:bg-muted"
            aria-label="Fechar notificação"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  )
}
