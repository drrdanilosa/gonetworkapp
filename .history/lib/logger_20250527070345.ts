/**
 * Sistema de logging estruturado para substituir console.log
 * Permite diferentes níveis de log e formatação consistente
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: string
  data?: unknown
  error?: Error
}

class Logger {
  private level: LogLevel
  private context: string

  constructor(context: string = 'App', level: LogLevel = LogLevel.INFO) {
    this.context = context
    this.level = process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : level
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.level
  }

  private formatMessage(entry: LogEntry): string {
    const levelName = LogLevel[entry.level]
    const contextStr = entry.context ? `[${entry.context}]` : ''
    return `${entry.timestamp} ${levelName} ${contextStr} ${entry.message}`
  }

  private log(level: LogLevel, message: string, data?: unknown, error?: Error) {
    if (!this.shouldLog(level)) return

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: this.context,
      data,
      error,
    }

    const formattedMessage = this.formatMessage(entry)

    // Em desenvolvimento, usar console nativo com cores
    if (process.env.NODE_ENV === 'development') {
      switch (level) {
        case LogLevel.ERROR:
          console.error(formattedMessage, data, error)
          break
        case LogLevel.WARN:
          console.warn(formattedMessage, data)
          break
        case LogLevel.INFO:
          console.info(formattedMessage, data)
          break
        case LogLevel.DEBUG:
          console.debug(formattedMessage, data)
          break
      }
    } else {
      // Em produção, você pode enviar para um serviço de logging
      // Por exemplo: Sentry, LogRocket, ou um endpoint personalizado
      this.sendToLoggingService(entry)
    }
  }

  private sendToLoggingService(entry: LogEntry) {
    // Implementar integração com serviço de logging externo
    // Por exemplo:
    /*
    try {
      fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
    } catch (error) {
      // Fallback para console em caso de falha
      console.error('Failed to send log to service:', entry);
    }
    */
  }

  error(message: string, error?: Error, data?: unknown) {
    this.log(LogLevel.ERROR, message, data, error)
  }

  warn(message: string, data?: unknown) {
    this.log(LogLevel.WARN, message, data)
  }

  info(message: string, data?: unknown) {
    this.log(LogLevel.INFO, message, data)
  }

  debug(message: string, data?: unknown) {
    this.log(LogLevel.DEBUG, message, data)
  }

  // Método para criar um logger com contexto específico
  withContext(context: string): Logger {
    return new Logger(`${this.context}:${context}`, this.level)
  }
}

// Instância padrão do logger
export const logger = new Logger()

// Factory function para criar loggers com contexto específico
export function createLogger(context: string): Logger {
  return new Logger(context)
}

// Hook para uso em React components
export function useLogger(context: string) {
  return createLogger(context)
}

// Utilitários para logging de performance
export function logPerformance(name: string, startTime: number) {
  const duration = performance.now() - startTime
  logger.debug(`Performance: ${name} took ${duration.toFixed(2)}ms`)
}

export function withPerformanceLogging<T extends (...args: unknown[]) => any>(
  name: string,
  fn: T
): T {
  return ((...args: unknown[]) => {
    const start = performance.now()
    const result = fn(...args)

    if (result instanceof Promise) {
      return result.finally(() => {
        logPerformance(name, start)
      })
    } else {
      logPerformance(name, start)
      return result
    }
  }) as T
}
