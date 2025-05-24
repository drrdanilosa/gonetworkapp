Problemas Identificados

1. Inconsistência na Estrutura de Dados dos Eventos
   Os eventos têm estruturas diferentes no arquivo events. json :

. Evento antigo: {"id": "1", "name": "Evento de Exemplo", ... }

. Eventos novos: {"id":" ... ", "title":"Projeto Demonstração", ... }

2. API Intermitente
   A API às vezes falha com "Connection refused", indicando que o servidor Next.js não está
   rodando consistentemente.

3. Briefings Vazios
   O arquivo briefings. json está vazio {}, mas os eventos têm "briefing": null.

4. Dados Duplicados
   Múltiplos eventos "Projeto Demonstração" sendo criados repetidamente.

Correções Necessárias

// 1. Padronizar estrutura dos eventos - data/events.json
[
{
"id": "1",
"title": "Evento de Exemplo", // Mudança: "name" -> "title"
"client": "Cliente Exemplo", // Adicionado
"description": "Descrição do evento de exemplo.",
"date": "2023-10-01T00:00:00Z",
"createdAt": "2023-10-01T00:00:00Z", // Adicionado
"updatedAt": "2023-10-01T00:00:00Z", // Adicionado
"status": "active", // Adicionado
"team": [], // Adicionado
"briefing": null,
"videos": [],
"assets": [],
"tasks": [],
"deadline": null,
"thumbnail": "/placeholder-event.jpg",
"tags": [],
"deliverySettings": {
"allowRevisions": true,
"maxRevisions": 3,
"autoApprove": false,
"notifyOnUpload": true
}
}
]

// 2. Inicializar briefings.json corretamente
// data/briefings.json
[]

// 3. API Route para Events - pages/api/events/index.ts
import { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

interface Event {
id: string
title: string
client: string
description?: string
date: string
createdAt: string
updatedAt: string
status: 'active' | 'completed' | 'cancelled'
team: string[]
briefing: string | null
videos: string[]
assets: string[]
tasks: string[]
deadline: string | null
thumbnail: string
tags: string[]
deliverySettings: {
allowRevisions: boolean
maxRevisions: number
autoApprove: boolean
notifyOnUpload: boolean
}
}

const EVENTS_FILE = path.join(process.cwd(), 'data', 'events.json')

// Garantir que o diretório existe
function ensureDataDirectory() {
const dataDir = path.join(process.cwd(), 'data')
if (!fs.existsSync(dataDir)) {
fs.mkdirSync(dataDir, { recursive: true })
}
if (!fs.existsSync(EVENTS_FILE)) {
fs.writeFileSync(EVENTS_FILE, '[]')
}
}

function readEvents(): Event[] {
try {
ensureDataDirectory()
const data = fs.readFileSync(EVENTS_FILE, 'utf8')
const events = JSON.parse(data)

    // Normalizar eventos para estrutura padrão
    return events.map((event: any) => ({
      id: event.id,
      title: event.title || event.name || 'Título não definido',
      client: event.client || 'Cliente não especificado',
      description: event.description || '',
      date: event.date,
      createdAt: event.createdAt || new Date().toISOString(),
      updatedAt: event.updatedAt || new Date().toISOString(),
      status: event.status || 'active',
      team: event.team || [],
      briefing: event.briefing || null,
      videos: event.videos || [],
      assets: event.assets || [],
      tasks: event.tasks || [],
      deadline: event.deadline || null,
      thumbnail: event.thumbnail || '/placeholder-event.jpg',
      tags: event.tags || [],
      deliverySettings: event.deliverySettings || {
        allowRevisions: true,
        maxRevisions: 3,
        autoApprove: false,
        notifyOnUpload: true
      }
    }))

} catch (error) {
console.error('Erro ao ler eventos:', error)
return []
}
}

function writeEvents(events: Event[]) {
try {
ensureDataDirectory()
fs.writeFileSync(EVENTS_FILE, JSON.stringify(events, null, 2))
} catch (error) {
console.error('Erro ao escrever eventos:', error)
throw error
}
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
const { method } = req

try {
switch (method) {
case 'GET':
const events = readEvents()
res.status(200).json({
success: true,
count: events.length,
events: events.map(event => ({
...event,
videoCount: event.videos.length
}))
})
break

      case 'POST':
        const { title, client = 'Cliente não especificado', description = '', date, tags = [] } = req.body

        if (!title) {
          return res.status(400).json({
            success: false,
            message: 'Título é obrigatório'
          })
        }

        const newEvent: Event = {
          id: uuidv4(),
          title,
          client,
          description,
          date: date || new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'active',
          team: [],
          briefing: null,
          videos: [],
          assets: [],
          tasks: [],
          deadline: null,
          thumbnail: '/placeholder-event.jpg',
          tags,
          deliverySettings: {
            allowRevisions: true,
            maxRevisions: 3,
            autoApprove: false,
            notifyOnUpload: true
          }
        }

        const allEvents = readEvents()
        allEvents.push(newEvent)
        writeEvents(allEvents)

        res.status(201).json({
          success: true,
          message: 'Evento criado com sucesso',
          event: newEvent
        })
        break

      case 'DELETE':
        // Limpar eventos duplicados
        if (req.query.cleanup === 'true') {
          const events = readEvents()
          const uniqueEvents = events.filter((event, index, self) =>
            index === self.findIndex(e => e.title === event.title && e.client === event.client)
          )
          writeEvents(uniqueEvents)

          res.status(200).json({
            success: true,
            message: `${events.length - uniqueEvents.length} eventos duplicados removidos`,
            removedCount: events.length - uniqueEvents.length
          })
        } else {
          res.status(400).json({
            success: false,
            message: 'Parâmetro cleanup=true necessário'
          })
        }
        break

      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE'])
        res.status(405).json({
          success: false,
          message: `Método ${method} não permitido`
        })
    }

} catch (error) {
console.error('Erro na API:', error)
res.status(500).json({
success: false,
message: 'Erro interno do servidor',
error: process.env.NODE_ENV === 'development' ? error : undefined
})
}
}

// 4. API Route para Briefings - pages/api/briefings/[eventId].ts
import { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

interface Briefing {
id: string
eventId: string
title: string
content: string
createdAt: string
updatedAt: string
status: 'draft' | 'approved' | 'revision'
}

const BRIEFINGS_FILE = path.join(process.cwd(), 'data', 'briefings.json')

function ensureBriefingsFile() {
const dataDir = path.join(process.cwd(), 'data')
if (!fs.existsSync(dataDir)) {
fs.mkdirSync(dataDir, { recursive: true })
}
if (!fs.existsSync(BRIEFINGS_FILE)) {
fs.writeFileSync(BRIEFINGS_FILE, '[]')
}
}

function readBriefings(): Briefing[] {
try {
ensureBriefingsFile()
const data = fs.readFileSync(BRIEFINGS_FILE, 'utf8')
return JSON.parse(data)
} catch (error) {
console.error('Erro ao ler briefings:', error)
return []
}
}

function writeBriefings(briefings: Briefing[]) {
try {
ensureBriefingsFile()
fs.writeFileSync(BRIEFINGS_FILE, JSON.stringify(briefings, null, 2))
} catch (error) {
console.error('Erro ao escrever briefings:', error)
throw error
}
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
const { method } = req
const { eventId } = req.query

if (!eventId || typeof eventId !== 'string') {
return res.status(400).json({
success: false,
message: 'ID do evento é obrigatório'
})
}

try {
switch (method) {
case 'GET':
const briefings = readBriefings()
const eventBriefing = briefings.find(b => b.eventId === eventId)

        if (!eventBriefing) {
          return res.status(404).json({
            success: false,
            message: 'Briefing não encontrado para este evento'
          })
        }

        res.status(200).json({
          success: true,
          briefing: eventBriefing
        })
        break

      case 'POST':
        const { title, content } = req.body

        if (!title || !content) {
          return res.status(400).json({
            success: false,
            message: 'Título e conteúdo são obrigatórios'
          })
        }

        const newBriefing: Briefing = {
          id: `briefing-${eventId}-${Date.now()}`,
          eventId,
          title,
          content,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'draft'
        }

        const allBriefings = readBriefings()
        allBriefings.push(newBriefing)
        writeBriefings(allBriefings)

        res.status(201).json({
          success: true,
          message: 'Briefing criado com sucesso',
          briefing: newBriefing
        })
        break

      default:
        res.setHeader('Allow', ['GET', 'POST'])
        res.status(405).json({
          success: false,
          message: `Método ${method} não permitido`
        })
    }

} catch (error) {
console.error('Erro na API de briefings:', error)
res.status(500).json({
success: false,
message: 'Erro interno do servidor'
})
}
}

Comandos para Corrigir os Problemas
Execute estes comandos no terminal:

# 1. Limpar eventos duplicados

curl -X DELETE "http://localhost:3000/api/events?cleanup=true"

# 2. Limpar e reinicializar arquivos de dados

rm -f data/events.json data/briefings.json
echo '[]' > data/events.json
echo '[]' > data/briefings.json

# 3. Verificar se o servidor está rodando

npm run dev

# ou

yarn dev

# 4. Testar a API

curl -X GET http://localhost:3000/api/events

# 5. Criar um evento de teste corretamente

curl -X POST http://localhost:3000/api/events \
 -H "Content-Type: application/json" \
 -d '{
"title": "Evento Teste Corrigido",
"client": "Cliente Teste",
"description": "Evento para testar correções",
"tags": ["teste", "corrigido"]
}'

Principais Correções Implementadas

Padronização da estrutura - Todos os eventos agora têm a mesma estrutura
Normalização automática - A API converte automaticamente eventos antigos para a nova estrutura
Tratamento de erros robusto - APIs com validação adequada e tratamento de erros
Limpeza de duplicados - Endpoint para remover eventos duplicados
Inicialização automática - Cria arquivos de dados se não existirem
Briefings funcionais - API completa para gerenciar briefings por evento

Verificação Pós-Correção

# Verificar estrutura dos dados

curl -X GET http://localhost:3000/api/events | jq

# Testar criação de briefing

curl -X POST http://localhost:3000/api/briefings/[EVENT_ID] \
 -H "Content-Type: application/json" \
 -d '{
"title": "Briefing Teste",
"content": "Conteúdo do briefing de teste"
}'

Essas correções devem resolver os problemas de inconsistência de dados e tornar a API mais robusta e confiável.
