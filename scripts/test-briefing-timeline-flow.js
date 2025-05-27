#!/usr/bin/env node

/**
 * Script de teste para validar o fluxo completo:
 * Briefing → Save → Generate Timeline → Visualização
 */

const fs = require('fs').promises
const path = require('path')

const BRIEFINGS_FILE = path.join(__dirname, 'data', 'briefings.json')
const TIMELINES_FILE = path.join(__dirname, 'data', 'timelines.json')
const EVENTS_FILE = path.join(__dirname, 'data', 'events.json')

console.log('🧪 TESTE DE FLUXO BRIEFING → TIMELINE')
console.log('=====================================\n')

async function readJsonFile(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error(`❌ Erro ao ler ${filePath}:`, error.message)
    return null
  }
}

async function testBriefingData() {
  console.log('📋 TESTE 1: Verificando dados de briefing salvos')
  console.log('---------------------------------------------')

  const briefings = await readJsonFile(BRIEFINGS_FILE)
  if (!briefings) return false

  const eventIds = Object.keys(briefings)
  console.log(`✅ Encontrados ${eventIds.length} briefings salvos`)

  eventIds.forEach(eventId => {
    const briefing = briefings[eventId]
    console.log(`\n📝 Briefing: ${eventId}`)
    console.log(`   Nome do evento: ${briefing.eventName || 'N/A'}`)
    console.log(`   Data: ${briefing.eventDate || 'N/A'}`)
    console.log(`   Local: ${briefing.eventLocation || 'N/A'}`)
    console.log(`   Sponsors: ${briefing.sponsors?.length || 0}`)
    console.log(`   Palcos: ${briefing.stages?.length || 0}`)
    console.log(`   Entregas RT: ${briefing.realTimeDeliveries?.length || 0}`)
  })

  return eventIds.length > 0
}

async function testTimelineData() {
  console.log('\n⏰ TESTE 2: Verificando timelines geradas')
  console.log('---------------------------------------')

  const timelines = await readJsonFile(TIMELINES_FILE)
  if (!timelines) return false

  const timelineIds = Object.keys(timelines).filter(key => key !== '_metadata')
  console.log(`✅ Encontradas ${timelineIds.length} timelines salvas`)

  timelineIds.forEach(eventId => {
    const timeline = timelines[eventId]
    if (Array.isArray(timeline)) {
      console.log(`\n🗓️ Timeline: ${eventId}`)
      console.log(`   Fases: ${timeline.length}`)
      timeline.forEach((phase, index) => {
        console.log(`   ${index + 1}. ${phase.name} (${phase.status})`)
        console.log(`      Tarefas: ${phase.tasks?.length || 0}`)
      })
    }
  })

  return timelineIds.length > 0
}

async function testBriefingToTimelineConnection() {
  console.log('\n🔗 TESTE 3: Verificando conexão briefing → timeline')
  console.log('------------------------------------------------')

  const briefings = await readJsonFile(BRIEFINGS_FILE)
  const timelines = await readJsonFile(TIMELINES_FILE)

  if (!briefings || !timelines) return false

  const briefingIds = Object.keys(briefings)
  const timelineIds = Object.keys(timelines).filter(key => key !== '_metadata')

  let matchingPairs = 0

  briefingIds.forEach(eventId => {
    const hasBriefing = briefings[eventId]
    const hasTimeline = timelines[eventId]

    if (hasBriefing && hasTimeline) {
      matchingPairs++
      console.log(`✅ ${eventId}: Briefing + Timeline OK`)

      // Verificar se timeline foi baseada no briefing
      const briefing = briefings[eventId]
      const timeline = timelines[eventId]

      if (Array.isArray(timeline)) {
        const hasEventDateBasedTasks = timeline.some(phase =>
          phase.tasks?.some(
            task =>
              task.description?.includes('briefing') ||
              task.name?.includes('sponsors') ||
              task.name?.includes('palcos')
          )
        )

        if (hasEventDateBasedTasks) {
          console.log(`   🎯 Timeline baseada nos dados do briefing`)
        } else {
          console.log(
            `   ⚠️ Timeline parece genérica (não baseada no briefing)`
          )
        }
      }
    } else if (hasBriefing && !hasTimeline) {
      console.log(`❌ ${eventId}: Briefing salvo mas timeline NÃO gerada`)
    } else if (!hasBriefing && hasTimeline) {
      console.log(`⚠️ ${eventId}: Timeline existe mas briefing não encontrado`)
    }
  })

  console.log(
    `\n📊 Resultado: ${matchingPairs}/${briefingIds.length} briefings têm timeline correspondente`
  )
  return matchingPairs > 0
}

async function identifyIssues() {
  console.log('\n🔍 TESTE 4: Identificando problemas específicos')
  console.log('---------------------------------------------')

  const issues = []

  // Verificar se arquivos existem
  try {
    await fs.access(BRIEFINGS_FILE)
    console.log('✅ Arquivo briefings.json existe')
  } catch {
    issues.push('❌ Arquivo briefings.json não encontrado')
  }

  try {
    await fs.access(TIMELINES_FILE)
    console.log('✅ Arquivo timelines.json existe')
  } catch {
    issues.push('❌ Arquivo timelines.json não encontrado')
  }

  try {
    await fs.access(EVENTS_FILE)
    console.log('✅ Arquivo events.json existe')
  } catch {
    issues.push('❌ Arquivo events.json não encontrado')
  }

  // Verificar estrutura dos dados
  const briefings = await readJsonFile(BRIEFINGS_FILE)
  if (briefings) {
    const briefingIds = Object.keys(briefings)
    if (briefingIds.length === 0) {
      issues.push('⚠️ Nenhum briefing salvo encontrado')
    } else {
      briefingIds.forEach(id => {
        const briefing = briefings[id]
        if (!briefing.eventDate) {
          issues.push(`⚠️ Briefing ${id}: Data do evento ausente`)
        }
        if (!briefing.eventName) {
          issues.push(`⚠️ Briefing ${id}: Nome do evento ausente`)
        }
      })
    }
  }

  if (issues.length > 0) {
    console.log('\n🚨 PROBLEMAS IDENTIFICADOS:')
    issues.forEach(issue => console.log(`   ${issue}`))
  } else {
    console.log('\n✅ Nenhum problema estrutural encontrado')
  }

  return issues
}

async function runTests() {
  try {
    const briefingTest = await testBriefingData()
    const timelineTest = await testTimelineData()
    const connectionTest = await testBriefingToTimelineConnection()
    const issues = await identifyIssues()

    console.log('\n📋 RESUMO FINAL DOS TESTES')
    console.log('=========================')
    console.log(`Briefings salvos: ${briefingTest ? '✅' : '❌'}`)
    console.log(`Timelines geradas: ${timelineTest ? '✅' : '❌'}`)
    console.log(`Conexão briefing→timeline: ${connectionTest ? '✅' : '❌'}`)
    console.log(`Problemas encontrados: ${issues.length}`)

    if (!briefingTest) {
      console.log('\n🔧 AÇÃO NECESSÁRIA: Verificar salvamento de briefings')
      console.log('   - API /api/briefings/[eventId] PUT não está funcionando?')
      console.log(
        '   - BriefingWidget.handleSaveBriefing não está sendo chamado?'
      )
    }

    if (!timelineTest) {
      console.log('\n🔧 AÇÃO NECESSÁRIA: Verificar geração de timelines')
      console.log('   - API /api/timeline/[eventId] POST não está funcionando?')
      console.log('   - GenerateTimelineButton não está funcionando?')
    }

    if (!connectionTest && briefingTest) {
      console.log(
        '\n🔧 AÇÃO NECESSÁRIA: Briefings salvos mas timelines não geradas'
      )
      console.log('   - Botão "Generate Timeline" não está sendo clicado?')
      console.log('   - API de timeline não está usando dados do briefing?')
    }
  } catch (error) {
    console.error('❌ Erro durante execução dos testes:', error)
  }
}

runTests()
