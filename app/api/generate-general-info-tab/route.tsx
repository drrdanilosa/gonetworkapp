import { NextResponse } from 'next/server';
import { GeneralInfoTab } from '@/features/briefing/components/GeneralInfoTab';
import { ReactElement } from 'react';

// Esta função serve apenas como um wrapper para renderizar o GeneralInfoTab como uma página completa
export async function GET() {
  // Aqui seria necessário um método de renderização do lado do servidor
  // Como não podemos renderizar componentes React diretamente neste contexto,
  // vamos criar um HTML que carrega o componente diretamente

  const html = `
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Informações Gerais</title>
      <link rel="stylesheet" href="/styles/globals.css">
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body>
      <div id="root"></div>
      <script type="module">
        import { createRoot } from 'react-dom/client';
        import { GeneralInfoTab } from '/features/briefing/components/GeneralInfoTab.js';
        
        const root = createRoot(document.getElementById('root'));
        root.render(<GeneralInfoTab />);
      </script>
    </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}
