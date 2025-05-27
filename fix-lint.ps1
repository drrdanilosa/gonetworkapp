Write-Host "`n🛠️  Corrigindo lint e prettier..." -ForegroundColor Cyan

# Corrigir automaticamente erros do ESLint
npx eslint . --ext .js,.ts,.tsx --fix

# Corrigir formatação e quebras de linha
npx prettier "**/*.{ts,tsx,js,json,css,md}" --write

# Substituir 'require' por 'import' (básico)
Get-ChildItem -Recurse -Include *.ts,*.tsx,*.js | ForEach-Object {
  (Get-Content $_.FullName) -replace 'const (\w+) = require\(["''](.+)["'']\)', 'import $1 from ''$2'';' |
    Set-Content $_.FullName
}

Write-Host "`n✅ Correções aplicadas com sucesso!" -ForegroundColor Green
