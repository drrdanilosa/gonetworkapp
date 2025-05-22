import type React from "react"
import { Inter, Fira_Code } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ReactQueryProvider } from "@/components/providers/query-provider"
import { NotificationsProvider } from "@/components/providers/notifications-provider"

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter'
})

const firaCode = Fira_Code({ 
  subsets: ["latin"],
  variable: '--font-fira-code' 
})

export const metadata = {
  title: "GoNetwork AI",
  description: "Plataforma de gerenciamento de produção audiovisual",
  generator: 'v0.dev'
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {  return (
    <html lang="pt-BR" suppressHydrationWarning className={`${inter.variable} ${firaCode.variable}`}>
      <body className={`antialiased bg-background font-sans`}>
        <ReactQueryProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={true} disableTransitionOnChange>
            {children}
            {/* Componente de notificações global */}
            <NotificationsProvider />
          </ThemeProvider>
        </ReactQueryProvider>
      </body>
    </html>
  )
}
