import pandas as pd
import os

# Nomes/termos suspeitos que causam o erro persistente
eventos_suspeitos = [
    "Festival de Verão",
    "Conferência Tech",
    "Feira Gastronômica",
    "Festival",
    "Feira",
    "conferencia",
]

# Caminhos diretamente relacionados a dados fixos
unique_paths = [
    "components/GeneralInfoTab.tsx",
    "components/widgets/assets-widget.tsx",
    "components/widgets/delivery-widget.tsx",
    "components/timeline/TimelineWidget.tsx",
    "components/widgets/briefing-widget.tsx",
    "components/widgets/dashboard-widget.tsx",
    "components/widgets/event-widget.tsx"
]

# Descrição do tipo de auditoria por arquivo
analises = [
    "Verificar rotas JSX (Link/href), dados hardcoded e props com eventos",
    "Auditar chamada de API, dados fixos e estrutura dos formulários",
    "Checar Selects, rotas de entregas e fetchs",
    "Inspecionar timeline, datas fixas e stores",
    "Analisar briefing, nomes fixos e update de dados",
    "Verificar dashboard com renderização mock",
    "Checar campos de input e rotas de criação de eventos"
]

# Criar plano de auditoria
df_rotas = pd.DataFrame({
    "Caminho do Arquivo": unique_paths,
    "Tipo de Análise": analises
})

# Exibir plano
print("\n📋 PLANO DE AUDITORIA:")
try:
    print(df_rotas.to_markdown(index=False))
except ImportError:
    print(df_rotas.to_string(index=False))

# Analisar os arquivos linha a linha
print("\n🔍 RESULTADO DA INSPEÇÃO DE CÓDIGO:")

ocorrencias = []

for path in unique_paths:
    if not os.path.exists(path):
        print(f"❌ Arquivo não encontrado: {path}")
        continue

    print(f"\n📁 Analisando: {path}")
    with open(path, "r", encoding="utf-8") as f:
        for i, linha in enumerate(f.readlines(), start=1):
            for termo in eventos_suspeitos:
                if termo in linha:
                    ocorrencias.append({
                        "Arquivo": path,
                        "Linha": i,
                        "Termo Detectado": termo,
                        "Conteúdo": linha.strip()
                    })
                    print(f"  🟡 Linha {i}: '{linha.strip()}'  ⟶ contém: {termo}")

print("\n✅ Análise concluída.")

# Exportar resultado opcional (descomente abaixo para gerar .csv)
# df_ocorrencias = pd.DataFrame(ocorrencias)
# df_ocorrencias.to_csv("ocorrencias-eventos-antigos.csv", index=False, encoding="utf-8")
# print("📄 Exportado para ocorrencias-eventos-antigos.csv")
