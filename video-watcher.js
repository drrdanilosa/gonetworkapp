// video-watcher.js
const chokidar = require('chokidar');
const path = require('path');
const axios = require('axios');
const fs = require('fs');

// Configurações
const EXPORTS_DIR = path.join(process.cwd(), 'public', 'exports');
// Endpoint para upload de vídeos específicos para eventos
const SERVER_API_EVENTS = 'http://localhost:3000/api/events';
// Endpoint de backup para compatibilidade
const SERVER_API = 'http://localhost:3000/api/events/upload-from-watcher';
const RETRY_DELAY = 3000; // 3 segundos para retry
const MAX_RETRIES = 5;
const ACCEPTED_VIDEO_FORMATS = ['.mp4', '.mov', '.avi', '.webm'];

// Criar estrutura de pastas
function setupDirectories() {
  // Garantir que a pasta principal existe
  if (!fs.existsSync(EXPORTS_DIR)) {
    console.log(`📂 Criando pasta de exportações em: ${EXPORTS_DIR}`);
    fs.mkdirSync(EXPORTS_DIR, { recursive: true });
  }
  
  // Criar pasta de exemplo para projeto-1 se não existir
  const exampleDir = path.join(EXPORTS_DIR, 'projeto-1');
  if (!fs.existsSync(exampleDir)) {
    console.log(`📂 Criando pasta de exemplo em: ${exampleDir}`);
    fs.mkdirSync(exampleDir, { recursive: true });
  }
}

setupDirectories();
console.log(`🔍 Iniciando monitoramento de vídeos em: ${EXPORTS_DIR}`);

// Inicializa com opções de estabilidade melhoradas
const watcher = chokidar.watch(EXPORTS_DIR, {
  persistent: true,
  ignoreInitial: false, // Verifica arquivos existentes na inicialização
  depth: 3, // Profundidade de pastas monitoradas
  awaitWriteFinish: {
    stabilityThreshold: 4000, // 4 segundos sem mudanças antes de considerar completo
    pollInterval: 250 // Verificar a cada 250ms
  },
  ignored: /(^|[\/\\])\../ // Ignorar arquivos ocultos
});

// Função para registrar via API com retries
async function registerVideoWithAPI(data, retryCount = 0) {
  try {
    const response = await axios.post(SERVER_API, data);
    console.log(`✅ Vídeo registrado com sucesso: ${data.filename}`);
    return response.data;
  } catch (err) {
    console.error(`❌ Erro ao chamar API (tentativa ${retryCount + 1}/${MAX_RETRIES}):`, err.message);
    
    if (err.response) {
      console.error('Detalhes da resposta:', err.response.data);
    }
    
    // Implementar retry com backoff exponencial
    if (retryCount < MAX_RETRIES) {
      const delay = RETRY_DELAY * Math.pow(2, retryCount);
      console.log(`⏱️ Tentando novamente em ${delay/1000} segundos...`);
      
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(registerVideoWithAPI(data, retryCount + 1));
        }, delay);
      });
    } else {
      console.error('❌ Máximo de tentativas atingido. Falha ao registrar o vídeo.');
      throw err;
    }
  }
}

// Função para validar e processar vídeos
async function processVideoFile(filePath) {
  const fileExt = path.extname(filePath).toLowerCase();
  if (!ACCEPTED_VIDEO_FORMATS.includes(fileExt)) return;
  
  // Verificar se o arquivo existe e está acessível
  try {
    const stats = fs.statSync(filePath);
    if (!stats.isFile() || stats.size === 0) {
      console.warn(`⚠️ Arquivo inválido ou vazio: ${filePath}`);
      return;
    }
  } catch (err) {
    console.error(`❌ Erro ao acessar arquivo: ${filePath}`, err.message);
    return;
  }
  
  // Extrair informações do caminho
  const relativePath = path.relative(EXPORTS_DIR, filePath);
  const pathParts = relativePath.split(path.sep);
  
  // Garantir formato correto da estrutura de pastas
  if (pathParts.length < 2) {
    console.warn('⚠️ Formato de pasta inválido. Use a estrutura: exports/[eventId]/[filename].mp4');
    return;
  }
  
  const eventFolder = pathParts[0];
  const file = pathParts[pathParts.length - 1];
  const videoPath = `/exports/${relativePath.replace(/\\/g, '/')}`;
  
  console.log(`📹 Vídeo detectado: ${videoPath}`);
  
  // Registrar o vídeo com o sistema de retry
  try {
    const result = await registerVideoWithAPI({
      eventId: eventFolder,
      filename: file,
      url: videoPath,
      detectedAt: new Date().toISOString(),
      fileSize: fs.statSync(filePath).size
    });
    
    console.log('📊 Detalhes do registro:', {
      projeto: result.project,
      entregável: result.deliverable,
      versão: result.version?.id
    });
  } catch (err) {
    // Erro já foi logado na função registerVideoWithAPI
  }
}

// Monitorar arquivos de vídeo
watcher
  .on('add', async (filePath) => {
    const relativePath = path.relative(EXPORTS_DIR, filePath);
    const pathParts = relativePath.split(path.sep);

    if (pathParts.length < 2) {
      console.warn('⚠️ Formato de pasta inválido. Use a estrutura: exports/[eventId]/[filename].mp4');
      return;
    }

    const eventFolder = pathParts[0];
    const fileName = pathParts[pathParts.length - 1];
    const videoPath = `/exports/${relativePath.replace(/\\/g, '/')}`;

    console.log(`📹 Vídeo detectado: ${videoPath}`);

    try {
      const eventId = eventFolder.split('-')[1];
      await axios.post(`${SERVER_API_EVENTS}/${eventId}/videos`, {
        fileName,
        filePath: relativePath,
        status: 'aguardando aprovação'
      });
      console.log(`🎬 Vídeo ${fileName} importado automaticamente para evento ${eventId}`);
    } catch (error) {
      console.error('Erro ao importar vídeo automaticamente:', error);
    }
  })
  .on('change', (filePath) => {
    console.log(`🔄 Arquivo modificado: ${filePath}`);
    processVideoFile(filePath);
  })
  .on('error', error => {
    console.error(`❌ Erro no watcher: ${error}`);
  })
  .on('ready', () => {
    console.log('👀 Watcher inicializado e pronto!');
    console.log(`📁 Monitorando ${Object.keys(watcher.getWatched()).length} diretórios`);
  });

console.log('🔍 Para testar, coloque arquivos de vídeo em pastas como: public/exports/projeto-123/video.mp4');
console.log(`🎥 Formatos aceitos: ${ACCEPTED_VIDEO_FORMATS.join(', ')}`);

// Tratamento de encerramento limpamente
process.on('SIGINT', () => {
  console.log('🛑 Encerrando watcher de vídeos...');
  watcher.close().then(() => {
    console.log('👋 Watcher encerrado.');
    process.exit(0);
  });
});
