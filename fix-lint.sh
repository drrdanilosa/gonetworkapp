#!/bin/bash

echo -e "\n🛠️  Corrigindo lint e prettier...\n"

# Corrige ESLint
npx eslint . --ext .js,.ts,.tsx --fix

# Corrige formatação e fim de linha
npx prettier "**/*.{ts,tsx,js,json,css,md}" --write

# Substitui 'require' por 'import' em arquivos comuns (opcional)
grep -rl "require(" . | grep -E "\.ts$|\.tsx$|\.js$" | while read file; do
  sed -i.bak -E "s|const ([a-zA-Z0-9_]+) = require\(['\"](.*)['\"]\)|import \1 from '\2'|g" "$file"
  rm "${file}.bak"
done

echo -e "\n✅ Correções aplicadas com sucesso!\n"
