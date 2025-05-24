// Simulação de interface para o botão "Gerar Timeline"
// Este script simula o comportamento da interface quando o usuário clica no botão

const eventId = '1748087744088' // ID do evento que estamos testando

// Função para simular o clique no botão "Gerar Timeline"
async function simulateButtonClick(eventId) {
  console.log("🖱️ Simulando clique no botão 'Gerar Timeline'...")
  console.log(`🔍 Usando eventId: ${eventId}`)

  try {
    // Passo 1: Verificar se existe um briefing para o evento
    console.log('📋 Verificando briefing...')
    const briefingResponse = await fetch(
      `http://localhost:3001/api/briefings/${eventId}`
    )

    if (!briefingResponse.ok) {
      throw new Error(`Erro ao carregar briefing: ${briefingResponse.status}`)
    }

    const briefingData = await briefingResponse.json()
    console.log('✅ Briefing carregado com sucesso')

    // Passo 2: Enviar solicitação para gerar timeline
    console.log('🔄 Enviando solicitação para gerar timeline...')
    const timelineResponse = await fetch(
      `http://localhost:3001/api/timeline/${eventId}`,
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

    if (!timelineResponse.ok) {
      throw new Error(`Erro ao gerar timeline: ${timelineResponse.status}`)
    }

    const generatedTimeline = await timelineResponse.json()
    console.log('✅ Timeline gerada com sucesso!')
    console.log(
      `📊 A timeline contém ${generatedTimeline.timeline.length} fases`
    )

    // Passo 3: Verificar se a timeline foi salva
    console.log('🔍 Verificando se a timeline foi salva...')
    const checkTimelineResponse = await fetch(
      `http://localhost:3001/api/timeline/${eventId}`
    )

    if (!checkTimelineResponse.ok) {
      throw new Error(
        `Erro ao verificar timeline salva: ${checkTimelineResponse.status}`
      )
    }

    const savedTimeline = await checkTimelineResponse.json()
    console.log('✅ Timeline encontrada no sistema!')
    console.log(
      `📊 A timeline salva contém ${savedTimeline.timeline.length} fases`
    )

    return {
      success: true,
      message: 'Timeline gerada e salva com sucesso!',
      timelineData: savedTimeline,
    }
  } catch (error) {
    console.error('❌ Erro durante o processo:', error.message)
    return {
      success: false,
      message: `Erro: ${error.message}`,
      error,
    }
  }
}

// Executar a simulação
console.log(
  "🚀 Iniciando teste de simulação da interface do botão 'Gerar Timeline'..."
)
console.log(
  '📌 Este teste verifica se o fluxo completo funciona após a correção da nomenclatura'
)

simulateButtonClick(eventId)
  .then(result => {
    if (result.success) {
      console.log('✅✅✅ TESTE COMPLETO COM SUCESSO!')
      console.log(
        "📝 O botão 'Gerar Timeline' está funcionando corretamente após a correção."
      )
    } else {
      console.error('❌ FALHA NO TESTE:', result.message)
    }
  })
  .catch(error => {
    console.error('❌ Erro fatal durante o teste:', error)
  })
