"use client";

import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useProjectsStore } from '@/store/useProjectsStoreExtended';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, AlertCircle, Clock, CheckCheck, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeliverableActionsProps {
  projectId: string;
  deliverable: {
    id: string;
    title: string;
    status?: string;
  };
}

export function DeliverableActions({ projectId, deliverable }: DeliverableActionsProps) {
  const user = useAuthStore(state => state.user);
  const markVideoReady = useProjectsStore(state => state.markVideoReady);
  const approveDeliverable = useProjectsStore(state => state.approveDeliverable);
  const requestChanges = useProjectsStore(state => state.requestChanges);
  
  const [commentText, setCommentText] = useState("");
  const [showCommentInput, setShowCommentInput] = useState(false);

  const isEditor = user?.role === 'editor';
  const isClient = user?.role === 'client';
  const status = deliverable.status || 'editing';

  // Função para exibir o status atual visualmente
  const renderStatusBadge = () => {
    switch(status) {
      case 'editing':
        return (
          <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
            <Clock size={16} />
            <span>Em edição</span>
          </div>
        );
      case 'ready_for_review':
        return (
          <div className="flex items-center gap-1.5 text-amber-500 text-sm">
            <AlertCircle size={16} />
            <span>Aguardando aprovação</span>
          </div>
        );
      case 'changes_requested':
        return (
          <div className="flex items-center gap-1.5 text-red-500 text-sm">
            <AlertCircle size={16} />
            <span>Alterações solicitadas</span>
          </div>
        );
      case 'approved':
        return (
          <div className="flex items-center gap-1.5 text-green-500 text-sm">
            <CheckCircle size={16} />
            <span>Aprovado</span>
          </div>
        );
      default:
        return null;
    }
  };
    // Função para lidar com solicitação de alterações
  const handleRequestChanges = () => {
    if (showCommentInput) {
      // Se o input de comentário está visível, enviar a solicitação com o comentário
      if (commentText.trim()) {
        requestChanges(projectId, deliverable.id, commentText);
        setCommentText("");
        setShowCommentInput(false);
      }
    } else {
      // Mostrar o input de comentário primeiro
      setShowCommentInput(true);
    }
  };
  
  // Resetar o comentário quando o input é fechado
  const handleCancelComment = () => {
    setCommentText("");
    setShowCommentInput(false);
  };

  if (isEditor) {
    // Ações para o Editor
    return (
      <div className="space-y-3 mt-4">
        {renderStatusBadge()}
        
        {(status === 'editing' || status === 'changes_requested') && (
          <Button 
            onClick={() => markVideoReady(projectId, deliverable.id)}
            className="w-full"
          >
            <CheckCheck className="mr-2" size={16} />
            Marcar como pronto para revisão
          </Button>
        )}
      </div>
    );
  }
  
  if (isClient) {
    // Ações para o Cliente
    return (
      <div className="space-y-3 mt-4">
        {renderStatusBadge()}
        
        {status === 'ready_for_review' && (
          <div className="flex flex-col gap-4">
            {showCommentInput && (
              <div className="space-y-2">
                <Textarea
                  placeholder="Descreva as alterações necessárias..."
                  className="w-full"
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                />
                <div className="flex justify-between">                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleCancelComment}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    size="sm"
                    onClick={handleRequestChanges}
                    disabled={commentText.trim().length === 0}
                  >
                    <Send className="mr-2" size={14} />
                    Enviar feedback
                  </Button>
                </div>
              </div>
            )}
            
            {!showCommentInput && (
              <div className="flex gap-2">
                <Button 
                  onClick={() => approveDeliverable(projectId, deliverable.id)}
                  className="flex-1"
                  variant="default"
                >
                  <CheckCheck className="mr-2" size={16} />
                  Aprovar
                </Button>
                <Button 
                  onClick={handleRequestChanges}
                  className="flex-1"
                  variant="outline"
                >
                  Solicitar alterações
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return null;
}
