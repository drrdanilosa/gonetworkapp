import os
import re

# 🧾 Configurações básicas
EXTENSOES = ('.ts', '.tsx', '.js', '.jsx')
IGNORAR_PASTAS = ['node_modules', '.git', 'dist', 'build']
CAMINHO_BASE = '.'  # diretório raiz

# 🔍 Regex para capturar arrays hardcoded simples
regex_array = re.compile(
    r'\b(const|let|var)\s+\w+\s*=\s*\[\s*[\s\S]*?\]',
    re.MULTILINE
)

def encontrar_arrays_hardcoded():
    print("🔍 Iniciando varredura por arrays hardcoded...\n")

    for root, dirs, files in os.walk(CAMINHO_BASE):
        # Ignora pastas desnecessárias
        if any(ignorar in root for ignorar in IGNORAR_PASTAS):
            continue

        for file in files:
            if file.endswith(EXTENSOES):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        conteudo = f.read()
                        matches = regex_array.finditer(conteudo)
                        for match in matches:
                            linha = conteudo[:match.start()].count('\n') + 1
                            trecho = match.group(0)
                            truncado = f"{trecho[:200]}... (truncado)" if len(trecho) > 200 else trecho
                            print(f"📁 Arquivo: {path}")
                            print(f"📌 Linha aproximada: {linha}")
                            print(f"🔸 Array detectado: {truncado}\n")
                except Exception as e:
                    print(f"⚠️ Erro ao ler {path}: {e}\n")

    print("✅ Verificação concluída.\n")

# Execução direta
if __name__ == "__main__":
    encontrar_arrays_hardcoded()
