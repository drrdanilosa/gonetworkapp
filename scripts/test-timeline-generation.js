#!/usr/bin/env node

/**
 * Script para testar a geração de timeline a partir do briefing
 */

const fs = require('fs')
const path = require('path')

console.log('🧪 Testando geração de timeline...\n')

// Verificar se os arquivos de dados existem
const dataDir = path.join(__dirname, 'data')
const eventsFile = path.join(dataDir, 'events.json')
const briefingsFile = path.join(dataDir, 'briefings.json')
const timelinesFile = path.join(dataDir, 'timelines.json')

console.log('📁 Verificando arquivos de dados...')
console.log(`Events: ${fs.existsSync(eventsFile) ? '✅' : '❌'}`)
console.log(`Briefings: ${fs.existsSync(briefingsFile) ? '✅' : '❌'}`)
console.log(`Timelines: ${fs.existsSync(timelinesFile) ? '✅' : '❌'}`)

// Ler dados existentes
let events = []
let briefings = {}
let timelines = {}

try {
  if (fs.existsSync(eventsFile)) {
    events = JSON.parse(fs.readFileSync(eventsFile, 'utf-8'))
  }
  if (fs.existsSync(briefingsFile)) {
    briefings = JSON.parse(fs.readFileSync(briefingsFile, 'utf-8'))
  }
  if (fs.existsSync(timelinesFile)) {
    timelines = JSON.parse(fs.readFileSync(timelinesFile, 'utf-8'))
  }
} catch (error) {
  console.error('❌ Erro ao ler arquivos:', error.message)
}

console.log(`\n📊 Status dos dados:`)
console.log(`Eventos: ${events.length} registros`)
console.log(`Briefings: ${Object.keys(briefings).length} registros`)
console.log(`Timelines: ${Object.keys(timelines).length} registros`)

// Criar um evento de teste se não existir nenhum
if (events.length === 0) {
  const testEvent = {
    id: 'test-event-001',
    title: 'Evento de Teste - Conferência Tech',
    client: 'Empresa Tech Ltd',
    date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias no futuro
    status: 'planning',
    createdAt: new Date().toISOString(),
  }

  events.push(testEvent)
  fs.writeFileSync(eventsFile, JSON.stringify(events, null, 2))
  console.log(`✅ Evento de teste criado: ${testEvent.id}`)
}

// Criar um briefing de teste para o primeiro evento se não existir
const firstEvent = events[0]
if (firstEvent && !briefings[firstEvent.id]) {
  const testBriefing = {
    eventId: firstEvent.id,
    eventTitle: firstEvent.title,
    client: firstEvent.client,
    createdAt: new Date().toISOString(),
    sections: {
      overview: {
        title: 'Visão Geral',
        content: `Data: ${new Date(firstEvent.date).toLocaleDateString()}
Horário: 09:00 às 18:00
Local: Centro de Convenções São Paulo
Acesso: Portaria Principal

Este é um evento de tecnologia com palestras e networking.`,
        completed: true,
      },
      logistics: {
        title: 'Logística',
        content: `Credenciamento: sim
Local: Hall de Entrada
Responsável: João Silva
Horário: 08:00 às 09:00

Sala de Imprensa: sim
Local: Sala 201

Internet: sim
Login: evento_tech
Senha: tech2025`,
        completed: true,
      },
    },
    formData: {
      eventDate: firstEvent.date.split('T')[0],
      startTime: '09:00',
      endTime: '18:00',
      eventLocation: 'Centro de Convenções São Paulo',
      hasCredentialing: 'sim',
      accessLocation: 'Hall de Entrada',
      eventAccessLocation: 'Portaria Principal',
      hasMediaRoom: 'sim',
      mediaRoomLocation: 'Sala 201',
      hasInternet: 'sim',
      internetLogin: 'evento_tech',
      internetPassword: 'tech2025',
      generalInfo: 'Este é um evento de tecnologia com palestras e networking.',
      credentialingResponsible: 'João Silva',
      credentialingStart: '08:00',
      credentialingEnd: '09:00',
    },
  }

  briefings[firstEvent.id] = testBriefing
  fs.writeFileSync(briefingsFile, JSON.stringify(briefings, null, 2))
  console.log(`✅ Briefing de teste criado para evento: ${firstEvent.id}`)
}

console.log('\n🚀 Teste concluído!')
console.log('\n📋 Próximos passos:')
console.log('1. Inicie o servidor: npm run dev')
console.log('2. Acesse: http://localhost:3000/events/test-event-001/briefing')
console.log('3. Clique no botão "Gerar Timeline"')
console.log('4. Verifique se a timeline é gerada corretamente')
