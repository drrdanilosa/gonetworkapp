import { create } from 'zustand';
import type { User } from '@/types/user';

interface CollaborationState {
  activeUsers: User[];
  typingUsers: string[]; // IDs dos usuários digitando
  activeAnnotators: string[]; // IDs dos usuários anotando
}

interface CollaborationStore extends CollaborationState {
  setActiveUsers: (users: User[]) => void;
  addActiveUser: (user: User) => void;
  removeActiveUser: (userId: string) => void;
  
  setUserTyping: (userId: string, isTyping: boolean) => void;
  setUserAnnotating: (userId: string, isAnnotating: boolean) => void;
  
  isUserTyping: (userId: string) => boolean;
  isUserAnnotating: (userId: string) => boolean;
}

export const useCollaborationStore = create<CollaborationStore>()((set, get) => ({
  activeUsers: [],
  typingUsers: [],
  activeAnnotators: [],
  
  setActiveUsers: (users) => set((state) => ({
    ...state,
    activeUsers: users
  })),
  
  addActiveUser: (user) => set((state) => {
    // Verifica se o usuário já está na lista
    if (state.activeUsers.some(u => u.id === user.id)) {
      return state;
    }
    return { 
      ...state,
      activeUsers: [...state.activeUsers, user] 
    };
  }),
  
  removeActiveUser: (userId) => set((state) => ({
    ...state,
    activeUsers: state.activeUsers.filter(user => user.id !== userId),
    typingUsers: state.typingUsers.filter(id => id !== userId),
    activeAnnotators: state.activeAnnotators.filter(id => id !== userId),
  })),
  
  setUserTyping: (userId, isTyping) => set((state) => {
    if (isTyping && !state.typingUsers.includes(userId)) {
      return { 
        ...state,
        typingUsers: [...state.typingUsers, userId] 
      };
    } else if (!isTyping) {
      return { 
        ...state,
        typingUsers: state.typingUsers.filter(id => id !== userId) 
      };
    }
    return state;
  }),
  
  setUserAnnotating: (userId, isAnnotating) => set((state) => {
    if (isAnnotating && !state.activeAnnotators.includes(userId)) {
      return { 
        ...state,
        activeAnnotators: [...state.activeAnnotators, userId] 
      };
    } else if (!isAnnotating) {
      return { 
        ...state,
        activeAnnotators: state.activeAnnotators.filter(id => id !== userId) 
      };
    }
    return state;
  }),
  
  isUserTyping: (userId) => get().typingUsers.includes(userId),
  isUserAnnotating: (userId) => get().activeAnnotators.includes(userId),
}));
