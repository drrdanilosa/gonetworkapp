#!/bin/bash

echo "Verificando status..."
git status

echo "Adicionando arquivos modificados..."
git add .

echo "Digite a mensagem de commit:"
read commit_msg
echo "Fazendo commit com a mensagem: '$commit_msg'"
git commit -m "$commit_msg"

echo "Obtendo o nome da branch atual..."
branch=$(git rev-parse --abbrev-ref HEAD)
echo "Branch atual: $branch"

echo "Enviando para o repositório remoto..."
git push origin $branch

echo "Processo concluído!"
