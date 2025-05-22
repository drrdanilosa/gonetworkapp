"use client";

import dynamic from "next/dynamic";

const NotificationToast = dynamic(
  () => import("@/components/widgets/NotificationToast"),
  { ssr: false }
);

export function NotificationToastProvider() {
  return <NotificationToast />;
}
