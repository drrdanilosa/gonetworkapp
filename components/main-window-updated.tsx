'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Calendar,
  FolderOpen,
  Home,
  LogOut,
  Maximize2,
  Minimize2,
  Settings,
  Users,
  Video,
  X,
  FileText,
  Clock,
  Truck,
  Menu,
  Megaphone, // Novo ícone para Captação
} from 'lucide-react'
import Image from 'next/image'
import { useUIStore } from '@/store/useUIStore'
import { useMobile } from '@/hooks/use-mobile'
import DashboardWidget from '@/components/widgets/dashboard-widget'
import EventWidget from '@/components/widgets/event-widget'
import TeamWidget from '@/components/widgets/team-widget'
import BriefingWidget from '@/components/widgets/briefing-widget'
import TimelineWidget from '@/components/widgets/timeline-widget'
import { EditingWidget } from '@/components/widgets/editing-widget'
import DeliveryWidget from '@/components/widgets/delivery-widget'
import AssetsWidget from '@/components/widgets/assets-widget'
import SettingsWidget from '@/components/widgets/settings-widget'
import CaptacaoWidget from '@/components/widgets/CaptacaoWidget' // Nova importação

interface MainWindowProps {
  currentUser?: {
    id: string
    name: string
    email: string
    role: string
  }
  onLogout: () => void
  children?: React.ReactNode
}

export default function MainWindow({
  currentUser,
  onLogout,
  children,
}: MainWindowProps) {
  const [isMaximized, setIsMaximized] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isMobile = useMobile()

  // Usar o estado da página atual do useUIStore
  const currentPage = useUIStore(state => state.currentPage)
  const setCurrentPage = useUIStore(state => state.setCurrentPage)

  const pages = [
    {
      name: 'Dashboard',
      icon: <Home className="size-5" />,
      component: <DashboardWidget />,
    },
    {
      name: 'Eventos',
      icon: <Calendar className="size-5" />,
      component: <EventWidget />,
    },
    {
      name: 'Equipe',
      icon: <Users className="size-5" />,
      component: <TeamWidget />,
    },
    {
      name: 'Briefing',
      icon: <FileText className="size-5" />,
      component: <BriefingWidget />,
    },
    {
      name: 'Timeline',
      icon: <Clock className="size-5" />,
      component: <TimelineWidget />,
    },
    {
      name: 'Edição/Aprovação',
      icon: <Video className="size-5" />,
      component: <EditingWidget />,
    },
    {
      name: 'Entregas',
      icon: <Truck className="size-5" />,
      component: <DeliveryWidget />,
    },
    {
      name: 'Assets',
      icon: <FolderOpen className="size-5" />,
      component: <AssetsWidget />,
    },
    // NOVA ABA ADICIONADA
    {
      name: 'Captação',
      icon: <Megaphone className="size-5" />,
      component: <CaptacaoWidget />,
    },
    {
      name: 'Configurações',
      icon: <Settings className="size-5" />,
      component: <SettingsWidget />,
    },
  ]

  const toggleMaximize = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
      setIsMaximized(false)
    } else {
      document.documentElement.requestFullscreen()
      setIsMaximized(true)
    }
  }

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden rounded-lg border border-border">
      {/* Window controls */}
      <div className="flex items-center justify-between border-b border-border bg-background p-2">
        <div className="flex items-center gap-2">
          <Image
            src="/gonetworklogo.png"
            alt="GoNetwork"
            width={32}
            height={32}
            className="rounded"
          />
          <span className="text-sm font-medium">MelhorApp v2</span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMaximize}
            className="text-muted-foreground hover:text-foreground"
          >
            {isMaximized ? (
              <Minimize2 className="size-4" />
            ) : (
              <Maximize2 className="size-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`${
            isMobile
              ? `fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-background transition-transform${
                  sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`
              : 'w-64 border-r border-border bg-background'
          }`}
        >
          <div className="flex h-full flex-col">
            {/* User info */}
            <div className="border-b border-border p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                  {currentUser?.name?.charAt(0) || 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {currentUser?.name || 'Usuário'}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {currentUser?.role || 'Editor'}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {pages.map((page, index) => (
                  <Button
                    key={index}
                    variant={currentPage === index ? 'default' : 'ghost'}
                    className="w-full justify-start gap-3"
                    onClick={() => {
                      setCurrentPage(index)
                      if (isMobile) setSidebarOpen(false)
                    }}
                  >
                    {page.icon}
                    <span>{page.name}</span>
                  </Button>
                ))}
              </div>
            </nav>

            <Separator />

            {/* Logout */}
            <div className="p-4">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
                onClick={onLogout}
              >
                <LogOut className="size-5" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </aside>

        {/* Mobile overlay */}
        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {/* Mobile header */}
          {isMobile && (
            <div className="flex items-center justify-between border-b border-border bg-background p-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="size-5" />
              </Button>
              <h1 className="text-lg font-semibold">
                {pages[currentPage]?.name || 'Dashboard'}
              </h1>
              <div className="w-10" /> {/* Spacer */}
            </div>
          )}

          {/* Page content */}
          <div className="flex-1 overflow-auto p-6">
            {pages[currentPage]?.component || <DashboardWidget />}
          </div>
        </main>
      </div>
    </div>
  )
}
