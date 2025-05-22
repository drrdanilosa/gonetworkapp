"use client"

import type React from "react"

import { useCollaboration } from "@/contexts/collaboration-context"
import { useEffect, useState } from "react"

interface RemoteCursorsProps {
  containerRef: React.RefObject<HTMLDivElement>
}

export default function RemoteCursors({ containerRef }: RemoteCursorsProps) {
  const { userCursors, activeUsers } = useCollaboration()
  const [containerRect, setContainerRect] = useState<DOMRect | null>(null)

  // Atualizar o retângulo do contêiner quando ele mudar
  useEffect(() => {
    if (!containerRef.current) return

    const updateRect = () => {
      if (containerRef.current) {
        setContainerRect(containerRef.current.getBoundingClientRect())
      }
    }

    updateRect()

    const resizeObserver = new ResizeObserver(updateRect)
    resizeObserver.observe(containerRef.current)

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current)
      }
    }
  }, [containerRef])

  if (!containerRect) return null

  return (
    <>
      {Object.entries(userCursors).map(([userId, position]) => {
        const user = activeUsers.find((u) => u.id === userId)
        if (!user) return null

        // Calcular a posição relativa ao contêiner
        const x = position.x - containerRect.left
        const y = position.y - containerRect.top

        // Verificar se o cursor está dentro do contêiner
        if (x < 0 || y < 0 || x > containerRect.width || y > containerRect.height) {
          return null
        }

        return (
          <div
            key={userId}
            className="absolute pointer-events-none z-50 transition-all duration-100"
            style={{
              left: `${x}px`,
              top: `${y}px`,
              transform: "translate(-50%, -50%)",
            }}
          >
            {/* Cursor personalizado */}
            <div className="relative">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ color: user.color }}
              >
                <path
                  d="M5.64124 16.9999L5.00017 5.99991L14.0002 14.9999L9.00017 15.9999L5.64124 16.9999Z"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              {/* Nome do usuário */}
              <div
                className="absolute left-6 top-0 px-2 py-1 rounded text-xs whitespace-nowrap"
                style={{ backgroundColor: user.color, color: "#fff" }}
              >
                {user.name}
              </div>
            </div>
          </div>
        )
      })}
    </>
  )
}
