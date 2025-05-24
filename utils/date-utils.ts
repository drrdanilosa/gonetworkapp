import { format as fnsFormat, isValid, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

/**
 * Formata uma data de forma segura, retornando um valor padrão se a data for inválida.
 *
 * @param date Data a ser formatada (string ISO, Date ou timestamp)
 * @param formatStr String de formato para date-fns
 * @param options Opções adicionais, incluindo locale
 * @param defaultValue Valor padrão a ser retornado se a data for inválida
 * @returns String formatada ou o valor padrão se a data for inválida
 */
export function formatDate(
  date: string | Date | number | undefined | null,
  formatStr: string = 'dd/MM/yyyy',
  options: { locale?: Locale } = { locale: ptBR },
  defaultValue: string = 'Data desconhecida'
): string {
  if (!date) return defaultValue

  try {
    let dateObj: Date

    if (typeof date === 'string') {
      // Tenta converter string para Date
      dateObj = parseISO(date)
    } else if (date instanceof Date) {
      dateObj = date
    } else if (typeof date === 'number') {
      dateObj = new Date(date)
    } else {
      return defaultValue
    }

    // Verifica se a data é válida
    if (!isValid(dateObj)) {
      return defaultValue
    }

    return fnsFormat(dateObj, formatStr, options)
  } catch (error) {
    console.error('Erro ao formatar data:', error)
    return defaultValue
  }
}

/**
 * Verifica se uma data é válida
 *
 * @param date Data a ser verificada (string ISO, Date ou timestamp)
 * @returns Boolean indicando se a data é válida
 */
export function isValidDate(
  date: string | Date | number | undefined | null
): boolean {
  if (!date) return false

  try {
    let dateObj: Date

    if (typeof date === 'string') {
      dateObj = parseISO(date)
    } else if (date instanceof Date) {
      dateObj = date
    } else if (typeof date === 'number') {
      dateObj = new Date(date)
    } else {
      return false
    }

    return isValid(dateObj)
  } catch (error) {
    return false
  }
}
