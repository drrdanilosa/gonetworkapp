#!/bin/bash

# Script de teste para integração Tauri
# Testa as funcionalidades básicas da aplicação

echo "🧪 Testando integração Tauri..."

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

log_error() {
    echo -e "${RED}[FAIL]${NC} $1"
}

# Contador de testes
PASSED=0
FAILED=0

test_passed() {
    ((PASSED++))
    log_success "$1"
}

test_failed() {
    ((FAILED++))
    log_error "$1"
}

echo "📋 Executando testes da integração Tauri..."
echo ""

# Teste 1: Verificar se Next.js está rodando
log_info "Teste 1: Verificando se Next.js está ativo..."
if curl -s http://localhost:3000 > /dev/null; then
    test_passed "Next.js está rodando em localhost:3000"
else
    test_failed "Next.js não está respondendo"
fi

# Teste 2: Verificar se a página de teste existe
log_info "Teste 2: Verificando página de teste Tauri..."
if curl -s http://localhost:3000/tauri-test | grep -q "tauri-test"; then
    test_passed "Página de teste Tauri acessível"
else
    test_failed "Página de teste Tauri não encontrada"
fi

# Teste 3: Verificar compilação Rust
log_info "Teste 3: Verificando compilação Rust..."
cd /workspaces/gonetworkapp/src-tauri
if cargo check --quiet 2>/dev/null; then
    test_passed "Código Rust compila sem erros"
else
    test_failed "Erros na compilação Rust"
fi
cd ..

# Teste 4: Verificar estrutura de arquivos Tauri
log_info "Teste 4: Verificando estrutura de arquivos..."
files_ok=true

if [ ! -f "src-tauri/tauri.conf.json" ]; then
    test_failed "tauri.conf.json não encontrado"
    files_ok=false
fi

if [ ! -f "src-tauri/Cargo.toml" ]; then
    test_failed "Cargo.toml não encontrado"
    files_ok=false
fi

if [ ! -f "src-tauri/src/main.rs" ]; then
    test_failed "main.rs não encontrado"
    files_ok=false
fi

if [ ! -f "src-tauri/src/lib.rs" ]; then
    test_failed "lib.rs não encontrado"
    files_ok=false
fi

if [ ! -f "lib/tauri.ts" ]; then
    test_failed "tauri.ts wrapper não encontrado"
    files_ok=false
fi

if $files_ok; then
    test_passed "Todos os arquivos necessários estão presentes"
fi

# Teste 5: Verificar dependências no package.json
log_info "Teste 5: Verificando dependências Tauri..."
if grep -q "@tauri-apps/api" package.json; then
    test_passed "Dependência @tauri-apps/api encontrada"
else
    test_failed "Dependência @tauri-apps/api não encontrada"
fi

if grep -q "@tauri-apps/cli" package.json; then
    test_passed "Dependência @tauri-apps/cli encontrada"
else
    test_failed "Dependência @tauri-apps/cli não encontrada"
fi

# Teste 6: Verificar comandos npm
log_info "Teste 6: Verificando scripts npm..."
scripts_ok=true

if ! grep -q "tauri" package.json; then
    test_failed "Scripts do Tauri não encontrados no package.json"
    scripts_ok=false
fi

if $scripts_ok; then
    test_passed "Scripts do Tauri configurados corretamente"
fi

# Teste 7: Verificar configuração Tauri
log_info "Teste 7: Verificando configuração Tauri..."
config_ok=true

if ! grep -q "GoNetworkApp" src-tauri/tauri.conf.json; then
    test_failed "Nome do produto não configurado"
    config_ok=false
fi

if ! grep -q "localhost:3000" src-tauri/tauri.conf.json; then
    test_failed "URL de desenvolvimento não configurada"
    config_ok=false
fi

if $config_ok; then
    test_passed "Configuração Tauri válida"
fi

# Teste 8: Verificar comandos Rust implementados
log_info "Teste 8: Verificando comandos Rust..."
commands_ok=true

if ! grep -q "greet" src-tauri/src/lib.rs; then
    test_failed "Comando 'greet' não implementado"
    commands_ok=false
fi

if ! grep -q "get_system_info" src-tauri/src/lib.rs; then
    test_failed "Comando 'get_system_info' não implementado"
    commands_ok=false
fi

if ! grep -q "file_exists" src-tauri/src/lib.rs; then
    test_failed "Comando 'file_exists' não implementado"
    commands_ok=false
fi

if $commands_ok; then
    test_passed "Comandos Rust implementados corretamente"
fi

echo ""
echo "📊 Resultado dos Testes:"
echo "✅ Testes Aprovados: $PASSED"
echo "❌ Testes Falharam: $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 Todos os testes passaram! Integração Tauri está funcionando.${NC}"
    echo ""
    echo "🚀 Para executar a aplicação:"
    echo "   ./start-tauri.sh"
    echo ""
    echo "🌐 Para testar no navegador:"
    echo "   http://localhost:3000/tauri-test"
    exit 0
else
    echo -e "${RED}⚠️  Alguns testes falharam. Verifique os problemas acima.${NC}"
    exit 1
fi
