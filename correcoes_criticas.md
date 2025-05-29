SISTEMA DE TIPAGEM CENTRALIZADO

// types/event.ts
export interface Event {
id: string
title: string
client: string
status: 'pendente' | 'em-andamento' | 'concluido' | 'cancelado'
date: string
createdAt: string
updatedAt: string
description?: string
location?: string
[key: string]: unknown
}

export interface CreateEventRequest {
title: string
client: string
status?: Event['status']
date: string
description?: string
location?: string
}

export interface UpdateEventRequest {
title?: string
client?: string
status?: Event['status']
date?: string
description?: string
location?: string
}

export interface EventListResponse {
events: Event[]
total: number
page?: number
limit?: number
}

// types/video.ts
export interface Video {
id: string
eventId: string
fileName: string
filePath: string
status: 'pendente' | 'em-revisao' | 'revisado' | 'aprovado' | 'rejeitado'
createdAt: string
updatedAt: string
fileSize?: number
duration?: number
format?: string
thumbnailPath?: string
[key: string]: unknown
}

export interface VideoStatusUpdate {
status: Video['status']
comment: string
reviewer: string
reviewedAt?: string
}

export interface CreateVideoRequest {
eventId: string
fileName: string
filePath: string
status?: Video['status']
fileSize?: number
duration?: number
format?: string
}

export interface UpdateVideoRequest {
fileName?: string
filePath?: string
status?: Video['status']
fileSize?: number
duration?: number
format?: string
thumbnailPath?: string
}

// types/api.ts
export interface ApiResponse<T = unknown> {
success: boolean
data?: T
message?: string
error?: string
timestamp: string
}

export interface ApiError {
success: false
error: string
message: string
statusCode: number
timestamp: string
}

export interface PaginationParams {
page?: number
limit?: number
offset?: number
}

export interface SearchParams extends PaginationParams {
q?: string
status?: string
client?: string
dateFrom?: string
dateTo?: string
}

// types/component.ts
export interface TimelineItem {
id: string
title: string
description?: string
timestamp: string
status: string
type: 'event' | 'video' | 'review' | 'update'
metadata?: Record<string, unknown>
}

export interface DetailedTimelineViewProps {
items: TimelineItem[]
loading?: boolean
onItemClick?: (item: TimelineItem) => void
onLoadMore?: () => void
hasMore?: boolean
}

export interface EventWidgetProps {
event: Event
videos?: Video[]
onEventUpdate?: (event: Event) => void
onVideoStatusChange?: (videoId: string, status: VideoStatusUpdate) => void
readonly?: boolean
}

// types/database.ts
export interface DatabaseEvent {
id: string
title: string
client: string
status: string
date: Date
created_at: Date
updated_at: Date
description?: string
location?: string
}

export interface DatabaseVideo {
id: string
event_id: string
file_name: string
file_path: string
status: string
created_at: Date
updated_at: Date
file_size?: number
duration?: number
format?: string
thumbnail_path?: string
}

// Utility types para conversão entre Database e API
export type EventFromDatabase = Omit<DatabaseEvent, 'created_at' | 'updated_at'> & {
createdAt: string
updatedAt: string
}

export type VideoFromDatabase = Omit<DatabaseVideo, 'event_id' | 'file_name' | 'file_path' | 'created_at' | 'updated_at' | 'file_size' | 'thumbnail_path'> & {
eventId: string
fileName: string
filePath: string
createdAt: string
updatedAt: string
fileSize?: number
thumbnailPath?: string
}

// types/index.ts - Barrel export
export _ from './event'
export _ from './video'
export _ from './api'
export _ from './component'
export \* from './database'

// Utility functions para type guards
export function isEvent(obj: unknown): obj is Event {
return typeof obj === 'object' &&
obj !== null &&
typeof (obj as any).id === 'string' &&
typeof (obj as any).title === 'string' &&
typeof (obj as any).client === 'string'
}

export function isVideo(obj: unknown): obj is Video {
return typeof obj === 'object' &&
obj !== null &&
typeof (obj as any).id === 'string' &&
typeof (obj as any).fileName === 'string' &&
typeof (obj as any).filePath === 'string'
}

export function isVideoStatusUpdate(obj: unknown): obj is VideoStatusUpdate {
return typeof obj === 'object' &&
obj !== null &&
typeof (obj as any).status === 'string' &&
typeof (obj as any).comment === 'string' &&
typeof (obj as any).reviewer === 'string'
}

2 - COMO APLICAR A TIPAGEM NOS ARQUIVOS PROBLEMATIVOS

// app/api/events/route.ts - CORRIGIDO
import { NextRequest, NextResponse } from 'next/server'
import { Event, CreateEventRequest, EventListResponse, SearchParams } from '@/types'

export async function GET(request: NextRequest) {
try {
const { searchParams } = new URL(request.url)
const params: SearchParams = {
page: Number(searchParams.get('page')) || 1,
limit: Number(searchParams.get('limit')) || 10,
status: searchParams.get('status') || undefined,
client: searchParams.get('client') || undefined,
dateFrom: searchParams.get('dateFrom') || undefined,
dateTo: searchParams.get('dateTo') || undefined,
}

    // Simulação de busca no banco de dados
    const rawEvents = await fetchEventsFromDatabase(params)

    // Transformar dados do banco para o formato da API
    const events: Event[] = rawEvents.map((rawEvent: any) => ({
      id: rawEvent.id,
      title: rawEvent.title,
      client: rawEvent.client,
      status: rawEvent.status,
      date: rawEvent.date.toISOString(),
      createdAt: rawEvent.createdAt.toISOString(),
      updatedAt: rawEvent.updatedAt.toISOString(),
    }))

    const response: EventListResponse = {
      events,
      total: events.length,
      page: params.page,
      limit: params.limit
    }

    return NextResponse.json(response)

} catch (error) {
return NextResponse.json(
{ error: 'Failed to fetch events' },
{ status: 500 }
)
}
}

export async function POST(request: NextRequest) {
try {
const body = await request.json() as CreateEventRequest

    // Validação básica
    if (!body.title || !body.client || !body.date) {
      return NextResponse.json(
        { error: 'Missing required fields: title, client, date' },
        { status: 400 }
      )
    }

    const newEvent: Event = {
      id: generateId(),
      title: body.title,
      client: body.client,
      status: body.status || 'pendente',
      date: body.date,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description: body.description,
      location: body.location,
    }

    // Salvar no banco de dados
    await saveEventToDatabase(newEvent)

    return NextResponse.json(newEvent, { status: 201 })

} catch (error) {
return NextResponse.json(
{ error: 'Failed to create event' },
{ status: 500 }
)
}
}

// Funções auxiliares (implementar conforme seu banco de dados)
async function fetchEventsFromDatabase(params: SearchParams): Promise<any[]> {
// Implementar busca no seu banco de dados
return []
}

async function saveEventToDatabase(event: Event): Promise<void> {
// Implementar salvamento no seu banco de dados
}

function generateId(): string {
return Math.random().toString(36).substr(2, 9)
}

// app/api/events/[eventId]/route.ts - CORRIGIDO
import { NextRequest, NextResponse } from 'next/server'
import { Event, UpdateEventRequest } from '@/types'

export async function GET(
request: NextRequest,
{ params }: { params: { eventId: string } }
) {
try {
const event = await getEventById(params.eventId)

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(event)

} catch (error) {
return NextResponse.json(
{ error: 'Failed to fetch event' },
{ status: 500 }
)
}
}

export async function PATCH(
request: NextRequest,
{ params }: { params: { eventId: string } }
) {
try {
const body = await request.json() as UpdateEventRequest

    const existingEvent = await getEventById(params.eventId)
    if (!existingEvent) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Aplicar atualizações apenas nos campos fornecidos
    const updatedEvent: Event = {
      ...existingEvent,
      ...body, // Agora o spread funciona porque ambos são objetos tipados
      updatedAt: new Date().toISOString()
    }

    await updateEventInDatabase(params.eventId, updatedEvent)

    return NextResponse.json(updatedEvent)

} catch (error) {
return NextResponse.json(
{ error: 'Failed to update event' },
{ status: 500 }
)
}
}

async function getEventById(id: string): Promise<Event | null> {
// Implementar busca no banco de dados
return null
}

async function updateEventInDatabase(id: string, event: Event): Promise<void> {
// Implementar atualização no banco de dados
}

// app/api/events/[eventId]/videos/route.ts - CORRIGIDO
import { NextRequest, NextResponse } from 'next/server'
import { Video, CreateVideoRequest } from '@/types'

export async function GET(
request: NextRequest,
{ params }: { params: { eventId: string } }
) {
try {
const videos = await getVideosByEventId(params.eventId)
return NextResponse.json(videos)
} catch (error) {
return NextResponse.json(
{ error: 'Failed to fetch videos' },
{ status: 500 }
)
}
}

export async function POST(
request: NextRequest,
{ params }: { params: { eventId: string } }
) {
try {
const body = await request.json() as CreateVideoRequest

    const newVideo: Video = {
      id: generateId(),
      eventId: params.eventId,
      fileName: body.fileName,
      filePath: body.filePath,
      status: body.status || 'pendente',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      fileSize: body.fileSize,
      duration: body.duration,
      format: body.format,
    }

    await saveVideoToDatabase(newVideo)

    return NextResponse.json(newVideo, { status: 201 })

} catch (error) {
return NextResponse.json(
{ error: 'Failed to create video' },
{ status: 500 }
)
}
}

async function getVideosByEventId(eventId: string): Promise<Video[]> {
// Implementar busca no banco de dados
return []
}

async function saveVideoToDatabase(video: Video): Promise<void> {
// Implementar salvamento no banco de dados
}

// app/api/events/[eventId]/videos/[videoId]/status/route.ts - CORRIGIDO
import { NextRequest, NextResponse } from 'next/server'
import { VideoStatusUpdate, Video } from '@/types'

export async function PATCH(
request: NextRequest,
{ params }: { params: { eventId: string; videoId: string } }
) {
try {
const body = await request.json() as VideoStatusUpdate

    // Agora temos todas as propriedades tipadas corretamente
    const statusUpdate: VideoStatusUpdate = {
      status: body.status,
      comment: body.comment,
      reviewer: body.reviewer,
      reviewedAt: new Date().toISOString()
    }

    const updatedVideo = await updateVideoStatus(params.videoId, statusUpdate)

    if (!updatedVideo) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(updatedVideo)

} catch (error) {
return NextResponse.json(
{ error: 'Failed to update video status' },
{ status: 500 }
)
}
}

async function updateVideoStatus(
videoId: string,
statusUpdate: VideoStatusUpdate
): Promise<Video | null> {
// Implementar atualização no banco de dados
return null
}

3 - COMO APLICAR AS TIPAGENS NOS COMPONENTES

// components/widgets/DetailedTimelineView.tsx - CORRIGIDO
import React from 'react'
import { DetailedTimelineViewProps, TimelineItem } from '@/types'

const DetailedTimelineView: React.FC<DetailedTimelineViewProps> = ({
items,
loading = false,
onItemClick,
onLoadMore,
hasMore = false
}) => {
const handleItemClick = (item: TimelineItem) => {
if (onItemClick) {
onItemClick(item)
}
}

const handleLoadMore = () => {
if (onLoadMore && hasMore && !loading) {
onLoadMore()
}
}

if (loading && items.length === 0) {
return (

<div className="flex justify-center items-center p-8">
<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
</div>
)
}

return (

<div className="detailed-timeline-view">
<div className="timeline-items">
{items.map((item) => (
<div
key={item.id}
className="timeline-item p-4 border-b cursor-pointer hover:bg-gray-50"
onClick={() => handleItemClick(item)} >
<div className="flex justify-between items-start">
<div className="flex-1">
<h3 className="font-semibold text-lg">{item.title}</h3>
{item.description && (
<p className="text-gray-600 mt-1">{item.description}</p>
)}
<div className="flex items-center gap-2 mt-2">
<span className="text-sm text-gray-500">
{new Date(item.timestamp).toLocaleString()}
</span>
<span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(item.status)}`}>
{item.status}
</span>
<span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
{item.type}
</span>
</div>
</div>
</div>
</div>
))}
</div>

      {hasMore && (
        <div className="text-center p-4">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Carregando...' : 'Carregar mais'}
          </button>
        </div>
      )}
    </div>

)
}

function getStatusColor(status: string): string {
switch (status) {
case 'pendente':
return 'bg-yellow-100 text-yellow-800'
case 'em-andamento':
case 'em-revisao':
return 'bg-blue-100 text-blue-800'
case 'concluido':
case 'aprovado':
return 'bg-green-100 text-green-800'
case 'cancelado':
case 'rejeitado':
return 'bg-red-100 text-red-800'
default:
return 'bg-gray-100 text-gray-800'
}
}

export default DetailedTimelineView

// components/widgets/event-widget.tsx - CORRIGIDO
import React, { useState } from 'react'
import { EventWidgetProps, Event, Video, VideoStatusUpdate } from '@/types'

const EventWidget: React.FC<EventWidgetProps> = ({
event,
videos = [],
onEventUpdate,
onVideoStatusChange,
readonly = false
}) => {
const [isEditing, setIsEditing] = useState(false)
const [editedEvent, setEditedEvent] = useState<Event>(event)

const handleEventSave = async () => {
if (onEventUpdate) {
await onEventUpdate(editedEvent)
setIsEditing(false)
}
}

const handleVideoStatusUpdate = async (videoId: string, statusUpdate: VideoStatusUpdate) => {
if (onVideoStatusChange) {
await onVideoStatusChange(videoId, statusUpdate)
}
}

const handleStatusChange = (videoId: string, newStatus: Video['status']) => {
const statusUpdate: VideoStatusUpdate = {
status: newStatus,
comment: `Status alterado para ${newStatus}`,
reviewer: 'Current User', // Substituir pelo usuário atual
}
handleVideoStatusUpdate(videoId, statusUpdate)
}

return (

<div className="event-widget bg-white rounded-lg shadow-md p-6">
<div className="event-header mb-4">
{isEditing ? (
<div className="space-y-3">
<input
type="text"
value={editedEvent.title}
onChange={(e) => setEditedEvent({ ...editedEvent, title: e.target.value })}
className="w-full p-2 border rounded"
/>
<input
type="text"
value={editedEvent.client}
onChange={(e) => setEditedEvent({ ...editedEvent, client: e.target.value })}
className="w-full p-2 border rounded"
/>
<select
value={editedEvent.status}
onChange={(e) => setEditedEvent({ ...editedEvent, status: e.target.value as Event['status'] })}
className="w-full p-2 border rounded" >
<option value="pendente">Pendente</option>
<option value="em-andamento">Em Andamento</option>
<option value="concluido">Concluído</option>
<option value="cancelado">Cancelado</option>
</select>
<div className="flex gap-2">
<button
                onClick={handleEventSave}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
Salvar
</button>
<button
onClick={() => {
setIsEditing(false)
setEditedEvent(event)
}}
className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700" >
Cancelar
</button>
</div>
</div>
) : (
<div>
<div className="flex justify-between items-start">
<div>
<h2 className="text-2xl font-bold">{event.title}</h2>
<p className="text-gray-600">Cliente: {event.client}</p>
<p className="text-sm text-gray-500">
Data: {new Date(event.date).toLocaleDateString()}
</p>
</div>
<div className="flex items-center gap-2">
<span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(event.status)}`}>
{event.status}
</span>
{!readonly && (
<button
onClick={() => setIsEditing(true)}
className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700" >
Editar
</button>
)}
</div>
</div>
</div>
)}
</div>

      {videos.length > 0 && (
        <div className="videos-section">
          <h3 className="text-lg font-semibold mb-3">Vídeos ({videos.length})</h3>
          <div className="space-y-2">
            {videos.map((video) => (
              <div key={video.id} className="video-item p-3 border rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{video.fileName}</p>
                    <p className="text-sm text-gray-500">
                      Criado em: {new Date(video.createdAt).toLocaleDateString()}
                    </p>
                    {video.fileSize && (
                      <p className="text-sm text-gray-500">
                        Tamanho: {formatFileSize(video.fileSize)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(video.status)}`}>
                      {video.status}
                    </span>
                    {!readonly && (
                      <select
                        value={video.status}
                        onChange={(e) => handleStatusChange(video.id, e.target.value as Video['status'])}
                        className="text-sm border rounded px-2 py-1"
                      >
                        <option value="pendente">Pendente</option>
                        <option value="em-revisao">Em Revisão</option>
                        <option value="revisado">Revisado</option>
                        <option value="aprovado">Aprovado</option>
                        <option value="rejeitado">Rejeitado</option>
                      </select>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>

)
}

function getStatusColor(status: string): string {
switch (status) {
case 'pendente':
return 'bg-yellow-100 text-yellow-800'
case 'em-andamento':
case 'em-revisao':
return 'bg-blue-100 text-blue-800'
case 'concluido':
case 'aprovado':
return 'bg-green-100 text-green-800'
case 'cancelado':
case 'rejeitado':
return 'bg-red-100 text-red-800'
default:
return 'bg-gray-100 text-gray-800'
}
}

function formatFileSize(bytes: number): string {
if (bytes === 0) return '0 Bytes'
const k = 1024
const sizes = ['Bytes', 'KB', 'MB', 'GB']
const i = Math.floor(Math.log(bytes) / Math.log(k))
return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export default EventWidget

// app/events/[eventId]/briefing/page-improved.tsx - CORRIGIDO
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Event, Video } from '@/types'
import EventWidget from '@/components/widgets/event-widget'

interface BriefingPageProps {
params: { eventId: string }
}

const BriefingPage: React.FC<BriefingPageProps> = ({ params }) => {
const [event, setEvent] = useState<Event | null>(null)
const [videos, setVideos] = useState<Video[]>([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState<string | null>(null)

useEffect(() => {
fetchEventData()
}, [params.eventId])

const fetchEventData = async () => {
try {
setLoading(true)

      // Buscar dados do evento
      const eventResponse = await fetch(`/api/events/${params.eventId}`)
      if (!eventResponse.ok) {
        throw new Error('Evento não encontrado')
      }
      const eventData: Event = await eventResponse.json()
      setEvent(eventData)

      // Buscar vídeos do evento
      const videosResponse = await fetch(`/api/events/${params.eventId}/videos`)
      if (videosResponse.ok) {
        const videosData: Video[] = await videosResponse.json()
        setVideos(videosData)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }

}

const handleEventUpdate = async (updatedEvent: Event) => {
try {
const response = await fetch(`/api/events/${params.eventId}`, {
method: 'PATCH',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify(updatedEvent)
})

      if (response.ok) {
        const newEvent: Event = await response.json()
        setEvent(newEvent)
      }
    } catch (err) {
      console.error('Erro ao atualizar evento:', err)
    }

}

if (loading) {
return (

<div className="flex justify-center items-center min-h-screen">
<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
</div>
)
}

if (error || !event) {
return (

<div className="flex justify-center items-center min-h-screen">
<div className="text-center">
<h1 className="text-2xl font-bold text-red-600 mb-2">Erro</h1>
<p className="text-gray-600">{error || 'Evento não encontrado'}</p>
</div>
</div>
)
}

return (

<div className="container mx-auto px-4 py-8">
<div className="mb-6">
<h1 className="text-3xl font-bold mb-2">Briefing do Evento</h1>
<p className="text-gray-600">Detalhes e progresso do evento</p>
</div>

      <EventWidget
        event={event}
        videos={videos}
        onEventUpdate={handleEventUpdate}
      />
    </div>

)
}

export default BriefingPage

## 🎯 **Plano de Implementação**

### **1. Criar a estrutura de tipos**

```bash
mkdir types
touch types/event.ts types/video.ts types/api.ts types/component.ts types/database.ts types/index.ts
```

### **2. Adicionar configuração no tsconfig.json**

```json
{
  "compilerOptions": {
    "paths": {
      "@/types": ["./types"],
      "@/types/*": ["./types/*"]
    }
  }
}
```

### **3. Substituir os arquivos problemáticos**

- Copie o conteúdo dos **tipos centralizados**
- Substitua as **API routes** pelos códigos corrigidos
- Atualize os **componentes** com as tipagens adequadas

### **4. Benefícios imediatos**

✅ **Elimina todos os erros TS2339** (Property does not exist)
✅ **Resolve erros TS2698** (Spread types)
✅ **Remove usos de `unknown` e `any`**
✅ **Melhora IntelliSense e autocomplete**
✅ **Facilita manutenção futura**

### **5. Próximos passos**

1. Implemente as funções de banco de dados (`fetchEventsFromDatabase`, `saveEventToDatabase`, etc.)
2. Adicione validação com bibliotecas como **Zod** ou **Yup**
3. Configure **error boundaries** para tratamento de erros nos componentes
4. Adicione testes unitários usando as interfaces definidas
5. Configure linting rules específicas para TypeScript

6. Validação com Zod (Recomendado)

// lib/validations/event.ts
import { z } from 'zod'

// Schema base para eventos
export const EventSchema = z.object({
id: z.string().min(1, 'ID é obrigatório'),
title: z.string().min(1, 'Título é obrigatório').max(255, 'Título muito longo'),
client: z.string().min(1, 'Cliente é obrigatório').max(255, 'Nome do cliente muito longo'),
status: z.enum(['pendente', 'em-andamento', 'concluido', 'cancelado']),
date: z.string().datetime('Data deve estar no formato ISO'),
createdAt: z.string().datetime(),
updatedAt: z.string().datetime(),
description: z.string().max(1000, 'Descrição muito longa').optional(),
location: z.string().max(255, 'Local muito longo').optional(),
})

// Schema para criação de eventos
export const CreateEventSchema = EventSchema.omit({
id: true,
createdAt: true,
updatedAt: true,
}).extend({
status: z.enum(['pendente', 'em-andamento', 'concluido', 'cancelado']).default('pendente'),
})

// Schema para atualização de eventos
export const UpdateEventSchema = CreateEventSchema.partial()

// Schema para parâmetros de busca
export const EventSearchSchema = z.object({
page: z.coerce.number().min(1).default(1),
limit: z.coerce.number().min(1).max(100).default(10),
status: z.enum(['pendente', 'em-andamento', 'concluido', 'cancelado']).optional(),
client: z.string().optional(),
dateFrom: z.string().datetime().optional(),
dateTo: z.string().datetime().optional(),
q: z.string().optional(), // query de busca geral
})

// lib/validations/video.ts
export const VideoSchema = z.object({
id: z.string().min(1),
eventId: z.string().min(1, 'ID do evento é obrigatório'),
fileName: z.string().min(1, 'Nome do arquivo é obrigatório'),
filePath: z.string().min(1, 'Caminho do arquivo é obrigatório'),
status: z.enum(['pendente', 'em-revisao', 'revisado', 'aprovado', 'rejeitado']),
createdAt: z.string().datetime(),
updatedAt: z.string().datetime(),
fileSize: z.number().positive().optional(),
duration: z.number().positive().optional(),
format: z.string().optional(),
thumbnailPath: z.string().optional(),
})

export const CreateVideoSchema = VideoSchema.omit({
id: true,
createdAt: true,
updatedAt: true,
}).extend({
status: z.enum(['pendente', 'em-revisao', 'revisado', 'aprovado', 'rejeitado']).default('pendente'),
})

export const UpdateVideoSchema = CreateVideoSchema.partial().omit({ eventId: true })

export const VideoStatusUpdateSchema = z.object({
status: z.enum(['pendente', 'em-revisao', 'revisado', 'aprovado', 'rejeitado']),
comment: z.string().min(1, 'Comentário é obrigatório').max(500, 'Comentário muito longo'),
reviewer: z.string().min(1, 'Revisor é obrigatório'),
reviewedAt: z.string().datetime().optional(),
})

// lib/validations/api.ts
export const ApiResponseSchema = z.object({
success: z.boolean(),
data: z.unknown().optional(),
message: z.string().optional(),
error: z.string().optional(),
timestamp: z.string().datetime(),
})

export const ApiErrorSchema = z.object({
success: z.literal(false),
error: z.string(),
message: z.string(),
statusCode: z.number(),
timestamp: z.string().datetime(),
})

// lib/validations/index.ts - Funções utilitárias
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
const result = schema.safeParse(data)

if (!result.success) {
throw new ValidationError('Dados inválidos', result.error.errors)
}

return result.data
}

export function validateOptionalRequest<T>(
schema: z.ZodSchema<T>,
data: unknown
): T | null {
if (!data) return null
return validateRequest(schema, data)
}

export class ValidationError extends Error {
public errors: z.ZodIssue[]

constructor(message: string, errors: z.ZodIssue[]) {
super(message)
this.name = 'ValidationError'
this.errors = errors
}

getFormattedErrors(): Record<string, string> {
return this.errors.reduce((acc, error) => {
const path = error.path.join('.')
acc[path] = error.message
return acc
}, {} as Record<string, string>)
}
}

// Middleware para Next.js API Routes
export function withValidation<T>(
schema: z.ZodSchema<T>,
handler: (validatedData: T, req: any, res: any) => Promise<any>
) {
return async (req: any, res: any) => {
try {
const validatedData = validateRequest(schema, req.body)
return await handler(validatedData, req, res)
} catch (error) {
if (error instanceof ValidationError) {
return res.status(400).json({
success: false,
error: 'Validation failed',
message: error.message,
details: error.getFormattedErrors(),
timestamp: new Date().toISOString()
})
}

      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Erro interno do servidor',
        timestamp: new Date().toISOString()
      })
    }

}
}

7. API Routes com Validação Zod

// app/api/events/route.ts - COM VALIDAÇÃO ZOD
import { NextRequest, NextResponse } from 'next/server'
import { CreateEventSchema, EventSearchSchema, validateRequest } from '@/lib/validations'
import { Event, EventListResponse } from '@/types'
import { getEvents, createEvent } from '@/lib/database/events'

export async function GET(request: NextRequest) {
try {
const { searchParams } = new URL(request.url)

    // Validar parâmetros de busca
    const validatedParams = validateRequest(EventSearchSchema, {
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      status: searchParams.get('status'),
      client: searchParams.get('client'),
      dateFrom: searchParams.get('dateFrom'),
      dateTo: searchParams.get('dateTo'),
      q: searchParams.get('q'),
    })

    const { events, total } = await getEvents(validatedParams)

    const response: EventListResponse = {
      events,
      total,
      page: validatedParams.page,
      limit: validatedParams.limit
    }

    return NextResponse.json({
      success: true,
      data: response,
      timestamp: new Date().toISOString()
    })

} catch (error) {
console.error('GET /api/events error:', error)

    if (error instanceof ValidationError) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros inválidos',
        message: error.message,
        details: error.getFormattedErrors(),
        timestamp: new Date().toISOString()
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Falha ao buscar eventos',
      timestamp: new Date().toISOString()
    }, { status: 500 })

}
}

export async function POST(request: NextRequest) {
try {
const body = await request.json()

    // Validar dados de entrada
    const validatedData = validateRequest(CreateEventSchema, body)

    // Criar evento no banco de dados
    const newEvent = await createEvent(validatedData)

    return NextResponse.json({
      success: true,
      data: newEvent,
      message: 'Evento criado com sucesso',
      timestamp: new Date().toISOString()
    }, { status: 201 })

} catch (error) {
console.error('POST /api/events error:', error)

    if (error instanceof ValidationError) {
      return NextResponse.json({
        success: false,
        error: 'Dados inválidos',
        message: error.message,
        details: error.getFormattedErrors(),
        timestamp: new Date().toISOString()
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Falha ao criar evento',
      timestamp: new Date().toISOString()
    }, { status: 500 })

}
}

// app/api/events/[eventId]/route.ts - COM VALIDAÇÃO ZOD
import { NextRequest, NextResponse } from 'next/server'
import { UpdateEventSchema, validateRequest } from '@/lib/validations'
import { getEventById, updateEvent, deleteEvent } from '@/lib/database/events'

export async function GET(
request: NextRequest,
{ params }: { params: { eventId: string } }
) {
try {
const event = await getEventById(params.eventId)

    if (!event) {
      return NextResponse.json({
        success: false,
        error: 'Evento não encontrado',
        message: `Evento com ID ${params.eventId} não existe`,
        timestamp: new Date().toISOString()
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: event,
      timestamp: new Date().toISOString()
    })

} catch (error) {
console.error(`GET /api/events/${params.eventId} error:`, error)

    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Falha ao buscar evento',
      timestamp: new Date().toISOString()
    }, { status: 500 })

}
}

export async function PATCH(
request: NextRequest,
{ params }: { params: { eventId: string } }
) {
try {
const body = await request.json()

    // Validar dados de atualização
    const validatedData = validateRequest(UpdateEventSchema, body)

    // Verificar se evento existe
    const existingEvent = await getEventById(params.eventId)
    if (!existingEvent) {
      return NextResponse.json({
        success: false,
        error: 'Evento não encontrado',
        message: `Evento com ID ${params.eventId} não existe`,
        timestamp: new Date().toISOString()
      }, { status: 404 })
    }

    // Atualizar evento
    const updatedEvent = await updateEvent(params.eventId, validatedData)

    return NextResponse.json({
      success: true,
      data: updatedEvent,
      message: 'Evento atualizado com sucesso',
      timestamp: new Date().toISOString()
    })

} catch (error) {
console.error(`PATCH /api/events/${params.eventId} error:`, error)

    if (error instanceof ValidationError) {
      return NextResponse.json({
        success: false,
        error: 'Dados inválidos',
        message: error.message,
        details: error.getFormattedErrors(),
        timestamp: new Date().toISOString()
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Falha ao atualizar evento',
      timestamp: new Date().toISOString()
    }, { status: 500 })

}
}

export async function DELETE(
request: NextRequest,
{ params }: { params: { eventId: string } }
) {
try {
const existingEvent = await getEventById(params.eventId)
if (!existingEvent) {
return NextResponse.json({
success: false,
error: 'Evento não encontrado',
message: `Evento com ID ${params.eventId} não existe`,
timestamp: new Date().toISOString()
}, { status: 404 })
}

    await deleteEvent(params.eventId)

    return NextResponse.json({
      success: true,
      message: 'Evento excluído com sucesso',
      timestamp: new Date().toISOString()
    })

} catch (error) {
console.error(`DELETE /api/events/${params.eventId} error:`, error)

    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Falha ao excluir evento',
      timestamp: new Date().toISOString()
    }, { status: 500 })

}
}

// app/api/events/[eventId]/videos/[videoId]/status/route.ts - COM VALIDAÇÃO ZOD
import { NextRequest, NextResponse } from 'next/server'
import { VideoStatusUpdateSchema, validateRequest } from '@/lib/validations'
import { getVideoById, updateVideoStatus } from '@/lib/database/videos'

export async function PATCH(
request: NextRequest,
{ params }: { params: { eventId: string; videoId: string } }
) {
try {
const body = await request.json()

    // Validar dados de atualização de status
    const validatedData = validateRequest(VideoStatusUpdateSchema, {
      ...body,
      reviewedAt: new Date().toISOString()
    })

    // Verificar se vídeo existe
    const existingVideo = await getVideoById(params.videoId)
    if (!existingVideo) {
      return NextResponse.json({
        success: false,
        error: 'Vídeo não encontrado',
        message: `Vídeo com ID ${params.videoId} não existe`,
        timestamp: new Date().toISOString()
      }, { status: 404 })
    }

    // Verificar se vídeo pertence ao evento
    if (existingVideo.eventId !== params.eventId) {
      return NextResponse.json({
        success: false,
        error: 'Vídeo não pertence ao evento',
        message: 'O vídeo especificado não pertence ao evento informado',
        timestamp: new Date().toISOString()
      }, { status: 400 })
    }

    // Atualizar status do vídeo
    const updatedVideo = await updateVideoStatus(params.videoId, validatedData)

    return NextResponse.json({
      success: true,
      data: updatedVideo,
      message: 'Status do vídeo atualizado com sucesso',
      timestamp: new Date().toISOString()
    })

} catch (error) {
console.error(`PATCH /api/events/${params.eventId}/videos/${params.videoId}/status error:`, error)

    if (error instanceof ValidationError) {
      return NextResponse.json({
        success: false,
        error: 'Dados inválidos',
        message: error.message,
        details: error.getFormattedErrors(),
        timestamp: new Date().toISOString()
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Falha ao atualizar status do vídeo',
      timestamp: new Date().toISOString()
    }, { status: 500 })

}
}

8. Funções de Banco de Dados (Exemplo com Prisma)

// lib/database/events.ts
import { PrismaClient } from '@prisma/client'
import { Event, CreateEventRequest, UpdateEventRequest, SearchParams } from '@/types'

const prisma = new PrismaClient()

export async function getEvents(params: SearchParams): Promise<{ events: Event[]; total: number }> {
const {
page = 1,
limit = 10,
status,
client,
dateFrom,
dateTo,
q
} = params

const skip = (page - 1) \* limit

// Construir filtros dinâmicos
const where: any = {}

if (status) {
where.status = status
}

if (client) {
where.client = {
contains: client,
mode: 'insensitive'
}
}

if (dateFrom || dateTo) {
where.date = {}
if (dateFrom) where.date.gte = new Date(dateFrom)
if (dateTo) where.date.lte = new Date(dateTo)
}

if (q) {
where.OR = [
{ title: { contains: q, mode: 'insensitive' } },
{ client: { contains: q, mode: 'insensitive' } },
{ description: { contains: q, mode: 'insensitive' } }
]
}

// Executar consultas em paralelo
const [events, total] = await Promise.all([
prisma.event.findMany({
where,
skip,
take: limit,
orderBy: { createdAt: 'desc' }
}),
prisma.event.count({ where })
])

// Converter para formato da API
const apiEvents: Event[] = events.map(event => ({
id: event.id,
title: event.title,
client: event.client,
status: event.status,
date: event.date.toISOString(),
createdAt: event.createdAt.toISOString(),
updatedAt: event.updatedAt.toISOString(),
description: event.description || undefined,
location: event.location || undefined,
}))

return { events: apiEvents, total }
}

export async function getEventById(id: string): Promise<Event | null> {
const event = await prisma.event.findUnique({
where: { id },
include: {
videos: true
}
})

if (!event) return null

return {
id: event.id,
title: event.title,
client: event.client,
status: event.status,
date: event.date.toISOString(),
createdAt: event.createdAt.toISOString(),
updatedAt: event.updatedAt.toISOString(),
description: event.description || undefined,
location: event.location || undefined,
}
}

export async function createEvent(data: CreateEventRequest): Promise<Event> {
const event = await prisma.event.create({
data: {
title: data.title,
client: data.client,
status: data.status || 'pendente',
date: new Date(data.date),
description: data.description,
location: data.location,
}
})

return {
id: event.id,
title: event.title,
client: event.client,
status: event.status,
date: event.date.toISOString(),
createdAt: event.createdAt.toISOString(),
updatedAt: event.updatedAt.toISOString(),
description: event.description || undefined,
location: event.location || undefined,
}
}

export async function updateEvent(id: string, data: UpdateEventRequest): Promise<Event> {
const updateData: any = { ...data }

// Converter data se fornecida
if (data.date) {
updateData.date = new Date(data.date)
}

const event = await prisma.event.update({
where: { id },
data: updateData
})

return {
id: event.id,
title: event.title,
client: event.client,
status: event.status,
date: event.date.toISOString(),
createdAt: event.createdAt.toISOString(),
updatedAt: event.updatedAt.toISOString(),
description: event.description || undefined,
location: event.location || undefined,
}
}

export async function deleteEvent(id: string): Promise<void> {
// Excluir vídeos relacionados primeiro (se configurado cascade delete)
await prisma.video.deleteMany({
where: { eventId: id }
})

// Excluir evento
await prisma.event.delete({
where: { id }
})
}

// lib/database/videos.ts
import { Video, CreateVideoRequest, UpdateVideoRequest, VideoStatusUpdate } from '@/types'

export async function getVideosByEventId(eventId: string): Promise<Video[]> {
const videos = await prisma.video.findMany({
where: { eventId },
orderBy: { createdAt: 'desc' }
})

return videos.map(video => ({
id: video.id,
eventId: video.eventId,
fileName: video.fileName,
filePath: video.filePath,
status: video.status,
createdAt: video.createdAt.toISOString(),
updatedAt: video.updatedAt.toISOString(),
fileSize: video.fileSize || undefined,
duration: video.duration || undefined,
format: video.format || undefined,
thumbnailPath: video.thumbnailPath || undefined,
}))
}

export async function getVideoById(id: string): Promise<Video | null> {
const video = await prisma.video.findUnique({
where: { id }
})

if (!video) return null

return {
id: video.id,
eventId: video.eventId,
fileName: video.fileName,
filePath: video.filePath,
status: video.status,
createdAt: video.createdAt.toISOString(),
updatedAt: video.updatedAt.toISOString(),
fileSize: video.fileSize || undefined,
duration: video.duration || undefined,
format: video.format || undefined,
thumbnailPath: video.thumbnailPath || undefined,
}
}

export async function createVideo(data: CreateVideoRequest): Promise<Video> {
const video = await prisma.video.create({
data: {
eventId: data.eventId,
fileName: data.fileName,
filePath: data.filePath,
status: data.status || 'pendente',
fileSize: data.fileSize,
duration: data.duration,
format: data.format,
}
})

return {
id: video.id,
eventId: video.eventId,
fileName: video.fileName,
filePath: video.filePath,
status: video.status,
createdAt: video.createdAt.toISOString(),
updatedAt: video.updatedAt.toISOString(),
fileSize: video.fileSize || undefined,
duration: video.duration || undefined,
format: video.format || undefined,
thumbnailPath: video.thumbnailPath || undefined,
}
}

export async function updateVideo(id: string, data: UpdateVideoRequest): Promise<Video> {
const video = await prisma.video.update({
where: { id },
data
})

return {
id: video.id,
eventId: video.eventId,
fileName: video.fileName,
filePath: video.filePath,
status: video.status,
createdAt: video.createdAt.toISOString(),
updatedAt: video.updatedAt.toISOString(),
fileSize: video.fileSize || undefined,
duration: video.duration || undefined,
format: video.format || undefined,
thumbnailPath: video.thumbnailPath || undefined,
}
}

export async function updateVideoStatus(id: string, statusUpdate: VideoStatusUpdate): Promise<Video> {
const video = await prisma.video.update({
where: { id },
data: {
status: statusUpdate.status,
// Criar registro de histórico de status se necessário
statusHistory: {
create: {
status: statusUpdate.status,
comment: statusUpdate.comment,
reviewer: statusUpdate.reviewer,
reviewedAt: statusUpdate.reviewedAt ? new Date(statusUpdate.reviewedAt) : new Date(),
}
}
},
include: {
statusHistory: true
}
})

return {
id: video.id,
eventId: video.eventId,
fileName: video.fileName,
filePath: video.filePath,
status: video.status,
createdAt: video.createdAt.toISOString(),
updatedAt: video.updatedAt.toISOString(),
fileSize: video.fileSize || undefined,
duration: video.duration || undefined,
format: video.format || undefined,
thumbnailPath: video.thumbnailPath || undefined,
}
}

export async function deleteVideo(id: string): Promise<void> {
await prisma.video.delete({
where: { id }
})
}

// lib/database/index.ts - Utilitários
export async function initializeDatabase(): Promise<void> {
try {
await prisma.$connect()
console.log('✅ Conexão com banco de dados estabelecida')
} catch (error) {
console.error('❌ Erro ao conectar com banco de dados:', error)
throw error
}
}

export async function closeDatabase(): Promise<void> {
await prisma.$disconnect()
}

// Middleware para transações
export async function withTransaction<T>(
callback: (prisma: PrismaClient) => Promise<T>
): Promise<T> {
return await prisma.$transaction(callback)
}

// Hook para cleanup em desenvolvimento
if (process.env.NODE_ENV === 'development') {
process.on('beforeExit', async () => {
await closeDatabase()
})
}

9. Schema Prisma Sugerido

// prisma/schema.prisma
generator client {
provider = "prisma-client-js"
}

datasource db {
provider = "postgresql" // ou "mysql", "sqlite", etc.
url = env("DATABASE_URL")
}

model Event {
id String @id @default(cuid())
title String @db.VarChar(255)
client String @db.VarChar(255)
status String @default("pendente") @db.VarChar(50)
date DateTime
description String? @db.Text
location String? @db.VarChar(255)
createdAt DateTime @default(now()) @map("created_at")
updatedAt DateTime @updatedAt @map("updated_at")

// Relacionamentos
videos Video[]

// Índices
@@index([status])
@@index([client])
@@index([date])
@@index([createdAt])
@@map("events")
}

model Video {
id String @id @default(cuid())
eventId String @map("event_id")
fileName String @map("file_name") @db.VarChar(255)
filePath String @map("file_path") @db.VarChar(500)
status String @default("pendente") @db.VarChar(50)
fileSize BigInt? @map("file_size")
duration Int? // em segundos
format String? @db.VarChar(50)
thumbnailPath String? @map("thumbnail_path") @db.VarChar(500)
resolution String? @db.VarChar(50) // ex: "1920x1080", "4K"
frameRate Float? @map("frame_rate") // ex: 30.0, 60.0
bitrate Int? // em kbps
codec String? @db.VarChar(50) // ex: "H.264", "H.265"
createdAt DateTime @default(now()) @map("created_at")
updatedAt DateTime @updatedAt @map("updated_at")

// Relacionamentos
event Event @relation(fields: [eventId], references: [id], onDelete: Cascade)
statusHistory VideoStatusHistory[]

// Índices
@@index([eventId])
@@index([status])
@@index([createdAt])
@@index([format])
@@map("videos")
}

model VideoStatusHistory {
id String @id @default(cuid())
videoId String @map("video_id")
status String @db.VarChar(50)
comment String? @db.Text // Tornei opcional para casos onde não há comentário
reviewer String @db.VarChar(255)
reviewedAt DateTime @default(now()) @map("reviewed_at")
createdAt DateTime @default(now()) @map("created_at")

// Relacionamentos
video Video @relation(fields: [videoId], references: [id], onDelete: Cascade)

// Índices
@@index([videoId])
@@index([status])
@@index([reviewer])
@@index([reviewedAt])
@@map("video_status_history")
}

// Enum para status mais organizados (opcional)
enum EventStatus {
PENDENTE
EM_ANDAMENTO
CONCLUIDO
CANCELADO

@@map("event_status")
}

enum VideoStatus {
PENDENTE
PROCESSANDO
APROVADO
REJEITADO
ARQUIVADO

@@map("video_status")
}

// Modelo adicional para configurações do sistema (opcional)
model SystemConfig {
id String @id @default(cuid())
key String @unique @db.VarChar(100)
value String @db.Text
type String @default("string") @db.VarChar(20) // string, number, boolean, json

createdAt DateTime @default(now()) @map("created_at")
updatedAt DateTime @updatedAt @map("updated_at")

@@map("system_config")
}

// Modelo para logs de atividades (opcional)
model ActivityLog {
id String @id @default(cuid())
entity String @db.VarChar(50) // "event", "video", etc.
entityId String @map("entity_id")
action String @db.VarChar(100) // "created", "updated", "deleted", etc.
details Json? // Detalhes da ação em JSON
userId String? @map("user_id") @db.VarChar(255) // ID do usuário que executou a ação
ipAddress String? @map("ip_address") @db.VarChar(45)
userAgent String? @map("user_agent") @db.Text
createdAt DateTime @default(now()) @map("created_at")

@@index([entity, entityId])
@@index([action])
@@index([createdAt])
@@map("activity_logs")
}

I see you have a Prisma schema for what appears to be a video management system with events. The schema looks incomplete - the `VideoStatusHistory` model seems to be cut off. Let me help you complete it and provide some suggestions for improvements.

I've completed your Prisma schema and added several improvements:

## Principais mudanças e adições:

1. **Completei o modelo `VideoStatusHistory`** - estava cortado na linha dos índices
2. **Adicionei campos úteis ao modelo `Video`**:

   - `resolution` (resolução do vídeo)
   - `frameRate` (taxa de quadros)
   - `bitrate` (taxa de bits)
   - `codec` (codec usado)

3. **Melhorias nos índices**:

   - Adicionei índices para campos que provavelmente serão consultados frequentemente
   - Tornei o campo `comment` opcional no `VideoStatusHistory`

4. **Modelos opcionais adicionados**:
   - **Enums**: Para status mais organizados e type-safe
   - **SystemConfig**: Para configurações do sistema
   - **ActivityLog**: Para auditoria e logs de atividades

## Sugestões de uso dos Enums:

Se quiser usar os enums, você pode alterar os campos de status:

```prisma
// No modelo Event
status EventStatus @default(PENDENTE)

// No modelo Video
status VideoStatus @default(PENDENTE)
```

## Comandos úteis para trabalhar com este schema:

```bash
# Gerar as migrações
npx prisma migrate dev --name init

# Gerar o cliente Prisma
npx prisma generate

# Visualizar o banco no Prisma Studio
npx prisma studio
```

O schema agora está mais completo e pronto para uso. Precisa de algum ajuste específico ou tem dúvidas sobre alguma parte?
