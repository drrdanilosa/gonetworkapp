import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Tipos para autorização de uso de imagem
interface AutorizacaoUsoImagem {
  id: string
  eventId: string
  nomeAutorizante: string
  documento: string // Tipo de documento (CPF, RG, etc.)
  numeroDocumento: string
  assinatura: string // Base64 da assinatura
  documentoOriginal: string // Base64 do documento carregado
  tipoArquivo: string // pdf, doc, txt, etc.
  dataAutorizacao: string
  observacoes?: string
}

// Tipos para reuniões
interface Reuniao {
  id: string
  eventId: string
  titulo: string
  plataforma: 'meet' | 'zoom' | 'teams' | 'other'
  linkReuniao: string
  dataHora: string
  duracao?: number // em minutos
  participantes: string[]
  arquivos: ArquivoReuniao[]
  status: 'agendada' | 'em_andamento' | 'finalizada' | 'cancelada'
  criadoPor: string
  criadoEm: string
  observacoes?: string
}

interface ArquivoReuniao {
  id: string
  nome: string
  url: string
  tipo: string
  tamanho: number
  uploadedBy: string
  uploadedAt: string
}

interface CaptacaoState {
  autorizacoes: AutorizacaoUsoImagem[]
  reunioes: Reuniao[]

  // Ações para autorizações
  addAutorizacao: (
    autorizacao: Omit<AutorizacaoUsoImagem, 'id' | 'dataAutorizacao'>
  ) => void
  updateAutorizacao: (id: string, data: Partial<AutorizacaoUsoImagem>) => void
  deleteAutorizacao: (id: string) => void
  getAutorizacoesByEvent: (eventId: string) => AutorizacaoUsoImagem[]

  // Ações para reuniões
  addReuniao: (reuniao: Omit<Reuniao, 'id' | 'criadoEm'>) => void
  updateReuniao: (id: string, data: Partial<Reuniao>) => void
  deleteReuniao: (id: string) => void
  getReunioesByEvent: (eventId: string) => Reuniao[]
  addArquivoReuniao: (
    reuniaoId: string,
    arquivo: Omit<ArquivoReuniao, 'id' | 'uploadedAt'>
  ) => void
  removeArquivoReuniao: (reuniaoId: string, arquivoId: string) => void
}

export const useCaptacaoStore = create<CaptacaoState>()(
  persist(
    (set, get) => ({
      autorizacoes: [],
      reunioes: [],

      // Implementação das ações para autorizações
      addAutorizacao: autorizacao =>
        set(state => ({
          autorizacoes: [
            ...state.autorizacoes,
            {
              ...autorizacao,
              id: `auth_${Date.now()}`,
              dataAutorizacao: new Date().toISOString(),
            },
          ],
        })),

      updateAutorizacao: (id, data) =>
        set(state => ({
          autorizacoes: state.autorizacoes.map(auth =>
            auth.id === id ? { ...auth, ...data } : auth
          ),
        })),

      deleteAutorizacao: id =>
        set(state => ({
          autorizacoes: state.autorizacoes.filter(auth => auth.id !== id),
        })),

      getAutorizacoesByEvent: eventId => {
        const state = get()
        return state.autorizacoes.filter(auth => auth.eventId === eventId)
      },

      // Implementação das ações para reuniões
      addReuniao: reuniao =>
        set(state => ({
          reunioes: [
            ...state.reunioes,
            {
              ...reuniao,
              id: `meet_${Date.now()}`,
              criadoEm: new Date().toISOString(),
            },
          ],
        })),

      updateReuniao: (id, data) =>
        set(state => ({
          reunioes: state.reunioes.map(reuniao =>
            reuniao.id === id ? { ...reuniao, ...data } : reuniao
          ),
        })),

      deleteReuniao: id =>
        set(state => ({
          reunioes: state.reunioes.filter(reuniao => reuniao.id !== id),
        })),

      getReunioesByEvent: eventId => {
        const state = get()
        return state.reunioes.filter(reuniao => reuniao.eventId === eventId)
      },

      addArquivoReuniao: (reuniaoId, arquivo) =>
        set(state => ({
          reunioes: state.reunioes.map(reuniao =>
            reuniao.id === reuniaoId
              ? {
                  ...reuniao,
                  arquivos: [
                    ...reuniao.arquivos,
                    {
                      ...arquivo,
                      id: `file_${Date.now()}`,
                      uploadedAt: new Date().toISOString(),
                    },
                  ],
                }
              : reuniao
          ),
        })),

      removeArquivoReuniao: (reuniaoId, arquivoId) =>
        set(state => ({
          reunioes: state.reunioes.map(reuniao =>
            reuniao.id === reuniaoId
              ? {
                  ...reuniao,
                  arquivos: reuniao.arquivos.filter(
                    arquivo => arquivo.id !== arquivoId
                  ),
                }
              : reuniao
          ),
        })),
    }),
    {
      name: 'captacao-storage',
    }
  )
)
