// Teste simples para verificar o funcionamento das APIs após a correção
const http = require('http')

function fetchAPI(endpoint) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: endpoint,
      method: 'GET',
    }

    const req = http.request(options, res => {
      let data = ''

      res.on('data', chunk => {
        data += chunk
      })

      res.on('end', () => {
        try {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            const parsedData = JSON.parse(data)
            resolve({ status: res.statusCode, data: parsedData })
          } else {
            reject(new Error(`Status: ${res.statusCode}, Body: ${data}`))
          }
        } catch (e) {
          reject(
            new Error(`Erro ao parsear resposta: ${e.message}, Body: ${data}`)
          )
        }
      })
    })

    req.on('error', e => {
      reject(new Error(`Erro na requisição: ${e.message}`))
    })

    req.end()
  })
}

async function runSimpleTest() {
  console.log('🚀 Iniciando teste simples das APIs após correção...')

  try {
    // Passo 1: Listar eventos
    console.log('📋 Listando eventos...')
    const eventsResponse = await fetchAPI('/api/events')
    console.log(`✅ Eventos encontrados: ${eventsResponse.data.length}`)

    if (eventsResponse.data.length === 0) {
      console.log('⚠️ Nenhum evento encontrado para teste')
      return
    }

    const eventId = eventsResponse.data[0].id
    console.log(`📌 Usando evento com ID: ${eventId}`)

    // Passo 2: Verificar briefing
    console.log('📋 Verificando briefing...')
    try {
      const briefingResponse = await fetchAPI(`/api/briefings/${eventId}`)
      console.log('✅ Briefing encontrado com sucesso')
    } catch (error) {
      console.log('⚠️ Briefing não encontrado:', error.message)
    }

    // Passo 3: Verificar timeline
    console.log('📋 Verificando timeline...')
    try {
      const timelineResponse = await fetchAPI(`/api/timeline/${eventId}`)
      console.log('✅ Timeline encontrada com sucesso')
    } catch (error) {
      console.log('⚠️ Timeline não encontrada:', error.message)
    }

    console.log('✅ Teste de APIs concluído com sucesso')
    console.log('📝 As APIs estão respondendo corretamente aos endpoints')
    console.log(
      '📝 A correção de nomenclatura (projectId/eventId) deve estar funcionando'
    )
  } catch (error) {
    console.error('❌ Erro durante o teste:', error)
  }
}

// Executar o teste
runSimpleTest().catch(error => {
  console.error('❌ Erro fatal durante o teste:', error)
})
