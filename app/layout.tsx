import type React from 'react'
import { Inter, Fira_Code } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { ReactQueryProvider } from '@/components/providers/query-provider'
import { NotificationsProvider } from '@/components/providers/notifications-provider'
import { EventSyncProvider } from '@/components/providers/event-sync-provider'
import { ElectronIntegration } from '@/components/electron/ElectronIntegration'
import PWAInstallPrompt from '@/components/pwa/PWAInstallPrompt'

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
  description: 'Plataforma completa de gerenciamento de produção audiovisual com AI',
  generator: 'Next.js 15',
  applicationName: 'GoNetwork AI',
  keywords: ['produção audiovisual', 'gestão de projetos', 'AI', 'PWA'],
  authors: [{ name: 'GoNetwork AI Team' }],
  creator: 'GoNetwork AI',
  publisher: 'GoNetwork AI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'GoNetwork AI',
    startupImage: [
      '/icon-192.png',
    ],
  },
  openGraph: {
    type: 'website',
    siteName: 'GoNetwork AI',
    title: 'GoNetwork AI - Plataforma de Produção Audiovisual',
    description: 'Plataforma completa de gerenciamento de produção audiovisual com AI',
    images: ['/icon-512.png'],
  },
  twitter: {
    card: 'summary',
    title: 'GoNetwork AI',
    description: 'Plataforma completa de gerenciamento de produção audiovisual com AI',
    images: ['/icon-512.png'],
  },
  icons: {
    icon: [
      { url: '/icon-72.png', sizes: '72x72', type: 'image/png' },
      { url: '/icon-96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icon-128.png', sizes: '128x128', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icon-152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
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
            <ElectronIntegration>
              <EventSyncProvider>
                {children}
                {/* Componente de notificações global */}
                <NotificationsProvider />
                {/* Prompt de instalação PWA */}
                <PWAInstallPrompt />
              </EventSyncProvider>
            </ElectronIntegration>
          </ThemeProvider>
        </ReactQueryProvider>
      </body>
    </html>
  )
}
