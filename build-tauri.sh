#!/bin/bash
# Script de build para Tauri

echo "🚀 Iniciando build do Tauri..."

# Define variáveis de ambiente
export TAURI_BUILD=true
export NEXT_PUBLIC_IS_TAURI=true

# Remove diretório de build anterior
rm -rf ./out

# Criar backup completo
echo "📁 Fazendo backup completo das rotas dinâmicas e API..."
mkdir -p /tmp/tauri-backup

# Backup API
mv app/api /tmp/tauri-backup/ 2>/dev/null || true

# Backup de todas as páginas dinâmicas
find app -type d -name "*\[*\]*" | while read dir; do
    echo "Fazendo backup de: $dir"
    parent_dir=$(dirname "$dir")
    base_name=$(basename "$dir")
    mkdir -p "/tmp/tauri-backup/$(dirname "$dir")"
    mv "$dir" "/tmp/tauri-backup/$dir"
done

# Backup de arquivos individuais com parâmetros dinâmicos
find app -name "page.tsx" | grep "\[" | while read file; do
    echo "Fazendo backup de: $file"
    mkdir -p "/tmp/tauri-backup/$(dirname "$file")"
    mv "$file" "/tmp/tauri-backup/$file"
done

# Temporarily backup and replace next.config.js
mv next.config.js next.config.backup.js
cp next.config.tauri.js next.config.js

echo "📦 Executando build do Next.js para Tauri..."

# Execute Next.js build
npm run build

# Restore original files
mv next.config.backup.js next.config.js

echo "🔄 Restaurando arquivos originais..."
if [ -d "/tmp/tauri-backup" ]; then
    cp -r /tmp/tauri-backup/* ./ 2>/dev/null || true
    rm -rf /tmp/tauri-backup
fi

# Verificar se o build foi bem-sucedido
if [ -d "./out" ]; then
    echo "✅ Build do Next.js concluído com sucesso!"
    echo "📁 Arquivos estáticos gerados em ./out"
    ls -la ./out
else
    echo "❌ Falha no build do Next.js"
    exit 1
fi
