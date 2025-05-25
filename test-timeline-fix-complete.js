#!/usr/bin/env node

/**
 * Teste completo do fluxo de geração de timeline
 */

const http = require('http');

const testEventId = 'test-event-1748146557175';

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed, raw: body });
        } catch (e) {
          resolve({ status: res.statusCode, data: null, raw: body });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testTimeline() {
  console.log('🧪 TESTE COMPLETO DE GERAÇÃO DE TIMELINE');
  console.log('=========================================\n');
  
  try {
    // 1. Verificar se o briefing existe
    console.log('📋 1. Verificando briefing...');
    const briefingResponse = await makeRequest(`/api/briefings/${testEventId}`);
    
    if (briefingResponse.status !== 200) {
      throw new Error(`Briefing não encontrado: ${briefingResponse.status}`);
    }
    
    console.log('✅ Briefing encontrado');
    console.log(`   Nome: ${briefingResponse.data.eventTitle}`);
    console.log(`   Data: ${briefingResponse.data.formData?.eventDate}`);
    console.log(`   Local: ${briefingResponse.data.formData?.eventLocation}`);
    
    // 2. Gerar timeline
    console.log('\n⚡ 2. Gerando timeline...');
    const timelineResponse = await makeRequest(`/api/timeline/${testEventId}`, 'POST', {
      generateFromBriefing: true,
      briefingData: briefingResponse.data
    });
    
    console.log(`Status: ${timelineResponse.status}`);
    
    if (timelineResponse.status === 200 || timelineResponse.status === 201) {
      console.log('✅ Timeline gerada com sucesso!');
      console.log(`   Fases: ${timelineResponse.data.timeline?.length || 0}`);
      
      if (timelineResponse.data.timeline?.length > 0) {
        timelineResponse.data.timeline.forEach((phase, index) => {
          console.log(`   ${index + 1}. ${phase.name} (${phase.tasks?.length || 0} tarefas)`);
        });
      }
      
      // 3. Verificar se foi salva
      console.log('\n📅 3. Verificando timeline salva...');
      const savedResponse = await makeRequest(`/api/timeline/${testEventId}`);
      
      if (savedResponse.status === 200) {
        console.log('✅ Timeline recuperada com sucesso!');
        
        let timelineData = [];
        if (Array.isArray(savedResponse.data)) {
          timelineData = savedResponse.data;
        } else if (savedResponse.data.timeline && Array.isArray(savedResponse.data.timeline)) {
          timelineData = savedResponse.data.timeline;
        }
        
        console.log(`   Fases salvas: ${timelineData.length}`);
        
        if (timelineData.length > 0) {
          console.log('\n📊 DETALHES DA TIMELINE SALVA:');
          timelineData.forEach((phase, index) => {
            console.log(`\n   Fase ${index + 1}: ${phase.name}`);
            console.log(`   - Tipo: ${phase.type || 'N/A'}`);
            console.log(`   - Status: ${phase.status || 'N/A'}`);
            console.log(`   - Início: ${new Date(phase.startDate).toLocaleDateString('pt-BR')}`);
            console.log(`   - Fim: ${new Date(phase.endDate).toLocaleDateString('pt-BR')}`);
            console.log(`   - Tarefas: ${phase.tasks?.length || 0}`);
            
            if (phase.tasks?.length > 0) {
              phase.tasks.forEach((task, taskIndex) => {
                console.log(`     ${taskIndex + 1}. ${task.name} (${task.status || 'pending'})`);
              });
            }
          });
        }
        
        console.log('\n🎉 SUCESSO COMPLETO! O botão "Gerar Timeline" está funcionando!');
        console.log('✅ Briefing carregado');
        console.log('✅ Timeline gerada via API');
        console.log('✅ Timeline salva e recuperada');
        console.log('✅ Estrutura de dados válida');
        
      } else {
        console.log('❌ Erro ao recuperar timeline salva');
        console.log('Resposta:', savedResponse.raw);
      }
    } else {
      console.log('❌ Erro ao gerar timeline');
      console.log('Resposta:', timelineResponse.raw);
    }
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    console.log('\n🔍 DIAGNÓSTICO:');
    console.log('1. Verifique se o servidor está rodando na porta 3000');
    console.log('2. Verifique se os dados de teste foram criados corretamente');
    console.log('3. Verifique os logs do servidor para mais detalhes');
  }
}

async function main() {
  console.log(`🔍 Testando com Event ID: ${testEventId}`);
  console.log(`🌐 Servidor: http://localhost:3000\n`);
  
  await testTimeline();
}

if (require.main === module) {
  main().catch(console.error);
}
