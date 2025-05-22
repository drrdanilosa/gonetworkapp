'use client'

'use client'

"use client"

import React, { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { useRouter } from 'next/navigation'

type UserRole = 'admin' | 'editor' | 'client' | 'guest'

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
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAccess = async () => {
      // Pequeno delay para garantir que o estado de autenticação foi carregado
      await new Promise(resolve => setTimeout(resolve, 100))

      // Verificar se o usuário está autenticado quando necessário
      if (requireAuth && !isAuthenticated) {
        if (redirectTo) {
          router.push(redirectTo)
        } else {
          router.push('/login')
        }
        return
      }

      // Verificar se o usuário tem a role necessária
      const userRole = user?.role || 'guest'
      const hasPermission = allowedRoles.includes(userRole as UserRole)

      if (!hasPermission && redirectTo) {
        router.push(redirectTo)
      }

      setIsLoading(false)
    }

    checkAccess()
  }, [isAuthenticated, user, allowedRoles, requireAuth, redirectTo, router])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
          <h2 className="text-xl font-semibold text-red-600 mb-2">
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
