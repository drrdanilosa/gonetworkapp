// hooks/use-socket.ts
import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import SocketService from '@/lib/socket-service';

// Este hook permite usar o serviço Socket.io de forma fácil em qualquer componente
export function useSocket(sessionId?: string, user?: any) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Inicializa a conexão Socket.io
    const socketService = new SocketService();
    const socketInstance = socketService.connect();

    if (!socketInstance) {
      setError(new Error('Falha ao inicializar o socket'));
      return;
    }

    socketInstance.on('connect', () => {
      console.log('Socket conectado');
      setConnected(true);
      
      // Se temos ID de sessão e usuário, entrar na sala
      if (sessionId && user) {
        socketService.joinSession(sessionId, user);
      }
    });

    socketInstance.on('connect_error', (err) => {
      console.error('Erro de conexão Socket.io:', err);
      setError(err);
      setConnected(false);
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket desconectado');
      setConnected(false);
    });

    setSocket(socketInstance);

    // Cleanup na desmontagem do componente
    return () => {
      if (sessionId) {
        socketService.leaveSession();
      }
      socketService.disconnect();
    };
  }, [sessionId, user]); // Reconecte quando o sessionId ou user mudar

  return { socket, connected, error };
}

export default useSocket;
