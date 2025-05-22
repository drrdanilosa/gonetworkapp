// scripts/create-example-projects-direct.js
/**
 * Este script cria projetos de exemplo diretamente no store do Zustand
 * sem depender da API, útil para testes rápidos.
 */

const fs = require('fs')
const path = require('path')
const { v4: uuidv4 } = require('uuid')

// Função para criar projetos de exemplo
function createExampleProjects() {
  try {
    console.log('Criando projetos de exemplo diretamente no store...')

    // Caminho para o arquivo de armazenamento do Zustand (localStorage simulado no server)
    const storePath = path.join(__dirname, '..', 'store-data.json')

    // Criar estrutura de dados inicial se não existir
    let storeData = {
      state: {
        projects: [],
        currentProject: null,
        comments: [],
        annotations: [],
        assets: [],
      },
    }

    // Verificar se o arquivo já existe
    if (fs.existsSync(storePath)) {
      const fileContent = fs.readFileSync(storePath, 'utf8')
      try {
        storeData = JSON.parse(fileContent)
      } catch (error) {
        console.warn(
          'Arquivo de store existente está corrompido, criando novo.'
        )
      }
    }

    // Projetos de exemplo
    const exampleProjects = [
      {
        id: 'projeto-1',
        title: 'Evento Corporativo',
        client: 'Empresa ABC',
        date: '2025-06-15T15:00:00Z',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        team: [
          {
            id: uuidv4(),
            name: 'João Silva',
            role: 'Diretor',
            addedAt: new Date().toISOString(),
          },
          {
            id: uuidv4(),
            name: 'Maria Oliveira',
            role: 'Cinegrafista',
            addedAt: new Date().toISOString(),
          },
        ],
        briefing: {
          id: uuidv4(),
          eventDate: '2025-06-15',
          startTime: '15:00',
          endTime: '18:00',
          eventLocation: 'Centro de Convenções',
          hasCredentialing: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        videos: [],
        assets: [],
        tasks: [],
        tags: ['corporativo', 'lançamento', 'presencial'],
        thumbnail: '/placeholder-event.jpg',
        description: 'Evento corporativo para lançamento de produto',
      },
      {
        id: 'projeto-2',
        title: 'Casamento Ana & Carlos',
        client: 'Ana Silva',
        date: '2025-08-20T17:00:00Z',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        team: [
          {
            id: uuidv4(),
            name: 'Pedro Souza',
            role: 'Coordenador',
            addedAt: new Date().toISOString(),
          },
          {
            id: uuidv4(),
            name: 'Júlia Costa',
            role: 'Cinegrafista',
            addedAt: new Date().toISOString(),
          },
          {
            id: uuidv4(),
            name: 'Roberto Alves',
            role: 'Assistente',
            addedAt: new Date().toISOString(),
          },
        ],
        briefing: {
          id: uuidv4(),
          eventDate: '2025-08-20',
          startTime: '17:00',
          endTime: '23:00',
          eventLocation: 'Praia do Forte',
          hasCredentialing: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        videos: [],
        assets: [],
        tasks: [],
        tags: ['casamento', 'praia', 'filmagem'],
        thumbnail: '/placeholder-event.jpg',
        description: 'Casamento na praia com cerimônia ao pôr do sol',
      },
      {
        id: 'projeto-3',
        title: 'Campeonato Regional',
        client: 'Liga Esportiva',
        date: '2025-07-10T09:00:00Z',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        team: [
          {
            id: uuidv4(),
            name: 'Fernando Gomes',
            role: 'Diretor',
            addedAt: new Date().toISOString(),
          },
          {
            id: uuidv4(),
            name: 'Carolina Dias',
            role: 'Cinegrafista',
            addedAt: new Date().toISOString(),
          },
          {
            id: uuidv4(),
            name: 'Marcelo Santos',
            role: 'Editor',
            addedAt: new Date().toISOString(),
          },
        ],
        briefing: {
          id: uuidv4(),
          eventDate: '2025-07-10',
          startTime: '09:00',
          endTime: '18:00',
          eventLocation: 'Estádio Municipal',
          hasCredentialing: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        videos: [],
        assets: [],
        tasks: [],
        deadline: {
          dueDate: '2025-07-05T23:59:59Z',
          priority: 'alta',
          notes: 'Entregar antes do início do campeonato',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        tags: ['esporte', 'futebol', 'campeonato', 'transmissão'],
        thumbnail: '/placeholder-event.jpg',
        description: 'Cobertura completa do campeonato regional de futebol',
      },
    ]

    // Adicionar projetos ao armazenamento
    storeData.state.projects = [...storeData.state.projects, ...exampleProjects]

    // Salvar arquivo
    fs.writeFileSync(storePath, JSON.stringify(storeData, null, 2))

    console.log(
      `Projetos de exemplo criados com sucesso no arquivo: ${storePath}`
    )
    console.log('IDs dos projetos:')
    exampleProjects.forEach(project => {
      console.log(`- ${project.id}: ${project.title}`)
    })

    // Criar pastas para os projetos no diretório exports
    const exportsDir = path.join(__dirname, '..', 'public', 'exports')

    exampleProjects.forEach(project => {
      const projectDir = path.join(exportsDir, project.id)
      if (!fs.existsSync(projectDir)) {
        fs.mkdirSync(projectDir, { recursive: true })
        console.log(`Pasta criada: ${projectDir}`)
      }
    })

    console.log('Pastas de exportação criadas com sucesso!')
    console.log(
      'Para testar o watcher, copie um vídeo MP4 para qualquer uma dessas pastas.'
    )
  } catch (error) {
    console.error('Erro ao criar projetos de exemplo:', error)
  }
}

// Executar a função
createExampleProjects()
