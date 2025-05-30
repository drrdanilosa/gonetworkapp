#!/bin/bash

echo "🚀 Iniciando teste de build de produção Tauri..."

# Definir variáveis de ambiente para Tauri
export TAURI_BUILD=true

echo "📦 Executando build do Next.js para Tauri..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build do Next.js concluído com sucesso!"
    
    echo "🔧 Executando build do Tauri..."
    npm run tauri:build
    
    if [ $? -eq 0 ]; then
        echo "✅ Build do Tauri concluído com sucesso!"
        echo "📂 Verificando arquivos gerados..."
        
        if [ -d "src-tauri/target/release" ]; then
            echo "📁 Pasta release encontrada:"
            ls -la src-tauri/target/release/
            
            if [ -d "src-tauri/target/release/bundle" ]; then
                echo "📦 Pasta bundle encontrada:"
                ls -la src-tauri/target/release/bundle/
            fi
        fi
        
        echo "🎉 Build de produção concluído com sucesso!"
    else
        echo "❌ Erro no build do Tauri"
        exit 1
    fi
else
    echo "❌ Erro no build do Next.js"
    exit 1
fi
