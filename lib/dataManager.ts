import fs from 'fs/promises'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const EVENTS_FILE = path.join(DATA_DIR, 'events.json')
const BRIEFINGS_FILE = path.join(DATA_DIR, 'briefings.json')

// Garantir que o diretório existe
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
  } catch (error) {
    console.error('Erro ao criar diretório de dados:', error)
  }
}

// Funções para Eventos
export async function readEventsData() {
  try {
    await ensureDataDir()
    const data = await fs.readFile(EVENTS_FILE, 'utf-8')
    const events = JSON.parse(data)
    return Array.isArray(events) ? events : []
  } catch (error) {
    // Se arquivo não existe, retorna array vazio
    return []
  }
}

export async function saveEventsData(events: any[]) {
  try {
    await ensureDataDir()
    await fs.writeFile(EVENTS_FILE, JSON.stringify(events, null, 2))
    console.log(`📁 Salvos ${events.length} eventos em ${EVENTS_FILE}`)
  } catch (error) {
    console.error('Erro ao salvar dados de eventos:', error)
    throw error
  }
}

export async function findEventById(eventId: string) {
  const events = await readEventsData()
  return events.find(event => event.id === eventId)
}

// Funções para Briefings
export async function readBriefingsData() {
  try {
    await ensureDataDir()
    const data = await fs.readFile(BRIEFINGS_FILE, 'utf-8')
    const briefings = JSON.parse(data)
    return typeof briefings === 'object' ? briefings : {}
  } catch (error) {
    return {}
  }
}

export async function saveBriefingsData(briefings: Record<string, any>) {
  try {
    await ensureDataDir()
    await fs.writeFile(BRIEFINGS_FILE, JSON.stringify(briefings, null, 2))
    console.log(`📁 Briefings salvos em ${BRIEFINGS_FILE}`)
  } catch (error) {
    console.error('Erro ao salvar briefings:', error)
    throw error
  }
}
