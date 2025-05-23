import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useUIStore = create(
  persist(
    (set, get) => ({
      // Estado atual do menu/aba selecionada
      currentPage: 0,
      setCurrentPage: (page) => set({ currentPage: page }),

      // ID do evento selecionado
      selectedEventId: null,
      setSelectedEventId: (id) => set({ selectedEventId: id }),

      // ID do card expandido na lista de eventos
      expandedCardId: null,
      setExpandedCardId: (id) => set({ expandedCardId: id }),

      // Sistema de notificações
      notifications: [],
      addNotification: (notification) => set((state) => ({
        notifications: [
          ...state.notifications,
          {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            ...notification
          }
        ]
      })),
      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      })),
      clearNotifications: () => set({ notifications: [] }),

      // Estados de UI
      darkMode: false,
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),

      sidebarOpen: true,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      // Estados de loading para diferentes componentes
      isLoading: false,
      setLoading: (loading) => set({ isLoading: loading }),

      // Modal states
      showCreateEventModal: false,
      setShowCreateEventModal: (show) => set({ showCreateEventModal: show }),
    }),
    {
      name: 'ui-storage',
      version: 1,
      // Função de migração
      migrate: (persistedState, version) => {
        if (version === 0) {
          return {
            ...persistedState,
            notifications: persistedState.notifications || [],
            currentPage: persistedState.currentPage || 0,
            selectedEventId: persistedState.selectedEventId || null,
            expandedCardId: persistedState.expandedCardId || null,
            darkMode: persistedState.darkMode || false,
            sidebarOpen: persistedState.sidebarOpen ?? true,
            isLoading: false,
            showCreateEventModal: false
          }
        }
        return persistedState
      },
      // Não persistir estados temporários
      partialize: (state) => ({
        currentPage: state.currentPage,
        selectedEventId: state.selectedEventId,
        darkMode: state.darkMode,
        sidebarOpen: state.sidebarOpen
      }),
    }
  )
)