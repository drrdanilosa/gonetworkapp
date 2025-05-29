import React, { useState } from 'react'
import { EventWidgetProps, Event, Video, VideoStatusUpdate } from '@/types'

const EventWidgetTyped: React.FC<EventWidgetProps> = ({
  event,
  videos = [],
  onEventUpdate,
  onVideoStatusChange,
  readonly = false,
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editedEvent, setEditedEvent] = useState<Event>(event)

  const handleEventSave = async () => {
    if (onEventUpdate) {
      await onEventUpdate(editedEvent)
      setIsEditing(false)
    }
  }

  const handleVideoStatusUpdate = async (
    videoId: string,
    statusUpdate: VideoStatusUpdate
  ) => {
    if (onVideoStatusChange) {
      await onVideoStatusChange(videoId, statusUpdate)
    }
  }

  const handleStatusChange = (videoId: string, newStatus: Video['status']) => {
    const statusUpdate: VideoStatusUpdate = {
      status: newStatus,
      comment: `Status alterado para ${newStatus}`,
      reviewer: 'Current User', // Substituir pelo usuário atual
    }
    handleVideoStatusUpdate(videoId, statusUpdate)
  }

  return (
    <div className="event-widget bg-white rounded-lg shadow-md p-6">
      <div className="event-header mb-4">
        {isEditing ? (
          <div className="space-y-3">
            <input
              type="text"
              value={editedEvent.title}
              onChange={e =>
                setEditedEvent({ ...editedEvent, title: e.target.value })
              }
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              value={editedEvent.client}
              onChange={e =>
                setEditedEvent({ ...editedEvent, client: e.target.value })
              }
              className="w-full p-2 border rounded"
            />
            <select
              value={editedEvent.status}
              onChange={e =>
                setEditedEvent({
                  ...editedEvent,
                  status: e.target.value as Event['status'],
                })
              }
              className="w-full p-2 border rounded"
            >
              <option value="pendente">Pendente</option>
              <option value="em-andamento">Em Andamento</option>
              <option value="concluido">Concluído</option>
              <option value="cancelado">Cancelado</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={handleEventSave}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Salvar
              </button>
              <button
                onClick={() => {
                  setIsEditing(false)
                  setEditedEvent(event)
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold">{event.title}</h2>
                <p className="text-gray-600">Cliente: {event.client}</p>
                <p className="text-sm text-gray-500">
                  Data: {new Date(event.date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm ${getStatusColor(event.status)}`}
                >
                  {event.status}
                </span>
                {!readonly && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Editar
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {videos.length > 0 && (
        <div className="videos-section">
          <h3 className="text-lg font-semibold mb-3">
            Vídeos ({videos.length})
          </h3>
          <div className="space-y-2">
            {videos.map(video => (
              <div key={video.id} className="video-item p-3 border rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{video.fileName}</p>
                    <p className="text-sm text-gray-500">
                      Criado em:{' '}
                      {new Date(video.createdAt).toLocaleDateString()}
                    </p>
                    {video.fileSize && (
                      <p className="text-sm text-gray-500">
                        Tamanho: {formatFileSize(video.fileSize)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${getStatusColor(video.status)}`}
                    >
                      {video.status}
                    </span>
                    {!readonly && (
                      <select
                        value={video.status}
                        onChange={e =>
                          handleStatusChange(
                            video.id,
                            e.target.value as Video['status']
                          )
                        }
                        className="text-sm border rounded px-2 py-1"
                      >
                        <option value="pendente">Pendente</option>
                        <option value="em-revisao">Em Revisão</option>
                        <option value="revisado">Revisado</option>
                        <option value="aprovado">Aprovado</option>
                        <option value="rejeitado">Rejeitado</option>
                      </select>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'pendente':
      return 'bg-yellow-100 text-yellow-800'
    case 'em-andamento':
    case 'em-revisao':
      return 'bg-blue-100 text-blue-800'
    case 'concluido':
    case 'aprovado':
      return 'bg-green-100 text-green-800'
    case 'cancelado':
    case 'rejeitado':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export default EventWidgetTyped
