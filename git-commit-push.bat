@echo off
echo Verificando status...
git status

echo Adicionando arquivos modificados...
git add .

set /p commit_msg="Digite a mensagem de commit: "TENTANDO AJUSTAR
echo Fazendo commit com a mensagem: "%commit_msg%"
git commit -m "%commit_msg%"

echo Obtendo o nome da branch atual...
for /f "tokens=*" %%a in ('git rev-parse --abbrev-ref HEAD') do set branch=%%a
echo Branch atual: %branch%

echo Enviando para o repositório remoto...
git push origin %branch%

echo Processo concluído!
pause
