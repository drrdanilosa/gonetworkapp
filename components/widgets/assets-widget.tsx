import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Download, FileText, FolderOpen, ImageIcon, Plus, Search, Upload, Video } from "lucide-react"

export default function AssetsWidget() {
  const folders = [
    {
      id: 1,
      name: "Festival de Música",
      type: "folder",
      items: 24,
      date: "19/05/2025",
    },
    {
      id: 2,
      name: "Lançamento de Produto",
      type: "folder",
      items: 12,
      date: "15/05/2025",
    },
    {
      id: 3,
      name: "Conferência Tech",
      type: "folder",
      items: 8,
      date: "10/05/2025",
    },
  ]

  const files = [
    {
      id: 1,
      name: "Teaser_Festival_v1.mp4",
      type: "video",
      size: "120 MB",
      date: "19/05/2025",
    },
    {
      id: 2,
      name: "Logo_Patrocinador_A.png",
      type: "image",
      size: "2.4 MB",
      date: "18/05/2025",
    },
    {
      id: 3,
      name: "Briefing_Festival.pdf",
      type: "document",
      size: "1.2 MB",
      date: "17/05/2025",
    },
    {
      id: 4,
      name: "Abertura_Stories.mp4",
      type: "video",
      size: "45 MB",
      date: "19/05/2025",
    },
    {
      id: 5,
      name: "Programacao_Festival.xlsx",
      type: "document",
      size: "0.8 MB",
      date: "16/05/2025",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Assets</h1>

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

          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar arquivos..." className="pl-8" />
        </div>

        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="video">Vídeos</SelectItem>
            <SelectItem value="image">Imagens</SelectItem>
            <SelectItem value="document">Documentos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="videos">Vídeos</TabsTrigger>
          <TabsTrigger value="images">Imagens</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium mb-4">Pastas</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {folders.map((folder) => (
                  <Card key={folder.id} className="cursor-pointer hover:bg-secondary/10 transition-colors">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="bg-secondary/20 p-3 rounded-md">
                        <FolderOpen className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{folder.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {folder.items} itens • {folder.date}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Card className="border-dashed cursor-pointer hover:bg-secondary/10 transition-colors">
                  <CardContent className="p-4 flex items-center justify-center gap-2 h-full">
                    <Plus className="h-5 w-5 text-muted-foreground" />
                    <span>Nova Pasta</span>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-medium mb-4">Arquivos Recentes</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {files.map((file) => (
                  <Card key={file.id} className="cursor-pointer hover:bg-secondary/10 transition-colors">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="bg-secondary/20 p-3 rounded-md">
                        {file.type === "video" && <Video className="h-6 w-6 text-warning" />}
                        {file.type === "image" && <ImageIcon className="h-6 w-6 text-success" />}
                        {file.type === "document" && <FileText className="h-6 w-6 text-primary" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{file.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {file.size} • {file.date}
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="videos" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {files
              .filter((file) => file.type === "video")
              .map((file) => (
                <Card key={file.id} className="cursor-pointer hover:bg-secondary/10 transition-colors">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="bg-secondary/20 p-3 rounded-md">
                      <Video className="h-6 w-6 text-warning" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{file.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {file.size} • {file.date}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Download className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="images" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {files
              .filter((file) => file.type === "image")
              .map((file) => (
                <Card key={file.id} className="cursor-pointer hover:bg-secondary/10 transition-colors">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="bg-secondary/20 p-3 rounded-md">
                      <ImageIcon className="h-6 w-6 text-success" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{file.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {file.size} • {file.date}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Download className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {files
              .filter((file) => file.type === "document")
              .map((file) => (
                <Card key={file.id} className="cursor-pointer hover:bg-secondary/10 transition-colors">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="bg-secondary/20 p-3 rounded-md">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{file.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {file.size} • {file.date}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Download className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
