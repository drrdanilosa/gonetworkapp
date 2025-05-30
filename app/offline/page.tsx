'use client'

import React from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

export default function OfflinePage() {
  const handleRetry = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div className="mb-6">
          <div className="relative mx-auto w-24 h-24 mb-4">
            <div className="absolute inset-0 bg-red-100 rounded-full animate-pulse"></div>
            <div className="relative z-10 w-24 h-24 bg-red-500 rounded-full flex items-center justify-center">
              <WifiOff className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-3">
          Você está offline
        </h1>
        
        <p className="text-gray-600 mb-6 leading-relaxed">
          Parece que você perdeu a conexão com a internet. Verifique sua conexão e tente novamente.
        </p>

        <div className="space-y-4">
          <button
            onClick={handleRetry}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Tentar novamente
          </button>

          <div className="text-sm text-gray-500">
            <p>Dicas para reconectar:</p>
            <ul className="mt-2 space-y-1 text-left">
              <li>• Verifique sua conexão Wi-Fi</li>
              <li>• Teste sua conexão móvel</li>
              <li>• Reinicie seu roteador se necessário</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Wifi className="w-4 h-4" />
            <span>GoNetworkApp PWA</span>
          </div>
        </div>
      </div>
    </div>
  );
}
