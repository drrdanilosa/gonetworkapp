import type React from 'react'
import { Inter, Fira_Code } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NotificationsProvider } from '@/components/providers/notifications-provider'
import { EventSyncProvider } from '@/components/providers/event-sync-provider'
import { ElectronIntegration } from '@/components/electron/ElectronIntegration'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const firaCode = Fira_Code({
  subsets: ['latin'],
  variable: '--font-fira-code',
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minuto
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export const metadata = {
  title: 'GoNetwork AI',
  description: 'Plataforma de gerenciamento de produção audiovisual',
  generator: 'Next.js 15',
  applicationName: 'GoNetwork AI',
  keywords: ['produção audiovisual', 'gestão de projetos', 'AI'],
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${inter.variable} ${firaCode.variable}`}
    >
      <body className={`bg-background font-sans antialiased`}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={true}
            disableTransitionOnChange
          >
            <ElectronIntegration>
              <EventSyncProvider>
                {children}
                {/* Componente de notificações global */}
                <NotificationsProvider />
              </EventSyncProvider>
            </ElectronIntegration>
          </ThemeProvider>
        </QueryClientProvider>
      </body>
    </html>
  )
}
