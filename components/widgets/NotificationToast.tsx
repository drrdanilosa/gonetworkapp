"use client";

import React from "react";
import { useUIStore } from '@/store/useUIStore';
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function NotificationToast() {
  const notifications = useUIStore(state => state.notifications);
  const removeNotification = useUIStore(state => state.removeNotification);

  if (notifications.length === 0) return null;
  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50 pointer-events-none max-w-md">
      {notifications.map(note => (        <div 
          key={note.id} 
          className={cn(
            "p-4 rounded-lg shadow-lg flex items-center justify-between",
            "border animate-in fade-in slide-in-from-bottom-5",
            "pointer-events-auto",
            note.type === 'success' && "bg-green-50 text-green-900 border-green-200 dark:bg-green-950 dark:text-green-50 dark:border-green-800",
            note.type === 'warning' && "bg-yellow-50 text-yellow-900 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-50 dark:border-yellow-800",
            note.type === 'error' && "bg-red-50 text-red-900 border-red-200 dark:bg-red-950 dark:text-red-50 dark:border-red-800",
            (!note.type || note.type === 'info') && "bg-card text-card-foreground border-border"
          )}
        >
          <span>{note.message}</span>
          <button 
            onClick={() => removeNotification(note.id)} 
            className="ml-4 p-1 rounded-full hover:bg-muted"
            aria-label="Fechar notificação"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
