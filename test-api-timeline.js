#!/usr/bin/env node

/**
 * Script para testar as APIs de briefing e timeline
 */

const http = require('http')
const fs = require('fs')
const path = require('path')

const BASE_URL = 'http://localhost:3000'

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = ''
      res.on('data', (chunk) => body += chunk)
      res.on('end', () => {
        try {
          const response = {
            statusCode: res.statusCode,
            headers: res.headers,
            body: body ? JSON.parse(body) : {}
          }
          resolve(response)
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body
          })
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

async function testAPIs() {
  console.log('🧪 Testando APIs...\n')

  // Ler eventos para obter um ID válido
  const eventsFile = path.join(__dirname, 'data', 'events.json')
  let events = []
  
  try {
    events = JSON.parse(fs.readFileSync(eventsFile, 'utf-8'))
  } catch (error) {
    console.error('❌ Erro ao ler eventos:', error.message)
    return
  }

  if (events.length === 0) {
    console.error('❌ Nenhum evento encontrado')
    return
  }

  const testEventId = events[0].id
  console.log(`📝 Testando com evento: ${testEventId}`)

  // 1. Testar GET do briefing
  try {
    console.log('\n1️⃣ Testando GET /api/briefings/{eventId}...')
    const briefingResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: `/api/briefings/${testEventId}`,
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })

    console.log(`Status: ${briefingResponse.statusCode}`)
    if (briefingResponse.statusCode === 200) {
      console.log('✅ Briefing carregado com sucesso')
      console.log(`📄 Seções: ${Object.keys(briefingResponse.body.sections || {}).join(', ')}`)
    } else {
      console.log('❌ Erro ao carregar briefing:', briefingResponse.body)
    }
  } catch (error) {
    console.log('❌ Erro na requisição do briefing:', error.message)
  }

  // 2. Testar POST para gerar timeline
  try {
    console.log('\n2️⃣ Testando POST /api/timeline/{eventId} (geração automática)...')
    const timelineResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: `/api/timeline/${testEventId}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      generateFromBriefing: true
    })

    console.log(`Status: ${timelineResponse.statusCode}`)
    if (timelineResponse.statusCode === 201 || timelineResponse.statusCode === 200) {
      console.log('✅ Timeline gerada com sucesso')
      console.log(`📊 Fases: ${timelineResponse.body.timeline?.length || 0}`)
      if (timelineResponse.body.timeline && timelineResponse.body.timeline.length > 0) {
        timelineResponse.body.timeline.forEach((phase, index) => {
          console.log(`   ${index + 1}. ${phase.name} (${phase.tasks?.length || 0} tarefas)`)
        })
      }
    } else {
      console.log('❌ Erro ao gerar timeline:', timelineResponse.body)
    }
  } catch (error) {
    console.log('❌ Erro na requisição da timeline:', error.message)
  }

  // 3. Testar GET da timeline
  try {
    console.log('\n3️⃣ Testando GET /api/timeline/{eventId}...')
    const getTimelineResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: `/api/timeline/${testEventId}`,
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })

    console.log(`Status: ${getTimelineResponse.statusCode}`)
    if (getTimelineResponse.statusCode === 200) {
      console.log('✅ Timeline recuperada com sucesso')
      console.log(`📊 Fases: ${getTimelineResponse.body.timeline?.length || 0}`)
      console.log(`🔄 Gerada automaticamente: ${getTimelineResponse.body.isGenerated ? 'Sim' : 'Não'}`)
    } else {
      console.log('❌ Erro ao recuperar timeline:', getTimelineResponse.body)
    }
  } catch (error) {
    console.log('❌ Erro na requisição GET da timeline:', error.message)
  }

  console.log('\n🎉 Teste das APIs concluído!')
}

// Aguardar 2 segundos para garantir que o servidor esteja pronto
setTimeout(testAPIs, 2000)
