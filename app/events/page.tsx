"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Event = {
  id: string;
  name: string;
  date: string;
  status: string;
  client: string;
  type: string;
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  useEffect(() => {
    // Para fins de demonstração, usamos dados simulados
    // Em um ambiente real, isso viria de uma chamada de API
    const mockEvents = [
      {
        id: "123",
        name: "Congresso de Tecnologia 2025",
        date: "2025-05-30",
        status: "confirmado",
        client: "Empresa ABC",
        type: "conferência"
      },
      {
        id: "456",
        name: "Workshop de Marketing Digital",
        date: "2025-06-15",
        status: "planejamento",
        client: "Agência XYZ",
        type: "workshop"
      },
      {
        id: "789",
        name: "Lançamento de Produto Q3",
        date: "2025-07-10",
        status: "confirmado",
        client: "Tech Solutions",
        type: "evento corporativo"
      }
    ];
    
    setTimeout(() => {
      setEvents(mockEvents);
      setIsLoading(false);
    }, 1000); // Simula um delay de carregamento
  }, []);
  
  // Filtra eventos com base no termo de pesquisa
  const filteredEvents = events.filter(event => 
    event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.type.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-[#282A36] text-[#F8F8F2]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8BE9FD] mx-auto"></div>
          <p className="mt-4 text-lg">Carregando eventos...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full min-h-screen bg-[#282A36] text-[#F8F8F2] p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#8BE9FD]">Eventos</h1>
        <p className="text-lg text-[#6272A4]">
          Gerencie todos os seus eventos em um só lugar
        </p>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <div className="w-full max-w-md">
          <Input
            placeholder="Buscar eventos..."
            className="bg-[#21222C] text-[#F8F8F2] border border-[#44475A]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />        </div>
        <Link href="/events/new">
          <Button className="bg-[#50FA7B] hover:bg-[#43D669] text-[#282A36]">
            Novo Evento
          </Button>
        </Link>
      </div>
      
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-[#6272A4]">
            {searchTerm ? "Nenhum evento encontrado com esse termo" : "Nenhum evento disponível"}
          </p>
          {searchTerm && (
            <Button 
              variant="ghost" 
              className="mt-4 text-[#BD93F9]"
              onClick={() => setSearchTerm("")}
            >
              Limpar filtro
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Link href={`/events/${event.id}`} key={event.id} className="block">
              <Card className="bg-[#21222C] border-[#44475A] text-[#F8F8F2] hover:border-[#BD93F9] transition-all duration-200 h-full">
                <CardHeader>
                  <CardTitle className="text-[#F8F8F2]">{event.name}</CardTitle>
                  <CardDescription className="text-[#6272A4]">{event.client}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-sm text-[#6272A4]">
                      Data: <span className="text-[#F8F8F2]">{new Date(event.date).toLocaleDateString('pt-BR')}</span>
                    </p>
                    <div className={`px-2 py-1 rounded-md text-xs ${
                      event.status === "confirmado" 
                        ? "bg-green-900 text-green-100" 
                        : "bg-yellow-900 text-yellow-100"
                    }`}>
                      {event.status}
                    </div>
                  </div>
                  <p className="text-sm text-[#6272A4]">
                    Tipo: <span className="text-[#F8F8F2] capitalize">{event.type}</span>
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" className="w-full text-[#BD93F9] border border-[#BD93F9]">
                    Ver Detalhes
                  </Button>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
