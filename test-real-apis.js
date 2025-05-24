#!/usr/bin/env node

/**
 * Script para testar as APIs reais da aplicação
 * Testa se as rotas estão respondendo corretamente
 */

const http = require('http')

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
          const parsed = JSON.parse(body)
          resolve({ status: res.statusCode, data: parsed })
        } catch (e) {
          resolve({ status: res.statusCode, data: body })
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

async function testApiRoutes() {
  console.log('🧪 TESTE DAS ROTAS API REAIS')
  console.log('===========================\n')

  const testEventId = 'test-event-1748081458939'

  try {
    // 1. Testar busca de briefing
    console.log('📋 Testando GET /api/briefings/[eventId]...')
    const briefingResponse = await makeRequest(`/api/briefings/${testEventId}`)
    console.log(`Status: ${briefingResponse.status}`)
    if (briefingResponse.status === 200) {
      console.log('✅ Briefing encontrado:', !!briefingResponse.data.eventName)
      console.log(`   Nome: ${briefingResponse.data.eventName}`)
      console.log(`   Data: ${briefingResponse.data.eventDate}`)
    } else {
      console.log('❌ Erro ao buscar briefing')
    }

    // 2. Testar busca de timeline
    console.log('\n📅 Testando GET /api/timeline/[eventId]...')
    const timelineResponse = await makeRequest(`/api/timeline/${testEventId}`)
    console.log(`Status: ${timelineResponse.status}`)
    if (timelineResponse.status === 200) {
      console.log('✅ Timeline encontrada:', !!timelineResponse.data.phases)
      console.log(`   Fases: ${timelineResponse.data.phases?.length || 0}`)
      if (timelineResponse.data.phases?.length > 0) {
        console.log(`   Primeira fase: ${timelineResponse.data.phases[0].name}`)
      }
    } else {
      console.log('❌ Erro ao buscar timeline')
    }

    // 3. Testar geração de nova timeline
    console.log('\n⚡ Testando POST /api/timeline/[eventId]...')
    const generateResponse = await makeRequest(
      `/api/timeline/${testEventId}`,
      'POST'
    )
    console.log(`Status: ${generateResponse.status}`)
    if (generateResponse.status === 200) {
      console.log('✅ Timeline gerada com sucesso')
      console.log(`   Fases: ${generateResponse.data.phases?.length || 0}`)
    } else {
      console.log('❌ Erro ao gerar timeline')
      console.log('Resposta:', generateResponse.data)
    }
  } catch (error) {
    console.error('❌ Erro durante os testes:', error.message)
  }
}

testApiRoutes()
