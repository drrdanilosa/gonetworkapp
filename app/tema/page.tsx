'use client'

import { Button } from "@/components/ui/button"
import { DraculaDemo } from "@/components/dracula-demo"
import { DraculaCard } from "@/components/ui/dracula-card"
import { MobileMenu } from "@/components/ui/mobile-menu"
import { useMobile } from "@/hooks/use-mobile"
import Link from 'next/link'

export default function ThemeDemoPage() {
  const isMobile = useMobile()
  
  return (
    <div>
      <div className="container py-2 md:py-4 flex items-center justify-between">
        {!isMobile ? (
          <Link href="/">
            <Button variant="outline" className="mb-4 md:mb-6">
              Voltar para página inicial
            </Button>
          </Link>
        ) : (
          <div className="flex items-center justify-between w-full mb-4">
            <Link href="/">
              <Button variant="outline" size="sm">Voltar</Button>
            </Link>
            <MobileMenu />
          </div>
        )}
      </div>
      
      <div className="container py-4 md:py-8">
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-primary mb-4 md:mb-8">Exemplos de Componentes</h1>        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-12">
          <DraculaCard
            title="Botões com tema Dracula"
            description="Exemplo de botões estilizados com o tema Dracula"
            codeExample={`<Button className="dracula-gradient">
  Botão Dracula
</Button>`}
          >
            <div className="flex flex-wrap gap-2 md:gap-3">
              <Button size={isMobile ? "sm" : "default"} className="dracula-gradient">Padrão</Button>
              <Button size={isMobile ? "sm" : "default"} className="dracula-gradient-alt">Alternativo</Button>
              <Button 
                size={isMobile ? "sm" : "default"} 
                variant="outline" 
                className="border-dracula-purple text-dracula-purple hover:bg-dracula-purple/10"
              >
                Outline
              </Button>
              <Button 
                size={isMobile ? "sm" : "default"} 
                variant="ghost" 
                className="text-dracula-pink hover:bg-dracula-pink/10"
              >
                Ghost
              </Button>
            </div>
          </DraculaCard>
          
          <DraculaCard
            title="Gradientes Dracula"
            description="Exemplos de gradientes com as cores do tema"
            codeExample={`.dracula-gradient { 
  @apply bg-gradient-to-br from-dracula-purple to-dracula-pink; 
}`}
          >
            <div className="space-y-3">
              <div className="h-12 rounded-lg dracula-gradient"></div>
              <div className="h-12 rounded-lg dracula-gradient-alt"></div>
              <div className="h-12 rounded-lg bg-gradient-to-r from-dracula-pink to-dracula-purple"></div>
              <div className="h-12 rounded-lg bg-gradient-to-r from-dracula-green to-dracula-yellow"></div>
            </div>
          </DraculaCard>
          
          <DraculaCard
            title="Sombras e Efeitos"
            description="Exemplos de sombras e efeitos disponíveis"
            codeExample={`.element { 
  @apply shadow-dracula hover:shadow-dracula-hover; 
}`}
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="h-16 bg-dracula-background p-2 rounded-lg shadow-dracula flex items-center justify-center text-dracula-comment">
                Dracula
              </div>
              <div className="h-16 bg-dracula-background p-2 rounded-lg shadow-dracula-hover flex items-center justify-center text-dracula-comment">
                Hover
              </div>
              <div className="h-16 bg-dracula-background p-2 rounded-lg shadow-dracula-cyan flex items-center justify-center text-dracula-cyan">
                Cyan
              </div>
              <div className="h-16 bg-dracula-background p-2 rounded-lg shadow-dracula-pink flex items-center justify-center text-dracula-pink">
                Pink
              </div>
            </div>
          </DraculaCard>
        </div>
      </div>
      
      <DraculaDemo />
    </div>
  )
}
