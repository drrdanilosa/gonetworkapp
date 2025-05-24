const fs = require('fs')
const path = require('path')

const EVENTS_FILE = path.join(__dirname, 'data', 'events.json')
const BRIEFINGS_FILE = path.join(__dirname, 'data', 'briefings.json')

function validateEvents() {
  let ok = true
  if (!fs.existsSync(EVENTS_FILE)) {
    console.error('❌ Arquivo events.json não encontrado!')
    return false
  }
  const data = fs.readFileSync(EVENTS_FILE, 'utf8')
  let events
  try {
    events = JSON.parse(data)
  } catch (e) {
    console.error('❌ events.json não é um JSON válido!')
    return false
  }
  if (!Array.isArray(events)) {
    console.error('❌ events.json não é um array!')
    return false
  }
  for (const event of events) {
    if (!event.id || !event.title) {
      console.error('❌ Evento inválido:', event)
      ok = false
    }
    if (event.name) {
      console.error('❌ Evento com campo "name" (deve ser "title"):', event)
      ok = false
    }
    if (!event.createdAt || !event.updatedAt) {
      console.error('❌ Evento sem createdAt/updatedAt:', event)
      ok = false
    }
  }
  if (ok) {
    console.log('✅ events.json está consistente!')
  }
  return ok
}

function validateBriefings() {
  let ok = true
  if (!fs.existsSync(BRIEFINGS_FILE)) {
    console.error('❌ Arquivo briefings.json não encontrado!')
    return false
  }
  const data = fs.readFileSync(BRIEFINGS_FILE, 'utf8')
  let briefings
  try {
    briefings = JSON.parse(data)
  } catch (e) {
    console.error('❌ briefings.json não é um JSON válido!')
    return false
  }
  if (Array.isArray(briefings)) {
    if (briefings.length === 0) {
      console.log('⚠️ briefings.json está vazio (ok se nenhum briefing criado ainda)')
    } else {
      for (const b of briefings) {
        if (!b.eventId) {
          console.error('❌ Briefing sem eventId:', b)
          ok = false
        }
      }
    }
  } else if (typeof briefings === 'object') {
    // formato dicionário
    for (const key in briefings) {
      if (!briefings[key].eventId) {
        console.error('❌ Briefing sem eventId:', briefings[key])
        ok = false
      }
    }
  } else {
    console.error('❌ briefings.json não é array nem objeto!')
    ok = false
  }
  if (ok) {
    console.log('✅ briefings.json está consistente!')
  }
  return ok
}

console.log('--- Validação de Consistência ---')
const eventsOk = validateEvents()
const briefingsOk = validateBriefings()
if (eventsOk && briefingsOk) {
  console.log('🎉 Dados consistentes!')
} else {
  console.log('⚠️ Inconsistências encontradas! Corrija antes de prosseguir.')
}
