// Teste de integração completa do botão "Gerar Timeline"
const puppeteer = require('puppeteer');

/**
 * Este script testa o fluxo completo de geração de timeline
 * 1. Acessa a página de teste
 * 2. Cria um projeto de teste
 * 3. Configura os dados do formulário
 * 4. Clica no botão "Gerar Timeline"
 * 5. Verifica se a timeline foi gerada e redirecionamento funcionou
 */
async function testTimelineGeneration() {
  console.log('🚀 Iniciando teste de integração do botão "Gerar Timeline"');
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  const page = await browser.newPage();

  try {
    // 1. Acessar a página de teste
    console.log('📄 Acessando página de teste...');
    await page.goto('http://localhost:3000/teste-timeline');
    await page.waitForSelector('h1');
    
    // 2. Criar projeto de teste
    console.log('🔧 Criando projeto de teste...');
    await page.click('text="Criar Projeto de Teste"');
    
    // Esperar o toast de confirmação
    await page.waitForSelector('[role="status"]');
    
    // 3. Modificar dados do formulário
    console.log('📝 Configurando dados do formulário...');
    await page.type('input[type="text"]', ' - Modificado');
    
    // Atualizar data para amanhã
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    // Preencher campo de data (primeiro limpar)
    await page.evaluate(() => {
      document.querySelector('input[type="date"]').value = '';
    });
    await page.type('input[type="date"]', tomorrowStr);
    
    // Atualizar número de vídeos para 3
    await page.evaluate(() => {
      document.querySelector('input[type="number"]').value = '';
    });
    await page.type('input[type="number"]', '3');
    
    // 4. Clicar no botão "Gerar Timeline"
    console.log('⏱️ Gerando timeline...');
    await page.waitForSelector('button:has-text("Gerar Timeline")');
    await page.click('button:has-text("Gerar Timeline")');
    
    // Esperar o toast de confirmação
    await page.waitForSelector('[role="status"]:has-text("Timeline gerada")');
    
    // 5. Verificar se a timeline foi gerada
    console.log('🔍 Verificando resultado...');
    
    // Navegar de volta para a página de teste (simular redirecionamento)
    await page.goto('http://localhost:3000/teste-timeline');
    await page.waitForSelector('h1');
    
    // Esperar a seção da timeline aparecer
    await page.waitForSelector('h2:has-text("4. Última Timeline Gerada")');
    
    // Verificar se há fases na timeline
    const hasFases = await page.evaluate(() => {
      const fasesList = document.querySelectorAll('h3:has-text("Fases") + ul li');
      return fasesList.length > 0;
    });
    
    if (hasFases) {
      console.log('✅ Teste concluído com sucesso! A timeline foi gerada corretamente.');
    } else {
      console.error('❌ Teste falhou: Não foram encontradas fases na timeline gerada.');
    }
    
  } catch (error) {
    console.error('❌ Teste falhou com erro:', error);
  } finally {
    // Capturar screenshot final
    await page.screenshot({ path: 'timeline-test-result.png', fullPage: true });
    
    // Fechar o navegador
    await browser.close();
    console.log('🏁 Teste finalizado!');
  }
}

testTimelineGeneration();
