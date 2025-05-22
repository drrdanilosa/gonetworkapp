import * as React from "react"
import { useUIStore } from "@/store/useUIStore"

export const MOBILE_BREAKPOINT = 768
export const TABLET_BREAKPOINT = 1024
export const DESKTOP_BREAKPOINT = 1280

export type DeviceType = 'mobile' | 'tablet' | 'desktop'

export function useDevice() {
  const setIsMobile = useUIStore((state) => state.setIsMobile)
  const [device, setDevice] = React.useState<DeviceType | undefined>(undefined)
  
  // Usando ref para evitar múltiplas chamadas em renderizações seguidas
  const initialSetupDone = React.useRef(false)
  
  React.useEffect(() => {
    // Garantir que só executamos a configuração inicial uma vez
    if (!initialSetupDone.current) {
      const handleResize = () => {
        const windowWidth = window.innerWidth
        
        // Determinar tipo de dispositivo
        let newDevice: DeviceType = 'desktop'
        if (windowWidth < MOBILE_BREAKPOINT) {
          newDevice = 'mobile'
        } else if (windowWidth < TABLET_BREAKPOINT) {
          newDevice = 'tablet'
        }
        
        // Atualizar state local e global
        setDevice(newDevice)
        setIsMobile(newDevice === 'mobile')
      }
      
      window.addEventListener('resize', handleResize)
      // Chamada inicial
      handleResize()
      initialSetupDone.current = true
      
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])

  return {
    device,
    isMobile: device === 'mobile',
    isTablet: device === 'tablet',
    isDesktop: device === 'desktop'
  }
}

// Mantendo o hook antigo para compatibilidade
export function useIsMobile() {
  const { isMobile } = useDevice()
  return isMobile
}

// Adicionando nova função useMobile para ser completamente compatível
export function useMobile() {
  const { isMobile } = useDevice()
  return isMobile
}
