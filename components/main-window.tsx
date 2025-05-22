"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
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
} from "lucide-react"
import Image from "next/image"
import { useUIStore } from "@/store/useUIStore"
import { useMobile } from "@/hooks/use-mobile"
import DashboardWidget from "@/components/widgets/dashboard-widget"
import EventWidget from "@/components/widgets/event-widget"
import TeamWidget from "@/components/widgets/team-widget"
import BriefingWidget from "@/components/widgets/briefing-widget"
import TimelineWidget from "@/components/widgets/timeline-widget"
import EditingWidget from "@/components/widgets/editing-widget"
import DeliveryWidget from "@/components/widgets/delivery-widget"
import AssetsWidget from "@/components/widgets/assets-widget"
import SettingsWidget from "@/components/widgets/settings-widget"

interface MainWindowProps {
  currentUser: any
  onLogout: () => void
}

export default function MainWindow({ currentUser, onLogout }: MainWindowProps) {
  const [isMaximized, setIsMaximized] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isMobile = useMobile()
  
  // Usar o estado da página atual do useUIStore
  const currentPage = useUIStore((state) => state.currentPage)
  const setCurrentPage = useUIStore((state) => state.setCurrentPage)

  const pages = [
    { name: "Dashboard", icon: <Home className="h-5 w-5" />, component: <DashboardWidget /> },
    { name: "Eventos", icon: <Calendar className="h-5 w-5" />, component: <EventWidget /> },
    { name: "Equipe", icon: <Users className="h-5 w-5" />, component: <TeamWidget /> },
    { name: "Briefing", icon: <FileText className="h-5 w-5" />, component: <BriefingWidget /> },
    { name: "Timeline", icon: <Clock className="h-5 w-5" />, component: <TimelineWidget /> },
    { name: "Edição/Aprovação", icon: <Video className="h-5 w-5" />, component: <EditingWidget /> },
    { name: "Entregas", icon: <Truck className="h-5 w-5" />, component: <DeliveryWidget /> },
    { name: "Assets", icon: <FolderOpen className="h-5 w-5" />, component: <AssetsWidget /> },
    { name: "Configurações", icon: <Settings className="h-5 w-5" />, component: <SettingsWidget /> },
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
    <div className="fixed inset-0 flex flex-col border border-border rounded-lg overflow-hidden">
      {/* Window controls */}
      <div className="flex items-center justify-between p-2 bg-background border-b border-border">
        <div className="flex items-center gap-2">
          <Image src="/logo_gonetwork.png" alt="GoNetwork AI Logo" width={24} height={24} className="w-6 h-6 md:w-8 md:h-8" />
          <span className="text-primary font-bold text-sm md:text-base">GoNetwork AI</span>
        </div>
        <div className="flex items-center gap-2">
          {!isMobile && (
            <>
              <Button variant="ghost" size="icon" onClick={() => (window.innerWidth = 800)}>
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleMaximize}>
                {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </>
          )}
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="hover:bg-destructive hover:text-destructive-foreground">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - visível em desktop ou quando ativado em mobile */}
        <div 
          className={`${
            sidebarOpen || !isMobile ? "flex" : "hidden"
          } ${
            isMobile ? "absolute inset-0 z-50 bg-background/95 backdrop-blur-sm" : "w-52 border-r border-border"
          } flex-col`}
        >
          {isMobile && (
            <div className="flex justify-between items-center p-4 border-b border-border">
              <h2 className="text-xl font-bold text-primary">Menu</h2>
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          )}
          
          {!isMobile && (
            <>
              <div className="p-4 flex justify-center">
                <h2 className="text-xl font-bold text-primary">GoNetwork AI</h2>
              </div>
              <Separator />
            </>
          )}
          
          <div className="flex-1 py-4 space-y-1 px-2">
            {pages.map((page, index) => (
              <Button
                key={index}
                variant={currentPage === index ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => {
                  setCurrentPage(index);
                  if (isMobile) setSidebarOpen(false);
                }}
              >
                {page.icon}
                <span className="ml-2">{page.name}</span>
              </Button>
            ))}
          </div>
          <Separator />
          <div className="p-4">
            <Button variant="ghost" className="w-full justify-start" onClick={onLogout}>
              <LogOut className="h-5 w-5 mr-2" />
              Sair
            </Button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top bar */}
          <div className="h-12 border-b border-border flex items-center justify-between px-4">
            {isMobile && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="mr-2" 
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <div className="flex-1 flex items-center">
              <span className="text-sm md:text-base truncate">
                Olá, {currentUser?.full_name || "Usuário"}
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-xs md:text-sm text-muted-foreground">
                {pages[currentPage].name}
              </span>
            </div>
          </div>

          {/* Content area */}
          <div className="flex-1 overflow-auto p-2 md:p-4">{pages[currentPage].component}</div>
        </div>
      </div>
    </div>
  )
}
