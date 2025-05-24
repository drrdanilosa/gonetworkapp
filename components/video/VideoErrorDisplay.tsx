// components/video/VideoErrorDisplay.tsx
'use client'

'use client'

import React from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

interface VideoErrorDisplayProps {
  error: string
  title?: string
  retryAction?: () => void
}

export default function VideoErrorDisplay({
  error,
  title = 'Erro ao carregar o vídeo',
  retryAction,
}: VideoErrorDisplayProps) {
  return (
    <Alert variant="destructive" className="my-4">
      <AlertCircle className="size-5" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="mt-2">
        <p>{error}</p>
        {retryAction && (
          <Button
            variant="outline"
            size="sm"
            onClick={retryAction}
            className="mt-2"
          >
            <RefreshCw className="mr-2 size-4" />
            Tentar novamente
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}
