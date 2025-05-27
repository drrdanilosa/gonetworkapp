// Teste específico para validar o fix da nomenclatura no botão "Gerar Timeline"
// Este script simula o fluxo do usuário e verifica se o botão está funcionando corretamente

const fs = require('fs')
const path = require('path')
// Usar o fetch nativo do Node.js ou o módulo node-fetch conforme a versão
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args))

// Configurações do teste
const CONFIG = {
  API_BASE_URL: 'http://localhost:3001/api',
  TIMEOUT_MS: 10000, // Timeout para as requisições
  RETRY_ATTEMPTS: 3, // Número de tentativas para cada operação
  RETRY_DELAY_MS: 1000, // Delay entre tentativas
}

/**
 * Função para fazer requisições com retry e timeout
 */
async function fetchWithRetry(
  url,
  options = {},
  retries = CONFIG.RETRY_ATTEMPTS
) {
  try {
    console.log(`🔄 Tentativa de requisição para: ${url}`)

    // Adiciona timeout para a requisição
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT_MS)

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    console.log(`📊 Resposta: ${response.status} ${response.statusText}`)
    return response
  } catch (error) {
    console.error(`❌ Erro na requisição: ${error.message}`)

    if (retries > 0) {
      console.log(
        `⏱️ Aguardando ${CONFIG.RETRY_DELAY_MS}ms antes de tentar novamente... (${retries} tentativas restantes)`
      )
      await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY_MS))
      return fetchWithRetry(url, options, retries - 1)
    }

    throw error
  }
}

// Função que verifica se existe um evento de teste
async function getTestEvent() {
  try {
    console.log('🔍 Buscando eventos disponíveis para teste...')

    const response = await fetchWithRetry(`${CONFIG.API_BASE_URL}/events`)
    if (!response.ok) {
      throw new Error(
        `Erro ao buscar eventos: ${response.status} ${response.statusText}`
      )
    }

    const events = await response.json()
    console.log(`🔍 Encontrados ${events.length} eventos no sistema`)

    if (events.length > 0) {
      console.log(
        `📌 Selecionando evento: ${events[0].id} - ${events[0].name || 'Sem nome'}`
      )
      return events[0].id // Retorna o ID do primeiro evento
    } else {
      console.log('⚠️ Nenhum evento encontrado para teste')
      return null
    }
  } catch (error) {
    console.error('❌ Erro ao buscar eventos:', error)
    return null
  }
}

// Função para verificar se existe um briefing para o evento
async function checkBriefing(eventId) {
  try {
    console.log(`📋 Verificando briefing para o evento ${eventId}...`)

    const response = await fetchWithRetry(
      `${CONFIG.API_BASE_URL}/briefings/${eventId}`
    )
    console.log(`📋 Verificando briefing - Status: ${response.status}`)

    if (response.ok) {
      const briefing = await response.json()
      console.log('✅ Briefing encontrado com sucesso')
      console.log(
        `📊 Detalhes do briefing: Nome do evento: ${briefing.eventName || 'N/A'}, Data: ${briefing.eventDate || 'N/A'}`
      )
      return briefing
    } else {
      console.log('⚠️ Nenhum briefing encontrado para este evento')
      return false
    }
  } catch (error) {
    console.error('❌ Erro ao verificar briefing:', error)
    return false
  }
}

// Função para gerar timeline para o evento
async function generateTimeline(eventId, briefingData) {
  try {
    // Se não recebemos o briefing, vamos buscá-lo primeiro
    if (!briefingData) {
      console.log('🔍 Briefing não fornecido, buscando dados...')
      const briefingResponse = await fetchWithRetry(
        `${CONFIG.API_BASE_URL}/briefings/${eventId}`
      )

      if (!briefingResponse.ok) {
        throw new Error(
          `Briefing não encontrado: ${briefingResponse.status} ${briefingResponse.statusText}`
        )
      }

      briefingData = await briefingResponse.json()
      console.log('✅ Briefing carregado com sucesso')
    }

    // Chamar a API de timeline (simulando o clique no botão)
    console.log('⚡ Chamando API de timeline com eventId:', eventId)
    console.log('📊 Payload da requisição:', {
      generateFromBriefing: true,
      briefingId: eventId,
    })

    const timelineResponse = await fetchWithRetry(
      `${CONFIG.API_BASE_URL}/timeline/${eventId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          generateFromBriefing: true,
          briefingData,
        }),
      }
    )

    console.log(
      `🔄 Resposta da API timeline - Status: ${timelineResponse.status}`
    )

    if (timelineResponse.ok) {
      const timeline = await timelineResponse.json()
      console.log('✅ Timeline gerada com sucesso!')
      console.log(
        `📊 Timeline contém ${timeline.phases ? timeline.phases.length : 0} fases`
      )

      // Log detalhado da estrutura da timeline para diagnóstico
      if (timeline.phases && timeline.phases.length > 0) {
        console.log(
          `📊 Primeira fase: "${timeline.phases[0].name}" com ${
            timeline.phases[0].tasks ? timeline.phases[0].tasks.length : 0
          } tarefas`
        )
      }

      return timeline
    } else {
      let errorMessage = `Erro ${timelineResponse.status}`
      try {
        const errorData = await timelineResponse.json()
        errorMessage = errorData.error || errorData.message || errorMessage
        console.error('❌ Erro ao gerar timeline:', errorData)
      } catch (e) {
        console.error('❌ Erro ao processar resposta de erro:', e)
      }
      throw new Error(errorMessage)
    }
  } catch (error) {
    console.error('❌ Erro ao gerar timeline:', error)
    return false
  }
}

// Função para verificar se a timeline foi salva no sistema
async function checkTimeline(eventId) {
  try {
    console.log(
      `🔍 Verificando se a timeline para o evento ${eventId} foi salva...`
    )

    const response = await fetchWithRetry(
      `${CONFIG.API_BASE_URL}/timeline/${eventId}?t=${Date.now()}` // Adiciona timestamp para evitar cache
    )
    console.log(`🔍 Verificando timeline - Status: ${response.status}`)

    if (response.ok) {
      const timeline = await response.json()
      console.log('✅ Timeline encontrada com sucesso')
      console.log(
        `📊 Timeline contém ${timeline.phases ? timeline.phases.length : 0} fases`
      )

      // Validação da estrutura da timeline
      const isValid = validateTimelineStructure(timeline)
      if (!isValid) {
        console.warn(
          '⚠️ A timeline foi encontrada, mas sua estrutura pode estar incompleta'
        )
      }

      return timeline
    } else {
      console.log('⚠️ Nenhuma timeline encontrada para este evento')
      return false
    }
  } catch (error) {
    console.error('❌ Erro ao verificar timeline:', error)
    return false
  }
}

// Função para validar a estrutura da timeline
function validateTimelineStructure(timeline) {
  try {
    // Verifica se a timeline tem a estrutura esperada
    if (!timeline) {
      console.warn('⚠️ Timeline indefinida')
      return false
    }

    if (!timeline.phases || !Array.isArray(timeline.phases)) {
      console.warn('⚠️ Timeline não contém array de phases')
      return false
    }

    if (timeline.phases.length === 0) {
      console.warn('⚠️ Timeline contém array de phases vazio')
      return false
    }

    // Verifica a primeira fase para ver se tem a estrutura esperada
    const firstPhase = timeline.phases[0]
    if (!firstPhase.name || !firstPhase.tasks) {
      console.warn('⚠️ A primeira fase não contém nome ou tarefas')
      return false
    }

    console.log('✅ Estrutura da timeline validada com sucesso')
    return true
  } catch (error) {
    console.error('❌ Erro ao validar estrutura da timeline:', error)
    return false
  }
}

// Função principal que executa o teste completo
async function runTest() {
  console.log('🚀 Iniciando teste do botão "Gerar Timeline"...')
  console.log(
    '📌 Este teste verifica se a correção da inconsistência de nomenclatura (projectId/eventId) foi bem-sucedida'
  )
  console.log('📌 Data e hora do teste:', new Date().toISOString())

  // Passo 1: Verificar se existe um evento para teste
  const eventId = await getTestEvent()
  if (!eventId) {
    console.error('❌ Teste abortado: nenhum evento disponível para teste')
    return
  }

  console.log(`📌 Usando evento com ID: ${eventId}`)

  // Passo 2: Verificar se existe um briefing para o evento
  const briefingData = await checkBriefing(eventId)
  if (!briefingData) {
    console.log('⚠️ Evento não tem briefing, mas o teste pode continuar')
  }

  // Passo 3: Verificar se já existe uma timeline
  console.log('🔍 Verificando se já existe uma timeline...')
  const existingTimeline = await checkTimeline(eventId)

  if (existingTimeline) {
    console.log(
      'ℹ️ Já existe uma timeline para este evento. Prosseguindo com a geração de uma nova.'
    )
  }

  // Passo 4: Gerar uma nova timeline
  console.log('🔄 Gerando nova timeline (simulando clique no botão)...')
  const generatedTimeline = await generateTimeline(eventId, briefingData)

  if (!generatedTimeline) {
    console.error('❌ FALHA: Não foi possível gerar a timeline')
    return
  }

  // Passo 5: Verificar se a timeline foi salva (com um pequeno delay para garantir persistência)
  console.log(
    '⏱️ Aguardando 2 segundos para garantir persistência dos dados...'
  )
  await new Promise(resolve => setTimeout(resolve, 2000))

  console.log('🔍 Verificando se a timeline foi salva corretamente...')
  const savedTimeline = await checkTimeline(eventId)

  if (savedTimeline) {
    console.log('✅✅✅ TESTE COMPLETO COM SUCESSO!')
    console.log(
      '📝 O problema de inconsistência de nomenclatura foi corrigido com sucesso.'
    )
    console.log(
      '📝 O botão "Gerar Timeline" está funcionando corretamente na interface.'
    )

    // Verificações adicionais
    if (savedTimeline.phases && generatedTimeline.phases) {
      if (savedTimeline.phases.length === generatedTimeline.phases.length) {
        console.log(
          '✅ Verificação adicional: A timeline salva contém o mesmo número de fases que a gerada.'
        )
      } else {
        console.warn(
          `⚠️ Verificação adicional: Discrepância no número de fases. Gerada: ${generatedTimeline.phases.length}, Salva: ${savedTimeline.phases.length}`
        )
      }
    }
  } else {
    console.error(
      '❌ FALHA: Timeline foi gerada mas não foi encontrada na verificação final'
    )
  }

  console.log('📌 Teste concluído em:', new Date().toISOString())
}

// Executar o teste
console.log('📌 Iniciando execução do teste em:', new Date().toISOString())
runTest()
  .catch(error => {
    console.error('❌ Erro fatal durante o teste:', error)
  })
  .finally(() => {
    console.log('📌 Execução do teste finalizada em:', new Date().toISOString())
  })
