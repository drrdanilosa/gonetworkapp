// Script para criar projetos de teste
const fs = require('fs')
const path = require('path')

// Estrutura dos projetos de teste
const projetosDeExemplo = [
  {
    id: 'projeto-1',
    title: 'Projeto de Teste 1',
    description: 'Projeto para teste do watcher de vídeos',
    client: 'Cliente Teste',
    status: 'active',
    thumbnailUrl: '/placeholder.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    videos: [],
    tasks: [],
  },
  {
    id: 'projeto-2',
    title: 'Projeto de Teste 2',
    description: 'Segundo projeto para teste do watcher de vídeos',
    client: 'Cliente Teste 2',
    status: 'active',
    thumbnailUrl: '/placeholder.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    videos: [],
    tasks: [],
  },
]

// Pasta onde os projetos de teste serão monitorados
const EXPORTS_DIR = path.resolve(__dirname, '../public/exports')

// Função para criar estrutura de pastas
function setupDirectories() {
  // Criar pasta raiz se não existir
  if (!fs.existsSync(EXPORTS_DIR)) {
    console.log(`Criando pasta principal: ${EXPORTS_DIR}`)
    fs.mkdirSync(EXPORTS_DIR, { recursive: true })
  }

  // Criar pastas para cada projeto
  projetosDeExemplo.forEach(projeto => {
    const projetoDir = path.join(EXPORTS_DIR, projeto.id)
    if (!fs.existsSync(projetoDir)) {
      console.log(`Criando pasta para projeto ${projeto.id}: ${projetoDir}`)
      fs.mkdirSync(projetoDir, { recursive: true })
    }
  })
}

// Função para salvar os projetos no local storage simulado
function salvarProjetos() {
  try {
    // Criar arquivo de projetos para simular localStorage
    const projetosJson = JSON.stringify(projetosDeExemplo, null, 2)
    const projetosFile = path.join(__dirname, '../.projetos-teste.json')

    fs.writeFileSync(projetosFile, projetosJson)
    console.log(`Projetos de teste salvos em: ${projetosFile}`)

    // Mostrar instruções para o usuário
    console.log('\n=== INSTRUÇÕES ===')
    console.log('1. Acesse http://localhost:3000/test-projects no navegador')
    console.log('2. Clique no botão "Reinicializar projetos"')
    console.log('3. Coloque arquivos de vídeo MP4 nas pastas:')
    projetosDeExemplo.forEach(projeto => {
      console.log(`   - public/exports/${projeto.id}/`)
    })
    console.log(
      '\nO watcher detectará automaticamente os vídeos e os enviará para o sistema.'
    )
    console.log('===========================\n')
  } catch (error) {
    console.error('Erro ao salvar projetos:', error)
  }
}

// Executar o script
setupDirectories()
salvarProjetos()
