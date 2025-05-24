'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ThemeToggle } from '@/components/theme-toggle'
import { Badge } from '@/components/ui/badge'
import {
  AlertCircle,
  CheckCircle2,
  Info,
  Terminal,
  AlertTriangle,
} from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useMobile } from '@/hooks/use-mobile'

export function DraculaDemo() {
  const isMobile = useMobile()

  return (
    <div className="container py-4 md:py-10">
      <div className="mb-6 flex items-center justify-between md:mb-10">
        <h1 className="text-2xl font-bold tracking-tight text-primary md:text-4xl">
          Tema Dracula
        </h1>
        <ThemeToggle />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
        <div>
          <h2 className="mb-3 text-xl font-semibold text-dracula-purple md:mb-4 md:text-2xl">
            Paleta de Cores
          </h2>

          <div className="grid grid-cols-2 gap-2 md:gap-4">
            <div className="rounded-md bg-dracula-background p-2 text-xs text-dracula-foreground md:p-4 md:text-sm">
              Background
            </div>
            <div className="rounded-md bg-dracula-current-line p-2 text-xs text-dracula-foreground md:p-4 md:text-sm">
              Current Line
            </div>
            <div className="rounded-md bg-dracula-selection p-2 text-xs text-dracula-foreground md:p-4 md:text-sm">
              Selection
            </div>
            <div className="rounded-md bg-dracula-foreground p-2 text-xs text-dracula-background md:p-4 md:text-sm">
              Foreground
            </div>
            <div className="rounded-md bg-dracula-comment p-2 text-xs text-dracula-foreground md:p-4 md:text-sm">
              Comment
            </div>
            <div className="rounded-md bg-dracula-cyan p-2 text-xs text-dracula-background md:p-4 md:text-sm">
              Cyan
            </div>
            <div className="rounded-md bg-dracula-green p-2 text-xs text-dracula-background md:p-4 md:text-sm">
              Green
            </div>
            <div className="rounded-md bg-dracula-orange p-2 text-xs text-dracula-background md:p-4 md:text-sm">
              Orange
            </div>
            <div className="rounded-md bg-dracula-pink p-2 text-xs text-dracula-background md:p-4 md:text-sm">
              Pink
            </div>
            <div className="rounded-md bg-dracula-purple p-2 text-xs text-dracula-background md:p-4 md:text-sm">
              Purple
            </div>
            <div className="rounded-md bg-dracula-red p-2 text-xs text-dracula-background md:p-4 md:text-sm">
              Red
            </div>
            <div className="rounded-md bg-dracula-yellow p-2 text-xs text-dracula-background md:p-4 md:text-sm">
              Yellow
            </div>
          </div>

          <div className="mt-4 md:mt-6">
            <h3 className="mb-2 text-lg font-semibold text-dracula-pink md:text-xl">
              Badges
            </h3>
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </div>
          </div>

          <div className="mt-4 md:mt-6">
            <h3 className="mb-2 text-lg font-semibold text-dracula-pink md:text-xl">
              Alertas
            </h3>
            <div className="space-y-2 md:space-y-3">
              <Alert>
                <Info className="size-4" />
                <AlertTitle>Informação</AlertTitle>
                <AlertDescription className="text-xs md:text-sm">
                  Esta é uma mensagem informativa.
                </AlertDescription>
              </Alert>

              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription className="text-xs md:text-sm">
                  Algo deu errado, tente novamente.
                </AlertDescription>
              </Alert>

              <Alert className="border-dracula-green bg-dracula-green/20 text-dracula-green">
                <CheckCircle2 className="size-4" />
                <AlertTitle>Sucesso</AlertTitle>
                <AlertDescription className="text-xs md:text-sm">
                  Operação realizada com sucesso!
                </AlertDescription>
              </Alert>

              <Alert className="border-dracula-orange bg-dracula-orange/20 text-dracula-orange">
                <AlertTriangle className="size-4" />
                <AlertTitle>Aviso</AlertTitle>
                <AlertDescription className="text-xs md:text-sm">
                  Atenção, isto é um aviso importante.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-xl font-semibold text-dracula-purple md:mb-4 md:text-2xl">
            Componentes UI
          </h2>

          <Card className="mb-4 md:mb-6">
            <CardHeader className="space-y-1 p-4 md:p-6">
              <CardTitle className="text-xl md:text-2xl">Login</CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Entre com suas credenciais para acessar sua conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 p-4 pb-0 md:space-y-4 md:p-6 md:pb-0">
              <div className="space-y-1 md:space-y-2">
                <Label htmlFor="email" className="text-xs md:text-sm">
                  Email
                </Label>
                <Input
                  id="email"
                  placeholder="seuemail@exemplo.com"
                  type="email"
                />
              </div>
              <div className="space-y-1 md:space-y-2">
                <Label htmlFor="password" className="text-xs md:text-sm">
                  Senha
                </Label>
                <Input id="password" type="password" />
              </div>
            </CardContent>
            <CardFooter className="p-4 md:p-6">
              <Button className="w-full">Entrar</Button>
            </CardFooter>
          </Card>

          <div className="space-y-3 md:space-y-4">
            <div>
              <h3 className="mb-2 text-lg font-semibold text-dracula-green md:text-xl">
                Botões
              </h3>
              <div className="flex flex-wrap gap-1 md:gap-2">
                <Button size={isMobile ? 'sm' : 'default'}>Primary</Button>
                <Button size={isMobile ? 'sm' : 'default'} variant="secondary">
                  Secondary
                </Button>
                <Button
                  size={isMobile ? 'sm' : 'default'}
                  variant="destructive"
                >
                  Destructive
                </Button>
                <Button size={isMobile ? 'sm' : 'default'} variant="outline">
                  Outline
                </Button>
                <Button size={isMobile ? 'sm' : 'default'} variant="ghost">
                  Ghost
                </Button>
                <Button size={isMobile ? 'sm' : 'default'} variant="link">
                  Link
                </Button>
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-semibold text-dracula-green md:text-xl">
                Tabs
              </h3>
              <Tabs defaultValue="code" className="w-full">
                <TabsList className="grid h-auto grid-cols-3">
                  <TabsTrigger value="code" className="py-2 text-xs md:text-sm">
                    Código
                  </TabsTrigger>
                  <TabsTrigger
                    value="design"
                    className="py-2 text-xs md:text-sm"
                  >
                    Design
                  </TabsTrigger>
                  <TabsTrigger
                    value="preview"
                    className="py-2 text-xs md:text-sm"
                  >
                    Prévia
                  </TabsTrigger>
                </TabsList>
                <TabsContent
                  value="code"
                  className="rounded-md bg-dracula-current-line p-2 md:p-4"
                >
                  <div className="font-mono text-xs text-dracula-foreground md:text-sm">
                    <pre>
                      <code>{`function draculaTheme() {
  console.log('🧛‍♂️ Dracula theme activated!');
  return '🦇 Dark mode enabled';
}`}</code>
                    </pre>
                  </div>
                </TabsContent>
                <TabsContent value="design" className="p-2 md:p-4">
                  <p className="text-xs md:text-sm">
                    Configurações de design do tema Dracula.
                  </p>
                </TabsContent>
                <TabsContent value="preview" className="p-2 md:p-4">
                  <p className="text-xs md:text-sm">
                    Prévia do tema Dracula aplicado ao projeto.
                  </p>
                </TabsContent>
              </Tabs>
            </div>

            <div className="mt-4 md:mt-6">
              <div className="rounded-lg border border-dracula-comment bg-dracula-current-line p-4 md:p-6">
                <Terminal className="mb-2 size-5 text-dracula-purple md:size-6" />
                <h3 className="text-base font-medium md:text-lg">
                  Código Fonte
                </h3>
                <p className="mt-2 text-xs text-dracula-comment md:text-sm">
                  Com o tema Dracula, seu código ganha uma legibilidade superior
                  em ambientes escuros, reduzindo a fadiga visual e aumentando o
                  foco durante longas sessões de codificação.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
