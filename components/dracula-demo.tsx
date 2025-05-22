'use client'

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemeToggle } from "@/components/theme-toggle"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle2, Info, Terminal, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useMobile } from "@/hooks/use-mobile"

export function DraculaDemo() {
  const isMobile = useMobile()
  
  return (
    <div className="container py-4 md:py-10">
      <div className="flex justify-between items-center mb-6 md:mb-10">
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-primary">Tema Dracula</h1>
        <ThemeToggle />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4 text-dracula-purple">Paleta de Cores</h2>
          
          <div className="grid grid-cols-2 gap-2 md:gap-4">
            <div className="p-2 md:p-4 rounded-md bg-dracula-background text-dracula-foreground text-xs md:text-sm">
              Background
            </div>
            <div className="p-2 md:p-4 rounded-md bg-dracula-current-line text-dracula-foreground text-xs md:text-sm">
              Current Line
            </div>
            <div className="p-2 md:p-4 rounded-md bg-dracula-selection text-dracula-foreground text-xs md:text-sm">
              Selection
            </div>
            <div className="p-2 md:p-4 rounded-md bg-dracula-foreground text-dracula-background text-xs md:text-sm">
              Foreground
            </div>
            <div className="p-2 md:p-4 rounded-md bg-dracula-comment text-dracula-foreground text-xs md:text-sm">
              Comment
            </div>
            <div className="p-2 md:p-4 rounded-md bg-dracula-cyan text-dracula-background text-xs md:text-sm">
              Cyan
            </div>
            <div className="p-2 md:p-4 rounded-md bg-dracula-green text-dracula-background text-xs md:text-sm">
              Green
            </div>
            <div className="p-2 md:p-4 rounded-md bg-dracula-orange text-dracula-background text-xs md:text-sm">
              Orange
            </div>
            <div className="p-2 md:p-4 rounded-md bg-dracula-pink text-dracula-background text-xs md:text-sm">
              Pink
            </div>
            <div className="p-2 md:p-4 rounded-md bg-dracula-purple text-dracula-background text-xs md:text-sm">
              Purple
            </div>
            <div className="p-2 md:p-4 rounded-md bg-dracula-red text-dracula-background text-xs md:text-sm">
              Red
            </div>
            <div className="p-2 md:p-4 rounded-md bg-dracula-yellow text-dracula-background text-xs md:text-sm">
              Yellow
            </div>
          </div>

          <div className="mt-4 md:mt-6">
            <h3 className="text-lg md:text-xl font-semibold mb-2 text-dracula-pink">Badges</h3>
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </div>
          </div>

          <div className="mt-4 md:mt-6">
            <h3 className="text-lg md:text-xl font-semibold mb-2 text-dracula-pink">Alertas</h3>
            <div className="space-y-2 md:space-y-3">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Informação</AlertTitle>
                <AlertDescription className="text-xs md:text-sm">
                  Esta é uma mensagem informativa.
                </AlertDescription>
              </Alert>

              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription className="text-xs md:text-sm">
                  Algo deu errado, tente novamente.
                </AlertDescription>
              </Alert>

              <Alert className="bg-dracula-green/20 text-dracula-green border-dracula-green">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Sucesso</AlertTitle>
                <AlertDescription className="text-xs md:text-sm">
                  Operação realizada com sucesso!
                </AlertDescription>
              </Alert>

              <Alert className="bg-dracula-orange/20 text-dracula-orange border-dracula-orange">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Aviso</AlertTitle>
                <AlertDescription className="text-xs md:text-sm">
                  Atenção, isto é um aviso importante.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4 text-dracula-purple">Componentes UI</h2>
          
          <Card className="mb-4 md:mb-6">
            <CardHeader className="space-y-1 p-4 md:p-6">
              <CardTitle className="text-xl md:text-2xl">Login</CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Entre com suas credenciais para acessar sua conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 md:space-y-4 p-4 md:p-6 pb-0 md:pb-0">
              <div className="space-y-1 md:space-y-2">
                <Label htmlFor="email" className="text-xs md:text-sm">Email</Label>
                <Input id="email" placeholder="seuemail@exemplo.com" type="email" />
              </div>
              <div className="space-y-1 md:space-y-2">
                <Label htmlFor="password" className="text-xs md:text-sm">Senha</Label>
                <Input id="password" type="password" />
              </div>
            </CardContent>
            <CardFooter className="p-4 md:p-6">
              <Button className="w-full">Entrar</Button>
            </CardFooter>
          </Card>
          
          <div className="space-y-3 md:space-y-4">
            <div>
              <h3 className="text-lg md:text-xl font-semibold mb-2 text-dracula-green">Botões</h3>
              <div className="flex flex-wrap gap-1 md:gap-2">
                <Button size={isMobile ? "sm" : "default"}>Primary</Button>
                <Button size={isMobile ? "sm" : "default"} variant="secondary">Secondary</Button>
                <Button size={isMobile ? "sm" : "default"} variant="destructive">Destructive</Button>
                <Button size={isMobile ? "sm" : "default"} variant="outline">Outline</Button>
                <Button size={isMobile ? "sm" : "default"} variant="ghost">Ghost</Button>
                <Button size={isMobile ? "sm" : "default"} variant="link">Link</Button>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg md:text-xl font-semibold mb-2 text-dracula-green">Tabs</h3>
              <Tabs defaultValue="code" className="w-full">
                <TabsList className="grid grid-cols-3 h-auto">
                  <TabsTrigger value="code" className="text-xs md:text-sm py-2">Código</TabsTrigger>
                  <TabsTrigger value="design" className="text-xs md:text-sm py-2">Design</TabsTrigger>
                  <TabsTrigger value="preview" className="text-xs md:text-sm py-2">Prévia</TabsTrigger>
                </TabsList>
                <TabsContent value="code" className="p-2 md:p-4 rounded-md bg-dracula-current-line">
                  <div className="font-mono text-xs md:text-sm text-dracula-foreground">
                    <pre><code>{`function draculaTheme() {
  console.log('🧛‍♂️ Dracula theme activated!');
  return '🦇 Dark mode enabled';
}`}</code></pre>
                  </div>
                </TabsContent>
                <TabsContent value="design" className="p-2 md:p-4">
                  <p className="text-xs md:text-sm">Configurações de design do tema Dracula.</p>
                </TabsContent>
                <TabsContent value="preview" className="p-2 md:p-4">
                  <p className="text-xs md:text-sm">Prévia do tema Dracula aplicado ao projeto.</p>
                </TabsContent>
              </Tabs>
            </div>

            <div className="mt-4 md:mt-6">
              <div className="p-4 md:p-6 bg-dracula-current-line rounded-lg border border-dracula-comment">
                <Terminal className="h-5 w-5 md:h-6 md:w-6 mb-2 text-dracula-purple" />
                <h3 className="text-base md:text-lg font-medium">Código Fonte</h3>
                <p className="text-xs md:text-sm text-dracula-comment mt-2">
                  Com o tema Dracula, seu código ganha uma legibilidade superior em ambientes escuros, reduzindo a fadiga visual e aumentando o foco durante longas sessões de codificação.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
