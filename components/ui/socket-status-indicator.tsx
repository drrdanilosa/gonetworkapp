// components/ui/socket-status-indicator.tsx
"use client";

import { useEffect, useState } from 'react';
import { Wifi, WifiOff, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import useSocket from '@/hooks/use-socket';
import { buttonVariants } from './button';
import Link from 'next/link';

interface SocketStatusIndicatorProps {
  className?: string;
  showTooltip?: boolean;
  showDetailsButton?: boolean;
}

export function SocketStatusIndicator({ 
  className = '', 
  showTooltip = true, 
  showDetailsButton = false 
}: SocketStatusIndicatorProps) {
  const { connected, error, socket } = useSocket();
  const [showDetails, setShowDetails] = useState(false);
  const [lastPingTime, setLastPingTime] = useState<number | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  
  // Função para testar a latência do socket
  const pingServer = () => {
    if (!socket || !connected) return;
    
    const startTime = Date.now();
    setLastPingTime(startTime);
    
    socket.emit('ping', { timestamp: startTime }, (response: any) => {
      if (response && response.success) {
        const endTime = Date.now();
        setLatency(endTime - startTime);
      }
    });
  };
  
  // Ping periódico quando conectado
  useEffect(() => {
    if (!connected || !socket) return;
    
    // Ping inicial após conexão
    pingServer();
    
    // Ping a cada 30 segundos
    const interval = setInterval(pingServer, 30000);
    
    return () => clearInterval(interval);
  }, [connected, socket]);
  
  // Mostrar detalhes temporariamente ao passar o mouse
  const handleMouseEnter = () => setShowDetails(true);
  const handleMouseLeave = () => setShowDetails(false);
    // Componente básico do indicador
  const indicator = (
    <div 
      className={`flex items-center ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {connected ? (
        latency !== null ? (
          <Tooltip>
            <TooltipTrigger>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="text-xs">Latência: {latency}ms</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          <Wifi className="h-4 w-4 text-green-500" />
        )
      ) : (
        <WifiOff className="h-4 w-4 text-red-500" />
      )}
    </div>
  );
  
  // Conteúdo do tooltip
  const tooltipContent = (
    <>
      <p className="font-semibold">{connected ? 'Conectado ao servidor de colaboração' : 'Desconectado do servidor de colaboração'}</p>
      {latency !== null && connected && (
        <p className="text-xs">Latência: <span className={latency > 300 ? 'text-yellow-500' : 'text-green-500'}>{latency}ms</span></p>
      )}
      {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
      {showDetailsButton && (
        <div className="mt-2">
          <Link 
            href="/admin/diagnosticos" 
            className={buttonVariants({ variant: "link", size: "sm", className: "h-auto p-0 text-xs" })}
          >
            Ver diagnóstico detalhado
          </Link>
        </div>
      )}
    </>
  );
  
  // Se não quiser tooltip, retornar apenas o indicador
  if (!showTooltip) return indicator;
  
  // Com tooltip
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {indicator}
        </TooltipTrigger>
        <TooltipContent>
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
