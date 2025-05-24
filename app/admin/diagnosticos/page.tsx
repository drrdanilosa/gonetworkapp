// app/admin/diagnosticos/page.tsx
import { Metadata } from 'next'
import Link from 'next/link'
import SocketConnectionTest from '@/components/diagnostics/socket-test'
import { FileText } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Diagnóstico de Sistema | MelhorApp',
  description: 'Ferramentas de diagnóstico para administradores',
}

export default function DiagnosticPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold">Ferramentas de Diagnóstico</h1>

      <div className="grid gap-6">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Diagnóstico de Conexão Socket.io
            </h2>
            <Link
              href="/docs/socket-io-cors.md"
              target="_blank"
              className="flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <FileText className="mr-1 size-4" />
              Documentação de CORS
            </Link>
          </div>
          <SocketConnectionTest />
        </div>

        {/* Recursos de documentação */}
        <div className="mt-6 rounded-md border bg-gray-50 p-4 dark:bg-gray-800">
          <h3 className="mb-2 font-medium">Recursos de Solução de Problemas</h3>
          <ul className="space-y-2">
            <li>
              <Link
                href="/docs/socket-io-cors.md"
                target="_blank"
                className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <FileText className="mr-1 size-4" />
                Como resolver problemas de CORS com Socket.io
              </Link>
            </li>
          </ul>
        </div>

        {/* Outros diagnósticos podem ser adicionados aqui */}
        <div className="mt-8 text-sm text-gray-500">
          <p>
            Esta página contém ferramentas de diagnóstico para identificar e
            resolver problemas técnicos na aplicação. Acesso restrito a
            administradores.
          </p>
        </div>
      </div>
    </div>
  )
}
