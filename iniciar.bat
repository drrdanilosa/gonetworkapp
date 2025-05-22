@echo off
cd %~dp0
echo ===== INICIANDO MELHORAPP =====
echo.

REM Verificar se o Node.js está instalado
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
  echo [ERRO] Node.js não encontrado. Por favor, instale o Node.js.
  pause
  exit /b 1
)

REM Verificar e instalar dependências principais
echo.
echo [0/4] Verificando dependências principais...
npm ls axios chokidar fs-extra --depth=0 >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
  echo Instalando dependências do watcher...
  npm install axios chokidar fs-extra --save
)

REM Configurar projetos de teste
echo.
echo [1/4] Configurando projetos de teste...
node scripts/setup-test-projects.js

REM Verificar se a pasta de exportações existe
echo.
echo [2/4] Verificando diretórios necessários...
if not exist "public\exports" (
  echo Criando diretório public\exports...
  mkdir "public\exports"
)

REM Inicializar ambiente (inicia watcher, cria logs, valida estrutura)
echo.
echo [3/4] Iniciando ambiente de execução...
node scripts/initialize-environment.js

REM Rodar o servidor Next.js em nova janela
echo.
echo [4/4] Iniciando o servidor Next.js em uma nova janela...
start cmd /k "npm run dev"

echo.
echo ===== SISTEMA INICIADO =====
echo.
echo ▶ Acesse o MelhorApp em: http://localhost:3001
echo ▶ Testes: http://localhost:3001/test-projects
echo.
echo ▶ Para adicionar vídeo de teste:
echo    1. Copie um .mp4 para: public\exports\projeto-1\
echo    2. O watcher detectará e enviará automaticamente.
echo.
echo ▶ Diagnóstico rápido:
echo    node scripts/check-system.js
echo.
pause
