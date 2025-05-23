import { useUIStore } from '@/store/useUIStore'

export const useToast = () => {
  const addNotification = useUIStore(state => state.addNotification)
  const removeNotification = useUIStore(state => state.removeNotification)

  const toast = {
    success: (message, options = {}) => {
      addNotification({
        type: 'success',
        message,
        ...options
      })
    },
    error: (message, options = {}) => {
      addNotification({
        type: 'error',
        message,
        ...options
      })
    },
    warning: (message, options = {}) => {
      addNotification({
        type: 'warning',
        message,
        ...options
      })
    },
    info: (message, options = {}) => {
      addNotification({
        type: 'info',
        message,
        ...options
      })
    },
    dismiss: (id) => {
      removeNotification(id)
    }
  }

  return { toast }
}
