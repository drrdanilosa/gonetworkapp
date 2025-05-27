export const CAPTACAO_CONFIG = {
  // Configurações de autorização de uso de imagem
  autorizacao: {
    allowedFileTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ],
    maxFileSize: 5 * 1024 * 1024, // 5MB
    signatureConfig: {
      backgroundColor: '#ffffff',
      penColor: '#000000',
      minWidth: 1,
      maxWidth: 3,
    },
  },

  // Configurações de reuniões
  reunioes: {
    plataformas: [
      { id: 'meet', name: 'Google Meet', icon: '🎥', color: 'bg-blue-500' },
      { id: 'zoom', name: 'Zoom', icon: '💻', color: 'bg-blue-600' },
      { id: 'teams', name: 'Microsoft Teams', icon: '👥', color: 'bg-purple-500' },
      { id: 'other', name: 'Outra', icon: '🔗', color: 'bg-gray-500' },
    ],
    defaultDuration: 60, // minutos
    maxParticipants: 50,
    allowedFileTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/png',
    ],
    maxFileSize: 10 * 1024 * 1024, // 10MB
  },

  // Futuras funcionalidades
  futureFeatures: {
    contratos: {
      enabled: false,
      description: 'Geração e assinatura de contratos para eventos',
    },
    questionarios: {
      enabled: false,
      description: 'Formulários customizados para briefing detalhado',
    },
    marketing: {
      enabled: false,
      description: 'Templates e ferramentas para divulgação do evento',
    },
    checklists: {
      enabled: false,
      description: 'Listas de verificação para equipamentos e setup',
    },
  },
}

export const NOTIFICATION_MESSAGES = {
  autorizacao: {
    success: 'Autorização de uso de imagem salva com sucesso!',
    error: 'Erro ao salvar autorização. Tente novamente.',
    deleted: 'Autorização removida com sucesso.',
  },
  reuniao: {
    success: 'Reunião criada com sucesso!',
    updated: 'Reunião atualizada com sucesso!',
    error: 'Erro ao salvar reunião. Tente novamente.',
    deleted: 'Reunião removida com sucesso.',
    fileAdded: 'Arquivo adicionado à reunião.',
    fileRemoved: 'Arquivo removido da reunião.',
  },
  signature: {
    captured: 'Assinatura capturada com sucesso!',
    cleared: 'Assinatura limpa.',
    error: 'Erro ao capturar assinatura.',
  },
}