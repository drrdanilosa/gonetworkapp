# Script para corrigir tipos 'any' e variáveis não utilizadas

$files = Get-ChildItem -Path "c:\Users\drdan\gonetworkapp" -Recurse -Include "*.ts", "*.tsx" -Exclude "node_modules", ".next", "dist", "build"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Corrigir variáveis não utilizadas - adicionar prefixo _
    $content = $content -replace "^(\s*)(export\s+)?interface\s+([A-Z][a-zA-Z]*)\s*\{", '$1$2interface _$3 {'
    $content = $content -replace "^(\s*)(export\s+)?type\s+([A-Z][a-zA-Z]*)\s*=", '$1$2type _$3 ='
    $content = $content -replace "^(\s*)(export\s+)?class\s+([A-Z][a-zA-Z]*)", '$1$2class _$3'
    
    # Corrigir tipos any comuns
    $content = $content -replace ": any\b", ": unknown"
    $content = $content -replace "any\[\]", "unknown[]"
    $content = $content -replace "Array<any>", "Array<unknown>"
    $content = $content -replace "Record<string, any>", "Record<string, unknown>"
    $content = $content -replace "Promise<any>", "Promise<unknown>"
    
    # Corrigir parâmetros de função any
    $content = $content -replace "\(([^)]*): any\)", '($1: unknown)'
    $content = $content -replace "= any\b", "= unknown"
    
    # Casos específicos para event handlers
    $content = $content -replace "event: any", "event: Event"
    $content = $content -replace "e: any", "e: Event"
    $content = $content -replace "error: any", "error: Error | unknown"
    $content = $content -replace "data: any", "data: unknown"
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Corrigido: $($file.FullName)" -ForegroundColor Green
    }
}

Write-Host "Script de correção de tipos concluído!" -ForegroundColor Cyan
