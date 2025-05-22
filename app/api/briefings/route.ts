import { NextRequest, NextResponse } from 'next/server';

// Simulação de dados - em um ambiente real, isso estaria em um banco de dados
let briefingData: Record<string, any> = {};

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { eventId } = data;
    
    if (!eventId) {
      return NextResponse.json(
        { error: 'ID do evento é obrigatório' },
        { status: 400 }
      );
    }
    
    // Armazenar dados - em um ambiente real, isso seria salvo no banco de dados
    briefingData[eventId] = data;
    
    return NextResponse.json(
      { success: true, message: 'Briefing salvo com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao processar requisição:', error);
    return NextResponse.json(
      { error: 'Erro ao processar requisição' },
      { status: 500 }
    );
  }
}
