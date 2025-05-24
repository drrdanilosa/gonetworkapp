import type React from 'react'
import { Inter, Fira_Code } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { ReactQueryProvider } from '@/components/providers/query-provider'
import { NotificationsProvider } from '@/components/providers/notifications-provider'
import { EventSyncProvider } from '@/components/providers/event-sync-provider'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const firaCode = Fira_Code({
  subsets: ['latin'],
  variable: '--font-fira-code',
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
        <ReactQueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={true}
            disableTransitionOnChange
          >
            <EventSyncProvider>
              {children}
              {/* Componente de notificações global */}
              <NotificationsProvider />
            </EventSyncProvider>
          </ThemeProvider>
        </ReactQueryProvider>
      </body>
    </html>
  )
}
