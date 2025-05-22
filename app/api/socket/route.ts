import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Esta é apenas uma API de exemplo para demonstrar como criar um proxy para Socket.io
  // Em um cenário real, você precisaria implementar adequadamente o protocolo Socket.io aqui
  
  return NextResponse.json({ 
    status: "ok", 
    message: "Este endpoint é apenas um exemplo. Para implementar um proxy Socket.io real, você precisaria de uma biblioteca compatível com Edge Runtime ou usar uma abordagem diferente." 
  });
}
