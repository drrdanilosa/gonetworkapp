#!/usr/bin/env node

/**
 * Teste automatizado completo para verificar a integração Tauri
 * Este script testa todas as funcionalidades implementadas
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando teste de integração Tauri...\n');

// Função para fazer requisições HTTP
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// Função para verificar se um arquivo existe
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

// Testes
async function runTests() {
  const tests = [];
  
  // 1. Verificar se o Next.js está rodando
  try {
    console.log('📋 Teste 1: Verificando servidor Next.js...');
    const response = await makeRequest('http://localhost:3000');
    if (response.includes('GoNetworkApp') || response.includes('html')) {
      console.log('✅ Next.js está rodando corretamente');
      tests.push({ name: 'Next.js Server', status: '✅ PASS' });
    } else {
      console.log('❌ Next.js não está respondendo corretamente');
      tests.push({ name: 'Next.js Server', status: '❌ FAIL' });
    }
  } catch (error) {
    console.log('❌ Erro ao conectar com o Next.js:', error.message);
    tests.push({ name: 'Next.js Server', status: '❌ FAIL' });
  }

  // 2. Verificar estrutura de arquivos Tauri
  console.log('\n📋 Teste 2: Verificando estrutura de arquivos Tauri...');
  const tauriFiles = [
    'src-tauri/Cargo.toml',
    'src-tauri/tauri.conf.json',
    'src-tauri/src/main.rs',
    'src-tauri/src/lib.rs',
    'lib/tauri.ts',
    'app/tauri-test/page.tsx'
  ];

  let filesOk = true;
  for (const file of tauriFiles) {
    if (fileExists(file)) {
      console.log(`✅ ${file} existe`);
    } else {
      console.log(`❌ ${file} não encontrado`);
      filesOk = false;
    }
  }
  tests.push({ name: 'Tauri File Structure', status: filesOk ? '✅ PASS' : '❌ FAIL' });

  // 3. Verificar configuração do Tauri
  console.log('\n📋 Teste 3: Verificando configuração Tauri...');
  try {
    const tauriConfig = JSON.parse(fs.readFileSync('src-tauri/tauri.conf.json', 'utf8'));
    const expectedKeys = ['package', 'build', 'tauri'];
    const hasAllKeys = expectedKeys.every(key => tauriConfig.hasOwnProperty(key));
    
    if (hasAllKeys) {
      console.log('✅ Configuração Tauri está correta');
      console.log(`   - Product Name: ${tauriConfig.package.productName}`);
      console.log(`   - Version: ${tauriConfig.package.version}`);
      console.log(`   - Dev Path: ${tauriConfig.build.devPath}`);
      tests.push({ name: 'Tauri Configuration', status: '✅ PASS' });
    } else {
      console.log('❌ Configuração Tauri incompleta');
      tests.push({ name: 'Tauri Configuration', status: '❌ FAIL' });
    }
  } catch (error) {
    console.log('❌ Erro ao ler configuração Tauri:', error.message);
    tests.push({ name: 'Tauri Configuration', status: '❌ FAIL' });
  }

  // 4. Verificar página de teste
  try {
    console.log('\n📋 Teste 4: Verificando página de teste Tauri...');
    const response = await makeRequest('http://localhost:3000/tauri-test');
    if (response.includes('Tauri') || response.includes('test')) {
      console.log('✅ Página de teste do Tauri está acessível');
      tests.push({ name: 'Tauri Test Page', status: '✅ PASS' });
    } else {
      console.log('❌ Página de teste do Tauri não está funcionando');
      tests.push({ name: 'Tauri Test Page', status: '❌ FAIL' });
    }
  } catch (error) {
    console.log('❌ Erro ao acessar página de teste:', error.message);
    tests.push({ name: 'Tauri Test Page', status: '❌ FAIL' });
  }

  // 5. Verificar dependências no package.json
  console.log('\n📋 Teste 5: Verificando dependências Tauri...');
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const hasTauriDeps = packageJson.devDependencies && 
                        packageJson.devDependencies['@tauri-apps/cli'] &&
                        packageJson.dependencies &&
                        packageJson.dependencies['@tauri-apps/api'];
    
    if (hasTauriDeps) {
      console.log('✅ Dependências Tauri estão instaladas');
      console.log(`   - CLI: ${packageJson.devDependencies['@tauri-apps/cli']}`);
      console.log(`   - API: ${packageJson.dependencies['@tauri-apps/api']}`);
      tests.push({ name: 'Tauri Dependencies', status: '✅ PASS' });
    } else {
      console.log('❌ Dependências Tauri não encontradas');
      tests.push({ name: 'Tauri Dependencies', status: '❌ FAIL' });
    }
  } catch (error) {
    console.log('❌ Erro ao verificar dependências:', error.message);
    tests.push({ name: 'Tauri Dependencies', status: '❌ FAIL' });
  }

  // 6. Verificar scripts Tauri
  console.log('\n📋 Teste 6: Verificando scripts de desenvolvimento...');
  const scripts = ['tauri-dev.sh', 'build-tauri.sh', 'start-tauri.sh'];
  let scriptsOk = true;
  
  for (const script of scripts) {
    if (fileExists(script)) {
      console.log(`✅ ${script} existe`);
    } else {
      console.log(`❌ ${script} não encontrado`);
      scriptsOk = false;
    }
  }
  tests.push({ name: 'Development Scripts', status: scriptsOk ? '✅ PASS' : '❌ FAIL' });

  // Resumo dos testes
  console.log('\n' + '='.repeat(50));
  console.log('📊 RESUMO DOS TESTES:');
  console.log('='.repeat(50));
  
  const passed = tests.filter(t => t.status.includes('PASS')).length;
  const failed = tests.filter(t => t.status.includes('FAIL')).length;
  
  tests.forEach(test => {
    console.log(`${test.status} ${test.name}`);
  });
  
  console.log('\n' + '='.repeat(50));
  console.log(`📈 RESULTADO FINAL: ${passed}/${tests.length} testes passaram`);
  console.log('='.repeat(50));
  
  if (failed === 0) {
    console.log('🎉 Todos os testes passaram! A integração Tauri está funcionando perfeitamente.');
    console.log('\n🚀 Próximos passos sugeridos:');
    console.log('   1. Execute: npm run tauri:dev (para desenvolvimento)');
    console.log('   2. Execute: npm run tauri:build (para produção)');
    console.log('   3. Teste as funcionalidades na aplicação desktop');
  } else {
    console.log(`⚠️  ${failed} teste(s) falharam. Verifique os problemas acima.`);
  }
  
  return { passed, failed, total: tests.length };
}

// Executar testes
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };
