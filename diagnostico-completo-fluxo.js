#!/usr/bin/env node

/**
 * Diagnóstico completo do fluxo Briefing → Timeline
 * Este script faz uma análise detalhada de todo o fluxo
 */

const fs = require('fs').promises
const path = require('path')
const { exec } = require('child_process')
const { promisify } = require('util')

const execPromise = promisify(exec)

async function diagnosticoCompletoFluxo() {
  console.log('🔍 DIAGNÓSTICO COMPLETO DO FLUXO BRIEFING → TIMELINE\n')

  const testEventId = 'e556271a-dda7-4559-b9c6-73ea3431f640'
  const baseUrl = 'http://localhost:3001'

  // 1. Verificar arquivos de dados
  console.log('1. 📂 ANÁLISE DE DADOS:')

  try {
    // Verificar briefing
    const briefingsPath = path.join(process.cwd(), 'data', 'briefings.json')
    const briefingsContent = await fs.readFile(briefingsPath, 'utf-8')
    const briefingsData = JSON.parse(briefingsContent)

    const hasBriefing = briefingsData[testEventId] !== undefined
    console.log(
      `   ${hasBriefing ? '✅' : '❌'} Briefing encontrado para evento ${testEventId}`
    )

    if (hasBriefing) {
      const briefing = briefingsData[testEventId]
      console.log(
        `   📝 Briefing info: ${briefing.eventName || 'Nome não definido'}, data: ${briefing.eventDate || 'N/A'}`
      )
    }

    // Verificar timeline
    const timelinesPath = path.join(process.cwd(), 'data', 'timelines.json')
    const timelinesContent = await fs.readFile(timelinesPath, 'utf-8')
    const timelinesData = JSON.parse(timelinesContent)

    const hasTimeline = timelinesData[testEventId] !== undefined
    console.log(
      `   ${hasTimeline ? '✅' : '❌'} Timeline encontrada para evento ${testEventId}`
    )

    if (hasTimeline) {
      const timeline = timelinesData[testEventId]
      console.log(
        `   📅 Timeline: ${Array.isArray(timeline) ? timeline.length : 0} fases`
      )

      if (Array.isArray(timeline) && timeline.length > 0) {
        console.log('   📊 Fases:')
        timeline.forEach((phase, index) => {
          console.log(
            `     ${index + 1}. ${phase.name} (${phase.tasks?.length || 0} tarefas)`
          )
        })
      }
    }
  } catch (error) {
    console.error(`   ❌ Erro ao verificar arquivos: ${error.message}`)
  }

  console.log('\n2. 🌐 TESTE DE APIs:')

  try {
    // Testar GET briefing
    const briefingResponse = await fetch(
      `${baseUrl}/api/briefings/${testEventId}`
    )
    console.log(
      `   ${briefingResponse.ok ? '✅' : '❌'} GET /api/briefings/${testEventId} - Status: ${briefingResponse.status}`
    )

    if (briefingResponse.ok) {
      const briefingData = await briefingResponse.json()
      console.log(
        `   📝 Briefing: ${briefingData.eventName || 'Nome não definido'}`
      )
    }

    // Testar GET timeline
    const timelineResponse = await fetch(
      `${baseUrl}/api/timeline/${testEventId}`
    )
    console.log(
      `   ${timelineResponse.ok ? '✅' : '❌'} GET /api/timeline/${testEventId} - Status: ${timelineResponse.status}`
    )

    if (timelineResponse.ok) {
      const timelineData = await timelineResponse.json()
      console.log(`   📅 Timeline GET response:`)
      console.log(`     - success: ${timelineData.success}`)
      console.log(
        `     - timeline: ${Array.isArray(timelineData.timeline) ? `Array[${timelineData.timeline.length}]` : typeof timelineData.timeline}`
      )
    }

    // Testar POST timeline
    const timelinePostResponse = await fetch(
      `${baseUrl}/api/timeline/${testEventId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ generateFromBriefing: true }),
      }
    )
    console.log(
      `   ${timelinePostResponse.ok ? '✅' : '❌'} POST /api/timeline/${testEventId} - Status: ${timelinePostResponse.status}`
    )

    if (timelinePostResponse.ok) {
      const timelinePostData = await timelinePostResponse.json()
      console.log(`   📅 Timeline POST response:`)
      console.log(`     - success: ${timelinePostData.success}`)
      console.log(`     - message: ${timelinePostData.message}`)
      console.log(
        `     - timeline: ${Array.isArray(timelinePostData.timeline) ? `Array[${timelinePostData.timeline.length}]` : typeof timelinePostData.timeline}`
      )
    }
  } catch (error) {
    console.error(`   ❌ Erro ao testar APIs: ${error.message}`)
  }

  console.log('\n3. 🧩 ANÁLISE DE COMPONENTES:')

  try {
    // Verificar GenerateTimelineButton
    const buttonPath = path.join(
      process.cwd(),
      'features',
      'briefing',
      'components',
      'GenerateTimelineButton.tsx'
    )
    const buttonContent = await fs.readFile(buttonPath, 'utf-8')

    const apiCall = buttonContent.match(/fetch\(`\/api\/timeline\/.*?\)/)
    const modalOpen = buttonContent.includes('setIsOpen')
    const disabledCondition = buttonContent.match(/disabled=\{([^}]+)\}/)

    console.log(
      `   ✅ GenerateTimelineButton - API: ${apiCall ? 'Implementada' : 'Não encontrada'}`
    )
    console.log(
      `   ✅ GenerateTimelineButton - Modal: ${modalOpen ? 'Implementado' : 'Não encontrado'}`
    )

    if (disabledCondition) {
      console.log(
        `   🔍 Condição de desabilitação: ${disabledCondition[1].trim()}`
      )
    }

    // Verificar TimelineTab
    const timelineTabPath = path.join(
      process.cwd(),
      'features',
      'briefing',
      'components',
      'TimelineTab.tsx'
    )
    const timelineTabContent = await fs.readFile(timelineTabPath, 'utf-8')

    const fetchCode = timelineTabContent.match(
      /const\s+response\s*=\s*await\s+fetch\(`\/api\/timeline\/.*?\)/
    )
    const setTimelineLogic = timelineTabContent.match(/setTimeline\(([^)]+)\)/)

    console.log(
      `   ✅ TimelineTab - API Fetch: ${fetchCode ? 'Implementado' : 'Não encontrado'}`
    )
    console.log(
      `   ✅ TimelineTab - setTimeline: ${setTimelineLogic ? setTimelineLogic[1].trim() : 'Não encontrado'}`
    )

    // Verificar formatos esperados
    const formatoArray = timelineTabContent.includes('Array.isArray(data)')
    const formatoTimeline = timelineTabContent.includes('data.timeline')
    const formatoPhases = timelineTabContent.includes('data.phases')

    console.log(`   📊 Formatos esperados na resposta:`)
    console.log(
      `     - Array direto: ${formatoArray ? 'Verificado' : 'Não verificado'}`
    )
    console.log(
      `     - data.timeline: ${formatoTimeline ? 'Verificado' : 'Não verificado'}`
    )
    console.log(
      `     - data.phases: ${formatoPhases ? 'Verificado' : 'Não verificado'}`
    )
  } catch (error) {
    console.error(`   ❌ Erro ao analisar componentes: ${error.message}`)
  }

  console.log('\n4. 🛠️ RECOMENDAÇÕES TÉCNICAS:')

  console.log(`   1. Abra o navegador em modo de desenvolvedor (F12) ao testar`)
  console.log(`   2. Verifique se há mensagens de erro no console ao clicar`)
  console.log(
    `   3. Certifique-se de que o eventId/projectId está sendo passado corretamente`
  )
  console.log(`   4. Verifique o estado do botão (disabled ou não)`)
  console.log(`   5. Garanta que o evento de clique está sendo capturado`)

  console.log('\n5. 📌 PASSOS PARA VERIFICAÇÃO FINAL:')

  console.log(
    `   1. Acesse http://localhost:3001/events/${testEventId}/briefing`
  )
  console.log(`   2. Preencha ou verifique se os dados já estão preenchidos`)
  console.log(`   3. Clique em "Salvar Informações"`)
  console.log(`   4. Clique em "Gerar Timeline"`)
  console.log(`   5. Confira o modal e confirme a geração`)
  console.log(`   6. Vá para a aba "Timeline"`)
  console.log(`   7. Veja se as fases e tarefas aparecem corretamente`)

  console.log('\n✅ DIAGNÓSTICO CONCLUÍDO\n')
}

diagnosticoCompletoFluxo().catch(console.error)
