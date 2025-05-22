// scripts/check-socket-connection.js
/**
 * Script para verificar o status da conexão Socket.io em ambientes de produção
 * 
 * Uso: 
 *   node check-socket-connection.js [url]
 * 
 * Exemplo:
 *   node check-socket-connection.js https://api.melhorapp.com
 */

const { io } = require("socket.io-client");
const colors = require('colors/safe');

// Pega a URL do servidor como argumento de linha de comando, ou usa o padrão
let serverUrl = process.argv[2] || process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

// Verifica se a URL é válida
try {
  // Adiciona protocolo se não estiver presente
  if (!serverUrl.startsWith('http://') && !serverUrl.startsWith('https://') && !serverUrl.startsWith('/')) {
    serverUrl = 'http://' + serverUrl;
  }
  
  // Verifica se é um URL relativo ou absoluta
  if (!serverUrl.startsWith('/')) {
    new URL(serverUrl);
  }
  
  console.log(colors.cyan(`Verificando conexão Socket.io com: ${serverUrl}`));
} catch (error) {
  console.error(colors.red(`URL inválida: ${serverUrl}`));
  console.error(colors.gray('Formato correto: http://hostname:port ou /socket.io'));
  process.exit(1);
}

// Configura o socket com opções similares às usadas na aplicação
const socket = io(serverUrl, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  transports: ['websocket', 'polling'],
  timeout: 15000
});

// Eventos de conexão
socket.on("connect", () => {
  console.log(colors.green.bold("✓ Conexão estabelecida com sucesso"));
  console.log(colors.gray(`  ID da conexão: ${socket.id}`));
    // Tenta fazer um ping simples
  console.log(colors.yellow("Enviando mensagem de teste..."));
  
  // Envia um evento de ping (o servidor precisará estar configurado para responder)
  socket.emit("ping", { timestamp: Date.now() }, (response) => {
    try {
      if (response && (response.success === true || (typeof response === 'object' && Object.keys(response).length > 0))) {
        console.log(colors.green("✓ Resposta recebida do servidor"));
        const timestamp = response.timestamp || Date.now();
        console.log(colors.gray(`  Latência: ${Date.now() - timestamp}ms`));
      } else {
        console.log(colors.red("✗ Resposta inválida do servidor para o ping"));
        console.log(colors.gray(`  Resposta recebida: ${JSON.stringify(response)}`));
      }
    } catch (err) {
      console.log(colors.red("✗ Erro ao processar resposta do servidor"));
      console.log(colors.gray(`  Erro: ${err.message}`));
    }
    
    // Encerra após teste concluído
    setTimeout(() => {
      socket.disconnect();
      process.exit(0);
    }, 1000);
  });
  
  // Timeout para caso o servidor não responda ao ping
  setTimeout(() => {
    console.log(colors.yellow("⚠ Timeout aguardando resposta do servidor"));
    socket.disconnect();
    process.exit(1);
  }, 5000);
});

// Evento de erro na conexão
socket.on("connect_error", (error) => {
  console.error(colors.red.bold("✗ Erro de conexão:"), colors.red(error.message));
  
  if (error.message.includes("CORS") || error.message.includes("cors")) {
    console.error(colors.yellow("⚠ Possível problema de CORS detectado"));
    console.log(colors.gray("Dicas para resolver:"));
    console.log(colors.gray("1. Certifique-se de que a URL de origem está permitida no servidor Socket.io"));
    console.log(colors.gray("2. Verifique a configuração CORS no servidor:"));
    console.log(colors.gray(`   cors: { origin: "${new URL(serverUrl).origin}", methods: ["GET", "POST"], credentials: true }`));
  }
  
  // Encerra após erro
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

// Evento de desconexão
socket.on("disconnect", (reason) => {
  console.log(colors.yellow(`Desconectado: ${reason}`));
});

// Timeout geral
setTimeout(() => {
  console.log(colors.red("✗ Timeout - não foi possível conectar após 10 segundos"));
  socket.disconnect();
  process.exit(1);
}, 10000);

console.log(colors.gray("Aguardando conexão..."));
