import { useCallback, useMemo } from 'react'
import { useAuthStore } from '@/store/useAuthStore'

/**
 * Hook otimizado para usar o store de autenticação
 * Evita re-renders desnecessários selecionando apenas os dados necessários
 */
export function useAuth() {
  const user = useAuthStore(state => state.user)
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)
  const isLoading = useAuthStore(state => state.isLoading)
  const error = useAuthStore(state => state.error)

  // Memoizar ações para evitar re-renders desnecessários
  const actions = useMemo(
    () => ({
      login: useAuthStore.getState().login,
      register: useAuthStore.getState().register,
      logout: useAuthStore.getState().logout,
      loadUser: useAuthStore.getState().loadUser,
      refreshToken: useAuthStore.getState().refreshToken,
      clearError: useAuthStore.getState().clearError,
      updateUserRole: useAuthStore.getState().updateUserRole,
    }),
    []
  )

  // Seletores otimizados para propriedades específicas
  const userRole = useMemo(() => user?.role || null, [user?.role])
  const userName = useMemo(() => user?.name || null, [user?.name])
  const userEmail = useMemo(() => user?.email || null, [user?.email])

  // Helper functions memoizadas
  const hasRole = useCallback(
    (role: string | string[]) => {
      if (!user) return false
      if (Array.isArray(role)) {
        return role.includes(user.role)
      }
      return user.role === role
    },
    [user?.role]
  )

  const isAdmin = useMemo(() => userRole === 'admin', [userRole])
  const isEditor = useMemo(
    () => userRole === 'admin' || userRole === 'editor',
    [userRole]
  )

  return {
    // Estado
    user,
    isAuthenticated,
    isLoading,
    error,

    // Seletores otimizados
    userRole,
    userName,
    userEmail,

    // Helpers
    hasRole,
    isAdmin,
    isEditor,

    // Ações
    ...actions,
  }
}

/**
 * Hook para seletor específico do store de auth
 * Use quando precisar apenas de uma propriedade específica
 */
export function useAuthSelector<T>(selector: (state: unknown) => T): T {
  return useAuthStore(selector)
}

/**
 * Hook para verificação de roles específicas
 * Otimizado para evitar re-renders quando a role não muda
 */
export function useAuthRole() {
  return useAuthStore(
    useCallback(
      state => ({
        role: state.user?.role || null,
        hasRole: (role: string | string[]) => {
          if (!state.user) return false
          if (Array.isArray(role)) {
            return role.includes(state.user.role)
          }
          return state.user.role === role
        },
      }),
      []
    )
  )
}
