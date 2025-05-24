/**
 * Teste completo do fluxo de geração de timeline
 * Este script testa:
 * 1. Carregamento do briefing
 * 2. Geração da timeline via API
 * 3. Carregamento da timeline gerada
 */

const API_BASE = 'http://localhost:3000/api';
const EVENT_ID = 'test-evento-12345';

async function testCompleteFlow() {
  console.log('🧪 Iniciando teste completo do fluxo de timeline...\n');
  
  try {
    // Teste 1: Verificar se o briefing existe
    console.log('1️⃣ Testando carregamento do briefing...');
    const briefingResponse = await fetch(`${API_BASE}/briefings/${EVENT_ID}`);
    
    if (!briefingResponse.ok) {
      throw new Error(`Briefing não encontrado: ${briefingResponse.status}`);
    }
    
    const briefingData = await briefingResponse.json();
    console.log('✅ Briefing carregado com sucesso');
    console.log(`   Evento: ${briefingData.eventName}`);
    console.log(`   Data: ${briefingData.eventDate}`);
    console.log(`   Local: ${briefingData.eventLocation}\n`);
    
    // Teste 2: Gerar timeline
    console.log('2️⃣ Testando geração de timeline...');
    const timelineGenResponse = await fetch(`${API_BASE}/timeline/${EVENT_ID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ generateFromBriefing: true })
    });
    
    if (!timelineGenResponse.ok) {
      throw new Error(`Erro na geração de timeline: ${timelineGenResponse.status}`);
    }
    
    const timelineGenData = await timelineGenResponse.json();
    
    if (!timelineGenData.success) {
      throw new Error('API retornou sucesso falso');
    }
    
    console.log('✅ Timeline gerada com sucesso');
    console.log(`   Fases criadas: ${timelineGenData.timeline.length}`);
    console.log(`   Fases: ${timelineGenData.timeline.map(phase => phase.name).join(', ')}\n`);
    
    // Teste 3: Verificar se a timeline foi salva
    console.log('3️⃣ Testando carregamento da timeline salva...');
    const timelineLoadResponse = await fetch(`${API_BASE}/timeline/${EVENT_ID}`);
    
    if (!timelineLoadResponse.ok) {
      throw new Error(`Erro no carregamento de timeline: ${timelineLoadResponse.status}`);
    }
    
    const timelineLoadData = await timelineLoadResponse.json();
    
    if (!timelineLoadData.success || !timelineLoadData.timeline) {
      throw new Error('Timeline não foi salva corretamente');
    }
    
    console.log('✅ Timeline carregada com sucesso');
    console.log(`   Fases encontradas: ${timelineLoadData.timeline.length}`);
    
    // Teste 4: Verificar estrutura das fases
    console.log('\n4️⃣ Verificando estrutura das fases...');
    for (const phase of timelineLoadData.timeline) {
      console.log(`   📋 Fase: ${phase.name}`);
      console.log(`      Tipo: ${phase.type}`);
      console.log(`      Tarefas: ${phase.tasks.length}`);
      console.log(`      Status: ${phase.status}`);
    }
    
    console.log('\n🎉 TODOS OS TESTES PASSARAM! O fluxo está funcionando corretamente.');
    console.log('\n📊 Resumo:');
    console.log(`   ✅ Briefing carregado: ${briefingData.eventName}`);
    console.log(`   ✅ Timeline gerada: ${timelineGenData.timeline.length} fases`);
    console.log(`   ✅ Timeline persistida: ${timelineLoadData.timeline.length} fases`);
    console.log(`   ✅ Total de tarefas: ${timelineLoadData.timeline.reduce((acc, phase) => acc + phase.tasks.length, 0)}`);
    
  } catch (error) {
    console.error('❌ ERRO NO TESTE:', error.message);
    process.exit(1);
  }
}

// Executar teste se chamado diretamente
if (require.main === module) {
  testCompleteFlow();
}

module.exports = { testCompleteFlow };
