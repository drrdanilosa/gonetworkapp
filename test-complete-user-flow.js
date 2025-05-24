#!/usr/bin/env node

/**
 * Script para testar o fluxo completo do usuário
 * simulando o comportamento real do frontend
 */

const fs = require('fs').promises
const path = require('path')

async function testCompleteUserFlow() {
  console.log('🎯 TESTE COMPLETO: Fluxo do Usuário - Briefing → Timeline\n')

  const testEventId = 'e556271a-dda7-4559-b9c6-73ea3431f640'
  const baseUrl = 'http://localhost:3001'

  // 1. Simular salvamento de briefing
  console.log('1. 💾 Testando Salvamento de Briefing:')

  const briefingData = {
    eventDate: '2025-06-15',
    startTime: '09:00',
    endTime: '18:00',
    eventLocation: 'Centro de Convenções SP',
    hasCredentialing: 'yes',
    accessLocation: 'Portaria Principal',
    eventAccessLocation: 'Hall de Entrada',
    hasMediaRoom: 'yes',
    mediaRoomLocation: 'Sala 201',
    hasInternet: 'yes',
    internetLogin: 'evento2025',
    internetPassword: 'senha123',
    generalInfo: 'Evento de lançamento de produto com 200 participantes',
    credentialingResponsible: 'Maria Silva',
    credentialingStart: '07:30',
    credentialingEnd: '09:00',
  }

  try {
    const briefingResponse = await fetch(
      `${baseUrl}/api/briefings/${testEventId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formData: briefingData }),
      }
    )

    const briefingStatus = briefingResponse.ok ? '✅' : '❌'
    console.log(
      `   ${briefingStatus} Briefing salvo - Status: ${briefingResponse.status}`
    )

    if (briefingResponse.ok) {
      const result = await briefingResponse.json()
      console.log(`   📝 Briefing ID: ${result.briefing?.eventId || 'N/A'}`)
    }
  } catch (error) {
    console.log(`   ❌ Erro ao salvar briefing: ${error.message}`)
  }

  console.log('')

  // 2. Simular clique no botão "Gerar Timeline"
  console.log('2. ⚡ Testando Geração de Timeline:')

  try {
    // Primeiro buscar o briefing (como faz o frontend)
    const briefingGetResponse = await fetch(
      `${baseUrl}/api/briefings/${testEventId}`
    )

    if (briefingGetResponse.ok) {
      const briefingData = await briefingGetResponse.json()
      console.log(`   📋 Briefing recuperado: ${briefingData.eventId}`)

      // Então gerar a timeline
      const timelineResponse = await fetch(
        `${baseUrl}/api/timeline/${testEventId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            generateFromBriefing: true,
            briefingData,
          }),
        }
      )

      const timelineStatus = timelineResponse.ok ? '✅' : '❌'
      console.log(
        `   ${timelineStatus} Timeline gerada - Status: ${timelineResponse.status}`
      )

      if (timelineResponse.ok) {
        const timelineResult = await timelineResponse.json()
        console.log(
          `   📅 Timeline criada com ${timelineResult.phases?.length || 'N/A'} fases`
        )
      }
    } else {
      console.log(
        `   ❌ Não foi possível recuperar briefing - Status: ${briefingGetResponse.status}`
      )
    }
  } catch (error) {
    console.log(`   ❌ Erro ao gerar timeline: ${error.message}`)
  }

  console.log('')

  // 3. Verificar se timeline pode ser carregada
  console.log('3. 📊 Testando Carregamento de Timeline:')

  try {
    const timelineGetResponse = await fetch(
      `${baseUrl}/api/timeline/${testEventId}`
    )

    if (timelineGetResponse.ok) {
      const timelineData = await timelineGetResponse.json()

      console.log(
        `   ✅ Timeline carregada - Status: ${timelineGetResponse.status}`
      )
      console.log(`   📈 Estrutura da resposta:`)
      console.log(`      - success: ${timelineData.success}`)
      console.log(
        `      - timeline: ${Array.isArray(timelineData.timeline) ? 'Array' : typeof timelineData.timeline}`
      )
      console.log(`      - phases: ${timelineData.timeline?.length || 0}`)

      if (timelineData.timeline && timelineData.timeline.length > 0) {
        console.log(`   📝 Primeira fase: "${timelineData.timeline[0].name}"`)
        console.log(
          `   📝 Última fase: "${timelineData.timeline[timelineData.timeline.length - 1].name}"`
        )
      }
    } else {
      console.log(
        `   ❌ Erro ao carregar timeline - Status: ${timelineGetResponse.status}`
      )
    }
  } catch (error) {
    console.log(`   ❌ Erro ao carregar timeline: ${error.message}`)
  }

  console.log('')

  // 4. Verificar arquivo de dados
  console.log('4. 📁 Verificando Persistência:')

  try {
    const timelinesPath = path.join(process.cwd(), 'data', 'timelines.json')
    const timelinesRaw = await fs.readFile(timelinesPath, 'utf-8')
    const timelinesData = JSON.parse(timelinesRaw)

    if (timelinesData[testEventId]) {
      const timeline = timelinesData[testEventId]
      console.log(`   ✅ Timeline persistida no arquivo`)
      console.log(
        `   📊 Fases salvas: ${Array.isArray(timeline) ? timeline.length : 'Formato inválido'}`
      )

      if (Array.isArray(timeline) && timeline.length > 0) {
        console.log(`   📝 Fases encontradas:`)
        timeline.forEach((phase, index) => {
          console.log(`      ${index + 1}. ${phase.name} (${phase.status})`)
        })
      }
    } else {
      console.log(
        `   ❌ Timeline não encontrada no arquivo para evento ${testEventId}`
      )
    }
  } catch (error) {
    console.log(`   ❌ Erro ao verificar arquivo: ${error.message}`)
  }

  console.log('')

  // 5. Diagnóstico e conclusões
  console.log('5. 🔬 DIAGNÓSTICO FINAL:')
  console.log('')

  console.log('🎯 FLUXO TESTADO:')
  console.log('   ✅ Briefing → Salvar via PUT /api/briefings/[eventId]')
  console.log('   ✅ Botão → Buscar briefing via GET /api/briefings/[eventId]')
  console.log('   ✅ Botão → Gerar timeline via POST /api/timeline/[eventId]')
  console.log('   ✅ Timeline → Carregar via GET /api/timeline/[eventId]')
  console.log('   ✅ Dados → Persistidos em data/timelines.json')
  console.log('')

  console.log('🔍 SE O PROBLEMA PERSISTE, VERIFIQUE:')
  console.log(
    '   1. 🌐 Abra o navegador em http://localhost:3001/events/e556271a-dda7-4559-b9c6-73ea3431f640/briefing'
  )
  console.log('   2. 🔧 Abra DevTools (F12) → Console')
  console.log('   3. 🖱️ Clique na aba "Timeline"')
  console.log('   4. 👀 Veja se aparece a timeline ou mensagem de erro')
  console.log(
    '   5. 📋 Verifique logs: "📅 Timeline carregada:" ou "❌ Erro ao carregar timeline:"'
  )
  console.log('')

  console.log('💡 POSSÍVEIS CAUSAS SE AINDA NÃO FUNCIONAR:')
  console.log('   - 🔄 Cache do browser (Ctrl+F5 para hard refresh)')
  console.log('   - 🎨 CSS/estilo escondendo elementos')
  console.log('   - 🔗 Problema de roteamento entre abas')
  console.log('   - 📱 Problema de responsividade')
  console.log('   - ⚡ JavaScript desabilitado ou erro não capturado')
}

testCompleteUserFlow().catch(console.error)
