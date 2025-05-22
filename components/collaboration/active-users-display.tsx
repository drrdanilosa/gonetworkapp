"use client"

import { useCollaboration } from "@/contexts/collaboration-context"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Edit, MessageSquare } from "lucide-react"

export default function ActiveUsersDisplay() {
  const { activeUsers, typingUsers, activeAnnotators } = useCollaboration()

  // Função para obter as iniciais do nome
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  // Função para obter a cor de fundo do avatar
  const getAvatarColor = (color: string) => {
    return { backgroundColor: color }
  }

  // Função para obter a cor do texto do avatar
  const getTextColor = (color: string) => {
    // Calcular a luminância para determinar se o texto deve ser claro ou escuro
    const r = Number.parseInt(color.slice(1, 3), 16) / 255
    const g = Number.parseInt(color.slice(3, 5), 16) / 255
    const b = Number.parseInt(color.slice(5, 7), 16) / 255
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b

    return luminance > 0.5 ? "#000000" : "#FFFFFF"
  }

  // Verificar se um usuário está digitando
  const isTyping = (userId: string) => {
    return typingUsers.includes(userId)
  }

  // Verificar se um usuário está anotando
  const isAnnotating = (userId: string) => {
    return userId in activeAnnotators
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">Usuários Ativos ({activeUsers.length})</h3>

      <div className="flex flex-wrap gap-2">
        {activeUsers.map((user) => (
          <TooltipProvider key={user.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <Avatar className="h-10 w-10 border-2" style={{ borderColor: user.color }}>
                      <AvatarFallback
                        style={{
                          ...getAvatarColor(user.color),
                          color: getTextColor(user.color),
                        }}
                      >
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    {isTyping(user.id) && (
                      <Badge
                        className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center"
                        style={{ backgroundColor: user.color }}
                      >
                        <MessageSquare className="h-3 w-3" />
                      </Badge>
                    )}
                    {isAnnotating(user.id) && (
                      <Badge
                        className="absolute -bottom-1 -right-1 h-5 w-5 p-0 flex items-center justify-center"
                        style={{ backgroundColor: user.color }}
                      >
                        <Edit className="h-3 w-3" />
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs mt-1 max-w-[60px] truncate">{user.name}</span>
                  <Badge
                    variant="outline"
                    className="text-[10px] h-4 px-1 mt-0.5"
                    style={{ borderColor: user.color, color: user.color }}
                  >
                    {user.role}
                  </Badge>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <div className="text-sm font-medium">{user.name}</div>
                <div className="text-xs">{user.role}</div>
                <div className="text-xs">
                  {isTyping(user.id) && "Digitando..."}
                  {isAnnotating(user.id) && "Anotando..."}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </div>
  )
}
