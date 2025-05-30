#!/usr/bin/env node

console.log('🧪 Teste Simples de Tauri');
console.log('📂 Diretório atual:', process.cwd());

// Verificar arquivos básicos
const fs = require('fs');

console.log('\n📋 Verificando arquivos:');
console.log('package.json:', fs.existsSync('package.json') ? '✅' : '❌');
console.log('src-tauri/', fs.existsSync('src-tauri') ? '✅' : '❌');
console.log('tauri-dev.sh:', fs.existsSync('tauri-dev.sh') ? '✅' : '❌');

if (fs.existsSync('src-tauri')) {
    console.log('src-tauri/Cargo.toml:', fs.existsSync('src-tauri/Cargo.toml') ? '✅' : '❌');
    console.log('src-tauri/tauri.conf.json:', fs.existsSync('src-tauri/tauri.conf.json') ? '✅' : '❌');
}

// Verificar servidor Next.js
const http = require('http');
console.log('\n📋 Testando servidor Next.js...');

http.get('http://localhost:3000', (res) => {
    console.log('Next.js servidor:', res.statusCode === 200 ? '✅ Rodando' : `❌ Status: ${res.statusCode}`);
}).on('error', (err) => {
    console.log('Next.js servidor: ❌ Não está rodando');
});

console.log('\n✨ Teste simples concluído!');
