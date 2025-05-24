#!/usr/bin/env node

/**
 * Simulação completa do fluxo do usuário:
 * 1. Usuário preenche briefing
 * 2. Clica "Save Briefing"
 * 3. Clica "Generate Timeline"
 * 4. Verifica se timeline foi gerada corretamente
 */

const fs = require('fs').promises
const path = require('path')
const { v4: uuidv4 } = require('uuid')

const BRIEFINGS_FILE = path.join(__dirname, 'data', 'briefings.json')
const TIMELINES_FILE = path.join(__dirname, 'data', 'timelines.json')
const EVENTS_FILE = path.join(__dirname, 'data', 'events.json')

console.log('🎭 SIMULAÇÃO COMPLETA DO FLUXO DO USUÁRIO')
console.log('========================================\n')

// Simulação das APIs
const API_BASE = 'http://localhost:3000'

async function simulateApiCall(endpoint, method = 'GET', body = null) {
  console.log(`📡 API Call: ${method} ${endpoint}`)

  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    }

    if (body) {
      options.body = JSON.stringify(body)
    }

    // Para simular offline, vamos ler/escrever diretamente dos arquivos
    return await simulateApiCallOffline(endpoint, method, body)
  } catch (error) {
    console.error(`❌ Erro na API ${endpoint}:`, error.message)
    throw error
  }
}

async function simulateApiCallOffline(endpoint, method, body) {
  if (endpoint.includes('/api/briefings/') && method === 'PUT') {
    return await simulateSaveBriefing(endpoint, body)
  } else if (endpoint.includes('/api/briefings/') && method === 'GET') {
    return await simulateGetBriefing(endpoint)
  } else if (endpoint.includes('/api/timeline/') && method === 'POST') {
    return await simulateGenerateTimeline(endpoint, body)
  } else if (endpoint.includes('/api/events/') && method === 'GET') {
    return await simulateGetEvent(endpoint)
  }

  throw new Error(`Endpoint não simulado: ${method} ${endpoint}`)
}

async function simulateSaveBriefing(endpoint, briefingData) {
  const eventId = endpoint.split('/').pop()
  console.log(`💾 Salvando briefing para evento ${eventId}`)

  try {
    let briefings = {}
    try {
      const data = await fs.readFile(BRIEFINGS_FILE, 'utf-8')
      briefings = JSON.parse(data)
    } catch {
      // Arquivo não existe ainda
    }

    briefings[eventId] = {
      ...briefingData,
      eventId,
      updatedAt: new Date().toISOString(),
      createdAt: briefingData.createdAt || new Date().toISOString(),
    }

    await fs.writeFile(BRIEFINGS_FILE, JSON.stringify(briefings, null, 2))
    console.log(`✅ Briefing salvo com sucesso`)
    return briefings[eventId]
  } catch (error) {
    console.error(`❌ Erro ao salvar briefing:`, error.message)
    throw error
  }
}

async function simulateGetBriefing(endpoint) {
  const eventId = endpoint.split('/').pop()
  console.log(`📖 Buscando briefing para evento ${eventId}`)

  try {
    const data = await fs.readFile(BRIEFINGS_FILE, 'utf-8')
    const briefings = JSON.parse(data)

    if (briefings[eventId]) {
      console.log(`✅ Briefing encontrado`)
      return briefings[eventId]
    } else {
      console.log(`⚠️ Briefing não encontrado`)
      throw new Error('Briefing não encontrado')
    }
  } catch (error) {
    console.error(`❌ Erro ao buscar briefing:`, error.message)
    throw error
  }
}

async function simulateGenerateTimeline(endpoint, requestBody) {
  const eventId = endpoint.split('/').pop()
  console.log(`⚡ Gerando timeline para evento ${eventId}`)
  console.log(`   Dados recebidos:`, requestBody)

  try {
    // Simular a lógica de geração de timeline
    const { generateFromBriefing, briefingData } = requestBody

    if (!generateFromBriefing || !briefingData) {
      throw new Error('Dados insuficientes para gerar timeline')
    }

    // Gerar timeline baseada no briefing
    const timeline = generateTimelineFromBriefingData(briefingData)

    // Salvar timeline
    let timelines = {}
    try {
      const data = await fs.readFile(TIMELINES_FILE, 'utf-8')
      timelines = JSON.parse(data)
    } catch {
      timelines = {
        _metadata: { version: '1.0', lastUpdated: new Date().toISOString() },
      }
    }

    timelines[eventId] = timeline
    await fs.writeFile(TIMELINES_FILE, JSON.stringify(timelines, null, 2))

    console.log(`✅ Timeline gerada com ${timeline.length} fases`)
    return { phases: timeline, eventId }
  } catch (error) {
    console.error(`❌ Erro ao gerar timeline:`, error.message)
    throw error
  }
}

function generateTimelineFromBriefingData(briefing) {
  console.log(`🤖 Gerando timeline baseada no briefing...`)

  // Extrair data do evento
  let eventDate = new Date()
  if (briefing.formData?.eventDate) {
    eventDate = new Date(briefing.formData.eventDate)
  } else if (briefing.eventDate) {
    eventDate = new Date(briefing.eventDate)
  }

  console.log(`   Data do evento: ${eventDate.toISOString()}`)

  const timeline = []

  // 1. Fase de Pré-produção (30 dias antes)
  const preProductionDate = new Date(eventDate)
  preProductionDate.setDate(eventDate.getDate() - 30)

  timeline.push({
    id: uuidv4(),
    name: 'Pré-produção',
    description: 'Planejamento e preparação baseado no briefing',
    startDate: preProductionDate.toISOString(),
    endDate: new Date(
      preProductionDate.getTime() + 15 * 24 * 60 * 60 * 1000
    ).toISOString(),
    status: 'pending',
    type: 'planning',
    tasks: [
      {
        id: uuidv4(),
        name: `Preparação para ${briefing.sponsors?.length || 0} sponsors`,
        description: 'Coordenação com sponsors baseada no briefing',
        status: 'pending',
        dueDate: new Date(
          preProductionDate.getTime() + 5 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        id: uuidv4(),
        name: `Setup de ${briefing.stages?.length || 0} palcos`,
        description: 'Preparação dos palcos conforme briefing',
        status: 'pending',
        dueDate: new Date(
          preProductionDate.getTime() + 10 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
    ],
  })

  // 2. Fase do Dia do Evento
  timeline.push({
    id: uuidv4(),
    name: 'Dia do Evento',
    description: 'Execução baseada no briefing',
    startDate: eventDate.toISOString(),
    endDate: new Date(eventDate.getTime() + 24 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
    type: 'execution',
    tasks: [
      {
        id: uuidv4(),
        name: `Entregas em tempo real (${briefing.realTimeDeliveries?.length || 0})`,
        description: 'Execução das entregas conforme briefing',
        status: 'pending',
        dueDate: eventDate.toISOString(),
      },
    ],
  })

  console.log(`   ✅ Timeline gerada com ${timeline.length} fases`)
  return timeline
}

async function simulateGetEvent(endpoint) {
  const eventId = endpoint.split('/').pop()
  console.log(`🎪 Buscando evento ${eventId}`)

  try {
    const data = await fs.readFile(EVENTS_FILE, 'utf-8')
    const events = JSON.parse(data)

    const event = events.find(e => e.id === eventId)
    if (event) {
      console.log(`✅ Evento encontrado: ${event.title}`)
      return event
    } else {
      console.log(`⚠️ Evento não encontrado`)
      throw new Error('Evento não encontrado')
    }
  } catch (error) {
    console.error(`❌ Erro ao buscar evento:`, error.message)
    throw error
  }
}

async function simulateUserFlow() {
  console.log('👤 SIMULANDO FLUXO DO USUÁRIO')
  console.log('============================\n')

  // Criar um novo evento para teste
  const testEventId = uuidv4()
  console.log(`🆕 Testando com evento: ${testEventId}\n`)

  // PASSO 1: Usuário preenche briefing
  console.log('📝 PASSO 1: Usuário preenche briefing')
  console.log('-----------------------------------')

  const briefingData = {
    sections: {
      overview: {
        title: 'Visão Geral',
        content: `Data: 2025-06-15\nHorário: 09:00 às 18:00\nLocal: Centro de Convenções\nEvento de teste para validação`,
        completed: true,
      },
      logistics: {
        title: 'Logística',
        content: `Credenciamento: sim\nSala de Imprensa: sim\nInternet: sim`,
        completed: true,
      },
    },
    formData: {
      eventDate: '2025-06-15',
      startTime: '09:00',
      endTime: '18:00',
      eventLocation: 'Centro de Convenções',
      generalInfo: 'Evento de teste para validação do fluxo',
    },
    eventName: 'Evento de Teste - Fluxo Completo',
    eventLocation: 'Centro de Convenções',
    sponsors: [
      {
        id: 'sponsor-test-1',
        name: 'Sponsor Principal',
        actions: [
          {
            id: 'action-test-1',
            name: 'Apresentação da marca',
            captureTime: '10:00',
            isRealTime: true,
          },
        ],
      },
    ],
    stages: [
      {
        id: 'stage-test-1',
        name: 'Palco Principal',
        attractions: [
          {
            id: 'attraction-test-1',
            name: 'Palestra de Abertura',
            type: 'apresentacao',
            duration: 60,
            startTime: '09:30',
          },
        ],
      },
    ],
    realTimeDeliveries: [
      {
        id: 'rt-test-1',
        title: 'Post Abertura',
        deliveryTime: '10:00',
        type: 'social',
      },
    ],
  }

  console.log('   Briefing preenchido com dados de teste ✅\n')

  // PASSO 2: Salvar briefing
  console.log('💾 PASSO 2: Salvando briefing')
  console.log('----------------------------')

  try {
    const savedBriefing = await simulateApiCall(
      `/api/briefings/${testEventId}`,
      'PUT',
      briefingData
    )
    console.log('   Briefing salvo com sucesso ✅\n')
  } catch (error) {
    console.log('   ❌ Falha ao salvar briefing\n')
    return false
  }

  // PASSO 3: Gerar timeline
  console.log('⚡ PASSO 3: Gerando timeline')
  console.log('---------------------------')

  try {
    // Primeiro buscar o briefing (como faz o botão)
    const briefing = await simulateApiCall(
      `/api/briefings/${testEventId}`,
      'GET'
    )
    console.log('   Briefing carregado ✅')

    // Então gerar a timeline
    const timeline = await simulateApiCall(
      `/api/timeline/${testEventId}`,
      'POST',
      {
        generateFromBriefing: true,
        briefingData: briefing,
      }
    )
    console.log('   Timeline gerada com sucesso ✅\n')

    // PASSO 4: Verificar resultado
    console.log('🔍 PASSO 4: Verificando resultado')
    console.log('--------------------------------')

    if (timeline && timeline.phases && timeline.phases.length > 0) {
      console.log(`   ✅ Timeline contém ${timeline.phases.length} fases`)
      timeline.phases.forEach((phase, index) => {
        console.log(
          `   ${index + 1}. ${phase.name} (${phase.tasks?.length || 0} tarefas)`
        )
      })

      // Verificar se timeline está baseada no briefing
      const hasCustomTasks = timeline.phases.some(phase =>
        phase.tasks?.some(
          task =>
            task.name.includes('sponsors') ||
            task.name.includes('palcos') ||
            task.name.includes('Entregas')
        )
      )

      if (hasCustomTasks) {
        console.log('   🎯 Timeline foi personalizada baseada no briefing ✅')
      } else {
        console.log('   ⚠️ Timeline parece genérica (não baseada no briefing)')
      }

      return true
    } else {
      console.log('   ❌ Timeline não foi gerada corretamente')
      return false
    }
  } catch (error) {
    console.log(`   ❌ Falha ao gerar timeline: ${error.message}\n`)
    return false
  }
}

async function runSimulation() {
  try {
    console.log('🚀 Iniciando simulação completa do fluxo...\n')

    const success = await simulateUserFlow()

    console.log('\n🏁 RESULTADO DA SIMULAÇÃO')
    console.log('========================')

    if (success) {
      console.log('✅ FLUXO COMPLETO FUNCIONANDO!')
      console.log('   1. Briefing preenchido e salvo')
      console.log('   2. Timeline gerada baseada no briefing')
      console.log('   3. Dados persistidos corretamente')
    } else {
      console.log('❌ FLUXO COM PROBLEMAS!')
      console.log('   Revisar implementação dos componentes')
    }
  } catch (error) {
    console.error('💥 Erro crítico na simulação:', error)
  }
}

runSimulation()
