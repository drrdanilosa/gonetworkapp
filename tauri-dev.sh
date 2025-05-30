#!/bin/bash
# Script de desenvolvimento para Tauri

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para logging
log() {
    echo -e "${BLUE}[TAURI]${NC} $1"
}

success() {
    echo -e "${GREEN}[TAURI]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[TAURI]${NC} $1"
}

error() {
    echo -e "${RED}[TAURI]${NC} $1"
}

# Função para verificar se o Next.js está rodando
check_nextjs() {
    if curl -s -f http://localhost:3000 > /dev/null; then
        return 0
    else
        return 1
    fi
}

# Função para iniciar o Next.js
start_nextjs() {
    log "Iniciando Next.js..."
    npm run dev &
    NEXTJS_PID=$!
    
    # Aguardar o Next.js inicializar
    for i in {1..30}; do
        if check_nextjs; then
            success "Next.js iniciado com sucesso!"
            return 0
        fi
        sleep 1
    done
    
    error "Falha ao iniciar Next.js"
    return 1
}

# Função para iniciar o Tauri em desenvolvimento
start_tauri_dev() {
    log "Iniciando Tauri em modo desenvolvimento..."
    
    if command -v xvfb-run > /dev/null; then
        xvfb-run -a npm run tauri:dev
    else
        npm run tauri:dev
    fi
}

# Função para fazer build do Tauri
build_tauri() {
    log "Fazendo build do Tauri..."
    
    # Definir variáveis de ambiente
    export TAURI_BUILD=true
    export NEXT_PUBLIC_IS_TAURI=true
    
    # Fazer build do Next.js primeiro
    log "Fazendo build do Next.js..."
    npm run build
    
    # Verificar se o build foi bem-sucedido
    if [ ! -d "./out" ]; then
        error "Falha no build do Next.js - diretório 'out' não encontrado"
        exit 1
    fi
    
    success "Build do Next.js concluído!"
    
    # Fazer build do Tauri
    log "Fazendo build do Tauri..."
    npm run tauri:build
    
    success "Build do Tauri concluído!"
    log "Instaladores disponíveis em: src-tauri/target/release/bundle/"
    ls -la src-tauri/target/release/bundle/ 2>/dev/null || true
}

# Função para limpar builds anteriores
clean() {
    log "Limpando builds anteriores..."
    rm -rf ./out
    rm -rf ./src-tauri/target
    success "Limpeza concluída!"
}

# Função para verificar pré-requisitos
check_prerequisites() {
    log "Verificando pré-requisitos..."
    
    # Verificar Node.js
    if ! command -v node > /dev/null; then
        error "Node.js não encontrado!"
        exit 1
    fi
    
    # Verificar Rust
    if ! command -v rustc > /dev/null; then
        error "Rust não encontrado!"
        exit 1
    fi
    
    # Verificar Tauri CLI
    if ! npm list @tauri-apps/cli > /dev/null 2>&1; then
        error "Tauri CLI não encontrado!"
        exit 1
    fi
    
    success "Todos os pré-requisitos atendidos!"
}

# Função de ajuda
show_help() {
    echo "Script de desenvolvimento Tauri para GoNetworkApp"
    echo ""
    echo "Uso: $0 [COMANDO]"
    echo ""
    echo "Comandos:"
    echo "  dev         Inicia Next.js e Tauri em modo desenvolvimento"
    echo "  build       Faz build de produção e gera instaladores"
    echo "  clean       Limpa builds anteriores"
    echo "  check       Verifica pré-requisitos"
    echo "  nextjs      Inicia apenas o Next.js"
    echo "  tauri       Inicia apenas o Tauri (requer Next.js rodando)"
    echo "  help        Mostra esta ajuda"
    echo ""
    echo "Exemplos:"
    echo "  $0 dev      # Desenvolvimento completo"
    echo "  $0 build    # Build de produção"
    echo "  $0 clean    # Limpar antes de novo build"
}

# Menu principal
case "$1" in
    "dev")
        check_prerequisites
        if ! check_nextjs; then
            start_nextjs
        else
            warning "Next.js já está rodando"
        fi
        start_tauri_dev
        ;;
    "build")
        check_prerequisites
        build_tauri
        ;;
    "clean")
        clean
        ;;
    "check")
        check_prerequisites
        ;;
    "nextjs")
        start_nextjs
        ;;
    "tauri")
        if check_nextjs; then
            start_tauri_dev
        else
            error "Next.js não está rodando! Use '$0 nextjs' primeiro."
            exit 1
        fi
        ;;
    "help"|"--help"|"-h"|"")
        show_help
        ;;
    *)
        error "Comando inválido: $1"
        show_help
        exit 1
        ;;
esac
