# Solucionando Problemas de CORS com Socket.io

Este documento explica como resolver problemas de CORS (Cross-Origin Resource Sharing) ao usar Socket.io no MelhorApp.

## Problema

Os navegadores impedem que código JavaScript em uma página web (origem) acesse recursos de outra origem (domínio, porta ou protocolo diferente) por questões de segurança. Isso é conhecido como "política de mesma origem".

No MelhorApp, isso pode causar problemas ao tentar conectar o front-end (geralmente rodando na porta 3000) com o servidor Socket.io (geralmente rodando na porta 3001).

## Soluções Implementadas

### 1. Proxy Next.js

Para desenvolvimento local, configuramos um proxy no `next.config.mjs` que redireciona solicitações de `/socket.io` para o servidor Socket.io na porta 3001:

```javascript
// next.config.mjs
const nextConfig = {
  // ... outras configurações
  async rewrites() {
    return [
      {
        source: '/socket.io/:path*',
        destination: 'http://localhost:3001/socket.io/:path*',
      },
    ]
  },
}
```

### 2. Cliente Socket.io Configurado

O cliente Socket.io está configurado para funcionar tanto com o proxy quanto com uma URL direta:

```typescript
// lib/socket-service.ts
connect(serverUrl: string = process.env.NEXT_PUBLIC_SOCKET_URL || "/socket.io") {
  // Usa path apenas quando estiver usando o proxy
  const isRelativePath = !serverUrl.startsWith("http");
  
  this.socket = io(serverUrl, {
    // ... outras opções
    path: isRelativePath ? '/socket.io' : undefined,
  });
}
```

### 3. Servidor de Teste

Incluímos um servidor Socket.io de teste com CORS configurado corretamente:

```javascript
// scripts/socket-server-teste.js
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});
```

## Como Executar

1. **Iniciar o servidor Socket.io de teste:**
   ```
   npm run socket-server
   ```

2. **Iniciar o Next.js e o servidor Socket.io juntos:**
   ```
   npm run dev:all
   ```

3. **Para produção:**
   Configure a variável `NEXT_PUBLIC_SOCKET_URL` apontando para o seu servidor Socket.io.

## Diagnóstico

Visite a página de diagnóstico para verificar o status da conexão:
```
/admin/diagnosticos
```

## Problemas Comuns

1. **Erro de CORS:**
   - Verifique se o servidor Socket.io tem CORS configurado corretamente
   - Certifique-se de que a origem permitida no CORS do servidor inclui a URL do seu front-end

2. **Erro "Transport close":**
   - Verifique se o servidor Socket.io está rodando
   - Confirme que o proxy está configurado corretamente

3. **Conexão inicialmente funciona mas depois desconecta:**
   - Verifique configurações de timeout
   - Pode haver problemas na rede ou no servidor

## Configuração em Produção

Em ambiente de produção:

1. Configure o servidor Socket.io com CORS apropriado:
   ```javascript
   const io = new Server({
     cors: {
       origin: "https://seu-dominio.com",
       methods: ["GET", "POST"],
       credentials: true
     }
   });
   ```

2. Configure a variável de ambiente `NEXT_PUBLIC_SOCKET_URL` no front-end com a URL completa do seu servidor Socket.io.

## Segurança na Comunicação Socket.io

### Autenticação

Adicionamos um sistema básico de autenticação para Socket.io:

```javascript
// Cliente (socket-service.ts)
// Definir token antes da conexão
socketService.setAuthToken("session:user:token").connect();

// Servidor (socket-server-teste.js)
socket.on('authenticate', (data, callback) => {
  const { sessionId, userId, token } = data;
  const isValid = verifyToken(token, sessionId, userId);
  
  if (isValid) {
    // Usuário autenticado
    socket.data.authenticated = true;
    socket.data.userId = userId;
  } else {
    // Falha na autenticação
    console.warn(`Tentativa de autenticação inválida`);
  }
});
```

### Verificação de Conexão

Para verificar o status da conexão em produção, criamos um script de diagnóstico:

```bash
# Verificar conexão em desenvolvimento
npm run check-socket

# Verificar conexão com servidor de produção
npm run check-socket:prod
```

### Proteção Contra Ataques

1. **Limitação de tamanho de buffer**: Configuramos `maxHttpBufferSize` para evitar ataques de sobrecarga de buffer
2. **Middleware de autenticação**: Eventos sensíveis podem exigir autenticação prévia
3. **Monitoramento de conexão**: O sistema monitora tentativas de reconexão e falhas

### Melhores Práticas

1. Use HTTPS para todas as conexões em produção
2. Mantenha as bibliotecas Socket.io atualizadas
3. Implemente rate limiting no servidor para evitar ataques de sobrecarga
4. Monitore conexões e desconexões para identificar padrões suspeitos

## Próximos Passos

1. Implementar verificação de origem para evitar solicitações de domínios não autorizados
2. Adicionar criptografia adicional para mensagens sensíveis
3. Implementar sistema completo de autenticação baseado em JWT
