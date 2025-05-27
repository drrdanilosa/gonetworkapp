// Teste para simular clique no botão "Gerar Timeline" na página
console.log('🧪 Iniciando teste do botão Gerar Timeline...')

// Aguardar a página carregar
setTimeout(() => {
  console.log('🔍 Procurando botão "Gerar Timeline"...')

  // Procurar pelo botão usando diferentes estratégias
  let button = null

  // Estratégia 1: Texto do botão
  const buttons = Array.from(document.querySelectorAll('button'))
  button = buttons.find(
    btn =>
      btn.textContent &&
      (btn.textContent.includes('Gerar Timeline') ||
        btn.textContent.includes('Timeline'))
  )

  if (!button) {
    // Estratégia 2: Por classe CSS
    button = document.querySelector('[class*="timeline"]')
  }

  if (!button) {
    // Estratégia 3: Por qualquer botão na página principal
    const mainButtons = document.querySelectorAll(
      'button:not([type="button"]):not([disabled])'
    )
    if (mainButtons.length > 0) {
      button = mainButtons[mainButtons.length - 1] // Último botão
    }
  }

  if (button) {
    console.log('✅ Botão encontrado:', button.textContent?.trim())
    console.log('🎯 Classes do botão:', button.className)
    console.log('🎯 Disabled:', button.disabled)

    // Simular clique
    console.log('🖱️ Clicando no botão...')
    button.click()

    // Aguardar e verificar resultado
    setTimeout(() => {
      console.log('⏳ Verificando resultado após 3 segundos...')

      // Procurar por indicadores de sucesso
      const successIndicators = [
        document.querySelector('[role="alert"]'),
        document.querySelector('.alert'),
        document.querySelector('[class*="success"]'),
        document.querySelector('[class*="timeline"]'),
      ].filter(Boolean)

      if (successIndicators.length > 0) {
        console.log(
          '✅ Indicadores de resultado encontrados:',
          successIndicators.length
        )
        successIndicators.forEach((el, i) => {
          console.log(`📋 Indicador ${i + 1}:`, el.textContent?.trim())
        })
      } else {
        console.log('⚠️ Nenhum indicador de resultado encontrado')
      }

      // Verificar console para logs
      console.log(
        '📊 Teste concluído. Verifique o Network tab para chamadas de API.'
      )
    }, 3000)
  } else {
    console.log('❌ Botão "Gerar Timeline" não encontrado')
    console.log('📋 Botões disponíveis na página:')
    const allButtons = document.querySelectorAll('button')
    allButtons.forEach((btn, i) => {
      console.log(
        `${i + 1}. "${btn.textContent?.trim()}" - Classes: ${btn.className}`
      )
    })
  }
}, 2000) // Aguardar 2 segundos para a página carregar

// Log inicial
console.log('🌐 Página carregada. URL:', window.location.href)
console.log('📄 Título:', document.title)
