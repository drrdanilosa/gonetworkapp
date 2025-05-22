'use client'

'use client'

"use client"

import { useCallback, useEffect, useRef, useState } from 'react'
import { useProjectsStore } from '@/store/useProjectsStore'
import { useUIStore } from '@/store/useUIStore'
import { Asset } from '@/types/project'
import {
  FileText,
  Image as ImageIcon,
  Music,
  Film,
  Upload,
  Trash2,
  ExternalLink,
  Share2,
  Tag,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

export default function AssetsPanel() {
  const inputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)
  const projectId = useProjectsStore(s => s.currentProject?.id)
  const assets = useProjectsStore(s =>
    // filtra assets do projeto atual
    s.assets.filter(
      a =>
        a.projectId === projectId ||
        (a.isShared && a.relatedProjects?.includes(projectId as string))
    )
  )
  const addAsset = useProjectsStore(s => s.addAsset)
  const deleteAsset = useProjectsStore(s => s.deleteAsset)
  const updateAsset = useProjectsStore(s => s.updateAsset)
  const addSharedAsset = useProjectsStore(s => s.addSharedAsset)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [assetToShare, setAssetToShare] = useState<Asset | null>(null)
  const [assetTags, setAssetTags] = useState('')
  const [newTag, setNewTag] = useState('')

  const allProjects = useProjectsStore(s => s.projects)

  // Filtra os assets com base na pesquisa e no tipo selecionado
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
    const matchesType = selectedType === 'all' || asset.type === selectedType
    return matchesSearch && matchesType
  })

  // Manipuladores para drag & drop
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)

      if (
        e.dataTransfer.files &&
        e.dataTransfer.files.length > 0 &&
        projectId
      ) {
        Array.from(e.dataTransfer.files).forEach(file => {
          processFileUpload(file)
        })
      }
    },
    [projectId]
  )

  // Processa o arquivo para upload
  const processFileUpload = async (file: File) => {
    if (!projectId) return

    try {
      setIsUploading(true)

      // Determinar o tipo de asset pelo MIME
      let type: Asset['type'] = 'document'
      if (file.type.startsWith('image/')) type = 'image'
      else if (file.type.startsWith('audio/')) type = 'audio'
      else if (file.type.startsWith('video/')) type = 'video'
      else if (file.type.includes('font')) type = 'font'

      // Em produção, implementar upload para servidor:
      // const formData = new FormData();
      // formData.append('file', file);
      // formData.append('projectId', projectId);
      // formData.append('type', type);
      // const response = await fetch('/api/assets/upload', {
      //   method: 'POST',
      //   body: formData
      // });
      // const { url, id } = await response.json();

      // Criar URL temporária para pré-visualização (apenas em desenvolvimento)
      const url = URL.createObjectURL(file)

      // Gera URL assinada para upload direto para S3 ou similar
      const { uploadUrl, assetId } = await fetch('/api/assets/get-upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          projectId: projectId,
        }),
      }).then(r => r.json())

      // Upload direto para o storage
      await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      })

      // Registra asset no sistema após upload bem-sucedido
      const assetData = await fetch(`/api/assets/${assetId}/confirm`, {
        method: 'POST',
      }).then(r => r.json())

      // Adiciona ao estado local
      addAsset(assetData)

      // Processar metadados como dimensões para imagens (simulação)
      if (type === 'image') {
        const img = new Image()
        img.onload = () => {
          updateAsset(assetData.id, {
            metadata: {
              ...assetData.metadata,
              dimensions: `${img.width}x${img.height}px`,
            },
          })
        }
        img.src = url
      }

      // Mostrar notificação de sucesso
      setTimeout(() => {
        useUIStore
          .getState()
          .addNotification('Asset adicionado com sucesso', 'success')
      }, 200)
    } catch (error) {
      console.error('Erro ao fazer upload:', error)
      useUIStore.getState().addNotification('Erro ao fazer upload', 'error')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSelectFile = () => {
    inputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || !projectId) return

    Array.from(files).forEach(file => {
      processFileUpload(file)
    })

    // Resetar input para permitir selecionar o mesmo arquivo novamente
    e.target.value = ''
  }

  const handleDeleteAsset = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este asset?')) {
      deleteAsset(id)
    }
  }

  const handleOpenAsset = (asset: Asset) => {
    setSelectedAsset(asset)
  }

  const handleOpenShareDialog = (asset: Asset) => {
    setAssetToShare(asset)
    setIsShareDialogOpen(true)
  }

  const handleShareAsset = (targetProjectId: string) => {
    if (assetToShare && targetProjectId) {
      addSharedAsset(targetProjectId, assetToShare)
      useUIStore
        .getState()
        .addNotification('Asset compartilhado com sucesso', 'success')
      setIsShareDialogOpen(false)
    }
  }

  const handleAddTag = (assetId: string) => {
    if (!newTag.trim()) return

    const asset = assets.find(a => a.id === assetId)
    if (!asset) return

    const currentTags = asset.tags || []
    if (!currentTags.includes(newTag)) {
      updateAsset(assetId, {
        tags: [...currentTags, newTag],
      })
      setNewTag('')
    }
  }

  const getAssetIcon = (type: Asset['type']) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="h-6 w-6 text-blue-500" />
      case 'audio':
        return <Music className="h-6 w-6 text-purple-500" />
      case 'video':
        return <Film className="h-6 w-6 text-red-500" />
      case 'font':
        return (
          <span className="h-6 w-6 flex items-center justify-center text-orange-500 font-bold">
            Aa
          </span>
        )
      default:
        return <FileText className="h-6 w-6 text-gray-500" />
    }
  }

  if (!projectId) {
    return (
      <div className="p-4 text-muted-foreground">
        Selecione um projeto para gerenciar assets
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Assets do Projeto</h2>
        <Button
          onClick={handleSelectFile}
          disabled={isUploading}
          className="flex items-center"
        >
          <Upload className="mr-2 h-4 w-4" />
          {isUploading ? 'Enviando...' : 'Adicionar Asset'}
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <Input
          placeholder="Pesquisar assets..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tipo de Asset" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="image">Imagens</SelectItem>
            <SelectItem value="video">Vídeos</SelectItem>
            <SelectItem value="audio">Áudio</SelectItem>
            <SelectItem value="document">Documentos</SelectItem>
            <SelectItem value="font">Fontes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.ttf,.otf,.woff,.woff2"
        className="hidden"
        onChange={handleFileChange}
        multiple
      />

      {/* Área de drag & drop */}
      <div
        ref={dropZoneRef}
        className={cn(
          'border-2 border-dashed rounded-md transition-all duration-200',
          isDragging
            ? 'border-primary bg-primary/10'
            : assets.length === 0
              ? 'border-muted-foreground/30'
              : 'border-transparent'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Lista de assets */}
        {filteredAssets.length === 0 ? (
          <div className="text-center p-8">
            <p className="text-muted-foreground mb-2">
              {searchTerm || selectedType !== 'all'
                ? 'Nenhum asset encontrado com os filtros atuais'
                : 'Nenhum asset disponível neste projeto'}
            </p>
            <p className="text-sm text-muted-foreground">
              {searchTerm || selectedType !== 'all'
                ? 'Tente outros termos de pesquisa ou filtros'
                : 'Arraste e solte arquivos aqui ou clique em "Adicionar Asset"'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
            {filteredAssets.map(asset => (
              <div
                key={asset.id}
                className={cn(
                  'border rounded-md p-3 bg-card shadow-sm transition-all duration-200',
                  asset.isShared && 'border-blue-400/50 bg-blue-50/10'
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    {getAssetIcon(asset.type)}
                    <div className="ml-2 max-w-[180px]">
                      <p
                        className="text-sm font-medium truncate"
                        title={asset.name}
                      >
                        {asset.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(asset.createdAt), 'dd/MM/yy', {
                          locale: ptBR,
                        })}
                        {asset.fileSize &&
                          ` • ${(asset.fileSize / 1024 / 1024).toFixed(1)}MB`}
                      </p>
                    </div>
                  </div>
                  <div className="flex">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleOpenShareDialog(asset)}
                      title="Compartilhar com outros projetos"
                    >
                      <Share2 className="h-4 w-4 text-blue-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleDeleteAsset(asset.id)}
                      title="Deletar asset"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>

                {/* Tags do asset */}
                {asset.tags && asset.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {asset.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Adicionar tag */}
                <div className="flex gap-1 mb-2">
                  <Input
                    placeholder="Nova tag..."
                    value={asset.id === assetTags ? newTag : ''}
                    onChange={e => {
                      setAssetTags(asset.id)
                      setNewTag(e.target.value)
                    }}
                    className="h-7 text-xs"
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        handleAddTag(asset.id)
                      }
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAddTag(asset.id)}
                    className="h-7 w-7 p-0"
                  >
                    <Tag className="h-3 w-3" />
                  </Button>
                </div>

                <div className="mt-2">
                  {asset.type === 'image' ? (
                    <div
                      className="aspect-video bg-muted rounded-md cursor-pointer overflow-hidden flex items-center justify-center"
                      onClick={() => handleOpenAsset(asset)}
                    >
                      <img
                        src={asset.url}
                        alt={asset.name}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ) : asset.type === 'audio' ? (
                    <audio controls src={asset.url} className="w-full" />
                  ) : asset.type === 'video' ? (
                    <video
                      onClick={() => handleOpenAsset(asset)}
                      className="w-full rounded-md cursor-pointer aspect-video object-cover"
                      src={asset.url}
                    />
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full text-sm"
                      onClick={() => window.open(asset.url, '_blank')}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Abrir Documento
                    </Button>
                  )}
                </div>

                {/* Metadados do asset */}
                {asset.metadata && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    {asset.metadata.dimensions && (
                      <p>Dimensões: {asset.metadata.dimensions}</p>
                    )}
                    {asset.metadata.duration !== undefined && (
                      <p>
                        Duração: {Math.floor(asset.metadata.duration / 60)}:
                        {(asset.metadata.duration % 60)
                          .toString()
                          .padStart(2, '0')}
                      </p>
                    )}
                  </div>
                )}

                {/* Indicador de asset compartilhado */}
                {asset.isShared && (
                  <Badge variant="outline" className="mt-2 text-xs">
                    Compartilhado{' '}
                    {asset.relatedProjects && asset.relatedProjects.length > 1
                      ? `em ${asset.relatedProjects.length} projetos`
                      : ''}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal para visualização de assets */}
      <Dialog
        open={!!selectedAsset}
        onOpenChange={open => !open && setSelectedAsset(null)}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedAsset?.name}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {selectedAsset?.type === 'image' ? (
              <img
                src={selectedAsset.url}
                alt={selectedAsset.name}
                className="max-h-[70vh] mx-auto object-contain"
              />
            ) : selectedAsset?.type === 'video' ? (
              <video
                controls
                src={selectedAsset.url}
                className="w-full max-h-[70vh]"
              />
            ) : null}
          </div>
          <div className="mt-2">
            {selectedAsset?.metadata && (
              <div className="text-sm text-muted-foreground">
                {selectedAsset.metadata.dimensions && (
                  <p>Dimensões: {selectedAsset.metadata.dimensions}</p>
                )}
                {selectedAsset.metadata.format && (
                  <p>Formato: {selectedAsset.metadata.format}</p>
                )}
                {selectedAsset.fileSize && (
                  <p>
                    Tamanho: {(selectedAsset.fileSize / 1024 / 1024).toFixed(2)}{' '}
                    MB
                  </p>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para compartilhar assets */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Compartilhar Asset</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Selecione os projetos nos quais deseja compartilhar "
              {assetToShare?.name}"
            </p>
            <Select onValueChange={handleShareAsset}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um projeto" />
              </SelectTrigger>
              <SelectContent>
                {allProjects
                  .filter(p => p.id !== projectId)
                  .map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.title || project.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsShareDialogOpen(false)}
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
