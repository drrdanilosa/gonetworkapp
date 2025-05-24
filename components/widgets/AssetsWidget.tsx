// components/widgets/AssetsWidget.tsx
'use client'

'use client'

import React, { useState, useCallback } from 'react'
import { useProjectsStore } from '@/store/useProjectsStore'
import { useUIStore } from '@/store/useUIStore'
import {
  FolderOpen,
  Upload,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  File,
  Share2,
  Trash2,
  DownloadCloud,
  ExternalLink,
} from 'lucide-react'
import { format } from 'date-fns'
import { pt } from 'date-fns/locale'
import { v4 as uuidv4 } from 'uuid'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'

// Interfaces
interface AssetsWidgetProps {
  projectId: string
  isEditable?: boolean
}

// Componente principal
const AssetsWidget: React.FC<AssetsWidgetProps> = ({
  projectId,
  isEditable = true,
}) => {
  const { projects, addAsset, deleteAsset, updateAsset, getProjectAssets } =
    useProjectsStore()
  const { addNotification } = useUIStore()

  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isSharedDialogOpen, setIsSharedDialogOpen] = useState(false)
  const [selectedAssets, setSelectedAssets] = useState<string[]>([])
  const [assetCategory, setAssetCategory] = useState('all')

  // Encontrar o projeto
  const project = projects.find(p => p.id === projectId)

  // Se não houver projeto, retornar mensagem
  if (!project) {
    return (
      <Card className="w-full">
        <CardContent className="pt-4">Projeto não encontrado</CardContent>
      </Card>
    )
  }

  // Obter os assets do projeto
  const projectAssets = getProjectAssets(projectId)

  // Filtrar por categoria
  const filteredAssets =
    assetCategory === 'all'
      ? projectAssets
      : projectAssets.filter(asset => asset.category === assetCategory)

  // Função para fazer upload de arquivo
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    // Processa cada arquivo
    Array.from(files).forEach(file => {
      // Em um ambiente real, você enviaria o arquivo para o servidor
      // Aqui, simularemos isso com um URL local
      const assetUrl = URL.createObjectURL(file)

      // Determinar categoria com base no tipo de arquivo
      const fileType = file.type.split('/')[0]
      let category

      switch (fileType) {
        case 'image':
          category = 'image'
          break
        case 'video':
          category = 'video'
          break
        case 'audio':
          category = 'audio'
          break
        case 'application':
          category = file.type.includes('pdf') ? 'document' : 'other'
          break
        default:
          category = 'other'
      }

      // Criar novo asset
      const newAsset = {
        id: uuidv4(),
        name: file.name,
        url: assetUrl,
        size: file.size,
        type: file.type,
        category,
        uploadedAt: new Date().toISOString(),
        projectId,
        isShared: false,
        metadata: {
          lastModified: new Date(file.lastModified).toISOString(),
        },
      }

      // Adicionar ao store
      addAsset(newAsset)
      addNotification(`Asset "${file.name}" adicionado com sucesso`)
    })

    setIsUploadDialogOpen(false)
  }

  // Função para excluir um asset
  const handleDeleteAsset = (assetId: string) => {
    deleteAsset(assetId)
    addNotification('Asset removido com sucesso')
  }

  // Função para compartilhar/tornar privado um asset
  const toggleAssetSharing = (assetId: string, isShared: boolean) => {
    const asset = projectAssets.find(a => a.id === assetId)
    if (!asset) return

    updateAsset(assetId, { isShared: !isShared })
    addNotification(
      isShared ? 'Asset agora é privado' : 'Asset está compartilhado'
    )
  }

  // Função para selecionar/deselecionar um asset
  const toggleAssetSelection = (assetId: string) => {
    setSelectedAssets(prev =>
      prev.includes(assetId)
        ? prev.filter(id => id !== assetId)
        : [...prev, assetId]
    )
  }

  // Função para selecionar todos os assets filtrados
  const selectAllAssets = () => {
    if (selectedAssets.length === filteredAssets.length) {
      // Se todos já estão selecionados, desseleciona todos
      setSelectedAssets([])
    } else {
      // Caso contrário, seleciona todos
      setSelectedAssets(filteredAssets.map(asset => asset.id))
    }
  }

  // Função para excluir múltiplos assets
  const deleteSelectedAssets = () => {
    if (selectedAssets.length === 0) return

    selectedAssets.forEach(assetId => {
      deleteAsset(assetId)
    })

    addNotification(`${selectedAssets.length} assets removidos com sucesso`)
    setSelectedAssets([])
  }

  // Função para compartilhar múltiplos assets
  const shareSelectedAssets = (shouldShare: boolean) => {
    if (selectedAssets.length === 0) return

    selectedAssets.forEach(assetId => {
      updateAsset(assetId, { isShared: shouldShare })
    })

    addNotification(
      `${selectedAssets.length} assets ${shouldShare ? 'compartilhados' : 'tornados privados'} com sucesso`
    )
  }

  // Icone baseado no tipo de arquivo
  const getFileIcon = (category: string) => {
    switch (category) {
      case 'image':
        return <FileImage className="size-5" />
      case 'video':
        return <FileVideo className="size-5" />
      case 'audio':
        return <FileAudio className="size-5" />
      case 'document':
        return <FileText className="size-5" />
      default:
        return <File className="size-5" />
    }
  }

  // Formatar tamanho de arquivo
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Renderizar o componente
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-lg">
          <span>Assets</span>
          <div className="flex gap-2">
            {selectedAssets.length > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={deleteSelectedAssets}
                  className="text-red-600"
                >
                  <Trash2 className="mr-1 size-4" />
                  Excluir ({selectedAssets.length})
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Share2 className="mr-1 size-4" />
                      Compartilhar
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => shareSelectedAssets(true)}>
                      Tornar Público
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => shareSelectedAssets(false)}
                    >
                      Tornar Privado
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
            {isEditable && (
              <Button
                variant="default"
                size="sm"
                onClick={() => setIsUploadDialogOpen(true)}
              >
                <Upload className="mr-1 size-4" />
                Upload
              </Button>
            )}
          </div>
        </CardTitle>
        <CardDescription>
          Gerencie os arquivos relacionados ao projeto
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Filtros */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex gap-2 overflow-x-auto">
            <Button
              variant={assetCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAssetCategory('all')}
              className="whitespace-nowrap"
            >
              Todos ({projectAssets.length})
            </Button>
            <Button
              variant={assetCategory === 'image' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAssetCategory('image')}
              className="whitespace-nowrap"
            >
              <FileImage className="mr-1 size-3.5" />
              Imagens (
              {projectAssets.filter(a => a.category === 'image').length})
            </Button>
            <Button
              variant={assetCategory === 'video' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAssetCategory('video')}
              className="whitespace-nowrap"
            >
              <FileVideo className="mr-1 size-3.5" />
              Vídeos ({projectAssets.filter(a => a.category === 'video').length}
              )
            </Button>
            <Button
              variant={assetCategory === 'document' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAssetCategory('document')}
              className="whitespace-nowrap"
            >
              <FileText className="mr-1 size-3.5" />
              Documentos (
              {projectAssets.filter(a => a.category === 'document').length})
            </Button>
          </div>

          <div className="flex items-center">
            <Checkbox
              id="select-all"
              checked={
                filteredAssets.length > 0 &&
                selectedAssets.length === filteredAssets.length
              }
              onCheckedChange={selectAllAssets}
              className="mr-2"
            />
            <Label htmlFor="select-all" className="cursor-pointer text-xs">
              Selecionar Todos
            </Label>
          </div>
        </div>

        {/* Lista de assets */}
        <ScrollArea className="h-[300px] rounded-md border p-2">
          {filteredAssets.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
              <FolderOpen className="mb-2 size-10" />
              <p>Nenhum asset encontrado</p>
              {isEditable && (
                <Button
                  variant="link"
                  onClick={() => setIsUploadDialogOpen(true)}
                  className="mt-2"
                >
                  Upload de arquivos
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredAssets.map(asset => (
                <div
                  key={asset.id}
                  className={`flex items-center justify-between rounded-md border p-2 ${
                    selectedAssets.includes(asset.id) ? 'bg-muted' : ''
                  }`}
                >
                  <div className="flex items-center">
                    <Checkbox
                      checked={selectedAssets.includes(asset.id)}
                      onCheckedChange={() => toggleAssetSelection(asset.id)}
                      className="mr-2"
                    />
                    {getFileIcon(asset.category)}
                    <div className="ml-2">
                      <div className="flex items-center">
                        <span className="font-medium">{asset.name}</span>
                        {asset.isShared && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            <Share2 className="mr-1 size-3" />
                            Compartilhado
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatFileSize(asset.size)} •{' '}
                        {asset.uploadedAt
                          ? format(new Date(asset.uploadedAt), 'dd/MM/yyyy', {
                              locale: pt,
                            })
                          : 'Data desconhecida'}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            asChild
                          >
                            <a
                              href={asset.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="size-4" />
                            </a>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Abrir</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            asChild
                          >
                            <a href={asset.url} download={asset.name}>
                              <DownloadCloud className="size-4" />
                            </a>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Download</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    {isEditable && (
                      <>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                onClick={() =>
                                  toggleAssetSharing(asset.id, asset.isShared)
                                }
                              >
                                <Share2
                                  className={`size-4 ${asset.isShared ? 'text-blue-500' : ''}`}
                                />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {asset.isShared
                                ? 'Tornar Privado'
                                : 'Compartilhar'}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 text-red-500"
                                onClick={() => handleDeleteAsset(asset.id)}
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Excluir</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>

      {/* Dialog para upload */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload de Arquivos</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <Label htmlFor="files">Selecione os arquivos</Label>
            <Input
              id="files"
              type="file"
              onChange={handleFileUpload}
              multiple
              accept="image/*,video/*,audio/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            />
            <p className="text-xs text-muted-foreground">
              Formatos aceitos: Imagens, Vídeos, Áudios, PDFs, DOC, DOCX
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsUploadDialogOpen(false)}
            >
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

export default AssetsWidget
