import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save } from "lucide-react"

export default function SettingsWidget() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Configurações</h1>
      </div>

      <Tabs defaultValue="account">
        <TabsList>
          <TabsTrigger value="account">Conta</TabsTrigger>
          <TabsTrigger value="appearance">Aparência</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="system">Sistema</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Perfil</CardTitle>
              <CardDescription>Atualize suas informações pessoais e de contato</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input id="name" defaultValue="Administrador" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="admin@gonetwork.ai" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input id="phone" type="tel" placeholder="(00) 00000-0000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Função</Label>
                  <Input id="role" defaultValue="Administrador" disabled />
                </div>
              </div>

              <div className="flex justify-end">
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Segurança</CardTitle>
              <CardDescription>Gerencie sua senha e configurações de segurança</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Senha Atual</Label>
                  <Input id="current-password" type="password" />
                </div>
                <div></div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nova Senha</Label>
                  <Input id="new-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                  <Input id="confirm-password" type="password" />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Autenticação de Dois Fatores</h4>
                    <p className="text-sm text-muted-foreground">Adicione uma camada extra de segurança à sua conta</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Sessões Ativas</h4>
                    <p className="text-sm text-muted-foreground">Gerencie dispositivos onde você está conectado</p>
                  </div>
                  <Button variant="outline">Gerenciar</Button>
                </div>
              </div>

              <div className="flex justify-end">
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Aparência</CardTitle>
              <CardDescription>Personalize a aparência do sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tema</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="border rounded-md p-3 flex flex-col items-center gap-2 cursor-pointer bg-secondary/20">
                    <div className="w-full h-24 rounded bg-background border"></div>
                    <span className="text-sm font-medium">Escuro (Padrão)</span>
                  </div>
                  <div className="border rounded-md p-3 flex flex-col items-center gap-2 cursor-pointer">
                    <div className="w-full h-24 rounded bg-white border"></div>
                    <span className="text-sm">Claro</span>
                  </div>
                  <div className="border rounded-md p-3 flex flex-col items-center gap-2 cursor-pointer">
                    <div className="w-full h-24 rounded bg-gradient-to-b from-white to-background border"></div>
                    <span className="text-sm">Sistema</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Cor de Destaque</Label>
                <div className="grid grid-cols-6 gap-4">
                  <div className="border rounded-md p-2 flex flex-col items-center gap-2 cursor-pointer bg-secondary/20">
                    <div className="w-full h-10 rounded bg-primary"></div>
                    <span className="text-xs">Roxo</span>
                  </div>
                  <div className="border rounded-md p-2 flex flex-col items-center gap-2 cursor-pointer">
                    <div className="w-full h-10 rounded bg-blue-500"></div>
                    <span className="text-xs">Azul</span>
                  </div>
                  <div className="border rounded-md p-2 flex flex-col items-center gap-2 cursor-pointer">
                    <div className="w-full h-10 rounded bg-green-500"></div>
                    <span className="text-xs">Verde</span>
                  </div>
                  <div className="border rounded-md p-2 flex flex-col items-center gap-2 cursor-pointer">
                    <div className="w-full h-10 rounded bg-red-500"></div>
                    <span className="text-xs">Vermelho</span>
                  </div>
                  <div className="border rounded-md p-2 flex flex-col items-center gap-2 cursor-pointer">
                    <div className="w-full h-10 rounded bg-orange-500"></div>
                    <span className="text-xs">Laranja</span>
                  </div>
                  <div className="border rounded-md p-2 flex flex-col items-center gap-2 cursor-pointer">
                    <div className="w-full h-10 rounded bg-pink-500"></div>
                    <span className="text-xs">Rosa</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Animações</h4>
                    <p className="text-sm text-muted-foreground">Ativar animações na interface</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Modo Compacto</h4>
                    <p className="text-sm text-muted-foreground">Reduzir espaçamento e tamanho dos elementos</p>
                  </div>
                  <Switch />
                </div>
              </div>

              <div className="flex justify-end">
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notificações</CardTitle>
              <CardDescription>Configure como e quando você deseja receber notificações</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notificações por Email</h3>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Novos comentários</h4>
                      <p className="text-sm text-muted-foreground">Quando alguém comentar em uma edição</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Novas entregas</h4>
                      <p className="text-sm text-muted-foreground">Quando uma nova entrega for enviada</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Prazos próximos</h4>
                      <p className="text-sm text-muted-foreground">Lembretes de prazos se aproximando</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Atualizações do sistema</h4>
                      <p className="text-sm text-muted-foreground">Novidades e atualizações do GoNetwork AI</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notificações no Sistema</h3>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Notificações em tempo real</h4>
                      <p className="text-sm text-muted-foreground">
                        Receber notificações enquanto estiver usando o sistema
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Sons de notificação</h4>
                      <p className="text-sm text-muted-foreground">Reproduzir sons ao receber notificações</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Sistema</CardTitle>
              <CardDescription>Gerencie configurações gerais do sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language">Idioma</Label>
                <Select defaultValue="pt-BR">
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Selecione um idioma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Fuso Horário</Label>
                <Select defaultValue="america-sao_paulo">
                  <SelectTrigger id="timezone">
                    <SelectValue placeholder="Selecione um fuso horário" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="america-sao_paulo">América/São Paulo (GMT-3)</SelectItem>
                    <SelectItem value="america-new_york">América/New York (GMT-4)</SelectItem>
                    <SelectItem value="europe-london">Europa/Londres (GMT+1)</SelectItem>
                    <SelectItem value="asia-tokyo">Ásia/Tóquio (GMT+9)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Iniciar automaticamente</h4>
                    <p className="text-sm text-muted-foreground">Iniciar o GoNetwork AI ao ligar o computador</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Verificar atualizações</h4>
                    <p className="text-sm text-muted-foreground">Verificar automaticamente por novas versões</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Enviar relatórios de erro</h4>
                    <p className="text-sm text-muted-foreground">
                      Ajude a melhorar o GoNetwork AI enviando relatórios anônimos
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium">Sobre o GoNetwork AI</h4>
                <div className="text-sm text-muted-foreground">
                  <p>Versão: 1.0.0</p>
                  <p>Build: 2025.05.20</p>
                  <p className="mt-2">© 2025 GoNetwork. Todos os direitos reservados.</p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
