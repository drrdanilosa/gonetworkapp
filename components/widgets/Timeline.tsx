'use client'

import React from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Definição da estrutura de uma fase do projeto
interface Phase {
  id: string
  name: string
  plannedStart: Date
  plannedEnd: Date
  completed: boolean
  duration?: number // percentual da duração total (para compatibilidade com store)
}

interface TimelineProps {
  phases: Phase[]
  finalDueDate?: Date // prazo final do projeto (opcional)
  projectName?: string
  showDetails?: boolean // se deve mostrar detalhes extras
}

const Timeline: React.FC<TimelineProps> = ({
  phases,
  finalDueDate,
  projectName,
  showDetails = true,
}) => {
  if (!phases || phases.length === 0) {
    return (
      <div className="w-full rounded-md border p-4 text-center text-muted-foreground">
        Nenhuma fase definida para este projeto
      </div>
    )
  }

  // Ordena as fases por data de início para garantir ordem cronológica
  const sortedPhases = [...phases].sort(
    (a, b) => a.plannedStart.getTime() - b.plannedStart.getTime()
  )

  const timelineStart = sortedPhases[0].plannedStart
  const lastPhaseEnd = sortedPhases[sortedPhases.length - 1].plannedEnd

  // Determina o fim da timeline (considera prazo final se for após a última fase)
  const timelineEnd =
    finalDueDate && finalDueDate > lastPhaseEnd ? finalDueDate : lastPhaseEnd
  const totalDurationMs = timelineEnd.getTime() - timelineStart.getTime()

  // Calcula a largura proporcional de cada fase em relação ao tempo total
  const columns: string[] = sortedPhases.map(phase => {
    let durationMs = phase.plannedEnd.getTime() - phase.plannedStart.getTime()
    if (durationMs <= 0) {
      // Fases instantâneas (mesmo dia) recebem um mínimo de duração visual
      durationMs = 12 * 60 * 60 * 1000 // 12h em ms (~0.5 dia)
    }

    // Se a fase tem duration definida (do store), usar essa proporção
    if (phase.duration) {
      return `${phase.duration}fr`
    }

    const fraction = durationMs / totalDurationMs
    const fractionStr = (fraction * 100).toFixed(2)
    return `${fractionStr}fr`
  })

  const gridTemplate = columns.join(' ')

  // Define cor de fundo da fase conforme status e datas
  const getPhaseColorClass = (phase: Phase) => {
    if (phase.completed) return 'bg-green-600 text-white' // concluída: verde

    const now = new Date()
    if (phase.plannedEnd < now) return 'bg-red-600 text-white' // atrasada: vermelho
    if (phase.plannedStart <= now && phase.plannedEnd >= now) {
      return 'bg-yellow-500 text-black' // em andamento: amarelo
    }
    return 'bg-blue-600 text-white' // futura/pendente: azul
  }

  // Calcula posição do marcador de prazo final (linha vertical) se houver prazo
  let finalDueMarkerStyle: React.CSSProperties | undefined
  if (finalDueDate) {
    const startTime = timelineStart.getTime()
    const endTime = timelineEnd.getTime()
    const dueTime = finalDueDate.getTime()

    if (dueTime >= startTime && dueTime <= endTime) {
      const pct = ((dueTime - startTime) / (endTime - startTime)) * 100
      finalDueMarkerStyle = { left: `${pct}%` }
    } else if (dueTime < startTime) {
      finalDueMarkerStyle = { left: '0%' }
    } else if (dueTime > endTime) {
      finalDueMarkerStyle = { left: '100%' }
    }
  }

  return (
    <div className="w-full space-y-4">
      {/* Cabeçalho do projeto */}
      {projectName && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{projectName}</h3>
          <div className="text-sm text-muted-foreground">
            {format(timelineStart, 'dd MMM', { locale: ptBR })} -{' '}
            {format(timelineEnd, 'dd MMM yyyy', { locale: ptBR })}
          </div>
        </div>
      )}

      {/* Container principal da timeline */}
      <div className="relative w-full rounded-md border p-4">
        {/* Barra de timeline usando CSS Grid */}
        <div
          className="grid w-full items-center gap-1"
          style={{ gridTemplateColumns: gridTemplate }}
        >
          {sortedPhases.map(phase => {
            const colorClass = getPhaseColorClass(phase)
            const phaseEndsAfterDue =
              finalDueDate && phase.plannedEnd > finalDueDate

            return (
              <div
                key={phase.id || phase.name}
                className={`${colorClass} relative flex h-12 items-center justify-center rounded-md px-2`}
                title={`${phase.name} - ${format(phase.plannedStart, 'dd/MM')} até ${format(phase.plannedEnd, 'dd/MM')}`}
              >
                {/* Nome da fase centralizado + indicadores */}
                <span className="overflow-hidden whitespace-nowrap text-center text-xs">
                  {phase.name}
                  {phase.completed && ' ✔'}
                  {/* Indicador de atraso */}
                  {!phase.completed && phase.plannedEnd < new Date() && (
                    <span className="ml-1">(atrasado)</span>
                  )}
                  {/* Indicador de extrapolação do prazo */}
                  {phaseEndsAfterDue && <span className="ml-1">(!)</span>}
                </span>
              </div>
            )
          })}
        </div>

        {/* Marcador vertical do Prazo Final */}
        {finalDueMarkerStyle && (
          <div
            className="absolute inset-y-0 z-10 border-l-2 border-yellow-400 opacity-70"
            style={finalDueMarkerStyle}
            title={`Prazo final: ${format(finalDueDate!, 'dd/MM/yyyy')}`}
          />
        )}

        {/* Marcador "hoje" para referência */}
        {(() => {
          const now = new Date()
          const startTime = timelineStart.getTime()
          const endTime = timelineEnd.getTime()
          const nowTime = now.getTime()

          if (nowTime >= startTime && nowTime <= endTime) {
            const pct = ((nowTime - startTime) / (endTime - startTime)) * 100
            return (
              <div
                className="absolute inset-y-0 z-10 border-l-2 border-red-500 opacity-50"
                style={{ left: `${pct}%` }}
                title={`Hoje: ${format(now, 'dd/MM/yyyy')}`}
              />
            )
          }
          return null
        })()}
      </div>

      {/* Detalhes das fases (opcional) */}
      {showDetails && (
        <div className="space-y-2">
          {sortedPhases.map(phase => (
            <div
              key={phase.id || phase.name}
              className="flex items-center justify-between border-b pb-1 text-sm"
            >
              <div className="flex items-center gap-2">
                <div
                  className={`size-3 rounded-full ${getPhaseColorClass(phase).split(' ')[0]}`}
                ></div>
                <span className="font-medium">{phase.name}</span>
              </div>
              <div className="text-muted-foreground">
                {format(phase.plannedStart, 'dd/MM')} -{' '}
                {format(phase.plannedEnd, 'dd/MM')}
                {phase.completed && (
                  <span className="ml-2 text-green-600">✓</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Legenda */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="size-3 rounded-full bg-green-600"></div>
          <span>Concluído</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="size-3 rounded-full bg-yellow-500"></div>
          <span>Em Andamento</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="size-3 rounded-full bg-blue-600"></div>
          <span>Pendente</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="size-3 rounded-full bg-red-600"></div>
          <span>Atrasado</span>
        </div>
        {finalDueDate && (
          <div className="flex items-center gap-1">
            <div className="h-1 w-3 bg-yellow-400"></div>
            <span>Prazo Final</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default Timeline
