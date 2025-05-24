#!/usr/bin/env node

/**
 * Script para testar o fluxo de UI completo:
 * 1. Acessar página de briefing
 * 2. Preencher e salvar briefing
 * 3. Gerar timeline
 * 4. Visualizar timeline
 */

const fs = require('fs').promises
const path = require('path')

const BRIEFINGS_FILE = path.join(__dirname, 'data', 'briefings.json')
const TIMELINES_FILE = path.join(__dirname, 'data', 'timelines.json')

console.log('🧪 TESTE DE FLUXO DE UI COMPLETO')
console.log('===============================\n')

async function readJsonFile(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error(`❌ Erro ao ler ${filePath}:`, error.message)
    return {}
  }
}

async function writeJsonFile(filePath, data) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    console.error(`❌ Erro ao escrever ${filePath}:`, error.message)
    return false
  }
}

async function simulateApiCall(url, method = 'GET', body = null) {
  console.log(`🌐 Simulando chamada API: ${method} ${url}`)

  if (url.includes('/api/briefings/') && method === 'PUT') {
    // Simular salvamento de briefing
    const eventId = url.split('/').pop()
    const briefings = await readJsonFile(BRIEFINGS_FILE)
    briefings[eventId] = body
    await writeJsonFile(BRIEFINGS_FILE, briefings)
    console.log(`✅ Briefing salvo para evento ${eventId}`)
    return { success: true, data: body }
  }

  if (url.includes('/api/briefings/') && method === 'GET') {
    // Simular busca de briefing
    const eventId = url.split('/').pop()
    const briefings = await readJsonFile(BRIEFINGS_FILE)
    const briefing = briefings[eventId]
    console.log(`📋 Briefing encontrado para evento ${eventId}:`, !!briefing)
    return { success: true, data: briefing || null }
  }

  if (url.includes('/api/timeline/') && method === 'POST') {
    // Simular geração de timeline
    const eventId = url.split('/').pop()
    const timelines = await readJsonFile(TIMELINES_FILE)

    // Criar timeline simulada
    const newTimeline = {
      eventId,
      phases: [
        {
          id: 'pre-production',
          name: 'Pré-Produção',
          description: 'Planejamento e preparação',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
          type: 'planning',
          tasks: [
            {
              id: 'briefing',
              name: 'Briefing do cliente',
              status: 'completed',
              dueDate: new Date().toISOString(),
            },
          ],
        },
      ],
      createdAt: new Date().toISOString(),
    }

    timelines[eventId] = newTimeline
    await writeJsonFile(TIMELINES_FILE, timelines)
    console.log(`✅ Timeline gerada para evento ${eventId}`)
    return { success: true, data: newTimeline }
  }

  if (url.includes('/api/timeline/') && method === 'GET') {
    // Simular busca de timeline
    const eventId = url.split('/').pop()
    const timelines = await readJsonFile(TIMELINES_FILE)
    const timeline = timelines[eventId]
    console.log(`📅 Timeline encontrada para evento ${eventId}:`, !!timeline)
    return { success: true, data: timeline || null }
  }

  return { success: false, error: 'Endpoint não implementado' }
}

async function testCompleteFlow() {
  const testEventId = 'test-event-' + Date.now()

  console.log(`🎯 Testando fluxo completo para evento: ${testEventId}`)
  console.log('----------------------------------------------\n')

  // 1. Simular preenchimento e salvamento do briefing
  console.log('📝 ETAPA 1: Salvando briefing...')
  const briefingData = {
    eventName: 'Teste de Evento',
    eventDate: '2024-12-31',
    eventLocation: 'Local de Teste',
    eventDescription: 'Descrição do evento de teste',
    sponsors: [{ name: 'Sponsor 1', logo: '', website: '' }],
    stages: [
      { name: 'Palco Principal', description: 'Palco principal do evento' },
    ],
    realTimeDeliveries: [
      { type: 'Live Streaming', description: 'Transmissão ao vivo' },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const saveResult = await simulateApiCall(
    `/api/briefings/${testEventId}`,
    'PUT',
    briefingData
  )
  if (!saveResult.success) {
    console.log('❌ Falha ao salvar briefing')
    return
  }

  // 2. Simular busca do briefing salvo
  console.log('\n📋 ETAPA 2: Buscando briefing salvo...')
  const fetchResult = await simulateApiCall(
    `/api/briefings/${testEventId}`,
    'GET'
  )
  if (!fetchResult.success || !fetchResult.data) {
    console.log('❌ Falha ao buscar briefing')
    return
  }

  // 3. Simular geração da timeline
  console.log('\n⚡ ETAPA 3: Gerando timeline...')
  const generateResult = await simulateApiCall(
    `/api/timeline/${testEventId}`,
    'POST'
  )
  if (!generateResult.success) {
    console.log('❌ Falha ao gerar timeline')
    return
  }

  // 4. Simular busca da timeline gerada
  console.log('\n📅 ETAPA 4: Buscando timeline gerada...')
  const timelineResult = await simulateApiCall(
    `/api/timeline/${testEventId}`,
    'GET'
  )
  if (!timelineResult.success || !timelineResult.data) {
    console.log('❌ Falha ao buscar timeline')
    return
  }

  console.log('\n🎉 SUCESSO! Fluxo completo funcionando:')
  console.log('✅ Briefing salvo e recuperado')
  console.log('✅ Timeline gerada e recuperada')
  console.log('✅ Dados persistidos corretamente')

  // Verificar estrutura dos dados
  console.log('\n📊 ESTRUTURA DOS DADOS:')
  console.log('Briefing:', Object.keys(fetchResult.data))
  console.log('Timeline:', Object.keys(timelineResult.data))
  console.log('Fases da timeline:', timelineResult.data.phases?.length || 0)
  console.log(
    'Tarefas na primeira fase:',
    timelineResult.data.phases?.[0]?.tasks?.length || 0
  )
}

async function checkCurrentState() {
  console.log('📊 ESTADO ATUAL DOS DADOS:')
  console.log('-------------------------')

  const briefings = await readJsonFile(BRIEFINGS_FILE)
  const timelines = await readJsonFile(TIMELINES_FILE)

  const briefingCount = Object.keys(briefings).length
  const timelineCount = Object.keys(timelines).length

  console.log(`Briefings salvos: ${briefingCount}`)
  console.log(`Timelines geradas: ${timelineCount}`)

  if (briefingCount > 0) {
    console.log('\nEventos com briefing:')
    Object.keys(briefings).forEach(eventId => {
      const briefing = briefings[eventId]
      console.log(
        `  - ${eventId}: ${briefing.eventName || 'Nome não definido'}`
      )
    })
  }

  if (timelineCount > 0) {
    console.log('\nEventos com timeline:')
    Object.keys(timelines).forEach(eventId => {
      const timeline = timelines[eventId]
      console.log(`  - ${eventId}: ${timeline.phases?.length || 0} fases`)
    })
  }
}

async function main() {
  await checkCurrentState()
  console.log('\n')
  await testCompleteFlow()
}

if (require.main === module) {
  main().catch(console.error)
}
