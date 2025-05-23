import fs from 'fs/promises'
import path from 'path'

const LOCK_TIMEOUT = 5000 // 5 segundos

export async function acquireLock(filePath: string): Promise<boolean> {
  const lockFile = `${filePath}.lock`
  const start = Date.now()
  while (true) {
    try {
      await fs.open(lockFile, 'wx')
      return true
    } catch (err: any) {
      if (err.code !== 'EEXIST') throw err
      // Se o lock já existe, verifica se está expirado
      try {
        const stat = await fs.stat(lockFile)
        if (Date.now() - stat.mtimeMs > LOCK_TIMEOUT) {
          await fs.unlink(lockFile)
          continue
        }
      } catch {}
      if (Date.now() - start > LOCK_TIMEOUT) return false
      await new Promise(res => setTimeout(res, 100))
    }
  }
}

export async function releaseLock(filePath: string) {
  const lockFile = `${filePath}.lock`
  try {
    await fs.unlink(lockFile)
  } catch {}
}
