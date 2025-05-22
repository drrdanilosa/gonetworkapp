// app/admin/page.tsx
import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActivitySquare, Settings, AlertTriangle, Network } from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard Administrativo | MelhorApp",
  description: "Painel de controle para administradores",
};

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Administrativo</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Sistema</CardTitle>
            <CardDescription>Estado geral do sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="flex items-center">
                <ActivitySquare className="h-5 w-5 mr-2 text-green-500" />
                Todos os serviços online
              </span>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/diagnosticos">Ver status</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Conectividade</CardTitle>
            <CardDescription>Status das conexões</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="flex items-center">
                <Network className="h-5 w-5 mr-2 text-amber-500" />
                Socket.io: Verificação recomendada
              </span>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/diagnosticos">Testar</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Configurações</CardTitle>
            <CardDescription>Opções do sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="flex items-center">
                <Settings className="h-5 w-5 mr-2 text-blue-500" />
                Configurações do sistema
              </span>
              <Button variant="outline" size="sm" disabled>
                Gerenciar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Sobre o Módulo Administrativo</CardTitle>
          <CardDescription>
            Este módulo fornece ferramentas para administrar e monitorar o MelhorApp.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Utilize as ferramentas de diagnóstico para verificar o status dos serviços,
            testar conexões e solucionar problemas técnicos do sistema.
          </p>
          
          <div className="flex items-center p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-900 rounded-md">
            <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
            <span className="text-sm">
              Ferramentas de diagnóstico disponíveis para resolver problemas de conexão com Socket.io.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
