#!/usr/bin/env node

/**
 * Script para depurar problema do botão "Gerar Timeline"
 * e verificar se a timeline está sendo exibida corretamente
 */

const fs = require('fs').promises
const path = require('path')

async function debugFrontendTimeline() {
  console.log('🔍 DEBUG: Frontend Timeline - Verificação Completa\n')

  // 1. Verificar se as APIs estão funcionando
  console.log('1. 🔌 Testando APIs do Backend:')

  const testEventId = 'e556271a-dda7-4559-b9c6-73ea3431f640'
  const baseUrl = 'http://localhost:3001'

  try {
    // Testar API de briefing
    const briefingResponse = await fetch(
      `${baseUrl}/api/briefings/${testEventId}`
    )
    const briefingStatus = briefingResponse.ok ? '✅' : '❌'
    console.log(
      `   ${briefingStatus} GET /api/briefings/${testEventId} - Status: ${briefingResponse.status}`
    )

    // Testar API de timeline GET
    const timelineGetResponse = await fetch(
      `${baseUrl}/api/timeline/${testEventId}`
    )
    const timelineGetStatus = timelineGetResponse.ok ? '✅' : '❌'
    console.log(
      `   ${timelineGetStatus} GET /api/timeline/${testEventId} - Status: ${timelineGetResponse.status}`
    )

    if (timelineGetResponse.ok) {
      const timelineData = await timelineGetResponse.json()
      console.log(
        `   📊 Timeline contains: ${timelineData.timeline?.length || 0} phases`
      )
    }

    // Testar API de timeline POST (geração)
    const timelinePostResponse = await fetch(
      `${baseUrl}/api/timeline/${testEventId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          generateFromBriefing: true,
          briefingData: { eventId: testEventId },
        }),
      }
    )
    const timelinePostStatus = timelinePostResponse.ok ? '✅' : '❌'
    console.log(
      `   ${timelinePostStatus} POST /api/timeline/${testEventId} - Status: ${timelinePostResponse.status}`
    )
  } catch (error) {
    console.log(`   ❌ Erro ao testar APIs: ${error.message}`)
  }

  console.log('')

  // 2. Verificar arquivos de dados
  console.log('2. 📁 Verificando Arquivos de Dados:')

  try {
    const briefingsPath = path.join(process.cwd(), 'data', 'briefings.json')
    const timelinesPath = path.join(process.cwd(), 'data', 'timelines.json')

    const briefingsData = JSON.parse(await fs.readFile(briefingsPath, 'utf-8'))
    const timelinesData = JSON.parse(await fs.readFile(timelinesPath, 'utf-8'))

    const hasBriefing = briefingsData[testEventId] ? '✅' : '❌'
    const hasTimeline = timelinesData[testEventId] ? '✅' : '❌'

    console.log(`   ${hasBriefing} Briefing existe para evento ${testEventId}`)
    console.log(`   ${hasTimeline} Timeline existe para evento ${testEventId}`)

    if (timelinesData[testEventId]) {
      const timelineLength = Array.isArray(timelinesData[testEventId])
        ? timelinesData[testEventId].length
        : 0
      console.log(`   📊 Timeline tem ${timelineLength} fases`)
    }
  } catch (error) {
    console.log(`   ❌ Erro ao ler arquivos: ${error.message}`)
  }

  console.log('')

  // 3. Verificar componentes frontend
  console.log('3. 🎨 Verificando Componentes Frontend:')

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

    const hasHandleFunction = buttonContent.includes('handleGenerateTimeline')
      ? '✅'
      : '❌'
    const hasApiCall = buttonContent.includes('/api/timeline/') ? '✅' : '❌'
    const hasProjectIdCheck = buttonContent.includes('projectId') ? '✅' : '❌'

    console.log(
      `   ${hasHandleFunction} GenerateTimelineButton tem função handleGenerateTimeline`
    )
    console.log(
      `   ${hasApiCall} GenerateTimelineButton faz chamada para API timeline`
    )
    console.log(
      `   ${hasProjectIdCheck} GenerateTimelineButton verifica projectId`
    )

    // Verificar TimelineTab
    const timelineTabPath = path.join(
      process.cwd(),
      'features',
      'briefing',
      'components',
      'TimelineTab.tsx'
    )
    const timelineTabContent = await fs.readFile(timelineTabPath, 'utf-8')

    const hasTimelineState = timelineTabContent.includes('useState<Phase[]>')
      ? '✅'
      : '❌'
    const hasTimelineApi = timelineTabContent.includes('/api/timeline/')
      ? '✅'
      : '❌'
    const hasTimelineFormatCheck = timelineTabContent.includes('data.timeline')
      ? '✅'
      : '❌'

    console.log(`   ${hasTimelineState} TimelineTab tem estado para timeline`)
    console.log(
      `   ${hasTimelineApi} TimelineTab faz chamada para API timeline`
    )
    console.log(
      `   ${hasTimelineFormatCheck} TimelineTab verifica formato data.timeline`
    )
  } catch (error) {
    console.log(`   ❌ Erro ao verificar componentes: ${error.message}`)
  }

  console.log('')

  // 4. Verificar página de briefing
  console.log('4. 📄 Verificando Página de Briefing:')

  try {
    const briefingPagePath = path.join(
      process.cwd(),
      'app',
      'events',
      '[eventId]',
      'briefing',
      'page.tsx'
    )
    const briefingPageContent = await fs.readFile(briefingPagePath, 'utf-8')

    const hasTimelineTab = briefingPageContent.includes('TimelineTab')
      ? '✅'
      : '❌'
    const hasEventIdProp = briefingPageContent.includes('eventId={eventId}')
      ? '✅'
      : '❌'
    const hasTabsConfig = briefingPageContent.includes('TabsTrigger')
      ? '✅'
      : '❌'

    console.log(`   ${hasTimelineTab} Página importa TimelineTab`)
    console.log(`   ${hasEventIdProp} Página passa eventId para TimelineTab`)
    console.log(`   ${hasTabsConfig} Página tem configuração de abas`)
  } catch (error) {
    console.log(`   ❌ Erro ao verificar página: ${error.message}`)
  }

  console.log('')

  // 5. Conclusões e próximos passos
  console.log('5. 🎯 CONCLUSÕES E AÇÕES:')
  console.log('')
  console.log('💡 PARA DEPURAR O PROBLEMA:')
  console.log(
    '   1. Abra http://localhost:3001/events/e556271a-dda7-4559-b9c6-73ea3431f640/briefing'
  )
  console.log('   2. Abra as ferramentas de desenvolvedor (F12)')
  console.log('   3. Vá para aba "Console" para ver logs')
  console.log('   4. Preencha o briefing e clique "Salvar Informações"')
  console.log('   5. Clique "Gerar Timeline"')
  console.log('   6. Vá para aba "Timeline" e veja se aparece')
  console.log('   7. Verifique logs no console por erros')
  console.log('')
  console.log('🔍 LOGS IMPORTANTES PARA PROCURAR:')
  console.log('   - "🔍 GenerateTimelineButton rendered with:"')
  console.log('   - "🚀 handleGenerateTimeline called with projectId:"')
  console.log('   - "📅 Timeline carregada:"')
  console.log('   - "❌ Erro ao carregar timeline:"')
  console.log('')
}

debugFrontendTimeline().catch(console.error)
