'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Code } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"

interface DraculaCardProps {
  title: string
  description: string
  codeExample?: string
  children?: React.ReactNode
  className?: string
}

export function DraculaCard({ 
  title, 
  description, 
  codeExample, 
  children,
  className = ""
}: DraculaCardProps) {
  const isMobile = useMobile()
  return (
    <Card className={`overflow-hidden transition-all hover:shadow-dracula-hover ${className}`}>
      <CardHeader className={`bg-dracula-selection ${isMobile ? 'p-3 pb-3' : 'pb-4'}`}>
        <CardTitle className={`flex items-center gap-2 font-medium text-dracula-foreground ${isMobile ? 'text-base' : ''}`}>
          <Code className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-dracula-purple`} />
          {title}
        </CardTitle>
        <CardDescription className={`text-dracula-foreground/70 ${isMobile ? 'text-xs' : ''}`}>
          {description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className={`${isMobile ? 'p-3' : 'p-5'}`}>
        {children}
        
        {codeExample && (
          <div className={`mt-3 md:mt-4 dracula-code ${isMobile ? 'text-xs' : 'text-sm'} overflow-auto p-2 md:p-3`}>
            <pre>{codeExample}</pre>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="border-t border-dracula-comment flex justify-between bg-dracula-background/50 p-3">
        <span className="text-xs text-dracula-comment">Tema Dracula</span>
        <Button 
          size="sm" 
          className={`dracula-gradient text-white ${isMobile ? 'text-xs px-2 py-1 h-7' : 'text-xs'} shadow-sm hover:shadow-dracula-hover hover:opacity-90`}
        >
          Ação
        </Button>
      </CardFooter>
    </Card>
  )
}