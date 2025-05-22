"use client";

import { useProjectsStore } from '@/store/useProjectsStoreExtended';
import { useAuthStore } from '@/store/useAuthStore';
import { Check, MessageSquare, CornerRightDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CommentItemProps {
  projectId: string;
  deliverableId: string;
  comment: {
    id: string;
    userId: string;
    content: string;
    timestamp: number;
    createdAt: string;
    resolved: boolean;
    authorName?: string;
  };
}

export function CommentItem({ projectId, deliverableId, comment }: CommentItemProps) {
  const markCommentResolved = useProjectsStore(state => state.markCommentResolved);
  const currentUser = useAuthStore(state => state.user);
  const isEditor = currentUser?.role === 'editor';

  // Formata timestamp (segundos) para mm:ss
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Formata a data para exibir
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit',
      month: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  return (
    <div className={cn(
      "mb-3 p-3 rounded-lg border relative",
      comment.resolved 
        ? "bg-muted/30 border-green-200 dark:border-green-900" 
        : "bg-card"
    )}>
      {comment.resolved && (
        <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4">
          <div className="bg-green-500 text-white rounded-full p-1">
            <Check size={12} />
          </div>
        </div>
      )}
      <div className="flex items-center gap-2 mb-1.5">
        <MessageSquare size={16} className={cn(
          comment.resolved ? "text-green-600" : "text-muted-foreground"
        )} />
        <span className="text-sm font-medium">
          {comment.authorName || "Usuário"}
        </span>
        <span className="text-xs text-muted-foreground">
          • {formatDate(comment.createdAt)}
        </span>
        
        {comment.timestamp > 0 && (
          <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
            @ {formatTime(comment.timestamp)}
          </span>
        )}
      </div>
      
      <p className="text-sm mb-2">{comment.content}</p>
      
      <div className="flex items-center justify-between">
        <div className={cn(
          "flex items-center text-xs",
          comment.resolved ? "text-green-600" : "text-muted-foreground"
        )}>
          {comment.resolved && (
            <>
              <Check size={14} className="mr-1" />
              <span>Resolvido</span>
            </>
          )}
        </div>
        
        {isEditor && !comment.resolved && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => markCommentResolved(projectId, deliverableId, comment.id)}
            className="text-xs h-7"
          >
            <Check size={14} className="mr-1" />
            Marcar como resolvido
          </Button>
        )}
      </div>
    </div>
  );
}
