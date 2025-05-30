#!/bin/bash

# Script para iniciar o GoNetworkApp com Tauri
# Autor: GoNetwork AI Team
# Data: 30 de Maio de 2025

echo "🚀 Iniciando GoNetworkApp com Tauri..."

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para log colorido
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    log_error "package.json não encontrado. Execute este script no diretório raiz do projeto."
    exit 1
fi

# Verificar se o src-tauri existe
if [ ! -d "src-tauri" ]; then
    log_error "Diretório src-tauri não encontrado."
    exit 1
fi

# Configurar display virtual se necessário (para ambientes headless)
if [ -z "$DISPLAY" ]; then
    log_info "Configurando display virtual para ambiente headless..."
    export DISPLAY=:99
    
    # Verificar se Xvfb está instalado
    if command -v Xvfb >/dev/null 2>&1; then
        # Verificar se Xvfb já está rodando
        if ! pgrep -x "Xvfb" > /dev/null; then
            log_info "Iniciando servidor X virtual..."
            Xvfb :99 -screen 0 1024x768x24 > /dev/null 2>&1 &
            sleep 2
            log_success "Servidor X virtual iniciado"
        else
            log_info "Servidor X virtual já está rodando"
        fi
    else
        log_warning "Xvfb não está instalado. Interface gráfica pode não funcionar."
    fi
fi

# Verificar se o Next.js está rodando
if curl -s http://localhost:3000 > /dev/null; then
    log_success "Next.js já está rodando em localhost:3000"
else
    log_info "Iniciando Next.js..."
    npm run dev > /dev/null 2>&1 &
    
    # Aguardar Next.js inicializar
    for i in {1..30}; do
        if curl -s http://localhost:3000 > /dev/null; then
            log_success "Next.js iniciado em localhost:3000"
            break
        fi
        sleep 1
        if [ $i -eq 30 ]; then
            log_error "Timeout aguardando Next.js inicializar"
            exit 1
        fi
    done
fi

# Verificar dependências do Tauri
log_info "Verificando dependências do Tauri..."
if ! command -v rustc >/dev/null 2>&1; then
    log_error "Rust não está instalado. Instale o Rust primeiro."
    exit 1
fi

if ! command -v tauri >/dev/null 2>&1; then
    log_error "Tauri CLI não está instalado. Execute: npm install -g @tauri-apps/cli"
    exit 1
fi

# Mostrar informações do sistema
log_info "Informações do sistema:"
echo "  - Node.js: $(node --version)"
echo "  - npm: $(npm --version)"
echo "  - Rust: $(rustc --version | cut -d' ' -f2)"
echo "  - Tauri CLI: $(tauri --version | head -1)"

# Iniciar Tauri
log_info "Iniciando aplicação Tauri..."
log_warning "A aplicação irá abrir em modo headless (sem interface gráfica visível)"
log_info "Para testar a integração, acesse: http://localhost:3000/tauri-test"

# Executar Tauri com handling de erros
if DISPLAY=$DISPLAY npm run tauri:dev; then
    log_success "Tauri executado com sucesso!"
else
    log_error "Erro ao executar Tauri. Verifique os logs acima."
    exit 1
fi
