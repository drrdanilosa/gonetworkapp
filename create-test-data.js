const fs = require('fs').promises
const path = require('path')

async function createTestData() {
  console.log('🔧 Criando dados de teste...')

  try {
    // Dados de briefing de teste
    const briefingData = {
      'e556271a-dda7-4559-b9c6-73ea3431f640': {
        eventId: 'e556271a-dda7-4559-b9c6-73ea3431f640',
        eventName: 'Teste Debug',
        eventDate: '2025-05-23T07:35:42.384Z',
        eventLocation: 'Local de Teste',
        sponsors: [
          {
            id: 'sponsor-1',
            name: 'Sponsor Principal',
            actions: [
              {
                id: 'action-1',
                name: 'Apresentação da marca',
                captureTime: '14:30',
                isRealTime: true,
                rtDeliveryTime: '15:00',
              },
            ],
          },
        ],
        stages: [
          {
            id: 'stage-1',
            name: 'Palco Principal',
            attractions: [
              {
                id: 'attraction-1',
                name: 'Show Principal',
                type: 'musical',
                duration: 90,
                startTime: '20:00',
              },
            ],
          },
        ],
        realTimeDeliveries: [
          {
            id: 'rt-1',
            title: 'Entrega Tempo Real 1',
            deliveryTime: '15:00',
            type: 'social',
          },
        ],
        postEventNotes: 'Observações pós-evento de teste',
      },
    }

    // Salvar briefing
    const briefingsFile = path.join(__dirname, 'data', 'briefings.json')
    await fs.writeFile(briefingsFile, JSON.stringify(briefingData, null, 2))
    console.log('✅ Briefing salvo!')

    // Verificar se foi salvo
    const saved = await fs.readFile(briefingsFile, 'utf-8')
    const parsed = JSON.parse(saved)
    console.log(`📊 Briefings salvos: ${Object.keys(parsed).length}`)
  } catch (error) {
    console.error('❌ Erro:', error)
  }
}

createTestData()
