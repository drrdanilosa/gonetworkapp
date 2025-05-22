#!/usr/bin/env node

import { execSync } from 'child_process'
import { readdir, readFile, stat } from 'fs/promises'
import { join, relative, extname } from 'path'

interface AuditResult {
  category: string
  file: string
  issues: string[]
  score: number
}

class QuickAuditor {
  private rootPath: string
  private results: AuditResult[] = []

  constructor(rootPath: string) {
    this.rootPath = rootPath
  }

  async audit(): Promise<void> {
    console.log('🔍 AUDITORIA TÉCNICA RÁPIDA')
    console.log('============================\n')

    await this.checkProjectStructure()
    await this.checkConfigurations()
    await this.checkCodeQuality()
    await this.generateReport()
  }

  private async checkProjectStructure(): Promise<void> {
    console.log('📁 Verificando estrutura do projeto...')

    const expectedDirs = [
      'app',
      'components',
      'features',
      'store',
      'services',
      'hooks',
      'validators',
      'types',
      'utils',
      'styles',
      'public',
    ]

    const issues: string[] = []

    for (const dir of expectedDirs) {
      try {
        const dirPath = join(this.rootPath, dir)
        await stat(dirPath)
      } catch {
        issues.push(`Diretório '${dir}' não encontrado`)
      }
    }

    this.results.push({
      category: 'Estrutura',
      file: 'Projeto',
      issues,
      score: Math.max(0, 100 - issues.length * 10),
    })
  }

  private async checkConfigurations(): Promise<void> {
    console.log('⚙️ Verificando configurações...')

    // TypeScript
    await this.checkTsConfig()

    // Tailwind
    await this.checkTailwindConfig()

    // Package.json
    await this.checkPackageJson()
  }

  private async checkTsConfig(): Promise<void> {
    const issues: string[] = []

    try {
      const content = await readFile(
        join(this.rootPath, 'tsconfig.json'),
        'utf-8'
      )
      const config = JSON.parse(content)

      if (!config.compilerOptions?.strict) {
        issues.push('TypeScript strict mode não habilitado')
      }

      if (!config.compilerOptions?.paths) {
        issues.push('Path mapping não configurado')
      }
    } catch {
      issues.push('tsconfig.json não encontrado ou inválido')
    }

    this.results.push({
      category: 'TypeScript',
      file: 'tsconfig.json',
      issues,
      score: Math.max(0, 100 - issues.length * 25),
    })
  }

  private async checkTailwindConfig(): Promise<void> {
    const issues: string[] = []

    try {
      const content = await readFile(
        join(this.rootPath, 'tailwind.config.ts'),
        'utf-8'
      )

      if (!content.includes('hsl(var(')) {
        issues.push('Tema Dracula com CSS variables não detectado')
      }

      if (!content.includes('content:')) {
        issues.push('Configuração de content paths ausente')
      }
    } catch {
      issues.push('tailwind.config.ts não encontrado')
    }

    this.results.push({
      category: 'Tailwind',
      file: 'tailwind.config.ts',
      issues,
      score: Math.max(0, 100 - issues.length * 30),
    })
  }

  private async checkPackageJson(): Promise<void> {
    const issues: string[] = []

    try {
      const content = await readFile(
        join(this.rootPath, 'package.json'),
        'utf-8'
      )
      const pkg = JSON.parse(content)

      if (!pkg.scripts?.build) {
        issues.push('Script de build não encontrado')
      }

      if (!pkg.scripts?.lint) {
        issues.push('Script de lint não encontrado')
      }

      if (!pkg.dependencies?.next) {
        issues.push('Next.js não encontrado como dependência')
      }
    } catch {
      issues.push('package.json não encontrado ou inválido')
    }

    this.results.push({
      category: 'Package',
      file: 'package.json',
      issues,
      score: Math.max(0, 100 - issues.length * 20),
    })
  }

  private async checkCodeQuality(): Promise<void> {
    console.log('🔧 Verificando qualidade do código...')

    await this.walkDirectory(this.rootPath, async filePath => {
      const ext = extname(filePath)
      if (['.ts', '.tsx'].includes(ext)) {
        await this.checkCodeFile(filePath)
      }
    })
  }

  private async checkCodeFile(filePath: string): Promise<void> {
    try {
      const content = await readFile(filePath, 'utf-8')
      const relativePath = relative(this.rootPath, filePath)
      const issues: string[] = []

      // Verificações básicas
      if (content.includes(': any')) {
        issues.push('Uso de tipo "any" detectado')
      }

      if (content.includes('console.log')) {
        issues.push('console.log detectado')
      }

      if (content.includes('useState') && !content.includes('"use client"')) {
        if (relativePath.includes('components/')) {
          issues.push('Componente client sem "use client"')
        }
      }

      if (content.split('\n').length > 200) {
        issues.push('Arquivo muito grande (>200 linhas)')
      }

      if (issues.length > 0) {
        this.results.push({
          category: 'Código',
          file: relativePath,
          issues,
          score: Math.max(0, 100 - issues.length * 15),
        })
      }
    } catch (error) {
      // Ignorar erros de leitura
    }
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
      // Ignorar diretórios inacessíveis
    }
  }

  private generateReport(): void {
    console.log('\n📊 RELATÓRIO DA AUDITORIA')
    console.log('=========================\n')

    const categories = [...new Set(this.results.map(r => r.category))]

    categories.forEach(category => {
      const categoryResults = this.results.filter(r => r.category === category)
      const avgScore =
        categoryResults.reduce((sum, r) => sum + r.score, 0) /
        categoryResults.length

      console.log(`📋 ${category}: ${avgScore.toFixed(1)}/100`)

      categoryResults.forEach(result => {
        if (result.issues.length > 0) {
          console.log(`  📄 ${result.file}`)
          result.issues.forEach(issue => {
            console.log(`    ⚠️ ${issue}`)
          })
        }
      })
      console.log('')
    })

    const overallScore =
      this.results.reduce((sum, r) => sum + r.score, 0) / this.results.length
    console.log(`🎯 Score Geral: ${overallScore.toFixed(1)}/100`)

    console.log('\n💡 PRÓXIMOS PASSOS:')
    console.log('  • Corrigir issues críticas identificadas')
    console.log('  • Executar: npm run lint:audit')
    console.log('  • Executar: npm run audit:fix (quando disponível)')
    console.log('  • Configurar ESLint e Prettier')
  }
}

async function main() {
  const shouldFix = process.argv.includes('--fix')

  const auditor = new QuickAuditor(process.cwd())
  await auditor.audit()

  if (shouldFix) {
    console.log('\n🔧 Executando correções automáticas...')
    try {
      execSync('tsx scripts/auto-fix.ts', { stdio: 'inherit' })
      console.log('✅ Correções aplicadas!')
    } catch (error) {
      console.log('❌ Erro ao aplicar correções:', error)
    }
  }
}

main().catch(console.error)
