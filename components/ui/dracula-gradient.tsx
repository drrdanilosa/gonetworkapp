'use client'

import React from 'react'

type VariantType = 'purple-pink' | 'cyan-green' | 'pink-orange' | 'purple-cyan' | 'yellow-orange' | 'green-cyan'
type DirectionType = 'to-r' | 'to-l' | 'to-t' | 'to-b' | 'to-tr' | 'to-tl' | 'to-br' | 'to-bl'

interface DraculaGradientProps {
  variant?: VariantType
  direction?: DirectionType
  className?: string
  children: React.ReactNode
}

export function DraculaGradient({
  variant = 'purple-pink',
  direction = 'to-br',
  className = '',
  children
}: DraculaGradientProps) {
  
  const getGradientClasses = (): string => {
    const baseClass = `bg-gradient-${direction}`
    
    switch (variant) {
      case 'purple-pink':
        return `${baseClass} from-dracula-purple to-dracula-pink`
      case 'cyan-green':
        return `${baseClass} from-dracula-cyan to-dracula-green`
      case 'pink-orange':
        return `${baseClass} from-dracula-pink to-dracula-orange`
      case 'purple-cyan':
        return `${baseClass} from-dracula-purple to-dracula-cyan`
      case 'yellow-orange':
        return `${baseClass} from-dracula-yellow to-dracula-orange`
      case 'green-cyan':
        return `${baseClass} from-dracula-green to-dracula-cyan`
      default:
        return `${baseClass} from-dracula-purple to-dracula-pink`
    }
  }
  
  return (
    <div className={`${getGradientClasses()} ${className}`}>
      {children}
    </div>
  )
}