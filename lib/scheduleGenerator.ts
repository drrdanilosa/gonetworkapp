// lib/scheduleGenerator.ts
import { addDays, subDays } from "date-fns";

interface Phase {
  name: string;
  plannedStart: Date;
  plannedEnd: Date;
  completed: boolean;
}

/**
 * Gera um cronograma de fases do projeto com base nos dados fornecidos.
 * @param projectName   Nome do projeto (pode influenciar planejamento ou identificação, opcionalmente)
 * @param numVideos     Quantidade de vídeos a serem produzidos no projeto
 * @param eventDate     Data do evento (caso haja gravação ao vivo; pode ser undefined se não se aplica)
 * @param finalDueDate  Data limite final para entrega do projeto (pode ser undefined se não definida)
 * @returns Array de fases planejadas (Phase[])
 */
export function generateScheduleFromBriefing(
  projectName: string,
  numVideos: number,
  eventDate?: Date,
  finalDueDate?: Date
): Phase[] {
  const now = new Date();
  const phases: Phase[] = [];

  // 1. Planejamento
  let planningEnd: Date;
  if (eventDate) {
    // Se há data de evento, planejamento vai até 1 dia antes do evento ou no máximo 7 dias a partir de hoje (o que vier primeiro)
    const oneDayBeforeEvent = subDays(eventDate, 1);
    const maxPlanning = addDays(now, 7);
    planningEnd = oneDayBeforeEvent < maxPlanning ? oneDayBeforeEvent : maxPlanning;
  } else {
    // Sem evento fixo: define ~3 dias de planejamento a partir de hoje
    planningEnd = addDays(now, 3);
  }
  phases.push({
    name: "Planejamento",
    plannedStart: now,
    plannedEnd: planningEnd,
    completed: false,
  });

  // 2. Gravação (só se houver evento ao vivo)
  let lastEnd = planningEnd;
  if (eventDate) {
    const eventStart = eventDate;
    const eventEnd = eventDate; // assumindo evento de um dia para simplicidade
    phases.push({
      name: "Gravação",
      plannedStart: eventStart,
      plannedEnd: eventEnd,
      completed: false,
    });
    lastEnd = eventEnd;
  }

  // 3. Edição
  const editStart = addDays(lastEnd, 1);
  const daysPerVideo = 3; // suposição: 3 dias de edição por vídeo
  let editDurationDays = numVideos * daysPerVideo;
  let editEnd = addDays(editStart, editDurationDays);

  // 4. Revisão
  const reviewStart = addDays(editEnd, 1);
  const reviewDurationDays = 3; // 3 dias para revisão pelo cliente
  let reviewEnd = addDays(reviewStart, reviewDurationDays);

  // 5. Aprovação
  const approvalStart = addDays(reviewEnd, 1);
  const approvalDurationDays = 1; // 1 dia para aprovação final
  let approvalEnd = addDays(approvalStart, approvalDurationDays);

  // Ajuste baseado no prazo final, se fornecido
  if (finalDueDate) {
    const finalDueTime = finalDueDate.getTime();
    const plannedFinalTime = approvalEnd.getTime();
    if (plannedFinalTime > finalDueTime) {
      console.warn("Cronograma inicial ultrapassa o prazo final. Ajustando fases...");
      // Calcula quantos dias além do prazo estamos
      const overrunDays = Math.ceil((plannedFinalTime - finalDueTime) / (1000 * 60 * 60 * 24));
      let remainingOverrun = overrunDays;
      // Tenta reduzir dias da Revisão primeiro, depois Edição, para caber no prazo
      if (remainingOverrun > 0) {
        const newReviewDuration = Math.max(reviewDurationDays - remainingOverrun, 1);
        remainingOverrun -= (reviewDurationDays - newReviewDuration);
        reviewEnd = addDays(reviewStart, newReviewDuration);
      }
      if (remainingOverrun > 0) {
        const minEditDays = Math.ceil(numVideos * 1.5); // pelo menos ~1.5 dias por vídeo
        const newEditDuration = Math.max(editDurationDays - remainingOverrun, minEditDays);
        editDurationDays = newEditDuration;
        editEnd = addDays(editStart, newEditDuration);
      }
      // Recalcula inícios/fins subsequentes após compressão
      if (reviewEnd < editEnd) {
        // garante que revisão não comece antes do fim da edição
        reviewEnd = addDays(editEnd, 1);
      }
      // Recalcula aprovação após eventual ajuste
      approvalEnd = addDays(reviewEnd, approvalDurationDays);
    }
  }

  // Adiciona as fases de Edição, Revisão e Aprovação com os valores (ajustados ou originais)
  phases.push({
    name: "Edição",
    plannedStart: editStart,
    plannedEnd: editEnd,
    completed: false,
  });
  phases.push({
    name: "Revisão",
    plannedStart: reviewStart,
    plannedEnd: reviewEnd,
    completed: false,
  });
  phases.push({
    name: "Aprovação",
    plannedStart: addDays(reviewEnd, 1), // começa logo após fim da revisão
    plannedEnd: approvalEnd,
    completed: false,
  });

  // (Opcional) Poderíamos adicionar um marco final de "Entrega Final" igual à approvalEnd
  return phases;
}
