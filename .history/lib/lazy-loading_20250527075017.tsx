import React, {
  lazy,
  ComponentType,
  LazyExoticComponent,
  Suspense,
} from 'react'

/**
 * Lazy loading otimizado para componentes pesados
 * Inclui preloading e error boundaries
 */

// Componentes principais lazy loaded
export const LazyVideoPlayer = lazy(
  () => import('@/components/video/VideoPlayer')
)

export const LazyVideoUploader = lazy(
  () => import('@/components/video/VideoUploader')
)

export const LazyEditingWidget = lazy(
  () => import('@/components/widgets/editing-widget')
)

export const LazyTimelineWidget = lazy(
  () => import('@/components/timeline/TimelineWidget')
)

export const LazyBriefingWidget = lazy(
  () => import('@/features/briefing/components/BriefingWidget')
)

export const LazyAssetsPanel = lazy(
  () => import('@/components/widgets/AssetsPanel')
)

// Utilitário para preload de componentes
export function preloadComponent(
  componentImport: () => Promise<unknown>
): void {
  // Preload component in background
  componentImport()
}

// Hook para preload condicional
export function usePreloadComponents() {
  const preloadVideoComponents = () => {
    preloadComponent(() => import('@/components/video/VideoPlayer'))
    preloadComponent(() => import('@/components/video/VideoUploader'))
  }

  const preloadEditingComponents = () => {
    preloadComponent(() => import('@/components/widgets/editing-widget'))
    preloadComponent(() => import('@/components/widgets/AssetsPanel'))
  }

  const preloadBriefingComponents = () => {
    preloadComponent(
      () => import('@/features/briefing/components/BriefingWidget')
    )
    preloadComponent(() => import('@/components/timeline/TimelineWidget'))
  }

  return {
    preloadVideoComponents,
    preloadEditingComponents,
    preloadBriefingComponents,
  }
}

// Wrapper para lazy components com loading fallback
export function withLazyLoading<P extends object>(
  LazyComponent: LazyExoticComponent<ComponentType<P>>,
  fallback?: React.ReactNode
) {
  return function WrappedComponent(props: P) {
    return (
      <Suspense fallback={fallback || <ComponentLoadingFallback />}>
        <LazyComponent {...props} />
      </Suspense>
    )
  }
}

// Componente de loading padrão
function ComponentLoadingFallback() {
  return (
    <div className="flex items-center justify-center h-32 bg-muted/50 rounded-lg">
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4 bg-primary rounded-full animate-pulse"></div>
        <div className="w-4 h-4 bg-primary/60 rounded-full animate-pulse delay-150"></div>
        <div className="w-4 h-4 bg-primary/30 rounded-full animate-pulse delay-300"></div>
      </div>
    </div>
  )
}
