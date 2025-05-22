"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCollaboration } from "@/contexts/collaboration-context"
import { Users, UserPlus, Link, Copy, Check } from "lucide-react"
import ActiveUsersDisplay from "./active-users-display"

interface CollaborationPanelProps {
  videoId: string
  videoTitle: string
}

export default function CollaborationPanel({ videoId, videoTitle }: CollaborationPanelProps) {
  const { isConnected, isJoined, sessionId, joinSession, leaveSession, activeUsers } = useCollaboration()

  const [userName, setUserName] = useState("")
  const [userRole, setUserRole] = useState("editor")
  const [joinSessionId, setJoinSessionId] = useState(videoId)
  const [copied, setCopied] = useState(false)

  const handleJoinSession = () => {
    if (!userName.trim()) return
    joinSession(joinSessionId, userName, userRole)
  }

  const handleLeaveSession = () => {
    leaveSession()
  }

  const copySessionLink = () => {
    const url = new URL(window.location.href)
    url.searchParams.set("session", sessionId || "")
    navigator.clipboard.writeText(url.toString())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isJoined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Colaboração em Tempo Real</CardTitle>
          <CardDescription>Trabalhe em conjunto com outros usuários para revisar e anotar este vídeo.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="join">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="join">Entrar em Sessão</TabsTrigger>
              <TabsTrigger value="create">Criar Sessão</TabsTrigger>
            </TabsList>

            <TabsContent value="join">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="session-id">ID da Sessão</Label>
                  <Input
                    id="session-id"
                    value={joinSessionId}
                    onChange={(e) => setJoinSessionId(e.target.value)}
                    placeholder="Digite o ID da sessão"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="user-name">Seu Nome</Label>
                  <Input
                    id="user-name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Digite seu nome"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="user-role">Sua Função</Label>
                  <Select value={userRole} onValueChange={setUserRole}>
                    <SelectTrigger id="user-role">
                      <SelectValue placeholder="Selecione sua função" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="diretor">Diretor</SelectItem>
                      <SelectItem value="cliente">Cliente</SelectItem>
                      <SelectItem value="produtor">Produtor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="create">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-session-name">Nome da Sessão</Label>
                  <Input
                    id="new-session-name"
                    value={videoTitle}
                    disabled
                    placeholder="Nome da sessão (baseado no vídeo)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-session-id">ID da Sessão</Label>
                  <Input
                    id="new-session-id"
                    value={videoId}
                    disabled
                    placeholder="ID da sessão (gerado automaticamente)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="creator-name">Seu Nome</Label>
                  <Input
                    id="creator-name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Digite seu nome"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="creator-role">Sua Função</Label>
                  <Select value={userRole} onValueChange={setUserRole}>
                    <SelectTrigger id="creator-role">
                      <SelectValue placeholder="Selecione sua função" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="diretor">Diretor</SelectItem>
                      <SelectItem value="cliente">Cliente</SelectItem>
                      <SelectItem value="produtor">Produtor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" disabled={!isConnected}>
            <Users className="mr-2 h-4 w-4" />
            {isConnected ? "Conectado" : "Desconectado"}
          </Button>
          <Button onClick={handleJoinSession} disabled={!isConnected || !userName.trim()}>
            <UserPlus className="mr-2 h-4 w-4" />
            {isConnected ? "Entrar na Sessão" : "Conectando..."}
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle>Sessão Colaborativa</CardTitle>
          <Button variant="ghost" size="sm" onClick={copySessionLink}>
            {copied ? <Check className="h-4 w-4 mr-2 text-green-500" /> : <Link className="h-4 w-4 mr-2" />}
            {copied ? "Copiado!" : "Compartilhar"}
          </Button>
        </div>
        <CardDescription>
          ID da Sessão: {sessionId}{" "}
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0"
            onClick={() => navigator.clipboard.writeText(sessionId || "")}
          >
            <Copy className="h-3 w-3" />
          </Button>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ActiveUsersDisplay />
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" onClick={handleLeaveSession}>
          Sair da Sessão
        </Button>
      </CardFooter>
    </Card>
  )
}
