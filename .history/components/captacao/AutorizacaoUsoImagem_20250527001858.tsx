'use client'

import React, { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useCaptacaoStore } from '@/store/useCaptacaoStore'
import { AssinaturaDigital } from './AssinaturaDigital'
import {
  Plus,
  FileText,
  User,
  Calendar,
  Download,
  Trash2,
  CheckCircle,
} from 'lucide-react'
import { format } from 'date-fns'
import { pt } from 'date-fns/locale'

interface AutorizacaoUsoImagemProps {
  eventId: string
}

export function AutorizacaoUsoImagem({ eventId }: AutorizacaoUsoImagemProps) {
  const {
    getAutorizacoesByEvent,
    addAutorizacao,
    deleteAutorizacao,
    updateAutorizacao,
  } = useCaptacaoStore()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSignatureMode, setIsSignatureMode] = useState(false)
  const [currentForm, setCurrentForm] = useState({
    nomeAutorizante: '',
    documento: 'CPF',
    numeroDocumento: '',
    observacoes: '',
    documentoOriginal: '',
    tipoArquivo: '',
    assinatura: '',
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const autorizacoes = getAutorizacoesByEvent(eventId)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Verificar tipos de arquivo permitidos
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ]

    if (!allowedTypes.includes(file.type)) {
      alert('Tipo de arquivo não suportado. Use PDF, DOC, DOCX ou TXT.')
      return
    }

    const reader = new FileReader()
    reader.onload = e => {
      const result = e.target?.result as string
      setCurrentForm(prev => ({
        ...prev,
        documentoOriginal: result,
        tipoArquivo: file.type,
      }))
    }
    reader.readAsDataURL(file)
  }

  const handleSignatureSave = (assinatura: string) => {
    setCurrentForm(prev => ({ ...prev, assinatura }))
    setIsSignatureMode(false)
  }

  const handleSubmit = () => {
    if (
      !currentForm.nomeAutorizante ||
      !currentForm.numeroDocumento ||
      !currentForm.assinatura
    ) {
      alert('Preencha todos os campos obrigatórios e assine o documento.')
      return
    }

    addAutorizacao({
      eventId,
      ...currentForm,
    })

    // Reset form
    setCurrentForm({
      nomeAutorizante: '',
      documento: 'CPF',
      numeroDocumento: '',
      observacoes: '',
      documentoOriginal: '',
      tipoArquivo: '',
      assinatura: '',
    })
    setIsDialogOpen(false)
  }

  const downloadAutorizacao = (autorizacao: any) => {
    // Aqui você criaria um PDF com os dados da autorização
    // Por simplicidade, vou criar um blob com os dados
    const data = {
      nome: autorizacao.nomeAutorizante,
      documento: `${autorizacao.documento}: ${autorizacao.numeroDocumento}`,
      data: format(
        new Date(autorizacao.dataAutorizacao),
        "dd/MM/yyyy 'às' HH:mm",
        { locale: pt }
      ),
      observacoes: autorizacao.observacoes || 'Nenhuma observação adicional',
    }

    const content = `
AUTORIZAÇÃO DE USO DE IMAGEM

Nome: ${data.nome}
Documento: ${data.documento}
Data da Autorização: ${data.data}

Observações: ${data.observacoes}

Autorizo o uso de minha imagem para fins relacionados ao evento.

Assinatura capturada digitalmente em ${data.data}
    `

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `autorizacao_${autorizacao.nomeAutorizante.replace(/\s+/g, '_')}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            Autorização de Uso de Imagem
          </h3>
          <p className="text-sm text-muted-foreground">
            Gerencie autorizações de uso de imagem para o evento
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="size-4" />
              Nova Autorização
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-4xl">
            <DialogHeader>
              <DialogTitle>Nova Autorização de Uso de Imagem</DialogTitle>
            </DialogHeader>

            <ScrollArea className="max-h-[80vh] pr-4">
              {!isSignatureMode ? (
                <div className="space-y-6">
                  {/* Upload de documento base */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <FileText className="size-4" />
                        Documento Base (Opcional)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full"
                      >
                        {currentForm.documentoOriginal
                          ? 'Documento Carregado'
                          : 'Carregar Documento'}
                      </Button>
                      {currentForm.documentoOriginal && (
                        <Badge variant="secondary" className="mt-2">
                          {currentForm.tipoArquivo}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>

                  {/* Dados pessoais */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <User className="size-4" />
                        Dados Pessoais
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="nome">Nome Completo *</Label>
                        <Input
                          id="nome"
                          value={currentForm.nomeAutorizante}
                          onChange={e =>
                            setCurrentForm(prev => ({
                              ...prev,
                              nomeAutorizante: e.target.value,
                            }))
                          }
                          placeholder="Digite o nome completo"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="tipoDoc">Tipo de Documento</Label>
                          <select
                            id="tipoDoc"
                            value={currentForm.documento}
                            onChange={e =>
                              setCurrentForm(prev => ({
                                ...prev,
                                documento: e.target.value,
                              }))
                            }
                            className="w-full rounded-md border border-gray-300 p-2"
                          >
                            <option value="CPF">CPF</option>
                            <option value="RG">RG</option>
                            <option value="CNH">CNH</option>
                            <option value="Passaporte">Passaporte</option>
                          </select>
                        </div>

                        <div>
                          <Label htmlFor="numeroDoc">
                            Número do Documento *
                          </Label>
                          <Input
                            id="numeroDoc"
                            value={currentForm.numeroDocumento}
                            onChange={e =>
                              setCurrentForm(prev => ({
                                ...prev,
                                numeroDocumento: e.target.value,
                              }))
                            }
                            placeholder="Digite o número"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="observacoes">Observações</Label>
                        <Textarea
                          id="observacoes"
                          value={currentForm.observacoes}
                          onChange={e =>
                            setCurrentForm(prev => ({
                              ...prev,
                              observacoes: e.target.value,
                            }))
                          }
                          placeholder="Observações adicionais (opcional)"
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Assinatura */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Assinatura Digital
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {currentForm.assinatura ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="size-4" />
                            <span>Assinatura capturada</span>
                          </div>
                          <img
                            src={currentForm.assinatura}
                            alt="Assinatura"
                            className="max-h-24 rounded border border-gray-300"
                          />
                          <Button
                            variant="outline"
                            onClick={() => setIsSignatureMode(true)}
                          >
                            Refazer Assinatura
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={() => setIsSignatureMode(true)}
                          className="w-full"
                        >
                          Capturar Assinatura
                        </Button>
                      )}
                    </CardContent>
                  </Card>

                  <Separator />

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button onClick={handleSubmit}>Salvar Autorização</Button>
                  </div>
                </div>
              ) : (
                <AssinaturaDigital
                  onSave={handleSignatureSave}
                  onCancel={() => setIsSignatureMode(false)}
                />
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de autorizações */}
      <div className="grid gap-4">
        {autorizacoes.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                <FileText className="mx-auto mb-4 size-12 opacity-50" />
                <p>Nenhuma autorização cadastrada ainda.</p>
                <p className="text-sm">
                  Clique em "Nova Autorização" para começar.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          autorizacoes.map(autorizacao => (
            <Card key={autorizacao.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h4 className="font-semibold">
                      {autorizacao.nomeAutorizante}
                    </h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>
                        {autorizacao.documento}: {autorizacao.numeroDocumento}
                      </p>
                      <p className="flex items-center gap-1">
                        <Calendar className="size-3" />
                        {format(
                          new Date(autorizacao.dataAutorizacao),
                          "dd/MM/yyyy 'às' HH:mm",
                          {
                            locale: pt,
                          }
                        )}
                      </p>
                      {autorizacao.observacoes && (
                        <p className="rounded bg-gray-50 p-2 text-xs">
                          {autorizacao.observacoes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadAutorizacao(autorizacao)}
                    >
                      <Download className="size-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteAutorizacao(autorizacao.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
