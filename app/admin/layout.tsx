// app/admin/layout.tsx
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Administração | MelhorApp",
  description: "Área administrativa do sistema",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 p-4">
        <div className="text-lg font-bold mb-6">Admin MelhorApp</div>
        <nav className="space-y-1">
          <Link 
            href="/admin" 
            className="block px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Dashboard
          </Link>
          <Link 
            href="/admin/diagnosticos" 
            className="block px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Diagnósticos
          </Link>
          <Link 
            href="/" 
            className="block px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Voltar ao App
          </Link>
        </nav>
      </div>
      <div className="flex-1">
        <main className="p-4">
          {children}
        </main>
      </div>
    </div>
  );
}
