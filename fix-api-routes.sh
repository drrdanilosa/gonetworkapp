#!/bin/bash
# Script para adicionar configuração de export estático nas rotas da API

API_ROUTES=(
  "app/api/auth/register/route.ts"
  "app/api/auth/refresh/route.ts"
  "app/api/auth/login/route.ts"
  "app/api/auth/logout/route.ts"
  "app/api/briefings/[eventId]/route.ts"
  "app/api/briefings/route.ts"
  "app/api/briefings-new/[eventId]/route.ts"
  "app/api/timeline/[eventId]/route.ts"
  "app/api/exports/[projectId]/route.ts"
  "app/api/socket/route.ts"
  "app/api/events/check-watcher/route.ts"
  "app/api/events/video-upload/route.ts"
  "app/api/events/[eventId]/videos/[videoId]/status/route.ts"
  "app/api/events/[eventId]/videos/route.ts"
  "app/api/events/[eventId]/team/route.ts"
  "app/api/events/[eventId]/route.ts"
  "app/api/events/route.ts"
)

for route in "${API_ROUTES[@]}"; do
  if [ -f "$route" ]; then
    # Verifica se já tem a configuração
    if ! grep -q "export const dynamic" "$route"; then
      echo "Adicionando configuração em $route"
      # Adiciona após os imports
      sed -i '/^import/a\\n// Configuração para export estático\nexport const dynamic = "force-static"\n' "$route"
    else
      echo "Configuração já existe em $route"
    fi
  else
    echo "Arquivo não encontrado: $route"
  fi
done

echo "Script concluído!"
