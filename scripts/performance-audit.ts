#!/usr/bin/env tsx

'use client'

'use client'

import { readFile, readdir } from 'fs/promises'
import { join, extname, relative } from 'path'

interface PerformanceIssue {
  type:
    | 'heavy-component'
    | 'unnecessary-rerender'
    | 'large-bundle'
    | 'blocking-operation'
  severity: 'low' | 'medium' | 'high'
  message: string
  suggestion: string
  file: string
  line?: number
}

class PerformanceAuditor {
  private rootPath: string
  private issues: PerformanceIssue[] = []

  constructor(rootPath: string) {
    this.rootPath = rootPath
  }

  async audit(): Promise<void> {
    console.log('⚡ Iniciando auditoria de performance...\n')

    await this.auditComponents()
    await this.auditStores()
    await this.auditAPIRoutes()

    this.generatePerformanceReport()
  }

  private async auditComponents(): Promise<void> {
    await this.walkDirectory(
      join(this.rootPath, 'components'),
      async filePath => {
        if (extname(filePath) === '.tsx') {
          await this.auditComponent(filePath)
        }
      }
    )

    await this.walkDirectory(
      join(this.rootPath, 'features'),
      async filePath => {
        if (extname(filePath) === '.tsx') {
          await this.auditComponent(filePath)
        }
      }
    )
  }

  private async auditComponent(filePath: string): Promise<void> {
    try {
      const content = await readFile(filePath, 'utf-8')
      const relativePath = relative(this.rootPath, filePath)
      const lines = content.split('\n')

      // Verificar tamanho do componente
      if (lines.length > 200) {
        this.addIssue({
          type: 'heavy-component',
          severity: 'medium',
          message: `Componente muito grande (${lines.length} linhas)`,
          suggestion: 'Dividir em componentes menores e usar lazy loading',
          file: relativePath,
        })
      }

      // Verificar re-renderizações desnecessárias
      this.checkUnnecessaryRerenders(content, relativePath)

      // Verificar operações pesadas no render
      this.checkBlockingOperations(content, relativePath, lines)
    } catch (error) {
      console.error(`Erro ao auditar ${filePath}:`, error)
    }
  }

  private checkUnnecessaryRerenders(content: string, filePath: string): void {
    // Inline objects em props
    const inlineObjectMatches = content.match(/\w+={{[^}]+}}/g)
    if (inlineObjectMatches && inlineObjectMatches.length > 3) {
      this.addIssue({
        type: 'unnecessary-rerender',
        severity: 'medium',
        message: 'Múltiplos objetos inline em props detectados',
        suggestion: 'Usar useMemo ou extrair para constantes',
        file: filePath,
      })
    }

    // Funções inline
    const inlineFunctionMatches = content.match(/\w+={\(\w*\)\s*=>/g)
    if (inlineFunctionMatches && inlineFunctionMatches.length > 2) {
      this.addIssue({
        type: 'unnecessary-rerender',
        severity: 'medium',
        message: 'Múltiplas funções inline detectadas',
        suggestion: 'Usar useCallback para otimizar',
        file: filePath,
      })
    }

    // Falta de React.memo em componentes que recebem muitas props
    const propsCount = (content.match(/props\.\w+/g) || []).length
    if (propsCount > 5 && !content.includes('memo(')) {
      this.addIssue({
        type: 'unnecessary-rerender',
        severity: 'low',
        message: 'Componente com muitas props sem memo',
        suggestion: 'Considerar uso de React.memo',
        file: filePath,
      })
    }
  }

  private checkBlockingOperations(
    content: string,
    filePath: string,
    lines: string[]
  ): void {
    lines.forEach((line, index) => {
      // Operações síncronas pesadas no render
      if (line.includes('.sort(') || line.includes('.filter(')) {
        if (!line.includes('useMemo') && !line.includes('useCallback')) {
          this.addIssue({
            type: 'blocking-operation',
            severity: 'high',
            message: 'Operação de array pesada no render',
            suggestion: 'Usar useMemo para cachear resultado',
            file: filePath,
            line: index + 1,
          })
        }
      }

      // Loops complexos no JSX
      if (line.includes('.map(') && line.includes('.map(')) {
        this.addIssue({
          type: 'blocking-operation',
          severity: 'medium',
          message: 'Map aninhado detectado',
          suggestion: 'Otimizar estrutura de dados ou usar useMemo',
          file: filePath,
          line: index + 1,
        })
      }
    })
  }

  private async auditStores(): Promise<void> {
    try {
      const storeDir = join(this.rootPath, 'store')
      await this.walkDirectory(storeDir, async filePath => {
        if (extname(filePath) === '.ts') {
          await this.auditStore(filePath)
        }
      })
    } catch (error) {
      // Store directory doesn't exist
    }
  }

  private async auditStore(filePath: string): Promise<void> {
    try {
      const content = await readFile(filePath, 'utf-8')
      const relativePath = relative(this.rootPath, filePath)

      // Store muito grande
      const lines = content.split('\n')
      if (lines.length > 150) {
        this.addIssue({
          type: 'heavy-component',
          severity: 'medium',
          message: `Store muito grande (${lines.length} linhas)`,
          suggestion: 'Dividir em múltiplos stores menores',
          file: relativePath,
        })
      }

      // Muitas propriedades no estado
      const stateProperties = content.match(/\w+:\s*\w+/g) || []
      if (stateProperties.length > 20) {
        this.addIssue({
          type: 'heavy-component',
          severity: 'low',
          message: 'Store com muitas propriedades no estado',
          suggestion: 'Normalizar estado ou dividir em stores menores',
          file: relativePath,
        })
      }
    } catch (error) {
      console.error(`Erro ao auditar store ${filePath}:`, error)
    }
  }

  private async auditAPIRoutes(): Promise<void> {
    try {
      const apiDir = join(this.rootPath, 'app', 'api')
      await this.walkDirectory(apiDir, async filePath => {
        if (filePath.endsWith('route.ts')) {
          await this.auditAPIRoute(filePath)
        }
      })
    } catch (error) {
      // API directory doesn't exist
    }
  }

  private async auditAPIRoute(filePath: string): Promise<void> {
    try {
      const content = await readFile(filePath, 'utf-8')
      const relativePath = relative(this.rootPath, filePath)

      // Operações síncronas em API routes
      if (
        content.includes('readFileSync') ||
        content.includes('writeFileSync')
      ) {
        this.addIssue({
          type: 'blocking-operation',
          severity: 'high',
          message: 'Operações síncronas de arquivo em API route',
          suggestion: 'Usar versões assíncronas (readFile, writeFile)',
          file: relativePath,
        })
      }

      // Falta de tratamento de erro
      if (!content.includes('try') && !content.includes('catch')) {
        this.addIssue({
          type: 'blocking-operation',
          severity: 'medium',
          message: 'API route sem tratamento de erro',
          suggestion: 'Adicionar try/catch para melhor handling',
          file: relativePath,
        })
      }
    } catch (error) {
      console.error(`Erro ao auditar API route ${filePath}:`, error)
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

        if (entry.isDirectory() && !entry.name.startsWith('.')) {
          await this.walkDirectory(fullPath, callback)
        } else if (entry.isFile()) {
          await callback(fullPath)
        }
      }
    } catch (error) {
      // Directory doesn't exist or can't be read
    }
  }

  private addIssue(issue: PerformanceIssue): void {
    this.issues.push(issue)
  }

  private generatePerformanceReport(): void {
    console.log('\n⚡ RELATÓRIO DE PERFORMANCE')
    console.log('===========================\n')

    const highIssues = this.issues.filter(i => i.severity === 'high')
    const mediumIssues = this.issues.filter(i => i.severity === 'medium')
    const lowIssues = this.issues.filter(i => i.severity === 'low')

    console.log(`🔴 Issues críticas: ${highIssues.length}`)
    console.log(`🟡 Issues médias: ${mediumIssues.length}`)
    console.log(`🟢 Issues baixas: ${lowIssues.length}`)
    console.log('')

    if (highIssues.length > 0) {
      console.log('🔴 ISSUES CRÍTICAS DE PERFORMANCE:')
      highIssues.forEach(issue => {
        console.log(
          `\n📄 ${issue.file} ${issue.line ? `(linha ${issue.line})` : ''}`
        )
        console.log(`  ❌ ${issue.message}`)
        console.log(`  💡 ${issue.suggestion}`)
      })
    }

    if (mediumIssues.length > 0) {
      console.log('\n🟡 ISSUES MÉDIAS:')
      mediumIssues.forEach(issue => {
        console.log(
          `\n📄 ${issue.file} ${issue.line ? `(linha ${issue.line})` : ''}`
        )
        console.log(`  ⚠️ ${issue.message}`)
        console.log(`  💡 ${issue.suggestion}`)
      })
    }

    console.log('\n🎯 RECOMENDAÇÕES GERAIS:')
    console.log(
      '  • Use React.memo para componentes que recebem props estáveis'
    )
    console.log('  • Implemente lazy loading para componentes pesados')
    console.log('  • Use useMemo e useCallback para operações custosas')
    console.log('  • Divida stores grandes em módulos menores')
    console.log('  • Otimize operações de array com useMemo')

    console.log('\n✅ Auditoria de performance concluída!')
  }
}

// Executar auditoria
async function main() {
  const auditor = new PerformanceAuditor(process.cwd())
  await auditor.audit()
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}

export { PerformanceAuditor }
