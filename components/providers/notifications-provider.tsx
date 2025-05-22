"use client";

import dynamic from "next/dynamic";

// Carrega o componente NotificationToast com carregamento dinâmico no lado do cliente
const NotificationToast = dynamic(() => import("@/components/widgets/NotificationToast"), { 
  ssr: false 
});

export function NotificationsProvider() {
  return <NotificationToast />;
}
