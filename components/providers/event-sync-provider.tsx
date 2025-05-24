'use client'

import { useEventSync } from '@/hooks/useEventSync'

interface EventSyncProviderProps {
  children: React.ReactNode
}

/**
 * Provider que utiliza o hook de sincronização de eventos.
 * 
 * Este componente deve ser adicionado no layout principal da aplicação
 * para garantir que os eventos criados no cliente (Zustand) sejam 
 * sincronizados com o sistema de persistência baseado em arquivos.
 */
export function EventSyncProvider({ children }: EventSyncProviderProps) {
  // Usar o hook de sincronização
  useEventSync()
  
  // Apenas renderiza os filhos, sem alteração visual
  return <>{children}</>
}
