const fs = require('fs');
const path = require('path');

console.log('🔧 Adicionando timeline de teste...\n');

// Ler eventos existentes
const eventsPath = path.join(__dirname, 'data', 'events.json');
const events = JSON.parse(fs.readFileSync(eventsPath, 'utf8'));

// Pegar o último evento criado
const lastEvent = events[events.length - 1];
console.log(`📝 Adicionando timeline ao evento: ${lastEvent.id} - ${lastEvent.title}`);

// Criar uma timeline de exemplo
const sampleTimeline = [
  {
    id: 'phase-1',
    name: 'Pré-produção',
    start: '2025-05-26T00:00:00.000Z',
    end: '2025-06-02T00:00:00.000Z',
    completed: true,
    duration: 7
  },
  {
    id: 'phase-2',
    name: 'Produção',
    start: '2025-06-02T00:00:00.000Z',
    end: '2025-06-16T00:00:00.000Z',
    completed: false,
    duration: 14
  },
  {
    id: 'phase-3',
    name: 'Pós-produção',
    start: '2025-06-16T00:00:00.000Z',
    end: '2025-06-30T00:00:00.000Z',
    completed: false,
    duration: 14
  },
  {
    id: 'phase-4',
    name: 'Finalização',
    start: '2025-06-30T00:00:00.000Z',
    end: '2025-07-07T00:00:00.000Z',
    completed: false,
    duration: 7
  }
];

// Adicionar timeline ao último evento
lastEvent.timeline = sampleTimeline;

// Salvar de volta
fs.writeFileSync(eventsPath, JSON.stringify(events, null, 2), 'utf8');

console.log('✅ Timeline adicionada com sucesso!');
console.log(`📊 Fases criadas: ${sampleTimeline.length}`);
console.log('📋 Fases:');
sampleTimeline.forEach((phase, index) => {
  console.log(`  ${index + 1}. ${phase.name} (${phase.duration} dias) - ${phase.completed ? 'Concluída' : 'Pendente'}`);
});

console.log(`\n🌐 Acesse: http://localhost:3000/events/${lastEvent.id}/timeline`);
console.log(`🌐 Ou vá para: http://localhost:3000/events/${lastEvent.id} e clique em Timeline`);
