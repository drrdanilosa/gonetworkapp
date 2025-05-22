#!/usr/bin/env node

import { readFile, readdir, stat } from 'fs/promises'
import { join, relative, extname } from 'path'

interface Issue {
  type: 'error' | 'warning' | 'info'
  message: string
  file: string
  line?: number
}

class SimpleAuditor {
  private issues: Issue[] = []
  private rootPath: string

  constructor(rootPath: string) {
    this.rootPath = rootPath
  }

  async run(): Promise<void> {
    console.log('🔍 Auditoria Simples do Projeto\n')

    await this.checkBasicStructure()
    await this.scanCodeFiles()
    this.printReport()
  }

  private async checkBasicStructure(): Promise<void> {
    const requiredFiles = [
      'package.json',
      'tsconfig.json',
      'next.config.js',
      'tailwind.config.ts',
    ]

    for (const file of requiredFiles) {
      try {
        await stat(join(this.rootPath, file))
      } catch {
        this.addIssue(
          'error',
          `Arquivo obrigatório não encontrado: ${file}`,
          file
        )
      }
    }
  }

  private async scanCodeFiles(): Promise<void> {
    await this.walkDir(this.rootPath, async filePath => {
      if (['.ts', '.tsx', '.js', '.jsx'].includes(extname(filePath))) {
        await this.auditFile(filePath)
      }
    })
  }

  private async auditFile(filePath: string): Promise<void> {
    try {
      const content = await readFile(filePath, 'utf-8')
      const lines = content.split('\n')
      const relativePath = relative(this.rootPath, filePath)

      lines.forEach((line, index) => {
        // Console.log check
        if (line.includes('console.log')) {
          this.addIssue(
            'warning',
            'console.log encontrado',
            relativePath,
            index + 1
          )
        }

        // Any type check
        if (line.includes(': any')) {
          this.addIssue('warning', 'Tipo "any" usado', relativePath, index + 1)
        }

        // TODO comments
        if (line.includes('TODO') || line.includes('FIXME')) {
          this.addIssue(
            'info',
            'TODO/FIXME encontrado',
            relativePath,
            index + 1
          )
        }
      })

      // File size check
      if (lines.length > 300) {
        this.addIssue(
          'warning',
          `Arquivo muito grande (${lines.length} linhas)`,
          relativePath
        )
      }
    } catch (error) {
      this.addIssue(
        'error',
        `Erro ao ler arquivo: ${error}`,
        relative(this.rootPath, filePath)
      )
    }
  }

  private async walkDir(
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
          await this.walkDir(fullPath, callback)
        } else if (entry.isFile()) {
          await callback(fullPath)
        }
      }
    } catch {
      // Ignore inaccessible directories
    }
  }

  private addIssue(
    type: Issue['type'],
    message: string,
    file: string,
    line?: number
  ): void {
    this.issues.push({ type, message, file, line })
  }

  private printReport(): void {
    console.log('\n📊 RELATÓRIO DE AUDITORIA')
    console.log('========================\n')

    const errors = this.issues.filter(i => i.type === 'error')
    const warnings = this.issues.filter(i => i.type === 'warning')
    const infos = this.issues.filter(i => i.type === 'info')

    console.log(`❌ Erros: ${errors.length}`)
    console.log(`⚠️ Avisos: ${warnings.length}`)
    console.log(`ℹ️ Informações: ${infos.length}`)
    console.log('')

    if (errors.length > 0) {
      console.log('❌ ERROS:')
      errors.forEach(issue => {
        console.log(`  📄 ${issue.file}${issue.line ? `:${issue.line}` : ''}`)
        console.log(`     ${issue.message}`)
      })
      console.log('')
    }

    if (warnings.length > 0) {
      console.log('⚠️ AVISOS:')
      warnings.slice(0, 10).forEach(issue => {
        console.log(`  📄 ${issue.file}${issue.line ? `:${issue.line}` : ''}`)
        console.log(`     ${issue.message}`)
      })
      if (warnings.length > 10) {
        console.log(`  ... e mais ${warnings.length - 10} avisos`)
      }
      console.log('')
    }

    console.log('✅ Auditoria concluída!')

    if (errors.length === 0 && warnings.length < 5) {
      console.log('🎉 Projeto em boa condição!')
    } else {
      console.log('💡 Considere corrigir os issues identificados')
    }
  }
}

// Execute audit
new SimpleAuditor(process.cwd()).run().catch(console.error)
