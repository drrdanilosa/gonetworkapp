#!/usr/bin/env node

import { execSync } from 'child_process'
import { readFile, writeFile, readdir } from 'fs/promises'
import { join, extname, relative } from 'path'

class AutoFixer {
  private rootPath: string
  private fixes: string[] = []

  constructor(rootPath: string) {
    this.rootPath = rootPath
  }

  async fix(): Promise<void> {
    console.log('🔧 Aplicando correções automáticas...\n')

    try {
      // 1. ESLint fixes
      console.log('1️⃣ Executando ESLint --fix...')
      execSync('npm run lint:fix', { stdio: 'inherit' })
      this.fixes.push('ESLint: correções automáticas aplicadas')
    } catch (error) {
      console.log('⚠️ ESLint não configurado ou com erros')
    }

    try {
      // 2. Prettier format
      console.log('2️⃣ Formatando código com Prettier...')
      execSync('npm run format', { stdio: 'inherit' })
      this.fixes.push('Prettier: código formatado')
    } catch (error) {
      console.log('⚠️ Prettier não configurado')
    }

    // 3. Manual fixes
    await this.applyManualFixes()

    // 4. Type check
    try {
      console.log('3️⃣ Verificando tipos TypeScript...')
      execSync('npm run type-check', { stdio: 'inherit' })
      this.fixes.push('TypeScript: verificação de tipos passou')
    } catch (error) {
      console.log('⚠️ Erros de tipagem encontrados')
    }

    this.printFixReport()
  }

  private async applyManualFixes(): Promise<void> {
    console.log('4️⃣ Aplicando correções manuais...')

    await this.walkDirectory(this.rootPath, async filePath => {
      if (['.ts', '.tsx'].includes(extname(filePath))) {
        await this.fixFile(filePath)
      }
    })
  }

  private async fixFile(filePath: string): Promise<void> {
    try {
      const content = await readFile(filePath, 'utf-8')
      let modifiedContent = content
      const relativePath = relative(this.rootPath, filePath)
      let hasChanges = false

      // Fix 1: Add "use client" where needed
      if (this.needsUseClient(content) && !content.includes('"use client"')) {
        const lines = content.split('\n')
        const firstImportIndex = lines.findIndex(line =>
          line.startsWith('import')
        )

        if (firstImportIndex > -1) {
          lines.splice(firstImportIndex, 0, '"use client"', '')
          modifiedContent = lines.join('\n')
          hasChanges = true
          this.fixes.push(`${relativePath}: adicionado "use client"`)
        }
      }

      // Fix 2: Remove excessive console.log (only in production)
      if (process.env.NODE_ENV === 'production') {
        const originalConsole = (modifiedContent.match(/console\.log/g) || [])
          .length
        modifiedContent = modifiedContent.replace(
          /console\.log\([^)]*\);?\n?/g,
          ''
        )
        const newConsole = (modifiedContent.match(/console\.log/g) || []).length

        if (originalConsole > newConsole) {
          hasChanges = true
          this.fixes.push(
            `${relativePath}: removidos ${originalConsole - newConsole} console.log`
          )
        }
      }

      // Fix 3: Basic formatting
      modifiedContent = modifiedContent
        .replace(/\n{3,}/g, '\n\n') // Max 2 empty lines
        .replace(/[ \t]+$/gm, '') // Remove trailing spaces

      if (modifiedContent !== content) {
        hasChanges = true
      }

      if (hasChanges) {
        await writeFile(filePath, modifiedContent, 'utf-8')
      }
    } catch (error) {
      console.error(`Erro ao corrigir ${filePath}:`, error)
    }
  }

  private needsUseClient(content: string): boolean {
    const clientIndicators = [
      'useState',
      'useEffect',
      'useCallback',
      'useMemo',
      'onClick',
      'onChange',
      'onSubmit',
      'onFocus',
      'onBlur',
    ]

    return clientIndicators.some(indicator => content.includes(indicator))
  }

  private async walkDirectory(
    dir: string,
    callback: (filePath: string) => Promise<void>
  ): Promise<void> {
    try {
      const entries = await readdir(dir, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = join(dir, entry.name)

        if (
          entry.isDirectory() &&
          !entry.name.startsWith('.') &&
          entry.name !== 'node_modules'
        ) {
          await this.walkDirectory(fullPath, callback)
        } else if (entry.isFile()) {
          await callback(fullPath)
        }
      }
    } catch {
      // Ignore inaccessible directories
    }
  }

  private printFixReport(): void {
    console.log('\n✅ RELATÓRIO DE CORREÇÕES')
    console.log('========================\n')

    if (this.fixes.length === 0) {
      console.log('🎉 Nenhuma correção necessária!')
    } else {
      console.log(`🔧 ${this.fixes.length} correções aplicadas:`)
      this.fixes.forEach(fix => {
        console.log(`  ✓ ${fix}`)
      })
    }

    console.log('\n💡 Próximos passos:')
    console.log('  • Executar testes: npm test')
    console.log('  • Verificar build: npm run build')
    console.log('  • Revisar mudanças: git diff')
  }
}

// Execute auto-fix
new AutoFixer(process.cwd()).fix().catch(console.error)
