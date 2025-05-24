# Solução Completa: Problema de Carregamento na Aba BRIEFING

## 🔍 Confirmação do Diagnóstico

O diagnóstico está **100% correto**. O problema é uma **incompatibilidade arquitetural** entre:

- **Cliente**: Usa Zustand para gerenciar estado (onde eventos são criados)
- **Servidor**: Tenta acessar Zustand via `getState()` nas API routes (impossível)
- **Resultado**: Aba BRIEFING só vê dados mockados/hardcoded, não os eventos reais

## 🚀 Solução Implementada: Persistência Unificada

### Passo 1: Criar Estrutura de Dados Persistente

```bash
# No diretório raiz do projeto
mkdir -p data
```

### Passo 2: Implementar Sistema de Persistência Base

**Criar: `lib/dataManager.ts`**

```typescript
import fs from 'fs/promises'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const EVENTS_FILE = path.join(DATA_DIR, 'events.json')
const BRIEFINGS_FILE = path.join(DATA_DIR, 'briefings.json')

// Garantir que o diretório existe
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
  } catch (error) {
    console.error('Erro ao criar diretório de dados:', error)
  }
}

// Funções para Eventos
export async function readEventsData() {
  try {
    await ensureDataDir()
    const data = await fs.readFile(EVENTS_FILE, 'utf-8')
    const events = JSON.parse(data)
    return Array.isArray(events) ? events : []
  } catch (error) {
    // Se arquivo não existe, retorna array vazio
    return []
  }
}

export async function saveEventsData(events: any[]) {
  try {
    await ensureDataDir()
    await fs.writeFile(EVENTS_FILE, JSON.stringify(events, null, 2))
    console.log(`📁 Salvos ${events.length} eventos em ${EVENTS_FILE}`)
  } catch (error) {
    console.error('Erro ao salvar dados de eventos:', error)
    throw error
  }
}

export async function findEventById(eventId: string) {
  const events = await readEventsData()
  return events.find(event => event.id === eventId)
}

// Funções para Briefings
export async function readBriefingsData() {
  try {
    await ensureDataDir()
    const data = await fs.readFile(BRIEFINGS_FILE, 'utf-8')
    const briefings = JSON.parse(data)
    return typeof briefings === 'object' ? briefings : {}
  } catch (error) {
    return {}
  }
}

export async function saveBriefingsData(briefings: Record<string, any>) {
  try {
    await ensureDataDir()
    await fs.writeFile(BRIEFINGS_FILE, JSON.stringify(briefings, null, 2))
    console.log(`📁 Briefings salvos em ${BRIEFINGS_FILE}`)
  } catch (error) {
    console.error('Erro ao salvar briefings:', error)
    throw error
  }
}
```

### Passo 3: Reescrever API de Eventos

**Substituir completamente: `app/api/events/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { readEventsData, saveEventsData } from '@/lib/dataManager'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const status = searchParams.get('status')
    const client = searchParams.get('client')
    const sort = searchParams.get('sort') || 'desc'

    console.log('🔍 [GET /api/events] Buscando eventos...')

    let events = await readEventsData()
    console.log(`📊 [GET /api/events] Encontrados ${events.length} eventos`)

    // Aplicar filtros
    if (status) {
      events = events.filter(p => p.status === status)
      console.log(`🔍 Filtro status "${status}": ${events.length} eventos`)
    }

    if (client) {
      events = events.filter(p =>
        p.client?.toLowerCase().includes(client.toLowerCase())
      )
      console.log(`🔍 Filtro cliente "${client}": ${events.length} eventos`)
    }

    // Ordenação
    events.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.date || 0).getTime()
      const dateB = new Date(b.createdAt || b.date || 0).getTime()
      return sort === 'desc' ? dateB - dateA : dateA - dateB
    })

    const responseData = {
      success: true,
      count: events.length,
      events: events.map(p => ({
        id: p.id,
        title: p.title,
        client: p.client,
        status: p.status,
        date: p.date,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        thumbnail: p.thumbnail,
        videoCount: p.videos?.length || 0,
        deadlines: p.deadlines,
        description: p.description,
        tags: p.tags,
        team: p.team,
        briefing: p.briefing,
      })),
    }

    console.log('✅ [GET /api/events] Resposta enviada com sucesso')
    return NextResponse.json(responseData)
  } catch (error) {
    console.error('❌ [GET /api/events] Erro:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno ao processar eventos',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()
    console.log('📝 [POST /api/events] Dados recebidos:', data)

    const { title, client, date, team, briefing, description, tags } = data

    if (!title) {
      return NextResponse.json(
        {
          success: false,
          error: 'O título do evento é obrigatório',
        },
        { status: 400 }
      )
    }

    const newId = data.id || uuidv4()
    const now = new Date().toISOString()

    const newEvent = {
      id: newId,
      title,
      client: client || 'Cliente não especificado',
      date: date || now,
      createdAt: now,
      updatedAt: now,
      status: 'active',
      team: team || [],
      briefing: briefing || null,
      videos: [],
      assets: [],
      tasks: [],
      deadline: data.deadline || null,
      thumbnail: data.thumbnail || '/placeholder-event.jpg',
      description: description || '',
      tags: tags || [],
      deliverySettings: data.deliverySettings || {
        allowRevisions: true,
        maxRevisions: 3,
        autoApprove: false,
        notifyOnUpload: true,
      },
    }

    console.log(
      '🆕 [POST /api/events] Criando evento:',
      newEvent.id,
      '-',
      newEvent.title
    )

    // Ler eventos existentes
    const events = await readEventsData()

    // Verificar se já existe
    const existingIndex = events.findIndex(e => e.id === newId)
    if (existingIndex >= 0) {
      // Atualizar existente
      events[existingIndex] = {
        ...events[existingIndex],
        ...newEvent,
        updatedAt: now,
      }
      console.log('🔄 [POST /api/events] Evento atualizado:', newId)
    } else {
      // Adicionar novo
      events.push(newEvent)
      console.log('✅ [POST /api/events] Novo evento adicionado:', newId)
    }

    // Salvar
    await saveEventsData(events)

    return NextResponse.json(
      {
        success: true,
        message: 'Evento criado com sucesso',
        event: newEvent,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('❌ [POST /api/events] Erro ao criar evento:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno ao criar evento',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
```

### Passo 4: Reescrever API de Evento Individual

**Substituir completamente: `app/api/events/[eventId]/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import {
  findEventById,
  readEventsData,
  saveEventsData,
} from '@/lib/dataManager'

export async function GET(
  req: Request,
  context: { params: { eventId: string } }
) {
  try {
    const eventId = context.params?.eventId
    console.log(`🔍 [GET /api/events/${eventId}] Buscando evento...`)

    if (!eventId) {
      return NextResponse.json(
        { error: 'ID de evento inválido' },
        { status: 400 }
      )
    }

    const event = await findEventById(eventId)

    if (!event) {
      console.log(`❌ [GET /api/events/${eventId}] Evento não encontrado`)
      return NextResponse.json(
        { error: 'Evento não encontrado' },
        { status: 404 }
      )
    }

    console.log(
      `✅ [GET /api/events/${eventId}] Evento encontrado:`,
      event.title
    )
    return NextResponse.json(event, { status: 200 })
  } catch (error) {
    console.error(
      `❌ [GET /api/events/${context.params?.eventId}] Erro:`,
      error
    )
    return NextResponse.json(
      { error: 'Erro ao buscar evento' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: Request,
  context: { params: { eventId: string } }
) {
  try {
    const eventId = context.params?.eventId
    const updateData = await req.json()

    console.log(`🔄 [PUT /api/events/${eventId}] Atualizando evento...`)

    if (!eventId) {
      return NextResponse.json(
        { error: 'ID de evento inválido' },
        { status: 400 }
      )
    }

    const events = await readEventsData()
    const eventIndex = events.findIndex(e => e.id === eventId)

    if (eventIndex === -1) {
      return NextResponse.json(
        { error: 'Evento não encontrado' },
        { status: 404 }
      )
    }

    // Atualizar evento
    events[eventIndex] = {
      ...events[eventIndex],
      ...updateData,
      updatedAt: new Date().toISOString(),
    }

    await saveEventsData(events)

    console.log(`✅ [PUT /api/events/${eventId}] Evento atualizado com sucesso`)
    return NextResponse.json(events[eventIndex], { status: 200 })
  } catch (error) {
    console.error(`❌ [PUT /api/events/${eventId}] Erro:`, error)
    return NextResponse.json(
      { error: 'Erro ao atualizar evento' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  context: { params: { eventId: string } }
) {
  try {
    const eventId = context.params?.eventId
    console.log(`🗑️ [DELETE /api/events/${eventId}] Deletando evento...`)

    if (!eventId) {
      return NextResponse.json(
        { error: 'ID de evento inválido' },
        { status: 400 }
      )
    }

    const events = await readEventsData()
    const eventIndex = events.findIndex(e => e.id === eventId)

    if (eventIndex === -1) {
      return NextResponse.json(
        { error: 'Evento não encontrado' },
        { status: 404 }
      )
    }

    // Remover evento
    events.splice(eventIndex, 1)
    await saveEventsData(events)

    console.log(
      `✅ [DELETE /api/events/${eventId}] Evento deletado com sucesso`
    )
    return NextResponse.json(
      { message: 'Evento deletado com sucesso' },
      { status: 200 }
    )
  } catch (error) {
    console.error(`❌ [DELETE /api/events/${eventId}] Erro:`, error)
    return NextResponse.json(
      { error: 'Erro ao deletar evento' },
      { status: 500 }
    )
  }
}
```

### Passo 5: Reescrever API de Briefings

**Substituir completamente: `app/api/briefings/[eventId]/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import {
  findEventById,
  readBriefingsData,
  saveBriefingsData,
} from '@/lib/dataManager'

export async function GET(
  req: Request,
  context: { params: { eventId: string } }
) {
  try {
    const eventId = context.params?.eventId
    console.log(`🔍 [GET /api/briefings/${eventId}] Buscando briefing...`)

    if (!eventId) {
      return NextResponse.json(
        { error: 'ID de evento inválido' },
        { status: 400 }
      )
    }

    // Verificar se o evento existe
    const event = await findEventById(eventId)
    if (!event) {
      console.log(`❌ [GET /api/briefings/${eventId}] Evento não encontrado`)
      return NextResponse.json(
        { error: 'Evento não encontrado' },
        { status: 404 }
      )
    }

    // Buscar briefing
    const briefings = await readBriefingsData()
    const briefing = briefings[eventId]

    if (!briefing) {
      console.log(
        `⚠️ [GET /api/briefings/${eventId}] Briefing não encontrado, retornando template`
      )
      // Retornar template vazio se não existe
      const templateBriefing = {
        eventId,
        eventTitle: event.title,
        client: event.client,
        createdAt: new Date().toISOString(),
        sections: {
          overview: { title: 'Visão Geral', content: '', completed: false },
          objectives: { title: 'Objetivos', content: '', completed: false },
          target: { title: 'Público-Alvo', content: '', completed: false },
          timeline: { title: 'Cronograma', content: '', completed: false },
          deliverables: { title: 'Entregáveis', content: '', completed: false },
          requirements: {
            title: 'Requisitos Técnicos',
            content: '',
            completed: false,
          },
          notes: {
            title: 'Observações Adicionais',
            content: '',
            completed: false,
          },
        },
      }
      return NextResponse.json(templateBriefing, { status: 200 })
    }

    console.log(`✅ [GET /api/briefings/${eventId}] Briefing encontrado`)
    return NextResponse.json(briefing, { status: 200 })
  } catch (error) {
    console.error(`❌ [GET /api/briefings/${eventId}] Erro:`, error)
    return NextResponse.json(
      { error: 'Erro ao buscar briefing' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: Request,
  context: { params: { eventId: string } }
) {
  try {
    const eventId = context.params?.eventId
    const briefingData = await req.json()

    console.log(`💾 [PUT /api/briefings/${eventId}] Salvando briefing...`)

    if (!eventId) {
      return NextResponse.json(
        { error: 'ID de evento inválido' },
        { status: 400 }
      )
    }

    // Verificar se o evento existe
    const event = await findEventById(eventId)
    if (!event) {
      return NextResponse.json(
        { error: 'Evento não encontrado' },
        { status: 404 }
      )
    }

    // Preparar dados do briefing
    const updatedBriefing = {
      ...briefingData,
      eventId,
      eventTitle: event.title,
      client: event.client,
      updatedAt: new Date().toISOString(),
      createdAt: briefingData.createdAt || new Date().toISOString(),
    }

    // Salvar briefing
    const briefings = await readBriefingsData()
    briefings[eventId] = updatedBriefing
    await saveBriefingsData(briefings)

    console.log(`✅ [PUT /api/briefings/${eventId}] Briefing salvo com sucesso`)
    return NextResponse.json(updatedBriefing, { status: 200 })
  } catch (error) {
    console.error(`❌ [PUT /api/briefings/${eventId}] Erro:`, error)
    return NextResponse.json(
      { error: 'Erro ao salvar briefing' },
      { status: 500 }
    )
  }
}

export async function POST(
  req: Request,
  context: { params: { eventId: string } }
) {
  // Redirecionar POST para PUT para manter consistência
  return PUT(req, context)
}
```

### Passo 6: Criar Hook de Sincronização

**Criar: `hooks/useEventSync.ts`**

```typescript
import { useEffect } from 'react'
import { useProjectsStore } from '@/store/useProjectsStore'

// Hook para sincronizar eventos criados no cliente com o servidor
export function useEventSync() {
  const { projects } = useProjectsStore()

  useEffect(() => {
    // Sincronizar eventos com o servidor quando houver mudanças
    const syncEvents = async () => {
      for (const project of projects) {
        try {
          // Verificar se o evento já existe no servidor
          const response = await fetch(`/api/events/${project.id}`)

          if (response.status === 404) {
            // Evento não existe no servidor, criar
            console.log(`🔄 Sincronizando evento: ${project.title}`)

            await fetch('/api/events', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: project.id,
                title: project.title,
                client: project.client,
                date: project.date,
                createdAt: project.createdAt,
                team: project.team,
                briefing: project.briefing,
                description: project.description,
                tags: project.tags,
                status: project.status,
                videos: project.videos,
                assets: project.assets,
                tasks: project.tasks,
                deadline: project.deadline,
                thumbnail: project.thumbnail,
                deliverySettings: project.deliverySettings,
              }),
            })

            console.log(`✅ Evento sincronizado: ${project.title}`)
          }
        } catch (error) {
          console.error(
            `❌ Erro ao sincronizar evento ${project.title}:`,
            error
          )
        }
      }
    }

    if (projects.length > 0) {
      syncEvents()
    }
  }, [projects])
}
```

### Passo 7: Integrar Hook no Layout Principal

**Modificar: `app/layout.tsx` ou onde apropriado**

```typescript
// Adicionar no componente principal que envolve toda a aplicação
import { useEventSync } from '@/hooks/useEventSync'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Adicionar o hook de sincronização
  useEventSync()

  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
```

## 🧪 Teste e Verificação

### Comandos de Teste

```bash
# 1. Verificar se os dados estão sendo salvos
ls -la data/
cat data/events.json
cat data/briefings.json

# 2. Testar APIs diretamente
curl -X GET http://localhost:3000/api/events
curl -X GET http://localhost:3000/api/events/[ID_DO_EVENTO]
curl -X GET http://localhost:3000/api/briefings/[ID_DO_EVENTO]
```

### Sequência de Teste

1. **Criar um novo evento** na interface
2. **Verificar aba TIMELINE** (deve aparecer imediatamente)
3. **Verificar aba BRIEFING** (deve aparecer agora também)
4. **Verificar arquivo** `data/events.json` (deve conter o evento)
5. **Reiniciar o servidor** e verificar se os dados persistem

## 🎯 Resultado Esperado

✅ **Eventos criados aparecem em ambas as abas**  
✅ **Dados persistem após reiniciar o servidor**  
✅ **Sistema unificado de armazenamento**  
✅ **APIs funcionando corretamente**  
✅ **Logs detalhados para debug**

## 📋 Checklist de Implementação

- [ ] Criar diretório `data/`
- [ ] Implementar `lib/dataManager.ts`
- [ ] Substituir `app/api/events/route.ts`
- [ ] Substituir `app/api/events/[eventId]/route.ts`
- [ ] Substituir `app/api/briefings/[eventId]/route.ts`
- [ ] Criar `hooks/useEventSync.ts`
- [ ] Integrar hook no layout principal
- [ ] Testar criação de eventos
- [ ] Verificar ambas as abas
- [ ] Confirmar persistência dos dados

## 🔧 Troubleshooting

Se ainda houver problemas:

1. **Verificar logs do console** (tanto browser quanto servidor)
2. **Verificar se os arquivos JSON estão sendo criados** em `data/`
3. **Testar APIs diretamente** com curl ou Postman
4. **Verificar se o hook de sincronização está ativo**
5. **Confirmar que não há conflitos de imports** entre stores diferentes
