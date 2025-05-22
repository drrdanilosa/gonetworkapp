import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { RefreshCcw, Download } from "lucide-react"

export default function TimelineWidget() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Timeline</h1>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label>Evento:</Label>
            <Select defaultValue="festival">
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Selecione um evento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="festival">Festival de Música - 18-20 Mai 2025</SelectItem>
                <SelectItem value="lancamento">Lançamento de Produto - 25 Mai 2025</SelectItem>
                <SelectItem value="conferencia">Conferência Tech - 01 Jun 2025</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline" size="sm">
            <RefreshCcw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>

          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Label>Membro:</Label>
          <Select defaultValue="all">
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por membro" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Membros</SelectItem>
              <SelectItem value="joao">João Silva</SelectItem>
              <SelectItem value="maria">Maria Souza</SelectItem>
              <SelectItem value="carlos">Carlos Lima</SelectItem>
              <SelectItem value="ana">Ana Costa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Label>Atividade:</Label>
          <Select defaultValue="all">
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por atividade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Atividades</SelectItem>
              <SelectItem value="captacao">Captação</SelectItem>
              <SelectItem value="edicao">Edição</SelectItem>
              <SelectItem value="entrega">Entrega</SelectItem>
              <SelectItem value="aprovacao">Aprovação</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Label>Status:</Label>
          <Select defaultValue="all">
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="andamento">Em andamento</SelectItem>
              <SelectItem value="concluido">Concluído</SelectItem>
              <SelectItem value="atrasado">Atrasado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-md overflow-hidden">
        <div className="bg-secondary/30 p-2 border-b">
          <div className="grid grid-cols-12 gap-2 text-sm font-medium">
            <div className="col-span-2">Membro</div>
            <div className="col-span-10 flex">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="flex-1 text-center">
                  {10 + i}:00
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-background">
          {/* João (Cinegrafia) */}
          <div className="border-b">
            <div className="grid grid-cols-12 gap-2 p-2">
              <div className="col-span-2 text-sm">João (Cinegrafia)</div>
              <div className="col-span-10 relative h-16">
                {/* Tarefa 1 */}
                <div
                  className="absolute h-12 top-2 left-[12.5%] w-[16.7%] bg-primary rounded-md flex items-center justify-center text-xs text-primary-foreground px-2"
                  style={{ left: "12.5%", width: "16.7%" }}
                >
                  Captação - Palco Principal
                </div>

                {/* Tarefa 2 */}
                <div
                  className="absolute h-12 top-2 bg-primary rounded-md flex items-center justify-center text-xs text-primary-foreground px-2"
                  style={{ left: "33.3%", width: "8.3%" }}
                >
                  Patrocinador A - Stand
                </div>

                {/* Tarefa 3 */}
                <div
                  className="absolute h-12 top-2 bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground px-2"
                  style={{ left: "62.5%", width: "12.5%" }}
                >
                  Captação - Backstage
                </div>
              </div>
            </div>
          </div>

          {/* Maria (Edição) */}
          <div className="border-b">
            <div className="grid grid-cols-12 gap-2 p-2">
              <div className="col-span-2 text-sm">Maria (Edição)</div>
              <div className="col-span-10 relative h-16">
                {/* Tarefa 1 */}
                <div
                  className="absolute h-12 top-2 bg-warning rounded-md flex items-center justify-center text-xs text-warning-foreground px-2"
                  style={{ left: "16.7%", width: "12.5%" }}
                >
                  Edição - Abertura
                </div>

                {/* Tarefa 2 */}
                <div
                  className="absolute h-12 top-2 bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground px-2"
                  style={{ left: "41.7%", width: "4.2%" }}
                >
                  Entrega - Reels
                </div>

                {/* Tarefa 3 */}
                <div
                  className="absolute h-12 top-2 bg-warning rounded-md flex items-center justify-center text-xs text-warning-foreground px-2"
                  style={{ left: "66.7%", width: "16.7%" }}
                >
                  Edição - Teaser Final
                </div>
              </div>
            </div>
          </div>

          {/* Carlos (Drone) */}
          <div className="border-b">
            <div className="grid grid-cols-12 gap-2 p-2">
              <div className="col-span-2 text-sm">Carlos (Drone)</div>
              <div className="col-span-10 relative h-16">
                {/* Tarefa 1 */}
                <div
                  className="absolute h-12 top-2 bg-primary rounded-md flex items-center justify-center text-xs text-primary-foreground px-2"
                  style={{ left: "25%", width: "8.3%" }}
                >
                  Captação Drone - Área Externa
                </div>

                {/* Tarefa 2 */}
                <div
                  className="absolute h-12 top-2 bg-destructive rounded-md flex items-center justify-center text-xs text-destructive-foreground px-2"
                  style={{ left: "50%", width: "4.2%" }}
                >
                  Captação Drone - Vista Geral
                </div>
              </div>
            </div>
          </div>

          {/* Ana (Coordenação) */}
          <div>
            <div className="grid grid-cols-12 gap-2 p-2">
              <div className="col-span-2 text-sm">Ana (Coordenação)</div>
              <div className="col-span-10 relative h-16">
                {/* Tarefa 1 */}
                <div
                  className="absolute h-12 top-2 bg-cyan-500 rounded-md flex items-center justify-center text-xs text-primary-foreground px-2"
                  style={{ left: "20.8%", width: "4.2%" }}
                >
                  Aprovação - Material Inicial
                </div>

                {/* Tarefa 2 */}
                <div
                  className="absolute h-12 top-2 bg-success rounded-md flex items-center justify-center text-xs text-success-foreground px-2"
                  style={{ left: "37.5%", width: "4.2%" }}
                >
                  Entrega - Stories
                </div>

                {/* Tarefa 3 */}
                <div
                  className="absolute h-12 top-2 bg-cyan-500 rounded-md flex items-center justify-center text-xs text-primary-foreground px-2"
                  style={{ left: "75%", width: "8.3%" }}
                >
                  Aprovação - Teaser
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
