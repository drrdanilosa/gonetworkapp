"use client"

import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

// Definição do esquema de validação com Zod
const formSchema = z.object({
  eventDate: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  eventLocation: z.string(),
  hasCredentialing: z.string(),
  accessLocation: z.string().optional(),
  eventAccessLocation: z.string(),
  hasMediaRoom: z.string(),
  mediaRoomLocation: z.string().optional(),
  hasInternet: z.string(),
  internetLogin: z.string().optional(),
  internetPassword: z.string().optional(),
  generalInfo: z.string(),
  credentialingResponsible: z.string().optional(),
  credentialingStart: z.string().optional(),
  credentialingEnd: z.string().optional(),
})

interface GeneralInfoTabProps {
  eventId?: string
}

const GeneralInfoTab = ({ eventId }: GeneralInfoTabProps) => {
  // Inicializar o formulário com react-hook-form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      eventDate: '',
      startTime: '',
      endTime: '',
      eventLocation: '',
      hasCredentialing: 'não',
      accessLocation: '',
      eventAccessLocation: '',
      hasMediaRoom: 'não',
      mediaRoomLocation: '',
      hasInternet: 'não',
      internetLogin: '',
      internetPassword: '',
      generalInfo: '',
      credentialingResponsible: '',
      credentialingStart: '',
      credentialingEnd: '',
    },
    mode: 'onChange',
  })

  // Extrair métodos e estados do formulário
  const { watch, control, handleSubmit, reset } = form
  
  // Observar campos para lógica condicional
  const hasCredentialing = watch('hasCredentialing')
  const hasMediaRoom = watch('hasMediaRoom')
  const hasInternet = watch('hasInternet')

  // Carregar dados do evento quando o componente montar ou o ID mudar
  useEffect(() => {
    if (!eventId) return

    const fetchEventData = async () => {
      try {
        const eventResponse = await fetch(`/api/events/${eventId}`)
        if (!eventResponse.ok) throw new Error('Erro ao buscar dados do evento')

        const eventData = await eventResponse.json()
        reset(eventData)
      } catch (error) {
        console.error('Erro ao buscar dados do evento:', error)
      }
    }

    fetchEventData()
  }, [eventId, reset])

  // Manipulador de envio do formulário
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      console.log('Dados do formulário:', data)
      // Aqui você implementaria a lógica para salvar os dados
      // Ex: await fetch(`/api/events/${eventId}`, { method: 'PUT', body: JSON.stringify(data) })
      
      // Mostrar feedback de sucesso (através de um toast, por exemplo)
    } catch (error) {
      console.error('Erro ao salvar:', error)
      // Mostrar feedback de erro
    }
  }

  return (
    <div className="bg-[#282A36] text-[#F8F8F2] p-6 rounded-xl">
      <h2 className="text-2xl font-bold text-[#BD93F9] mb-6">
        Informações Gerais
      </h2>

      <Form {...form}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Data do Evento */}
            <FormField
              control={control}
              name="eventDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#BD93F9]">
                    Data do Evento
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      placeholder="Selecione a data"
                      className="bg-[#21222C] text-[#F8F8F2] border border-[#44475A] p-2 rounded-md"
                      {...field}
                      aria-required="true"
                    />
                  </FormControl>
                  <FormMessage className="text-[#FF5555]" />
                </FormItem>
              )}
            />

            {/* Horário de Início */}
            <FormField
              control={control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#BD93F9]">
                    Horário de Início
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      placeholder="Selecione o horário"
                      className="bg-[#21222C] text-[#F8F8F2] border border-[#44475A] p-2 rounded-md"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-[#FF5555]" />
                </FormItem>
              )}
            />

            {/* Horário de Término */}
            <FormField
              control={control}
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#BD93F9]">
                    Horário de Término
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      placeholder="Selecione o horário"
                      className="bg-[#21222C] text-[#F8F8F2] border border-[#44475A] p-2 rounded-md"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-[#FF5555]" />
                </FormItem>
              )}
            />

            {/* Local do Evento */}
            <FormField
              control={control}
              name="eventLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#BD93F9]">
                    Local do Evento
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Endereço completo do evento"
                      className="bg-[#21222C] text-[#F8F8F2] border border-[#44475A] p-2 rounded-md"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-[#FF5555]" />
                </FormItem>
              )}
            />

            {/* Credenciamento? */}
            <FormField
              control={control}
              name="hasCredentialing"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#BD93F9]">
                    Credenciamento?
                  </FormLabel>
                  <FormControl>
                    <select
                      className="w-full bg-[#21222C] text-[#F8F8F2] border border-[#44475A] p-2 rounded-md"
                      {...field}
                    >
                      <option value="sim">Sim</option>
                      <option value="não">Não</option>
                    </select>
                  </FormControl>
                  <FormMessage className="text-[#FF5555]" />
                </FormItem>
              )}
            />

            {/* Local de Acesso ao Evento */}
            <FormField
              control={control}
              name="eventAccessLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#BD93F9]">
                    Local de Acesso ao Evento
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Descreva o local de acesso"
                      className="bg-[#21222C] text-[#F8F8F2] border border-[#44475A] p-2 rounded-md"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-[#FF5555]" />
                </FormItem>
              )}
            />
          </div>

          {/* Campos condicionais de Credenciamento */}
          {hasCredentialing === 'sim' && (
            <div className="bg-[#21222C] p-4 rounded-md border-l-4 border-purple-400 space-y-4">
              <h3 className="text-xl text-[#8BE9FD]">
                Informações de Credenciamento
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Local de Acesso */}
                <FormField
                  control={control}
                  name="accessLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#BD93F9]">
                        Local de Acesso
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Local específico do credenciamento"
                          className="bg-[#282A36] text-[#F8F8F2] border border-[#44475A] p-2 rounded-md"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-[#FF5555]" />
                    </FormItem>
                  )}
                />

                {/* Responsável pelo Credenciamento */}
                <FormField
                  control={control}
                  name="credentialingResponsible"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#BD93F9]">
                        Responsável pelo Credenciamento
                      </FormLabel>
                      <FormControl>
                        <select
                          className="w-full bg-[#282A36] text-[#F8F8F2] border border-[#44475A] p-2 rounded-md"
                          {...field}
                        >
                          <option value="">Selecione um responsável</option>
                          <option value="responsavel1">Responsável 1</option>
                          <option value="responsavel2">Responsável 2</option>
                        </select>
                      </FormControl>
                      <FormMessage className="text-[#FF5555]" />
                    </FormItem>
                  )}
                />

                {/* Início Credenciamento */}
                <FormField
                  control={control}
                  name="credentialingStart"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#BD93F9]">
                        Início do Credenciamento
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          placeholder="Horário de início"
                          className="bg-[#282A36] text-[#F8F8F2] border border-[#44475A] p-2 rounded-md"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-[#FF5555]" />
                    </FormItem>
                  )}
                />

                {/* Fim Credenciamento */}
                <FormField
                  control={control}
                  name="credentialingEnd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#BD93F9]">
                        Fim do Credenciamento
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          placeholder="Horário de término"
                          className="bg-[#282A36] text-[#F8F8F2] border border-[#44475A] p-2 rounded-md"
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
              control={control}
              name="hasMediaRoom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#BD93F9]">
                    Sala de Mídia?
                  </FormLabel>
                  <FormControl>
                    <select
                      className="w-full bg-[#21222C] text-[#F8F8F2] border border-[#44475A] p-2 rounded-md"
                      {...field}
                    >
                      <option value="sim">Sim</option>
                      <option value="não">Não</option>
                    </select>
                  </FormControl>
                  <FormMessage className="text-[#FF5555]" />
                </FormItem>
              )}
            />

            {/* Acesso à Internet? */}
            <FormField
              control={control}
              name="hasInternet"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#BD93F9]">
                    Acesso à Internet?
                  </FormLabel>
                  <FormControl>
                    <select
                      className="w-full bg-[#21222C] text-[#F8F8F2] border border-[#44475A] p-2 rounded-md"
                      {...field}
                    >
                      <option value="sim">Sim</option>
                      <option value="não">Não</option>
                    </select>
                  </FormControl>
                  <FormMessage className="text-[#FF5555]" />
                </FormItem>
              )}
            />
          </div>

          {/* Local da Sala de Mídia (condicional) */}
          {hasMediaRoom === 'sim' && (
            <FormField
              control={control}
              name="mediaRoomLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#BD93F9]">
                    Local da Sala de Mídia
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Descreva o local da sala de mídia"
                      className="bg-[#21222C] text-[#F8F8F2] border border-[#44475A] p-2 rounded-md"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-[#FF5555]" />
                </FormItem>
              )}
            />
          )}

          {/* Campos condicionais de Internet */}
          {hasInternet === 'sim' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Login da Internet */}
              <FormField
                control={control}
                name="internetLogin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#BD93F9]">
                      Login da Internet
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Login/usuário para acesso"
                        className="bg-[#21222C] text-[#F8F8F2] border border-[#44475A] p-2 rounded-md"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[#FF5555]" />
                  </FormItem>
                )}
              />

              {/* Senha da Internet */}
              <FormField
                control={control}
                name="internetPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#BD93F9]">
                      Senha da Internet
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Senha para acesso"
                        className="bg-[#21222C] text-[#F8F8F2] border border-[#44475A] p-2 rounded-md"
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
            control={control}
            name="generalInfo"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#BD93F9]">
                  Informações Gerais
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Informações adicionais, detalhes importantes sobre o evento..."
                    className="bg-[#21222C] text-[#F8F8F2] border border-[#44475A] p-2 rounded-md min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-[#FF5555]" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="bg-[#6272A4] hover:bg-[#50587E] text-white"
          >
            Salvar Informações
          </Button>
        </form>
      </Form>
    </div>
  )
}

export default GeneralInfoTab