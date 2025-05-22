"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "@/hooks/use-toast";

// Tipos para os membros da equipe
type TeamMember = {
  id: string;
  name: string;
  role: string;
};

// Definição do esquema de validação com Zod
const generalInfoSchema = z.object({
  eventDate: z.string().min(1, { message: "Data do evento é obrigatória" }),
  startTime: z.string().min(1, { message: "Horário de início é obrigatório" }),
  endTime: z.string().min(1, { message: "Horário de término é obrigatório" }),
  eventLocation: z.string().min(1, { message: "Local do evento é obrigatório" }),
  
  hasCredentialing: z.enum(["sim", "não"], {
    required_error: "Por favor selecione uma opção",
  }),
  accessLocation: z.string().optional(),
  credentialingStart: z.string().optional(),
  credentialingEnd: z.string().optional(),
  credentialingResponsible: z.string().optional(),
  
  eventAccessLocation: z.string().min(1, { message: "Local de acesso ao evento é obrigatório" }),
  
  hasMediaRoom: z.enum(["sim", "não"], {
    required_error: "Por favor selecione uma opção",
  }),
  mediaRoomLocation: z.string().optional(),
  
  hasInternet: z.enum(["sim", "não"], {
    required_error: "Por favor selecione uma opção",
  }),
  internetLogin: z.string().optional(),
  internetPassword: z.string().optional(),
  
  generalInfo: z.string().min(1, { message: "Informações gerais são obrigatórias" }),
})
// Validação condicional para os campos dependentes
.refine(
  (data) => {
    if (data.hasCredentialing === "sim") {
      return !!data.accessLocation;
    }
    return true;
  },
  {
    message: "Local de acesso é obrigatório quando há credenciamento",
    path: ["accessLocation"],
  }
)
.refine(
  (data) => {
    if (data.hasCredentialing === "sim") {
      return !!data.credentialingStart;
    }
    return true;
  },
  {
    message: "Início do credenciamento é obrigatório quando há credenciamento",
    path: ["credentialingStart"],
  }
)
.refine(
  (data) => {
    if (data.hasCredentialing === "sim") {
      return !!data.credentialingEnd;
    }
    return true;
  },
  {
    message: "Fim do credenciamento é obrigatório quando há credenciamento",
    path: ["credentialingEnd"],
  }
)
.refine(
  (data) => {
    if (data.hasCredentialing === "sim") {
      return !!data.credentialingResponsible;
    }
    return true;
  },
  {
    message: "Responsável pelo credenciamento é obrigatório quando há credenciamento",
    path: ["credentialingResponsible"],
  }
)
.refine(
  (data) => {
    if (data.hasMediaRoom === "sim") {
      return !!data.mediaRoomLocation;
    }
    return true;
  },
  {
    message: "Local da sala de mídia é obrigatório quando há sala de mídia",
    path: ["mediaRoomLocation"],
  }
)
.refine(
  (data) => {
    if (data.hasInternet === "sim") {
      return !!data.internetLogin;
    }
    return true;
  },
  {
    message: "Login da internet é obrigatório quando há acesso à internet",
    path: ["internetLogin"],
  }
)
.refine(
  (data) => {
    if (data.hasInternet === "sim") {
      return !!data.internetPassword;
    }
    return true;
  },
  {
    message: "Senha da internet é obrigatória quando há acesso à internet",
    path: ["internetPassword"],
  }
);

type GeneralInfoFormValues = z.infer<typeof generalInfoSchema>;

interface GeneralInfoTabProps {
  eventId: string;
}

export default function GeneralInfoTab({ eventId }: GeneralInfoTabProps) {
  // O eventId agora vem como propriedade do componente
  
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore();
  
  // Estado para controlar a permissão de edição
  const [canEdit, setCanEdit] = useState(false);
    // Valores padrão para o formulário - garantindo que todos os campos têm valores iniciais
  const defaultValues: Partial<GeneralInfoFormValues> = {
    eventDate: "",
    startTime: "",
    endTime: "",
    eventLocation: "",
    hasCredentialing: "não",
    accessLocation: "",
    credentialingStart: "",
    credentialingEnd: "",
    credentialingResponsible: "",
    eventAccessLocation: "",
    hasMediaRoom: "não",
    mediaRoomLocation: "",
    hasInternet: "não",
    internetLogin: "",
    internetPassword: "",
    generalInfo: "",
  };
  
  // Inicialização do formulário com react-hook-form
  const form = useForm<GeneralInfoFormValues>({
    resolver: zodResolver(generalInfoSchema),
    defaultValues,
    mode: "onChange",
  });
  
  // Observar valores para exibir campos condicionais
  const hasCredentialing = form.watch("hasCredentialing");
  const hasMediaRoom = form.watch("hasMediaRoom");
  const hasInternet = form.watch("hasInternet");
  
  // Buscar dados do evento e membros da equipe
  useEffect(() => {
    if (!eventId) return;
    
    const fetchEventData = async () => {
      try {
        // Buscar dados do evento
        const eventResponse = await fetch(`/api/events/${eventId}`);
        if (eventResponse.ok) {
          const eventData = await eventResponse.json();
            // Preencher o formulário com os dados do evento, garantindo valores seguros
          form.setValue("eventDate", eventData.date || "");
          // Preencher outros campos do evento se disponíveis
          if (eventData.startTime) form.setValue("startTime", eventData.startTime);
          if (eventData.endTime) form.setValue("endTime", eventData.endTime);
          if (eventData.location) form.setValue("eventLocation", eventData.location);
        }
        
        // Buscar membros da equipe
        const teamResponse = await fetch(`/api/events/${eventId}/team`);
        if (teamResponse.ok) {
          const teamData = await teamResponse.json();
          setTeamMembers(teamData);
        }
        
        // Verificar permissões do usuário
        const userRole = user?.role;
        setCanEdit(userRole === "admin" || userRole === "coordenador");
        
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do evento",
          variant: "destructive",
        });
      }
    };
      // Buscar dados do briefing existente, se houver
    const fetchBriefingData = async () => {
      try {
        // Importar o serviço de briefing
        const { getBriefing } = await import('@/services/briefing-service');
        
        try {
          // Usar o serviço para buscar os dados
          const briefingData = await getBriefing(eventId as string);
            // Preencher o formulário com os dados existentes, garantindo valores seguros
          Object.keys(briefingData).forEach((key) => {
            // @ts-ignore - keys dinâmicas
            const value = briefingData[key] === undefined ? "" : briefingData[key];
            // @ts-ignore - keys dinâmicas
            form.setValue(key, value);
          });
        } catch (err) {
          // Se o briefing ainda não existe, isso é normal para novos eventos
          console.log("Briefing ainda não existe para este evento");
        }
      } catch (error) {
        console.error("Erro ao buscar briefing:", error);
      }
    };
    
    fetchEventData();
    fetchBriefingData();
  }, [eventId, form, user]);
    // Função para enviar o formulário
  const onSubmit = async (data: GeneralInfoFormValues) => {
    if (!canEdit) {
      toast({
        title: "Permissão negada",
        description: "Você não tem permissão para editar estas informações",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Importar o serviço de briefing
      const { saveBriefing } = await import('@/services/briefing-service');
      
      // Usar o serviço para salvar os dados
      await saveBriefing({
        eventId: eventId as string,
        ...data,
      });
      
      toast({
        title: "Sucesso",
        description: "Informações gerais salvas com sucesso",
      });
    } catch (error) {
      console.error("Erro ao enviar formulário:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as informações",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-[#282A36] text-[#F8F8F2] p-6 rounded-xl">
      <h2 className="text-2xl font-bold text-[#BD93F9] mb-6">Informações Gerais</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Data do Evento */}
            <FormField
              control={form.control}
              name="eventDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#BD93F9]">Data do Evento</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      placeholder="Selecione a data"
                      className="bg-[#21222C] text-[#F8F8F2] border border-[#44475A] p-2 rounded-md"
                      disabled={!canEdit}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-[#FF5555]" />
                </FormItem>
              )}
            />
            
            {/* Horário de Início */}
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#BD93F9]">Horário de Início</FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      placeholder="Selecione o horário"
                      className="bg-[#21222C] text-[#F8F8F2] border border-[#44475A] p-2 rounded-md"
                      disabled={!canEdit}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-[#FF5555]" />
                </FormItem>
              )}
            />
            
            {/* Horário de Término */}
            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#BD93F9]">Horário de Término</FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      placeholder="Selecione o horário"
                      className="bg-[#21222C] text-[#F8F8F2] border border-[#44475A] p-2 rounded-md"
                      disabled={!canEdit}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-[#FF5555]" />
                </FormItem>
              )}
            />
            
            {/* Local do Evento */}
            <FormField
              control={form.control}
              name="eventLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#BD93F9]">Local do Evento</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Endereço completo do evento"
                      className="bg-[#21222C] text-[#F8F8F2] border border-[#44475A] p-2 rounded-md"
                      disabled={!canEdit}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-[#FF5555]" />
                </FormItem>
              )}
            />
            
            {/* Credenciamento? */}
            <FormField
              control={form.control}
              name="hasCredentialing"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#BD93F9]">Credenciamento?</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!canEdit}
                  >
                    <FormControl>
                      <select 
                        className="w-full bg-[#21222C] text-[#F8F8F2] border border-[#44475A] p-2 rounded-md"
                        disabled={!canEdit}
                        {...field}
                      >
                        <option value="sim">Sim</option>
                        <option value="não">Não</option>
                      </select>
                    </FormControl>
                  </Select>
                  <FormMessage className="text-[#FF5555]" />
                </FormItem>
              )}
            />
            
            {/* Local de Acesso ao Evento */}
            <FormField
              control={form.control}
              name="eventAccessLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#BD93F9]">Local de Acesso ao Evento</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Descreva o local de acesso"
                      className="bg-[#21222C] text-[#F8F8F2] border border-[#44475A] p-2 rounded-md"
                      disabled={!canEdit}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-[#FF5555]" />
                </FormItem>
              )}
            />
          </div>
          
          {/* Campos condicionais de Credenciamento */}
          {hasCredentialing === "sim" && (
            <div className="bg-[#21222C] p-4 rounded-md border-l-4 border-purple-400 space-y-4">
              <h3 className="text-xl text-[#8BE9FD]">Informações de Credenciamento</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Local de Acesso */}
                <FormField
                  control={form.control}
                  name="accessLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#BD93F9]">Local de Acesso</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Local específico do credenciamento"
                          className="bg-[#282A36] text-[#F8F8F2] border border-[#44475A] p-2 rounded-md"
                          disabled={!canEdit}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-[#FF5555]" />
                    </FormItem>
                  )}
                />
                
                {/* Responsável pelo Credenciamento */}
                <FormField
                  control={form.control}
                  name="credentialingResponsible"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#BD93F9]">Responsável pelo Credenciamento</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={!canEdit}
                      >
                        <FormControl>
                          <select 
                            className="w-full bg-[#282A36] text-[#F8F8F2] border border-[#44475A] p-2 rounded-md"
                            disabled={!canEdit}
                            {...field}
                          >
                            <option value="">Selecione um responsável</option>
                            {teamMembers.map((member) => (
                              <option key={member.id} value={member.id}>
                                {member.name} ({member.role})
                              </option>
                            ))}
                          </select>
                        </FormControl>
                      </Select>
                      <FormMessage className="text-[#FF5555]" />
                    </FormItem>
                  )}
                />
                
                {/* Início Credenciamento */}
                <FormField
                  control={form.control}
                  name="credentialingStart"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#BD93F9]">Início do Credenciamento</FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          placeholder="Horário de início"
                          className="bg-[#282A36] text-[#F8F8F2] border border-[#44475A] p-2 rounded-md"
                          disabled={!canEdit}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-[#FF5555]" />
                    </FormItem>
                  )}
                />
                
                {/* Fim Credenciamento */}
                <FormField
                  control={form.control}
                  name="credentialingEnd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#BD93F9]">Fim do Credenciamento</FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          placeholder="Horário de término"
                          className="bg-[#282A36] text-[#F8F8F2] border border-[#44475A] p-2 rounded-md"
                          disabled={!canEdit}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-[#FF5555]" />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sala de Mídia? */}
            <FormField
              control={form.control}
              name="hasMediaRoom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#BD93F9]">Sala de Mídia?</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!canEdit}
                  >
                    <FormControl>
                      <select 
                        className="w-full bg-[#21222C] text-[#F8F8F2] border border-[#44475A] p-2 rounded-md"
                        disabled={!canEdit}
                        {...field}
                      >
                        <option value="sim">Sim</option>
                        <option value="não">Não</option>
                      </select>
                    </FormControl>
                  </Select>
                  <FormMessage className="text-[#FF5555]" />
                </FormItem>
              )}
            />
            
            {/* Acesso à Internet? */}
            <FormField
              control={form.control}
              name="hasInternet"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#BD93F9]">Acesso à Internet?</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!canEdit}
                  >
                    <FormControl>
                      <select 
                        className="w-full bg-[#21222C] text-[#F8F8F2] border border-[#44475A] p-2 rounded-md"
                        disabled={!canEdit}
                        {...field}
                      >
                        <option value="sim">Sim</option>
                        <option value="não">Não</option>
                      </select>
                    </FormControl>
                  </Select>
                  <FormMessage className="text-[#FF5555]" />
                </FormItem>
              )}
            />
          </div>
          
          {/* Local da Sala de Mídia (condicional) */}
          {hasMediaRoom === "sim" && (
            <FormField
              control={form.control}
              name="mediaRoomLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#BD93F9]">Local da Sala de Mídia</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Descreva o local da sala de mídia"
                      className="bg-[#21222C] text-[#F8F8F2] border border-[#44475A] p-2 rounded-md"
                      disabled={!canEdit}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-[#FF5555]" />
                </FormItem>
              )}
            />
          )}
          
          {/* Campos condicionais de Internet */}
          {hasInternet === "sim" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Login da Internet */}
              <FormField
                control={form.control}
                name="internetLogin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#BD93F9]">Login da Internet</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Login/usuário para acesso"
                        className="bg-[#21222C] text-[#F8F8F2] border border-[#44475A] p-2 rounded-md"
                        disabled={!canEdit}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[#FF5555]" />
                  </FormItem>
                )}
              />
              
              {/* Senha da Internet */}
              <FormField
                control={form.control}
                name="internetPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#BD93F9]">Senha da Internet</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Senha para acesso"
                        className="bg-[#21222C] text-[#F8F8F2] border border-[#44475A] p-2 rounded-md"
                        disabled={!canEdit}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[#FF5555]" />
                  </FormItem>
                )}
              />
            </div>
          )}
          
          {/* Informações Gerais */}
          <FormField
            control={form.control}
            name="generalInfo"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#BD93F9]">Informações Gerais</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Informações adicionais, detalhes importantes sobre o evento..."
                    className="bg-[#21222C] text-[#F8F8F2] border border-[#44475A] p-2 rounded-md min-h-[100px]"
                    disabled={!canEdit}
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-[#FF5555]" />
              </FormItem>
            )}
          />
          
          {canEdit && (
            <Button 
              type="submit" 
              disabled={isLoading || !canEdit} 
              className="bg-[#6272A4] hover:bg-[#50587E] text-white"
            >
              {isLoading ? "Salvando..." : "Salvar Informações"}
            </Button>
          )}
        </form>
      </Form>
    </div>
  );
}
