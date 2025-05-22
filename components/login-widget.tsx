"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMobile } from "@/hooks/use-mobile"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { loginSchema, LoginFormValues } from "@/features/auth/schemas"
import { useAuthStore } from "@/store/useAuthStore"
import { loginUser } from "@/services/auth-service"

interface LoginWidgetProps {
  onLoginSuccess: (user: any) => void
}

export default function LoginWidget({ onLoginSuccess }: LoginWidgetProps) {
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const login = useAuthStore((state) => state.login)
  const isMobile = useMobile()
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  })

  const handleSubmit = async (values: LoginFormValues) => {
    setError("")
    setIsLoading(true)

    try {
      // Uso do serviço de autenticação
      const user = await loginUser(values.email, values.password)
      
      // Atualiza o estado global
      login(user)
      
      // Callback para o componente pai
      onLoginSuccess(user)
    } catch (err: any) {
      setError(err.message || "Erro ao tentar fazer login. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background p-4">
      <Card className={`${isMobile ? 'w-full' : 'w-[400px]'} border border-border shadow-lg`}>
        <CardHeader className={`${isMobile ? 'p-4' : 'p-6'} space-y-3 md:space-y-4 flex flex-col items-center`}>
          <Image 
            src="/logo_gonetwork.png" 
            alt="GoNetwork AI Logo" 
            width={isMobile ? 60 : 80} 
            height={isMobile ? 60 : 80} 
            className="mb-1 md:mb-2" 
          />
          <CardTitle className={`${isMobile ? 'text-xl' : 'text-2xl'} text-primary`}>
            GoNetwork AI
          </CardTitle>
          <CardDescription className={isMobile ? 'text-sm text-center' : ''}>
            Entre com suas credenciais para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent className={isMobile ? 'p-4' : ''}>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3 md:space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="seu@email.com" 
                        type="email"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input 
                        type="password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
              
              <div className={`text-center ${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground mt-3 md:mt-4`}>
                <p>Use admin@gonetwork.ai / admin para demonstração</p>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
