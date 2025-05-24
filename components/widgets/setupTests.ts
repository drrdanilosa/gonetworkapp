import '@testing-library/jest-dom'
import { configure } from '@testing-library/react'
import { TextDecoder, TextEncoder } from 'util'
import { vi } from 'vitest'

// Configurações globais para testes
configure({
  testIdAttribute: 'data-testid',
})

// Mock para localStorage
class LocalStorageMock {
  private store: Record<string, string> = {}

  clear() {
    this.store = {}
  }

  getItem(key: string) {
    return this.store[key] || null
  }

  setItem(key: string, value: string) {
    this.store[key] = value.toString()
  }

  removeItem(key: string) {
    delete this.store[key]
  }
}

// Configuração de mocks globais
global.localStorage = new LocalStorageMock() as unknown as Storage
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Polyfills necessários para o ambiente de teste
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder as any

// Mock para window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock para URL.createObjectURL
window.URL.createObjectURL = vi.fn(() => 'mock-url')
