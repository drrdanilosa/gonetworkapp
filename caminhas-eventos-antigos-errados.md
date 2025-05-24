| Caminho do Diretório                    | Palavra/Expressão Encontrada        |   Linha |
|:----------------------------------------|:------------------------------------|--------:|
| components/GeneralInfoTab.tsx           | Festival                            |     133 |
| components/widgets/assets-widget.tsx    | festival                            |      95 |
| components/widgets/assets-widget.tsx    | festival                            |     100 |
| components/widgets/delivery-widget.tsx  | festival                            |      76 |
| components/widgets/delivery-widget.tsx  | festival                            |      81 |
| components/timeline/TimelineWidget.tsx  | Festival de Música - 18-20 Mai 2025 |      72 |
| components/GeneralInfoTab.tsx           | Feira                               |     135 |
| components/widgets/briefing-widget.tsx  | Feira Gastronômica                  |      97 |
| components/widgets/assets-widget.tsx    | Conferência Tech                    |      42 |
| components/widgets/assets-widget.tsx    | Conferência Tech - 01 Jun 2025      |     107 |
| components/widgets/dashboard-widget.tsx | Conferência Tech - 01 Jun 2025      |      97 |
| components/widgets/briefing-widget.tsx  | Conferência Tech                    |      96 |
| components/widgets/delivery-widget.tsx  | Conferência Tech - 01 Jun 2025      |      88 |
| components/timeline/TimelineWidget.tsx  | Conferência Tech - 01 Jun 2025      |      74 |
| components/widgets/briefing-widget.tsx  | Festival de Verão                   |      95 |
| components/widgets/event-widget.tsx     | Festival de Verão 2025              |     505 |



@contatogonetwork ➜ /workspaces/melhorapp_final02 (main) $ python script-analisar-arquivos.py

📋 PLANO DE AUDITORIA:
| Caminho do Arquivo                      | Tipo de Análise                                                      |
|:----------------------------------------|:---------------------------------------------------------------------|
| components/GeneralInfoTab.tsx           | Verificar rotas JSX (Link/href), dados hardcoded e props com eventos |
| components/widgets/assets-widget.tsx    | Auditar chamada de API, dados fixos e estrutura dos formulários      |
| components/widgets/delivery-widget.tsx  | Checar Selects, rotas de entregas e fetchs                           |
| components/timeline/TimelineWidget.tsx  | Inspecionar timeline, datas fixas e stores                           |
| components/widgets/briefing-widget.tsx  | Analisar briefing, nomes fixos e update de dados                     |
| components/widgets/dashboard-widget.tsx | Verificar dashboard com renderização mock                            |
| components/widgets/event-widget.tsx     | Checar campos de input e rotas de criação de eventos                 |

🔍 RESULTADO DA INSPEÇÃO DE CÓDIGO:

📁 Analisando: components/GeneralInfoTab.tsx
  🟡 Linha 133: '<SelectItem value="festival">Festival</SelectItem>'  ⟶ contém: Festival
  🟡 Linha 134: '<SelectItem value="conferencia">Conferência</SelectItem>'  ⟶ contém: conferencia
  🟡 Linha 135: '<SelectItem value="feira">Feira</SelectItem>'  ⟶ contém: Feira

📁 Analisando: components/widgets/assets-widget.tsx
  🟡 Linha 28: 'name: 'Festival de Música','  ⟶ contém: Festival
  🟡 Linha 42: 'name: 'Conferência Tech','  ⟶ contém: Conferência Tech
  🟡 Linha 52: 'name: 'Teaser_Festival_v1.mp4','  ⟶ contém: Festival
  🟡 Linha 66: 'name: 'Briefing_Festival.pdf','  ⟶ contém: Festival
  🟡 Linha 80: 'name: 'Programacao_Festival.xlsx','  ⟶ contém: Festival
  🟡 Linha 101: 'Festival de Música - 18-20 Mai 2025'  ⟶ contém: Festival
  🟡 Linha 106: '<SelectItem value="conferencia">'  ⟶ contém: conferencia
  🟡 Linha 107: 'Conferência Tech - 01 Jun 2025'  ⟶ contém: Conferência Tech

📁 Analisando: components/widgets/delivery-widget.tsx
  🟡 Linha 19: 'title: 'Teaser - Festival de Música','  ⟶ contém: Festival
  🟡 Linha 20: 'event: 'Festival de Música','  ⟶ contém: Festival
  🟡 Linha 30: 'event: 'Festival de Música','  ⟶ contém: Festival
  🟡 Linha 40: 'event: 'Festival de Música','  ⟶ contém: Festival
  🟡 Linha 53: 'event: 'Festival de Música','  ⟶ contém: Festival
  🟡 Linha 61: 'event: 'Festival de Música','  ⟶ contém: Festival
  🟡 Linha 82: 'Festival de Música - 18-20 Mai 2025'  ⟶ contém: Festival
  🟡 Linha 87: '<SelectItem value="conferencia">'  ⟶ contém: conferencia
  🟡 Linha 88: 'Conferência Tech - 01 Jun 2025'  ⟶ contém: Conferência Tech

📁 Analisando: components/timeline/TimelineWidget.tsx
  🟡 Linha 72: '{ id: "festival", name: "Festival de Música - 18-20 Mai 2025" },'  ⟶ contém: Festival
  🟡 Linha 74: '{ id: "conferencia", name: "Conferência Tech - 01 Jun 2025" }'  ⟶ contém: Conferência Tech
  🟡 Linha 74: '{ id: "conferencia", name: "Conferência Tech - 01 Jun 2025" }'  ⟶ contém: conferencia

📁 Analisando: components/widgets/briefing-widget.tsx
  🟡 Linha 95: '{ id: '123', name: 'Festival de Verão', date: '2023-12-15' },'  ⟶ contém: Festival de Verão
  🟡 Linha 95: '{ id: '123', name: 'Festival de Verão', date: '2023-12-15' },'  ⟶ contém: Festival
  🟡 Linha 96: '{ id: '456', name: 'Conferência Tech', date: '2024-01-20' },'  ⟶ contém: Conferência Tech
  🟡 Linha 97: '{ id: '789', name: 'Feira Gastronômica', date: '2024-02-10' }'  ⟶ contém: Feira Gastronômica
  🟡 Linha 97: '{ id: '789', name: 'Feira Gastronômica', date: '2024-02-10' }'  ⟶ contém: Feira

📁 Analisando: components/widgets/dashboard-widget.tsx
  🟡 Linha 67: 'Festival de Música - Teaser Dia 1'  ⟶ contém: Festival
  🟡 Linha 97: 'Conferência Tech - 01 Jun 2025'  ⟶ contém: Conferência Tech
  🟡 Linha 130: 'Festival de Música'  ⟶ contém: Festival

📁 Analisando: components/widgets/event-widget.tsx
  🟡 Linha 505: 'placeholder="Ex: Festival de Verão 2025"'  ⟶ contém: Festival de Verão
  🟡 Linha 505: 'placeholder="Ex: Festival de Verão 2025"'  ⟶ contém: Festival

✅ Análise concluída.
@contatogonetwork ➜ /workspaces/melhorapp_final02 (main) $ 







SEFUNA ANALISE REALIZADA COM SCRIPT PYTHON

@contatogonetwork ➜ /workspaces/melhorapp_final02 (main) $ python script-analisar-arquivos.py

📋 PLANO DE AUDITORIA:
| Caminho do Arquivo                      | Tipo de Análise                                                      |
|:----------------------------------------|:---------------------------------------------------------------------|
| components/GeneralInfoTab.tsx           | Verificar rotas JSX (Link/href), dados hardcoded e props com eventos |
| components/widgets/assets-widget.tsx    | Auditar chamada de API, dados fixos e estrutura dos formulários      |
| components/widgets/delivery-widget.tsx  | Checar Selects, rotas de entregas e fetchs                           |
| components/timeline/TimelineWidget.tsx  | Inspecionar timeline, datas fixas e stores                           |
| components/widgets/briefing-widget.tsx  | Analisar briefing, nomes fixos e update de dados                     |
| components/widgets/dashboard-widget.tsx | Verificar dashboard com renderização mock                            |
| components/widgets/event-widget.tsx     | Checar campos de input e rotas de criação de eventos                 |

🔍 RESULTADO DA INSPEÇÃO DE CÓDIGO:

📁 Analisando: components/GeneralInfoTab.tsx
  🟡 Linha 133: '<SelectItem value="festival">Festival</SelectItem>'  ⟶ contém: Festival
  🟡 Linha 134: '<SelectItem value="conferencia">Conferência</SelectItem>'  ⟶ contém: conferencia
  🟡 Linha 135: '<SelectItem value="feira">Feira</SelectItem>'  ⟶ contém: Feira

📁 Analisando: components/widgets/assets-widget.tsx
  🟡 Linha 28: 'name: 'Festival de Música','  ⟶ contém: Festival
  🟡 Linha 42: 'name: 'Conferência Tech','  ⟶ contém: Conferência Tech
  🟡 Linha 52: 'name: 'Teaser_Festival_v1.mp4','  ⟶ contém: Festival
  🟡 Linha 66: 'name: 'Briefing_Festival.pdf','  ⟶ contém: Festival
  🟡 Linha 80: 'name: 'Programacao_Festival.xlsx','  ⟶ contém: Festival
  🟡 Linha 101: 'Festival de Música - 18-20 Mai 2025'  ⟶ contém: Festival
  🟡 Linha 106: '<SelectItem value="conferencia">'  ⟶ contém: conferencia
  🟡 Linha 107: 'Conferência Tech - 01 Jun 2025'  ⟶ contém: Conferência Tech

📁 Analisando: components/widgets/delivery-widget.tsx
  🟡 Linha 19: 'title: 'Teaser - Festival de Música','  ⟶ contém: Festival
  🟡 Linha 20: 'event: 'Festival de Música','  ⟶ contém: Festival
  🟡 Linha 30: 'event: 'Festival de Música','  ⟶ contém: Festival
  🟡 Linha 40: 'event: 'Festival de Música','  ⟶ contém: Festival
  🟡 Linha 53: 'event: 'Festival de Música','  ⟶ contém: Festival
  🟡 Linha 61: 'event: 'Festival de Música','  ⟶ contém: Festival
  🟡 Linha 82: 'Festival de Música - 18-20 Mai 2025'  ⟶ contém: Festival
  🟡 Linha 87: '<SelectItem value="conferencia">'  ⟶ contém: conferencia
  🟡 Linha 88: 'Conferência Tech - 01 Jun 2025'  ⟶ contém: Conferência Tech

📁 Analisando: components/timeline/TimelineWidget.tsx
  🟡 Linha 72: '{ id: "festival", name: "Festival de Música - 18-20 Mai 2025" },'  ⟶ contém: Festival
  🟡 Linha 74: '{ id: "conferencia", name: "Conferência Tech - 01 Jun 2025" }'  ⟶ contém: Conferência Tech
  🟡 Linha 74: '{ id: "conferencia", name: "Conferência Tech - 01 Jun 2025" }'  ⟶ contém: conferencia

📁 Analisando: components/widgets/briefing-widget.tsx
  🟡 Linha 95: '{ id: '123', name: 'Festival de Verão', date: '2023-12-15' },'  ⟶ contém: Festival de Verão
  🟡 Linha 95: '{ id: '123', name: 'Festival de Verão', date: '2023-12-15' },'  ⟶ contém: Festival
  🟡 Linha 96: '{ id: '456', name: 'Conferência Tech', date: '2024-01-20' },'  ⟶ contém: Conferência Tech
  🟡 Linha 97: '{ id: '789', name: 'Feira Gastronômica', date: '2024-02-10' }'  ⟶ contém: Feira Gastronômica
  🟡 Linha 97: '{ id: '789', name: 'Feira Gastronômica', date: '2024-02-10' }'  ⟶ contém: Feira

📁 Analisando: components/widgets/dashboard-widget.tsx
  🟡 Linha 67: 'Festival de Música - Teaser Dia 1'  ⟶ contém: Festival
  🟡 Linha 97: 'Conferência Tech - 01 Jun 2025'  ⟶ contém: Conferência Tech
  🟡 Linha 130: 'Festival de Música'  ⟶ contém: Festival

📁 Analisando: components/widgets/event-widget.tsx
  🟡 Linha 505: 'placeholder="Ex: Festival de Verão 2025"'  ⟶ contém: Festival de Verão
  🟡 Linha 505: 'placeholder="Ex: Festival de Verão 2025"'  ⟶ contém: Festival

✅ Análise concluída.
@contatogonetwork ➜ /workspaces/melhorapp_final02 (main) $ 