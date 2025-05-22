"use client";

import React from "react";

// Definição da estrutura de uma fase do projeto
interface Phase {
  name: string;
  plannedStart: Date;
  plannedEnd: Date;
  completed: boolean;
}

interface TimelineProps {
  phases: Phase[];
  finalDueDate?: Date;  // prazo final do projeto (opcional)
}

const Timeline: React.FC<TimelineProps> = ({ phases, finalDueDate }) => {
  if (!phases || phases.length === 0) return null;

  // Ordena as fases por data de início para garantir ordem cronológica
  const sortedPhases = [...phases].sort(
    (a, b) => a.plannedStart.getTime() - b.plannedStart.getTime()
  );
  const timelineStart = sortedPhases[0].plannedStart;
  const lastPhaseEnd = sortedPhases[sortedPhases.length - 1].plannedEnd;
  // Determina o fim da timeline (considera prazo final se for após a última fase)
  const timelineEnd =
    finalDueDate && finalDueDate > lastPhaseEnd ? finalDueDate : lastPhaseEnd;
  const totalDurationMs = timelineEnd.getTime() - timelineStart.getTime();

  // Calcula a largura proporcional de cada fase em relação ao tempo total
  const columns: string[] = sortedPhases.map((phase) => {
    let durationMs = phase.plannedEnd.getTime() - phase.plannedStart.getTime();
    if (durationMs <= 0) {
      // Fases instantâneas (mesmo dia) recebem um mínimo de duração visual
      durationMs = 12 * 60 * 60 * 1000; // 12h em ms (~0.5 dia)
    }
    const fraction = durationMs / totalDurationMs;
    const fractionStr = (fraction * 100).toFixed(2);
    return `${fractionStr}fr`;
  });
  const gridTemplate = columns.join(" ");

  // Define cor de fundo da fase conforme status e datas
  const getPhaseColorClass = (phase: Phase) => {
    if (phase.completed) return "bg-green-600";          // concluída: verde
    const now = new Date();
    if (phase.plannedEnd < now) return "bg-red-600";     // não concluída e já passou do fim: vermelho (atrasada)
    if (phase.plannedStart <= now && phase.plannedEnd >= now) {
      return "bg-yellow-500";                            // em andamento: amarelo
    }
    return "bg-blue-600";                                // futura/pendente: azul
  };

  // Calcula posição do marcador de prazo final (linha vertical) se houver prazo
  let finalDueMarkerStyle: React.CSSProperties | undefined;
  if (finalDueDate) {
    const startTime = timelineStart.getTime();
    const endTime = timelineEnd.getTime();
    const dueTime = finalDueDate.getTime();
    if (dueTime >= startTime && dueTime <= endTime) {
      const pct = ((dueTime - startTime) / (endTime - startTime)) * 100;
      finalDueMarkerStyle = { left: `${pct}%` };
    } else if (dueTime < startTime) {
      finalDueMarkerStyle = { left: "0%" };
    } else if (dueTime > endTime) {
      finalDueMarkerStyle = { left: "100%" };
    }
  }

  return (
    <div className="relative w-full p-4">
      {/* Barra de timeline usando CSS Grid */}
      <div
        className="grid items-center gap-1 w-full"
        style={{ gridTemplateColumns: gridTemplate }}
      >
        {sortedPhases.map((phase) => {
          const colorClass = getPhaseColorClass(phase);
          const phaseEndsAfterDue = finalDueDate && phase.plannedEnd > finalDueDate;
          return (
            <div key={phase.name} className={`${colorClass} relative h-8`}>
              {/* Nome da fase centralizado + indicadores */}
              <span className="text-xs text-center whitespace-nowrap">
                {phase.name}
                {phase.completed && " ✔"}
                {/* Indicador de atraso */}
                {!phase.completed && phase.plannedEnd < new Date() && (
                  <span className="ml-1 text-red-200">(atrasado)</span>
                )}
                {/* Indicador de extrapolação do prazo */}
                {phaseEndsAfterDue && (
                  <span className="ml-1 text-yellow-200">(!)</span>
                )}
              </span>
            </div>
          );
        })}
      </div>
      {/* Marcador vertical do Prazo Final */}
      {finalDueMarkerStyle && (
        <div
          className="absolute top-0 bottom-0 border-l-2 border-yellow-400 opacity-70"
          style={finalDueMarkerStyle}
          title="Prazo final"
        />
      )}
      {/* (Opcional) Poderíamos adicionar um marcador "hoje" aqui para referência */}
    </div>
  );
};

export default Timeline;
