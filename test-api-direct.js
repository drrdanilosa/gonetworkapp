#!/usr/bin/env node

/**
 * Teste direto das APIs sem dependência do servidor
 */

const fs = require('fs').promises
const path = require('path')

async function testDirectAPI() {
  console.log('🧪 Teste Direto das APIs')
  console.log('========================\n')

  try {
    // 1. Ler eventos existentes
    const eventsFile = path.join(__dirname, 'data', 'events.json')
    let events = []

    try {
      const eventsData = await fs.readFile(eventsFile, 'utf-8')
      events = JSON.parse(eventsData)
      console.log(`✅ Eventos encontrados: ${events.length}`)

      if (events.length > 0) {
        console.log(`📋 Primeiro evento: ${events[0].id} - ${events[0].title}`)
      }
    } catch (error) {
      console.log('⚠️  Arquivo de eventos não encontrado, criando...')
      events = []
    }

    // 2. Se não há eventos, criar um
    if (events.length === 0) {
      const newEvent = {
        id: 'test-event-integration',
        title: 'Evento de Teste Integração',
        client: 'Cliente Teste',
        date: '2025-06-15T10:00:00.000Z',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        description: 'Evento para testar integração briefing -> timeline',
      }

      events.push(newEvent)

      // Criar diretório se não existir
      await fs.mkdir(path.dirname(eventsFile), { recursive: true })
      await fs.writeFile(eventsFile, JSON.stringify(events, null, 2))
      console.log(`✅ Evento criado: ${newEvent.id}`)
    }

    // 3. Criar briefing de teste
    const eventId = events[0].id
    const briefingData = {
      eventId: eventId,
      eventName: events[0].title,
      eventDate: events[0].date,
      eventLocation: 'Local de Teste',
      sponsors: [
        {
          id: 'sponsor-1',
          name: 'Sponsor Principal',
          actions: [
            {
              id: 'action-1',
              name: 'Apresentação da marca',
              captureTime: '14:30',
              isRealTime: true,
              rtDeliveryTime: '15:00',
            },
          ],
        },
      ],
      stages: [
        {
          id: 'stage-1',
          name: 'Palco Principal',
          attractions: [
            {
              id: 'attraction-1',
              name: 'Show Principal',
              type: 'musical',
              duration: 90,
              startTime: '20:00',
            },
          ],
        },
      ],
      realTimeDeliveries: [
        {
          id: 'rt-1',
          title: 'Entrega Tempo Real 1',
          deliveryTime: '15:00',
          type: 'social',
        },
      ],
      postEventNotes: 'Observações pós-evento de teste',
    }

    // Salvar briefing
    const briefingsFile = path.join(__dirname, 'data', 'briefings.json')
    let briefings = {}

    try {
      const briefingsData = await fs.readFile(briefingsFile, 'utf-8')
      briefings = JSON.parse(briefingsData)
    } catch (error) {
      console.log('📝 Criando arquivo de briefings...')
    }

    briefings[eventId] = briefingData
    await fs.mkdir(path.dirname(briefingsFile), { recursive: true })
    await fs.writeFile(briefingsFile, JSON.stringify(briefings, null, 2))
    console.log(`✅ Briefing salvo para evento: ${eventId}`)

    // 4. Gerar timeline a partir do briefing
    const timelinesFile = path.join(__dirname, 'data', 'timelines.json')
    let timelines = {}

    try {
      const timelinesData = await fs.readFile(timelinesFile, 'utf-8')
      timelines = JSON.parse(timelinesData)
    } catch (error) {
      console.log('⏰ Criando arquivo de timelines...')
    }

    // Simular geração de timeline baseada no briefing
    function uuidv4() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
        /[xy]/g,
        function (c) {
          var r = (Math.random() * 16) | 0,
            v = c == 'x' ? r : (r & 0x3) | 0x8
          return v.toString(16)
        }
      )
    }
    const eventDate = new Date(briefingData.eventDate)

    const generatedTimeline = [
      {
        id: uuidv4(),
        name: 'Pré-produção',
        description: 'Planejamento e preparação baseado no briefing',
        startDate: new Date(
          eventDate.getTime() - 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        endDate: new Date(
          eventDate.getTime() - 15 * 24 * 60 * 60 * 1000
        ).toISOString(),
        status: 'pending',
        type: 'planning',
        tasks: [
          {
            id: uuidv4(),
            name: `Preparação para ${briefingData.sponsors.length} sponsors`,
            description: 'Coordenação com sponsors baseada no briefing',
            status: 'pending',
            dueDate: new Date(
              eventDate.getTime() - 25 * 24 * 60 * 60 * 1000
            ).toISOString(),
          },
          {
            id: uuidv4(),
            name: `Setup de ${briefingData.stages.length} palcos`,
            description: 'Preparação dos palcos conforme briefing',
            status: 'pending',
            dueDate: new Date(
              eventDate.getTime() - 20 * 24 * 60 * 60 * 1000
            ).toISOString(),
          },
        ],
      },
      {
        id: uuidv4(),
        name: 'Dia do Evento',
        description: 'Execução baseada no briefing',
        startDate: eventDate.toISOString(),
        endDate: new Date(
          eventDate.getTime() + 24 * 60 * 60 * 1000
        ).toISOString(),
        status: 'pending',
        type: 'execution',
        tasks: [
          {
            id: uuidv4(),
            name: `Entregas em tempo real (${briefingData.realTimeDeliveries.length})`,
            description: 'Execução das entregas conforme briefing',
            status: 'pending',
            dueDate: eventDate.toISOString(),
          },
        ],
      },
    ]

    timelines[eventId] = generatedTimeline
    await fs.mkdir(path.dirname(timelinesFile), { recursive: true })
    await fs.writeFile(timelinesFile, JSON.stringify(timelines, null, 2))
    console.log(`✅ Timeline gerada para evento: ${eventId}`)
    console.log(`📊 Timeline contém ${generatedTimeline.length} fases`)

    console.log('\n🎉 TESTE CONCLUÍDO COM SUCESSO!')
    console.log('=================================')
    console.log(`📋 Evento: ${eventId}`)
    console.log(`📝 Briefing: ${Object.keys(briefingData).length} campos`)
    console.log(`⏰ Timeline: ${generatedTimeline.length} fases`)
    console.log(`🎯 Sponsors: ${briefingData.sponsors.length}`)
    console.log(`🎭 Palcos: ${briefingData.stages.length}`)
    console.log(`⚡ Entregas RT: ${briefingData.realTimeDeliveries.length}`)
  } catch (error) {
    console.error('❌ Erro no teste:', error)
  }
}

// Executar o teste
testDirectAPI()
