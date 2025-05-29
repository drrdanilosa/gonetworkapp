'use client'

import React, { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { useRouter } from 'next/navigation'
import { logger } from '@/lib/logger'

type UserRole = 'admin' | 'editor' | 'client' | 'guest' | 'viewer'

interface RoleGuardProps {
  /**
   * Array de roles que têm permissão para acessar o conteúdo
   */
  allowedRoles: UserRole[]
  /**
   * Conteúdo a ser renderizado se o usuário tiver permissão
   */
  children: React.ReactNode
  /**
   * Conteúdo alternativo a renderizar se o usuário não tiver permissão
   */
  fallback?: React.ReactNode
  /**
   * Se true, redireciona para a página de login em caso de usuário não autenticado
   */
  requireAuth?: boolean
  /**
   * Se true, redireciona para uma página específica em caso de permissão negada
   */
  redirectTo?: string
}

/**
 * Componente para controle de acesso baseado em roles.
 * Renderiza o conteúdo apenas se o usuário tiver uma das roles permitidas.
 */
const RoleGuard: React.FC<RoleGuardProps> = ({
  allowedRoles,
  children,
  fallback,
  requireAuth = true,
  redirectTo,
}) => {
  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
    loadUser,
  } = useAuthStore()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAccess = async () => {
      try {
        // Se está carregando auth, aguardar
        if (authLoading) {
          return
        }

        // Se requer autenticação mas não está autenticado
        if (requireAuth && !isAuthenticated) {
          logger.info(
            'RoleGuard: Usuário não autenticado, tentando carregar...',
            {
              allowedRoles,
              requireAuth,
            }
          )

          // Tentar carregar usuário (pode usar refresh token)
          try {
            await loadUser()
          } catch (error) {
            logger.warn('RoleGuard: Falha ao carregar usuário', error)

            // Redirecionar para login
            const loginPath = redirectTo || '/login'
            const currentPath = window.location.pathname
            const loginUrl = `${loginPath}?redirect=${encodeURIComponent(currentPath)}`

            router.push(loginUrl)
            return
          }
        }

        // Verificar se o usuário tem a role necessária
        const userRole = user?.role || 'guest'
        const hasPermission = allowedRoles.includes(userRole as UserRole)

        logger.debug('RoleGuard: Verificação de permissão', {
          userRole,
          allowedRoles,
          hasPermission,
          requireAuth,
        })

        if (requireAuth && !hasPermission && redirectTo) {
          logger.warn('RoleGuard: Acesso negado, redirecionando', {
            userRole,
            allowedRoles,
            redirectTo,
          })
          router.push(redirectTo)
          return
        }

        setIsLoading(false)
      } catch (error) {
        logger.error('RoleGuard: Erro durante verificação de acesso', error)
        setIsLoading(false)
      }
    }

    checkAccess()
  }, [
    isAuthenticated,
    user,
    allowedRoles,
    requireAuth,
    redirectTo,
    router,
    authLoading,
    loadUser,
  ])

  // Mostrar loading se ainda está carregando
  if (isLoading || authLoading) {
    return (
      <div className="flex h-24 items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    )
  }

  // Verificar se o usuário tem a role necessária
  const userRole = user?.role || 'guest'
  const hasPermission = allowedRoles.includes(userRole as UserRole)

  if (!hasPermission) {
    // Conteúdo alternativo ou mensagem padrão de acesso negado
    return (
      fallback || (
        <div className="p-6 text-center">
          <h2 className="mb-2 text-xl font-semibold text-red-600">
            Acesso Negado
          </h2>
          <p className="text-gray-600">
            Você não tem permissão para acessar este conteúdo.
          </p>
        </div>
      )
    )
  }

  // Renderizar o conteúdo se tiver permissão
  return <>{children}</>
}

export default RoleGuard
