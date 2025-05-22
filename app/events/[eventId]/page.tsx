"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useProjectsStore } from "@/store/useProjectsStoreExtended"; // Usando o store estendido
import Timeline from "@/components/widgets/Timeline";
import { ProjectWorkflowPanel } from "@/components/project/ProjectWorkflowPanel";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const { projects, currentProject, setCurrentProject } = useProjectsStore();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("timeline");
  const [selectedDeliverableId, setSelectedDeliverableId] = useState<string | null>(null);
  const [selectedVersionsForComparison, setSelectedVersionsForComparison] = useState<string[]>([]);
  
  // Carregar o projeto atual
  useEffect(() => {
    const project = projects.find(p => p.id === eventId);
    if (project) {
      setCurrentProject(project);
      // Inicializar o primeiro deliverable como selecionado, se existir
      if (project.videos && project.videos.length > 0) {
        setSelectedDeliverableId(project.videos[0].id);
      }
    }
  }, [eventId, projects, setCurrentProject]);

  // Função para fazer upload de uma nova versão
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedDeliverableId) {
      toast({
        title: "Erro",
        description: "Selecione um arquivo e um vídeo para fazer upload",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Aqui você chamaria a função addVideoVersion do store
      // Em um ambiente real, isso faria upload para um servidor
      await useProjectsStore.getState().addVideoVersion(file, selectedDeliverableId);
      
      toast({
        title: "Sucesso",
        description: "Nova versão adicionada com sucesso",
      });
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast({
        title: "Erro",
        description: "Não foi possível fazer o upload da versão",
        variant: "destructive",
      });
    }
  };

  // Função para alternar a seleção de versões para comparação
  const toggleVersionForComparison = (versionId: string) => {
    // Permitir no máximo 2 versões selecionadas
    if (selectedVersionsForComparison.includes(versionId)) {
      setSelectedVersionsForComparison(prev => 
        prev.filter(id => id !== versionId)
      );
    } else {
      if (selectedVersionsForComparison.length < 2) {
        setSelectedVersionsForComparison(prev => [...prev, versionId]);
      } else {
        // Se já tiver 2 selecionados, substitui o primeiro
        setSelectedVersionsForComparison(prev => [prev[1], versionId]);
        toast({
          title: "Limite de comparação",
          description: "Máximo de 2 versões podem ser comparadas. A primeira seleção foi substituída.",
        });
      }
    }
  };

  // Se não houver projeto carregado
  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl">Carregando projeto...</p>
      </div>
    );
  }
  // Obter o deliverable selecionado
  const selectedDeliverable = selectedDeliverableId 
    ? currentProject.videos.find(v => v.id === selectedDeliverableId) 
    : null;
    
  // Obter comentários do deliverable selecionado
  const deliverableComments = selectedDeliverable?.comments || [];

  // Obter as versões selecionadas para comparação
  const comparisonVersions = selectedDeliverable
    ? selectedDeliverable.versions.filter(v => 
        selectedVersionsForComparison.includes(v.id)
      )
    : [];

  return (
    <div className="container py-8">      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{currentProject.title}</h1>
            {currentProject.description && (
              <p className="text-muted-foreground mt-2">{currentProject.description}</p>
            )}
          </div>
          
          {/* Resumo do status */}
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium">Status atual:</span>
              <span className={cn(
                "px-2 py-1 rounded-full text-xs font-medium",
                currentProject.status === 'draft' && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
                currentProject.status === 'review' && "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
                currentProject.status === 'approved' && "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
                currentProject.status === 'completed' && "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
              )}>
                {currentProject.status === 'draft' ? 'Rascunho' : 
                 currentProject.status === 'review' ? 'Em revisão' :
                 currentProject.status === 'approved' ? 'Aprovado' : 'Concluído'}
              </span>
            </div>
            
            {/* Progresso de tarefas */}
            {currentProject.tasks && currentProject.tasks.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  Progresso: {Math.round((currentProject.tasks.filter(t => t.status === 'completed').length / currentProject.tasks.length) * 100)}%
                </span>
                <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary" 
                    style={{ 
                      width: `${Math.round((currentProject.tasks.filter(t => t.status === 'completed').length / currentProject.tasks.length) * 100)}%` 
                    }} 
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="versions">Versões de Vídeo</TabsTrigger>
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
          <TabsTrigger value="details">Detalhes</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Timeline do Projeto</CardTitle>
            </CardHeader>
            <CardContent>
              {currentProject.timeline && currentProject.timeline.length > 0 ? (
                <Timeline 
                  phases={currentProject.timeline} 
                  finalDueDate={currentProject.finalDueDate} 
                />
              ) : (
                <p>Este projeto ainda não possui uma timeline definida.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="versions">
          <Card>
            <CardHeader>
              <CardTitle>Versões de Vídeo</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Seleção de Deliverable */}
              <div className="mb-6">
                <label htmlFor="deliverable" className="block text-sm font-medium mb-2">
                  Selecionar Vídeo
                </label>
                <Select
                  value={selectedDeliverableId || ""}
                  onValueChange={setSelectedDeliverableId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione um vídeo" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentProject.videos.map((deliverable) => (
                      <SelectItem key={deliverable.id} value={deliverable.id}>
                        {deliverable.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Upload de nova versão */}
              <div className="mb-6">
                <p className="text-sm font-medium mb-2">Adicionar Nova Versão</p>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    id="video-upload"
                    className="hidden"
                    accept="video/*"
                    onChange={handleFileUpload}
                  />
                  <Button
                    onClick={() => document.getElementById("video-upload")?.click()}
                    variant="outline"
                  >
                    Selecionar Arquivo
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Formatos suportados: MP4, MOV, WebM
                  </span>
                </div>
              </div>

              {/* Lista de versões */}
              {selectedDeliverable && selectedDeliverable.versions.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Versões Disponíveis</h3>
                  
                  {/* Versões disponíveis */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedDeliverable.versions.map((version) => (
                      <Card key={version.id} className={
                        `relative ${selectedVersionsForComparison.includes(version.id) 
                          ? 'border-primary border-2' 
                          : 'border'}`
                      }>
                        <div className="aspect-video bg-muted relative">
                          {version.thumbnailUrl ? (
                            <img 
                              src={version.thumbnailUrl} 
                              alt={`Thumbnail para ${version.name}`}
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full bg-muted">
                              <span className="text-3xl">🎬</span>
                            </div>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium">{version.name}</h4>
                            <span className="text-xs text-muted-foreground">
                              {new Date(version.uploadedAt).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => window.open(version.url, '_blank')}
                            >
                              Ver
                            </Button>
                            <Button
                              size="sm"
                              variant={selectedVersionsForComparison.includes(version.id) 
                                ? "default" 
                                : "outline"
                              }
                              onClick={() => toggleVersionForComparison(version.id)}
                            >
                              {selectedVersionsForComparison.includes(version.id)
                                ? "Selecionado"
                                : "Comparar"
                              }
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  {/* Comparativo */}
                  {comparisonVersions.length === 2 && (
                    <div className="mt-8">
                      <h3 className="text-lg font-medium mb-4">Comparativo de Versões</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {comparisonVersions.map((version) => (
                          <div key={version.id}>
                            <h4 className="text-sm font-medium mb-2">{version.name}</h4>
                            <div className="aspect-video bg-black">
                              <video
                                src={version.url}
                                controls
                                className="w-full h-full"
                                title={`Vídeo ${version.name}`}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 p-4 bg-muted rounded-md">
                        <h4 className="font-medium mb-2">Diferenças Principais</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Data de upload: {comparisonVersions[0].uploadedAt !== comparisonVersions[1].uploadedAt ? 'Diferentes' : 'Iguais'}</li>
                          <li>Entre em contato para uma análise detalhada das diferenças entre as versões</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Nenhuma versão disponível. Faça upload de uma versão usando o botão acima.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Nova aba para workflow */}
        <TabsContent value="workflow">
          <ProjectWorkflowPanel 
            projectId={currentProject.id}
            deliverableId={selectedDeliverableId || undefined}
          />
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Detalhes do Projeto</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div>
                  <dt className="font-medium">Status</dt>
                  <dd className="text-muted-foreground">
                    {currentProject.status.charAt(0).toUpperCase() + currentProject.status.slice(1)}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium">Data de Criação</dt>
                  <dd className="text-muted-foreground">
                    {new Date(currentProject.createdAt).toLocaleDateString('pt-BR')}
                  </dd>
                </div>
                {currentProject.eventDate && (
                  <div>
                    <dt className="font-medium">Data do Evento</dt>
                    <dd className="text-muted-foreground">
                      {new Date(currentProject.eventDate).toLocaleDateString('pt-BR')}
                    </dd>
                  </div>
                )}
                {currentProject.finalDueDate && (
                  <div>
                    <dt className="font-medium">Prazo Final</dt>
                    <dd className="text-muted-foreground">
                      {new Date(currentProject.finalDueDate).toLocaleDateString('pt-BR')}
                    </dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}