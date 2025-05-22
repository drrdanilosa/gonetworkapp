"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { useProjectsStore } from "@/store/useProjectsStore";
import { useAuthStore } from "@/store/useAuthStore";
import { generateScheduleFromBriefing } from "@/lib/scheduleGenerator";
import Timeline from "@/components/widgets/Timeline";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";

// Esquema de validação para o formulário
const projectSchema = z.object({
  title: z.string().min(3, "O título precisa ter pelo menos 3 caracteres"),
  description: z.string().optional(),
  eventDate: z.string().optional(),
  finalDueDate: z.string().optional(),
  numVideos: z.coerce
    .number()
    .min(1, "Precisa ter pelo menos 1 vídeo")
    .max(20, "Máximo de 20 vídeos por projeto"),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

export default function NewProjectPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { createProject } = useProjectsStore();
  const [generatedTimeline, setGeneratedTimeline] = useState<any[]>([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [finalDueDate, setFinalDueDate] = useState<Date | undefined>(undefined);
  
  // Inicializar formulário com react-hook-form
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      description: "",
      numVideos: 1,
    },
  });

  // Gerar cronograma a partir dos dados do formulário
  const handleGenerateTimeline = () => {
    const formData = form.getValues();
    let eventDate: Date | undefined;
    let dueDate: Date | undefined;
    
    if (formData.eventDate) {
      eventDate = new Date(formData.eventDate);
    }
    
    if (formData.finalDueDate) {
      dueDate = new Date(formData.finalDueDate);
      setFinalDueDate(dueDate);
    } else {
      setFinalDueDate(undefined);
    }

    const numVideos = formData.numVideos || 1;
    
    const timeline = generateScheduleFromBriefing(
      formData.title,
      numVideos,
      eventDate,
      dueDate
    );
    
    setGeneratedTimeline(timeline);
    setPreviewVisible(true);
    
    toast({
      title: "Cronograma gerado",
      description: "Revise o cronograma e confirme para criar o projeto",
    });
  };

  // Função para lidar com a criação do projeto
  const onSubmit = async (data: ProjectFormValues) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para criar um projeto",
        variant: "destructive",
      });
      return;
    }
    
    // Converter datas
    let eventDate: Date | undefined;
    let finalDueDate: Date | undefined;
    
    if (data.eventDate) {
      eventDate = new Date(data.eventDate);
    }
    
    if (data.finalDueDate) {
      finalDueDate = new Date(data.finalDueDate);
    }
    
    // Verificar se temos um cronograma gerado, caso não, gerar agora
    let timeline = generatedTimeline;
    if (!timeline.length) {
      timeline = generateScheduleFromBriefing(
        data.title,
        data.numVideos || 1,
        eventDate,
        finalDueDate
      );
    }
    
    // Inicializar estrutura de entregáveis de vídeo
    const videoDeliverables = Array.from({ length: data.numVideos || 1 }, (_, i) => ({
      id: `vid-${Date.now()}-${i}`,
      title: `Vídeo ${i + 1}`,
      versions: [],
    }));
    
    // Criar o projeto com os dados e cronograma
    try {
      createProject({
        title: data.title,
        name: data.title, // para compatibilidade com o novo sistema
        description: data.description || "",
        clientId: user.id,
        editorId: user.id, // Temporariamente mesmo usuário
        eventDate,
        finalDueDate,
        timeline,
        videos: videoDeliverables,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "draft",
      });
      
      toast({
        title: "Projeto criado com sucesso",
        description: "Você será redirecionado para a página do projeto",
      });
      
      // Redirecionar para a página de eventos
      router.push("/events");
    } catch (error) {
      console.error("Erro ao criar projeto:", error);
      toast({
        title: "Erro ao criar projeto",
        description: "Por favor, tente novamente",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container py-10">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Criar Novo Projeto</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título do Projeto</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do projeto" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva o projeto brevemente..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="eventDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data do Evento (opcional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="finalDueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prazo Final (opcional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="numVideos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Vídeos</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={20}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Botão de gerar cronograma */}
              <Button 
                type="button"
                variant="outline"
                onClick={handleGenerateTimeline}
                className="w-full"
              >
                Gerar Cronograma
              </Button>

              {/* Preview da timeline */}
              {previewVisible && generatedTimeline.length > 0 && (
                <div className="border rounded-lg p-4 bg-muted/20">
                  <h3 className="text-lg font-medium mb-2">Cronograma Gerado</h3>
                  <Timeline 
                    phases={generatedTimeline} 
                    finalDueDate={finalDueDate} 
                  />
                  <div className="mt-4 text-sm text-muted-foreground">
                    <p>
                      Este cronograma foi gerado automaticamente com base nas informações
                      fornecidas. Você poderá ajustá-lo após criar o projeto.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancelar
                </Button>
                <Button type="submit">Criar Projeto</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
