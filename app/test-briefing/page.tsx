import React from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

export default function TestBriefingIndex() {
  const testIds = ['test-1', 'test-2', 'test-3', 'test-dashboard']

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-3xl font-bold">Testes de Briefing</h1>

      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="mb-4 text-xl font-bold">
            Teste de Persistência entre Abas
          </h2>
          <p className="mb-4">
            Esse teste permite verificar se os dados do briefing são persistidos
            corretamente e mantidos consistentes entre diferentes abas e sessões
            de navegador.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {testIds.map(id => (
              <Link href={`/test-briefing/${id}`} key={id}>
                <Button variant="outline" className="w-full">
                  Teste ID: {id}
                </Button>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-xl font-bold">Instruções</h2>
          <ol className="list-decimal space-y-3 pl-5">
            <li>
              Clique em um dos botões de teste para abrir uma página de teste
              com um ID específico
            </li>
            <li>Crie um briefing de teste usando o botão na página</li>
            <li>Abra o mesmo ID de teste em outra aba ou navegador</li>
            <li>
              Verifique se os dados aparecem consistentemente em ambas as abas
            </li>
            <li>
              Faça alterações em uma das abas e atualize a outra para confirmar
              a sincronização
            </li>
          </ol>
        </Card>
      </div>

      <div className="rounded-md border border-blue-200 bg-blue-50 p-6">
        <h3 className="mb-2 font-medium text-blue-800">Nota Importante</h3>
        <p className="text-blue-700">
          Esta página de teste demonstra a funcionalidade de persistência de
          dados implementada nas correções do sistema de abas. Os dados são
          persistidos em um arquivo JSON no servidor, permitindo consistência
          entre diferentes sessões e abas do navegador.
        </p>
      </div>
    </div>
  )
}
