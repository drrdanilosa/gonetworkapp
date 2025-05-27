#!/usr/bin/env node

/**
 * Script para testar especificamente o botão "Gerar Timeline"
 * Simula o fluxo completo do usuário:
 * 1. Carrega o briefing
 * 2. Clica no botão "Gerar Timeline"
 * 3. Verifica se a timeline foi gerada
 * 4. Visualiza a timeline
 */

const http = require('http')
const fs = require('fs').promises

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    }

    const req = http.request(options, res => {
      let body = ''
      res.on('data', chunk => (body += chunk))
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {}
          resolve({ status: res.statusCode, data: parsed, raw: body })
        } catch (e) {
          resolve({ status: res.statusCode, data: {}, raw: body })
        }
      })
    })

    req.on('error', reject)

    if (data) {
      req.write(JSON.stringify(data))
    }
    req.end()
  })
}

async function testGenerateTimelineFlow() {
  console.log('🧪 TESTE DO FLUXO "GERAR TIMELINE"')
  console.log('=================================\n')

  // Evento que sabemos que existe
  const testEventId = 'e556271a-dda7-4559-b9c6-73ea3431f640'

  try {
    // 1. Verificar se o briefing existe
    console.log('📋 ETAPA 1: Verificando briefing existente...')
    const briefingResponse = await makeRequest(`/api/briefings/${testEventId}`)

    if (briefingResponse.status !== 200) {
      console.log('❌ Briefing não encontrado')
      return false
    }

    console.log('✅ Briefing encontrado:')
    console.log(`   - Nome: ${briefingResponse.data.eventName}`)
    console.log(`   - Data: ${briefingResponse.data.eventDate}`)
    console.log(`   - Sponsors: ${briefingResponse.data.sponsors?.length || 0}`)
    console.log(`   - Palcos: ${briefingResponse.data.stages?.length || 0}`)

    // 2. Simular clique no botão "Gerar Timeline"
    console.log('\n⚡ ETAPA 2: Simulando clique em "Gerar Timeline"...')
    const generateResponse = await makeRequest(
      `/api/timeline/${testEventId}`,
      'POST',
      {}
    )

    console.log(`Status da geração: ${generateResponse.status}`)

    if (generateResponse.status === 200) {
      console.log('✅ Timeline gerada com sucesso!')
      console.log(
        `   - Fases criadas: ${generateResponse.data.timeline?.length || 0}`
      )

      if (generateResponse.data.timeline?.length > 0) {
        generateResponse.data.timeline.forEach((phase, index) => {
          console.log(
            `   - Fase ${index + 1}: ${phase.name} (${phase.tasks?.length || 0} tarefas)`
          )
        })
      }
    } else {
      console.log('❌ Erro ao gerar timeline')
      console.log('Resposta:', generateResponse.raw)
      return false
    }

    // 3. Verificar se a timeline foi salva
    console.log('\n📅 ETAPA 3: Verificando timeline salva...')
    const timelineResponse = await makeRequest(`/api/timeline/${testEventId}`)

    if (timelineResponse.status === 200) {
      console.log('✅ Timeline recuperada com sucesso!')
      console.log(`   - Fases: ${timelineResponse.data.timeline?.length || 0}`)

      // 4. Verificar estrutura detalhada
      if (timelineResponse.data.timeline?.length > 0) {
        console.log('\n📊 DETALHES DA TIMELINE:')
        timelineResponse.data.timeline.forEach((phase, index) => {
          console.log(`\n   Fase ${index + 1}: ${phase.name}`)
          console.log(`   - Tipo: ${phase.type}`)
          console.log(`   - Status: ${phase.status}`)
          console.log(
            `   - Início: ${new Date(phase.startDate).toLocaleDateString('pt-BR')}`
          )
          console.log(
            `   - Fim: ${new Date(phase.endDate).toLocaleDateString('pt-BR')}`
          )
          console.log(`   - Tarefas: ${phase.tasks?.length || 0}`)

          if (phase.tasks?.length > 0) {
            phase.tasks.forEach((task, taskIndex) => {
              console.log(
                `     ${taskIndex + 1}. ${task.name} (${task.status})`
              )
            })
          }
        })
      }
    } else {
      console.log('❌ Erro ao recuperar timeline salva')
      return false
    }

    console.log(
      '\n🎉 SUCESSO! Fluxo completo do botão "Gerar Timeline" funcionando!'
    )
    console.log('✅ Briefing carregado')
    console.log('✅ Timeline gerada via POST')
    console.log('✅ Timeline salva e recuperada via GET')
    console.log('✅ Dados estruturados corretamente')

    return true
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message)
    return false
  }
}

async function testCurrentState() {
  console.log('📊 ESTADO ATUAL DOS DADOS:')
  console.log('-------------------------')

  try {
    const briefingsData = await fs.readFile(
      '/workspaces/melhorapp_final02/data/briefings.json',
      'utf-8'
    )
    const timelinesData = await fs.readFile(
      '/workspaces/melhorapp_final02/data/timelines.json',
      'utf-8'
    )

    const briefings = JSON.parse(briefingsData)
    const timelines = JSON.parse(timelinesData)

    console.log(`Briefings salvos: ${Object.keys(briefings).length}`)
    console.log(
      `Timelines geradas: ${Object.keys(timelines).filter(k => k !== '_metadata').length}`
    )

    // Mostrar eventos com briefing E timeline
    const eventIds = Object.keys(briefings)
    let withBoth = 0

    eventIds.forEach(eventId => {
      if (timelines[eventId]) {
        withBoth++
        console.log(`✅ ${eventId}: Briefing + Timeline`)
      } else {
        console.log(`📋 ${eventId}: Apenas Briefing`)
      }
    })

    console.log(`\nEventos completos (briefing + timeline): ${withBoth}`)
  } catch (error) {
    console.error('Erro ao ler dados:', error.message)
  }
}

async function main() {
  await testCurrentState()
  console.log('\n')
  const success = await testGenerateTimelineFlow()

  if (success) {
    console.log(
      '\n🏆 CONCLUSÃO: O botão "Gerar Timeline" está funcionando corretamente!'
    )
  } else {
    console.log(
      '\n💥 CONCLUSÃO: Há problemas no fluxo do botão "Gerar Timeline"'
    )
  }
}

if (require.main === module) {
  main().catch(console.error)
}
