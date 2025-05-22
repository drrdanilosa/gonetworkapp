/**
 * Validar email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validar URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Validar formato de vídeo
 */
export function isValidVideoFormat(filename: string): boolean {
  const validFormats = ['.mp4', '.mov', '.avi', '.mkv', '.webm']
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'))
  return validFormats.includes(ext)
}

/**
 * Validar timestamp
 */
export function isValidTimestamp(timestamp: number, duration: number): boolean {
  return timestamp >= 0 && timestamp <= duration
}

/**
 * Sanitizar nome de arquivo
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
}
