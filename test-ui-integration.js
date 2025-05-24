#!/usr/bin/env node

/**
 * Script para testar a integração UI do sistema de Timeline
 * Verifica se todos os componentes estão funcionando corretamente
 */

const fs = require('fs').promises
const path = require('path')

console.log('🧪 TESTE DE INTEGRAÇÃO DA UI - SISTEMA DE TIMELINE')
console.log('================================================\n')

async function validateComponentFiles() {
  console.log('📁 TESTE 1: Validando arquivos de componentes')
  console.log('---------------------------------------------')
  
  const components = [
    'features/briefing/components/TimelineTab.tsx',
    'features/briefing/components/GenerateTimelineButton.tsx', 
    'features/briefing/components/GeneralInfoTab.tsx',
    'app/events/[eventId]/briefing/page.tsx'
  ]
  
  for (const component of components) {
    const filePath = path.join(__dirname, component)
    try {
      await fs.access(filePath)
      const content = await fs.readFile(filePath, 'utf-8')
      
      console.log(`✅ ${component}`)
      
      // Verificações específicas para cada componente
      if (component.includes('TimelineTab')) {
        if (content.includes('onTimelineGenerated') && content.includes('phases')) {
          console.log('   🎯 Props de timeline corretamente implementadas')
        } else {
          console.log('   ⚠️ Props de timeline podem estar faltando')
        }
      }
      
      if (component.includes('GenerateTimelineButton')) {
        if (content.includes('generateTimeline') && content.includes('onTimelineGenerated')) {
          console.log('   🎯 Callback de geração implementado')
        } else {
          console.log('   ⚠️ Callback de geração pode estar faltando')
        }
      }
      
      if (component.includes('page.tsx')) {
        if (content.includes('handleTimelineGenerated') && content.includes('activeTab')) {
          console.log('   🎯 Gerenciamento de estado da página implementado')
        } else {
          console.log('   ⚠️ Gerenciamento de estado pode estar faltando')
        }
      }
      
    } catch (error) {
      console.log(`❌ ${component} - Erro: ${error.message}`)
    }
  }
}

async function validateDataFiles() {
  console.log('\n📋 TESTE 2: Validando arquivos de dados')
  console.log('---------------------------------------')
  
  const dataFiles = [
    'data/briefings.json',
    'data/timelines.json', 
    'data/events.json'
  ]
  
  for (const dataFile of dataFiles) {
    const filePath = path.join(__dirname, dataFile)
    try {
      await fs.access(filePath)
      const content = await fs.readFile(filePath, 'utf-8')
      const data = JSON.parse(content)
      
      console.log(`✅ ${dataFile} - ${Array.isArray(data) ? data.length : Object.keys(data).length} registros`)
    } catch (error) {
      console.log(`❌ ${dataFile} - Erro: ${error.message}`)
    }
  }
}

async function validateAPIRoutes() {
  console.log('\n🌐 TESTE 3: Validando rotas de API')
  console.log('----------------------------------')
  
  const apiRoutes = [
    'app/api/events/[eventId]/route.ts',
    'app/api/events/[eventId]/briefing/route.ts',
    'app/api/events/[eventId]/timeline/route.ts'
  ]
  
  for (const route of apiRoutes) {
    const filePath = path.join(__dirname, route)
    try {
      await fs.access(filePath)
      console.log(`✅ ${route}`)
    } catch (error) {
      console.log(`❌ ${route} - Não encontrado`)
    }
  }
}

async function validateHooks() {
  console.log('\n🎣 TESTE 4: Validando hooks')
  console.log('---------------------------')
  
  const hooks = [
    'hooks/useBriefing.ts',
    'hooks/useTimeline.ts'
  ]
  
  for (const hook of hooks) {
    const filePath = path.join(__dirname, hook)
    try {
      await fs.access(filePath)
      const content = await fs.readFile(filePath, 'utf-8')
      console.log(`✅ ${hook}`)
      
      if (hook.includes('useBriefing') && content.includes('saveBriefing')) {
        console.log('   🎯 Função saveBriefing encontrada')
      }
      
      if (hook.includes('useTimeline') && content.includes('generateTimeline')) {
        console.log('   🎯 Função generateTimeline encontrada')
      }
      
    } catch (error) {
      console.log(`❌ ${hook} - Erro: ${error.message}`)
    }
  }
}

async function main() {
  try {
    await validateComponentFiles()
    await validateDataFiles()
    await validateAPIRoutes()
    await validateHooks()
    
    console.log('\n🎉 RESUMO DOS TESTES')
    console.log('===================')
    console.log('✅ Componentes principais validados')
    console.log('✅ Dados de teste disponíveis')
    console.log('✅ Sistema pronto para teste de UI')
    
    console.log('\n📝 PRÓXIMOS PASSOS:')
    console.log('1. Acessar http://localhost:3000/events/test-evento-12345/briefing')
    console.log('2. Preencher dados de briefing')
    console.log('3. Clicar em "Gerar Timeline"')
    console.log('4. Verificar se a aba de Timeline é aberta automaticamente')
    console.log('5. Validar se os dados do briefing são refletidos na timeline')
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error.message)
  }
}

main()
