// scripts/create-example-projects.js
const axios = require('axios')

const API_BASE_URL = 'http://localhost:3001/api'

async function createExampleProjects() {
  try {
    console.log('Criando projetos de exemplo...')

    // Projeto 1 - Evento Corporativo
    const project1 = await axios.post(`${API_BASE_URL}/events`, {
      title: 'Evento Corporativo',
      client: 'Empresa ABC',
      date: '2025-06-15T15:00:00',
      team: [
        { name: 'João Silva', role: 'Diretor' },
        { name: 'Maria Oliveira', role: 'Cinegrafista' },
      ],
      description: 'Evento corporativo para lançamento de produto',
      tags: ['corporativo', 'lançamento', 'presencial'],
    })

    console.log(`Projeto 1 criado: ${project1.data.event?.id || 'sem ID'}`)

    // Projeto 2 - Casamento
    const project2 = await axios.post(`${API_BASE_URL}/events`, {
      title: 'Casamento Ana & Carlos',
      client: 'Ana Silva',
      date: '2025-08-20T17:00:00',
      team: [
        { name: 'Pedro Souza', role: 'Coordenador' },
        { name: 'Júlia Costa', role: 'Cinegrafista' },
        { name: 'Roberto Alves', role: 'Assistente' },
      ],
      description: 'Casamento na praia com cerimônia ao pôr do sol',
      tags: ['casamento', 'praia', 'filmagem'],
    })

    console.log(`Projeto 2 criado: ${project2.data.event?.id || 'sem ID'}`)

    // Projeto 3 - Evento Esportivo
    const project3 = await axios.post(`${API_BASE_URL}/events`, {
      title: 'Campeonato Regional',
      client: 'Liga Esportiva',
      date: '2025-07-10T09:00:00',
      team: [
        { name: 'Fernando Gomes', role: 'Diretor' },
        { name: 'Carolina Dias', role: 'Cinegrafista' },
        { name: 'Marcelo Santos', role: 'Editor' },
      ],
      description: 'Cobertura completa do campeonato regional de futebol',
      tags: ['esporte', 'futebol', 'campeonato', 'transmissão'],
    })

    console.log(`Projeto 3 criado: ${project3.data.event?.id || 'sem ID'}`)

    console.log('Projetos de exemplo criados com sucesso!')
  } catch (error) {
    console.error('Erro ao criar projetos de exemplo:', error.message)
    if (error.response) {
      console.error('Detalhes da resposta:', error.response.data)
      console.error('Status:', error.response.status)
    }
  }
}

// Executar a função
createExampleProjects()
