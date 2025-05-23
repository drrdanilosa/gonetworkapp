import { create } from 'zustand'

export const useUIStore = create((set) => ({
  // Estado atual do menu/aba selecionada
  currentPage: 0,
  setCurrentPage: (page) => set({ currentPage: page }),

  // ID do evento selecionado
  selectedEventId: null,
  setSelectedEventId: (id) => set({ selectedEventId: id }),

  // ID do card expandido na lista de eventos
  expandedCardId: null,
  setExpandedCardId: (id) => set({ expandedCardId: id }),
  
  // Outros estados para controle de UI...
  darkMode: false,
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}))