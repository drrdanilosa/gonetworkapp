// scripts/socket-server-teste.js
const { Server } = require('socket.io');
const http = require('http');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

// Tenta carregar variáveis de ambiente do arquivo .env se existir
try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    console.log('Carregando variáveis de ambiente de .env.local');
    require('dotenv').config({ path: envPath });
  } else {
    console.log('Arquivo .env.local não encontrado. Usando valores padrão.');
  }
} catch (error) {
  console.log('Erro ao carregar variáveis de ambiente:', error.message);
}

// Criando um servidor HTTP básico
const httpServer = http.createServer();

// Segurança: geração de token para autenticação (simplificada para demonstração)
const generateToken = (sessionId, userId) => {
  const secret = process.env.SOCKET_SECRET || 'melhorapp-socket-secret';
  return crypto
    .createHmac('sha256', secret)
    .update(`${sessionId}:${userId}`)
    .digest('hex');
};

// Verificar token (exemplo de implementação de segurança)
const verifyToken = (token, sessionId, userId) => {
  return token === generateToken(sessionId, userId);
};

// Configurando o servidor Socket.io
const io = new Server(httpServer, {
  cors: {
    // Permitir conexões do frontend Next.js em desenvolvimento
    origin: process.env.SOCKET_CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  },
  // Configurações adicionais de segurança
  maxHttpBufferSize: 1e6, // 1MB (limite o tamanho para prevenir ataques de buffer)
  pingTimeout: 20000,
  pingInterval: 25000
});

// Eventos de conexão
io.on('connection', (socket) => {
  console.log(`Cliente conectado: ${socket.id}`);
  
  // Evento de desconexão
  socket.on('disconnect', () => {
    console.log(`Cliente desconectado: ${socket.id}`);
  });
  
  // Adicionar resposta ao ping para diagnóstico
  socket.on('ping', (data, callback) => {
    console.log(`Ping recebido de ${socket.id}`);
    if (callback && typeof callback === 'function') {
      callback({
        success: true,
        timestamp: data.timestamp,
        serverTime: Date.now()
      });
    }
  });
  
  // Autenticação (opcional, exemplo de segurança)
  socket.on('authenticate', (data, callback) => {
    const { sessionId, userId, token } = data;
    const isValid = verifyToken(token, sessionId, userId);
    
    if (isValid) {
      // Armazena dados autenticados para o socket
      socket.data.authenticated = true;
      socket.data.userId = userId;
      socket.data.sessionId = sessionId;
      
      if (callback) callback({ success: true });
      console.log(`Usuário ${userId} autenticado`);
    } else {
      if (callback) callback({ success: false, error: 'Token inválido' });
      console.warn(`Tentativa de autenticação inválida para ${userId}`);
      // Em produção, você poderia desconectar o cliente após falhas de autenticação
      // socket.disconnect(true);
    }
  });
  
  // Middleware de exemplo para verificar autenticação (opcional)
  const requireAuth = (event, next) => {
    if (socket.data.authenticated) {
      next();
    } else {
      console.warn(`Acesso não autenticado a ${event} rejeitado`);
      // Em produção você não enviaria esta informação de erro para o cliente
      const err = new Error('Não autenticado');
      err.data = { type: 'auth_error' };
      next(err);
    }
  };
  
  // Aqui você pode adicionar os eventos específicos do seu aplicativo
  // Por exemplo:
  
  socket.on('joinSession', (sessionId, user) => {
    console.log(`Usuário ${user.name} entrou na sessão ${sessionId}`);
    socket.join(sessionId);
    io.to(sessionId).emit('userJoined', user);
  });
  
  socket.on('leaveSession', () => {
    console.log(`Usuário saiu da sessão`);
    // Implementação simplificada
  });
  
  // Eventos de colaboração (simulados para teste)
  socket.on('moveCursor', (position) => {
    // Reemite para todos exceto o remetente
    socket.broadcast.emit('userCursorMoved', socket.id, position);
  });
  
  socket.on('addComment', (comment) => {
    console.log('Novo comentário:', comment);
    // Reemite para todos (incluindo o remetente para confirmação)
    io.emit('commentAdded', comment);
  });
});

// Porta para o servidor Socket.io (3001 por padrão)
const PORT = process.env.SOCKET_PORT || 3001;
const CORS_ORIGIN = process.env.SOCKET_CORS_ORIGIN || "http://localhost:3000";

// Iniciar o servidor
httpServer.listen(PORT, () => {
  console.log(`\n=== Servidor Socket.io de Teste ===`);
  console.log(`Servidor rodando na porta: ${PORT}`);
  console.log(`URL de conexão: http://localhost:${PORT}`);
  console.log(`CORS configurado para origem: ${CORS_ORIGIN}`);
  console.log(`Secret para tokens: ${process.env.SOCKET_SECRET ? '[Configurado]' : '[Usando padrão]'}`);
  console.log(`\nPara diagnóstico da conexão:`);
  console.log(`- Execute: npm run check-socket`);
  console.log(`- Acesse a página de diagnóstico: http://localhost:3000/admin/diagnosticos`);
  console.log(`\nPressione CTRL+C para encerrar o servidor\n`);
});
