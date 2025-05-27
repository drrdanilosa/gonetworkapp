const fs = require('fs')
const path = require('path')

console.log('🔍 Verificando dados dos projetos...\n')

// Verificar arquivo de eventos
const eventsPath = path.join(__dirname, 'data', 'events.json')
if (fs.existsSync(eventsPath)) {
  const events = JSON.parse(fs.readFileSync(eventsPath, 'utf8'))
  console.log(`📊 Total de eventos encontrados: ${events.length}`)

  // Procurar eventos com timeline
  const eventsWithTimeline = events.filter(
    event => event.timeline && event.timeline.length > 0
  )
  console.log(`📈 Eventos com timeline: ${eventsWithTimeline.length}`)

  if (eventsWithTimeline.length > 0) {
    console.log('\n📋 Eventos com timeline:')
    eventsWithTimeline.forEach(event => {
      console.log(
        `- ${event.id}: ${event.title} (${event.timeline.length} fases)`
      )
      console.log(
        `  Timeline: ${event.timeline.map(phase => phase.name).join(', ')}`
      )
    })
  }

  // Mostrar alguns eventos recentes
  console.log('\n📝 Últimos 5 eventos:')
  events.slice(-5).forEach(event => {
    console.log(
      `- ${event.id}: ${event.title} ${event.timeline ? `(${event.timeline.length} fases)` : '(sem timeline)'}`
    )
  })
} else {
  console.log('❌ Arquivo events.json não encontrado')
}

// Verificar arquivo de briefings
const briefingsPath = path.join(__dirname, 'data', 'briefings.json')
if (fs.existsSync(briefingsPath)) {
  const briefings = JSON.parse(fs.readFileSync(briefingsPath, 'utf8'))
  console.log(`\n📋 Total de briefings encontrados: ${briefings.length}`)

  // Mostrar briefings recentes
  if (briefings.length > 0) {
    console.log('\n📝 Últimos 3 briefings:')
    briefings.slice(-3).forEach(briefing => {
      console.log(`- ${briefing.eventId}: ${briefing.title || 'Sem título'}`)
    })
  }
} else {
  console.log('\n❌ Arquivo briefings.json não encontrado')
}
