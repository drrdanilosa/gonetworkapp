#!/usr/bin/env pwsh

Write-Host "🔧 Iniciando correções automáticas de linting..." -ForegroundColor Green

# Configurar ESLint para ignorar prettier temporariamente
Write-Host "📝 Configurando ESLint..." -ForegroundColor Blue

# Executar prettier em arquivos principais
Write-Host "🎨 Formatando código com Prettier..." -ForegroundColor Blue
npx prettier --write "app/**/*.{ts,tsx}" --ignore-path .gitignore
npx prettier --write "components/**/*.{ts,tsx}" --ignore-path .gitignore  
npx prettier --write "lib/**/*.{ts,tsx}" --ignore-path .gitignore
npx prettier --write "hooks/**/*.{ts,tsx}" --ignore-path .gitignore
npx prettier --write "store/**/*.{ts,tsx}" --ignore-path .gitignore
npx prettier --write "services/**/*.{ts,tsx}" --ignore-path .gitignore
npx prettier --write "middleware.ts" --ignore-path .gitignore

# Executar eslint com fix automático
Write-Host "🔍 Executando ESLint com correções automáticas..." -ForegroundColor Blue
npx eslint . --ext .ts,.tsx --fix --max-warnings 1000

# Verificar resultado
Write-Host "✅ Correções automáticas concluídas!" -ForegroundColor Green
Write-Host "📊 Executando verificação final..." -ForegroundColor Blue
npx eslint . --ext .ts,.tsx --format compact | Select-Object -First 50

Write-Host "🎉 Processo de correção finalizado!" -ForegroundColor Green
