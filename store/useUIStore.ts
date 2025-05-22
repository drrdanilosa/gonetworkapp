import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type NotificationType = 'info' | 'success' | 'warning' | 'error';

interface Notification {
  id: string;
  message: string;
  type?: NotificationType;
}

interface UIState {
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  currentTab: string;
  isMobile: boolean;
  currentPage: number; // Adicionado para rastrear a página atual
  selectedEventId: string | null; // Adicionado para rastrear o evento selecionado
  notifications: Notification[]; // Adicionado para sistema de notificações
}

interface UIStore extends UIState {
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setCurrentTab: (tab: string) => void;
  setIsMobile: (isMobile: boolean) => void;
  setCurrentPage: (page: number) => void; // Novo método para definir a página atual
  setSelectedEventId: (eventId: string | null) => void; // Novo método para definir o evento selecionado
    // Sistema de notificações
  addNotification: (message: string, type?: NotificationType) => void;
  removeNotification: (id: string) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      theme: 'system',
      sidebarOpen: true,
      currentTab: 'dashboard',
      isMobile: false,
      currentPage: 0, // 0 = Dashboard, 1 = Eventos, 2 = Equipe, 3 = Briefing, etc.
      selectedEventId: null, // Evento selecionado inicialmente nulo
      notifications: [], // Inicializa com array vazio de notificações
      
      // Usando modo seguro para evitar problemas de atualização
      setTheme: (theme) => set((state) => ({ ...state, theme })),
      toggleSidebar: () => set((state) => ({ 
        ...state, 
        sidebarOpen: !state.sidebarOpen 
      })),
      setSidebarOpen: (open) => set((state) => ({ 
        ...state, 
        sidebarOpen: open 
      })),
      setCurrentTab: (tab) => set((state) => ({ 
        ...state, 
        currentTab: tab 
      })),
      setIsMobile: (isMobile) => set((state) => ({ 
        ...state, 
        isMobile 
      })),      setCurrentPage: (page) => set((state) => ({
        ...state,
        currentPage: page
      })),
        setSelectedEventId: (eventId) => set((state) => ({
        ...state,
        selectedEventId: eventId
      })),      // Sistema de notificações
      addNotification: (message, type = 'info') => {
        const id = Math.random().toString(36).substring(2, 9);
        set((state) => ({
          ...state,
          notifications: [...state.notifications, { id, message, type }]
        }));
        // Remove automaticamente após 5 segundos
        setTimeout(() => {
          get().removeNotification(id);
        }, 5000);
      },
      
      removeNotification: (id) => set((state) => ({
        ...state,
        notifications: state.notifications.filter(n => n.id !== id)
      })),
    }),
    {
      name: 'ui-storage',
      skipHydration: true,
    }
  )
);
